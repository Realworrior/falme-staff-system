import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);

const AUTH_STORAGE_KEY = 'falme_staff_auth_session';
const AUTH_COOKIE_KEY = 'falme_staff_auth';
const VALID_PIN = '54321';
// Standard 30-day session lifetime
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

// Helper to write a persistent cookie (Expires in 30 days)
const setAuthCookie = () => {
  const date = new Date(Date.now() + SESSION_TTL_MS);
  document.cookie = `${AUTH_COOKIE_KEY}=1; expires=${date.toUTCString()}; path=/; SameSite=Strict`;
};

// Helper to clear the cookie
const clearAuthCookie = () => {
  document.cookie = `${AUTH_COOKIE_KEY}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Strict`;
};

// Helper to check if the cookie exists
const hasAuthCookie = () => {
  return document.cookie.split(';').some(item => item.trim().startsWith(`${AUTH_COOKIE_KEY}=1`));
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      // 1. Check persistent localStorage session cache
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        const lastActive = data.lastActive || data.timestamp || 0;
        if (Date.now() - lastActive < SESSION_TTL_MS) {
          // Slide session timestamp on active check
          localStorage.setItem(
            AUTH_STORAGE_KEY,
            JSON.stringify({ authenticated: true, lastActive: Date.now() })
          );
          setAuthCookie();
          return true;
        }
      }

      // 2. Check persistent cookie cache as backup
      if (hasAuthCookie()) {
        localStorage.setItem(
          AUTH_STORAGE_KEY,
          JSON.stringify({ authenticated: true, lastActive: Date.now() })
        );
        return true;
      }

      // Session expired or non-existent
      localStorage.removeItem(AUTH_STORAGE_KEY);
      clearAuthCookie();
      return false;
    } catch {
      return false;
    }
  });

  // Sliding session activity updater — keep session fresh while using app
  const touchSession = useCallback(() => {
    if (!isAuthenticated) return;
    try {
      localStorage.setItem(
        AUTH_STORAGE_KEY,
        JSON.stringify({ authenticated: true, lastActive: Date.now() })
      );
      setAuthCookie();
    } catch {
      // Ignore storage errors
    }
  }, [isAuthenticated]);

  // Keep session alive on user interaction (clicks, keystrokes, visibility change)
  useEffect(() => {
    if (!isAuthenticated) return;

    const handleUserActivity = () => {
      touchSession();
    };

    window.addEventListener('click', handleUserActivity, { passive: true });
    window.addEventListener('keydown', handleUserActivity, { passive: true });
    document.addEventListener('visibilitychange', handleUserActivity, { passive: true });

    return () => {
      window.removeEventListener('click', handleUserActivity);
      window.removeEventListener('keydown', handleUserActivity);
      document.removeEventListener('visibilitychange', handleUserActivity);
    };
  }, [isAuthenticated, touchSession]);

  const login = (pin) => {
    if (pin.trim() === VALID_PIN) {
      setIsAuthenticated(true);
      const sessionData = {
        authenticated: true,
        lastActive: Date.now(),
        loginAt: Date.now()
      };
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(sessionData));
      setAuthCookie();
      return { success: true };
    }
    return { success: false, error: 'Incorrect PIN. Please try again.' };
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    clearAuthCookie();
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, touchSession }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
