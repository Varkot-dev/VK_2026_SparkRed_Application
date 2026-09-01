import { z } from 'zod';

export const WATCH_STATUSES = ['want', 'watching', 'watched'] as const;
export const watchStatus = z.enum(WATCH_STATUSES);
export type WatchStatus = z.infer<typeof watchStatus>;

export const WATCH_STATUS_LABEL: Record<WatchStatus, string> = {
  want: 'Want to watch',
  watching: 'Watching',
  watched: 'Watched',
};

export const RATING_MIN = 1;
export const RATING_MAX = 10;
export const ratingSchema = z.number().int().min(RATING_MIN).max(RATING_MAX);

export const addItemInput = z.object({
  tmdbId: z.number().int().positive(),
  title: z.string().trim().min(1).max(300),
  posterPath: z.string().max(200).nullable(),
  releaseYear: z.number().int().min(1800).max(2200).nullable(),
});
export type AddItemInput = z.infer<typeof addItemInput>;

export const updateItemInput = z
  .object({
    status: watchStatus.optional(),
    rating: ratingSchema.nullable().optional(),
  })
  .refine((v) => v.status !== undefined || v.rating !== undefined, {
    message: 'Provide a status or a rating to update',
  });
export type UpdateItemInput = z.infer<typeof updateItemInput>;

export const SORT_FIELDS = ['addedAt', 'title', 'rating', 'releaseYear'] as const;
export const sortField = z.enum(SORT_FIELDS);
export type SortField = z.infer<typeof sortField>;

export const SORT_FIELD_LABEL: Record<SortField, string> = {
  addedAt: 'Date added',
  title: 'Title',
  rating: 'Your rating',
  releaseYear: 'Release year',
};

export const listQuery = z.object({
  status: watchStatus.optional(),
  sort: sortField.default('addedAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
});
export type ListQuery = z.infer<typeof listQuery>;

export type WatchlistItem = {
  id: number;
  tmdbId: number;
  title: string;
  posterPath: string | null;
  releaseYear: number | null;
  status: WatchStatus;
  rating: number | null;
  addedAt: string;
  updatedAt: string;
};

export const itemIdParam = z.object({ id: z.coerce.number().int().positive() });
