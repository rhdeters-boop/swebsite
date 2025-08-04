import express from 'express';
import { MediaItem, Subscription } from '../models/index.js';
import { requireSubscription } from '../middleware/auth.js';

const router = express.Router();

// Get media by tier
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

    res.json({
      success: true,
      mediaItems,
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

// Get all accessible media for user
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

    res.json({
      success: true,
      mediaItems,
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

export default router;
