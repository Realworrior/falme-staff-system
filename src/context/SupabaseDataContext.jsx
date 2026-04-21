import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const SupabaseDataContext = createContext();

export const SupabaseDataProvider = ({ children }) => {
  const [tickets, setTickets] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // 1. Handle Authentication State
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    // 2. Initial Tickets Fetch
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
      }
    };

    fetchTickets();

    // 3. Real-time Subscription
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
      authSubscription.unsubscribe();
    };
  }, []);

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  };

  const loginWithPhone = async (phone, pin, role) => {
    try {
      const { data, error } = await supabase
        .from('staff_profiles') // Assumes this table exists
        .select('*')
        .eq('phone', phone)
        .eq('pin', pin)
        .eq('role', role)
        .single();
      
      if (error || !data) return null;
      
      // Persist as the tracking app expects
      const userData = {
        id: data.id,
        phone: data.phone,
        role: data.role,
        name: data.name
      };
      
      setUser(userData);
      localStorage.setItem('betwin_user', JSON.stringify(userData));
      return userData;
    } catch (err) {
      console.error('Login error:', err);
      return null;
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    localStorage.removeItem('betwin_user');
  };

  const createTicket = async (ticket) => {
    // Map frontend keys to DB columns if necessary
    const dbTicket = {
      ticket_id: ticket.id,
      category: ticket.category,
      title: ticket.title,
      phone: ticket.phone,
      comments: ticket.comments,
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
      status: ticket.status,
      author: ticket.author
    };

    const { data, error } = await supabase
      .from('tickets')
      .insert([dbTicket])
      .select();

    if (error) throw error;
    return data[0];
  };

  const updateTicket = async (id, updates) => {
    // Map status updates specifically if they come from the UI handleUpdateStatus
    const dbUpdates = { ...updates };
    if (updates.betId) dbUpdates.bet_id = updates.betId;
    if (updates.possibleWin) dbUpdates.possible_win = updates.possibleWin;
    if (updates.tenDigitCode) dbUpdates.ten_digit_code = updates.tenDigitCode;
    if (updates.tokenExpired) dbUpdates.token_expired = updates.tokenExpired;
    
    // Some updates might be using ticket_id or the internal uuid
    // The UI uses 'firebaseKey || id'. We should ensure we use the correct UUID.
    
    const { data, error } = await supabase
      .from('tickets')
      .update(dbUpdates)
      .eq('id', id) // Assuming id is the UUID
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
    actions: {
      login,
      loginWithPhone,
      logout,
      createTicket,
      updateTicket,
      deleteTicket
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
