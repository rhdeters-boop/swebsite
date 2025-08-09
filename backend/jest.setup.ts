/* Jest per-test-file setup for the backend. */
import { TextEncoder, TextDecoder } from 'util';
import nock from 'nock';

// Polyfills for some libs on Node
// @ts-ignore
(global as any).TextEncoder = (global as any).TextEncoder || TextEncoder;
// @ts-ignore
(global as any).TextDecoder = (global as any).TextDecoder || TextDecoder;

beforeAll(() => {
  nock.disableNetConnect();
});

beforeEach(() => {
  // Allow only loopback (supertest/server under test)
  nock.enableNetConnect((host) =>
    host === '127.0.0.1' ||
    host.startsWith('127.0.0.1:') ||
    host === 'localhost' ||
    host.startsWith('localhost:')
  );
});

afterEach(() => {
  nock.cleanAll();
  // Re-block everything after each test
  nock.disableNetConnect();
});

afterAll(() => {
  // Reset nock global state
  nock.enableNetConnect();
  nock.restore();
});