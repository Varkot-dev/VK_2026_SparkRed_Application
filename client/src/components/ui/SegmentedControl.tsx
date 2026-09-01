import { motion } from 'motion/react';
import { useId } from 'react';
import { cn } from '../../lib/cn';

type Option<V extends string> = { value: V; label: string; badge?: number };

type SegmentedControlProps<V extends string> = {
  label: string;
  value: V;
  options: readonly Option<V>[];
  onChange: (value: V) => void;
  size?: 'sm' | 'md';
  className?: string;
};

/** Radio-group semantics with a sliding highlight. */
export function SegmentedControl<V extends string>({ label, value, options, onChange, size = 'md', className }: SegmentedControlProps<V>) {
  const layoutId = useId();

  return (
    <div role="radiogroup" aria-label={label} className={cn('inline-flex rounded-lg border border-line bg-surface-1 p-1', className)}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.value)}
            className={cn(
              'relative isolate rounded-md font-medium whitespace-nowrap transition-colors duration-(--duration-fast)',
              size === 'sm' ? 'h-8 px-2.5 text-xs' : 'h-9 px-3.5 text-sm',
              active ? 'text-accent-ink' : 'text-ink-muted hover:text-ink',
            )}
          >
            {active && (
              <motion.span
                layoutId={layoutId}
                className="absolute inset-0 -z-10 rounded-md bg-accent"
                transition={{ type: 'spring', stiffness: 500, damping: 40 }}
              />
            )}
            {o.label}
            {o.badge !== undefined && (
              <span className={cn('ml-1.5 tabular-nums', active ? 'text-accent-ink/70' : 'text-ink-faint')}>{o.badge}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
