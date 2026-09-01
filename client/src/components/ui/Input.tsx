import { useId, type InputHTMLAttributes } from 'react';
import { cn } from '../../lib/cn';

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string | undefined;
  hint?: string;
};

export function Input({ label, error, hint, className, id: idProp, ...rest }: InputProps) {
  const autoId = useId();
  const id = idProp ?? autoId;
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-ink-muted">
        {label}
      </label>
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={cn(
          'h-11 rounded-lg border bg-surface-1 px-3.5 text-ink placeholder:text-ink-faint',
          'transition-[border-color,box-shadow] duration-(--duration-fast)',
          'focus:outline-none focus:border-accent focus:shadow-[0_0_0_3px_oklch(82%_0.16_80/0.2)]',
          error ? 'border-danger' : 'border-line hover:border-line-strong',
          className,
        )}
        {...rest}
      />
      {error ? (
        <p id={`${id}-error`} className="text-sm text-danger" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-xs text-ink-faint">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
