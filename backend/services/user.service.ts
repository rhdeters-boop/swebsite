import bcrypt from 'bcryptjs';

export interface User {
  id: number | string;
  email: string;
  password_hash: string;
}

export interface UserRepository {
  findByEmail(email: string): Promise<User | null>;
  create(data: { email: string; password_hash: string }): Promise<User>;
}

export const createUserService = (repo: UserRepository) => {
  const register = async (email: string, password: string) => {
    if (!email || !password) {
      throw new Error('Invalid input');
    }
    const existing = await repo.findByEmail(email);
    if (existing) {
      throw new Error('Email already in use');
    }
    const password_hash = await bcrypt.hash(password, 10);
    return repo.create({ email, password_hash });
  };

  const authenticate = async (email: string, password: string) => {
    const user = await repo.findByEmail(email);
    if (!user) return null;
    const ok = await bcrypt.compare(password, user.password_hash);
    return ok ? user : null;
  };

  return { register, authenticate };
};