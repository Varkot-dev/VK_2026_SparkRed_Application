import { motion, useReducedMotion } from 'motion/react';
import { Outlet } from 'react-router';
import { Brand } from './Brand';

export function AuthLayout() {
  const reduceMotion = useReducedMotion();
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-4 py-10">
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-sm"
      >
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <Brand size="lg" />
          <p className="text-sm text-ink-faint">Your movies, in lights.</p>
        </div>
        <div className="rounded-2xl border border-line bg-surface-1/80 p-6 shadow-poster backdrop-blur sm:p-8">
          <Outlet />
        </div>
      </motion.div>
      <p className="mt-8 text-xs text-ink-faint">Movie data from TMDB.</p>
    </div>
  );
}
