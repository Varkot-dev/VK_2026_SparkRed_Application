import type { SearchResponse } from '@marquee/shared';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';

export const movieKeys = {
  search: (q: string, page: number) => ['movies', 'search', q.trim().toLowerCase(), page] as const,
};

/**
 * TanStack passes an AbortSignal; forwarding it to fetch means a superseded
 * query (user kept typing) is cancelled instead of racing the newer one.
 */
export function useMovieSearch(q: string, page: number) {
  const enabled = q.trim().length > 0;
  return useQuery({
    queryKey: movieKeys.search(q, page),
    enabled,
    placeholderData: keepPreviousData,
    queryFn: ({ signal }) => {
      const params = new URLSearchParams({ q: q.trim(), page: String(page) });
      return api<SearchResponse>(`/api/movies/search?${params}`, { signal });
    },
  });
}
