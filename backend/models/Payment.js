import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Payment = sequelize.define('Payment', {
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
  subscriptionId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'subscriptions',
      key: 'id',
    },
  },
  // Optional association to a creator (for tips and subscription revenue attribution)
  creatorId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'creators',
      key: 'id',
    },
  },
  stripePaymentIntentId: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
  },
  stripeInvoiceId: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  amount: {
    type: DataTypes.INTEGER, // Amount in cents
    allowNull: false,
  },
  currency: {
    type: DataTypes.STRING,
    defaultValue: 'usd',
  },
  status: {
    type: DataTypes.ENUM(
      'pending',
      'succeeded',
      'failed',
      'canceled',
      'processing',
      'requires_action'
    ),
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM('subscription', 'tip', 'one_time'),
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  paymentMethodId: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  receiptUrl: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  refunded: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  refundedAmount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {},
  },
  processedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
});

// Helper method to format amount for display
Payment.prototype.getFormattedAmount = function () {
  return (this.amount / 100).toFixed(2);
};

export default Payment;