import { listQuery, type ListQuery } from '@marquee/shared';
import { AnimatePresence } from 'motion/react';
import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router';
import { Button } from '../../components/ui/Button';
import { Notice } from '../../components/ui/Notice';
import { StubSkeleton } from '../../components/ui/StubSkeleton';
import { useToast } from '../../components/ui/toast-context';
import { errorMessage } from '../../lib/api';
import { Rail, type StatusFilter } from './Rail';
import { TicketStub } from './TicketStub';
import { DEFAULT_LIST_QUERY, useAllWatchlist, useRemoveItem, useUpdateItem, useWatchlist } from './queries';

const SKELETON_COUNT = 8;

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
    for (const item of all.data) base[item.status] += 1;
    return base;
  }, [all.data]);

  const items = list.data ?? [];
  const hasAnyItems = (all.data?.length ?? 0) > 0;

  return (
    <section aria-labelledby="roll-heading">
      <div className="screen">
        <h1 id="roll-heading" className="screen__h">
          The roll
        </h1>
        <p className="screen__note">
          {counts === null ? 'Printing…' : counts.all === 0 ? 'No stubs yet' : `${counts.all} ${counts.all === 1 ? 'stub' : 'stubs'} · ${counts.watched} torn`}
        </p>
      </div>

      {hasAnyItems && <Rail query={query} counts={counts} onChange={setQuery} />}

      {list.isPending ? (
        <ul className="stubs" aria-label="Printing your roll">
          {Array.from({ length: SKELETON_COUNT }, (_, i) => (
            <StubSkeleton key={i} />
          ))}
        </ul>
      ) : list.isError ? (
        <div className="pt-6">
          <Notice roll="Printer jam" title="Couldn't print your roll" action={<Button variant="ghost" onClick={() => list.refetch()}>Try again</Button>}>
            {errorMessage(list.error)}
          </Notice>
        </div>
      ) : !hasAnyItems ? (
        <div className="pt-6">
          <Notice
            roll="Roll empty"
            title="Nothing on the bill yet"
            action={
              <Link to="/search" className="btn btn--red">
                Find a film
              </Link>
            }
          >
            Find a film and tear off your first stub. Every one you add gets a serial and a seat.
          </Notice>
        </div>
      ) : items.length === 0 ? (
        <div className="pt-6">
          <Notice roll="Filter" title="No stubs match" action={<Button variant="ghost" onClick={() => setQuery({ ...query, status: undefined })}>Show everything</Button>}>
            Nothing on the roll has this status yet.
          </Notice>
        </div>
      ) : (
        <ul className="stubs">
          <AnimatePresence mode="popLayout" initial={false}>
            {items.map((item, index) => (
              <TicketStub
                key={item.id}
                item={item}
                index={index}
                isRemoving={remove.isPending && remove.variables === item.id}
                onUpdate={(patch) => update.mutate({ id: item.id, patch }, { onError: (err) => toast.push(errorMessage(err), 'error') })}
                onRemove={() =>
                  remove.mutate(item.id, {
                    onSuccess: () => toast.push(`Voided ${item.title}`),
                    onError: (err) => toast.push(errorMessage(err), 'error'),
                  })
                }
              />
            ))}
          </AnimatePresence>
        </ul>
      )}
    </section>
  );
}
