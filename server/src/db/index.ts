import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from './schema';

/**
 * One pool per process. On Vercel a "process" is a warm function instance, so
 * keep the pool tiny — Neon's pooler does the real multiplexing.
 */
export function createDb(connectionString: string) {
  const pool = new pg.Pool({ connectionString, max: 3, idleTimeoutMillis: 10_000 });
  return { db: drizzle(pool, { schema }), pool };
}

export type Db = ReturnType<typeof createDb>['db'];
