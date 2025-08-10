import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const SupportTeam = sequelize.define('SupportTeam', {
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
    onDelete: 'CASCADE',
  },
  department: {
    type: DataTypes.ENUM(
      'general',
      'technical',
      'billing',
      'trust_safety',
      'content',
      'vip'
    ),
    defaultValue: 'general',
    allowNull: false,
  },
  specialties: {
    type: DataTypes.JSON,
    defaultValue: [],
    comment: 'Array of specialty areas',
  },
  maxActiveTickets: {
    type: DataTypes.INTEGER,
    defaultValue: 20,
    validate: {
      min: 1,
      max: 100,
    },
    comment: 'Maximum number of active tickets assignable',
  },
  isAvailable: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Whether agent is available for new assignments',
  },
  lastAssignedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Last ticket assignment timestamp for round-robin',
  },
  totalTicketsHandled: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  avgResponseTime: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
    comment: 'Average response time in minutes',
  },
  avgResolutionTime: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
    comment: 'Average resolution time in minutes',
  },
  avgSatisfaction: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
    comment: 'Average customer satisfaction rating',
  },
  workSchedule: {
    type: DataTypes.JSON,
    defaultValue: {},
    comment: 'Work schedule for shift-based assignment',
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Admin notes about the support agent',
  },
}, {
  indexes: [
    {
      fields: ['user_id'],
      unique: true,
      name: 'idx_support_team_user',
    },
    {
      fields: ['department'],
      name: 'idx_support_team_department',
    },
    {
      fields: ['is_available'],
      name: 'idx_support_team_available',
    },
    {
      fields: ['last_assigned_at'],
      name: 'idx_support_team_last_assigned',
    },
  ],
});

export default SupportTeam;