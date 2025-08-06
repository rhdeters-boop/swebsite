import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Creator = sequelize.define('Creator', {
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
  displayName: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [2, 50],
    },
  },
  bio: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: {
      len: [0, 1000],
    },
  },
  profileImage: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  coverImage: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  socialLinks: {
    type: DataTypes.JSONB,
    defaultValue: {},
    // { instagram: '', twitter: '', tiktok: '', onlyfans: '' }
  },
  categories: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: [],
    // ['lifestyle', 'fitness', 'beauty', 'fashion', 'art']
  },
  subscriptionPrice: {
    type: DataTypes.INTEGER, // Price in cents
    allowNull: false,
    defaultValue: 999, // $9.99
    validate: {
      min: 299, // Minimum $2.99
      max: 9999, // Maximum $99.99
    },
  },
  isVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  followerCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  subscriberCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  totalEarnings: {
    type: DataTypes.INTEGER, // In cents
    defaultValue: 0,
  },
  likeCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  dislikeCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  lastActiveAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  indexes: [
    {
      fields: ['display_name'],
    },
    {
      fields: ['categories'],
      using: 'gin',
    },
    {
      fields: ['like_count'],
    },
    {
      fields: ['follower_count'],
    },
    {
      fields: ['is_active', 'is_verified'],
    },
  ],
});

// Instance methods
Creator.prototype.getFormattedPrice = function() {
  return (this.subscriptionPrice / 100).toFixed(2);
};

Creator.prototype.updateLikeCounts = async function() {
  // This method will be called to sync like counts from CreatorLike table
  const { default: CreatorLike } = await import('./CreatorLike.js');
  const counts = await CreatorLike.getLikeCounts(this.id);
  
  this.likeCount = counts.likes;
  this.dislikeCount = counts.dislikes;
  await this.save();
  
  return counts;
};

export default Creator;
