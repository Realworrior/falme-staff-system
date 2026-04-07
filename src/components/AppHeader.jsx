import React, { useState, useEffect } from 'react';
import { Box, InputBase, IconButton, Typography, Tooltip } from '@mui/material';
import { Search, ArrowLeft } from 'lucide-react';
import { useNavigation } from '../context/NavigationContext';

const AppHeader = ({ title, onSearch }) => {
  const { toggleSidebar } = useNavigation();
  const [time, setTime] = useState(new Date().toLocaleTimeString('en-GB'));
  const [query, setQuery] = useState('');

  useEffect(() => {
    const t = setInterval(() => setTime(new Date().toLocaleTimeString('en-GB')), 1000);
    return () => clearInterval(t);
  }, []);

  const handleSearch = (e) => {
    setQuery(e.target.value);
    onSearch?.(e.target.value);
  };

  return (
    <Box
      component="header"
      sx={{
        height: 72,
        px: { xs: 2.5, md: 4 },
        bgcolor: 'rgba(5,5,13,0.7)',
        borderBottom: '1px solid',
        borderColor: 'divider',
        backdropFilter: 'blur(24px) saturate(180%)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        flexShrink: 0,
        zIndex: 80,
      }}
    >
      {/* Hamburger */}
      <Tooltip title="Toggle Sidebar">
        <IconButton onClick={toggleSidebar} size="small" sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
          <i className="uil uil-bars" style={{ fontSize: 20, color: 'var(--text-secondary)' }} />
        </IconButton>
      </Tooltip>

      {/* Title */}
      <Typography variant="h6" sx={{ fontSize: 16, fontWeight: 600, flexShrink: 0, display: { xs: 'none', sm: 'block' } }}>
        {title}
      </Typography>

      {/* Search */}
      <Box sx={{ flex: 1, maxWidth: 480, mx: { xs: 1, md: 3 } }}>
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          px: 2,
          py: 0.75,
          bgcolor: 'rgba(255,255,255,0.04)',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
          transition: 'border-color 0.2s, box-shadow 0.2s',
          '&:focus-within': {
            borderColor: 'primary.main',
            boxShadow: '0 0 0 3px rgba(255,75,75,0.12)',
          },
        }}>
          <Search size={16} color="#A1A1AA" />
          <InputBase
            value={query}
            onChange={handleSearch}
            placeholder={`Search ${title.toLowerCase()}...`}
            sx={{ flex: 1, fontSize: 14, color: 'text.primary', '& input::placeholder': { color: 'text.secondary' } }}
          />
        </Box>
      </Box>

      {/* Clock */}
      <Typography
        variant="caption"
        sx={{
          ml: 'auto',
          fontFamily: '"Space Mono", monospace',
          color: 'text.secondary',
          fontSize: 13,
          letterSpacing: 1,
          display: { xs: 'none', sm: 'block' },
        }}
      >
        {time}
      </Typography>
    </Box>
  );
};

export default AppHeader;
