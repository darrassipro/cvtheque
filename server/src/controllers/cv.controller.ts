import { Response } from 'express';
import { Op } from 'sequelize';
import { CV, CVStatus, CVExtractedData, LLMConfiguration, DocumentType } from '../models/index.js';
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

  // Get LLM configuration
  const llmConfig = await LLMConfiguration.findOne({
    where: { isDefault: true, isActive: true },
  });

  // Capture the response data before starting async processing
  const responseData = {
    id: cv.id,
    status: cv.status,
    originalFileName: cv.originalFileName,
  };

  // Process CV asynchronously
  cvProcessor.processCV(cv, file.path, llmConfig || undefined)
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

  if (status) {
    cvWhere.status = status;
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

  const { rows: cvs, count: total } = await CV.findAndCountAll({
    where: cvWhere,
    include: [{
      model: CVExtractedData,
      as: 'extractedData',
      required: hasExtractedFilters,
      where: hasExtractedFilters ? extractedDataWhere : undefined,
    }],
    order: [[sortBy as string, sortOrder.toString().toUpperCase()]],
    limit: limitNum,
    offset,
    distinct: true,
  });

  res.json({
    success: true,
    data: cvs,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
      hasMore: offset + cvs.length < total,
    },
  });
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
    data: cv,
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

  // Get LLM configuration
  const llmConfig = await LLMConfiguration.findOne({
    where: { isDefault: true, isActive: true },
  });

  // Reprocess asynchronously
  cvProcessor.reprocessCV(id, llmConfig || undefined)
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