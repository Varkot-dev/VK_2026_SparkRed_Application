import type { SelectHTMLAttributes } from 'react';
import { cn } from '../../lib/cn';

type Option<V extends string> = { value: V; label: string };

type SelectProps<V extends string> = Omit<SelectHTMLAttributes<HTMLSelectElement>, 'onChange' | 'value'> & {
  label: string;
  value: V;
  options: readonly Option<V>[];
  onChange: (value: V) => void;
};

export function Select<V extends string>({ label, value, options, onChange, className, ...rest }: SelectProps<V>) {
  return (
    <label className="inline-flex items-center gap-2 text-sm text-ink-muted">
      <span className="sr-only sm:not-sr-only">{label}</span>
      <span className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value as V)}
          aria-label={label}
          className={cn(
            'h-10 appearance-none rounded-lg border border-line bg-surface-1 pl-3 pr-9 text-sm text-ink',
            'hover:border-line-strong focus:outline-none focus:border-accent cursor-pointer',
            'transition-colors duration-(--duration-fast)',
            className,
          )}
          {...rest}
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <svg className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-ink-faint" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path d="m6 8 4 4 4-4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    </label>
  );
}
