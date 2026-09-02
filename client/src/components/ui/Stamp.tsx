import { WATCH_STATUS_SHORT_LABEL, type WatchStatus } from '@marquee/shared';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';

const ROTATION: Record<WatchStatus, number> = { want: -6, watching: 6, watched: -11 };

/** Rubber-stamp status. A new status slams down: big, then settles into the paper. */
export function Stamp({ status, animate = true }: { status: WatchStatus; animate?: boolean }) {
  const reduceMotion = useReducedMotion();
  const rot = ROTATION[status];
  return (
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.span
        key={status}
        className={`stamp stamp--${status}`}
        aria-hidden="true"
        initial={reduceMotion || !animate ? false : { scale: 2.2, opacity: 0, rotate: rot - 10 }}
        animate={{ scale: 1, opacity: status === 'want' ? 0.72 : 0.86, rotate: rot }}
        exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.9, transition: { duration: 0.12 } }}
        transition={{ type: 'spring', stiffness: 900, damping: 30, mass: 0.6 }}
      >
        {WATCH_STATUS_SHORT_LABEL[status]}
      </motion.span>
    </AnimatePresence>
  );
}
