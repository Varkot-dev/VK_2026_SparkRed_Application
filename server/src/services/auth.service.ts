import type { LoginInput, PublicUser, RegisterInput } from '@marquee/shared';
import type { UserRow } from '../db/schema';
import { ConflictError, UnauthorizedError } from '../lib/errors';
import { bcryptHasher, type PasswordHasher } from '../lib/password';
import { isUniqueViolation } from '../lib/pg-errors';
import type { UserRepository } from '../repositories/user.repository';

const INVALID_CREDENTIALS = 'Invalid username or password';

/**
 * Registration and credential checks. Session handling stays in the route
 * layer so this class has no dependency on HTTP.
 */
export class AuthService {
  private dummyHashPromise: Promise<string> | null = null;

  constructor(
    private readonly users: UserRepository,
    private readonly hasher: PasswordHasher = bcryptHasher,
  ) {}

  async register(input: RegisterInput): Promise<PublicUser> {
    const username = normaliseUsername(input.username);

    if (await this.users.findByUsername(username)) {
      throw new ConflictError('That username is taken');
    }

    const passwordHash = await this.hasher.hash(input.password);
    try {
      const row = await this.users.create({ username, passwordHash });
      return toPublicUser(row);
    } catch (err) {
      // Two registrations racing past the check above: the unique index wins.
      if (isUniqueViolation(err)) throw new ConflictError('That username is taken');
      throw err;
    }
  }

  async login(input: LoginInput): Promise<PublicUser> {
    const user = await this.users.findByUsername(normaliseUsername(input.username));

    // Always run a compare so a missing user takes as long as a wrong password.
    const hash = user?.passwordHash ?? (await this.dummyHash());
    const ok = await this.hasher.compare(input.password, hash);

    if (!user || !ok) throw new UnauthorizedError(INVALID_CREDENTIALS);
    return toPublicUser(user);
  }

  async getById(id: number): Promise<PublicUser | null> {
    const row = await this.users.findById(id);
    return row ? toPublicUser(row) : null;
  }

  private dummyHash(): Promise<string> {
    this.dummyHashPromise ??= this.hasher.hash('marquee-timing-equaliser');
    return this.dummyHashPromise;
  }
}

function normaliseUsername(username: string): string {
  return username.trim().toLowerCase();
}

export function toPublicUser(row: UserRow): PublicUser {
  return { id: row.id, username: row.username, createdAt: row.createdAt.toISOString() };
}
