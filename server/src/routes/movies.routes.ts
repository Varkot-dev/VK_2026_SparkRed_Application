import { searchQuery, type SearchQuery } from '@marquee/shared';
import { Router } from 'express';
import type { TmdbClient } from '../lib/tmdb-client';
import { requireAuth } from '../middleware/require-auth';
import { validate, validated } from '../middleware/validate';

export function createMoviesRouter(tmdb: TmdbClient) {
  const router = Router();

  router.get('/search', requireAuth, validate({ query: searchQuery }), async (_req, res) => {
    const { query } = validated<{ query: SearchQuery }>(res);
    const data = await tmdb.searchMovies(query.q, query.page);
    res.json({ data });
  });

  return router;
}
