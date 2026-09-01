import {
  addItemInput,
  itemIdParam,
  listQuery,
  updateItemInput,
  type AddItemInput,
  type ListQuery,
  type UpdateItemInput,
} from '@marquee/shared';
import { Router } from 'express';
import { currentUserId, requireAuth } from '../middleware/require-auth';
import { validate, validated } from '../middleware/validate';
import type { WatchlistService } from '../services/watchlist.service';

type IdParams = { id: number };

export function createWatchlistRouter(watchlist: WatchlistService) {
  const router = Router();
  router.use(requireAuth);

  router.get('/', validate({ query: listQuery }), async (req, res) => {
    const { query } = validated<{ query: ListQuery }>(res);
    const data = await watchlist.list(currentUserId(req), query);
    res.json({ data });
  });

  router.post('/', validate({ body: addItemInput }), async (req, res) => {
    const { body } = validated<{ body: AddItemInput }>(res);
    const data = await watchlist.add(currentUserId(req), body);
    res.status(201).json({ data });
  });

  router.patch('/:id', validate({ params: itemIdParam, body: updateItemInput }), async (req, res) => {
    const { params, body } = validated<{ params: IdParams; body: UpdateItemInput }>(res);
    const data = await watchlist.update(currentUserId(req), params.id, body);
    res.json({ data });
  });

  router.delete('/:id', validate({ params: itemIdParam }), async (req, res) => {
    const { params } = validated<{ params: IdParams }>(res);
    await watchlist.remove(currentUserId(req), params.id);
    res.status(204).end();
  });

  return router;
}
