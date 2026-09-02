import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import { Button } from '../../components/ui/Button';
import { Notice } from '../../components/ui/Notice';
import { useToast } from '../../components/ui/toast-context';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { errorMessage } from '../../lib/api';
import { cn } from '../../lib/cn';
import { useAddItem, useAllWatchlist } from '../watchlist/queries';
import { ResultCard } from './ResultCard';
import { useMovieSearch } from './queries';

const DEBOUNCE_MS = 300;

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
    <section aria-labelledby="search-heading">
      <div className="screen">
        <h1 id="search-heading" className="screen__h">
          Find a film
        </h1>
        <p className="screen__note">Results print as you type</p>
      </div>

      <div className="searchbar mt-5">
        <span className="searchbar__pre" aria-hidden="true">
          Title
        </span>
        <input
          type="search"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="e.g. Arrival"
          aria-label="Search films by title"
          autoFocus
          autoComplete="off"
        />
        {search.isFetching && (
          <span className="searchbar__state" aria-live="polite">
            Printing…
          </span>
        )}
      </div>

      {!isSearching ? (
        <div className="pt-6">
          <Notice roll="Box office" title="What are we seeing?">
            Type a title. Every match comes back with its poster, year and TMDB score.
          </Notice>
        </div>
      ) : search.isPending ? (
        <p className="mono pt-6" style={{ color: 'var(--thermal)' }} aria-live="polite">
          Printing results…
        </p>
      ) : search.isError ? (
        <div className="pt-6">
          <Notice roll="Printer jam" title="Search hit a snag" action={<Button variant="ghost" onClick={() => search.refetch()}>Try again</Button>}>
            {errorMessage(search.error)}
          </Notice>
        </div>
      ) : results.length === 0 ? (
        <div className="pt-6">
          <Notice roll="No match" title="Nothing on the bill">
            No film in the catalogue matches “{urlQuery}”. Check the spelling or try a shorter title.
          </Notice>
        </div>
      ) : (
        <>
          <ul className={cn('results', search.isPlaceholderData && 'results--stale')}>
            {results.map((movie, index) => (
              <ResultCard
                key={movie.tmdbId}
                movie={movie}
                index={index}
                onList={onListIds.has(movie.tmdbId)}
                isAdding={add.isPending && add.variables?.tmdbId === movie.tmdbId}
                onAdd={() =>
                  add.mutate(
                    { tmdbId: movie.tmdbId, title: movie.title, posterPath: movie.posterPath, releaseYear: movie.releaseYear },
                    {
                      onSuccess: () => toast.push(`Stub printed for ${movie.title}`, 'success'),
                      onError: (err) => toast.push(errorMessage(err), 'error'),
                    },
                  )
                }
              />
            ))}
          </ul>
          {search.data && search.data.totalPages > 1 && (
            <nav aria-label="Search pages" className="pager">
              <Button variant="ghost" size="sm" disabled={page <= 1} onClick={() => goToPage(page - 1)}>
                ← Previous
              </Button>
              <Button variant="ghost" size="sm" disabled={page >= search.data.totalPages} onClick={() => goToPage(page + 1)}>
                Next →
              </Button>
              <span className="pager__of">
                Page {page} of {search.data.totalPages}
              </span>
            </nav>
          )}
        </>
      )}
    </section>
  );
}
