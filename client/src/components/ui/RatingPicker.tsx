import { RATING_MAX, RATING_MIN } from '@marquee/shared';
import { cn } from '../../lib/cn';

type RatingPickerProps = {
  value: number | null;
  onChange: (value: number | null) => void;
  disabled?: boolean;
};

const SCALE = Array.from({ length: RATING_MAX - RATING_MIN + 1 }, (_, i) => RATING_MIN + i);

/** Ten small toggles; clicking the current value clears it. */
export function RatingPicker({ value, onChange, disabled }: RatingPickerProps) {
  return (
    <div role="radiogroup" aria-label="Your rating out of 10" className="flex items-center gap-1">
      {SCALE.map((n) => {
        const active = value !== null && n <= value;
        const selected = n === value;
        return (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={`${n} out of ${RATING_MAX}`}
            disabled={disabled}
            onClick={() => onChange(selected ? null : n)}
            className={cn(
              'size-7 rounded-md text-[11px] font-semibold tabular-nums transition-[background-color,color,transform] duration-(--duration-fast)',
              'hover:scale-110 active:scale-95 disabled:opacity-50 disabled:pointer-events-none',
              active ? 'bg-accent text-accent-ink' : 'bg-surface-2 text-ink-faint hover:text-ink',
            )}
          >
            {n}
          </button>
        );
      })}
    </div>
  );
}
