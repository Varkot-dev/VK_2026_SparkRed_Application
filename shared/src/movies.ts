import { z } from 'zod';

/** The slice of a TMDB movie that Marquee cares about. */
export type MovieSummary = {
  tmdbId: number;
  title: string;
  posterPath: string | null;
  releaseYear: number | null;
  overview: string;
  voteAverage: number;
};

export const searchQuery = z.object({
  q: z.string().trim().min(1, 'Search query is required').max(100),
  page: z.coerce.number().int().min(1).max(500).default(1),
});
export type SearchQuery = z.infer<typeof searchQuery>;

export type SearchResponse = {
  results: MovieSummary[];
  page: number;
  totalPages: number;
};

export const TMDB_POSTER_BASE = 'https://image.tmdb.org/t/p';
export type PosterSize = 'w185' | 'w342' | 'w500';

export function posterUrl(posterPath: string | null, size: PosterSize = 'w342'): string | null {
  return posterPath ? `${TMDB_POSTER_BASE}/${size}${posterPath}` : null;
}
