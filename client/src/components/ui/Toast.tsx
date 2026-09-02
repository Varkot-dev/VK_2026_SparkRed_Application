import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { ToastContext, type ToastTone } from './toast-context';

type Toast = { id: number; message: string; tone: ToastTone };

const TOAST_TTL_MS = 3_800;
const MAX_VISIBLE = 3;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(1);

  const push = useCallback((message: string, tone: ToastTone = 'info') => {
    const id = nextId.current++;
    setToasts((prev) => [...prev.slice(-(MAX_VISIBLE - 1)), { id, message, tone }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), TOAST_TTL_MS);
  }, []);

  const value = useMemo(() => ({ push }), [push]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Receipts toasts={toasts} />
    </ToastContext.Provider>
  );
}

/** Toasts print like receipts: mono, boxed, torn off the bottom edge. */
function Receipts({ toasts }: { toasts: Toast[] }) {
  const reduceMotion = useReducedMotion();
  return (
    <div aria-live="polite" className="receipts">
      <AnimatePresence initial={false}>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            layout
            initial={reduceMotion ? false : { opacity: 0, y: 18, clipPath: 'inset(100% 0 0 0)' }}
            animate={{ opacity: 1, y: 0, clipPath: 'inset(0 0 0 0)' }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 6 }}
            transition={{ duration: 0.28, ease: [0.2, 0.7, 0.3, 1] }}
            role={t.tone === 'error' ? 'alert' : 'status'}
            className={cn('receipt', t.tone === 'success' && 'receipt--success', t.tone === 'error' && 'receipt--error')}
          >
            {t.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
