/* Jest per-test-file setup for the backend. */
import { TextEncoder, TextDecoder } from 'util';
import nock from 'nock';

// Polyfills for some libs on Node
// @ts-ignore
(global as any).TextEncoder = (global as any).TextEncoder || TextEncoder;
// @ts-ignore
(global as any).TextDecoder = (global as any).TextDecoder || TextDecoder;

afterEach(() => {
  nock.cleanAll();
  nock.enableNetConnect(false); // Avoid unmocked network calls by default
});

beforeAll(() => {
  nock.disableNetConnect();
});

afterAll(() => {
  nock.restore();
});