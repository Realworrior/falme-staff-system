import React from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import BottomNav from './BottomNav';

const AppShell = ({ children }) => {
  const location = useLocation();

  return (
    <div className="relative h-screen w-full bg-background text-foreground overflow-hidden flex flex-col md:flex-row">
      {/* Global Navigation - Acts as Sidebar on Desktop, BottomNav on Mobile */}
      <BottomNav className="z-50" />

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden relative z-10">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="w-full pb-32 md:pb-8 md:px-4"
          >
            {children}
          </motion.div>
      </div>
    </div>
  );
};

export default AppShell;
