import { CV, CVStatus, CVExtractedData, LLMConfiguration } from '../models/index.js';
import { CVExtractionResponse, CVExtractionResult } from '../types/index.js';
import { getTextExtractorService } from './parsing/textExtractor.js';
import { getPhotoExtractorService } from './parsing/photoExtractor.js';
import { getGoogleDriveService } from './storage/googleDrive.js';
import { getCloudinaryService } from './storage/cloudinary.js';
import { getLLMService } from './llm/index.js';
import { logger } from '../utils/logger.js';
import { cleanupUploadedFile } from '../middleware/upload.js';
import crypto from 'crypto';
import fs from 'fs';

export interface CVProcessingResult {
  success: boolean;
  cv: CV;
  extractedData?: CVExtractedData;
  error?: string;
}

/**
 * CV Processing Service
 * Orchestrates the complete CV ingestion pipeline:
 * 1. Upload to Google Drive
 * 2. Extract text
 * 3. Extract photo
 * 4. LLM structured extraction
 * 5. Generate AI summary
 * 6. Store results
 */
class CVProcessorService {
  private textExtractor = getTextExtractorService();
  private photoExtractor = getPhotoExtractorService();
  private driveService = getGoogleDriveService();
  private cloudinaryService = getCloudinaryService();
  private llmService = getLLMService();

  /**
   * Process a CV file completely
   */
  async processCV(
    cv: CV,
    filePath: string,
    llmConfig?: LLMConfiguration
  ): Promise<CVProcessingResult> {
    logger.info(`Starting CV processing for: ${cv.id}`);

    try {
      // Update status to processing
      await cv.update({
        status: CVStatus.PROCESSING,
        processingStartedAt: new Date(),
      });

      // Step 1: Calculate checksum
      const checksum = await this.calculateChecksum(filePath);
      await cv.update({ fileChecksum: checksum });

      // Step 2: Upload to Google Drive
      if (this.driveService.isAvailable()) {
        const driveFile = await this.driveService.uploadFile(
          filePath,
          cv.originalFileName,
          this.getMimeType(cv.documentType)
        );
        await cv.update({
          googleDriveFileId: driveFile.fileId,
          googleDriveMimeType: driveFile.mimeType,
        });
        logger.info(`CV uploaded to Google Drive: ${driveFile.fileId}`);
      }

      // Step 3: Extract text
      const mimeType = this.getMimeType(cv.documentType);
      const textResult = await this.textExtractor.extractText(filePath, mimeType);
      
      if (!textResult.text || textResult.text.length < 50) {
        throw new Error('Insufficient text extracted from document');
      }

      const cleanedText = this.textExtractor.cleanText(textResult.text);
      const detectedLanguage = this.textExtractor.detectLanguage(cleanedText);
      logger.info(`Text extracted: ${cleanedText.length} chars, language: ${detectedLanguage}`);

      // Step 4: Extract photo (if present)
      let photoInfo: { url: string; publicId: string; width: number; height: number } | null = null;
      
      if (this.cloudinaryService.isAvailable()) {
        const photo = await this.photoExtractor.extractPhoto(filePath, mimeType);
        
        if (photo) {
          const uploadResult = await this.cloudinaryService.uploadProfilePhoto(photo.buffer, {
            publicId: `cv_${cv.id}`,
          });
          
          photoInfo = {
            url: uploadResult.secureUrl,
            publicId: uploadResult.publicId,
            width: uploadResult.width,
            height: uploadResult.height,
          };
          
          await cv.update({
            photoUrl: photoInfo.url,
            photoPublicId: photoInfo.publicId,
            photoWidth: photoInfo.width,
            photoHeight: photoInfo.height,
          });
          
          logger.info(`Photo uploaded to Cloudinary: ${photoInfo.publicId}`);
        }
      }

      // Step 5: LLM Extraction
      const { result: extractionResult, provider, model } = await this.llmService.extractCVData(
        cleanedText,
        llmConfig
      );

      // Check for extraction error
      if ('error' in extractionResult) {
        throw new Error(`LLM extraction failed: ${extractionResult.reason}`);
      }

      // Update photo_detected based on actual extraction
      const cvData = extractionResult as CVExtractionResult;
      cvData.photo_detected = photoInfo !== null;

      // Step 6: Generate AI Summary
      const aiSummary = await this.llmService.generateSummary(cvData, llmConfig);
      logger.info(`AI summary generated: ${aiSummary.length} chars`);

      // Step 7: Store extracted data
      const extractedData = await CVExtractedData.create({
        cvId: cv.id,
        fullName: cvData.personal_info.full_name || undefined,
        email: cvData.personal_info.email || undefined,
        phone: cvData.personal_info.phone || undefined,
        location: cvData.personal_info.location || undefined,
        age: cvData.personal_info.age || undefined,
        gender: cvData.personal_info.gender || undefined,
        education: cvData.education as any,
        experience: cvData.experience as any,
        skills: {
          technical: cvData.skills.filter(s => this.isTechnicalSkill(s)),
          soft: cvData.skills.filter(s => this.isSoftSkill(s)),
          tools: cvData.skills.filter(s => this.isToolSkill(s)),
        } as any,
        languages: cvData.languages as any,
        certifications: cvData.certifications as any,
        internships: cvData.internships as any,
        totalExperienceYears: cvData.metadata.total_experience_years || undefined,
        seniorityLevel: cvData.metadata.seniority_level,
        industry: cvData.metadata.industry,
        keywords: cvData.metadata.keywords,
        rawText: cleanedText,
      });

      // Step 8: Update CV with final status
      await cv.update({
        status: CVStatus.COMPLETED,
        processingCompletedAt: new Date(),
        aiSummary,
        confidenceScore: cvData.confidence_score,
        llmProvider: provider,
        llmModel: model,
        extractionVersion: '1.0.0',
      });

      // Cleanup temp file
      await cleanupUploadedFile(filePath);

      logger.info(`CV processing completed: ${cv.id}`);

      return {
        success: true,
        cv: await cv.reload(),
        extractedData,
      };
    } catch (error) {
      logger.error(`CV processing failed for ${cv.id}:`, error);

      // Update status to failed
      await cv.update({
        status: CVStatus.FAILED,
        processingError: error instanceof Error ? error.message : 'Unknown error',
      });

      // Cleanup temp file
      await cleanupUploadedFile(filePath);

      return {
        success: false,
        cv: await cv.reload(),
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Reprocess a failed CV
   */
  async reprocessCV(cvId: string, llmConfig?: LLMConfiguration): Promise<CVProcessingResult> {
    const cv = await CV.findByPk(cvId);
    
    if (!cv) {
      throw new Error('CV not found');
    }

    if (!cv.googleDriveFileId) {
      throw new Error('CV file not found in storage');
    }

    // Download file from Google Drive
    const fileBuffer = await this.driveService.downloadFile(cv.googleDriveFileId);
    
    // Create temp file
    const tempPath = `/tmp/cv_${cv.id}_${Date.now()}.tmp`;
    fs.writeFileSync(tempPath, fileBuffer);

    // Reset CV status
    await cv.update({
      status: CVStatus.PENDING,
      processingError: undefined,
    });

    // Delete existing extracted data
    await CVExtractedData.destroy({ where: { cvId: cv.id } });

    // Reprocess
    return this.processCV(cv, tempPath, llmConfig);
  }

  /**
   * Calculate SHA-256 checksum of a file
   */
  private async calculateChecksum(filePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const hash = crypto.createHash('sha256');
      const stream = fs.createReadStream(filePath);
      
      stream.on('data', (data) => hash.update(data));
      stream.on('end', () => resolve(hash.digest('hex')));
      stream.on('error', reject);
    });
  }

  /**
   * Get MIME type from document type
   */
  private getMimeType(documentType: string): string {
    switch (documentType) {
      case 'PDF': return 'application/pdf';
      case 'DOCX': return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      case 'IMAGE': return 'image/jpeg';
      default: return 'application/octet-stream';
    }
  }

  /**
   * Heuristic to classify skills
   */
  private isTechnicalSkill(skill: string): boolean {
    const technicalPatterns = [
      /javascript|typescript|python|java|c\+\+|ruby|go|rust|php|swift|kotlin/i,
      /react|angular|vue|node|express|django|flask|spring|rails/i,
      /sql|mongodb|postgresql|mysql|redis|elasticsearch/i,
      /aws|azure|gcp|docker|kubernetes|terraform/i,
      /html|css|sass|less|tailwind|bootstrap/i,
      /git|linux|unix|bash|shell/i,
      /api|rest|graphql|grpc|websocket/i,
      /machine learning|deep learning|nlp|ai|data science/i,
    ];
    return technicalPatterns.some(pattern => pattern.test(skill));
  }

  private isSoftSkill(skill: string): boolean {
    const softPatterns = [
      /communication|leadership|teamwork|collaboration/i,
      /problem.?solving|critical thinking|analytical/i,
      /time management|organization|planning/i,
      /adaptability|flexibility|creativity/i,
      /presentation|public speaking|negotiation/i,
    ];
    return softPatterns.some(pattern => pattern.test(skill));
  }

  private isToolSkill(skill: string): boolean {
    const toolPatterns = [
      /jira|confluence|trello|asana|notion/i,
      /figma|sketch|adobe|photoshop|illustrator/i,
      /vs code|intellij|eclipse|vim|emacs/i,
      /slack|teams|zoom|discord/i,
      /excel|word|powerpoint|google sheets/i,
    ];
    return toolPatterns.some(pattern => pattern.test(skill));
  }
}

// Singleton instance
let cvProcessorService: CVProcessorService | null = null;

export function getCVProcessorService(): CVProcessorService {
  if (!cvProcessorService) {
    cvProcessorService = new CVProcessorService();
  }
  return cvProcessorService;
}

export { CVProcessorService };