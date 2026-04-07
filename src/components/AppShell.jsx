import React from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import { useNavigation } from '../context/NavigationContext';

const AppShell = ({ children }) => {
  const { isMobileSidebarOpen, toggleSidebar, closeMobileSidebar } = useNavigation();
  const location = useLocation();

  // Condition to switch to Bottom Navigation mode
  const isTemplateRoute = location.pathname === '/templates';

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden font-sans">
      {/* Desktop Sidebar */}
      <AnimatePresence mode="wait">
        <motion.div 
          initial={{ opacity: 0, x: -80 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -80 }}
          className="hidden lg:block h-full z-40"
        >
          <Sidebar className="w-80" />
        </motion.div>
      </AnimatePresence>

      {/* Mobile Top Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-sidebar/80 backdrop-blur-xl border-b border-white/5 flex items-center px-4 z-50">
        <button 
          onClick={toggleSidebar}
          className="p-2 text-gray-400 hover:text-white bg-white/5 rounded-xl border border-white/5 transition-all active:scale-95"
        >
          <Menu size={20} />
        </button>
        <span className="ml-4 font-heading font-bold text-lg text-white underline decoration-red-600/50">Quickie</span>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 relative">
        <div className={`flex-1 overflow-auto transition-all duration-500 pt-16 lg:pt-0 ${
          isTemplateRoute ? "pb-28" : ""
        }`}>
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ 
                duration: 0.5, 
                ease: [0.23, 1, 0.32, 1] 
              }}
              className="min-h-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Tactical Bottom Navigation (Active on Templates route) */}
        <AnimatePresence>
          {isTemplateRoute && (
            <BottomNav className="flex" />
          )}
        </AnimatePresence>
      </main>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeMobileSidebar}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] lg:hidden"
            />
            
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 bottom-0 w-80 z-[70] lg:hidden shadow-2xl"
            >
              <div className="h-full relative">
                <Sidebar className="w-full h-full border-r-0" />
                <button 
                  onClick={closeMobileSidebar}
                  className="absolute top-6 right-6 p-2 text-gray-400 hover:text-white bg-white/5 rounded-xl border border-white/10"
                >
                  <X size={20} />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AppShell;
