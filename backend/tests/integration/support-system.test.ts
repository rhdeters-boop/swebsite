import request from 'supertest';
import { Sequelize } from 'sequelize';
import jwt from 'jsonwebtoken';
import { createApp } from '@/backend/app';
import db from '@/backend/models';

// Helper to create auth token
const createAuthToken = (user: any, supportRole?: string) => {
  const payload: any = {
    userId: user.id,
    email: user.email,
    username: user.username
  };
  if (supportRole) {
    payload.supportRole = supportRole;
  }
  return jwt.sign(payload, process.env.JWT_SECRET || 'test-secret');
};

describe('Support System Integration Tests', () => {
  let app: any;
  let sequelize: Sequelize;
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
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('End-to-End Support Ticket Flow', () => {
    let ticketNumber: string;
    let ticketId: number;

    test('User creates a support ticket', async () => {
      const authToken = createAuthToken(testUser);
      
      const res = await request(app)
        .post('/api/support/tickets')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          category: 'technical',
          subject: 'Integration Test - Cannot upload images',
          description: 'When I try to upload images, the button does not respond.',
          priority: 'medium'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.ticket).toMatchObject({
        category: 'technical',
        subject: 'Integration Test - Cannot upload images',
        status: 'open',
        priority: 'medium',
        user_id: testUser.id
      });
      expect(res.body.ticket.ticket_number).toMatch(/^TKT-\d{8}-\d{4}$/);
      
      ticketNumber = res.body.ticket.ticket_number;
      ticketId = res.body.ticket.id;

      // Verify auto-assignment
      const assignment = await db.TicketAssignment.findOne({
        where: { ticket_id: ticketId }
      });
      expect(assignment).toBeTruthy();
      expect(assignment?.assignment_type).toBe('auto');
    });

    test('User views their ticket', async () => {
      const authToken = createAuthToken(testUser);
      
      const res = await request(app)
        .get(`/api/support/tickets/${ticketNumber}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.ticket.ticket_number).toBe(ticketNumber);
      expect(res.body.ticket.responses).toBeDefined();
      expect(Array.isArray(res.body.ticket.responses)).toBe(true);
    });

    test('Support agent responds to ticket', async () => {
      const agentToken = createAuthToken(supportAgent, 'support_agent');
      
      // First, agent views the ticket
      const viewRes = await request(app)
        .get(`/api/admin/support/tickets?search=${ticketNumber}`)
        .set('Authorization', `Bearer ${agentToken}`);

      expect(viewRes.status).toBe(200);
      expect(viewRes.body.tickets.length).toBeGreaterThan(0);

      // Agent adds a response
      const responseRes = await request(app)
        .post(`/api/support/tickets/${ticketNumber}/responses`)
        .set('Authorization', `Bearer ${agentToken}`)
        .send({
          message: 'Thank you for reporting this issue. Can you please tell me which browser you are using?'
        });

      expect(responseRes.status).toBe(201);
      expect(responseRes.body.success).toBe(true);
      expect(responseRes.body.response.user_id).toBe(supportAgent.id);

      // Update ticket status
      const statusRes = await request(app)
        .put(`/api/admin/support/tickets/${ticketId}/status`)
        .set('Authorization', `Bearer ${agentToken}`)
        .send({
          status: 'in_progress',
          internal_note: 'Investigating upload issue'
        });

      expect(statusRes.status).toBe(200);
      expect(statusRes.body.ticket.status).toBe('in_progress');
    });

    test('User responds back', async () => {
      const authToken = createAuthToken(testUser);
      
      const res = await request(app)
        .post(`/api/support/tickets/${ticketNumber}/responses`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          message: 'I am using Chrome version 120 on Windows 11.'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.response.user_id).toBe(testUser.id);
    });

    test('Agent adds internal note', async () => {
      const agentToken = createAuthToken(supportAgent, 'support_agent');
      
      const res = await request(app)
        .post(`/api/admin/support/tickets/${ticketId}/internal-note`)
        .set('Authorization', `Bearer ${agentToken}`)
        .send({
          note: 'This seems to be related to the recent Chrome update. Check if other users report similar issues.'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.note.is_internal_note).toBe(true);
    });

    test('Agent resolves ticket', async () => {
      const agentToken = createAuthToken(supportAgent, 'support_agent');
      
      // Add resolution response
      await request(app)
        .post(`/api/support/tickets/${ticketNumber}/responses`)
        .set('Authorization', `Bearer ${agentToken}`)
        .send({
          message: 'The issue has been fixed. Please clear your browser cache and try again.'
        });

      // Mark as resolved
      const res = await request(app)
        .put(`/api/admin/support/tickets/${ticketId}/status`)
        .set('Authorization', `Bearer ${agentToken}`)
        .send({
          status: 'resolved'
        });

      expect(res.status).toBe(200);
      expect(res.body.ticket.status).toBe('resolved');
    });

    test('User rates the support experience', async () => {
      const authToken = createAuthToken(testUser);
      
      const res = await request(app)
        .post(`/api/support/tickets/${ticketNumber}/satisfaction`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ rating: 5 });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // Verify rating was saved
      const ticket = await db.SupportTicket.findByPk(ticketId);
      expect(ticket?.satisfaction_rating).toBe(5);
    });

    test('User views all their tickets', async () => {
      const authToken = createAuthToken(testUser);
      
      const res = await request(app)
        .get(`/api/support/tickets/user/${testUser.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.tickets)).toBe(true);
      expect(res.body.tickets.length).toBeGreaterThan(0);
      
      const ticket = res.body.tickets.find((t: any) => t.ticket_number === ticketNumber);
      expect(ticket).toBeDefined();
      expect(ticket.status).toBe('resolved');
      expect(ticket.satisfaction_rating).toBe(5);
    });
  });

  describe('Admin Dashboard Statistics', () => {
    test('Support admin views comprehensive stats', async () => {
      const adminToken = createAuthToken(supportAdmin, 'support_admin');
      
      const res = await request(app)
        .get('/api/admin/support/stats')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.stats).toMatchObject({
        openTickets: expect.any(Number),
        avgResponseTime: expect.any(Number),
        avgResolutionTime: expect.any(Number),
        todayTickets: expect.any(Number),
        categoryDistribution: expect.any(Object),
        agentPerformance: expect.any(Array)
      });

      // Admin should see agent performance
      expect(res.body.stats.agentPerformance.length).toBeGreaterThan(0);
      const agentStats = res.body.stats.agentPerformance[0];
      expect(agentStats).toMatchObject({
        agent_id: expect.any(Number),
        display_name: expect.any(String),
        total_tickets: expect.any(Number),
        avg_response_time: expect.any(Number),
        avg_resolution_time: expect.any(Number),
        avg_satisfaction: expect.any(Number)
      });
    });

    test('Support agent sees limited stats', async () => {
      const agentToken = createAuthToken(supportAgent, 'support_agent');
      
      const res = await request(app)
        .get('/api/admin/support/stats')
        .set('Authorization', `Bearer ${agentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      // Agent should not see agent performance stats
      expect(res.body.stats.agentPerformance).toBeUndefined();
    });
  });

  describe('Bulk Operations', () => {
    let bulkTicketIds: number[] = [];

    beforeAll(async () => {
      // Create multiple tickets for bulk operations
      for (let i = 0; i < 5; i++) {
        const ticket = await db.SupportTicket.create({
          ticket_number: `TKT-20240116-${String(i + 1).padStart(4, '0')}`,
          user_id: testUser.id,
          category: 'technical',
          subject: `Bulk test ticket ${i + 1}`,
          description: 'Test ticket for bulk operations',
          status: 'open',
          priority: 'low'
        });
        bulkTicketIds.push(ticket.id);
      }
    });

    test('Admin performs bulk assignment', async () => {
      const adminToken = createAuthToken(supportAdmin, 'support_admin');
      
      const res = await request(app)
        .post('/api/admin/support/tickets/bulk-update')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          ticket_ids: bulkTicketIds.slice(0, 3),
          action: 'assign',
          data: {
            agent_id: supportAgent.id,
            reason: 'Bulk assignment for technical issues'
          }
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.updated).toBe(3);

      // Verify assignments
      const assignments = await db.TicketAssignment.findAll({
        where: { ticket_id: bulkTicketIds.slice(0, 3) }
      });
      expect(assignments.length).toBe(3);
      assignments.forEach((assignment: any) => {
        expect(assignment.assigned_to).toBe(supportAgent.id);
        expect(assignment.assignment_type).toBe('manual');
      });
    });

    test('Admin performs bulk status update', async () => {
      const adminToken = createAuthToken(supportAdmin, 'support_admin');
      
      const res = await request(app)
        .post('/api/admin/support/tickets/bulk-update')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          ticket_ids: bulkTicketIds.slice(3),
          action: 'status',
          data: {
            status: 'closed',
            reason: 'Bulk closure - duplicate issues'
          }
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.updated).toBe(2);

      // Verify status updates
      const tickets = await db.SupportTicket.findAll({
        where: { id: bulkTicketIds.slice(3) }
      });
      tickets.forEach((ticket: any) => {
        expect(ticket.status).toBe('closed');
      });
    });
  });

  describe('Search and Filter Operations', () => {
    test('Search tickets by keyword', async () => {
      const agentToken = createAuthToken(supportAgent, 'support_agent');
      
      const res = await request(app)
        .get('/api/admin/support/tickets')
        .set('Authorization', `Bearer ${agentToken}`)
        .query({
          search: 'upload',
          page: 1,
          limit: 10
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.tickets.length).toBeGreaterThan(0);
      expect(res.body.tickets[0].subject.toLowerCase()).toContain('upload');
    });

    test('Filter tickets by multiple criteria', async () => {
      const agentToken = createAuthToken(supportAgent, 'support_agent');
      
      const res = await request(app)
        .get('/api/admin/support/tickets')
        .set('Authorization', `Bearer ${agentToken}`)
        .query({
          status: 'resolved',
          category: 'technical',
          priority: 'medium',
          sort: 'created_at',
          order: 'desc',
          page: 1,
          limit: 20
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      if (res.body.tickets.length > 0) {
        expect(res.body.tickets[0].status).toBe('resolved');
        expect(res.body.tickets[0].category).toBe('technical');
      }
    });

    test('Filter by date range', async () => {
      const agentToken = createAuthToken(supportAgent, 'support_agent');
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      const res = await request(app)
        .get('/api/admin/support/tickets')
        .set('Authorization', `Bearer ${agentToken}`)
        .query({
          startDate: yesterday.toISOString(),
          endDate: today.toISOString(),
          page: 1,
          limit: 50
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      // All returned tickets should be within date range
      res.body.tickets.forEach((ticket: any) => {
        const createdAt = new Date(ticket.created_at);
        expect(createdAt >= yesterday).toBe(true);
        expect(createdAt <= today).toBe(true);
      });
    });
  });

  describe('Access Control and Security', () => {
    test('Unauthenticated user cannot access tickets', async () => {
      const res = await request(app)
        .get('/api/support/tickets/TKT-20240115-0001');

      expect(res.status).toBe(401);
      expect(res.body.error).toContain('Authentication required');
    });

    test('User cannot access other users tickets', async () => {
      const otherUser = await db.User.create({
        email: 'otheruser@example.com',
        username: 'otheruser',
        password_hash: 'hashed',
        display_name: 'Other User'
      });

      const otherUserToken = createAuthToken(otherUser);
      
      const res = await request(app)
        .get(`/api/support/tickets/TKT-20240115-0001`)
        .set('Authorization', `Bearer ${otherUserToken}`);

      expect(res.status).toBe(403);
      expect(res.body.error).toContain('Access denied');
    });

    test('Regular user cannot access admin endpoints', async () => {
      const userToken = createAuthToken(testUser);
      
      const res = await request(app)
        .get('/api/admin/support/stats')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(403);
      expect(res.body.error).toContain('Support role required');
    });

    test('Support agent cannot perform admin-only actions', async () => {
      const agentToken = createAuthToken(supportAgent, 'support_agent');
      
      const res = await request(app)
        .put('/api/admin/support/tickets/1/priority')
        .set('Authorization', `Bearer ${agentToken}`)
        .send({ priority: 'urgent' });

      expect(res.status).toBe(403);
      expect(res.body.error).toContain('Admin access required');
    });
  });

  describe('Error Handling and Validation', () => {
    test('Invalid ticket category returns 400', async () => {
      const authToken = createAuthToken(testUser);
      
      const res = await request(app)
        .post('/api/support/tickets')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          category: 'invalid_category',
          subject: 'Test',
          description: 'Test description',
          priority: 'medium'
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('Invalid category');
    });

    test('Missing required fields returns 400', async () => {
      const authToken = createAuthToken(testUser);
      
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

    test('Invalid ticket number returns 404', async () => {
      const authToken = createAuthToken(testUser);
      
      const res = await request(app)
        .get('/api/support/tickets/INVALID-TICKET-NUMBER')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(404);
      expect(res.body.error).toContain('Ticket not found');
    });

    test('Empty response message returns 400', async () => {
      const authToken = createAuthToken(testUser);
      
      const res = await request(app)
        .post('/api/support/tickets/TKT-20240115-0001/responses')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          message: ''
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('Message cannot be empty');
    });

    test('Rating closed ticket without resolution returns 400', async () => {
      // Create a closed but unresolved ticket
      const ticket = await db.SupportTicket.create({
        ticket_number: 'TKT-20240117-0001',
        user_id: testUser.id,
        category: 'other',
        subject: 'Test closed ticket',
        description: 'Test',
        status: 'open',
        priority: 'low'
      });

      const authToken = createAuthToken(testUser);
      
      const res = await request(app)
        .post(`/api/support/tickets/${ticket.ticket_number}/satisfaction`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ rating: 3 });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('can only rate resolved or closed tickets');
    });
  });
});