import { Response } from 'express';
import { Op } from 'sequelize';
import { CV, CVStatus, CVExtractedData, LLMConfiguration, DocumentType, SystemSettings } from '../models/index.js';
import { AuthenticatedRequest } from '../types/index.js';
import { NotFoundError, ValidationError, ForbiddenError } from '../middleware/errorHandler.js';
import { getDocumentType, cleanupUploadedFile } from '../middleware/upload.js';
import { logAudit } from '../middleware/audit.js';
import { AuditAction } from '../models/AuditLog.js';
import { getCVProcessorService } from '../services/cvProcessor.js';
import { getGoogleDriveService } from '../services/storage/googleDrive.js';
import { logger } from '../utils/logger.js';

const cvProcessor = getCVProcessorService();
const driveService = getGoogleDriveService();

/**
 * Transform CVExtractedData to match frontend expectations
 * Robust to handle LLM extraction failures and missing data
 */
function transformExtractedData(extractedData: any): any {
  if (!extractedData) {
    logger.debug(`[transformExtractedData] No extracted data to transform`);
    return null;
  }

  logger.debug(`[transformExtractedData] Transforming data for CV:`, {
    fullName: extractedData.fullName || 'missing',
    email: extractedData.email || 'missing',
    hasEducation: Array.isArray(extractedData.education) && extractedData.education.length > 0,
    hasExperience: Array.isArray(extractedData.experience) && extractedData.experience.length > 0,
    hasSkills: extractedData.skills && Object.keys(extractedData.skills).length > 0,
  });

  const transformed = {
    id: extractedData.id,
    cvId: extractedData.cvId,
    personalInfo: {
      fullName: extractedData.fullName || 'Name not extracted',
      email: extractedData.email || '',
      phone: extractedData.phone || '',
      address: extractedData.location || '',
      city: extractedData.city || '',
      country: extractedData.country || '',
    },
    experience: extractedData.experience || [],
    education: extractedData.education || [],
    skills: flattenSkills(extractedData.skills),
    languages: extractedData.languages || [],
    certifications: extractedData.certifications || [],
    internships: extractedData.internships || [],
    totalExperienceYears: extractedData.totalExperienceYears || 0,
    seniorityLevel: extractedData.seniorityLevel || 'Junior',
    industry: extractedData.industry || '',
    keywords: extractedData.keywords || [],
    rawText: extractedData.rawText,
    createdAt: extractedData.createdAt,
    updatedAt: extractedData.updatedAt,
  };

  logger.debug(`[transformExtractedData] Transformation complete, skills count: ${transformed.skills.length}`);
  return transformed;
}

/**
 * Flatten skills from categorized object to array
 */
function flattenSkills(skills: any): string[] {
  if (!skills) return [];
  return [
    ...(skills.technical || []),
    ...(skills.soft || []),
    ...(skills.tools || []),
  ];
}

/**
 * Upload and process a CV
 */
export async function uploadCV(req: AuthenticatedRequest, res: Response): Promise<void> {
  if (!req.file) {
    throw new ValidationError('No file uploaded');
  }

  if (!req.user) {
    throw new ForbiddenError('Authentication required');
  }

  const file = req.file;
  const documentType = getDocumentType(file.mimetype);

  // Create CV record
  const cv = await CV.create({
    userId: req.user.userId,
    originalFileName: file.originalname,
    documentType: documentType as DocumentType,
    fileSize: file.size,
    status: CVStatus.PENDING,
  });

  await logAudit(req, AuditAction.UPLOAD, 'cv', cv.id);

  // Check if LLM processing is enabled
  const llmEnabledSetting = await SystemSettings.getSetting<boolean>('llmEnabled', true);
  logger.info(`LLM Processing enabled: ${llmEnabledSetting}`);

  // Get LLM configuration only if LLM processing is enabled
  let llmConfig: LLMConfiguration | null = null;
  if (llmEnabledSetting) {
    llmConfig = await LLMConfiguration.findOne({
      where: { isDefault: true, isActive: true },
    });
  }

  // Capture the response data before starting async processing
  const responseData = {
    id: cv.id,
    status: cv.status,
    originalFileName: cv.originalFileName,
  };

  // Process CV asynchronously
  cvProcessor.processCV(cv, file.path, llmConfig || undefined, llmEnabledSetting)
    .then(result => {
      if (!result.success) {
        logger.error(`CV processing failed: ${cv.id}`, result.error);
      }
    })
    .catch(error => {
      logger.error(`CV processing error: ${cv.id}`, error);
    });

  res.status(202).json({
    success: true,
    message: 'CV uploaded and queued for processing',
    data: responseData,
  });
}

/**
 * List CVs (with pagination and filtering)
 */
export async function listCVs(req: AuthenticatedRequest, res: Response): Promise<void> {
  if (!req.user) {
    throw new ForbiddenError('Authentication required');
  }

  const {
    page = 1,
    limit = 20,
    status,
    search,
    skills,
    minExperience,
    maxExperience,
    seniorityLevel,
    industry,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = req.query;

  const pageNum = Number(page);
  const limitNum = Number(limit);
  const offset = (pageNum - 1) * limitNum;

  // Build where clause for CVs
  const cvWhere: any = {};

  // Non-admin users only see their own CVs
  if (req.user.role === 'USER') {
    cvWhere.userId = req.user.userId;
  }

  // Default to showing only COMPLETED CVs unless explicitly requesting other statuses
  if (status) {
    // Only allow specific status filters
    if ([CVStatus.COMPLETED, CVStatus.PROCESSING, CVStatus.PENDING, CVStatus.FAILED].includes(status as CVStatus)) {
      cvWhere.status = status;
      logger.debug(`[listCVs] Filtering by status: ${status}`);
    } else {
      // Invalid status, show all CVs
      logger.debug(`[listCVs] Invalid status filter, showing all CVs`);
    }
  } else {
    // Default: Show all CVs regardless of processing status for robustness
    // This ensures CVs are visible even if LLM extraction fails or is still processing
    logger.debug(`[listCVs] No status filter provided, showing all CVs`);
  }

  // Build include with extracted data filters
  const extractedDataWhere: any = {};

  if (search) {
    extractedDataWhere[Op.or] = [
      { fullName: { [Op.like]: `%${search}%` } },
      { email: { [Op.like]: `%${search}%` } },
      { rawText: { [Op.like]: `%${search}%` } },
    ];
  }

  if (skills) {
    const skillsArray = (skills as string).split(',').map(s => s.trim());
    // For MySQL JSON, use LIKE with JSON search
    extractedDataWhere[Op.or] = skillsArray.map(skill => ({
      [Op.or]: [
        { keywords: { [Op.like]: `%${skill}%` } },
        { rawText: { [Op.like]: `%${skill}%` } },
      ]
    }));
  }

  if (minExperience || maxExperience) {
    extractedDataWhere.totalExperienceYears = {};
    if (minExperience) {
      extractedDataWhere.totalExperienceYears[Op.gte] = Number(minExperience);
    }
    if (maxExperience) {
      extractedDataWhere.totalExperienceYears[Op.lte] = Number(maxExperience);
    }
  }

  if (seniorityLevel) {
    extractedDataWhere.seniorityLevel = seniorityLevel;
  }

  if (industry) {
    extractedDataWhere.industry = { [Op.like]: `%${industry}%` };
  }

  const hasExtractedFilters = Object.keys(extractedDataWhere).length > 0;

  logger.debug(`[listCVs] Query params - page: ${pageNum}, limit: ${limitNum}, search: ${search}, status: ${status}`);
  logger.debug(`[listCVs] User ID: ${req.user.userId}, User role: ${req.user.role}`);
  logger.debug(`[listCVs] Has extracted filters: ${hasExtractedFilters}`);
  logger.debug(`[listCVs] CV Where clause:`, JSON.stringify(cvWhere));
  logger.debug(`[listCVs] ExtractedData Where clause:`, JSON.stringify(extractedDataWhere));

  // Check total CVs in database regardless of filters
  const totalInDb = await CV.count();
  const totalByStatus = await CV.count({ group: 'status' });
  logger.debug(`[listCVs] Total CVs in database: ${totalInDb}`);
  logger.debug(`[listCVs] CVs by status:`, totalByStatus);

  const { rows: cvs, count: total } = await CV.findAndCountAll({
    where: cvWhere,
    include: [{
      model: CVExtractedData,
      as: 'extractedData',
      required: false, // LEFT JOIN to include CVs without extraction (failed/processing)
      where: hasExtractedFilters ? extractedDataWhere : undefined,
    }],
    order: [[sortBy as string, sortOrder.toString().toUpperCase()]],
    limit: limitNum,
    offset,
    distinct: true,
  });

  logger.debug(`[listCVs] Query returned ${cvs.length} CVs out of ${total} total`);
  
  // Log status of returned CVs
  if (cvs.length > 0) {
    const statusBreakdown = cvs.reduce((acc: any, cv: any) => {
      acc[cv.status] = (acc[cv.status] || 0) + 1;
      return acc;
    }, {});
    logger.debug(`[listCVs] Returned CVs by status:`, statusBreakdown);
    
    const firstCVData = cvs[0] as any;
    logger.debug(`[listCVs] First CV sample:`, {
      id: firstCVData.id?.substring(0, 8) || 'no-id',
      status: firstCVData.status || 'no-status',
      originalFileName: firstCVData.originalFileName || 'no-filename',
      hasExtractedData: !!firstCVData.extractedData,
      processingError: firstCVData.processingError ? firstCVData.processingError.substring(0, 150) + '...' : 'none',
    });
  }
  
  if (cvs.length === 0) {
    logger.warn(`[listCVs] No CVs found! Checking database...`);
    const allCVs = await CV.findAll({ attributes: ['id', 'status', 'userId'], limit: 10 });
    logger.warn(`[listCVs] Sample CVs in DB (${allCVs.length} shown):`, allCVs.map((cv: any) => ({
      id: cv.id.substring(0, 8),
      status: cv.status,
      userId: cv.userId ? cv.userId.substring(0, 8) : 'null',
      matchesUser: req.user ? cv.userId === req.user.userId : false,
      matchesRole: req.user ? (req.user.role !== 'USER' || cv.userId === req.user.userId) : false,
    })));
    
    // Check status distribution
    const statusCount = await CV.findAll({
      attributes: [
        'status',
        [CV.sequelize!.fn('COUNT', CV.sequelize!.col('id')), 'count']
      ],
      group: ['status'],
      raw: true
    });
    logger.warn(`[listCVs] Status distribution:`, statusCount);
  }
  
  logger.debug(`[listCVs] First CV extracted data exists: ${(cvs[0] as any)?.extractedData ? 'yes' : 'no'}`);
  
  // Log all CV statuses
  const statusSummary = cvs.reduce((acc: any, cv: any) => {
    const status = cv.status;
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});
  logger.debug(`[listCVs] CV Status Summary:`, statusSummary);

  // Transform extracted data for frontend
  const transformedCVs = cvs.map((cv: any) => {
    const cvJson = cv.toJSON();
    const extractedDataToTransform = (cv as any).extractedData;
    return {
      ...cvJson,
      extractedData: transformExtractedData(extractedDataToTransform) || {
        // Fallback data when LLM extraction failed or is pending
        personalInfo: {
          fullName: cvJson.originalFileName?.replace(/\.[^/.]+$/, '') || 'Processing...',
          email: '',
          phone: '',
          address: '',
          city: '',
          country: '',
        },
        experience: [],
        education: [],
        skills: [],
        languages: [],
        certifications: [],
        internships: [],
        totalExperienceYears: 0,
        seniorityLevel: 'Junior',
        industry: '',
        keywords: [],
      },
    };
  });

  logger.debug(`[listCVs] Transformed ${transformedCVs.length} CVs`);
  if (transformedCVs.length > 0) {
    const firstTransformed = transformedCVs[0];
    logger.debug(`[listCVs] First transformed CV:`, {
      id: firstTransformed.id?.substring(0, 8) || 'no-id',
      status: firstTransformed.status || 'no-status',
      originalFileName: firstTransformed.originalFileName || 'no-filename',
      hasExtractedData: !!firstTransformed.extractedData,
      extractedDataFullName: firstTransformed.extractedData?.personalInfo?.fullName || 'no-name',
      extractedDataSkillsCount: firstTransformed.extractedData?.skills?.length || 0,
    });
  }

  res.json({
    success: true,
    data: transformedCVs,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
      hasMore: offset + transformedCVs.length < total,
    },
  });

  logger.debug(`[listCVs] Response sent with ${transformedCVs.length} CVs`);
}

/**
 * Get a single CV by ID
 */
export async function getCV(req: AuthenticatedRequest, res: Response): Promise<void> {
  const id = req.params.id as string;

  const cv = await CV.findByPk(id, {
    include: [{ model: CVExtractedData, as: 'extractedData' }],
  });

  if (!cv) {
    throw new NotFoundError('CV');
  }

  // Check access permissions
  if (req.user?.role === 'USER' && cv.userId !== req.user.userId) {
    throw new ForbiddenError('You can only access your own CVs');
  }

  await logAudit(req, AuditAction.READ, 'cv', cv.id);

  res.json({
    success: true,
    data: {
      ...cv.toJSON(),
      extractedData: transformExtractedData((cv as any).extractedData),
    },
  });
}

/**
 * Get CV extracted data by ID
 */
export async function getCVExtractedData(req: AuthenticatedRequest, res: Response): Promise<void> {
  const id = req.params.id as string;

  const cv = await CV.findByPk(id, {
    include: [{ model: CVExtractedData, as: 'extractedData' }],
  });

  if (!cv) {
    throw new NotFoundError('CV');
  }

  // Check access permissions
  if (req.user?.role === 'USER' && cv.userId !== req.user.userId) {
    throw new ForbiddenError('You can only access your own CVs');
  }

  await logAudit(req, AuditAction.READ, 'cv', cv.id);

  const transformed = transformExtractedData((cv as any).extractedData);
  
  logger.info('[getCVExtractedData] RAW EXTRACTED DATA FROM DB:');
  logger.info(JSON.stringify((cv as any).extractedData, null, 2));
  
  logger.info('[getCVExtractedData] TRANSFORMED DATA TO SEND TO MOBILE:');
  logger.info(JSON.stringify(transformed, null, 2));

  res.json({
    success: true,
    data: transformed,
  });
}

/**
 * Get CV processing status
 */
export async function getCVStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
  const id = req.params.id as string;

  const cv = await CV.findByPk(id, {
    attributes: ['id', 'status', 'processingStartedAt', 'processingCompletedAt', 'processingError', 'userId'],
  });

  if (!cv) {
    throw new NotFoundError('CV');
  }

  // Check access permissions
  if (req.user?.role === 'USER' && cv.userId !== req.user.userId) {
    throw new ForbiddenError('You can only access your own CVs');
  }

  res.json({
    success: true,
    data: {
      id: cv.id,
      status: cv.status,
      processingStartedAt: cv.processingStartedAt,
      processingCompletedAt: cv.processingCompletedAt,
      processingError: cv.processingError,
    },
  });
}

/**
 * Reprocess a failed CV
 */
export async function reprocessCV(req: AuthenticatedRequest, res: Response): Promise<void> {
  const id = req.params.id as string;

  const cv = await CV.findByPk(id);
  if (!cv) {
    throw new NotFoundError('CV');
  }

  if (cv.status !== CVStatus.FAILED) {
    throw new ValidationError('Only failed CVs can be reprocessed');
  }

  // Check if LLM processing is enabled
  const llmEnabledSetting = await SystemSettings.getSetting<boolean>('llmEnabled', true);
  logger.info(`LLM Processing enabled (reprocess): ${llmEnabledSetting}`);

  // Get LLM configuration only if LLM processing is enabled
  let llmConfig: LLMConfiguration | null = null;
  if (llmEnabledSetting) {
    llmConfig = await LLMConfiguration.findOne({
      where: { isDefault: true, isActive: true },
    });
  }

  // Reprocess asynchronously
  cvProcessor.reprocessCV(id, llmConfig || undefined, llmEnabledSetting)
    .then(result => {
      if (!result.success) {
        logger.error(`CV reprocessing failed: ${id}`, result.error);
      }
    })
    .catch(error => {
      logger.error(`CV reprocessing error: ${id}`, error);
    });

  await logAudit(req, AuditAction.UPDATE, 'cv', cv.id, { reprocessed: true });

  res.json({
    success: true,
    message: 'CV queued for reprocessing',
    data: {
      id: cv.id,
      status: CVStatus.PENDING,
    },
  });
}

/**
 * Delete a CV
 */
export async function deleteCV(req: AuthenticatedRequest, res: Response): Promise<void> {
  const id = req.params.id as string;

  const cv = await CV.findByPk(id);
  if (!cv) {
    throw new NotFoundError('CV');
  }

  // Check access permissions
  if (req.user?.role === 'USER' && cv.userId !== req.user.userId) {
    throw new ForbiddenError('You can only delete your own CVs');
  }

  // Delete from Google Drive
  if (cv.googleDriveFileId && driveService.isAvailable()) {
    try {
      await driveService.deleteFile(cv.googleDriveFileId);
    } catch (error) {
      logger.error('Failed to delete CV from Google Drive:', error);
    }
  }

  await logAudit(req, AuditAction.DELETE, 'cv', cv.id);

  await cv.destroy();

  res.json({
    success: true,
    message: 'CV deleted successfully',
  });
}

/**
 * Download CV file
 */
export async function downloadCV(req: AuthenticatedRequest, res: Response): Promise<void> {
  const id = req.params.id as string;

  const cv = await CV.findByPk(id);
  if (!cv) {
    throw new NotFoundError('CV');
  }

  // Check access permissions
  if (req.user?.role === 'USER' && cv.userId !== req.user.userId) {
    throw new ForbiddenError('You can only download your own CVs');
  }

  if (!cv.googleDriveFileId || !driveService.isAvailable()) {
    throw new NotFoundError('CV file not available');
  }

  const fileBuffer = await driveService.downloadFile(cv.googleDriveFileId);

  await logAudit(req, AuditAction.DOWNLOAD, 'cv', cv.id);

  // Set appropriate headers
  res.setHeader('Content-Type', cv.googleDriveMimeType || 'application/octet-stream');
  res.setHeader('Content-Disposition', `attachment; filename="${cv.originalFileName}"`);
  res.setHeader('Content-Length', fileBuffer.length);

  res.send(fileBuffer);
}

/**
 * Get CV statistics (admin only)
 */
export async function getCVStatistics(req: AuthenticatedRequest, res: Response): Promise<void> {
  const totalCVs = await CV.count();
  const statusCounts = await CV.findAll({
    attributes: [
      'status',
      [CV.sequelize!.fn('COUNT', CV.sequelize!.col('id')), 'count'],
    ],
    group: ['status'],
    raw: true,
  });

  const stats = {
    total: totalCVs,
    byStatus: statusCounts.reduce((acc: any, item: any) => {
      acc[item.status] = parseInt(item.count, 10);
      return acc;
    }, {}),
  };

  res.json({
    success: true,
    data: stats,
  });
}