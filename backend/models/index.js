import User from './User.js';
import Subscription from './Subscription.js';
import MediaItem from './MediaItem.js';
import Payment from './Payment.js';
import Creator from './Creator.js';
import CreatorSubscription from './CreatorSubscription.js';
import Follow from './Follow.js';
import MediaAnalytics from './MediaAnalytics.js';
import { PasswordResetToken } from './PasswordResetToken.js';

// User associations
User.hasMany(Subscription, {
  foreignKey: 'userId',
  as: 'subscriptions',
  onDelete: 'CASCADE',
});

User.hasMany(Payment, {
  foreignKey: 'userId',
  as: 'payments',
  onDelete: 'CASCADE',
});

User.hasOne(Creator, {
  foreignKey: 'userId',
  as: 'creator',
  onDelete: 'CASCADE',
});

User.hasMany(CreatorSubscription, {
  foreignKey: 'userId',
  as: 'creatorSubscriptions',
  onDelete: 'CASCADE',
});

User.hasMany(Follow, {
  foreignKey: 'followerId',
  as: 'following',
  onDelete: 'CASCADE',
});

User.hasMany(PasswordResetToken, {
  foreignKey: 'userId',
  as: 'passwordResetTokens',
  onDelete: 'CASCADE',
});

// Creator associations
Creator.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
});

Creator.hasMany(MediaItem, {
  foreignKey: 'creatorId',
  as: 'mediaItems',
  onDelete: 'CASCADE',
});

Creator.hasMany(CreatorSubscription, {
  foreignKey: 'creatorId',
  as: 'subscribers',
  onDelete: 'CASCADE',
});

Creator.hasMany(Follow, {
  foreignKey: 'creatorId',
  as: 'followers',
  onDelete: 'CASCADE',
});

// Subscription associations
Subscription.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
});

Subscription.hasMany(Payment, {
  foreignKey: 'subscriptionId',
  as: 'payments',
  onDelete: 'SET NULL',
});

// Creator Subscription associations
CreatorSubscription.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
});

CreatorSubscription.belongsTo(Creator, {
  foreignKey: 'creatorId',
  as: 'creator',
});

// Follow associations
Follow.belongsTo(User, {
  foreignKey: 'followerId',
  as: 'follower',
});

Follow.belongsTo(Creator, {
  foreignKey: 'creatorId',
  as: 'creator',
});

// Payment associations
Payment.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
});

Payment.belongsTo(Subscription, {
  foreignKey: 'subscriptionId',
  as: 'subscription',
});

// MediaItem associations - update to include creator
MediaItem.belongsTo(Creator, {
  foreignKey: 'creatorId',
  as: 'creator',
});

MediaItem.hasMany(MediaAnalytics, {
  foreignKey: 'media_item_id', // Use snake_case for the actual column name
  as: 'analytics',
  onDelete: 'CASCADE',
});

// MediaAnalytics associations
MediaAnalytics.belongsTo(MediaItem, {
  foreignKey: 'media_item_id', // Use snake_case for the actual column name
  as: 'mediaItem',
});

// PasswordResetToken associations
PasswordResetToken.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
});

// Export all models
export {
  User,
  Subscription,
  MediaItem,
  Payment,
  Creator,
  CreatorSubscription,
  Follow,
  MediaAnalytics,
  PasswordResetToken,
};

// Export default for convenience
export default {
  User,
  Subscription,
  MediaItem,
  Payment,
  Creator,
  CreatorSubscription,
  Follow,
  MediaAnalytics,
  PasswordResetToken,
};
