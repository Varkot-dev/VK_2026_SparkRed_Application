import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { loadConfig, type Config } from './config';
import { createDb } from './db';
import { AppError } from './lib/errors';
import { TmdbClient } from './lib/tmdb-client';
import { errorHandler, notFoundHandler } from './middleware/error-handler';
import { createSessionMiddleware } from './middleware/session';
import { UserRepository } from './repositories/user.repository';
import { WatchlistRepository } from './repositories/watchlist.repository';
import { createAuthRouter } from './routes/auth.routes';
import { createMoviesRouter } from './routes/movies.routes';
import { createWatchlistRouter } from './routes/watchlist.routes';
import { AuthService } from './services/auth.service';
import { WatchlistService } from './services/watchlist.service';

const JSON_BODY_LIMIT = '10kb';
const AUTH_RATE_WINDOW_MS = 15 * 60 * 1000;
const AUTH_RATE_LIMIT = 30;

/**
 * Composition root: wires config → db → repositories → services → routers.
 * Returns the app without listening so it can run under a dev server or a
 * serverless function alike.
 */
export function createApp(config: Config = loadConfig()) {
  const { db, pool } = createDb(config.DATABASE_URL);

  const users = new UserRepository(db);
  const items = new WatchlistRepository(db);
  const authService = new AuthService(users);
  const watchlistService = new WatchlistService(items);
  const tmdb = new TmdbClient(config.TMDB_READ_TOKEN);

  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', 1); // Vercel / any TLS-terminating proxy: needed for secure cookies
  app.use(helmet());
  app.use(express.json({ limit: JSON_BODY_LIMIT }));
  app.use(createSessionMiddleware(config, pool));

  // In-memory store: on serverless this is per warm instance, which is adequate for this scale.
  const authLimiter = rateLimit({
    windowMs: AUTH_RATE_WINDOW_MS,
    limit: AUTH_RATE_LIMIT,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    handler: (_req, _res, next) => next(new AppError(429, 'RATE_LIMITED', 'Too many attempts, please try again later')),
  });

  app.get('/api/health', (_req, res) => res.json({ data: { ok: true } }));
  app.use('/api/auth', authLimiter, createAuthRouter(authService));
  app.use('/api/movies', createMoviesRouter(tmdb));
  app.use('/api/watchlist', createWatchlistRouter(watchlistService));

  app.use('/api', notFoundHandler);
  app.use(errorHandler);

  return app;
}
