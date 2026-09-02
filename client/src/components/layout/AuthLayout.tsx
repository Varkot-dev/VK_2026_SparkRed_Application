import { motion, useReducedMotion } from 'motion/react';
import { Outlet } from 'react-router';

export function AuthLayout() {
  const reduceMotion = useReducedMotion();
  return (
    <div className="lobby">
      <motion.div
        className="w-full max-w-[26rem]"
        initial={reduceMotion ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.2, 0.7, 0.3, 1] }}
      >
        <Outlet />
        <p className="lobby__note">Film data from TMDB · Not endorsed or certified by TMDB</p>
      </motion.div>
    </div>
  );
}
