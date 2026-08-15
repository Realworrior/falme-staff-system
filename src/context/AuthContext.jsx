import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const AUTH_STORAGE_KEY = 'falme_staff_auth_session';
const VALID_PIN = '54321';

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (!stored) return false;
      const data = JSON.parse(stored);
      // Valid for 7 days
      if (Date.now() - (data.timestamp || 0) < 7 * 24 * 60 * 60 * 1000) {
        return true;
      }
      localStorage.removeItem(AUTH_STORAGE_KEY);
      return false;
    } catch {
      return false;
    }
  });

  const login = (pin) => {
    if (pin.trim() === VALID_PIN) {
      setIsAuthenticated(true);
      localStorage.setItem(
        AUTH_STORAGE_KEY,
        JSON.stringify({ authenticated: true, timestamp: Date.now() })
      );
      return { success: true };
    }
    return { success: false, error: 'Incorrect PIN. Please try again.' };
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
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
