import { WATCH_STATUSES } from '@marquee/shared';
import { sql } from 'drizzle-orm';
import {
  check,
  index,
  integer,
  pgEnum,
  pgTable,
  serial,
  smallint,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from 'drizzle-orm/pg-core';

export const watchStatusEnum = pgEnum('watch_status', WATCH_STATUSES);

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: varchar('username', { length: 20 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const watchlistItems = pgTable(
  'watchlist_items',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    tmdbId: integer('tmdb_id').notNull(),
    // Snapshotted at add-time so the list renders without calling TMDB.
    title: varchar('title', { length: 300 }).notNull(),
    posterPath: varchar('poster_path', { length: 200 }),
    releaseYear: smallint('release_year'),
    status: watchStatusEnum('status').notNull().default('want'),
    rating: smallint('rating'),
    addedAt: timestamp('added_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex('watchlist_items_user_movie_idx').on(t.userId, t.tmdbId),
    index('watchlist_items_user_status_idx').on(t.userId, t.status),
    check('watchlist_items_rating_range', sql`${t.rating} IS NULL OR (${t.rating} BETWEEN 1 AND 10)`),
  ],
);

export type UserRow = typeof users.$inferSelect;
export type NewUserRow = typeof users.$inferInsert;
export type WatchlistItemRow = typeof watchlistItems.$inferSelect;
export type NewWatchlistItemRow = typeof watchlistItems.$inferInsert;
