import React from 'react';
import { createTheme, ThemeProvider, CssBaseline } from '@mui/material';
import { Routes, Route, Navigate } from 'react-router-dom';
import AppShell from './components/AppShell';
import Dashboard from './pages/Dashboard';
import Templates from './pages/Templates';
import Tickets from './pages/Tickets';
import SlotTracker from './pages/SlotTracker';
import Rota from './pages/Rota';
import Resources from './pages/Resources';
import Tools from './pages/Tools';
import TourGuide from './components/TourGuide';

// Maintain the MUI theme for underlying MUI components (like Dialogs) 
// but ensure it aligns with the new design's core palette.
export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#2563eb', light: '#3b82f6', dark: '#1d4ed8' },
    secondary: { main: '#10b981', light: '#34d399', dark: '#059669' },
    background: {
      default: '#08080c',
      paper: '#0f0f16',
    },
    divider: '#1e1e2d',
    text: {
      primary: '#f8fafc',
      secondary: '#94a3b8',
    },
  },
  typography: {
    fontFamily: '"Outfit", "Inter", "Roboto", sans-serif',
    button: { textTransform: 'none', fontWeight: 700, letterSpacing: '0.02em' },
    h1: { fontFamily: '"Space Grotesk", sans-serif', fontWeight: 700 },
    h2: { fontFamily: '"Space Grotesk", sans-serif', fontWeight: 700 },
    h3: { fontFamily: '"Space Grotesk", sans-serif', fontWeight: 700 },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundImage: 'none',
          scrollbarWidth: 'thin',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          borderRadius: 12,
          border: '1px solid rgba(255,255,255,0.06)',
          backgroundColor: '#0F111A',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: '#0f0f16',
          backgroundImage: 'none',
          border: '1px solid #1e1e2d',
          borderRadius: 24,
          boxShadow: 'none',
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppShell>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/templates" element={<Templates />} />
          <Route path="/tickets" element={<Tickets />} />
          <Route path="/slots" element={<SlotTracker />} />
          <Route path="/rota" element={<Rota />} />
          <Route path="/resources" element={<Resources />} />
          <Route path="/tools" element={<Tools />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppShell>
    </ThemeProvider>
  );
}

export default App;
