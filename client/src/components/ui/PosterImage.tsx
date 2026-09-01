import { posterUrl, type PosterSize } from '@marquee/shared';
import { useState } from 'react';
import { cn } from '../../lib/cn';

type PosterImageProps = {
  posterPath: string | null;
  title: string;
  size?: PosterSize;
  className?: string;
  priority?: boolean;
};

/**
 * 2:3 poster with a typographic fallback, so a missing TMDB image never
 * leaves a hole in the grid. Explicit dimensions prevent layout shift.
 */
export function PosterImage({ posterPath, title, size = 'w342', className, priority }: PosterImageProps) {
  const [failed, setFailed] = useState(false);
  const src = posterUrl(posterPath, size);

  if (!src || failed) {
    return (
      <div
        className={cn('flex aspect-[2/3] w-full items-end bg-gradient-to-br from-surface-3 to-surface-1 p-3', className)}
        role="img"
        aria-label={`No poster for ${title}`}
      >
        <span className="font-display text-lg leading-tight text-ink-muted line-clamp-3">{title}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={`Poster for ${title}`}
      width={342}
      height={513}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      onError={() => setFailed(true)}
      className={cn('aspect-[2/3] w-full object-cover bg-surface-2', className)}
    />
  );
}
