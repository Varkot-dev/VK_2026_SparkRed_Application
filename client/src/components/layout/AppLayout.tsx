import type { PublicUser } from '@marquee/shared';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useLocation, useLoaderData, useOutlet } from 'react-router';
import { TopNav } from './TopNav';

export function AppLayout() {
  const user = useLoaderData() as PublicUser;
  const outlet = useOutlet();
  const { pathname } = useLocation();
  const reduceMotion = useReducedMotion();

  return (
    <div className="flex min-h-dvh flex-col">
      <TopNav user={user} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-10">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={pathname}
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -6 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          >
            {outlet}
          </motion.div>
        </AnimatePresence>
      </main>
      <footer className="border-t border-line py-5 text-center text-xs text-ink-faint">
        This product uses the{' '}
        <a href="https://www.themoviedb.org/" className="underline-offset-2 hover:text-ink hover:underline" target="_blank" rel="noreferrer">
          TMDB
        </a>{' '}
        API but is not endorsed or certified by TMDB.
      </footer>
    </div>
  );
}
