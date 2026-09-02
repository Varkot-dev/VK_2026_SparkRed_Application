import type { MovieSummary } from '@marquee/shared';
import { motion, useReducedMotion } from 'motion/react';
import { Button } from '../../components/ui/Button';
import { PosterImage } from '../../components/ui/PosterImage';

type ResultCardProps = {
  movie: MovieSummary;
  index: number;
  onList: boolean;
  isAdding: boolean;
  onAdd: () => void;
};

export function ResultCard({ movie, index, onList, isAdding, onAdd }: ResultCardProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.li
      className="result"
      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: [0.2, 0.7, 0.3, 1], delay: Math.min(index * 0.03, 0.3) }}
    >
      <PosterImage posterPath={movie.posterPath} title={movie.title} priority={index < 4}>
        {movie.voteAverage > 0 && (
          <span className="score" aria-label={`TMDB score ${movie.voteAverage.toFixed(1)} out of 10`}>
            TMDB <b>{movie.voteAverage.toFixed(1)}</b>
          </span>
        )}
        {onList && (
          <span className="stamp stamp--ghost" aria-hidden="true">
            Admitted
          </span>
        )}
        {movie.releaseYear && <span className="poster__year">{movie.releaseYear}</span>}
      </PosterImage>
      <div className="result__print">
        <div className="grid gap-1.5">
          <h3 className="stub__title" title={movie.title}>
            {movie.title}
          </h3>
          {movie.overview && <p className="result__blurb">{movie.overview}</p>}
        </div>
        {onList ? (
          <Button variant="done" block disabled>
            On your roll
          </Button>
        ) : (
          <Button block onClick={onAdd} isLoading={isAdding}>
            {isAdding ? 'Printing…' : 'Add to watchlist'}
          </Button>
        )}
      </div>
    </motion.li>
  );
}
