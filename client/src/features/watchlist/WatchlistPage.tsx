import { listQuery, type ListQuery, type WatchStatus } from '@marquee/shared';
import { AnimatePresence } from 'motion/react';
import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { PosterCardSkeleton } from '../../components/ui/Skeleton';
import { useToast } from '../../components/ui/Toast';
import { errorMessage } from '../../lib/api';
import { WatchlistCard } from './WatchlistCard';
import { WatchlistToolbar, type StatusFilter } from './WatchlistToolbar';
import { DEFAULT_LIST_QUERY, useAllWatchlist, useRemoveItem, useUpdateItem, useWatchlist } from './queries';

const SKELETON_COUNT = 10;

/** Filter/sort live in the URL so a view can be shared or restored on refresh. */
function useListQueryFromUrl(): [ListQuery, (next: ListQuery) => void] {
  const [params, setParams] = useSearchParams();
  const query = useMemo(() => {
    const parsed = listQuery.safeParse(Object.fromEntries(params));
    return parsed.success ? parsed.data : DEFAULT_LIST_QUERY;
  }, [params]);

  const setQuery = (next: ListQuery) => {
    const out = new URLSearchParams();
    if (next.status) out.set('status', next.status);
    if (next.sort !== DEFAULT_LIST_QUERY.sort) out.set('sort', next.sort);
    if (next.order !== DEFAULT_LIST_QUERY.order) out.set('order', next.order);
    setParams(out, { replace: true });
  };
  return [query, setQuery];
}

export function WatchlistPage() {
  const [query, setQuery] = useListQueryFromUrl();
  const list = useWatchlist(query);
  const all = useAllWatchlist();
  const update = useUpdateItem();
  const remove = useRemoveItem();
  const toast = useToast();

  const counts = useMemo<Record<StatusFilter, number> | null>(() => {
    if (!all.data) return null;
    const base: Record<StatusFilter, number> = { all: all.data.length, want: 0, watching: 0, watched: 0 };
    for (const item of all.data) base[item.status as WatchStatus] += 1;
    return base;
  }, [all.data]);

  const items = list.data ?? [];
  const hasAnyItems = (all.data?.length ?? 0) > 0;

  return (
    <section aria-labelledby="watchlist-heading" className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-accent">Now showing</p>
        <h1 id="watchlist-heading" className="font-display text-hero leading-none">Your marquee</h1>
        {counts && (
          <p className="text-ink-muted">
            {counts.all === 0 ? 'Nothing on the bill yet.' : `${counts.all} ${counts.all === 1 ? 'movie' : 'movies'} · ${counts.watched} watched`}
          </p>
        )}
      </header>

      {hasAnyItems && <WatchlistToolbar query={query} counts={counts} onChange={setQuery} />}

      {list.isPending ? (
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5" aria-label="Loading your watchlist">
          {Array.from({ length: SKELETON_COUNT }, (_, i) => <PosterCardSkeleton key={i} />)}
        </div>
      ) : list.isError ? (
        <EmptyState
          title="Couldn't load your watchlist"
          description={errorMessage(list.error)}
          action={<Button variant="secondary" onClick={() => list.refetch()}>Try again</Button>}
        />
      ) : !hasAnyItems ? (
        <EmptyState
          title="The marquee is dark"
          description="Search for a movie and add it to light things up."
          action={<Button onClick={() => undefined} className="p-0"><Link to="/search" className="flex h-full items-center px-5">Find a movie</Link></Button>}
        />
      ) : items.length === 0 ? (
        <EmptyState
          title="Nothing here yet"
          description="No movies match this filter."
          action={<Button variant="secondary" onClick={() => setQuery({ ...query, status: undefined })}>Show everything</Button>}
        />
      ) : (
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          <AnimatePresence mode="popLayout" initial={false}>
            {items.map((item, index) => (
              <WatchlistCard
                key={item.id}
                item={item}
                index={index}
                isRemoving={remove.isPending && remove.variables === item.id}
                onUpdate={(patch) =>
                  update.mutate({ id: item.id, patch }, { onError: (err) => toast.push(errorMessage(err), 'error') })
                }
                onRemove={() =>
                  remove.mutate(item.id, {
                    onSuccess: () => toast.push(`Removed “${item.title}”`),
                    onError: (err) => toast.push(errorMessage(err), 'error'),
                  })
                }
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </section>
  );
}
