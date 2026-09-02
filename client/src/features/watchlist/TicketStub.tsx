import type { UpdateItemInput, WatchlistItem } from '@marquee/shared';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Holes } from '../../components/ui/Holes';
import { PosterImage } from '../../components/ui/PosterImage';
import { PunchStrip } from '../../components/ui/PunchStrip';
import { Stamp } from '../../components/ui/Stamp';
import { printedDate, seatFor, serialFor } from '../../lib/ticket';

type TicketStubProps = {
  item: WatchlistItem;
  index: number;
  onUpdate: (patch: UpdateItemInput) => void;
  onRemove: () => void;
  isRemoving: boolean;
};

const SHELF_DAYS = 90;
const PRINT_STEPS = 12;
/** Thermal print head: the stub reveals top-to-bottom in discrete steps, not a fade. */
const printHead = (t: number) => Math.min(1, Math.ceil(t * PRINT_STEPS) / PRINT_STEPS);

function daysSince(iso: string): number {
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
}

export function TicketStub({ item, index, onUpdate, onRemove, isRemoving }: TicketStubProps) {
  const reduceMotion = useReducedMotion();
  const [voiding, setVoiding] = useState(false);
  const isPending = item.id < 0;
  const onShelf = item.status !== 'watched' && daysSince(item.addedAt) >= SHELF_DAYS;

  return (
    <motion.li
      layout={!reduceMotion}
      className={`stub${voiding ? ' stub--voiding' : ''}`}
      style={{ transformOrigin: 'left bottom' }}
      initial={reduceMotion ? false : { clipPath: 'inset(0 0 100% 0)', opacity: 1 }}
      animate={{ clipPath: 'inset(0 0 0% 0)', opacity: 1 }}
      exit={reduceMotion ? { opacity: 0 } : { rotate: -7, x: -28, y: 10, opacity: 0, transition: { duration: 0.32, ease: [0.4, 0, 1, 1] } }}
      transition={{ clipPath: { duration: 0.5, ease: printHead, delay: Math.min(index * 0.05, 0.4) }, layout: { type: 'spring', stiffness: 400, damping: 36 } }}
      aria-busy={isPending || isRemoving || undefined}
    >
      <span className="stub__notch" aria-hidden="true" />

      <div className="stub__tear" aria-hidden="true">
        <span className="stub__serial">
          Admit one &nbsp; No <b>{serialFor(item.tmdbId)}</b> &nbsp; Row {seatFor(item.id)}
        </span>
      </div>

      <div className="stub__body">
        <PosterImage posterPath={item.posterPath} title={item.title} priority={index < 4}>
          <Stamp status={item.status} />
          {onShelf && <span className="stub__band">On the shelf</span>}
          {item.releaseYear && <span className="poster__year">{item.releaseYear}</span>}
        </PosterImage>

        <div className="stub__print">
          <h3 className="stub__title" title={item.title}>
            {item.title}
          </h3>
          <p className="stub__meta">
            <span>Added {printedDate(item.addedAt)}</span>
            <i>•</i>
            <span>Seat {seatFor(item.id)}</span>
          </p>

          <div className="stub__controls">
            <PunchStrip label={`Status for ${item.title}`} value={item.status} disabled={isPending} onChange={(status) => onUpdate({ status })} />
            {item.status === 'watched' && (
              <Holes title={item.title} value={item.rating} disabled={isPending} onChange={(rating) => onUpdate({ rating })} />
            )}
          </div>

          <button type="button" className="stub__void" onClick={() => setVoiding(true)} disabled={isPending || isRemoving}>
            Void this ticket
          </button>
        </div>

        <AnimatePresence>
          {voiding && (
            <motion.div
              className="void"
              role="alertdialog"
              aria-label={`Void ${item.title}?`}
              initial={reduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <span className="void__stamp" aria-hidden="true">
                Void
              </span>
              <p className="void__q">Take {item.title} off the roll?</p>
              <div className="void__row">
                <Button variant="ghost" size="sm" onClick={() => setVoiding(false)} autoFocus>
                  Keep it
                </Button>
                <Button variant="red" size="sm" isLoading={isRemoving} onClick={onRemove}>
                  Void it
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.li>
  );
}
