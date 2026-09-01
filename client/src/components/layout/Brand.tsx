import { Link } from 'react-router';
import { cn } from '../../lib/cn';

export function Brand({ className, size = 'md' }: { className?: string; size?: 'md' | 'lg' }) {
  return (
    <Link to="/" className={cn('group inline-flex items-center gap-2.5', className)} aria-label="Marquee home">
      <span
        aria-hidden="true"
        className={cn(
          'grid place-items-center rounded-md bg-accent font-display font-semibold text-accent-ink',
          'transition-transform duration-(--duration-fast) group-hover:-rotate-3',
          size === 'lg' ? 'size-10 text-2xl' : 'size-7 text-base',
        )}
      >
        M
      </span>
      <span className={cn('font-display tracking-tight text-ink', size === 'lg' ? 'text-3xl' : 'text-xl')}>Marquee</span>
    </Link>
  );
}
