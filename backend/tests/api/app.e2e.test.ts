import request from 'supertest';
import { createApp } from '@/backend/app';

describe('API e2e', () => {
  const app = createApp();

  test('GET /health returns stable shape (snapshot)', async () => {
    const res = await request(app).get('/health');
    res.body.now = 'redacted';
    expect(res.status).toBe(200);
    expect(res.body).toMatchInlineSnapshot(`
      {
        "name": "backend",
        "now": "redacted",
        "status": "ok",
        "version": "1.0",
      }
    `);
  });

  test('POST /echo echoes body', async () => {
    const payload = { a: 1, b: 'two' };
    const res = await request(app).post('/echo').send(payload);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ youSent: payload, received: true });
  });
});