import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

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
    unique: true,
  },
  s3Url: {
    type: DataTypes.STRING,
    allowNull: true, // Store the original upload URL
  },
  s3Bucket: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: process.env.S3_BUCKET_NAME || 'void-media',
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
});

// Instance method to generate signed URL
MediaItem.prototype.getSignedUrl = function(expiresIn = 3600) {
  // This will be implemented with AWS SDK
  // For now, return a placeholder
  return `https://${this.s3Bucket}.s3.amazonaws.com/${this.s3Key}`;
};

export default MediaItem;
