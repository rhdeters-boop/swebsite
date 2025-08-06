import { Creator, User, MediaItem, CreatorSubscription, Follow, MediaAnalytics, CreatorLike } from '../models/index.js';
import { Op, fn, col, literal } from 'sequelize';

class CreatorService {
  /**
   * Get all creators with search, filters, and sorting
   */
  async getCreators({
    search = '',
    category = '',
    sortBy = 'popular',
    page = 1,
    limit = 12,
    userId = null
  }) {
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

    // Build order clause and includes
    const { order, include } = this._buildSortingOptions(sortBy);

    const { rows: creators, count } = await Creator.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['displayName', 'username', 'email'],
        },
        ...include
      ],
      order,
      limit: parseInt(limit),
      offset: parseInt(offset),
      distinct: true,
    });

    // Add user-specific data if authenticated
    let creatorsWithStatus = creators;
    if (userId) {
      creatorsWithStatus = await this._addUserStatusToCreators(creators, userId);
    }

    return {
      creators: creatorsWithStatus,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit)
      },
      filters: {
        categories: [
          'Lifestyle', 'Fitness', 'Beauty', 'Fashion', 'Art',
          'Photography', 'Travel', 'Cooking', 'Music', 'Entertainment'
        ]
      }
    };
  }

  /**
   * Get top performing creators based on analytics
   */
  async getTopPerformers(limit = 10) {
    const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const today = new Date().toISOString().split('T')[0];

    return await Creator.findAll({
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
  }

  /**
   * Get trending creators based on recent engagement
   */
  async getTrendingCreators(limit = 10) {
    const last7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const today = new Date().toISOString().split('T')[0];

    return await Creator.findAll({
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
  }

  /**
   * Get new and rising creators
   */
  async getNewRisingCreators(limit = 10) {
    const last60Days = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);

    return await Creator.findAll({
      where: { 
        isActive: true,
        createdAt: {
          [Op.gte]: last60Days,
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
  }

  /**
   * Get creator by ID with optional user status
   */
  async getCreatorById(id, userId = null) {
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
      throw new Error('Creator not found');
    }

    let creatorData = creator.toJSON();

    // Add user-specific status if authenticated
    if (userId) {
      const [follow, subscription] = await Promise.all([
        Follow.findOne({
          where: {
            followerId: userId,
            creatorId: creator.id
          }
        }),
        CreatorSubscription.findOne({
          where: {
            userId: userId,
            creatorId: creator.id,
            status: 'active'
          }
        })
      ]);

      creatorData.isFollowed = !!follow;
      creatorData.isSubscribed = !!subscription;
    }

    return creatorData;
  }

  /**
   * Get creator by username
   */
  async getCreatorByUsername(username, userId = null) {
    const creator = await Creator.findOne({
      where: { isActive: true },
      include: [
        {
          model: User,
          as: 'user',
          where: { username },
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
      throw new Error('Creator not found');
    }

    let creatorData = creator.toJSON();

    // Add user-specific status if authenticated
    if (userId) {
      const [follow, subscription] = await Promise.all([
        Follow.findOne({
          where: {
            followerId: userId,
            creatorId: creator.id
          }
        }),
        CreatorSubscription.findOne({
          where: {
            userId: userId,
            creatorId: creator.id,
            status: 'active'
          }
        })
      ]);

      creatorData.isFollowed = !!follow;
      creatorData.isSubscribed = !!subscription;
    }

    return creatorData;
  }

  /**
   * Create a new creator profile
   */
  async createCreator(userId, creatorData) {
    const { displayName, bio, categories, subscriptionPrice, socialLinks = {} } = creatorData;

    // Check if user already has a creator profile
    const existingCreator = await Creator.findOne({
      where: { userId }
    });

    if (existingCreator) {
      throw new Error('User already has a creator profile');
    }

    return await Creator.create({
      userId,
      displayName,
      bio,
      categories,
      subscriptionPrice,
      socialLinks,
    });
  }

  /**
   * Get creator profile by user ID
   */
  async getCreatorByUserId(userId) {
    const creator = await Creator.findOne({
      where: { userId },
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
      throw new Error('Creator profile not found');
    }

    return creator;
  }

  /**
   * Update creator profile
   */
  async updateCreator(userId, updateData) {
    const creator = await Creator.findOne({
      where: { userId }
    });

    if (!creator) {
      throw new Error('Creator profile not found');
    }

    const filteredData = {};
    const allowedFields = ['displayName', 'bio', 'categories', 'subscriptionPrice', 'socialLinks'];
    
    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        filteredData[field] = updateData[field];
      }
    });

    await creator.update(filteredData);
    return creator;
  }

  /**
   * Toggle follow status for a creator
   */
  async toggleFollow(creatorId, userId) {
    const creator = await Creator.findByPk(creatorId);
    if (!creator) {
      throw new Error('Creator not found');
    }

    const existingFollow = await Follow.findOne({
      where: {
        followerId: userId,
        creatorId
      }
    });

    if (existingFollow) {
      // Unfollow
      await existingFollow.destroy();
      await creator.decrement('followerCount');
      return { isFollowed: false, message: 'Unfollowed creator' };
    } else {
      // Follow
      await Follow.create({
        followerId: userId,
        creatorId
      });
      await creator.increment('followerCount');
      return { isFollowed: true, message: 'Followed creator' };
    }
  }

  /**
   * Build sorting options for creator queries
   * @private
   */
  _buildSortingOptions(sortBy) {
    const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const last7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const today = new Date().toISOString().split('T')[0];

    let order = [];
    let include = [];

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

    return { order, include };
  }

  /**
   * Add user-specific status to creators
   * @private
   */
  async _addUserStatusToCreators(creators, userId) {
    const creatorIds = creators.map(c => c.id);
    
    const [follows, subscriptions] = await Promise.all([
      Follow.findAll({
        where: {
          followerId: userId,
          creatorId: { [Op.in]: creatorIds }
        }
      }),
      CreatorSubscription.findAll({
        where: {
          userId: userId,
          creatorId: { [Op.in]: creatorIds },
          status: 'active'
        }
      })
    ]);

    const followedCreatorIds = new Set(follows.map(f => f.creatorId));
    const subscribedCreatorIds = new Set(subscriptions.map(s => s.creatorId));

    return creators.map(creator => ({
      ...creator.toJSON(),
      isFollowed: followedCreatorIds.has(creator.id),
      isSubscribed: subscribedCreatorIds.has(creator.id),
    }));
  }
}

export default new CreatorService();
