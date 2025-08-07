import express from 'express';
import { body, validationResult, query } from 'express-validator';
import multer from 'multer';
import { requireSubscription, requireAuth, authenticateToken } from '../middleware/auth.js';
import MediaService from '../services/MediaService.js';

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow images and videos
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image and video files are allowed'), false);
    }
  }
});

// Get media by tier with signed URLs
router.get('/gallery/:tier', requireSubscription('picture'), async (req, res, next) => {
  try {
    const { tier } = req.params;
    const { page = 1, limit = 12 } = req.query;

    const result = await MediaService.getMediaByTier(
      tier,
      req.user.id,
      req.subscription,
      { page, limit }
    );

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    if (error.message.includes('subscription tier required')) {
      return res.status(403).json({
        success: false,
        message: error.message
      });
    }
    next(error);
  }
});

// Get all accessible media for user with signed URLs
router.get('/gallery', requireSubscription('picture'), async (req, res, next) => {
  try {
    const { page = 1, limit = 12 } = req.query;

    const result = await MediaService.getAccessibleMedia(
      req.user.id,
      req.subscription,
      { page, limit }
    );

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    next(error);
  }
});

// Upload media file
router.post('/upload', requireAuth, upload.single('file'), [
  body('tier').isIn(['picture', 'solo_video', 'collab_video']),
  body('title').optional().trim().isLength({ min: 1, max: 100 }),
  body('description').optional().trim().isLength({ max: 1000 }),
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { tier, title, description } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Check if user is a creator
    if (!req.user.isCreator) {
      return res.status(403).json({
        success: false,
        message: 'Only creators can upload media'
      });
    }

    const mediaItem = await MediaService.uploadMediaFile(
      file,
      { tier, title, description },
      req.user.id
    );

    res.status(201).json({
      success: true,
      mediaItem,
      message: 'File uploaded successfully'
    });
  } catch (error) {
    if (error.message.includes('tier') || error.message.includes('file')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    next(error);
  }
});

// Get presigned POST URL for profile uploads (profile picture, banner)
router.post('/profile/upload-url', authenticateToken, [
  body('type').isIn(['profile', 'banner']),
  body('contentType').notEmpty(),
  body('maxFileSize').optional().isInt({ min: 1024, max: 10 * 1024 * 1024 }), // 10MB limit for profile images
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { type, contentType, maxFileSize = 10 * 1024 * 1024 } = req.body;

    // Validate content type for images
    if (!contentType.startsWith('image/')) {
      return res.status(400).json({
        success: false,
        message: 'Only image files are allowed for profile uploads'
      });
    }

    const presignedPost = await MediaService.getPresignedProfileUploadUrl(
      { type, contentType, maxFileSize },
      req.user.id
    );

    res.json({
      success: true,
      uploadData: presignedPost
    });
  } catch (error) {
    if (error.message.includes('Content type')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    next(error);
  }
});

// Get presigned POST URL for direct browser uploads
router.post('/upload-url', requireAuth, [
  body('tier').isIn(['picture', 'solo_video', 'collab_video']),
  body('contentType').notEmpty(),
  body('maxFileSize').optional().isInt({ min: 1024, max: 100 * 1024 * 1024 }),
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { tier, contentType, maxFileSize } = req.body;

    // Check if user is a creator
    if (!req.user.isCreator) {
      return res.status(403).json({
        success: false,
        message: 'Only creators can upload media'
      });
    }

    const presignedPost = await MediaService.getPresignedUploadUrl(
      { tier, contentType, maxFileSize },
      req.user.id
    );

    res.json({
      success: true,
      uploadData: presignedPost
    });
  } catch (error) {
    if (error.message.includes('tier') || error.message.includes('Content type')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    next(error);
  }
});

// Get single media item with signed URL
router.get('/:id', requireSubscription('picture'), async (req, res, next) => {
  try {
    const { id } = req.params;

    const mediaItem = await MediaService.getMediaItem(
      id,
      req.user.id,
      req.subscription
    );

    res.json({
      success: true,
      mediaItem
    });
  } catch (error) {
    if (error.message === 'Media item not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    if (error.message.includes('subscription tier required')) {
      return res.status(403).json({
        success: false,
        message: error.message
      });
    }
    next(error);
  }
});

// Update media item (creators only)
router.put('/:id', authenticateToken, [
  body('title').optional().trim().isLength({ min: 1, max: 100 }),
  body('description').optional().trim().isLength({ max: 1000 }),
  body('tier').optional().isIn(['picture', 'solo_video', 'collab_video']),
  body('isPublished').optional().isBoolean(),
  body('sortOrder').optional().isInt({ min: 0 }),
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const updateData = req.body;

    const mediaItem = await MediaService.updateMediaItem(
      id,
      updateData,
      req.user.id
    );

    res.json({
      success: true,
      message: 'Media item updated successfully',
      mediaItem
    });
  } catch (error) {
    if (error.message === 'Media item not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    if (error.message.includes('only update your own')) {
      return res.status(403).json({
        success: false,
        message: error.message
      });
    }
    next(error);
  }
});

// Delete media item (creators only)
router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await MediaService.deleteMediaItem(id, req.user.id);

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    if (error.message === 'Media item not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    if (error.message.includes('only delete your own')) {
      return res.status(403).json({
        success: false,
        message: error.message
      });
    }
    next(error);
  }
});

// Get media by creator
router.get('/creator/:creatorId', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 }),
  query('includeUnpublished').optional().isBoolean(),
], async (req, res, next) => {
  try {
    const { creatorId } = req.params;
    const { page = 1, limit = 12, includeUnpublished = false } = req.query;

    const result = await MediaService.getMediaByCreator(
      creatorId,
      { page, limit, includeUnpublished }
    );

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    next(error);
  }
});

// Get media analytics for creator
router.get('/analytics/:creatorId', authenticateToken, [
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601(),
  query('mediaItemId').optional().isUUID(),
], async (req, res, next) => {
  try {
    const { creatorId } = req.params;
    const { startDate, endDate, mediaItemId } = req.query;

    // Check if user owns this creator profile
    if (req.user.creatorId !== creatorId) {
      return res.status(403).json({
        success: false,
        message: 'You can only view your own analytics'
      });
    }

    const analytics = await MediaService.getMediaAnalytics(
      creatorId,
      { startDate, endDate, mediaItemId }
    );

    res.json({
      success: true,
      analytics
    });
  } catch (error) {
    next(error);
  }
});

// Test endpoint for S3 storage (no auth required for testing)
router.get('/test-s3', async (req, res, next) => {
  try {
    console.log('🧪 Testing S3 storage...');
    
    // Import S3Service directly for testing
    const { default: S3Service } = await import('../services/S3Service.js');
    
    // Initialize S3 service
    await S3Service.initWithRetry(3, 1000);
    
    // Test file upload with a small buffer
    const testBuffer = Buffer.from('This is a test file for S3 storage', 'utf8');
    const result = await S3Service.uploadFile(
      testBuffer,
      'test-file.txt',
      'text/plain',
      'picture',
      'test-creator-' + Date.now()
    );
    
    // Test signed URL generation
    const signedUrl = await S3Service.getSignedUrl(result.key, 300); // 5 minutes
    
    // Test file deletion
    const deleteResult = await S3Service.deleteFile(result.key);
    
    res.json({
      success: true,
      message: 'S3 storage test completed successfully',
      results: {
        upload: {
          key: result.key,
          size: result.size,
          url: result.url
        },
        signedUrl: signedUrl.substring(0, 80) + '...',
        deleteResult
      }
    });
    
  } catch (error) {
    console.error('❌ S3 test failed:', error);
    res.status(500).json({
      success: false,
      message: 'S3 storage test failed',
      error: error.message
    });
  }
});

// Create media record after S3 upload (for presigned POST flow)
router.post('/create-record', authenticateToken, [
  body('s3Key').notEmpty(),
  body('tier').isIn(['picture', 'solo_video', 'collab_video']),
  body('title').notEmpty().trim().isLength({ min: 1, max: 100 }),
  body('mimeType').notEmpty(),
  body('fileSize').isInt({ min: 1 }),
  body('type').isIn(['image', 'video']),
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { s3Key, tier, title, description, mimeType, fileSize, type } = req.body;

    // Check if user is a creator
    if (!req.user.isCreator) {
      return res.status(403).json({
        success: false,
        message: 'Only creators can upload media'
      });
    }

    // Create MediaItem record
    const { MediaItem } = await import('../models/index.js');
    const mediaItem = await MediaItem.create({
      creatorId: req.user.id,
      title,
      description: description || '',
      type,
      tier,
      mimeType,
      s3Key,
      fileSize,
      isPublished: false, // Require manual publishing
      publishedAt: null,
      sortOrder: 0,
      s3Bucket: process.env.S3_BUCKET_NAME || 'void-media',
      storageProvider: 'minio'
    });

    res.status(201).json({
      success: true,
      message: 'Media record created successfully',
      mediaItem: {
        ...mediaItem.toJSON(),
        s3Key: undefined // Don't expose S3 key
      }
    });

  } catch (error) {
    next(error);
  }
});

export default router;
