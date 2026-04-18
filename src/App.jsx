import React from 'react';
import { createTheme, ThemeProvider, CssBaseline } from '@mui/material';
import { Routes, Route, Navigate } from 'react-router-dom';
import AppShell from './components/AppShell';
import Dashboard from './pages/Dashboard';
import Templates from './pages/Templates';
import Tickets from './pages/Tickets';
import SlotTracker from './pages/SlotTracker';
import Rota from './pages/Rota/App';
import Resources from './pages/Resources';

// Maintain the MUI theme for underlying MUI components (like Dialogs) 
// but ensure it aligns with the new design's core palette.
export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#FF4B4B', light: '#ff7070', dark: '#c92a2a' },
    secondary: { main: '#3b82f6', light: '#60a5fa', dark: '#1d4ed8' },
    background: {
      default: '#05050D',
      paper: '#0F111A',
    },
    divider: 'rgba(255,255,255,0.06)',
    text: {
      primary: '#ffffff',
      secondary: '#A1A1AA',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", sans-serif',
    button: { textTransform: 'none', fontWeight: 600 },
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
          backgroundColor: '#0F111A',
          backgroundImage: 'linear-gradient(135deg, #1a1a24 0%, #0f0f17 100%)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 20,
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

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppShell>
    </ThemeProvider>
  );
}

export default App;
