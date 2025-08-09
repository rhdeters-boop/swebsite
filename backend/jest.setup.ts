/* Jest per-test-file setup for the backend. */
import nock from 'nock';

// Note: TextEncoder/TextDecoder are available as globals in Node 18+
// No need for polyfills

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