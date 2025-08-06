import { Subscription, CreatorSubscription, User, Creator } from '../models/index.js';
import { Op } from 'sequelize';

class SubscriptionService {
  /**
   * Get user's current active subscription
   */
  async getCurrentSubscription(userId) {
    const subscription = await Subscription.findOne({
      where: {
        userId,
        status: 'active'
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'email', 'displayName']
        }
      ]
    });

    if (!subscription) {
      throw new Error('No active subscription found');
    }

    return subscription;
  }

  /**
   * Get user's subscription history
   */
  async getSubscriptionHistory(userId) {
    const subscriptions = await Subscription.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'email', 'displayName']
        }
      ]
    });

    return subscriptions;
  }

  /**
   * Create a new subscription
   */
  async createSubscription(subscriptionData) {
    const {
      userId,
      tier,
      price,
      billingCycle,
      stripeSubscriptionId,
      stripeCustomerId,
      paymentMethodId
    } = subscriptionData;

    // Check if user already has an active subscription
    const existingSubscription = await Subscription.findOne({
      where: {
        userId,
        status: 'active'
      }
    });

    if (existingSubscription) {
      throw new Error('User already has an active subscription');
    }

    const subscription = await Subscription.create({
      userId,
      tier,
      price,
      billingCycle,
      status: 'active',
      stripeSubscriptionId,
      stripeCustomerId,
      paymentMethodId,
      currentPeriodStart: new Date(),
      currentPeriodEnd: this._calculatePeriodEnd(billingCycle),
      createdAt: new Date(),
      updatedAt: new Date()
    });

    return subscription;
  }

  /**
   * Update subscription
   */
  async updateSubscription(subscriptionId, updateData) {
    const subscription = await Subscription.findByPk(subscriptionId);

    if (!subscription) {
      throw new Error('Subscription not found');
    }

    const allowedFields = [
      'tier', 'price', 'status', 'currentPeriodStart', 
      'currentPeriodEnd', 'cancelAtPeriodEnd', 'canceledAt'
    ];
    
    const filteredData = {};
    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        filteredData[field] = updateData[field];
      }
    });

    await subscription.update(filteredData);
    return subscription;
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(userId, { immediate = false } = {}) {
    const subscription = await Subscription.findOne({
      where: {
        userId,
        status: 'active'
      }
    });

    if (!subscription) {
      throw new Error('No active subscription found');
    }

    if (immediate) {
      // Cancel immediately
      await subscription.update({
        status: 'canceled',
        canceledAt: new Date(),
        currentPeriodEnd: new Date()
      });
    } else {
      // Cancel at period end
      await subscription.update({
        cancelAtPeriodEnd: true,
        canceledAt: new Date()
      });
    }

    return subscription;
  }

  /**
   * Reactivate subscription
   */
  async reactivateSubscription(userId) {
    const subscription = await Subscription.findOne({
      where: {
        userId,
        status: { [Op.in]: ['canceled', 'past_due'] }
      },
      order: [['createdAt', 'DESC']]
    });

    if (!subscription) {
      throw new Error('No subscription found to reactivate');
    }

    await subscription.update({
      status: 'active',
      cancelAtPeriodEnd: false,
      canceledAt: null,
      currentPeriodEnd: this._calculatePeriodEnd(subscription.billingCycle)
    });

    return subscription;
  }

  /**
   * Get creator subscriptions (who is subscribed to a creator)
   */
  async getCreatorSubscriptions(creatorId, { page = 1, limit = 20 } = {}) {
    const offset = (page - 1) * limit;

    const { rows: subscriptions, count } = await CreatorSubscription.findAndCountAll({
      where: {
        creatorId,
        status: 'active'
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'displayName', 'username', 'email']
        },
        {
          model: Creator,
          as: 'creator',
          attributes: ['id', 'displayName', 'subscriptionPrice']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    return {
      subscriptions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit)
      }
    };
  }

  /**
   * Subscribe to a creator
   */
  async subscribeToCreator(userId, creatorId, subscriptionData) {
    const { tier, paymentMethodId, stripeSubscriptionId } = subscriptionData;

    // Check if creator exists
    const creator = await Creator.findByPk(creatorId);
    if (!creator) {
      throw new Error('Creator not found');
    }

    // Check if user is already subscribed
    const existingSubscription = await CreatorSubscription.findOne({
      where: {
        userId,
        creatorId,
        status: 'active'
      }
    });

    if (existingSubscription) {
      throw new Error('Already subscribed to this creator');
    }

    // Create subscription
    const subscription = await CreatorSubscription.create({
      userId,
      creatorId,
      tier,
      price: creator.subscriptionPrice,
      status: 'active',
      stripeSubscriptionId,
      paymentMethodId,
      currentPeriodStart: new Date(),
      currentPeriodEnd: this._calculatePeriodEnd('monthly'), // Default to monthly
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Update creator subscriber count
    await creator.increment('subscriberCount');

    return subscription;
  }

  /**
   * Unsubscribe from creator
   */
  async unsubscribeFromCreator(userId, creatorId) {
    const subscription = await CreatorSubscription.findOne({
      where: {
        userId,
        creatorId,
        status: 'active'
      }
    });

    if (!subscription) {
      throw new Error('No active subscription found');
    }

    await subscription.update({
      status: 'canceled',
      canceledAt: new Date()
    });

    // Update creator subscriber count
    const creator = await Creator.findByPk(creatorId);
    if (creator) {
      await creator.decrement('subscriberCount');
    }

    return subscription;
  }

  /**
   * Get user's creator subscriptions (what creators they're subscribed to)
   */
  async getUserCreatorSubscriptions(userId) {
    const subscriptions = await CreatorSubscription.findAll({
      where: {
        userId,
        status: 'active'
      },
      include: [
        {
          model: Creator,
          as: 'creator',
          attributes: ['id', 'displayName', 'subscriptionPrice', 'categories'],
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['displayName', 'username']
            }
          ]
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    return subscriptions;
  }

  /**
   * Check subscription access to tier
   */
  async checkTierAccess(userId, tier) {
    const subscription = await this.getCurrentSubscription(userId);
    
    if (!subscription) {
      return false;
    }

    return subscription.hasAccessTo(tier);
  }

  /**
   * Get subscription analytics for creator
   */
  async getSubscriptionAnalytics(creatorId, { startDate, endDate } = {}) {
    const where = { creatorId };
    
    if (startDate && endDate) {
      where.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    const [totalSubscriptions, activeSubscriptions, canceledSubscriptions] = await Promise.all([
      CreatorSubscription.count({ where }),
      CreatorSubscription.count({ where: { ...where, status: 'active' } }),
      CreatorSubscription.count({ where: { ...where, status: 'canceled' } })
    ]);

    // Calculate revenue (this would be more complex with real payment data)
    const revenueData = await CreatorSubscription.findAll({
      where: { ...where, status: 'active' },
      attributes: ['price'],
      raw: true
    });

    const monthlyRevenue = revenueData.reduce((sum, sub) => sum + (sub.price || 0), 0);

    return {
      totalSubscriptions,
      activeSubscriptions,
      canceledSubscriptions,
      monthlyRevenue,
      churnRate: totalSubscriptions > 0 ? (canceledSubscriptions / totalSubscriptions) * 100 : 0
    };
  }

  /**
   * Calculate period end date based on billing cycle
   * @private
   */
  _calculatePeriodEnd(billingCycle) {
    const now = new Date();
    
    switch (billingCycle) {
      case 'weekly':
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      case 'monthly':
        return new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
      case 'yearly':
        return new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
      default:
        return new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
    }
  }
}

export default new SubscriptionService();
