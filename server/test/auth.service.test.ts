import { describe, expect, it, vi } from 'vitest';
import type { UserRow } from '../src/db/schema';
import { ConflictError, UnauthorizedError } from '../src/lib/errors';
import type { PasswordHasher } from '../src/lib/password';
import type { UserRepository } from '../src/repositories/user.repository';
import { AuthService } from '../src/services/auth.service';

const fakeHasher: PasswordHasher = {
  hash: async (plain) => `hashed:${plain}`,
  compare: async (plain, hash) => hash === `hashed:${plain}`,
};

function makeUser(overrides: Partial<UserRow> = {}): UserRow {
  return {
    id: 1,
    username: 'varshith',
    passwordHash: 'hashed:correct-horse',
    createdAt: new Date('2026-09-01T00:00:00Z'),
    ...overrides,
  };
}

function makeRepo(overrides: Partial<UserRepository> = {}) {
  return {
    findById: vi.fn().mockResolvedValue(null),
    findByUsername: vi.fn().mockResolvedValue(null),
    create: vi.fn().mockImplementation(async (input) => makeUser(input)),
    ...overrides,
  } as unknown as UserRepository;
}

describe('AuthService.register', () => {
  it('lowercases the username, hashes the password, and returns a public user', async () => {
    const repo = makeRepo();
    const service = new AuthService(repo, fakeHasher);

    const user = await service.register({ username: 'Varshith', password: 'correct-horse' });

    expect(repo.create).toHaveBeenCalledWith({ username: 'varshith', passwordHash: 'hashed:correct-horse' });
    expect(user).toEqual({ id: 1, username: 'varshith', createdAt: '2026-09-01T00:00:00.000Z' });
    expect(user).not.toHaveProperty('passwordHash');
  });

  it('throws ConflictError when the username is already taken', async () => {
    const repo = makeRepo({ findByUsername: vi.fn().mockResolvedValue(makeUser()) });
    const service = new AuthService(repo, fakeHasher);

    await expect(service.register({ username: 'varshith', password: 'correct-horse' })).rejects.toBeInstanceOf(ConflictError);
    expect(repo.create).not.toHaveBeenCalled();
  });

  it('maps a unique-violation race on insert to ConflictError', async () => {
    const repo = makeRepo({ create: vi.fn().mockRejectedValue(Object.assign(new Error('dup'), { code: '23505' })) });
    const service = new AuthService(repo, fakeHasher);

    await expect(service.register({ username: 'varshith', password: 'correct-horse' })).rejects.toBeInstanceOf(ConflictError);
  });
});

describe('AuthService.login', () => {
  it('returns the public user for correct credentials (case-insensitive username)', async () => {
    const repo = makeRepo({ findByUsername: vi.fn().mockResolvedValue(makeUser()) });
    const service = new AuthService(repo, fakeHasher);

    const user = await service.login({ username: 'VARSHITH', password: 'correct-horse' });

    expect(repo.findByUsername).toHaveBeenCalledWith('varshith');
    expect(user.username).toBe('varshith');
  });

  it('rejects a wrong password with the same error as an unknown user', async () => {
    const service = new AuthService(makeRepo({ findByUsername: vi.fn().mockResolvedValue(makeUser()) }), fakeHasher);
    const unknownService = new AuthService(makeRepo(), fakeHasher);

    const wrongPassword = service.login({ username: 'varshith', password: 'nope' });
    const unknownUser = unknownService.login({ username: 'ghost', password: 'nope' });

    await expect(wrongPassword).rejects.toBeInstanceOf(UnauthorizedError);
    await expect(unknownUser).rejects.toBeInstanceOf(UnauthorizedError);
    await expect(wrongPassword.catch((e) => e.message)).resolves.toBe(await unknownUser.catch((e) => e.message));
  });

  it('still runs a hash comparison when the user does not exist (timing equalisation)', async () => {
    const compare = vi.fn().mockResolvedValue(false);
    const service = new AuthService(makeRepo(), { ...fakeHasher, compare });

    await service.login({ username: 'ghost', password: 'nope' }).catch(() => undefined);

    expect(compare).toHaveBeenCalledTimes(1);
  });
});
