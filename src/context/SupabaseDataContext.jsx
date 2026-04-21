import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const SupabaseDataContext = createContext();

export const SupabaseDataProvider = ({ children }) => {
  const [tickets, setTickets] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // 1. Check for stored session locally
    const storedUser = localStorage.getItem('betwin_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase fetch error:', error);
        setTickets([]);
      } else {
        setTickets(data || []);
      }
    } catch (err) {
      console.error('Critical Fetch Error:', err);
      setTickets([]);
      setError(err);
    } finally {
      setLoading(false);
      setIsReady(true);
    }
  };

  useEffect(() => {
    fetchTickets();
    
    // Real-time Subscription
    const subscription = supabase
      .channel('tickets_channel')
      .on('postgres_changes', { event: '*', table: 'tickets', schema: 'public' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setTickets(prev => [payload.new, ...prev]);
        } else if (payload.eventType === 'UPDATE') {
          setTickets(prev => prev.map(t => t.id === payload.new.id ? payload.new : t));
        } else if (payload.eventType === 'DELETE') {
          setTickets(prev => prev.filter(t => t.id === payload.old.id));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const loginWithPhone = async (phone, pin, role) => {
    // HARDCODED DEMO CREDENTIALS to bypass DB requirement
    // Matching 123-456-7890 / 1234
    // or 098-765-4321 / 4321
    
    // Check credentials locally
    let authUser = null;
    
    if (phone === '123-456-7890' && pin === '1234') {
        authUser = {
            id: 'staff-demo-id',
            phone: '123-456-7890',
            role: 'staff',
            name: 'Staff Operator'
        };
    } else if (phone === '098-765-4321' && pin === '4321') {
        authUser = {
            id: 'tech-demo-id',
            phone: '098-765-4321',
            role: 'technician',
            name: 'Technical Ops'
        };
    }
    
    if (authUser && (!role || role === authUser.role)) {
        setUser(authUser);
        localStorage.setItem('betwin_user', JSON.stringify(authUser));
        return authUser;
    }
    
    return null;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('betwin_user');
  };

  const createTicket = async (ticket) => {
    // We map frontend structure to the older dbTicket columns 
    const dbTicket = {
      ticket_id: ticket.id || `T-${Math.floor(1000 + Math.random() * 9000)}`,
      category: ticket.category,
      title: ticket.title,
      phone: ticket.phone,
      comments: ticket.description || ticket.comments,
      amount: ticket.amount ? parseFloat(ticket.amount) : null,
      time: ticket.time,
      game: ticket.game,
      bet_id: ticket.betId,
      possible_win: ticket.possibleWin,
      ten_digit_code: ticket.tenDigitCode,
      merchant: ticket.merchant,
      token_expired: ticket.tokenExpired,
      urgency: ticket.urgency,
      priority: ticket.priority,
      status: ticket.status || 'open',
      author: ticket.author || user?.name || 'Customer'
    };

    const { data, error } = await supabase
      .from('tickets')
      .insert([dbTicket])
      .select();

    if (error) {
        console.error("Create ticket error:", error.message);
        throw error;
    }
    return data[0];
  };

  const updateTicket = async (id, updates) => {
    const dbUpdates = { ...updates };
    
    const { data, error } = await supabase
      .from('tickets')
      .update(dbUpdates)
      .eq('id', id)
      .select();

    if (error) {
        // Fallback to searching by ticket_id if id is the 6-char code
        const { data: retryData, error: retryError } = await supabase
            .from('tickets')
            .update(dbUpdates)
            .eq('ticket_id', id)
            .select();
        if (retryError) throw retryError;
        return retryData[0];
    }
    return data[0];
  };

  const deleteTicket = async (id) => {
    const { error } = await supabase
      .from('tickets')
      .delete()
      .eq('id', id);

    if (error) {
        // Fallback
        const { error: retryError } = await supabase
            .from('tickets')
            .delete()
            .eq('ticket_id', id);
        if (retryError) throw retryError;
    }
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
