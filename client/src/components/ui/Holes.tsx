import { RATING_MAX, RATING_MIN } from '@marquee/shared';
import { motion, useReducedMotion } from 'motion/react';
import { cn } from '../../lib/cn';

type HolesProps = {
  title: string;
  value: number | null;
  onChange: (value: number | null) => void;
  disabled?: boolean;
};

const SCALE = Array.from({ length: RATING_MAX - RATING_MIN + 1 }, (_, i) => RATING_MIN + i);

/** Rating as ten punch positions; punching a hole floods every cell up to it with ink. */
export function Holes({ title, value, onChange, disabled }: HolesProps) {
  const reduceMotion = useReducedMotion();
  return (
    <div className="rating">
      <p className="rating__head">
        <span>Your rating</span>
        {value === null ? (
          <span className="rating__score rating__score--none">Not punched</span>
        ) : (
          <motion.span
            key={value}
            className="rating__score"
            initial={reduceMotion ? false : { scale: 1.35, opacity: 0.4 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 700, damping: 28 }}
          >
            {value}/10
          </motion.span>
        )}
      </p>
      <div className="holes" role="group" aria-label={`Rate ${title} out of 10`}>
        {SCALE.map((n) => {
          const punched = value !== null && n <= value;
          const selected = n === value;
          return (
            <motion.button
              key={n}
              type="button"
              className={cn('hole', punched && 'is-punched')}
              aria-label={`${n} out of ${RATING_MAX}`}
              aria-pressed={selected}
              disabled={disabled}
              whileTap={reduceMotion ? undefined : { scale: 0.82 }}
              onClick={() => onChange(selected ? null : n)}
            />
          );
        })}
      </div>
    </div>
  );
}
