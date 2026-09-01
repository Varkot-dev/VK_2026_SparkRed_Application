import { Spinner } from '../ui/Button';
import { Brand } from './Brand';

/** Shown only while the very first auth check runs, before the router can render a route. */
export function AppBoot() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4" aria-busy="true" aria-live="polite">
      <Brand size="lg" />
      <Spinner className="text-ink-faint" />
      <span className="sr-only">Loading Marquee</span>
    </div>
  );
}
