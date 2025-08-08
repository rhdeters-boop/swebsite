// backend/models/NotificationSetting.js
import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const NotificationSetting = sequelize.define('NotificationSetting', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  // Grouped JSON for extensibility; also provide top-level booleans for quick reads
  emailNotifications: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {
      newPost: true,
      newComment: true,
      suggestedCreators: true,
      suggestedContent: true,
      messages: true,
      billing: true,
    },
  },
  websiteNotifications: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {
      newPost: true,
      newComment: true,
      suggestedCreators: true,
      suggestedContent: true,
      messages: true,
      billing: true,
    },
  },
  // Flattened keys (helpful for querying/indexing)
  newPost: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
  newComment: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
  suggestedCreators: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
  suggestedContent: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
  messages: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
  billing: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
}, {
  indexes: [
    { fields: ['user_id'], name: 'idx_notification_settings_user' },
  ],
});

export default NotificationSetting;