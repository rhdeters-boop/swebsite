import express from 'express';
import request from 'supertest';
import jwt from 'jsonwebtoken';

// IMPORTANT: must mock the exact path used inside the middleware file
// middleware/auth.js does: import { User } from '../models/index.js'
// From this test file, that path is '../../models/index.js'
jest.mock('../../models/index.js', () => {
  return {
    __esModule: true,
    User: {
      findByPk: jest.fn(),
    },
  };
});

import { authenticateToken, requireRole } from '@/backend/middleware/auth.js';
import { User as MockUser } from '../../models/index.js';

describe('Auth middleware (authenticateToken + requireRole)', () => {
  const secret = 'unit_test_secret';
  const makeApp = () => {
    const app = express();
    app.get('/private', authenticateToken, (_req, res) => res.json({ ok: true }));
    app.get('/admin', authenticateToken, requireRole('admin'), (_req, res) => res.json({ ok: 'admin' }));
    return app;
  };

  beforeEach(() => {
    jest.resetAllMocks();
    process.env.JWT_SECRET = secret;
  });

  test('401 on missing token', async () => {
    const app = makeApp();
    const res = await request(app).get('/private');
    expect(res.status).toBe(401);
    expect(res.body).toEqual(
      expect.objectContaining({ success: false })
    );
  });

  test('200 with valid token and active user', async () => {
    const app = makeApp();
    const token = jwt.sign({ userId: 'u1' }, secret);
    (MockUser.findByPk as jest.Mock).mockResolvedValue({ id: 'u1', isActive: true });

    const res = await request(app).get('/private').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
    expect(MockUser.findByPk).toHaveBeenCalledWith('u1', expect.any(Object));
  });

  test('403 for non-admin on admin route', async () => {
    const app = makeApp();
    const token = jwt.sign({ userId: 'u2' }, secret);
    (MockUser.findByPk as jest.Mock).mockResolvedValue({ id: 'u2', isActive: true, role: 'user' });

    const res = await request(app).get('/admin').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
    expect(res.body).toEqual(
      expect.objectContaining({ success: false, message: 'Forbidden' })
    );
  });

  test('401 for invalid token', async () => {
    const app = makeApp();
    const res = await request(app).get('/private').set('Authorization', 'Bearer not-a-token');
    expect(res.status).toBe(401);
  });

  test('401 when user not found or inactive', async () => {
    const app = makeApp();
    const token = jwt.sign({ userId: 'ghost' }, secret);
    (MockUser.findByPk as jest.Mock).mockResolvedValue(null);

    const res = await request(app).get('/private').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(401);
  });
});