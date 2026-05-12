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

const CURRENT_VERSION = "2026-05-12T13:08:00Z";

function UpdateChecker() {
  const [showUpdate, setShowUpdate] = React.useState(false);

  React.useEffect(() => {
    const checkVersion = async () => {
      try {
        const response = await fetch('/version.json?t=' + Date.now());
        const data = await response.json();
        if (data.timestamp && data.timestamp !== CURRENT_VERSION) {
          setShowUpdate(true);
        }
      } catch (err) { /* Silent fail */ }
    };
    // Check every 60 seconds for near-instant update alerts
    const interval = setInterval(checkVersion, 60000);
    checkVersion(); 
    return () => clearInterval(interval);
  }, []);

  if (!showUpdate) return null;

  return (
    <>
      {/* High-Visibility Top Banner */}
      <div className="fixed top-0 left-0 right-0 z-[200] bg-red-600 text-white py-2 px-4 flex items-center justify-center gap-4 animate-in slide-in-from-top duration-500 shadow-lg">
        <span className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
          Critical System Update Available — Please Reload to Avoid Data Sync Issues
        </span>
        <button 
          onClick={() => window.location.reload()}
          className="bg-white text-red-600 px-3 py-1 rounded text-[9px] font-black uppercase tracking-widest hover:bg-gray-100 transition-colors"
        >
          Reload Page
        </button>
      </div>

      {/* Persistent Bottom Toast */}
      <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-md pointer-events-none">
        <div className="bg-[#0a0a0f]/95 backdrop-blur-2xl border border-red-500/40 p-4 rounded-3xl flex items-center justify-between gap-4 shadow-[0_0_50px_rgba(239,68,68,0.2)] pointer-events-auto animate-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-red-500 rounded-xl text-white shadow-lg shadow-red-500/20">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="animate-spin"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/></svg>
            </div>
            <div>
              <p className="text-[11px] font-black text-white uppercase tracking-widest">Action Required</p>
              <p className="text-[9px] text-red-400 font-black uppercase tracking-[0.2em] mt-0.5">Matrix Update Ready</p>
            </div>
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="px-5 py-2.5 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-xl active:scale-95"
          >
            Reload
          </button>
        </div>
      </div>
    </>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <UpdateChecker />
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
