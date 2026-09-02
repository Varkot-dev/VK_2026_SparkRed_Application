import type { ButtonHTMLAttributes } from 'react';
import { cn } from '../../lib/cn';

type Variant = 'blue' | 'red' | 'ghost' | 'ink' | 'done';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: 'sm' | 'md';
  block?: boolean;
  isLoading?: boolean;
};

const VARIANT: Record<Variant, string> = {
  blue: '',
  red: 'btn--red',
  ghost: 'btn--ghost',
  ink: 'btn--ink',
  done: 'btn--done',
};

export function Button({ variant = 'blue', size = 'md', block, isLoading, className, children, disabled, ...rest }: ButtonProps) {
  return (
    <button
      className={cn('btn', VARIANT[variant], size === 'sm' && 'btn--sm', block && 'btn--block', className)}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      {...rest}
    >
      {isLoading && <span className="spin" aria-hidden="true" />}
      {children}
    </button>
  );
}
