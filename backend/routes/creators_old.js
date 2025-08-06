import express from 'express';
import { body, validationResult, query } from 'express-validator';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';
import CreatorService from '../services/CreatorService.js';

const router = express.Router();

// Get all creators (public, with search and filters)
router.get('/', optionalAuth, [
  query('search').optional().trim(),
  query('category').optional().trim(),
  query('sortBy').optional().isIn(['newest', 'popular', 'likes', 'price_low', 'price_high', 'trending', 'top_performers', 'most_viewed', 'most_liked']),
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
    let include = [
      {
        model: User,
        as: 'user',
        attributes: ['displayName', 'username', 'email'],
      },
    ];

    // Add analytics-based sorting
    const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const today = new Date().toISOString().split('T')[0];

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
      case 'trending':
        // Sort by recent views and engagement (last 7 days)
        const last7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        include.push({
          model: MediaItem,
          as: 'mediaItems',
          include: [
            {
              model: MediaAnalytics,
              as: 'analytics',
              where: {
                date: {
                  [Op.between]: [last7Days, today],
                },
              },
              required: false,
            },
          ],
          required: false,
        });
        order = [
          [literal('(SELECT SUM(ma.daily_views + ma.daily_likes + ma.daily_shares) FROM "mediaAnalytics" ma JOIN "media_items" mi ON ma.media_item_id = mi.id WHERE mi.creator_id = "Creator".id AND ma.date >= \'' + last7Days + '\')'), 'DESC NULLS LAST'],
          ['followerCount', 'DESC'],
        ];
        break;
      case 'top_performers':
        // Sort by total views in last 30 days
        include.push({
          model: MediaItem,
          as: 'mediaItems',
          include: [
            {
              model: MediaAnalytics,
              as: 'analytics',
              where: {
                date: {
                  [Op.between]: [last30Days, today],
                },
              },
              required: false,
            },
          ],
          required: false,
        });
        order = [
          [literal('(SELECT SUM(ma.daily_views) FROM "mediaAnalytics" ma JOIN "media_items" mi ON ma.media_item_id = mi.id WHERE mi.creator_id = "Creator".id AND ma.date >= \'' + last30Days + '\')'), 'DESC NULLS LAST'],
          ['subscriberCount', 'DESC'],
        ];
        break;
      case 'most_viewed':
        // Sort by all-time views
        include.push({
          model: MediaItem,
          as: 'mediaItems',
          attributes: ['id', 'viewCount'],
          required: false,
        });
        order = [
          [literal('(SELECT SUM(mi.view_count) FROM "media_items" mi WHERE mi.creator_id = "Creator".id)'), 'DESC NULLS LAST'],
          ['followerCount', 'DESC'],
        ];
        break;
      case 'most_liked':
        order = [
          ['likeCount', 'DESC'], 
          ['followerCount', 'DESC'],
        ];
        break;
      case 'likes':
        order = [
          ['likeCount', 'DESC'], 
          ['followerCount', 'DESC'],
        ];
        break;
      case 'popular':
      default:
        order = [['followerCount', 'DESC'], ['subscriberCount', 'DESC']];
        break;
    }

    const { rows: creators, count } = await Creator.findAndCountAll({
      where,
      include,
      order,
      limit: parseInt(limit),
      offset: parseInt(offset),
      distinct: true, // Important for complex joins
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

// Analytics-based creator discovery routes (must be before /:id route)
router.get('/top-performers', optionalAuth, async (req, res, next) => {
  try {
    const { limit = 10 } = req.query;
    const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const today = new Date().toISOString().split('T')[0];

    const creators = await Creator.findAll({
      where: { isActive: true },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['displayName', 'username'],
        },
        {
          model: MediaItem,
          as: 'mediaItems',
          include: [
            {
              model: MediaAnalytics,
              as: 'analytics',
              where: {
                date: {
                  [Op.between]: [last30Days, today],
                },
              },
              required: false,
            },
          ],
          required: false,
        },
      ],
      order: [
        [literal('(SELECT SUM(ma.daily_views) FROM "media_analytics" ma JOIN "media_items" mi ON ma.media_item_id = mi.id WHERE mi.creator_id = "Creator".id AND ma.date >= \'' + last30Days + '\')'), 'DESC NULLS LAST'],
        ['likeCount', 'DESC'],
        ['followerCount', 'DESC'],
      ],
      limit: parseInt(limit),
    });

    res.json({
      success: true,
      creators,
    });
  } catch (error) {
    next(error);
  }
});

router.get('/trending', optionalAuth, async (req, res, next) => {
  try {
    const { limit = 10 } = req.query;
    const last7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const today = new Date().toISOString().split('T')[0];

    const creators = await Creator.findAll({
      where: { isActive: true },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['displayName', 'username'],
        },
        {
          model: MediaItem,
          as: 'mediaItems',
          include: [
            {
              model: MediaAnalytics,
              as: 'analytics',
              where: {
                date: {
                  [Op.between]: [last7Days, today],
                },
              },
              required: false,
            },
          ],
          required: false,
        },
      ],
      order: [
        [literal('(SELECT SUM(ma.daily_views + ma.daily_likes + ma.daily_shares) FROM "media_analytics" ma JOIN "media_items" mi ON ma.media_item_id = mi.id WHERE mi.creator_id = "Creator".id AND ma.date >= \'' + last7Days + '\')'), 'DESC NULLS LAST'],
        ['followerCount', 'DESC'],
      ],
      limit: parseInt(limit),
    });

    res.json({
      success: true,
      creators,
    });
  } catch (error) {
    next(error);
  }
});

router.get('/new-rising', optionalAuth, async (req, res, next) => {
  try {
    const { limit = 10 } = req.query;
    const last60Days = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);

    const creators = await Creator.findAll({
      where: { 
        isActive: true,
        createdAt: {
          [Op.gte]: last60Days, // Created in last 60 days
        },
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['displayName', 'username'],
        },
      ],
      order: [
        ['followerCount', 'DESC'],
        ['likeCount', 'DESC'],
        ['createdAt', 'DESC'],
      ],
      limit: parseInt(limit),
    });

    res.json({
      success: true,
      creators,
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
          attributes: ['displayName', 'username'],
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
              attributes: ['displayName', 'username', 'email'],
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
