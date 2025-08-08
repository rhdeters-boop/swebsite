// backend/models/Notification.js
import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

export const NOTIFICATION_TYPES = [
  'new_post',
  'new_comment',
  'new_follower',
  'suggestion_creator',
  'suggestion_content',
  'message',
  'billing_success',
  'billing_failure',
  'billing_expiring',
];

const Notification = sequelize.define('Notification', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  type: {
    type: DataTypes.ENUM(...NOTIFICATION_TYPES),
    allowNull: false,
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  isRead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  relatedId: {
    type: DataTypes.UUID, // can reference post/comment/payment/etc depending on type
    allowNull: true,
  },
}, {
  indexes: [
    { fields: ['user_id'], name: 'idx_notification_user' },
    { fields: ['user_id', 'is_read'], name: 'idx_notification_user_is_read' },
    { fields: ['created_at'], name: 'idx_notification_created_at' },
    { fields: ['type'], name: 'idx_notification_type' },
  ],
});

export default Notification;