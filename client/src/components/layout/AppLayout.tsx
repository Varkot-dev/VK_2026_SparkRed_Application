import type { PublicUser } from '@marquee/shared';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useLoaderData, useLocation, useOutlet } from 'react-router';
import { Board } from './Board';

export function AppLayout() {
  const user = useLoaderData() as PublicUser;
  const outlet = useOutlet();
  const { pathname } = useLocation();
  const reduceMotion = useReducedMotion();

  return (
    <div className="flex min-h-dvh flex-col">
      <Board user={user} />
      <main className="wrap w-full flex-1">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={pathname}
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -4 }}
            transition={{ duration: 0.18, ease: [0.2, 0.7, 0.3, 1] }}
          >
            {outlet}
          </motion.div>
        </AnimatePresence>
      </main>
      <footer className="wrap w-full">
        <div className="colophon">
          <span>Marquee · No refunds</span>
          <span>
            Film data from{' '}
            <a href="https://www.themoviedb.org/" target="_blank" rel="noreferrer">
              TMDB
            </a>
            . Not endorsed or certified by TMDB.
          </span>
        </div>
      </footer>
    </div>
  );
}
