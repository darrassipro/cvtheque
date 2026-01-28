import { Router } from 'express';
import * as cvController from '../controllers/cv.controller.js';
import { authenticate, requireActiveAccount } from '../middleware/auth.js';
import { authorize, requireAdmin, requireModerator, requireSuperAdmin } from '../middleware/authorize.js';
import { validate, cvSchemas } from '../middleware/validate.js';
import { uploadCV, uploadMultipleCVs } from '../middleware/upload.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { UserRole } from '../models/index.js';

const router = Router();

// All routes require authentication
router.use(authenticate);
router.use(requireActiveAccount);

/**
 * @swagger
 * /api/cvs/upload:
 *   post:
 *     summary: Upload a new CV
 *     tags: [CVs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               cv:
 *                 type: string
 *                 format: binary
 *     responses:
 *       202:
 *         description: CV uploaded and queued for processing
 *       400:
 *         description: Invalid file
 */
router.post(
  '/upload',
  uploadCV,
  asyncHandler(cvController.uploadCV)
);

/**
 * @swagger
 * /api/cvs/bulk-upload:
 *   post:
 *     summary: Bulk upload CVs (Superadmin only)
 *     tags: [CVs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               cvs:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       202:
 *         description: CVs uploaded and queued for processing
 *       403:
 *         description: Superadmin access required
 */
router.post(
  '/bulk-upload',
  requireSuperAdmin,
  uploadMultipleCVs,
  asyncHandler(cvController.bulkUploadCVs)
);

/**
 * @swagger
 * /api/cvs/assign-to-consultant:
 *   post:
 *     summary: Assign CVs to consultant (Superadmin only)
 *     tags: [CVs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               consultantId:
 *                 type: string
 *               assignmentType:
 *                 type: string
 *                 enum: [cv, user-profile]
 *               cvIds:
 *                 type: array
 *                 items:
 *                   type: string
 *               userIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: CVs assigned successfully
 *       403:
 *         description: Superadmin access required
 */
router.post(
  '/assign-to-consultant',
  requireSuperAdmin,
  asyncHandler(cvController.assignCVsToConsultant)
);

// Share CVs with a consultant (admin/moderator/superadmin)
router.post(
  '/share/consultant',
  requireModerator,
  asyncHandler(cvController.shareCVsWithConsultant)
);

// Get CVs shared with the authenticated user (consultant inbox)
router.get(
  '/shared-with-me',
  asyncHandler(cvController.getSharedWithMe)
);

// Get CVs shared BY the authenticated user (sharing history for admins)
router.get(
  '/shared-by-me',
  asyncHandler(cvController.getSharedByMe)
);

/**
 * @swagger
 * /api/cvs:
 *   get:
 *     summary: List CVs
 *     tags: [CVs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: skills
 *         schema:
 *           type: string
 *         description: Comma-separated skills
 *       - in: query
 *         name: minExperience
 *         schema:
 *           type: number
 *       - in: query
 *         name: maxExperience
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: List of CVs
 */
router.get(
  '/',
  validate({ query: cvSchemas.query }),
  asyncHandler(cvController.listCVs)
);

/**
 * @swagger
 * /api/cvs/statistics:
 *   get:
 *     summary: Get CV statistics (admin only)
 *     tags: [CVs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: CV statistics
 */
router.get(
  '/statistics',
  requireAdmin,
  asyncHandler(cvController.getCVStatistics)
);

/**
 * @swagger
 * /api/cvs/{id}:
 *   get:
 *     summary: Get CV by ID
 *     tags: [CVs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: CV details
 *       404:
 *         description: CV not found
 */
router.get(
  '/:id',
  validate({ params: cvSchemas.params }),
  asyncHandler(cvController.getCV)
);

/**
 * @swagger
 * /api/cvs/{id}/extracted-data:
 *   get:
 *     summary: Get CV extracted data by ID
 *     tags: [CVs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: CV extracted data
 *       404:
 *         description: CV not found
 */
router.get(
  '/:id/extracted-data',
  validate({ params: cvSchemas.params }),
  asyncHandler(cvController.getCVExtractedData)
);

/**
 * @swagger
 * /api/cvs/{id}/extracted-data:
 *   put:
 *     summary: Update CV extracted data (Superadmin only)
 *     tags: [CVs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: CV data updated successfully
 *       403:
 *         description: Superadmin access required
 */
router.put(
  '/:id/extracted-data',
  requireSuperAdmin,
  validate({ params: cvSchemas.params }),
  asyncHandler(cvController.updateCVExtractedData)
);

/**
 * @swagger
 * /api/cvs/{id}/status:
 *   get:
 *     summary: Get CV processing status
 *     tags: [CVs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: CV processing status
 */
router.get(
  '/:id/status',
  validate({ params: cvSchemas.params }),
  asyncHandler(cvController.getCVStatus)
);

/**
 * @swagger
 * /api/cvs/{id}/download:
 *   get:
 *     summary: Download CV file
 *     tags: [CVs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: CV file
 *       404:
 *         description: CV not found
 */
router.get(
  '/:id/download',
  validate({ params: cvSchemas.params }),
  asyncHandler(cvController.downloadCV)
);

/**
 * @swagger
 * /api/cvs/{id}/reprocess:
 *   post:
 *     summary: Reprocess a failed CV
 *     tags: [CVs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: CV queued for reprocessing
 */
router.post(
  '/:id/reprocess',
  requireModerator,
  validate({ params: cvSchemas.params }),
  asyncHandler(cvController.reprocessCV)
);

/**
 * @swagger
 * /api/cvs/{id}:
 *   delete:
 *     summary: Delete a CV
 *     tags: [CVs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: CV deleted successfully
 *       404:
 *         description: CV not found
 */
router.delete(
  '/:id',
  validate({ params: cvSchemas.params }),
  asyncHandler(cvController.deleteCV)
);

export default router;