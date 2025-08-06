import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const CreatorLike = sequelize.define('CreatorLike', {
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
    onDelete: 'CASCADE',
  },
  creatorId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'creators',
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  isLike: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    // true = like, false = dislike
  },
}, {
  // Table options
  tableName: 'creator_likes',
  timestamps: true,
  indexes: [
    // Unique constraint - one vote per user per creator
    {
      unique: true,
      fields: ['user_id', 'creator_id'],
      name: 'unique_user_creator_like',
    },
    // Index for quick creator queries
    {
      fields: ['creator_id'],
      name: 'idx_creator_likes_creator_id',
    },
    // Index for quick user queries
    {
      fields: ['user_id'],
      name: 'idx_creator_likes_user_id',
    },
    // Index for like/dislike counts
    {
      fields: ['creator_id', 'is_like'],
      name: 'idx_creator_likes_creator_vote',
    },
  ],
});

// Static methods for aggregation
CreatorLike.getLikeCounts = async function(creatorId) {
  // First try to get counts from Creator table (cached counts)
  const { default: Creator } = await import('./Creator.js');
  const creator = await Creator.findByPk(creatorId);
  
  if (creator) {
    // Return cached counts from Creator table
    return {
      likes: creator.likeCount || 0,
      dislikes: creator.dislikeCount || 0,
      total: (creator.likeCount || 0) + (creator.dislikeCount || 0),
    };
  }
  
  // Fallback to calculating from CreatorLike table
  const [likesResult, dislikesResult] = await Promise.all([
    this.count({
      where: {
        creatorId,
        isLike: true,
      },
    }),
    this.count({
      where: {
        creatorId,
        isLike: false,
      },
    }),
  ]);

  return {
    likes: likesResult,
    dislikes: dislikesResult,
    total: likesResult + dislikesResult,
  };
};

CreatorLike.getUserVote = async function(userId, creatorId) {
  if (!userId) return null;
  
  const vote = await this.findOne({
    where: {
      userId,
      creatorId,
    },
  });

  return vote ? vote.isLike : null;
};

CreatorLike.setUserVote = async function(userId, creatorId, isLike) {
  const [vote, created] = await this.findOrCreate({
    where: {
      userId,
      creatorId,
    },
    defaults: {
      isLike,
    },
  });

  if (!created && vote.isLike !== isLike) {
    vote.isLike = isLike;
    await vote.save();
  }

  return vote;
};

CreatorLike.removeUserVote = async function(userId, creatorId) {
  const result = await this.destroy({
    where: {
      userId,
      creatorId,
    },
  });

  return result > 0;
};

export default CreatorLike;
