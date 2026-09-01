import { createContext, useContext } from 'react';

export type ToastTone = 'info' | 'success' | 'error';
export type ToastContextValue = { push: (message: string, tone?: ToastTone) => void };

export const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}
