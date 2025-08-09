import { Client } from 'pg';
import { GenericContainer, StartedTestContainer, Wait } from 'testcontainers';

type GlobalState = {
  container?: StartedTestContainer;
  pgUrl?: string;
};

async function runMigrationsAndSeed(pgUrl: string) {
  const client = new Client({ connectionString: pgUrl });
  await client.connect();
  try {
    await client.query(`
      create table if not exists users (
        id serial primary key,
        email text unique not null,
        password_hash text not null,
        created_at timestamptz default now()
      );
    `);
    await client.query(`
      insert into users (email, password_hash)
      values ('seeded@example.com', 'hash_seeded')
      on conflict (email) do nothing;
    `);
  } finally {
    await client.end();
  }
}

export default async function globalSetup() {
  const container = await new GenericContainer('postgres:16-alpine')
    .withEnv('POSTGRES_PASSWORD', 'postgres')
    .withEnv('POSTGRES_DB', 'testdb')
    .withExposedPorts(5432)
    .withWaitStrategy(Wait.forLogMessage('database system is ready to accept connections'))
    .start();

  const mappedPort = container.getMappedPort(5432);
  const host = container.getHost();
  const pgUrl = `postgres://postgres:postgres@${host}:${mappedPort}/testdb`;

  process.env.DB_HOST = host;
  process.env.DB_PORT = String(mappedPort);
  process.env.DB_NAME = 'testdb';
  process.env.DB_USER = 'postgres';
  process.env.DB_PASSWORD = 'postgres';
  process.env.DATABASE_URL = pgUrl;

  await runMigrationsAndSeed(pgUrl);

  // @ts-ignore - attach to global for teardown
  (global as any).__TESTCONTAINERS_STATE__ = { container, pgUrl } as GlobalState;
}