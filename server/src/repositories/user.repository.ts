import { eq } from 'drizzle-orm';
import type { Db } from '../db';
import { users, type NewUserRow, type UserRow } from '../db/schema';

/** Data access for users. Knows SQL, knows nothing about passwords or sessions. */
export class UserRepository {
  constructor(private readonly db: Db) {}

  async findById(id: number): Promise<UserRow | null> {
    const [row] = await this.db.select().from(users).where(eq(users.id, id)).limit(1);
    return row ?? null;
  }

  async findByUsername(username: string): Promise<UserRow | null> {
    const [row] = await this.db.select().from(users).where(eq(users.username, username)).limit(1);
    return row ?? null;
  }

  async create(input: Pick<NewUserRow, 'username' | 'passwordHash'>): Promise<UserRow> {
    const [row] = await this.db.insert(users).values(input).returning();
    if (!row) throw new Error('Insert returned no row');
    return row;
  }
}
