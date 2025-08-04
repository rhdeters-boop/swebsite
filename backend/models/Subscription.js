import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Subscription = sequelize.define('Subscription', {
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
  tier: {
    type: DataTypes.ENUM('picture', 'solo_video', 'collab_video'),
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('active', 'canceled', 'past_due', 'unpaid', 'paused'),
    defaultValue: 'active',
  },
  stripeSubscriptionId: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
  },
  stripePriceId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  stripeCustomerId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  currentPeriodStart: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  currentPeriodEnd: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  cancelAtPeriodEnd: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  canceledAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  trialStart: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  trialEnd: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {},
  },
});

// Define tier hierarchy for access control
export const TIER_HIERARCHY = {
  picture: 1,
  solo_video: 2,
  collab_video: 3,
};

// Instance method to check if user has access to content tier
Subscription.prototype.hasAccessTo = function(contentTier) {
  if (this.status !== 'active') return false;
  
  const userTierLevel = TIER_HIERARCHY[this.tier];
  const contentTierLevel = TIER_HIERARCHY[contentTier];
  
  return userTierLevel >= contentTierLevel;
};

export default Subscription;
