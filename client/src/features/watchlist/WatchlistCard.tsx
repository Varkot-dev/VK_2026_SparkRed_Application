import { WATCH_STATUSES, WATCH_STATUS_LABEL, WATCH_STATUS_SHORT_LABEL, type UpdateItemInput, type WatchlistItem, type WatchStatus } from '@marquee/shared';
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

const STATUS_OPTIONS = WATCH_STATUSES.map((s) => ({ value: s, label: WATCH_STATUS_SHORT_LABEL[s] }));

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
            className="-mt-1 h-8 w-8 shrink-0 rounded-full border border-line bg-surface-2 px-0 text-ink-faint hover:border-danger/50"
            aria-label={`Remove ${item.title} from your watchlist`}
            onClick={onRemove}
            disabled={isPending}
            isLoading={isRemoving}
          >
            {!isRemoving && (
              <svg viewBox="0 0 20 20" fill="none" className="size-4" aria-hidden="true">
                <path d="M6 6l8 8M14 6 6 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
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
          className="hidden w-full sm:inline-flex [&>button]:flex-1"
        />
        {/* Two-column phone cards are too narrow for three segments; a native select is the better touch control. */}
        <select
          aria-label={`Status for ${item.title}`}
          value={item.status}
          disabled={isPending}
          onChange={(e) => onUpdate({ status: e.target.value as WatchStatus })}
          className="h-11 w-full rounded-lg border border-line bg-surface-1 px-3 text-sm text-ink focus:border-accent focus:outline-none disabled:opacity-50 sm:hidden"
        >
          {WATCH_STATUSES.map((s) => (
            <option key={s} value={s}>
              {WATCH_STATUS_LABEL[s]}
            </option>
          ))}
        </select>

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

