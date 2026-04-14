import React from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import BottomNav from './BottomNav';

const AppShell = ({ children }) => {
  const location = useLocation();

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden font-sans">
      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 relative">
        <div className="flex-1 overflow-auto flex flex-col transition-all duration-500 pb-20">
          <AnimatePresence mode="popLayout">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ 
                duration: 0.5, 
                ease: [0.23, 1, 0.32, 1] 
              }}
              className="flex-1 w-full flex flex-col"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Global Footer Navigation (Universal across all devices & routes) */}
        <BottomNav className="flex" />
      </main>
    </div>
  );
};

export default AppShell;
