import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const SupportTicket = sequelize.define('SupportTicket', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  ticketNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    comment: 'Format: TKT-YYYYMMDD-XXXX',
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [1, 100],
    },
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isEmail: true,
    },
  },
  category: {
    type: DataTypes.ENUM(
      'account',
      'technical',
      'payment',
      'content',
      'trust_safety',
      'feature_request',
      'bug_report',
      'other'
    ),
    allowNull: false,
  },
  subject: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [1, 200],
    },
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      len: [10, 5000],
    },
  },
  status: {
    type: DataTypes.ENUM('open', 'in_progress', 'waiting_customer', 'resolved', 'closed'),
    defaultValue: 'open',
    allowNull: false,
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
    defaultValue: 'medium',
    allowNull: false,
  },
  attachments: {
    type: DataTypes.JSON,
    defaultValue: [],
    comment: 'Array of attachment URLs',
  },
  metadata: {
    type: DataTypes.JSON,
    defaultValue: {},
    comment: 'Additional metadata like browser info, user agent, etc.',
  },
  resolvedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  closedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  responseTime: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Time to first response in minutes',
  },
  resolutionTime: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Total resolution time in minutes',
  },
  satisfaction: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 1,
      max: 5,
    },
    comment: 'Customer satisfaction rating (1-5)',
  },
}, {
  indexes: [
    {
      fields: ['ticket_number'],
      unique: true,
      name: 'idx_ticket_number',
    },
    {
      fields: ['user_id'],
      name: 'idx_ticket_user',
    },
    {
      fields: ['status'],
      name: 'idx_ticket_status',
    },
    {
      fields: ['priority'],
      name: 'idx_ticket_priority',
    },
    {
      fields: ['category'],
      name: 'idx_ticket_category',
    },
    {
      fields: ['created_at'],
      name: 'idx_ticket_created',
    },
    {
      fields: ['status', 'priority', 'created_at'],
      name: 'idx_ticket_admin_filter',
    },
  ],
  hooks: {
    beforeCreate: async (ticket) => {
      // Generate ticket number
      const date = new Date();
      const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
      
      // Get count of tickets created today
      const startOfDay = new Date(date.setHours(0, 0, 0, 0));
      const endOfDay = new Date(date.setHours(23, 59, 59, 999));
      
      const count = await SupportTicket.count({
        where: {
          createdAt: {
            [sequelize.Sequelize.Op.between]: [startOfDay, endOfDay]
          }
        }
      });
      
      const ticketNum = (count + 1).toString().padStart(4, '0');
      ticket.ticketNumber = `TKT-${dateStr}-${ticketNum}`;
    },
    afterUpdate: async (ticket) => {
      // Calculate response and resolution times
      if (ticket.changed('status')) {
        if (ticket.status === 'resolved' && !ticket.resolvedAt) {
          ticket.resolvedAt = new Date();
          ticket.resolutionTime = Math.floor(
            (ticket.resolvedAt - ticket.createdAt) / (1000 * 60)
          );
          await ticket.save({ hooks: false });
        } else if (ticket.status === 'closed' && !ticket.closedAt) {
          ticket.closedAt = new Date();
          await ticket.save({ hooks: false });
        }
      }
    },
  },
});

export default SupportTicket;