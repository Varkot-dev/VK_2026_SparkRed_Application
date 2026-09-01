import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { PosterCardSkeleton } from '../../components/ui/Skeleton';
import { useToast } from '../../components/ui/Toast';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { errorMessage } from '../../lib/api';
import { cn } from '../../lib/cn';
import { useAddItem, useAllWatchlist } from '../watchlist/queries';
import { SearchResultCard } from './SearchResultCard';
import { useMovieSearch } from './queries';

const DEBOUNCE_MS = 300;
const SKELETON_COUNT = 10;

export function SearchPage() {
  const [params, setParams] = useSearchParams();
  const urlQuery = params.get('q') ?? '';
  const page = Math.max(1, Number(params.get('page')) || 1);

  const [input, setInput] = useState(urlQuery);
  const debounced = useDebouncedValue(input, DEBOUNCE_MS);

  // Debounced input drives the URL; the URL drives the query. Typing resets to page 1.
  useEffect(() => {
    if (debounced.trim() === urlQuery) return;
    const next = new URLSearchParams();
    if (debounced.trim()) next.set('q', debounced.trim());
    setParams(next, { replace: true });
  }, [debounced, urlQuery, setParams]);

  const search = useMovieSearch(urlQuery, page);
  const watchlist = useAllWatchlist();
  const add = useAddItem();
  const toast = useToast();

  const onListIds = useMemo(() => new Set(watchlist.data?.map((i) => i.tmdbId) ?? []), [watchlist.data]);
  const results = search.data?.results ?? [];
  const isSearching = urlQuery.length > 0;

  const goToPage = (p: number) => setParams({ q: urlQuery, page: String(p) });

  return (
    <section aria-labelledby="search-heading" className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-accent">Box office</p>
        <h1 id="search-heading" className="font-display text-hero leading-none">Find a movie</h1>
      </header>

      <div className="relative">
        <svg className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-ink-faint" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.75" />
          <path d="m14 14 3.5 3.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
        </svg>
        <input
          type="search"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Search by title…"
          aria-label="Search movies"
          autoFocus
          autoComplete="off"
          className={cn(
            'h-13 w-full rounded-xl border border-line bg-surface-1 pl-12 pr-4 text-base text-ink placeholder:text-ink-faint',
            'transition-[border-color,box-shadow] duration-(--duration-fast)',
            'hover:border-line-strong focus:outline-none focus:border-accent focus:shadow-[0_0_0_3px_oklch(82%_0.16_80/0.2)]',
          )}
        />
        {search.isFetching && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-ink-faint" aria-live="polite">Searching…</span>
        )}
      </div>

      {!isSearching ? (
        <EmptyState title="What are we watching?" description="Type a title above to search the TMDB catalogue." />
      ) : search.isPending ? (
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5" aria-label="Searching">
          {Array.from({ length: SKELETON_COUNT }, (_, i) => <PosterCardSkeleton key={i} />)}
        </div>
      ) : search.isError ? (
        <EmptyState
          title="Search hit a snag"
          description={errorMessage(search.error)}
          action={<Button variant="secondary" onClick={() => search.refetch()}>Try again</Button>}
        />
      ) : results.length === 0 ? (
        <EmptyState title="No matches" description={`Nothing in the catalogue matches “${urlQuery}”.`} />
      ) : (
        <>
          <div className={cn('grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 transition-opacity', search.isPlaceholderData && 'opacity-60')}>
            {results.map((movie, index) => (
              <SearchResultCard
                key={movie.tmdbId}
                movie={movie}
                index={index}
                onList={onListIds.has(movie.tmdbId)}
                isAdding={add.isPending && add.variables?.tmdbId === movie.tmdbId}
                onAdd={() =>
                  add.mutate(
                    { tmdbId: movie.tmdbId, title: movie.title, posterPath: movie.posterPath, releaseYear: movie.releaseYear },
                    {
                      onSuccess: () => toast.push(`Added “${movie.title}” to your watchlist`, 'success'),
                      onError: (err) => toast.push(errorMessage(err), 'error'),
                    },
                  )
                }
              />
            ))}
          </div>
          {search.data && search.data.totalPages > 1 && (
            <nav aria-label="Search pages" className="flex items-center justify-center gap-3 pt-2">
              <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => goToPage(page - 1)}>Previous</Button>
              <span className="text-sm tabular-nums text-ink-muted">Page {page} of {search.data.totalPages}</span>
              <Button variant="secondary" size="sm" disabled={page >= search.data.totalPages} onClick={() => goToPage(page + 1)}>Next</Button>
            </nav>
          )}
        </>
      )}
    </section>
  );
}
