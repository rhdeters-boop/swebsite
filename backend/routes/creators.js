import express from 'express';
import { body, validationResult, query } from 'express-validator';
import { Creator, User, MediaItem, CreatorSubscription, Follow } from '../models/index.js';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';
import { Op } from 'sequelize';

const router = express.Router();

// Get all creators (public, with search and filters)
router.get('/', optionalAuth, [
  query('search').optional().trim(),
  query('category').optional().trim(),
  query('sortBy').optional().isIn(['newest', 'popular', 'rating', 'price_low', 'price_high']),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 }),
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

    const {
      search = '',
      category = '',
      sortBy = 'popular',
      page = 1,
      limit = 12
    } = req.query;

    const offset = (page - 1) * limit;
    
    // Build where clause
    const where = {
      isActive: true,
    };

    if (search) {
      where[Op.or] = [
        { displayName: { [Op.iLike]: `%${search}%` } },
        { bio: { [Op.iLike]: `%${search}%` } },
      ];
    }

    if (category) {
      where.categories = { [Op.contains]: [category] };
    }

    // Build order clause
    let order = [];
    switch (sortBy) {
      case 'newest':
        order = [['createdAt', 'DESC']];
        break;
      case 'rating':
        order = [['rating', 'DESC'], ['ratingCount', 'DESC']];
        break;
      case 'price_low':
        order = [['subscriptionPrice', 'ASC']];
        break;
      case 'price_high':
        order = [['subscriptionPrice', 'DESC']];
        break;
      case 'popular':
      default:
        order = [['followerCount', 'DESC'], ['subscriberCount', 'DESC']];
        break;
    }

    const { rows: creators, count } = await Creator.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['firstName', 'lastName', 'email'],
        },
      ],
      order,
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    // If user is authenticated, check if they follow/subscribe to these creators
    let creatorsWithStatus = creators;
    if (req.user) {
      const creatorIds = creators.map(c => c.id);
      
      const [follows, subscriptions] = await Promise.all([
        Follow.findAll({
          where: {
            followerId: req.user.id,
            creatorId: { [Op.in]: creatorIds }
          }
        }),
        CreatorSubscription.findAll({
          where: {
            userId: req.user.id,
            creatorId: { [Op.in]: creatorIds },
            status: 'active'
          }
        })
      ]);

      const followedCreatorIds = new Set(follows.map(f => f.creatorId));
      const subscribedCreatorIds = new Set(subscriptions.map(s => s.creatorId));

      creatorsWithStatus = creators.map(creator => ({
        ...creator.toJSON(),
        isFollowed: followedCreatorIds.has(creator.id),
        isSubscribed: subscribedCreatorIds.has(creator.id),
      }));
    }

    res.json({
      success: true,
      creators: creatorsWithStatus,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit)
      },
      filters: {
        categories: [
          'Lifestyle',
          'Fitness',
          'Beauty',
          'Fashion',
          'Art',
          'Photography',
          'Travel',
          'Cooking',
          'Music',
          'Entertainment'
        ]
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get creator by ID (public)
router.get('/:id', optionalAuth, async (req, res, next) => {
  try {
    const { id } = req.params;

    const creator = await Creator.findOne({
      where: { id, isActive: true },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['firstName', 'lastName'],
        },
        {
          model: MediaItem,
          as: 'mediaItems',
          where: { isPublished: true },
          required: false,
          limit: 6,
          order: [['publishedAt', 'DESC']],
        },
      ],
    });

    if (!creator) {
      return res.status(404).json({
        success: false,
        message: 'Creator not found'
      });
    }

    let creatorData = creator.toJSON();

    // If user is authenticated, check follow/subscription status
    if (req.user) {
      const [follow, subscription] = await Promise.all([
        Follow.findOne({
          where: {
            followerId: req.user.id,
            creatorId: creator.id
          }
        }),
        CreatorSubscription.findOne({
          where: {
            userId: req.user.id,
            creatorId: creator.id,
            status: 'active'
          }
        })
      ]);

      creatorData.isFollowed = !!follow;
      creatorData.isSubscribed = !!subscription;
    }

    res.json({
      success: true,
      creator: creatorData
    });
  } catch (error) {
    next(error);
  }
});

// Apply to become a creator
router.post('/apply', authenticateToken, [
  body('displayName').trim().isLength({ min: 2, max: 50 }),
  body('bio').optional().trim().isLength({ max: 1000 }),
  body('categories').isArray({ min: 1, max: 5 }),
  body('subscriptionPrice').isInt({ min: 299, max: 9999 }), // $2.99 to $99.99
  body('socialLinks').optional().isObject(),
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

    // Check if user already has a creator profile
    const existingCreator = await Creator.findOne({
      where: { userId: req.user.id }
    });

    if (existingCreator) {
      return res.status(400).json({
        success: false,
        message: 'You already have a creator profile'
      });
    }

    const {
      displayName,
      bio,
      categories,
      subscriptionPrice,
      socialLinks = {}
    } = req.body;

    const creator = await Creator.create({
      userId: req.user.id,
      displayName,
      bio,
      categories,
      subscriptionPrice,
      socialLinks,
    });

    res.status(201).json({
      success: true,
      message: 'Creator application submitted successfully',
      creator
    });
  } catch (error) {
    next(error);
  }
});

// Get current user's creator profile
router.get('/me/profile', authenticateToken, async (req, res, next) => {
  try {
    const creator = await Creator.findOne({
      where: { userId: req.user.id },
      include: [
        {
          model: MediaItem,
          as: 'mediaItems',
          order: [['createdAt', 'DESC']],
          limit: 10,
        },
        {
          model: CreatorSubscription,
          as: 'subscribers',
          where: { status: 'active' },
          required: false,
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['firstName', 'lastName', 'email'],
            },
          ],
        },
      ],
    });

    if (!creator) {
      return res.status(404).json({
        success: false,
        message: 'Creator profile not found'
      });
    }

    res.json({
      success: true,
      creator
    });
  } catch (error) {
    next(error);
  }
});

// Update creator profile
router.put('/me/profile', authenticateToken, [
  body('displayName').optional().trim().isLength({ min: 2, max: 50 }),
  body('bio').optional().trim().isLength({ max: 1000 }),
  body('categories').optional().isArray({ min: 1, max: 5 }),
  body('subscriptionPrice').optional().isInt({ min: 299, max: 9999 }),
  body('socialLinks').optional().isObject(),
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

    const creator = await Creator.findOne({
      where: { userId: req.user.id }
    });

    if (!creator) {
      return res.status(404).json({
        success: false,
        message: 'Creator profile not found'
      });
    }

    const updateData = {};
    const allowedFields = ['displayName', 'bio', 'categories', 'subscriptionPrice', 'socialLinks'];
    
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    await creator.update(updateData);

    res.json({
      success: true,
      message: 'Creator profile updated successfully',
      creator
    });
  } catch (error) {
    next(error);
  }
});

// Follow/Unfollow creator
router.post('/:id/follow', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;

    const creator = await Creator.findByPk(id);
    if (!creator) {
      return res.status(404).json({
        success: false,
        message: 'Creator not found'
      });
    }

    // Check if already following
    const existingFollow = await Follow.findOne({
      where: {
        followerId: req.user.id,
        creatorId: id
      }
    });

    if (existingFollow) {
      // Unfollow
      await existingFollow.destroy();
      await creator.decrement('followerCount');
      
      res.json({
        success: true,
        message: 'Unfollowed creator',
        isFollowed: false
      });
    } else {
      // Follow
      await Follow.create({
        followerId: req.user.id,
        creatorId: id
      });
      await creator.increment('followerCount');
      
      res.json({
        success: true,
        message: 'Followed creator',
        isFollowed: true
      });
    }
  } catch (error) {
    next(error);
  }
});

export default router;
