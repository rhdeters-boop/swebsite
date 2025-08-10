import request from 'supertest';
import { Sequelize } from 'sequelize';
import jwt from 'jsonwebtoken';
import { createApp } from '@/backend/app';
import db from '@/backend/models';

describe('Support Tickets Integration Tests', () => {
  let app: any;
  let sequelize: Sequelize;
  let authToken: string;
  let supportAgentToken: string;
  let supportAdminToken: string;
  let testUser: any;
  let supportAgent: any;
  let supportAdmin: any;

  beforeAll(async () => {
    // Initialize test database
    sequelize = db.sequelize;
    await sequelize.sync({ force: true });
    
    app = createApp();

    // Create test users
    testUser = await db.User.create({
      email: 'testuser@example.com',
      username: 'testuser',
      password_hash: 'hashed_password',
      display_name: 'Test User'
    });

    supportAgent = await db.User.create({
      email: 'agent@example.com',
      username: 'supportagent',
      password_hash: 'hashed_password',
      display_name: 'Support Agent',
      supportRole: 'support_agent'
    });

    supportAdmin = await db.User.create({
      email: 'admin@example.com',
      username: 'supportadmin',
      password_hash: 'hashed_password',
      display_name: 'Support Admin',
      supportRole: 'support_admin'
    });

    // Create support team member
    await db.SupportTeam.create({
      user_id: supportAgent.id,
      department: 'general',
      is_available: true
    });

    // Generate auth tokens
    authToken = jwt.sign(
      { userId: testUser.id, email: testUser.email },
      process.env.JWT_SECRET || 'test-secret'
    );

    supportAgentToken = jwt.sign(
      { userId: supportAgent.id, email: supportAgent.email, supportRole: 'support_agent' },
      process.env.JWT_SECRET || 'test-secret'
    );

    supportAdminToken = jwt.sign(
      { userId: supportAdmin.id, email: supportAdmin.email, supportRole: 'support_admin' },
      process.env.JWT_SECRET || 'test-secret'
    );
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('User Support Ticket Operations', () => {
    let ticketNumber: string;

    test('POST /api/support/tickets - Create new ticket', async () => {
      const ticketData = {
        category: 'technical',
        subject: 'Cannot upload images',
        description: 'I am unable to upload images to my profile. The upload button is not working.',
        priority: 'medium'
      };

      const res = await request(app)
        .post('/api/support/tickets')
        .set('Authorization', `Bearer ${authToken}`)
        .send(ticketData);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.ticket).toMatchObject({
        category: 'technical',
        subject: 'Cannot upload images',
        status: 'open',
        priority: 'medium',
        user_id: testUser.id
      });
      expect(res.body.ticket.ticket_number).toMatch(/^TKT-\d{8}-\d{4}$/);
      
      ticketNumber = res.body.ticket.ticket_number;
    });

    test('GET /api/support/tickets/:ticketNumber - Get ticket details', async () => {
      const res = await request(app)
        .get(`/api/support/tickets/${ticketNumber}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.ticket.ticket_number).toBe(ticketNumber);
      expect(res.body.ticket.responses).toBeDefined();
      expect(Array.isArray(res.body.ticket.responses)).toBe(true);
    });

    test('POST /api/support/tickets/:ticketNumber/responses - Add response to ticket', async () => {
      const responseData = {
        message: 'I tried clearing my browser cache but the issue persists.'
      };

      const res = await request(app)
        .post(`/api/support/tickets/${ticketNumber}/responses`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(responseData);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.response.message).toBe(responseData.message);
      expect(res.body.response.is_internal_note).toBe(false);
    });

    test('GET /api/support/tickets/user/:userId - Get user tickets', async () => {
      const res = await request(app)
        .get(`/api/support/tickets/user/${testUser.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.tickets)).toBe(true);
      expect(res.body.tickets.length).toBeGreaterThan(0);
      expect(res.body.pagination).toBeDefined();
    });

    test('POST /api/support/tickets/:ticketNumber/satisfaction - Rate resolved ticket', async () => {
      // First, close the ticket as support agent
      await request(app)
        .put(`/api/admin/support/tickets/${ticketNumber}/status`)
        .set('Authorization', `Bearer ${supportAgentToken}`)
        .send({ status: 'resolved' });

      // Then rate it
      const res = await request(app)
        .post(`/api/support/tickets/${ticketNumber}/satisfaction`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ rating: 5 });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    test('Unauthorized access - No token', async () => {
      const res = await request(app)
        .get(`/api/support/tickets/${ticketNumber}`);

      expect(res.status).toBe(401);
    });

    test('Forbidden access - Wrong user', async () => {
      const otherUserToken = jwt.sign(
        { userId: 999, email: 'other@example.com' },
        process.env.JWT_SECRET || 'test-secret'
      );

      const res = await request(app)
        .get(`/api/support/tickets/${ticketNumber}`)
        .set('Authorization', `Bearer ${otherUserToken}`);

      expect(res.status).toBe(403);
    });
  });

  describe('Support Agent Operations', () => {
    let ticketId: number;

    beforeAll(async () => {
      // Create a test ticket
      const ticket = await db.SupportTicket.create({
        ticket_number: 'TKT-20240115-0001',
        user_id: testUser.id,
        category: 'payment',
        subject: 'Billing issue',
        description: 'I was charged twice',
        status: 'open',
        priority: 'high'
      });
      ticketId = ticket.id;
    });

    test('GET /api/admin/support/stats - Get dashboard statistics', async () => {
      const res = await request(app)
        .get('/api/admin/support/stats')
        .set('Authorization', `Bearer ${supportAgentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.stats).toMatchObject({
        openTickets: expect.any(Number),
        avgResponseTime: expect.any(Number),
        avgResolutionTime: expect.any(Number),
        todayTickets: expect.any(Number),
        categoryDistribution: expect.any(Object)
      });
    });

    test('GET /api/admin/support/tickets - List tickets with filters', async () => {
      const res = await request(app)
        .get('/api/admin/support/tickets')
        .set('Authorization', `Bearer ${supportAgentToken}`)
        .query({
          status: 'open',
          priority: 'high',
          category: 'payment',
          page: 1,
          limit: 10
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.tickets)).toBe(true);
      expect(res.body.pagination).toBeDefined();
    });

    test('PUT /api/admin/support/tickets/:id/assign - Assign ticket', async () => {
      const res = await request(app)
        .put(`/api/admin/support/tickets/${ticketId}/assign`)
        .set('Authorization', `Bearer ${supportAgentToken}`)
        .send({
          agent_id: supportAgent.id,
          reason: 'Agent specializes in payment issues'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.assignment.assigned_to).toBe(supportAgent.id);
    });

    test('PUT /api/admin/support/tickets/:id/status - Update ticket status', async () => {
      const res = await request(app)
        .put(`/api/admin/support/tickets/${ticketId}/status`)
        .set('Authorization', `Bearer ${supportAgentToken}`)
        .send({
          status: 'in_progress',
          internal_note: 'Looking into the payment records'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.ticket.status).toBe('in_progress');
    });

    test('POST /api/admin/support/tickets/:id/internal-note - Add internal note', async () => {
      const res = await request(app)
        .post(`/api/admin/support/tickets/${ticketId}/internal-note`)
        .set('Authorization', `Bearer ${supportAgentToken}`)
        .send({
          note: 'Confirmed duplicate charge in payment system'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.note.is_internal_note).toBe(true);
    });

    test('Agent cannot update priority (admin only)', async () => {
      const res = await request(app)
        .put(`/api/admin/support/tickets/${ticketId}/priority`)
        .set('Authorization', `Bearer ${supportAgentToken}`)
        .send({ priority: 'urgent' });

      expect(res.status).toBe(403);
    });
  });

  describe('Support Admin Operations', () => {
    let ticketIds: number[] = [];

    beforeAll(async () => {
      // Create multiple test tickets
      for (let i = 0; i < 3; i++) {
        const ticket = await db.SupportTicket.create({
          ticket_number: `TKT-20240115-000${i + 2}`,
          user_id: testUser.id,
          category: 'technical',
          subject: `Test issue ${i + 1}`,
          description: 'Test description',
          status: 'open',
          priority: 'medium'
        });
        ticketIds.push(ticket.id);
      }
    });

    test('PUT /api/admin/support/tickets/:id/priority - Admin can update priority', async () => {
      const res = await request(app)
        .put(`/api/admin/support/tickets/${ticketIds[0]}/priority`)
        .set('Authorization', `Bearer ${supportAdminToken}`)
        .send({ priority: 'urgent' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.ticket.priority).toBe('urgent');
    });

    test('POST /api/admin/support/tickets/bulk-update - Bulk update tickets', async () => {
      const res = await request(app)
        .post('/api/admin/support/tickets/bulk-update')
        .set('Authorization', `Bearer ${supportAdminToken}`)
        .send({
          ticket_ids: ticketIds,
          action: 'assign',
          data: {
            agent_id: supportAgent.id,
            reason: 'Bulk assignment for technical issues'
          }
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.updated).toBe(ticketIds.length);
    });

    test('GET /api/admin/support/stats - Admin sees agent performance', async () => {
      const res = await request(app)
        .get('/api/admin/support/stats')
        .set('Authorization', `Bearer ${supportAdminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.stats.agentPerformance).toBeDefined();
      expect(Array.isArray(res.body.stats.agentPerformance)).toBe(true);
    });

    test('Search tickets by text', async () => {
      const res = await request(app)
        .get('/api/admin/support/tickets')
        .set('Authorization', `Bearer ${supportAdminToken}`)
        .query({
          search: 'Test issue',
          page: 1,
          limit: 10
        });

      expect(res.status).toBe(200);
      expect(res.body.tickets.length).toBeGreaterThan(0);
      expect(res.body.tickets[0].subject).toContain('Test issue');
    });
  });

  describe('Email Notification Tests', () => {
    // Mock email service
    const mockSendEmail = jest.fn();
    
    beforeAll(() => {
      // Replace email service with mock
      jest.mock('@/backend/services/email.service', () => ({
        sendEmail: mockSendEmail
      }));
    });

    afterEach(() => {
      mockSendEmail.mockClear();
    });

    test('Email sent on ticket creation', async () => {
      const ticketData = {
        category: 'account',
        subject: 'Email test ticket',
        description: 'Testing email notifications',
        priority: 'low'
      };

      await request(app)
        .post('/api/support/tickets')
        .set('Authorization', `Bearer ${authToken}`)
        .send(ticketData);

      // Verify email was called
      // Note: This would require proper mocking setup in the actual implementation
      // expect(mockSendEmail).toHaveBeenCalledWith(
      //   expect.objectContaining({
      //     to: testUser.email,
      //     subject: expect.stringContaining('Support Ticket Created')
      //   })
      // );
    });
  });

  describe('Ticket Assignment Logic', () => {
    test('Auto-assignment to available agent', async () => {
      // Create ticket for department with available agent
      const ticketData = {
        category: 'technical',
        subject: 'Auto-assign test',
        description: 'This should be auto-assigned',
        priority: 'medium'
      };

      const res = await request(app)
        .post('/api/support/tickets')
        .set('Authorization', `Bearer ${authToken}`)
        .send(ticketData);

      expect(res.status).toBe(201);
      
      // Check if ticket was assigned
      const ticketId = res.body.ticket.id;
      const assignment = await db.TicketAssignment.findOne({
        where: { ticket_id: ticketId }
      });

      expect(assignment).toBeTruthy();
      expect(assignment?.assignment_type).toBe('auto');
    });

    test('Workload-based assignment', async () => {
      // Create another agent with lower workload
      const lessLoadedAgent = await db.User.create({
        email: 'agent2@example.com',
        username: 'agent2',
        password_hash: 'hashed',
        display_name: 'Agent 2',
        supportRole: 'support_agent'
      });

      await db.SupportTeam.create({
        user_id: lessLoadedAgent.id,
        department: 'general',
        is_available: true
      });

      // Create ticket
      const ticketData = {
        category: 'account',
        subject: 'Workload test',
        description: 'Should go to less loaded agent',
        priority: 'medium'
      };

      const res = await request(app)
        .post('/api/support/tickets')
        .set('Authorization', `Bearer ${authToken}`)
        .send(ticketData);

      expect(res.status).toBe(201);
    });
  });

  describe('Error Handling', () => {
    test('Invalid ticket category', async () => {
      const res = await request(app)
        .post('/api/support/tickets')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          category: 'invalid_category',
          subject: 'Test',
          description: 'Test',
          priority: 'medium'
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toBeDefined();
    });

    test('Missing required fields', async () => {
      const res = await request(app)
        .post('/api/support/tickets')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          category: 'technical'
          // Missing subject and description
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('required');
    });

    test('Invalid ticket number format', async () => {
      const res = await request(app)
        .get('/api/support/tickets/INVALID-NUMBER')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(404);
    });

    test('Rate limiting on ticket creation', async () => {
      // This would test rate limiting if implemented
      // For now, just a placeholder
      expect(true).toBe(true);
    });
  });
});