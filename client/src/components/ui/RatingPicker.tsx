import { RATING_MAX, RATING_MIN } from '@marquee/shared';
import { cn } from '../../lib/cn';

type RatingPickerProps = {
  value: number | null;
  onChange: (value: number | null) => void;
  disabled?: boolean;
};

const SCALE = Array.from({ length: RATING_MAX - RATING_MIN + 1 }, (_, i) => RATING_MIN + i);

/**
 * Ten toggles on wider screens (clicking the current value clears it);
 * a native select on phones, where ten 28px targets would be too fiddly.
 */
export function RatingPicker({ value, onChange, disabled }: RatingPickerProps) {
  return (
    <>
      <div role="radiogroup" aria-label="Your rating out of 10" className="hidden items-center gap-1 sm:flex">
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
      <label className="flex items-center gap-2 text-sm text-ink-muted sm:hidden">
        <span>Rating</span>
        <select
          value={value ?? ''}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))}
          className="h-11 flex-1 rounded-lg border border-line bg-surface-1 px-3 text-ink focus:border-accent focus:outline-none disabled:opacity-50"
        >
          <option value="">Not rated</option>
          {SCALE.map((n) => (
            <option key={n} value={n}>
              {n} / {RATING_MAX}
            </option>
          ))}
        </select>
      </label>
    </>
  );
}
