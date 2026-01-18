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
    llmConfig?: LLMConfiguration,
    llmEnabled: boolean = true
  ): Promise<CVProcessingResult> {
    logger.info(`Starting CV processing for: ${cv.id}, LLM enabled: ${llmEnabled}`);

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

      // Step 3: Extract text with intelligent validation
      const mimeType = this.getMimeType(cv.documentType);
      const textResult = await this.textExtractor.extractText(filePath, mimeType);
      
      // Validate extracted text with smart heuristics
      const validationResult = this.validateExtractedText(textResult.text, cv.documentType);
      
      if (!validationResult.isValid) {
        throw new Error(`Insufficient text extracted from document: ${validationResult.reason}`);
      }

      const cleanedText = this.textExtractor.cleanText(textResult.text);
      const detectedLanguage = this.textExtractor.detectLanguage(cleanedText);
      logger.info(`Text extracted: ${cleanedText.length} chars, language: ${detectedLanguage}, quality: ${validationResult.quality}`);
      
      // Log extracted text for debugging
      logger.debug(`\n${'='.repeat(80)}\nEXTRACTED TEXT FROM CV (${cv.id}):\n${'='.repeat(80)}\n${cleanedText}\n${'='.repeat(80)}\n`);

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

      // Step 5: LLM Extraction (only if enabled)
      let extractionResult: CVExtractionResult;
      let provider: string = 'basic';
      let model: string = 'regex-based';

      if (llmEnabled && llmConfig) {
        logger.info(`Using LLM extraction with provider: ${llmConfig.provider}`);
        const llmResult = await this.llmService.extractCVData(cleanedText, llmConfig);
        extractionResult = llmResult.result as CVExtractionResult;
        provider = llmResult.provider;
        model = llmResult.model;

        // Check for extraction error
        if ('error' in extractionResult) {
          throw new Error(`LLM extraction failed: ${extractionResult.reason}`);
        }
      } else {
        logger.info(`Using basic extraction (LLM disabled or no config available)`);
        // Use basic regex-based extraction
        extractionResult = this.performBasicExtraction(cleanedText);
      }

      // Update photo_detected based on actual extraction
      const cvData = extractionResult as CVExtractionResult;
      cvData.photo_detected = photoInfo !== null;

      // Step 6: Generate AI Summary (only if LLM is enabled)
      let aiSummary = '';
      if (llmEnabled && llmConfig) {
        aiSummary = await this.llmService.generateSummary(cvData, llmConfig);
        logger.info(`AI summary generated: ${aiSummary.length} chars`);
      } else {
        // Use basic summary for non-LLM extraction
        aiSummary = this.generateBasicSummary(cvData);
        logger.info(`Basic summary generated: ${aiSummary.length} chars`);
      }

      // Step 7: Store extracted data
      const dataToStore = {
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
      };
      
      logger.info('[processCV] DATA TO STORE IN DATABASE:');
      logger.info(JSON.stringify(dataToStore, null, 2));
      
      const extractedData = await CVExtractedData.create(dataToStore);

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
  async reprocessCV(cvId: string, llmConfig?: LLMConfiguration, llmEnabled: boolean = true): Promise<CVProcessingResult> {
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

    return this.processCV(cv, tempPath, llmConfig, llmEnabled);

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

  /**
   * Smart validation for extracted text with document-type awareness
   * Scanned PDFs (OCR) have different characteristics than native PDFs
   */
  private validateExtractedText(
    text: string | undefined | null,
    documentType: string
  ): { isValid: boolean; reason?: string; quality: 'high' | 'medium' | 'low' } {
    // Check if text exists
    if (!text) {
      return { isValid: false, reason: 'No text extracted', quality: 'low' };
    }

    const textLength = text.length;
    const wordCount = this.countMeaningfulWords(text);
    const lineCount = text.split('\n').length;

    // Thresholds based on document type
    const isScannedPDF = documentType === 'PDF' && lineCount > 20; // Scanned PDFs tend to have more lines due to OCR artifacts

    // Smart validation logic
    if (documentType === 'PDF') {
      // For PDFs (including scanned): need at least 30 chars OR 5+ meaningful words
      if (textLength < 30 && wordCount < 5) {
        return { isValid: false, reason: 'PDF text too short and lacks meaningful words', quality: 'low' };
      }
      // Scanned PDFs are more lenient
      if (isScannedPDF && textLength >= 20 && wordCount >= 3) {
        return { isValid: true, quality: 'medium' };
      }
    }

    // For DOCX and other formats: standard thresholds
    if (textLength < 50 && wordCount < 8) {
      return { isValid: false, reason: 'Extracted text is too short and lacks meaningful content', quality: 'low' };
    }

    // Quality assessment
    let quality: 'high' | 'medium' | 'low' = 'low';
    if (textLength >= 500 && wordCount >= 80) {
      quality = 'high';
    } else if (textLength >= 100 && wordCount >= 15) {
      quality = 'medium';
    }

    return { isValid: true, quality };
  }

  /**
   * Generate a basic text summary from extraction result (no LLM)
   */
  private generateBasicSummary(extractionResult: CVExtractionResult): string {
    const personalInfo = extractionResult.personal_info;
    const skillsText = extractionResult.skills.slice(0, 5).join(', ');
    const experienceCount = extractionResult.experience?.length || 0;
    const educationCount = extractionResult.education?.length || 0;
    
    const parts = [];
    
    if (personalInfo.full_name) {
      parts.push(`${personalInfo.full_name} is a professional`);
    }
    
    if (extractionResult.metadata?.seniority_level && extractionResult.metadata.seniority_level !== 'Unknown') {
      parts.push(`at ${extractionResult.metadata.seniority_level} level`);
    }
    
    if (extractionResult.metadata?.industry) {
      parts.push(`in ${extractionResult.metadata.industry}`);
    }
    
    const summary = parts.join(' ') + '. ';
    
    const details = [];
    if (experienceCount > 0) details.push(`${experienceCount} position(s) of experience`);
    if (educationCount > 0) details.push(`${educationCount} education background(s)`);
    if (skillsText) details.push(`Key skills: ${skillsText}`);
    
    return summary + details.join('. ') + '.';
  }

  /**
   * Perform basic regex-based CV data extraction (fallback when LLM is disabled)
   * Supports multiple languages: English, French, and mixed-language CVs
   */
  private performBasicExtraction(text: string): CVExtractionResult {
    logger.info('[performBasicExtraction] Starting basic extraction');
    
    // Detect CV language - check for French keywords
    const frenchKeywords = ['expérience', 'éducation', 'formation', 'competences', 'compétences', 'langue', 'langues', 'certification', 'certifications', 'projet', 'projets'];
    const englishKeywords = ['experience', 'education', 'skills', 'certifications', 'projects', 'languages'];
    
    const textLower = text.toLowerCase();
    const frenchScore = frenchKeywords.filter(kw => textLower.includes(kw)).length;
    const englishScore = englishKeywords.filter(kw => textLower.includes(kw)).length;
    const isFrenchCV = frenchScore > englishScore;
    
    logger.info(`[performBasicExtraction] Detected language preference - French: ${isFrenchCV}, French score: ${frenchScore}, English score: ${englishScore}`);
    
    // Section headers in both languages
    const sectionHeaders = [
      // English
      'EXPERIENCE', 'EDUCATION', 'SKILLS', 'CERTIFICATIONS', 'PROJECTS', 'REFERENCES', 'SUMMARY', 'PROFILE', 'OBJECTIVE',
      // French
      'EXPÉRIENCE', 'EXPERIENCE', 'FORMATION', 'ÉDUCATION', 'COMPETENCES', 'COMPÉTENCES', 'CERTIFICATIONS', 'PROJETS', 'LANGUES', 'RÉSUMÉ', 'PROFIL', 'OBJECTIF'
    ];
    
    // Extract personal info using regex patterns first (needed for name extraction)
    const emailMatch = text.match(/[\w\.-]+@[\w\.-]+\.\w+/);
    // Support international phone numbers (various formats)
    const phoneMatch = text.match(/(\+?\d{1,3}[-.\\s]?)?(\(?\d{2,4}\)?[-.\\s]?\d{2,4}[-.\\s]?\d{2,4})/);
    
    let fullName = 'Name not extracted';
    
    // Strategy: Names appear near the top of CVs, usually before or with contact info
    // But if contact info is at the very top, search the whole document
    let searchText = text;
    let contactPos = -1;
    
    if (emailMatch) {
      contactPos = text.indexOf(emailMatch[0]);
    } else if (phoneMatch) {
      contactPos = text.indexOf(phoneMatch![0]);
    }
    
    // If contact info found and not at the very top (after more than 50 chars), search before it
    // Otherwise search entire document but prioritize top
    if (contactPos > 50) {
      searchText = text.substring(0, contactPos);
    }
    
    const allLines = searchText.split('\n');
    
    // Phase 1: STRICT - look for perfect 2-3 word names in first 15 lines
    for (let i = 0; i < Math.min(15, allLines.length); i++) {
      const trimmed = allLines[i].trim();
      
      // Skip obvious non-names
      if (!trimmed || trimmed.length < 3 || trimmed.length > 60 ||
          sectionHeaders.includes(trimmed.toUpperCase()) || 
          trimmed.includes('@') || trimmed.includes('http') || /^\d+/.test(trimmed) ||
          trimmed === trimmed.toUpperCase()) continue;
      
      // Strict pattern: title case, 2-3 words, no numbers
      const strictMatch = trimmed.match(/^([A-ZÀÂÄÆÉÈÊËÏÎÔÖŒÙ][a-zàâäæéèêëïîôöœù]+(?:[\s-][A-ZÀÂÄÆÉÈÊËÏÎÔÖŒÙ][a-zàâäæéèêëïîôöœù]+){1,2})$/);
      
      if (strictMatch && !/\d/.test(trimmed)) {
        // Exclude obvious job titles
        if (!trimmed.match(/\b(?:Engineer|Manager|Developer|Director|Designer|Architect|Analyst|Consultant|Specialist|Coordinator|Technic|Technician|Officer|Executive|Supervisor|Assistant|Intern|Lead|Chief|Head)\b/i)) {
          fullName = trimmed;
          logger.info(`[performBasicExtraction] Extracted name (strict): "${fullName}"`);
          break;
        }
      }
    }
    
    // Phase 2: MEDIUM - if not found, look for lines with lowercase letters and title case
    if (fullName === 'Name not extracted') {
      for (let i = 0; i < Math.min(25, allLines.length); i++) {
        const trimmed = allLines[i].trim();
        
        // Skip empty, short, or very long lines
        if (!trimmed || trimmed.length < 3 || trimmed.length > 100) continue;
        
        // Skip section headers, emails, etc.
        if (sectionHeaders.includes(trimmed.toUpperCase()) || trimmed.includes('@') || trimmed.includes('http')) continue;
        
        // Skip all-caps or all-lowercase
        if (trimmed === trimmed.toUpperCase() || trimmed === trimmed.toLowerCase()) continue;
        
        // Skip lines with too many numbers
        if (/\d{3,}/.test(trimmed)) continue;
        
        // Line starts with capital, has some lowercase letters, and doesn't look like a job title
        if (/^[A-ZÀÂÄÆÉÈÊËÏÎÔÖŒÙ]/.test(trimmed) && /[a-z]/.test(trimmed)) {
          if (!trimmed.match(/\b(?:Engineer|Manager|Developer|Director|Designer|Architect|Analyst|Consultant|Specialist|Coordinator|Technic|Technician|Officer|Executive|Supervisor|Support|Lead|Chief|Head)\b/i)) {
            fullName = trimmed;
            logger.info(`[performBasicExtraction] Extracted name (medium): "${fullName}"`);
            break;
          }
        }
      }
    }
    
    // Phase 3: LENIENT - as a last resort, take any line that looks like it could be a name
    if (fullName === 'Name not extracted') {
      for (let i = 0; i < Math.min(30, allLines.length); i++) {
        const trimmed = allLines[i].trim();
        
        // Very basic checks: starts with letter, has at least one space or dash (for middle name/surname)
        if (trimmed && /^[A-Za-zÀ-ÿ]/.test(trimmed) && /[\s-]/.test(trimmed) && 
            trimmed.length >= 5 && trimmed.length <= 100 && 
            !trimmed.includes('@') && !trimmed.includes('http') &&
            !/\d{4}/.test(trimmed)) { // no year patterns
          
          // Skip obvious headers and sections
          if (!sectionHeaders.includes(trimmed.toUpperCase()) && 
              !trimmed.match(/^(SUMMARY|OBJECTIVE|ABOUT|EMAIL|PHONE|LINKEDIN)/i)) {
            fullName = trimmed;
            logger.info(`[performBasicExtraction] Extracted name (lenient): "${fullName}"`);
            break;
          }
        }
      }
    }
    
    // Extract skills (look for common skill keywords) - pre-escaped
    const skillKeywords = [
      // Programming languages
      'javascript', 'typescript', 'python', 'java', 'c\\+\\+', 'c#', 'php', 'ruby', 'go', 'rust', 'kotlin', 'swift', 'scala',
      // Frontend frameworks
      'react', 'angular', 'vue', 'svelte', 'next\\.js', 'nuxt', 'ember', 'backbone',
      // Backend & frameworks
      'node\\.js', 'express', 'django', 'flask', 'spring', 'laravel', 'symfony', 'asp\\.net', 'fastapi', 'rails',
      // Databases
      'sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch', 'firebase', 'dynamodb', 'oracle', 'cassandra',
      // Cloud & DevOps
      'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'ci/cd', 'terraform', 'ansible', 'gitlab',
      // Frontend styling
      'html', 'css', 'scss', 'tailwind', 'bootstrap', 'material design',
      // APIs & protocols
      'rest', 'graphql', 'api', 'soap', 'websocket', 'grpc',
      // Tools & platforms
      'agile', 'scrum', 'jira', 'git', 'gitlab', 'github', 'bitbucket', 'perforce',
      // System & infrastructure
      'linux', 'unix', 'windows', 'macos', 'bash', 'shell', 'powershell',
      // Advanced concepts
      'microservices', 'serverless', 'machine learning', 'ai', 'deep learning', 'nlp', 'data science',
      // French technical keywords
      'développement', 'programmation', 'base de données', 'framework', 'bibliothèque', 'gestion de projet'
    ];
    
    const skills = skillKeywords.filter(skill => 
      new RegExp(`\\b${skill}\\b`, 'i').test(text)
    );

    // Extract languages - both English and French language names
    const languageKeywords = [
      // English names
      'english', 'french', 'spanish', 'german', 'arabic', 'chinese', 'japanese', 'portuguese', 'italian', 'dutch', 'russian', 'korean', 'turkish', 'vietnamese', 'thai', 'polish', 'greek', 'hebrew', 'hindi', 'bengali',
      // French names (when CV is in French)
      'anglais', 'français', 'espagnol', 'allemand', 'arabe', 'chinois', 'japonais', 'portugais', 'italien', 'néerlandais', 'hollandais', 'russe', 'coréen', 'turc', 'vietnamien', 'thaï', 'polonais', 'grec', 'hébreu', 'hindi', 'bengali'
    ];
    const languages = languageKeywords.filter(lang =>
      new RegExp(`\\b${lang}\\b`, 'i').test(text)
    );

    // Extract experience (look for date ranges and job titles)
    const experience = this.extractExperience(text);
    
    // Extract education (look for degrees and institutions)
    const education = this.extractEducation(text);
    
    // Calculate total experience years
    const totalExperienceYears = this.calculateExperienceYears(experience);
    
    // Extract certifications
    const certifications = this.extractCertifications(text);
    
    // Extract location - look for "Location: CITY, COUNTRY" pattern
    let location = '';
    let city = '';
    let country = '';
    const locationMatch = text.match(/Location:\s*([A-Za-z\s]+?),\s*([A-Za-z\s]+?)(?:\n|$)/i);
    if (locationMatch) {
      city = locationMatch[1].trim();
      country = locationMatch[2].trim();
      location = `${city}, ${country}`;
      logger.debug(`[performBasicExtraction] Found location: city="${city}", country="${country}"`);
    }
    
    // Extract LinkedIn URL
    let linkedinUrl = '';
    const linkedinMatch = text.match(/linkedin\.com\/in\/([a-zA-Z0-9\-]+)/i);
    if (linkedinMatch) {
      linkedinUrl = `https://linkedin.com/in/${linkedinMatch[1]}`;
      logger.debug(`[performBasicExtraction] Found LinkedIn: ${linkedinUrl}`);
    }
    
    // Build extraction result
    const result = {
      confidence_score: 0.4,
      photo_detected: false,
      personal_info: {
        full_name: fullName,
        email: emailMatch ? emailMatch[0] : '',
        phone: phoneMatch ? phoneMatch[0] : '',
        location: location,
      },
      education: education,
      experience: experience,
      skills: skills,
      languages: languages,
      certifications: certifications,
      internships: [],
      metadata: {
        total_experience_years: totalExperienceYears,
        seniority_level: this.estimateSeniority(totalExperienceYears),
        industry: '',
        keywords: [...skills, ...languages],
      },
    };
    
    // DEBUG: Log the complete extraction result
    logger.info('[performBasicExtraction] COMPLETE EXTRACTION RESULT:');
    logger.info(JSON.stringify(result, null, 2));
    
    return result;
  }

  /**
   * Extract experience/positions from CV text
   * Works with both English and French CVs
   */
  private extractExperience(text: string): any[] {
    const experience = [];
    
    // Look for experience section in both English and French
    const experienceSection = text.match(/(?:EXPÉRIENCE|EXPERIENCE|EXP\.)(\s\S]*?)(?=EDUCATION|ACADÉMIQUE|FORMATION|ÉDUCATION|COMPÉTENCES|SKILLS|LANGUES|LANGUAGES|$)/i);
    
    if (!experienceSection) return experience;
    
    const sectionText = experienceSection[1];
    
    // Extract date ranges - support multiple formats:
    // - "2004 - 2007"
    // - "2004-2007"
    // - "2004 – 2007" (en-dash)
    // - "2004/2007"
    // - "Jan 2004 - Dec 2007"
    // - "2004 to 2007"
    const datePatterns = [
      /(\d{4})\s*[-–/]\s*(\d{4}|present|current|now|today)/gi,  // YYYY-YYYY or YYYY/YYYY format
      /(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s*(\d{4})\s*[-–]\s*(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s*(\d{4})/gi // Month YYYY - Month YYYY
    ];
    
    for (const datePattern of datePatterns) {
      let dateMatch;
      
      while ((dateMatch = datePattern.exec(sectionText)) !== null) {
        let startYear: number;
        let endYear: number;
        
        // Handle different capture groups depending on which pattern matched
        if (dateMatch[1] && /^\d{4}$/.test(dateMatch[1])) {
          startYear = parseInt(dateMatch[1]);
          endYear = dateMatch[2].toLowerCase() === 'present' || 
                    dateMatch[2].toLowerCase() === 'current' ||
                    dateMatch[2].toLowerCase() === 'now' ||
                    dateMatch[2].toLowerCase() === 'today'
            ? new Date().getFullYear() 
            : parseInt(dateMatch[2]);
        } else {
          continue; // Skip if not a year
        }
        
        // Extract job title near this date range - search backward from date
        const contextStart = Math.max(0, dateMatch.index - 600);
        const contextText = sectionText.substring(contextStart, dateMatch.index);
        
        // Split context by newlines and reverse to search backward
        const lines = contextText.split('\n').reverse().filter(l => l.trim().length > 0);
        
        let jobTitle = 'Position not extracted';
        let company = '';
        
        // Look for job title in pipe-separated format or plain job title
        for (let i = 0; i < Math.min(10, lines.length); i++) {
          const line = lines[i].trim();
          
          // Skip empty or very short lines
          if (line.length < 2 || /^[\d\s,\-–/().,]*$/.test(line)) continue;
          
          // Skip section headers and markers
          if (line.match(/^(?:PROFESSIONAL|EXPERIENCE|EXPÉRIENCE|TECHNICAL|PROJECTS|KEY|EDUCATION|SKILLS)/i)) continue;
          
          // Pattern: "JOB TITLE | COMPANY | LOCATION" or "JOB TITLE | COMPANY"
          if (line.includes('|')) {
            const parts = line.split('|').map(p => p.trim());
            jobTitle = parts[0]; // First part is job title
            if (parts.length > 1) company = parts[1]; // Second part is company
            
            if (jobTitle && jobTitle.length >= 3 && !jobTitle.match(/^[\d\s]+$/) && jobTitle.match(/[a-zA-Z]/)) {
              logger.debug(`[extractExperience] Found: "${jobTitle}" at "${company}"`);
              break;
            }
          } else if (line.match(/^[A-Z]/) && line.match(/[a-z]/i) && line.length >= 5 && line.length < 150) {
            // No pipe - check if line looks like a job title
            // Must have capital letter, letters, reasonable length
            jobTitle = line;
            logger.debug(`[extractExperience] Found position: "${jobTitle}"`);
            break;
          }
        }
        
        experience.push({
          position: jobTitle,
          company: '',
          startDate: `${startYear}`,
          endDate: endYear.toString(),
          description: '',
          duration: `${endYear - startYear} years`,
        });
      }
    }
    
    return experience;
  }

  /**
   * Extract education from CV text
   * Works with both English and French section headers
   */
  private extractEducation(text: string): any[] {
    const education = [];
    
    // Look for education section in both English and French
    const eduSection = text.match(/(?:EDUCATION|ÉDUCATION|FORMATION|ACADÉMIQUE)[\s\S]*?(?=CERTIFICATIONS|SKILLS|COMPÉTENCES|EXPERIENCE|EXPÉRIENCE|$)/i);
    
    if (!eduSection) return education;
    
    const sectionText = eduSection[0];
    const lines = sectionText.split('\n').filter(l => l.trim().length > 0);
    
    for (const line of lines) {
      const trimmed = line.trim();
      
      // Skip section headers
      if (trimmed.match(/^(EDUCATION|ÉDUCATION|FORMATION|ACADÉMIQUE|CERTIFICATIONS)/i)) continue;
      
      // Pattern: DEGREE INSTITUTION | YEAR - YEAR
      // "COMPUTER ENGINEERING STATE ENGINEER Université Privée de Fès | 2022 - 2024"
      // "BACHELOR IN MATHEMATICAL AND COMPUTER SCIENCES Faculté dhar el mahraz | 2016 - 2020"
      const degreeMatch = trimmed.match(/^([A-Z][^|]*?)[\s]+(Université|University|Faculty|Faculté|École|School|Institut|Institute|ISTA)[^|]*?\s*\|?\s*(\d{4})?\s*[-–]?\s*(\d{4})?/i);
      
      if (degreeMatch) {
        const [, degree, , startYear, endYear] = degreeMatch;
        const institutionMatch = trimmed.match(/(Université|University|Faculty|Faculté|École|School|Institut|Institute|ISTA)[^|]*/);
        const institution = institutionMatch ? institutionMatch[0].trim() : '';
        
        education.push({
          degree: degree.trim(),
          institution: institution,
          field_of_study: null,
          start_date: startYear || null,
          end_date: endYear || null,
        });
        logger.debug(`[extractEducation] Found: ${degree.trim()} at ${institution}`);
      }
    }
    
    return education;
  }

  /**
   * Extract certifications from CV text
   * Works with both English and French section headers
   */
  private extractCertifications(text: string): any[] {
    const certifications = [];
    
    // Look for certifications section in both English and French
    // Focus only on true certifications, not education
    const certSection = text.match(/(?:CERTIFICATIONS?)([\s\S]*?)(?=LANGUAGES|LANGUES|ADDITIONAL|SKILLS|COMPÉTENCES|EXPERIENCE|EXPÉRIENCE|EDUCATION|FORMATION|$)/i);
    
    if (!certSection) return certifications;
    
    const sectionText = certSection[1];
    
    // Split by newlines and filter out empty lines
    const lines = sectionText.split('\n').filter(line => line.trim().length > 0);
    
    // Take lines that start with bullet points and are certifications (not education)
    for (const line of lines) {
      const trimmed = line.trim();
      
      // Skip header or empty
      if (trimmed.match(/^CERTIFICATIONS?$/i) || trimmed.length === 0) continue;
      
      // Look for bullet points
      if (trimmed.match(/^[-•]/)) {
        const cert = trimmed.replace(/^[-•]\s*/, '');
        
        // Skip if it looks like education (degree keywords)
        if (cert.match(/^(BACHELOR|MASTER|ENGINEER|TECHNICIAN|DEGREE|DIPLOMA|ENGINEER|UNIVERSITY)/i)) continue;
        
        if (cert.length > 0 && cert.length < 200) {
          certifications.push({
            name: cert,
            issuer: '',
            date: '',
          });
          logger.debug(`[extractCertifications] Found: ${cert}`);
        }
      }
    }
    
    return certifications;
  }

  /**
   * Calculate total experience years from experience array
   */
  private calculateExperienceYears(experience: any[]): number {
    if (!experience || experience.length === 0) return 0;
    
    let totalYears = 0;
    experience.forEach(exp => {
      try {
        const start = parseInt(exp.startDate);
        const end = parseInt(exp.endDate);
        if (!isNaN(start) && !isNaN(end)) {
          totalYears += (end - start);
        }
      } catch (e) {
        // Skip if parsing fails
      }
    });
    
    return totalYears;
  }

  /**
   * Estimate seniority level based on experience years
   */
  private estimateSeniority(years: number): string {
    if (years === 0) return 'Entry Level';
    if (years < 2) return 'Junior';
    if (years < 5) return 'Mid Level';
    if (years < 10) return 'Senior';
    return 'Lead/Principal';
  }

  /**
   * Count meaningful words (filters out common whitespace/formatting artifacts)
   */
  private countMeaningfulWords(text: string): number {
    // Remove extra whitespace and split
    const words = text
      .replace(/\s+/g, ' ')
      .trim()
      .split(' ')
      .filter(word => word.length > 2); // Only count words with 3+ characters

    return words.length;
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