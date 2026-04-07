import React from 'react';
import { Box, Tooltip, IconButton } from '@mui/material';
import { NavLink } from 'react-router-dom';

const NAV_ITEMS = [
  { to: '/', icon: 'uil-bolt-alt', label: 'Templates' },
  { to: '/slots', icon: 'uil-chart-bar', label: 'Aviator Tracker' },
  { to: '/tickets', icon: 'uil-ticket', label: 'Tickets' },
];

const GlobalNav = () => (
  <Box
    component="nav"
    sx={{
      width: { xs: '100%', md: 68 },
      height: { xs: 68, md: '100%' },
      bgcolor: '#0B0E14',
      borderRight: { xs: 'none', md: '1px solid' },
      borderTop: { xs: '1px solid', md: 'none' },
      borderColor: 'divider',
      display: 'flex',
      flexDirection: { xs: 'row', md: 'column' },
      alignItems: 'center',
      justifyContent: { xs: 'space-around', md: 'flex-start' },
      pt: { xs: 0, md: 2.5 },
      gap: { xs: 0, md: 1.5 },
      flexShrink: 0,
      zIndex: 100,
      position: { xs: 'fixed', md: 'relative' },
      bottom: { xs: 20, md: 'auto' },
      left: { xs: 16, md: 'auto' },
      right: { xs: 16, md: 'auto' },
      width: { xs: 'calc(100% - 32px)', md: 68 },
      borderRadius: { xs: 6, md: 0 },
      backdropFilter: { xs: 'blur(32px) saturate(200%)', md: 'none' },
      WebkitBackdropFilter: { xs: 'blur(32px) saturate(200%)', md: 'none' },
      background: { xs: 'rgba(11,14,20,0.8)', md: '#0B0E14' },
    }}
  >
    {NAV_ITEMS.map(({ to, icon, label }) => (
      <Tooltip key={to} title={label} placement="right">
        <NavLink to={to} end={to === '/'} style={{ textDecoration: 'none' }}>
          {({ isActive }) => (
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: 2.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                cursor: 'pointer',
                color: isActive ? 'primary.main' : 'text.secondary',
                bgcolor: isActive ? 'rgba(255,75,75,0.1)' : 'transparent',
                boxShadow: isActive ? '0 0 20px rgba(255,75,75,0.15)' : 'none',
                transition: 'all 0.25s ease',
                '&:hover': {
                  color: 'text.primary',
                  bgcolor: 'rgba(255,255,255,0.05)',
                },
                // Active indicator line
                '&::before': isActive ? {
                  content: '""',
                  position: 'absolute',
                  left: { xs: '50%', md: -2 },
                  top: { xs: -4, md: '50%' },
                  transform: { xs: 'translateX(-50%)', md: 'translateY(-50%)' },
                  width: { xs: 20, md: 4 },
                  height: { xs: 4, md: 20 },
                  bgcolor: 'primary.main',
                  borderRadius: '0 4px 4px 0',
                } : {},
              }}
            >
              <i className={`uil ${icon}`} style={{ fontSize: 22 }} />
            </Box>
          )}
        </NavLink>
      </Tooltip>
    ))}
  </Box>
);

export default GlobalNav;
