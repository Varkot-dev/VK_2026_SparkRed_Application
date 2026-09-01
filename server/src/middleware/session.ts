import connectPgSimple from 'connect-pg-simple';
import session from 'express-session';
import type pg from 'pg';
import type { Config } from '../config';

// What we store on the session. Kept next to the middleware that owns the cookie.
declare module 'express-session' {
  interface SessionData {
    userId?: number;
  }
}

const SESSION_COOKIE = 'marquee.sid';
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

/** Server-side sessions persisted in Postgres so logins survive restarts and cold starts. */
export function createSessionMiddleware(config: Config, pool: pg.Pool) {
  const PgStore = connectPgSimple(session);
  return session({
    name: SESSION_COOKIE,
    secret: config.SESSION_SECRET,
    store: new PgStore({ pool, createTableIfMissing: true, pruneSessionInterval: false }),
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: {
      httpOnly: true,
      secure: config.isProduction,
      sameSite: 'lax',
      maxAge: SESSION_TTL_MS,
    },
  });
}

export { SESSION_COOKIE };
