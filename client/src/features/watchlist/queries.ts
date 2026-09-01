import type { AddItemInput, ListQuery, UpdateItemInput, WatchlistItem } from '@marquee/shared';
import { useMutation, useQuery, useQueryClient, type QueryKey } from '@tanstack/react-query';
import { api } from '../../lib/api';

export const watchlistKeys = {
  all: ['watchlist'] as const,
  list: (query: ListQuery) => ['watchlist', 'list', normalise(query)] as const,
};

export const DEFAULT_LIST_QUERY: ListQuery = { sort: 'addedAt', order: 'desc' };

/** Drop undefined so `{status: undefined}` and `{}` hash to the same key. */
function normalise(query: ListQuery) {
  return { ...(query.status && { status: query.status }), sort: query.sort, order: query.order };
}

function toSearchParams(query: ListQuery): string {
  return new URLSearchParams(normalise(query)).toString();
}

export function useWatchlist(query: ListQuery) {
  return useQuery({
    queryKey: watchlistKeys.list(query),
    queryFn: ({ signal }) => api<WatchlistItem[]>(`/api/watchlist?${toSearchParams(query)}`, { signal }),
  });
}

/** The unfiltered list — used for tab counts and "already on your list" checks. */
export function useAllWatchlist() {
  return useWatchlist(DEFAULT_LIST_QUERY);
}

type Snapshot = Array<[QueryKey, WatchlistItem[] | undefined]>;

/** Shared optimistic-update plumbing: snapshot every cached list, patch them, restore on error. */
function useOptimisticLists() {
  const queryClient = useQueryClient();
  return {
    queryClient,
    async snapshot(): Promise<Snapshot> {
      await queryClient.cancelQueries({ queryKey: watchlistKeys.all });
      return queryClient.getQueriesData<WatchlistItem[]>({ queryKey: watchlistKeys.all });
    },
    patchAll(fn: (items: WatchlistItem[]) => WatchlistItem[]) {
      queryClient.setQueriesData<WatchlistItem[]>({ queryKey: watchlistKeys.all }, (items) => (items ? fn(items) : items));
    },
    restore(snapshot: Snapshot) {
      for (const [key, data] of snapshot) queryClient.setQueryData(key, data);
    },
    invalidate() {
      return queryClient.invalidateQueries({ queryKey: watchlistKeys.all });
    },
  };
}

export function useAddItem() {
  const lists = useOptimisticLists();
  return useMutation({
    mutationFn: (input: AddItemInput) => api<WatchlistItem>('/api/watchlist', { method: 'POST', json: input }),
    onMutate: async (input) => {
      const snapshot = await lists.snapshot();
      const optimistic: WatchlistItem = {
        id: -Date.now(),
        ...input,
        status: 'want',
        rating: null,
        addedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      lists.patchAll((items) => [optimistic, ...items]);
      return { snapshot };
    },
    onError: (_err, _input, ctx) => ctx && lists.restore(ctx.snapshot),
    onSettled: () => lists.invalidate(),
  });
}

/** Mirrors the server rule so the optimistic state never shows a rating on a non-watched item. */
export function applyUpdate(item: WatchlistItem, patch: UpdateItemInput): WatchlistItem {
  const status = patch.status ?? item.status;
  const requested = patch.rating !== undefined ? patch.rating : item.rating;
  return { ...item, status, rating: status === 'watched' ? requested : null };
}

export function useUpdateItem() {
  const lists = useOptimisticLists();
  return useMutation({
    mutationFn: ({ id, patch }: { id: number; patch: UpdateItemInput }) =>
      api<WatchlistItem>(`/api/watchlist/${id}`, { method: 'PATCH', json: patch }),
    onMutate: async ({ id, patch }) => {
      const snapshot = await lists.snapshot();
      lists.patchAll((items) => items.map((it) => (it.id === id ? applyUpdate(it, patch) : it)));
      return { snapshot };
    },
    onError: (_err, _vars, ctx) => ctx && lists.restore(ctx.snapshot),
    onSettled: () => lists.invalidate(),
  });
}

export function useRemoveItem() {
  const lists = useOptimisticLists();
  return useMutation({
    mutationFn: (id: number) => api<void>(`/api/watchlist/${id}`, { method: 'DELETE' }),
    onMutate: async (id) => {
      const snapshot = await lists.snapshot();
      lists.patchAll((items) => items.filter((it) => it.id !== id));
      return { snapshot };
    },
    onError: (_err, _id, ctx) => ctx && lists.restore(ctx.snapshot),
    onSettled: () => lists.invalidate(),
  });
}
