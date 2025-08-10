import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const TicketAssignment = sequelize.define('TicketAssignment', {
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
  assignedToId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
    comment: 'Support agent assigned to the ticket',
  },
  assignedById: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
    comment: 'Admin/agent who made the assignment',
  },
  assignmentType: {
    type: DataTypes.ENUM('manual', 'auto', 'escalation', 'transfer'),
    defaultValue: 'manual',
    allowNull: false,
  },
  previousAssigneeId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id',
    },
    comment: 'Previous assignee for transfers',
  },
  reason: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Reason for assignment/transfer',
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Whether this is the current active assignment',
  },
  completedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'When the assignment was completed/transferred',
  },
}, {
  indexes: [
    {
      fields: ['ticket_id'],
      name: 'idx_assignment_ticket',
    },
    {
      fields: ['assigned_to_id'],
      name: 'idx_assignment_assigned_to',
    },
    {
      fields: ['is_active'],
      name: 'idx_assignment_active',
    },
    {
      fields: ['ticket_id', 'is_active'],
      name: 'idx_assignment_ticket_active',
    },
    {
      fields: ['assigned_to_id', 'is_active'],
      name: 'idx_assignment_user_active',
    },
  ],
  hooks: {
    beforeCreate: async (assignment) => {
      // Deactivate previous assignments for this ticket
      await TicketAssignment.update(
        { isActive: false, completedAt: new Date() },
        { 
          where: { 
            ticketId: assignment.ticketId,
            isActive: true 
          },
          hooks: false
        }
      );
    },
    afterCreate: async (assignment) => {
      // Update SupportTeam stats
      const supportTeam = await sequelize.models.SupportTeam.findOne({
        where: { userId: assignment.assignedToId }
      });
      
      if (supportTeam) {
        await supportTeam.update({
          lastAssignedAt: new Date()
        });
      }
    },
  },
});

export default TicketAssignment;