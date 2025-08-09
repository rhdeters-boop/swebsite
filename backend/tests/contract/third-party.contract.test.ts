import https from 'https';
import nock from 'nock';
import { z } from 'zod';
import { mockJson } from '@/backend/tests/helpers/httpMock';

function fetchJson(url: string): Promise<any> {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        const chunks: Buffer[] = [];
        res.on('data', (c) => chunks.push(c));
        res.on('end', () => {
          try {
            const body = JSON.parse(Buffer.concat(chunks).toString('utf8'));
            resolve({ status: res.statusCode, body });
          } catch (e) {
            reject(e);
          }
        });
      })
      .on('error', reject);
  });
}

const ProfileSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  displayName: z.string(),
  createdAt: z.string(), // iso date
});

describe('Third-party API contract', () => {
  const base = 'https://api.partner.example';

  afterEach(() => nock.cleanAll());

  test('profile schema remains compatible', async () => {
    mockJson(base, '/v1/profile/123', 'get', 200, {
      id: '123',
      email: 'test@example.com',
      displayName: 'Test User',
      createdAt: '2024-01-01T00:00:00.000Z',
      plan: 'pro',
    });

    const { status, body } = await fetchJson(`${base}/v1/profile/123`);
    expect(status).toBe(200);

    const parsed = ProfileSchema.parse(body);
    expect({ id: parsed.id, email: parsed.email, displayName: parsed.displayName }).toMatchInlineSnapshot(`
      {
        "displayName": "Test User",
        "email": "test@example.com",
        "id": "123",
      }
    `);
  });
});