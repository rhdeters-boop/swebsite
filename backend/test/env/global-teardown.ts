import type { StartedTestContainer } from 'testcontainers';

export default async function globalTeardown() {
  const state = ((global as any).__TESTCONTAINERS_STATE__) as {
    container?: StartedTestContainer;
    pgUrl?: string;
  };

  if (state?.container) {
    await state.container.stop({ timeout: 10000 });
  }
}