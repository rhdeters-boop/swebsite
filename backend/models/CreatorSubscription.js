import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const CreatorSubscription = sequelize.define('CreatorSubscription', {
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
  creatorId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'creators',
      key: 'id',
    },
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
  amount: {
    type: DataTypes.INTEGER, // Amount in cents
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
}, {
  indexes: [
    {
      fields: ['user_id', 'creator_id'],
      unique: true,
    },
    {
      fields: ['status'],
    },
  ],
});

export default CreatorSubscription;
