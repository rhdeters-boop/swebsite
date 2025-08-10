import User from './User.js';
import Subscription from './Subscription.js';
import MediaItem from './MediaItem.js';
import Payment from './Payment.js';
import Creator from './Creator.js';
import CreatorSubscription from './CreatorSubscription.js';
import Follow from './Follow.js';
import MediaAnalytics from './MediaAnalytics.js';
import CreatorLike from './CreatorLike.js';
import { PasswordResetToken } from './PasswordResetToken.js';
import Notification from './Notification.js';
import NotificationSetting from './NotificationSetting.js';
import SupportTicket from './SupportTicket.js';
import TicketResponse from './TicketResponse.js';
import SupportTeam from './SupportTeam.js';
import TicketAssignment from './TicketAssignment.js';

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

User.hasMany(CreatorLike, {
  foreignKey: 'userId',
  as: 'creatorLikes',
  onDelete: 'CASCADE',
});

User.hasMany(PasswordResetToken, {
  foreignKey: 'userId',
  as: 'passwordResetTokens',
  onDelete: 'CASCADE',
});

// Notifications associations
User.hasMany(Notification, {
  foreignKey: 'userId',
  as: 'notifications',
  onDelete: 'CASCADE',
});

Notification.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
});

// Notification Settings associations
User.hasOne(NotificationSetting, {
  foreignKey: 'userId',
  as: 'notificationSettings',
  onDelete: 'CASCADE',
});

NotificationSetting.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
});

// Support Ticket associations
User.hasMany(SupportTicket, {
  foreignKey: 'userId',
  as: 'supportTickets',
  onDelete: 'CASCADE',
});

SupportTicket.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
});

SupportTicket.hasMany(TicketResponse, {
  foreignKey: 'ticketId',
  as: 'responses',
  onDelete: 'CASCADE',
});

SupportTicket.hasMany(TicketAssignment, {
  foreignKey: 'ticketId',
  as: 'assignments',
  onDelete: 'CASCADE',
});

// Get current assignment for a ticket
SupportTicket.hasOne(TicketAssignment, {
  foreignKey: 'ticketId',
  as: 'currentAssignment',
  scope: {
    isActive: true
  }
});

// Ticket Response associations
TicketResponse.belongsTo(SupportTicket, {
  foreignKey: 'ticketId',
  as: 'ticket',
});

TicketResponse.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
});

// Support Team associations
User.hasOne(SupportTeam, {
  foreignKey: 'userId',
  as: 'supportTeam',
  onDelete: 'CASCADE',
});

SupportTeam.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
});

// Ticket Assignment associations
TicketAssignment.belongsTo(SupportTicket, {
  foreignKey: 'ticketId',
  as: 'ticket',
});

TicketAssignment.belongsTo(User, {
  foreignKey: 'assignedToId',
  as: 'assignedTo',
});

TicketAssignment.belongsTo(User, {
  foreignKey: 'assignedById',
  as: 'assignedBy',
});

TicketAssignment.belongsTo(User, {
  foreignKey: 'previousAssigneeId',
  as: 'previousAssignee',
});

// Support agent's active tickets
User.hasMany(TicketAssignment, {
  foreignKey: 'assignedToId',
  as: 'activeTicketAssignments',
  scope: {
    isActive: true
  }
});

// User's ticket responses (for both customers and support agents)
User.hasMany(TicketResponse, {
  foreignKey: 'userId',
  as: 'ticketResponses',
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

Creator.hasMany(CreatorLike, {
  foreignKey: 'creatorId',
  as: 'likes',
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

// CreatorLike associations
CreatorLike.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
});

CreatorLike.belongsTo(Creator, {
  foreignKey: 'creatorId',
  as: 'creator',
});

 /**
  * Payment associations
  */
 Payment.belongsTo(User, {
   foreignKey: 'userId',
   as: 'user',
 });
 
 Payment.belongsTo(Subscription, {
   foreignKey: 'subscriptionId',
   as: 'subscription',
 });
 
 // Link payments to creator when applicable (tips, subscription revenue attribution)
 Payment.belongsTo(Creator, {
   foreignKey: 'creatorId',
   as: 'creator',
 });


// MediaItem associations - update to include creator
MediaItem.belongsTo(Creator, {
  foreignKey: 'creatorId',
  as: 'creator',
});

MediaItem.hasMany(MediaAnalytics, {
  foreignKey: 'mediaItemId', // Use camelCase for the foreign key attribute
  as: 'analytics',
  onDelete: 'CASCADE',
});

// MediaAnalytics associations
MediaAnalytics.belongsTo(MediaItem, {
  foreignKey: 'mediaItemId', // Use camelCase for the foreign key attribute
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
  CreatorLike,
  PasswordResetToken,
  Notification,
  NotificationSetting,
  SupportTicket,
  TicketResponse,
  SupportTeam,
  TicketAssignment,
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
  CreatorLike,
  PasswordResetToken,
  Notification,
  NotificationSetting,
  SupportTicket,
  TicketResponse,
  SupportTeam,
  TicketAssignment,
};
