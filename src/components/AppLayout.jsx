import React from 'react';
import { Box } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import GlobalNav from './GlobalNav';
import ContextSidebar from './ContextSidebar';
import AppHeader from './AppHeader';
import { useNavigation } from '../context/NavigationContext';

const AppLayout = ({
  children,
  headerTitle,
  onSearch,
  sidebarTitle,
  sidebarItems,
  activeSidebarItem,
  onSidebarItemClick,
  bottomActions,
}) => {
  const { isMobileSidebarOpen, closeMobileSidebar } = useNavigation();
  const location = useLocation();

  return (
    <Box sx={{ display: 'flex', height: '100dvh', overflow: 'hidden', bgcolor: 'background.default' }}>
      {/* Left global icon rail */}
      <GlobalNav />

      {/* Context sidebar */}
      <ContextSidebar
        title={sidebarTitle}
        items={sidebarItems}
        activeItem={activeSidebarItem}
        onItemClick={onSidebarItemClick}
        bottomActions={bottomActions}
      />

      {/* Main content */}
      <Box component="main" sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
        <AppHeader title={headerTitle} onSearch={onSearch} />
        <Box
          sx={{
            flex: 1,
            overflowY: 'auto',
            p: { xs: 2, md: 4 },
            pb: { xs: '100px', md: 4 },
            '&::-webkit-scrollbar': { width: 6 },
            '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 3 },
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </Box>
      </Box>

      {/* Mobile overlay */}
      <AnimatePresence>
        {isMobileSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeMobileSidebar}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.7)',
              backdropFilter: 'blur(6px)',
              zIndex: 1000,
            }}
          />
        )}
      </AnimatePresence>
    </Box>
  );
};

export default AppLayout;
