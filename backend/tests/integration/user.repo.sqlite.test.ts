import { makeInMemorySequelize } from '@/backend/tests/helpers/sequelize-inmemory';
import type { UserRepository, User } from '@/backend/services/user.service';

describe('Sequelize repo on sqlite::memory:', () => {
  test('create and findByEmail', async () => {
    const { sequelize, User } = makeInMemorySequelize();
    await sequelize.sync({ force: true });

    const repo: UserRepository = {
      async findByEmail(email: string) {
        const m = await (User as any).findOne({ where: { email } });
        return m ? (m.toJSON() as unknown as User) : null;
      },
      async create(data) {
        const created = await (User as any).create(data);
        return created.toJSON() as unknown as User;
      },
    };

    const created = await repo.create({ email: 'mem@example.com', password_hash: 'h' });
    expect((created as any).id).toBeGreaterThan(0);

    const found = await repo.findByEmail('mem@example.com');
    expect(found?.email).toBe('mem@example.com');

    await sequelize.close();
  });
});