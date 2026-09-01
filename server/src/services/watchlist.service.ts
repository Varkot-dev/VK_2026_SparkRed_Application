import type { AddItemInput, ListQuery, UpdateItemInput, WatchlistItem } from '@marquee/shared';
import type { WatchlistItemRow } from '../db/schema';
import { ConflictError, NotFoundError, ValidationError } from '../lib/errors';
import { isUniqueViolation } from '../lib/pg-errors';
import type { WatchlistRepository } from '../repositories/watchlist.repository';

const ITEM_NOT_FOUND = 'That movie is not on your watchlist';

/**
 * Business rules for a user's watchlist:
 *  - one entry per movie per user
 *  - only watched movies can carry a rating
 *  - moving a movie out of "watched" clears its rating
 * Every method is scoped by userId so a user can never touch another's rows.
 */
export class WatchlistService {
  constructor(private readonly items: WatchlistRepository) {}

  async list(userId: number, query: ListQuery): Promise<WatchlistItem[]> {
    const rows = await this.items.listForUser(userId, query);
    return rows.map(toWatchlistItem);
  }

  async add(userId: number, input: AddItemInput): Promise<WatchlistItem> {
    if (await this.items.findByMovie(userId, input.tmdbId)) {
      throw new ConflictError('That movie is already on your watchlist');
    }
    try {
      const row = await this.items.insert({ userId, ...input });
      return toWatchlistItem(row);
    } catch (err) {
      if (isUniqueViolation(err)) throw new ConflictError('That movie is already on your watchlist');
      throw err;
    }
  }

  async update(userId: number, id: number, input: UpdateItemInput): Promise<WatchlistItem> {
    const current = await this.items.findForUser(id, userId);
    if (!current) throw new NotFoundError(ITEM_NOT_FOUND);

    const nextStatus = input.status ?? current.status;
    const wantsRating = input.rating !== undefined && input.rating !== null;
    if (wantsRating && nextStatus !== 'watched') {
      throw new ValidationError('Only watched movies can be rated');
    }

    const requestedRating = input.rating !== undefined ? input.rating : current.rating;
    const nextRating = nextStatus === 'watched' ? requestedRating : null;

    const row = await this.items.update(id, { status: nextStatus, rating: nextRating });
    if (!row) throw new NotFoundError(ITEM_NOT_FOUND);
    return toWatchlistItem(row);
  }

  async remove(userId: number, id: number): Promise<void> {
    const current = await this.items.findForUser(id, userId);
    if (!current) throw new NotFoundError(ITEM_NOT_FOUND);
    await this.items.delete(id);
  }
}

export function toWatchlistItem(row: WatchlistItemRow): WatchlistItem {
  return {
    id: row.id,
    tmdbId: row.tmdbId,
    title: row.title,
    posterPath: row.posterPath,
    releaseYear: row.releaseYear,
    status: row.status,
    rating: row.rating,
    addedAt: row.addedAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}
