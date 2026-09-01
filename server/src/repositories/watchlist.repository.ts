import type { ListQuery, SortField } from '@marquee/shared';
import { and, asc, desc, eq, sql, type SQL } from 'drizzle-orm';
import type { Db } from '../db';
import { watchlistItems, type NewWatchlistItemRow, type WatchlistItemRow } from '../db/schema';

type ItemPatch = Partial<Pick<WatchlistItemRow, 'status' | 'rating'>>;

const SORT_COLUMN: Record<SortField, typeof watchlistItems.addedAt | typeof watchlistItems.title | typeof watchlistItems.rating | typeof watchlistItems.releaseYear> = {
  addedAt: watchlistItems.addedAt,
  title: watchlistItems.title,
  rating: watchlistItems.rating,
  releaseYear: watchlistItems.releaseYear,
};

/** Data access for watchlist items. Every query is scoped to a user id. */
export class WatchlistRepository {
  constructor(private readonly db: Db) {}

  async listForUser(userId: number, query: ListQuery): Promise<WatchlistItemRow[]> {
    const filters: SQL[] = [eq(watchlistItems.userId, userId)];
    if (query.status) filters.push(eq(watchlistItems.status, query.status));

    return this.db
      .select()
      .from(watchlistItems)
      .where(and(...filters))
      .orderBy(...buildOrderBy(query));
  }

  async findForUser(id: number, userId: number): Promise<WatchlistItemRow | null> {
    const [row] = await this.db
      .select()
      .from(watchlistItems)
      .where(and(eq(watchlistItems.id, id), eq(watchlistItems.userId, userId)))
      .limit(1);
    return row ?? null;
  }

  async findByMovie(userId: number, tmdbId: number): Promise<WatchlistItemRow | null> {
    const [row] = await this.db
      .select()
      .from(watchlistItems)
      .where(and(eq(watchlistItems.userId, userId), eq(watchlistItems.tmdbId, tmdbId)))
      .limit(1);
    return row ?? null;
  }

  async insert(input: NewWatchlistItemRow): Promise<WatchlistItemRow> {
    const [row] = await this.db.insert(watchlistItems).values(input).returning();
    if (!row) throw new Error('Insert returned no row');
    return row;
  }

  async update(id: number, patch: ItemPatch): Promise<WatchlistItemRow | null> {
    const [row] = await this.db
      .update(watchlistItems)
      .set({ ...patch, updatedAt: new Date() })
      .where(eq(watchlistItems.id, id))
      .returning();
    return row ?? null;
  }

  async delete(id: number): Promise<boolean> {
    const rows = await this.db.delete(watchlistItems).where(eq(watchlistItems.id, id)).returning({ id: watchlistItems.id });
    return rows.length > 0;
  }
}

/**
 * Sort by the requested column with NULLS LAST (so unrated items sink regardless
 * of direction), then by newest-first as a stable tiebreaker.
 */
function buildOrderBy(query: ListQuery): SQL[] {
  const column = SORT_COLUMN[query.sort];
  const direction = query.order === 'asc' ? asc(column) : desc(column);
  return [sql`${direction} NULLS LAST`, desc(watchlistItems.addedAt)];
}
