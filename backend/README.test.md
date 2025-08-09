# Backend Testing Guide

This repository implements a complete backend testing strategy using Jest + ts-jest (ESM), with unit, service, middleware, API (supertest), contract (zod + nock), and optional Testcontainers integration. It follows the plan in [docs/features/0006_PLAN.md](docs/features/0006_PLAN.md).

## Quick start

- Install backend deps once:
  npm ci

- Unit tests (fast):
  npm run test:unit

- Watch mode:
  npm run test:watch

- Changed files:
  npm run test:changed

- API e2e (in-memory app via supertest):
  npm run test:api

- Contract tests (HTTP mocked):
  npm run test:contract

- Coverage:
  npm run test:coverage

From repository root, proxy scripts are available:
- npm run test:backend
- npm run test:backend:coverage
- npm run test:backend:containers

## Integration modes

- Default fast mode:
  Uses mocks/in-memory with no external infrastructure. Supertest runs against an in-memory `createApp()` without opening ports.

- True integration (Testcontainers):
  Requires Docker. Starts ephemeral Postgres, migrates and seeds using globalSetup/globalTeardown.
  npm run test:containers

- Optional docker-compose services:
  docker compose -f backend/test/env/docker-compose.test.yml up -d
  Set DB envs to point to localhost:5433 for manual runs.

## Determinism

- Faker (stable seeds):
  import { makeFaker } from '@/backend/tests/helpers/random';
  const faker = makeFaker(123);

- Timers:
  jest.useFakeTimers(); ... jest.useRealTimers();

- HTTP mocking:
  import { mockJson } from '@/backend/tests/helpers/httpMock';
  Use `nock` and helper utilities; network is blocked by default.

## Directory and configuration

- Jest config (ESM + ts-jest):
  [backend/jest.config.esm.js](backend/jest.config.esm.js)

- TS testing config (paths, types):
  [backend/tsconfig.testing.json](backend/tsconfig.testing.json)

- Jest setup (TextEncoder/TextDecoder polyfills, nock defaults):
  [backend/jest.setup.ts](backend/jest.setup.ts)

- Global setup/teardown for containers:
  [backend/test/env/global-setup.ts](backend/test/env/global-setup.ts)
  [backend/test/env/global-teardown.ts](backend/test/env/global-teardown.ts)

- Optional docker-compose test services:
  [backend/test/env/docker-compose.test.yml](backend/test/env/docker-compose.test.yml)

- Example tests:
  - Unit util: [backend/utils/slug.ts](backend/utils/slug.ts), [backend/utils/__tests__/slug.test.ts](backend/utils/__tests__/slug.test.ts)
  - Service w/ repo mock: [backend/services/user.service.ts](backend/services/user.service.ts), [backend/services/__tests__/user.service.test.ts](backend/services/__tests__/user.service.test.ts)
  - Middleware: [backend/middleware/__tests__/auth.test.ts](backend/middleware/__tests__/auth.test.ts)
  - API (supertest): [backend/app.ts](backend/app.ts), [backend/tests/api/app.e2e.test.ts](backend/tests/api/app.e2e.test.ts)
  - Contract (zod + nock): [backend/tests/contract/third-party.contract.test.ts](backend/tests/contract/third-party.contract.test.ts)
  - Timers example: [backend/tests/unit/timers.example.test.ts](backend/tests/unit/timers.example.test.ts)
  - In-memory Sequelize (sqlite): [backend/tests/helpers/sequelize-inmemory.ts](backend/tests/helpers/sequelize-inmemory.ts), [backend/tests/integration/user.repo.sqlite.test.ts](backend/tests/integration/user.repo.sqlite.test.ts)

## @/ alias

`@/` maps to the repository root in tests via ts-jest paths config:
- Example import for backend code: 
  import { toSlug } from '@/backend/utils/slug';

## Adapting server startup for tests

The app is already bootstrapped for production in [backend/server.js](backend/server.js). For tests, use the in-memory app factory:
- Use [backend/app.ts](backend/app.ts), imported by supertest-based e2e tests. This avoids port binding issues and keeps tests fast/deterministic.

## Coverage thresholds and exclusions

- Thresholds enforced:
  - statements: 85%
  - branches: 80%
  - functions: 85%
  - lines: 85%

- Exclusions defined in Jest config:
  - config, migrations/seeders, scripts, generated artifacts, logger internals
  - server bootstrap entries (e.g., server.js)

## Environment variables for tests

Add these to your `.env` (or set them in your shell/CI):
- JWT_SECRET=unit_test_secret (tests override this where needed)
- Optional DB settings for local infra mode:
  - DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD
- For Testcontainers runs, env is set automatically by globalSetup.

## CI

GitHub Actions workflow: [/.github/workflows/test.yml](.github/workflows/test.yml)
- Matrix targets: unit, api, contract, coverage
- Optional integration job with Testcontainers (`test:containers`)
- Codecov upload step expects `CODECOV_TOKEN` GitHub secret.

## Troubleshooting

- ESM with ts-jest:
  Use `backend/jest.config.esm.js` (preset `ts-jest/presets/default-esm`) and ensure the repository sets `"type": "module"`.

- TextEncoder/TextDecoder errors:
  Polyfilled in [backend/jest.setup.ts](backend/jest.setup.ts)

- fetch/undici is not intercepted by nock:
  Use Node `https`/axios for contract tests, or use MSW (Node) as an alternative.

- OpenSSL 3:
  Prefer upgrading deps. As a last resort, `NODE_OPTIONS=--openssl-legacy-provider` (avoid in long term).