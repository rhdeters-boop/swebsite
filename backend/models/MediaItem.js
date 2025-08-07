import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import StorageService from '../services/StorageService.js';

const MediaItem = sequelize.define('MediaItem', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  creatorId: {
    type: DataTypes.UUID,
    allowNull: true, // Allow null for platform content
    references: {
      model: 'creators',
      key: 'id',
    },
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [1, 200],
    },
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  type: {
    type: DataTypes.ENUM('image', 'video'),
    allowNull: false,
  },
  tier: {
    type: DataTypes.ENUM('picture', 'solo_video', 'collab_video'),
    allowNull: false,
  },
  fileType: {
    type: DataTypes.STRING, // Keep for backward compatibility
    allowNull: true,
  },
  mimeType: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  s3Key: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  s3Url: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  s3Bucket: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'void-media',
  },
  storageProvider: {
    type: DataTypes.ENUM('azure', 'minio', 's3'),
    allowNull: false,
    defaultValue: 'minio',
  },
  thumbnailS3Key: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  fileSize: {
    type: DataTypes.BIGINT,
    allowNull: false,
  },
  duration: {
    type: DataTypes.INTEGER, // Duration in seconds for videos
    allowNull: true,
  },
  width: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  height: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  isPublished: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  publishedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  viewCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  tags: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: [],
  },
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {},
  },
  sortOrder: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
}, {
  tableName: 'media_items',
  indexes: [
    {
      unique: true,
      fields: ['s3_key']
    },
    {
      fields: ['creator_id']
    },
    {
      fields: ['type']
    },
    {
      fields: ['tier']
    },
    {
      fields: ['is_published']
    }
  ]
});

// Instance method to generate signed URL
MediaItem.prototype.getSignedUrl = async function(expiresIn = 3600) {
  try {
    return await StorageService.getSignedUrl(this.s3Key, expiresIn);
  } catch (error) {
    console.error('Error generating signed URL:', error.message);
    // Fallback to direct URL if available
    return this.s3Url || null;
  }
};

export default MediaItem;
