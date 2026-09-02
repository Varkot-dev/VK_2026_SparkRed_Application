import { WATCH_STATUSES, WATCH_STATUS_LABEL, WATCH_STATUS_SHORT_LABEL, type WatchStatus } from '@marquee/shared';
import { cn } from '../../lib/cn';

type PunchStripProps = {
  label: string;
  value: WatchStatus;
  onChange: (status: WatchStatus) => void;
  disabled?: boolean;
};

/**
 * Three-state status. A dashed-divided punch strip on wider screens; a native
 * select on phones, where a two-column stub can't hold three mono labels.
 */
export function PunchStrip({ label, value, onChange, disabled }: PunchStripProps) {
  return (
    <>
      <div className="hidden sm:block">
      <div className="punchstrip" role="group" aria-label={label}>
        {WATCH_STATUSES.map((s) => (
          <button
            key={s}
            type="button"
            className={cn('punch', s === 'watched' && 'is-watched')}
            aria-pressed={s === value}
            disabled={disabled}
            onClick={() => s !== value && onChange(s)}
          >
            {WATCH_STATUS_SHORT_LABEL[s]}
          </button>
        ))}
      </div>
      </div>
      <select
        className="select sm:hidden"
        aria-label={label}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value as WatchStatus)}
      >
        {WATCH_STATUSES.map((s) => (
          <option key={s} value={s}>
            {WATCH_STATUS_LABEL[s]}
          </option>
        ))}
      </select>
    </>
  );
}
