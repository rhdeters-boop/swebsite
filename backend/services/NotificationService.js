import { Op } from 'sequelize';
import { Notification, NotificationSetting, User } from '../models/index.js';
import EmailService from './EmailService.js';

const NOTIFICATION_TYPES = [
  'new_post',
  'new_comment',
  'new_follower',
  'suggestion_creator',
  'suggestion_content',
  'message',
  'billing_success',
  'billing_failure',
  'billing_expiring'
];

class NotificationService {
  async createNotification(userId, type, content, relatedId = null) {
    if (!NOTIFICATION_TYPES.includes(type)) {
      throw new Error('Invalid notification type');
    }

    const notification = await Notification.create({
      userId,
      type,
      content,
      relatedId,
      isRead: false,
    });

    // Check user settings and optionally send email
    try {
      const settings = await this.getOrCreateSettings(userId);
      const category = this._typeToCategory(type);

      // website notifications are always stored; email optionally sent
      const emailAllowed = this._isEmailEnabled(settings, category);
      if (emailAllowed) {
        const user = await User.findByPk(userId);
        if (user?.email) {
          const subject = this._buildEmailSubject(type);
          await EmailService.sendNotificationEmail(user.email, subject, content);
        }
      }
    } catch (err) {
      // Do not fail the main flow if email/settings fail
      console.warn('Notification email/setting check failed:', err?.message || err);
    }

    return notification;
  }

  async getNotifications(userId, { isRead, type, page = 1, limit = 20 } = {}) {
    const where = { userId };
    if (typeof isRead === 'boolean') where.isRead = isRead;
    if (type && NOTIFICATION_TYPES.includes(type)) where.type = type;

    const offset = (page - 1) * limit;

    const { rows: notifications, count } = await Notification.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    return {
      notifications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit),
      },
    };
  }

  async markAsRead(notificationId, userId) {
    const notification = await Notification.findByPk(notificationId);
    if (!notification || notification.userId !== userId) {
      throw new Error('Notification not found');
    }
    await notification.update({ isRead: true });
    return { message: 'Notification marked as read' };
  }

  async markAllAsRead(userId) {
    await Notification.update({ isRead: true }, { where: { userId, isRead: false } });
    return { message: 'All notifications marked as read' };
  }

  async getNotificationSettings(userId) {
    const settings = await this.getOrCreateSettings(userId);
    return settings;
  }

  async updateNotificationSettings(userId, update) {
    const settings = await this.getOrCreateSettings(userId);

    // Only allow specific fields
    const allowed = [
      'emailNotifications',
      'websiteNotifications',
      'newPost',
      'newComment',
      'suggestedCreators',
      'suggestedContent',
      'messages',
      'billing',
    ];
    const filteredUpdate = {};
    for (const key of allowed) {
      if (update[key] !== undefined) filteredUpdate[key] = update[key];
    }

    await settings.update(filteredUpdate);
    return settings;
  }

  async getOrCreateSettings(userId) {
    let settings = await NotificationSetting.findOne({ where: { userId } });
    if (!settings) {
      settings = await NotificationSetting.create({
        userId,
        emailNotifications: { enabled: true },
        websiteNotifications: { enabled: true },
        newPost: true,
        newComment: true,
        suggestedCreators: true,
        suggestedContent: true,
        messages: true,
        billing: true,
      });
    }
    return settings;
  }

  _typeToCategory(type) {
    switch (type) {
      case 'new_post': return 'newPost';
      case 'new_comment': return 'newComment';
      case 'new_follower': return 'newFollower'; // not in model; treat as messages instead
      case 'message': return 'messages';
      case 'suggestion_creator': return 'suggestedCreators';
      case 'suggestion_content': return 'suggestedContent';
      case 'billing_success':
      case 'billing_failure':
      case 'billing_expiring':
        return 'billing';
      default:
        return 'messages';
    }
  }

  _isEmailEnabled(settings, category) {
    // Basic check: global emailNotifications.enabled and the category flag (billing, messages, etc.)
    const global = settings?.emailNotifications?.enabled !== false;
    const categoryEnabled = settings?.[category] !== false;
    return global && categoryEnabled;
  }

  _buildEmailSubject(type) {
    switch (type) {
      case 'billing_success': return 'Payment received';
      case 'billing_failure': return 'Payment failed';
      case 'billing_expiring': return 'Payment method expiring';
      case 'new_post': return 'New post from a creator you follow';
      case 'new_comment': return 'New comment on your content';
      case 'message': return 'New message';
      default: return 'New notification';
    }
  }
}

export default new NotificationService();