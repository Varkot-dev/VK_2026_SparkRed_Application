import type { MovieSummary } from '@marquee/shared';
import { motion, useReducedMotion } from 'motion/react';
import { Button } from '../../components/ui/Button';
import { PosterImage } from '../../components/ui/PosterImage';

type SearchResultCardProps = {
  movie: MovieSummary;
  index: number;
  onList: boolean;
  isAdding: boolean;
  onAdd: () => void;
};

export function SearchResultCard({ movie, index, onList, isAdding, onAdd }: SearchResultCardProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.article
      initial={reduceMotion ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1], delay: Math.min(index * 0.03, 0.24) }}
      className="group flex flex-col gap-3"
    >
      <div className="relative overflow-hidden rounded-xl poster-shadow transition-[transform,box-shadow] duration-(--duration-normal) ease-(--ease-out-expo) group-hover:-translate-y-1 group-hover:poster-glow">
        <PosterImage posterPath={movie.posterPath} title={movie.title} priority={index < 4} />
        {movie.voteAverage > 0 && (
          <span className="absolute left-2 top-2 rounded-md bg-surface-0/85 px-2 py-1 text-xs font-medium text-ink-muted backdrop-blur" aria-label={`TMDB rating ${movie.voteAverage.toFixed(1)}`}>
            ★ {movie.voteAverage.toFixed(1)}
          </span>
        )}
      </div>
      <div className="flex flex-col gap-2">
        <div className="min-w-0">
          <h3 className="truncate font-medium leading-snug text-ink" title={movie.title}>{movie.title}</h3>
          <p className="text-sm text-ink-faint">{movie.releaseYear ?? 'Year unknown'}</p>
        </div>
        {onList ? (
          <Button variant="secondary" size="sm" disabled className="w-full">
            <svg viewBox="0 0 20 20" fill="none" className="size-4 text-success" aria-hidden="true">
              <path d="m5 10 3.5 3.5L15 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            On your list
          </Button>
        ) : (
          <Button size="sm" className="w-full" onClick={onAdd} isLoading={isAdding}>
            {isAdding ? 'Adding…' : 'Add to watchlist'}
          </Button>
        )}
      </div>
    </motion.article>
  );
}
