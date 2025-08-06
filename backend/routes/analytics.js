import express from 'express';
import { query, param, validationResult } from 'express-validator';
import { authenticateToken } from '../middleware/auth.js';
import AnalyticsService from '../services/AnalyticsService.js';
import { MediaItem, Creator } from '../models/index.js';

const router = express.Router();

// Record a view (can be called by anyone viewing content)
router.post('/views/:mediaId', [
  param('mediaId').isUUID(),
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

    const { mediaId } = req.params;
    const { watchTime = 0 } = req.body;
    const userId = req.user?.id || null; // Optional user for unique tracking

    // Verify media item exists
    const mediaItem = await MediaItem.findByPk(mediaId);
    if (!mediaItem) {
      return res.status(404).json({
        success: false,
        message: 'Media item not found'
      });
    }

    await AnalyticsService.recordView(mediaId, userId, watchTime);

    res.json({
      success: true,
      message: 'View recorded'
    });
  } catch (error) {
    next(error);
  }
});

// Record a like (requires authentication)
router.post('/likes/:mediaId', authenticateToken, [
  param('mediaId').isUUID(),
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

    const { mediaId } = req.params;

    // Verify media item exists
    const mediaItem = await MediaItem.findByPk(mediaId);
    if (!mediaItem) {
      return res.status(404).json({
        success: false,
        message: 'Media item not found'
      });
    }

    await AnalyticsService.recordLike(mediaId);

    res.json({
      success: true,
      message: 'Like recorded'
    });
  } catch (error) {
    next(error);
  }
});

// Record a share (requires authentication)
router.post('/shares/:mediaId', authenticateToken, [
  param('mediaId').isUUID(),
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

    const { mediaId } = req.params;

    // Verify media item exists
    const mediaItem = await MediaItem.findByPk(mediaId);
    if (!mediaItem) {
      return res.status(404).json({
        success: false,
        message: 'Media item not found'
      });
    }

    await AnalyticsService.recordShare(mediaId);

    res.json({
      success: true,
      message: 'Share recorded'
    });
  } catch (error) {
    next(error);
  }
});

// Get analytics for a specific media item (creator only)
router.get('/media/:mediaId', authenticateToken, [
  param('mediaId').isUUID(),
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601(),
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

    const { mediaId } = req.params;
    const { startDate, endDate } = req.query;

    // Verify media item exists and user owns it
    const mediaItem = await MediaItem.findOne({
      where: { id: mediaId },
      include: [
        {
          model: Creator,
          as: 'creator',
          where: { userId: req.user.id },
        },
      ],
    });

    if (!mediaItem) {
      return res.status(404).json({
        success: false,
        message: 'Media item not found or access denied'
      });
    }

    // Default to last 30 days if no dates provided
    const defaultEndDate = new Date().toISOString().split('T')[0];
    const defaultStartDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];

    const analytics = await AnalyticsService.getMediaAnalytics(
      mediaId,
      startDate || defaultStartDate,
      endDate || defaultEndDate
    );

    res.json({
      success: true,
      analytics
    });
  } catch (error) {
    next(error);
  }
});

// Get dashboard analytics for creator
router.get('/dashboard', authenticateToken, async (req, res, next) => {
  try {
    // Get creator profile
    const creator = await Creator.findOne({
      where: { userId: req.user.id }
    });

    if (!creator) {
      return res.status(404).json({
        success: false,
        message: 'Creator profile not found'
      });
    }

    const analytics = await AnalyticsService.getDashboardAnalytics(creator.id);

    res.json({
      success: true,
      analytics
    });
  } catch (error) {
    next(error);
  }
});

// Get creator analytics for a date range
router.get('/creator', authenticateToken, [
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601(),
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

    const { startDate, endDate } = req.query;

    // Get creator profile
    const creator = await Creator.findOne({
      where: { userId: req.user.id }
    });

    if (!creator) {
      return res.status(404).json({
        success: false,
        message: 'Creator profile not found'
      });
    }

    // Default to last 30 days if no dates provided
    const defaultEndDate = new Date().toISOString().split('T')[0];
    const defaultStartDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];

    const analytics = await AnalyticsService.getCreatorAnalytics(
      creator.id,
      startDate || defaultStartDate,
      endDate || defaultEndDate
    );

    res.json({
      success: true,
      analytics
    });
  } catch (error) {
    next(error);
  }
});

// Get top performing media
router.get('/top-performing', authenticateToken, [
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('metric').optional().isIn(['views', 'likes', 'shares', 'revenue']),
  query('days').optional().isInt({ min: 1, max: 365 }),
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

    const { limit = 10, metric = 'views', days = 30 } = req.query;

    // Get creator profile
    const creator = await Creator.findOne({
      where: { userId: req.user.id }
    });

    if (!creator) {
      return res.status(404).json({
        success: false,
        message: 'Creator profile not found'
      });
    }

    const topMedia = await AnalyticsService.getTopPerformingMedia(
      creator.id,
      parseInt(limit),
      metric,
      parseInt(days)
    );

    res.json({
      success: true,
      topMedia,
      criteria: {
        metric,
        days: parseInt(days),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
