import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ToastContext = createContext({
  showToast: (msg, type) => {},
  addToast: (msg, type) => {},
});

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random().toString(36).substring(2, 6);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  }, []);

  const typeColors = {
    success: 'bg-[#00D66B]/15 border-[#00D66B]/40 text-[#00D66B]',
    error: 'bg-red-500/15 border-red-500/40 text-red-300',
    info: 'bg-blue-500/15 border-blue-500/40 text-blue-300',
    warning: 'bg-amber-500/15 border-amber-500/40 text-amber-300'
  };

  return (
    <ToastContext.Provider value={{ showToast, addToast: showToast }}>
      {children}
      <div className="fixed bottom-6 right-4 sm:right-6 z-50 flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map(t => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.95 }}
              className={`pointer-events-auto px-4 py-2.5 rounded-2xl border text-xs font-semibold backdrop-blur-xl shadow-2xl ${typeColors[t.type] || typeColors.success}`}
            >
              {t.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  return ctx || { showToast: () => {}, addToast: () => {} };
}
