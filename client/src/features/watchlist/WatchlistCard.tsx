import { WATCH_STATUSES, type UpdateItemInput, type WatchlistItem, type WatchStatus } from '@marquee/shared';
import { motion, useReducedMotion } from 'motion/react';
import { Button } from '../../components/ui/Button';
import { PosterImage } from '../../components/ui/PosterImage';
import { RatingPicker } from '../../components/ui/RatingPicker';
import { SegmentedControl } from '../../components/ui/SegmentedControl';

type WatchlistCardProps = {
  item: WatchlistItem;
  index: number;
  onUpdate: (patch: UpdateItemInput) => void;
  onRemove: () => void;
  isRemoving: boolean;
};

/** Short labels: the card is narrow, the toolbar already spells them out. */
const SHORT_LABEL: Record<WatchStatus, string> = { want: 'Want', watching: 'Watching', watched: 'Watched' };
const STATUS_OPTIONS = WATCH_STATUSES.map((s) => ({ value: s, label: SHORT_LABEL[s] }));

export function WatchlistCard({ item, index, onUpdate, onRemove, isRemoving }: WatchlistCardProps) {
  const reduceMotion = useReducedMotion();
  const isPending = item.id < 0;

  return (
    <motion.article
      layout={!reduceMotion}
      initial={reduceMotion ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1], delay: Math.min(index * 0.03, 0.24) }}
      className="group flex flex-col gap-3"
      aria-busy={isPending || isRemoving || undefined}
    >
      <div className="relative overflow-hidden rounded-xl poster-shadow transition-[transform,box-shadow] duration-(--duration-normal) ease-(--ease-out-expo) group-hover:-translate-y-1 group-hover:poster-glow">
        <PosterImage posterPath={item.posterPath} title={item.title} priority={index < 4} />
        {item.rating !== null && (
          <span className="absolute right-2 top-2 rounded-md bg-surface-0/85 px-2 py-1 font-display text-sm text-accent backdrop-blur" aria-label={`Rated ${item.rating} out of 10`}>
            {item.rating}<span className="text-ink-faint">/10</span>
          </span>
        )}
      </div>

      <div className="flex min-w-0 flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="truncate font-medium leading-snug text-ink" title={item.title}>{item.title}</h3>
            <p className="text-sm text-ink-faint">{item.releaseYear ?? 'Year unknown'}</p>
          </div>
          <Button
            variant="danger"
            size="sm"
            className="-mr-2 -mt-1 h-8 w-8 shrink-0 px-0"
            aria-label={`Remove ${item.title} from your watchlist`}
            onClick={onRemove}
            disabled={isPending}
            isLoading={isRemoving}
          >
            {!isRemoving && (
              <svg viewBox="0 0 20 20" fill="none" className="size-4" aria-hidden="true">
                <path d="M5 5l10 10M15 5 5 15" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
              </svg>
            )}
          </Button>
        </div>

        <SegmentedControl<WatchStatus>
          label={`Status for ${item.title}`}
          size="sm"
          value={item.status}
          options={STATUS_OPTIONS}
          onChange={(status) => status !== item.status && onUpdate({ status })}
          className="w-full [&>button]:flex-1"
        />

        {item.status === 'watched' && (
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="flex items-center justify-between gap-2"
          >
            <RatingPicker value={item.rating} onChange={(rating) => onUpdate({ rating })} disabled={isPending} />
          </motion.div>
        )}
      </div>
    </motion.article>
  );
}

