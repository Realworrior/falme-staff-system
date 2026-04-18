import React from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import BottomNav from './BottomNav';

const AppShell = ({ children }) => {
  const location = useLocation();

  return (
    <div className="relative h-screen w-full bg-background text-foreground overflow-hidden flex flex-col">
      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden relative">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="w-full pb-32"
          >
            {children}
          </motion.div>
      </div>

      {/* Global Bottom Navigation */}
      <BottomNav className="z-50" />
    </div>
  );
};

export default AppShell;
