import { posterUrl, type PosterSize } from '@marquee/shared';
import { useState, type ReactNode } from 'react';
import { cn } from '../../lib/cn';

type PosterImageProps = {
  posterPath: string | null;
  title: string;
  size?: PosterSize;
  priority?: boolean;
  className?: string;
  children?: ReactNode;
};

/**
 * 2:3 poster frame with a typographic fallback so a missing TMDB image never
 * leaves a hole in the roll. Children overlay the frame (stamp, year, score).
 */
export function PosterImage({ posterPath, title, size = 'w342', priority, className, children }: PosterImageProps) {
  const [failed, setFailed] = useState(false);
  const src = posterUrl(posterPath, size);
  const blank = !src || failed;

  return (
    <div className={cn('poster', blank && 'poster--blank', className)} role={blank ? 'img' : undefined} aria-label={blank ? `No poster for ${title}` : undefined}>
      {blank ? (
        <span>{title}</span>
      ) : (
        <img
          src={src}
          alt={`Poster for ${title}`}
          width={342}
          height={513}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          onError={() => setFailed(true)}
        />
      )}
      {children}
    </div>
  );
}
