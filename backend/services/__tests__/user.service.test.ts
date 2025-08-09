import bcrypt from 'bcryptjs';
import { createUserService, type UserRepository, type User } from '../user.service.js';

describe('createUserService (service unit with mocked repo)', () => {
  const repo: jest.Mocked<UserRepository> = {
    findByEmail: jest.fn(),
    create: jest.fn(),
  };

  beforeEach(() => {
    jest.resetAllMocks();
  });

  test('register: creates new user when email unused', async () => {
    repo.findByEmail.mockResolvedValue(null);
  repo.create.mockResolvedValue({ id: 1, email: 'new@example.com', password_hash: 'hash' } as unknown as User);

    const svc = createUserService(repo);
    const created = await svc.register('new@example.com', 'P@ssw0rd!');
    expect(created).toBeDefined();
    expect(repo.findByEmail).toHaveBeenCalledWith('new@example.com');
    expect(repo.create).toHaveBeenCalledWith(expect.objectContaining({ email: 'new@example.com' }));
  });

  test('register: rejects duplicate email', async () => {
  repo.findByEmail.mockResolvedValue({ id: 1, email: 'dup@example.com', password_hash: 'h' } as unknown as User);
    const svc = createUserService(repo);
    await expect(svc.register('dup@example.com', 'x')).rejects.toThrow('Email already in use');
  });

  test('authenticate: returns user on valid password', async () => {
  const user = { id: 42, email: 'ok@example.com', password_hash: '$2a$10$somesaltedhash' } as unknown as User;
    repo.findByEmail.mockResolvedValue(user);

  const cmp = jest.spyOn(bcrypt as any, 'compare').mockResolvedValue(true as any);
    const svc = createUserService(repo);
    const u = await svc.authenticate('ok@example.com', 'correct');
    expect(u?.id).toBe(42);
    cmp.mockRestore();
  });

  test('authenticate: returns null on invalid password', async () => {
  const user = { id: 42, email: 'ok@example.com', password_hash: '$2a$10$somesaltedhash' } as unknown as User;
    repo.findByEmail.mockResolvedValue(user);

  const cmp = jest.spyOn(bcrypt as any, 'compare').mockResolvedValue(false as any);
    const svc = createUserService(repo);
    const u = await svc.authenticate('ok@example.com', 'wrong');
    expect(u).toBeNull();
    cmp.mockRestore();
  });
});