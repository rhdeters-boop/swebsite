'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add supportRole to users table
    await queryInterface.addColumn('users', 'support_role', {
      type: Sequelize.ENUM('support_agent', 'support_admin'),
      allowNull: true,
      comment: 'Support team role for accessing admin support interface',
    });

    // Create support_tickets table
    await queryInterface.createTable('support_tickets', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      ticket_number: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
        comment: 'Format: TKT-YYYYMMDD-XXXX',
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      category: {
        type: Sequelize.ENUM(
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
        type: Sequelize.STRING,
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM('open', 'in_progress', 'waiting_customer', 'resolved', 'closed'),
        defaultValue: 'open',
        allowNull: false,
      },
      priority: {
        type: Sequelize.ENUM('low', 'medium', 'high', 'urgent'),
        defaultValue: 'medium',
        allowNull: false,
      },
      attachments: {
        type: Sequelize.JSON,
        defaultValue: [],
        comment: 'Array of attachment URLs',
      },
      metadata: {
        type: Sequelize.JSON,
        defaultValue: {},
        comment: 'Additional metadata like browser info, user agent, etc.',
      },
      resolved_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      closed_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      response_time: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'Time to first response in minutes',
      },
      resolution_time: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'Total resolution time in minutes',
      },
      satisfaction: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'Customer satisfaction rating (1-5)',
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    // Create ticket_responses table
    await queryInterface.createTable('ticket_responses', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      ticket_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'support_tickets',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        comment: 'ID of user who created the response (customer or support agent)',
      },
      message: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      is_internal: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        comment: 'Internal notes not visible to customers',
      },
      attachments: {
        type: Sequelize.JSON,
        defaultValue: [],
        comment: 'Array of attachment URLs',
      },
      metadata: {
        type: Sequelize.JSON,
        defaultValue: {},
        comment: 'Additional metadata like status changes, assignments, etc.',
      },
      email_sent: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        comment: 'Whether email notification was sent for this response',
      },
      email_sent_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    // Create support_teams table
    await queryInterface.createTable('support_teams', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        unique: true,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      department: {
        type: Sequelize.ENUM(
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
        type: Sequelize.JSON,
        defaultValue: [],
        comment: 'Array of specialty areas',
      },
      max_active_tickets: {
        type: Sequelize.INTEGER,
        defaultValue: 20,
        comment: 'Maximum number of active tickets assignable',
      },
      is_available: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        comment: 'Whether agent is available for new assignments',
      },
      last_assigned_at: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Last ticket assignment timestamp for round-robin',
      },
      total_tickets_handled: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      avg_response_time: {
        type: Sequelize.FLOAT,
        defaultValue: 0,
        comment: 'Average response time in minutes',
      },
      avg_resolution_time: {
        type: Sequelize.FLOAT,
        defaultValue: 0,
        comment: 'Average resolution time in minutes',
      },
      avg_satisfaction: {
        type: Sequelize.FLOAT,
        defaultValue: 0,
        comment: 'Average customer satisfaction rating',
      },
      work_schedule: {
        type: Sequelize.JSON,
        defaultValue: {},
        comment: 'Work schedule for shift-based assignment',
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Admin notes about the support agent',
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    // Create ticket_assignments table
    await queryInterface.createTable('ticket_assignments', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      ticket_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'support_tickets',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      assigned_to_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        comment: 'Support agent assigned to the ticket',
      },
      assigned_by_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        comment: 'Admin/agent who made the assignment',
      },
      assignment_type: {
        type: Sequelize.ENUM('manual', 'auto', 'escalation', 'transfer'),
        defaultValue: 'manual',
        allowNull: false,
      },
      previous_assignee_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id',
        },
        comment: 'Previous assignee for transfers',
      },
      reason: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Reason for assignment/transfer',
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        comment: 'Whether this is the current active assignment',
      },
      completed_at: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'When the assignment was completed/transferred',
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    // Create indexes
    await queryInterface.addIndex('support_tickets', ['ticket_number'], {
      unique: true,
      name: 'idx_ticket_number',
    });
    await queryInterface.addIndex('support_tickets', ['user_id'], {
      name: 'idx_ticket_user',
    });
    await queryInterface.addIndex('support_tickets', ['status'], {
      name: 'idx_ticket_status',
    });
    await queryInterface.addIndex('support_tickets', ['priority'], {
      name: 'idx_ticket_priority',
    });
    await queryInterface.addIndex('support_tickets', ['category'], {
      name: 'idx_ticket_category',
    });
    await queryInterface.addIndex('support_tickets', ['created_at'], {
      name: 'idx_ticket_created',
    });
    await queryInterface.addIndex('support_tickets', ['status', 'priority', 'created_at'], {
      name: 'idx_ticket_admin_filter',
    });

    await queryInterface.addIndex('ticket_responses', ['ticket_id'], {
      name: 'idx_response_ticket',
    });
    await queryInterface.addIndex('ticket_responses', ['user_id'], {
      name: 'idx_response_user',
    });
    await queryInterface.addIndex('ticket_responses', ['is_internal'], {
      name: 'idx_response_internal',
    });
    await queryInterface.addIndex('ticket_responses', ['created_at'], {
      name: 'idx_response_created',
    });

    await queryInterface.addIndex('support_teams', ['user_id'], {
      unique: true,
      name: 'idx_support_team_user',
    });
    await queryInterface.addIndex('support_teams', ['department'], {
      name: 'idx_support_team_department',
    });
    await queryInterface.addIndex('support_teams', ['is_available'], {
      name: 'idx_support_team_available',
    });
    await queryInterface.addIndex('support_teams', ['last_assigned_at'], {
      name: 'idx_support_team_last_assigned',
    });

    await queryInterface.addIndex('ticket_assignments', ['ticket_id'], {
      name: 'idx_assignment_ticket',
    });
    await queryInterface.addIndex('ticket_assignments', ['assigned_to_id'], {
      name: 'idx_assignment_assigned_to',
    });
    await queryInterface.addIndex('ticket_assignments', ['is_active'], {
      name: 'idx_assignment_active',
    });
    await queryInterface.addIndex('ticket_assignments', ['ticket_id', 'is_active'], {
      name: 'idx_assignment_ticket_active',
    });
    await queryInterface.addIndex('ticket_assignments', ['assigned_to_id', 'is_active'], {
      name: 'idx_assignment_user_active',
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Drop tables in reverse order of creation
    await queryInterface.dropTable('ticket_assignments');
    await queryInterface.dropTable('support_teams');
    await queryInterface.dropTable('ticket_responses');
    await queryInterface.dropTable('support_tickets');
    
    // Remove supportRole from users table
    await queryInterface.removeColumn('users', 'support_role');
  }
};