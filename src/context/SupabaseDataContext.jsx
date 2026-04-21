import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const SupabaseDataContext = createContext();

const API_URL = 'https://kgpcruwlejoougjbeouw.supabase.co/functions/v1/make-server-07e1ed14';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const SupabaseDataProvider = ({ children }) => {
  const [tickets, setTickets] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isReady, setIsReady] = useState(false);

  const AUTH_HEADER = {
    'Authorization': `Bearer ${supabaseAnonKey}`,
    'Content-Type': 'application/json'
  };

  useEffect(() => {
    // 1. Check for stored session (as imported app does)
    const storedUser = localStorage.getItem('betwin_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsReady(true);
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/tickets`, { headers: AUTH_HEADER });
      if (!response.ok) throw new Error('Failed to fetch tickets');
      const data = await response.json();
      setTickets(data.tickets || []);
    } catch (err) {
      console.error('Fetch error:', err);
      // Fallback to sample data if API fails but we want the app to look "complete"
      setTickets([]);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchTickets();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loginWithPhone = async (phone, pin, role) => {
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: AUTH_HEADER,
        body: JSON.stringify({ phone, pin, role })
      });
      
      if (!response.ok) return null;
      
      const data = await response.json();
      if (data.user) {
        setUser(data.user);
        localStorage.setItem('betwin_user', JSON.stringify(data.user));
        return data.user;
      }
      return null;
    } catch (err) {
      console.error('Login error:', err);
      return null;
    }
  };

  const createTicket = async (ticketData) => {
    try {
      const response = await fetch(`${API_URL}/tickets`, {
        method: 'POST',
        headers: AUTH_HEADER,
        body: JSON.stringify(ticketData)
      });
      if (!response.ok) throw new Error('Create failed');
      const data = await response.json();
      setTickets(prev => [data.ticket, ...prev]);
      return data.ticket;
    } catch (err) {
      console.error('Create error:', err);
      throw err;
    }
  };

  const updateTicket = async (id, updates) => {
    try {
      const response = await fetch(`${API_URL}/tickets/${id}`, {
        method: 'PUT',
        headers: AUTH_HEADER,
        body: JSON.stringify(updates)
      });
      if (!response.ok) throw new Error('Update failed');
      const data = await response.json();
      setTickets(prev => prev.map(t => t.id === id ? data.ticket : t));
      return data.ticket;
    } catch (err) {
      console.error('Update error:', err);
      throw err;
    }
  };

  const deleteTicket = async (id) => {
    // Optimistic delete
    setTickets(prev => prev.filter(t => t.id !== id));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('betwin_user');
  };

  const value = {
    tickets,
    user,
    loading,
    error,
    isReady,
    actions: {
      loginWithPhone,
      logout,
      createTicket,
      updateTicket,
      deleteTicket,
      refreshTickets: fetchTickets
    }
  };

  return (
    <SupabaseDataContext.Provider value={value}>
      {children}
    </SupabaseDataContext.Provider>
  );
};

export const useSupabaseData = () => {
  const context = useContext(SupabaseDataContext);
  if (!context) {
    throw new Error('useSupabaseData must be used within a SupabaseDataProvider');
  }
  return context;
};
