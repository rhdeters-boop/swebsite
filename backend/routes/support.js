import express from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { authenticate } from '../middleware/auth.js';
import { SupportTicket, TicketResponse, User, TicketAssignment, SupportTeam } from '../models/index.js';
import { sendEmail } from '../services/emailService.js';
import { Op } from 'sequelize';
import sequelize from '../config/database.js';

const router = express.Router();

// Validation middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Create a new support ticket
router.post('/tickets',
  authenticate,
  [
    body('category').isIn(['account', 'technical', 'payment', 'content', 'trust_safety', 'feature_request', 'bug_report', 'other']),
    body('subject').trim().isLength({ min: 1, max: 200 }).withMessage('Subject is required and must be less than 200 characters'),
    body('description').trim().isLength({ min: 10, max: 5000 }).withMessage('Description must be between 10 and 5000 characters'),
    body('attachments').optional().isArray().withMessage('Attachments must be an array'),
  ],
  handleValidationErrors,
  async (req, res) => {
    const transaction = await sequelize.transaction();
    
    try {
      const { category, subject, description, attachments = [] } = req.body;
      const user = await User.findByPk(req.user.id);
      
      // Create the ticket
      const ticket = await SupportTicket.create({
        userId: req.user.id,
        name: user.displayName || user.username || 'User',
        email: user.email,
        category,
        subject,
        description,
        attachments,
        metadata: {
          userAgent: req.get('user-agent'),
          ip: req.ip,
          createdVia: 'web',
        },
      }, { transaction });

      // Auto-assign to available support agent if enabled
      const availableAgent = await SupportTeam.findOne({
        where: {
          isAvailable: true,
          department: category === 'technical' ? 'technical' : 
                     category === 'payment' ? 'billing' :
                     category === 'trust_safety' ? 'trust_safety' : 'general',
        },
        include: [{
          model: User,
          as: 'user',
          where: { supportRole: { [Op.ne]: null } }
        }],
        order: [['lastAssignedAt', 'ASC']],
        transaction,
      });

      if (availableAgent) {
        await TicketAssignment.create({
          ticketId: ticket.id,
          assignedToId: availableAgent.userId,
          assignedById: availableAgent.userId, // Auto-assignment
          assignmentType: 'auto',
          reason: 'Automatic assignment based on availability and department',
        }, { transaction });
      }

      // Send confirmation email
      try {
        await sendEmail({
          to: user.email,
          subject: `Support Ticket Created: ${ticket.ticketNumber}`,
          template: 'ticket-created',
          data: {
            userName: user.displayName || user.username,
            ticketNumber: ticket.ticketNumber,
            subject: ticket.subject,
            category: ticket.category,
          },
        });
      } catch (emailError) {
        console.error('Failed to send ticket confirmation email:', emailError);
        // Don't fail the request if email fails
      }

      await transaction.commit();

      res.status(201).json({
        message: 'Support ticket created successfully',
        ticket: {
          id: ticket.id,
          ticketNumber: ticket.ticketNumber,
          status: ticket.status,
          category: ticket.category,
          subject: ticket.subject,
          createdAt: ticket.createdAt,
        },
      });
    } catch (error) {
      await transaction.rollback();
      console.error('Error creating support ticket:', error);
      res.status(500).json({ message: 'Failed to create support ticket' });
    }
  }
);

// Get ticket details
router.get('/tickets/:ticketNumber',
  authenticate,
  param('ticketNumber').matches(/^TKT-\d{8}-\d{4}$/),
  handleValidationErrors,
  async (req, res) => {
    try {
      const ticket = await SupportTicket.findOne({
        where: { ticketNumber: req.params.ticketNumber },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'username', 'displayName', 'profilePicture'],
          },
          {
            model: TicketResponse,
            as: 'responses',
            where: {
              isInternal: false, // Don't show internal notes to customers
            },
            required: false,
            include: [{
              model: User,
              as: 'user',
              attributes: ['id', 'username', 'displayName', 'profilePicture', 'supportRole'],
            }],
            order: [['createdAt', 'ASC']],
          },
          {
            model: TicketAssignment,
            as: 'currentAssignment',
            include: [{
              model: User,
              as: 'assignedTo',
              attributes: ['id', 'username', 'displayName', 'supportRole'],
            }],
          },
        ],
      });

      if (!ticket) {
        return res.status(404).json({ message: 'Ticket not found' });
      }

      // Check if user has access to this ticket
      if (ticket.userId !== req.user.id && !req.user.supportRole) {
        return res.status(403).json({ message: 'Access denied' });
      }

      res.json({ ticket });
    } catch (error) {
      console.error('Error fetching ticket:', error);
      res.status(500).json({ message: 'Failed to fetch ticket' });
    }
  }
);

// Add response to ticket
router.post('/tickets/:ticketNumber/responses',
  authenticate,
  [
    param('ticketNumber').matches(/^TKT-\d{8}-\d{4}$/),
    body('message').trim().isLength({ min: 1, max: 5000 }).withMessage('Message must be between 1 and 5000 characters'),
    body('attachments').optional().isArray().withMessage('Attachments must be an array'),
  ],
  handleValidationErrors,
  async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
      const ticket = await SupportTicket.findOne({
        where: { ticketNumber: req.params.ticketNumber },
        include: [{
          model: User,
          as: 'user',
        }],
        transaction,
      });

      if (!ticket) {
        await transaction.rollback();
        return res.status(404).json({ message: 'Ticket not found' });
      }

      // Check if user has access to this ticket
      if (ticket.userId !== req.user.id && !req.user.supportRole) {
        await transaction.rollback();
        return res.status(403).json({ message: 'Access denied' });
      }

      const { message, attachments = [] } = req.body;

      // Create the response
      const response = await TicketResponse.create({
        ticketId: ticket.id,
        userId: req.user.id,
        message,
        attachments,
        isInternal: false,
        metadata: {
          userAgent: req.get('user-agent'),
          ip: req.ip,
        },
      }, { transaction });

      // Update ticket status if needed
      if (req.user.supportRole && ticket.status === 'open') {
        await ticket.update({ status: 'in_progress' }, { transaction });
      } else if (!req.user.supportRole && ticket.status === 'waiting_customer') {
        await ticket.update({ status: 'in_progress' }, { transaction });
      }

      // Send email notification
      const isCustomerResponse = ticket.userId === req.user.id;
      const recipientEmail = isCustomerResponse ? 
        // Find assigned agent's email
        (await TicketAssignment.findOne({
          where: { ticketId: ticket.id, isActive: true },
          include: [{ model: User, as: 'assignedTo' }],
          transaction,
        }))?.assignedTo?.email :
        // Send to customer
        ticket.user.email;

      if (recipientEmail) {
        try {
          await sendEmail({
            to: recipientEmail,
            subject: `New response on ticket ${ticket.ticketNumber}`,
            template: 'ticket-response',
            data: {
              ticketNumber: ticket.ticketNumber,
              subject: ticket.subject,
              message: message.substring(0, 200) + (message.length > 200 ? '...' : ''),
              isCustomerResponse,
            },
          });
          await response.update({ emailSent: true, emailSentAt: new Date() }, { transaction });
        } catch (emailError) {
          console.error('Failed to send response notification email:', emailError);
        }
      }

      await transaction.commit();

      // Fetch the complete response with user info
      const completeResponse = await TicketResponse.findByPk(response.id, {
        include: [{
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'displayName', 'profilePicture', 'supportRole'],
        }],
      });

      res.status(201).json({
        message: 'Response added successfully',
        response: completeResponse,
      });
    } catch (error) {
      await transaction.rollback();
      console.error('Error adding response:', error);
      res.status(500).json({ message: 'Failed to add response' });
    }
  }
);

// Get user's tickets
router.get('/tickets/user/:userId',
  authenticate,
  [
    param('userId').isUUID(),
    query('status').optional().isIn(['open', 'in_progress', 'waiting_customer', 'resolved', 'closed']),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 50 }),
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      // Check if user is accessing their own tickets or is support staff
      if (req.params.userId !== req.user.id && !req.user.supportRole) {
        return res.status(403).json({ message: 'Access denied' });
      }

      const { status, page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;

      const whereClause = { userId: req.params.userId };
      if (status) {
        whereClause.status = status;
      }

      const { count, rows: tickets } = await SupportTicket.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: TicketResponse,
            as: 'responses',
            attributes: ['id'],
            where: { isInternal: false },
            required: false,
          },
          {
            model: TicketAssignment,
            as: 'currentAssignment',
            include: [{
              model: User,
              as: 'assignedTo',
              attributes: ['id', 'username', 'displayName'],
            }],
          },
        ],
        order: [['createdAt', 'DESC']],
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
      console.error('Error fetching user tickets:', error);
      res.status(500).json({ message: 'Failed to fetch tickets' });
    }
  }
);

// Rate ticket satisfaction (only for resolved/closed tickets)
router.post('/tickets/:ticketNumber/satisfaction',
  authenticate,
  [
    param('ticketNumber').matches(/^TKT-\d{8}-\d{4}$/),
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const ticket = await SupportTicket.findOne({
        where: { ticketNumber: req.params.ticketNumber },
      });

      if (!ticket) {
        return res.status(404).json({ message: 'Ticket not found' });
      }

      // Check if user owns this ticket
      if (ticket.userId !== req.user.id) {
        return res.status(403).json({ message: 'Access denied' });
      }

      // Check if ticket is resolved or closed
      if (!['resolved', 'closed'].includes(ticket.status)) {
        return res.status(400).json({ message: 'Can only rate resolved or closed tickets' });
      }

      // Check if already rated
      if (ticket.satisfaction) {
        return res.status(400).json({ message: 'Ticket has already been rated' });
      }

      await ticket.update({ satisfaction: req.body.rating });

      res.json({
        message: 'Thank you for your feedback',
        rating: req.body.rating,
      });
    } catch (error) {
      console.error('Error rating ticket:', error);
      res.status(500).json({ message: 'Failed to submit rating' });
    }
  }
);

export default router;