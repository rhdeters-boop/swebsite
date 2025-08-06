import express from 'express';
import multer from 'multer';
import { MediaItem, Subscription } from '../models/index.js';
import { requireSubscription, requireAuth } from '../middleware/auth.js';
import S3Service from '../services/S3Service.js';
import AnalyticsService from '../services/AnalyticsService.js';

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

    // Check if user has access to this tier
    if (!req.subscription.hasAccessTo(tier)) {
      return res.status(403).json({
        success: false,
        message: `${tier} subscription tier required`
      });
    }

    const offset = (page - 1) * limit;

    const { rows: mediaItems, count } = await MediaItem.findAndCountAll({
      where: {
        tier,
        isPublished: true
      },
      order: [['publishedAt', 'DESC'], ['sortOrder', 'ASC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    // Generate signed URLs for each media item
    const mediaWithSignedUrls = await Promise.all(
      mediaItems.map(async (item) => {
        const signedUrl = item.s3Key 
          ? await S3Service.getSignedUrl(item.s3Key, 3600) // 1 hour expiry
          : null;
        
        return {
          ...item.toJSON(),
          signedUrl,
          // Don't expose S3 key to frontend
          s3Key: undefined
        };
      })
    );

    res.json({
      success: true,
      mediaItems: mediaWithSignedUrls,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get all accessible media for user with signed URLs
router.get('/gallery', requireSubscription('picture'), async (req, res, next) => {
  try {
    const { page = 1, limit = 12 } = req.query;
    const offset = (page - 1) * limit;

    // Determine accessible tiers based on subscription
    let accessibleTiers = [];
    if (req.subscription.hasAccessTo('collab_video')) {
      accessibleTiers = ['picture', 'solo_video', 'collab_video'];
    } else if (req.subscription.hasAccessTo('solo_video')) {
      accessibleTiers = ['picture', 'solo_video'];
    } else {
      accessibleTiers = ['picture'];
    }

    const { rows: mediaItems, count } = await MediaItem.findAndCountAll({
      where: {
        tier: accessibleTiers,
        isPublished: true
      },
      order: [['publishedAt', 'DESC'], ['sortOrder', 'ASC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    // Generate signed URLs for each media item
    const mediaWithSignedUrls = await Promise.all(
      mediaItems.map(async (item) => {
        const signedUrl = item.s3Key 
          ? await S3Service.getSignedUrl(item.s3Key, 3600) // 1 hour expiry
          : null;
        
        return {
          ...item.toJSON(),
          signedUrl,
          // Don't expose S3 key to frontend
          s3Key: undefined
        };
      })
    );

    res.json({
      success: true,
      mediaItems: mediaWithSignedUrls,
      accessibleTiers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    next(error);
  }
});

// Upload media file
router.post('/upload', requireAuth, upload.single('file'), async (req, res, next) => {
  try {
    const { tier, title, description } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    if (!tier || !['picture', 'solo_video', 'collab_video'].includes(tier)) {
      return res.status(400).json({
        success: false,
        message: 'Valid tier is required (picture, solo_video, collab_video)'
      });
    }

    // Check if user is a creator
    if (!req.user.isCreator) {
      return res.status(403).json({
        success: false,
        message: 'Only creators can upload media'
      });
    }

    // Upload file to S3
    const uploadResult = await S3Service.uploadFile(
      file.buffer,
      file.originalname,
      file.mimetype,
      tier,
      req.user.id
    );

    // Create MediaItem record
    const mediaItem = await MediaItem.create({
      title: title || file.originalname,
      description: description || '',
      tier,
      fileType: file.mimetype,
      fileSize: file.size,
      s3Key: uploadResult.key,
      s3Url: uploadResult.url,
      creatorId: req.user.id,
      isPublished: false, // Require manual publishing
      publishedAt: null,
      sortOrder: 0
    });

    res.status(201).json({
      success: true,
      mediaItem: {
        ...mediaItem.toJSON(),
        s3Key: undefined // Don't expose S3 key
      },
      message: 'File uploaded successfully'
    });
  } catch (error) {
    next(error);
  }
});

// Get presigned POST URL for direct browser uploads
router.post('/upload-url', requireAuth, async (req, res, next) => {
  try {
    const { tier, contentType, maxFileSize } = req.body;

    if (!tier || !['picture', 'solo_video', 'collab_video'].includes(tier)) {
      return res.status(400).json({
        success: false,
        message: 'Valid tier is required (picture, solo_video, collab_video)'
      });
    }

    if (!contentType) {
      return res.status(400).json({
        success: false,
        message: 'Content type is required'
      });
    }

    // Check if user is a creator
    if (!req.user.isCreator) {
      return res.status(403).json({
        success: false,
        message: 'Only creators can upload media'
      });
    }

    const presignedPost = await S3Service.getPresignedPost(
      tier,
      req.user.id,
      contentType,
      maxFileSize || 100 * 1024 * 1024 // 100MB default
    );

    res.json({
      success: true,
      uploadData: presignedPost
    });
  } catch (error) {
    next(error);
  }
});

// Get single media item with signed URL
router.get('/:id', requireSubscription('picture'), async (req, res, next) => {
  try {
    const { id } = req.params;

    const mediaItem = await MediaItem.findByPk(id);

    if (!mediaItem) {
      return res.status(404).json({
        success: false,
        message: 'Media item not found'
      });
    }

    // Check if user has access to this tier
    if (!req.subscription.hasAccessTo(mediaItem.tier)) {
      return res.status(403).json({
        success: false,
        message: `${mediaItem.tier} subscription tier required`
      });
    }

    // Generate signed URL
    const signedUrl = mediaItem.s3Key 
      ? await S3Service.getSignedUrl(mediaItem.s3Key, 3600) // 1 hour expiry
      : null;

    // Record view analytics (async, don't wait for completion)
    AnalyticsService.recordView(id, req.user?.id)
      .catch(error => console.error('Error recording view:', error));

    res.json({
      success: true,
      mediaItem: {
        ...mediaItem.toJSON(),
        signedUrl,
        s3Key: undefined // Don't expose S3 key
      }
    });
  } catch (error) {
    next(error);
  }
});

// Delete media item (creators only)
router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const { id } = req.params;

    const mediaItem = await MediaItem.findByPk(id);

    if (!mediaItem) {
      return res.status(404).json({
        success: false,
        message: 'Media item not found'
      });
    }

    // Check if user owns this media item
    if (mediaItem.creatorId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own media'
      });
    }

    // Delete from S3
    if (mediaItem.s3Key) {
      await S3Service.deleteFile(mediaItem.s3Key);
    }

    // Delete from database
    await mediaItem.destroy();

    res.json({
      success: true,
      message: 'Media item deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

export default router;
