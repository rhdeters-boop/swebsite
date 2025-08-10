import express from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { authenticate, requireRole } from '../../middleware/auth.js';
import { 
  SupportTicket, 
  TicketResponse, 
  User, 
  TicketAssignment, 
  SupportTeam 
} from '../../models/index.js';
import { Op } from 'sequelize';
import sequelize from '../../config/database.js';

const router = express.Router();

// Middleware to ensure user is support staff
const requireSupport = requireRole(['support_agent', 'support_admin']);

// Validation middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Get support dashboard statistics
router.get('/stats',
  authenticate,
  requireSupport,
  async (req, res) => {
    try {
      const now = new Date();
      const startOfDay = new Date(now.setHours(0, 0, 0, 0));
      const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      // Get ticket statistics
      const [
        totalOpen,
        totalToday,
        totalWeek,
        avgResponseTime,
        avgResolutionTime,
        satisfactionStats,
      ] = await Promise.all([
        // Open tickets count
        SupportTicket.count({
          where: { status: { [Op.in]: ['open', 'in_progress', 'waiting_customer'] } }
        }),
        // Tickets created today
        SupportTicket.count({
          where: { createdAt: { [Op.gte]: startOfDay } }
        }),
        // Tickets created this week
        SupportTicket.count({
          where: { createdAt: { [Op.gte]: startOfWeek } }
        }),
        // Average response time
        SupportTicket.aggregate('responseTime', 'avg', {
          where: { responseTime: { [Op.ne]: null } }
        }),
        // Average resolution time
        SupportTicket.aggregate('resolutionTime', 'avg', {
          where: { resolutionTime: { [Op.ne]: null } }
        }),
        // Satisfaction ratings
        SupportTicket.findAll({
          attributes: [
            [sequelize.fn('AVG', sequelize.col('satisfaction')), 'avgSatisfaction'],
            [sequelize.fn('COUNT', sequelize.col('satisfaction')), 'totalRatings']
          ],
          where: { satisfaction: { [Op.ne]: null } },
          raw: true,
        }),
      ]);

      // Get category distribution
      const categoryDistribution = await SupportTicket.findAll({
        attributes: [
          'category',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        where: { createdAt: { [Op.gte]: startOfMonth } },
        group: ['category'],
        raw: true,
      });

      // Get agent statistics if user is admin
      let agentStats = null;
      if (req.user.supportRole === 'support_admin') {
        agentStats = await SupportTeam.findAll({
          include: [{
            model: User,
            as: 'user',
            attributes: ['id', 'username', 'displayName'],
          }],
          attributes: [
            'totalTicketsHandled',
            'avgResponseTime',
            'avgResolutionTime',
            'avgSatisfaction',
            'isAvailable',
          ],
        });
      }

      res.json({
        overview: {
          openTickets: totalOpen,
          ticketsToday: totalToday,
          ticketsThisWeek: totalWeek,
          avgResponseTime: Math.round(avgResponseTime || 0),
          avgResolutionTime: Math.round(avgResolutionTime || 0),
          avgSatisfaction: parseFloat((satisfactionStats[0]?.avgSatisfaction || 0).toFixed(2)),
          totalRatings: satisfactionStats[0]?.totalRatings || 0,
        },
        categoryDistribution,
        agentStats,
      });
    } catch (error) {
      console.error('Error fetching support stats:', error);
      res.status(500).json({ message: 'Failed to fetch statistics' });
    }
  }
);

// List all tickets with advanced filtering
router.get('/tickets',
  authenticate,
  requireSupport,
  [
    query('status').optional().isIn(['open', 'in_progress', 'waiting_customer', 'resolved', 'closed']),
    query('priority').optional().isIn(['low', 'medium', 'high', 'urgent']),
    query('category').optional().isIn(['account', 'technical', 'payment', 'content', 'trust_safety', 'feature_request', 'bug_report', 'other']),
    query('assignedTo').optional().isUUID(),
    query('search').optional().isString(),
    query('dateFrom').optional().isISO8601(),
    query('dateTo').optional().isISO8601(),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('sortBy').optional().isIn(['createdAt', 'updatedAt', 'priority', 'status']),
    query('sortOrder').optional().isIn(['ASC', 'DESC']),
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const {
        status,
        priority,
        category,
        assignedTo,
        search,
        dateFrom,
        dateTo,
        page = 1,
        limit = 50,
        sortBy = 'createdAt',
        sortOrder = 'DESC',
      } = req.query;

      // Build where clause
      const whereClause = {};
      if (status) whereClause.status = status;
      if (priority) whereClause.priority = priority;
      if (category) whereClause.category = category;
      if (dateFrom || dateTo) {
        whereClause.createdAt = {};
        if (dateFrom) whereClause.createdAt[Op.gte] = new Date(dateFrom);
        if (dateTo) whereClause.createdAt[Op.lte] = new Date(dateTo);
      }
      if (search) {
        whereClause[Op.or] = [
          { ticketNumber: { [Op.like]: `%${search}%` } },
          { subject: { [Op.like]: `%${search}%` } },
          { description: { [Op.like]: `%${search}%` } },
          { '$user.email$': { [Op.like]: `%${search}%` } },
        ];
      }

      // Build include clause
      const includeClause = [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'displayName', 'email'],
        },
        {
          model: TicketAssignment,
          as: 'currentAssignment',
          where: assignedTo ? { assignedToId: assignedTo } : undefined,
          required: !!assignedTo,
          include: [{
            model: User,
            as: 'assignedTo',
            attributes: ['id', 'username', 'displayName'],
          }],
        },
        {
          model: TicketResponse,
          as: 'responses',
          attributes: ['id', 'createdAt'],
          required: false,
        },
      ];

      const offset = (page - 1) * limit;

      const { count, rows: tickets } = await SupportTicket.findAndCountAll({
        where: whereClause,
        include: includeClause,
        order: [[sortBy, sortOrder]],
        limit,
        offset,
        distinct: true,
      });

      res.json({
        tickets,
        pagination: {
          total: count,
          page,
          limit,
          pages: Math.ceil(count / limit),
        },
      });
    } catch (error) {
      console.error('Error fetching tickets:', error);
      res.status(500).json({ message: 'Failed to fetch tickets' });
    }
  }
);

// Assign ticket to agent
router.put('/tickets/:id/assign',
  authenticate,
  requireSupport,
  [
    param('id').isUUID(),
    body('assignedToId').isUUID(),
    body('reason').optional().isString(),
  ],
  handleValidationErrors,
  async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
      const ticket = await SupportTicket.findByPk(req.params.id, { transaction });
      
      if (!ticket) {
        await transaction.rollback();
        return res.status(404).json({ message: 'Ticket not found' });
      }

      const { assignedToId, reason } = req.body;

      // Check if assignee is a support team member
      const supportMember = await SupportTeam.findOne({
        where: { userId: assignedToId },
        transaction,
      });

      if (!supportMember) {
        await transaction.rollback();
        return res.status(400).json({ message: 'Assignee is not a support team member' });
      }

      // Get current assignment to set as previous
      const currentAssignment = await TicketAssignment.findOne({
        where: { ticketId: ticket.id, isActive: true },
        transaction,
      });

      // Create new assignment
      await TicketAssignment.create({
        ticketId: ticket.id,
        assignedToId,
        assignedById: req.user.id,
        assignmentType: 'manual',
        previousAssigneeId: currentAssignment?.assignedToId,
        reason: reason || `Manually assigned by ${req.user.username}`,
      }, { transaction });

      // Update support member's last assigned timestamp
      await supportMember.update({ lastAssignedAt: new Date() }, { transaction });

      await transaction.commit();

      res.json({ message: 'Ticket assigned successfully' });
    } catch (error) {
      await transaction.rollback();
      console.error('Error assigning ticket:', error);
      res.status(500).json({ message: 'Failed to assign ticket' });
    }
  }
);

// Update ticket status
router.put('/tickets/:id/status',
  authenticate,
  requireSupport,
  [
    param('id').isUUID(),
    body('status').isIn(['open', 'in_progress', 'waiting_customer', 'resolved', 'closed']),
    body('internalNote').optional().isString(),
  ],
  handleValidationErrors,
  async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
      const ticket = await SupportTicket.findByPk(req.params.id, { transaction });
      
      if (!ticket) {
        await transaction.rollback();
        return res.status(404).json({ message: 'Ticket not found' });
      }

      const { status, internalNote } = req.body;
      const previousStatus = ticket.status;

      // Update ticket status
      await ticket.update({ status }, { transaction });

      // Create internal note if provided
      if (internalNote) {
        await TicketResponse.create({
          ticketId: ticket.id,
          userId: req.user.id,
          message: `Status changed from ${previousStatus} to ${status}. ${internalNote}`,
          isInternal: true,
          metadata: {
            statusChange: {
              from: previousStatus,
              to: status,
            },
          },
        }, { transaction });
      }

      await transaction.commit();

      res.json({ 
        message: 'Ticket status updated successfully',
        previousStatus,
        newStatus: status,
      });
    } catch (error) {
      await transaction.rollback();
      console.error('Error updating ticket status:', error);
      res.status(500).json({ message: 'Failed to update ticket status' });
    }
  }
);

// Update ticket priority
router.put('/tickets/:id/priority',
  authenticate,
  requireRole(['support_admin']), // Only admins can change priority
  [
    param('id').isUUID(),
    body('priority').isIn(['low', 'medium', 'high', 'urgent']),
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const ticket = await SupportTicket.findByPk(req.params.id);
      
      if (!ticket) {
        return res.status(404).json({ message: 'Ticket not found' });
      }

      const previousPriority = ticket.priority;
      await ticket.update({ priority: req.body.priority });

      res.json({ 
        message: 'Ticket priority updated successfully',
        previousPriority,
        newPriority: req.body.priority,
      });
    } catch (error) {
      console.error('Error updating ticket priority:', error);
      res.status(500).json({ message: 'Failed to update ticket priority' });
    }
  }
);

// Add internal note
router.post('/tickets/:id/internal-note',
  authenticate,
  requireSupport,
  [
    param('id').isUUID(),
    body('message').trim().isLength({ min: 1, max: 5000 }),
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const ticket = await SupportTicket.findByPk(req.params.id);
      
      if (!ticket) {
        return res.status(404).json({ message: 'Ticket not found' });
      }

      const note = await TicketResponse.create({
        ticketId: ticket.id,
        userId: req.user.id,
        message: req.body.message,
        isInternal: true,
        metadata: {
          type: 'internal_note',
        },
      });

      const completeNote = await TicketResponse.findByPk(note.id, {
        include: [{
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'displayName', 'profilePicture', 'supportRole'],
        }],
      });

      res.status(201).json({
        message: 'Internal note added successfully',
        note: completeNote,
      });
    } catch (error) {
      console.error('Error adding internal note:', error);
      res.status(500).json({ message: 'Failed to add internal note' });
    }
  }
);

// Get canned responses (placeholder for future implementation)
router.get('/canned-responses',
  authenticate,
  requireSupport,
  async (req, res) => {
    // TODO: Implement canned responses table and logic
    res.json({
      responses: [
        {
          id: '1',
          title: 'Account Verification',
          message: 'Thank you for contacting support. To verify your account, please provide...',
          category: 'account',
        },
        {
          id: '2',
          title: 'Payment Issue',
          message: 'We understand you\'re experiencing payment issues. To assist you better...',
          category: 'payment',
        },
        {
          id: '3',
          title: 'Technical Troubleshooting',
          message: 'I\'m sorry to hear you\'re having technical difficulties. Let\'s try...',
          category: 'technical',
        },
      ],
    });
  }
);

// Bulk update tickets
router.post('/tickets/bulk-update',
  authenticate,
  requireSupport,
  [
    body('ticketIds').isArray().notEmpty(),
    body('ticketIds.*').isUUID(),
    body('action').isIn(['assign', 'status', 'priority']),
    body('value').notEmpty(),
  ],
  handleValidationErrors,
  async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
      const { ticketIds, action, value } = req.body;

      switch (action) {
        case 'assign':
          // Bulk assign tickets
          for (const ticketId of ticketIds) {
            await TicketAssignment.create({
              ticketId,
              assignedToId: value,
              assignedById: req.user.id,
              assignmentType: 'manual',
              reason: `Bulk assignment by ${req.user.username}`,
            }, { transaction });
          }
          break;

        case 'status':
          // Bulk update status
          await SupportTicket.update(
            { status: value },
            { 
              where: { id: ticketIds },
              transaction,
            }
          );
          break;

        case 'priority':
          // Bulk update priority (admin only)
          if (req.user.supportRole !== 'support_admin') {
            await transaction.rollback();
            return res.status(403).json({ message: 'Only admins can bulk update priority' });
          }
          await SupportTicket.update(
            { priority: value },
            { 
              where: { id: ticketIds },
              transaction,
            }
          );
          break;
      }

      await transaction.commit();

      res.json({ 
        message: `Successfully updated ${ticketIds.length} tickets`,
        action,
        value,
      });
    } catch (error) {
      await transaction.rollback();
      console.error('Error bulk updating tickets:', error);
      res.status(500).json({ message: 'Failed to bulk update tickets' });
    }
  }
);

export default router;