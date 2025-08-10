import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const TicketResponse = sequelize.define('TicketResponse', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  ticketId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'support_tickets',
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
    comment: 'ID of user who created the response (customer or support agent)',
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      len: [1, 5000],
    },
  },
  isInternal: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Internal notes not visible to customers',
  },
  attachments: {
    type: DataTypes.JSON,
    defaultValue: [],
    comment: 'Array of attachment URLs',
  },
  metadata: {
    type: DataTypes.JSON,
    defaultValue: {},
    comment: 'Additional metadata like status changes, assignments, etc.',
  },
  emailSent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Whether email notification was sent for this response',
  },
  emailSentAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  indexes: [
    {
      fields: ['ticket_id'],
      name: 'idx_response_ticket',
    },
    {
      fields: ['user_id'],
      name: 'idx_response_user',
    },
    {
      fields: ['is_internal'],
      name: 'idx_response_internal',
    },
    {
      fields: ['created_at'],
      name: 'idx_response_created',
    },
  ],
  hooks: {
    afterCreate: async (response) => {
      // Update response time on first agent response
      if (!response.isInternal) {
        const ticket = await response.getTicket();
        const user = await response.getUser();
        
        // If this is the first response from a support agent
        if (user.supportRole && !ticket.responseTime) {
          const responseTime = Math.floor(
            (response.createdAt - ticket.createdAt) / (1000 * 60)
          );
          await ticket.update({ responseTime }, { hooks: false });
        }
      }
    },
  },
});

export default TicketResponse;