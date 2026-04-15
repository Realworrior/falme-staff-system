import React from 'react';
import {
  Box, List, ListItemButton, ListItemIcon, ListItemText, Typography,
  Divider, Button, Tooltip, IconButton
} from '@mui/material';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigation } from '../context/NavigationContext';

const ContextSidebar = ({ title, items = [], activeItem, onItemClick, bottomActions = [] }) => {
  const { isSidebarCollapsed, isMobileSidebarOpen, toggleSidebar } = useNavigation();

  const handleClick = (id) => {
    onItemClick(id);
  };

  return (
    <Box
      component="aside"
      id="sidebar"
      sx={{
        width: isSidebarCollapsed ? 0 : 260,
        minWidth: isSidebarCollapsed ? 0 : 260,
        bgcolor: 'background.paper',
        borderRight: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        transition: 'width 0.3s cubic-bezier(0.16,1,0.3,1), min-width 0.3s cubic-bezier(0.16,1,0.3,1)',
        flexShrink: 0,
        position: { xs: 'fixed', md: 'relative' },
        top: 0,
        left: 0,
        height: '100%',
        zIndex: { xs: 1100, md: 'auto' },
        transform: {
          xs: isMobileSidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
          md: 'none',
        },
        boxShadow: { xs: '20px 0 60px rgba(0,0,0,0.6)', md: 'none' },
      }}
    >
      {/* Header */}
      <Box sx={{ px: 2.5, py: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', minHeight: 72, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Typography variant="h6" sx={{ fontWeight: 700, background: 'linear-gradient(135deg, #ff6b6b, #fff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          {title}
        </Typography>
        <Tooltip title={isSidebarCollapsed ? 'Expand' : 'Collapse'}>
          <IconButton size="small" onClick={toggleSidebar} sx={{ border: '1px solid', borderColor: 'divider' }}>
            {isSidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </IconButton>
        </Tooltip>
      </Box>

      {/* Nav Items */}
      <List sx={{ flex: 1, overflowY: 'auto', px: 1.5, py: 1.5, '&::-webkit-scrollbar': { width: 4 }, '&::-webkit-scrollbar-thumb': { background: 'rgba(255,255,255,0.1)', borderRadius: 4 } }}>
        {items.map((item, idx) => {
          if (item.isLabel) {
            return (
              <Box key={idx} sx={{ px: 1.5, pt: 2.5, pb: 1 }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', fontSize: 10 }}>
                  {item.label}
                </Typography>
              </Box>
            );
          }
          const isActive = activeItem === item.id;
          return (
            <ListItemButton
              key={item.id + idx}
              selected={isActive}
              onClick={() => handleClick(item.id)}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                px: 1.5,
                py: 1,
                borderLeft: isActive ? '3px solid' : '3px solid transparent',
                borderLeftColor: isActive ? 'primary.main' : 'transparent',
                '&.Mui-selected': { bgcolor: 'rgba(255,75,75,0.06)', color: 'text.primary' },
                '&.Mui-selected:hover': { bgcolor: 'rgba(255,75,75,0.1)' },
                '&:hover': { bgcolor: 'rgba(255,255,255,0.04)' },
              }}
            >
              {item.icon && (
                <ListItemIcon sx={{ minWidth: 32, color: isActive ? 'primary.main' : 'text.secondary' }}>
                  <i className={`uil ${item.icon}`} style={{ fontSize: 18 }} />
                </ListItemIcon>
              )}
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{ fontSize: 14, fontWeight: isActive ? 600 : 400, color: isActive ? 'text.primary' : 'text.secondary' }}
              />
              {item.count !== undefined && (
                <Typography variant="caption" sx={{ bgcolor: isActive ? 'rgba(255,75,75,0.15)' : 'rgba(255,255,255,0.06)', color: isActive ? 'primary.main' : 'text.secondary', px: 1, py: 0.3, borderRadius: 1 }}>
                  {item.count}
                </Typography>
              )}
            </ListItemButton>
          );
        })}
      </List>

      {/* Bottom Actions */}
      {bottomActions.length > 0 && (
        <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider', display: 'flex', flexDirection: 'column', gap: 1 }}>
          {bottomActions.map((action, idx) => (
            <Button
              key={idx}
              variant={action.className === 'add-btn' ? 'contained' : 'outlined'}
              color={action.className === 'add-btn' ? 'primary' : 'inherit'}
              fullWidth
              startIcon={action.icon && <i className={`uil ${action.icon}`} />}
              onClick={action.onClick}
              size="small"
              sx={{ justifyContent: 'flex-start', px: 2, borderColor: 'divider' }}
            >
              {action.label}
            </Button>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default ContextSidebar;
