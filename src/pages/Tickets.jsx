import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, LayoutDashboard, Filter, Search, User, Shield, Zap } from 'lucide-react';
import { useSupabaseData } from '../context/SupabaseDataContext';
import { useToast } from '../context/ToastContext';
import { TicketCard } from '../components/Tracking/TicketCard';
import { NewTicketModal } from '../components/Tracking/NewTicketModal';
import { StatsCard } from '../components/Tracking/StatsCard';
import { LoginForm } from '../components/Tracking/LoginForm';
import { sendTicketToWhatsApp } from '../utils/whatsapp';

export default function Tickets() {
  const { tickets, user, loading, actions } = useSupabaseData();
  const { showToast } = useToast();
  
  const [showNewTicketModal, setShowNewTicketModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Local effect to handle the pre-integrated user session if needed
  useEffect(() => {
    // Session is already handled by SupabaseDataContext, 
    // but the tracking app expects some local storage sync in App.tsx.
    // SupabaseDataContext already handles setUser.
  }, []);

  const handleStatusChange = async (id, status) => {
    try {
      await actions.updateTicket(id, { status });
      showToast(`Ticket marked as ${status}`, 'success');
    } catch (err) {
      console.error(err);
      showToast('Status update failed', 'error');
    }
  };

  const handleAssign = async (id, assignee) => {
    try {
      await actions.updateTicket(id, { assignee, status: 'in-progress' });
      showToast(`Assigned to ${assignee}`, 'success');
    } catch (err) {
      console.error(err);
      showToast('Assignment failed', 'error');
    }
  };

  const handleNewTicket = async (ticketData) => {
    try {
      const newTicket = await actions.createTicket({
        ...ticketData,
        author: user?.name || 'Customer'
      });
      
      showToast('Ticket created successfully', 'success');
      
      // Send to WhatsApp
      if (newTicket) {
        sendTicketToWhatsApp(newTicket);
      }
      
    } catch (err) {
      showToast(`Creation Failed: ${err.message || 'Unknown Error'}`, 'error');
    }
  };

  const handleLoginWithPhone = async (phone, pin, role) => {
    const userData = await actions.loginWithPhone(phone, pin, role);
    if (userData) {
      showToast(`Welcome back, ${userData.name}`, 'success');
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    actions.logout();
    showToast('Logged out successfully', 'info');
  };

  const filteredTickets = useMemo(() => {
    const q = searchQuery.toLowerCase();
    let result = tickets;

    if (filterStatus !== 'all') {
      result = result.filter(t => t.status?.toLowerCase() === filterStatus.toLowerCase());
    }

    if (q) {
      result = result.filter(t => 
        (t.title || '').toLowerCase().includes(q) || 
        (t.comments || t.description || '').toLowerCase().includes(q) ||
        (t.ticket_id || '').toLowerCase().includes(q) ||
        (t.phone || '').toLowerCase().includes(q)
      );
    }

    return result;
  }, [tickets, filterStatus, searchQuery]);

  const stats = {
    open: tickets.filter(t => (t.status?.toLowerCase() || 'open') === 'open').length,
    inProgress: tickets.filter(t => t.status?.toLowerCase() === 'in-progress').length,
    resolved: tickets.filter(t => t.status?.toLowerCase() === 'resolved').length,
    total: tickets.length
  };

  if (!user) {
    return <LoginForm onLogin={handleLoginWithPhone} />;
  }


  const userRole = user.role || 'staff';

  return (
    <div className="p-4 md:p-8 md:px-12 space-y-10 w-full mx-auto pb-24 md:pb-8 min-h-screen">
      {/* Header section adapted to Dark Theme */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-6"
      >
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-card border border-border flex items-center justify-center">
            {userRole === 'staff' ? <User className="text-red-500" /> : <Shield className="text-red-500" />}
          </div>
          <div>
            <div className="flex flex-col md:flex-row md:items-center gap-2">
              <h1 className="text-2xl md:text-3xl font-black text-white font-heading tracking-tighter uppercase">
                {userRole === 'staff' ? 'Support Portal' : 'Technical Ops'}
              </h1>
              <span className="w-fit px-2 py-0.5 rounded bg-red-600/10 text-red-500 text-[8px] font-black uppercase tracking-widest border border-red-500/20">
                Logged in as {user.name}
              </span>
            </div>
            <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.3em] mt-1.5 flex items-center gap-2 flex-wrap">
              <Zap size={10} className="text-red-500/60" />
              Real-time Issue Tracking Protocol Active
              <span className="text-red-500/40 font-mono">• {user.phone}</span>
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={handleLogout}
            className="px-5 py-3 text-gray-500 hover:text-white font-black text-[9px] uppercase tracking-widest transition-colors border border-white/5 rounded-xl bg-white/5"
          >
            Log Out
          </button>
          
          {userRole === 'staff' && (
            <button 
              onClick={() => setShowNewTicketModal(true)}
              className="px-8 py-4 bg-red-600 text-white rounded-xl font-black transition-all duration-300 flex items-center justify-center gap-3 text-[10px] uppercase tracking-[0.2em]"
            >
              <Plus size={18} strokeWidth={3} />
              New Ticket
            </button>
          )}
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard label="Pending / Open" value={stats.open} color="text-blue-400" />
        <StatsCard label="In Progress" value={stats.inProgress} color="text-amber-400" />
        <StatsCard label="Resolved" value={stats.resolved} color="text-emerald-400" />
        <StatsCard label="Total Tickets" value={stats.total} color="text-white" />
      </div>

      {/* Filters & Search */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-700 group-focus-within:text-red-500 transition-colors" />
            <input
              type="text"
              placeholder="Search by ID, Phone, or Content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-14 pr-6 py-5 bg-card border border-border rounded-2xl text-white placeholder-gray-700 focus:outline-none focus:border-red-500/20 transition-all"
            />
          </div>
        </div>

        <div className="bg-card rounded-2xl border border-border overflow-hidden min-h-[400px]">
          <div className="p-8 border-b border-white/5 flex flex-col md:flex-row items-center justify-between bg-black/20 gap-4">
            <div className="flex items-center gap-3">
              <Filter size={18} className="text-red-500" />
              <h2 className="text-lg font-black text-white font-heading uppercase tracking-tighter">Operational Feed</h2>
            </div>
            
            <div className="flex bg-black/40 p-1 rounded-2xl border border-white/5">
              {['all', 'open', 'in-progress', 'resolved'].map((s) => (
                <button
                  key={s}
                  onClick={() => setFilterStatus(s)}
                  className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                    filterStatus === s 
                      ? 'bg-red-600/10 text-red-500 border border-red-500/20' 
                      : 'text-gray-500 hover:text-white'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            <span className="text-[10px] font-black text-gray-700 uppercase tracking-[0.3em]">{filteredTickets.length} Matches</span>
          </div>

          <div className="p-8 space-y-4">
            {loading?.tickets ? (
              <div className="py-24 text-center">
                <div className="w-12 h-12 mx-auto mb-4 border-4 border-red-500/20 border-t-red-500 rounded-full animate-spin" />
                <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Syncing with Central database...</p>
              </div>
            ) : filteredTickets.length === 0 ? (
              <div className="py-24 text-center">
                <LayoutDashboard className="w-12 h-12 mx-auto mb-4 text-gray-800" />
                <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">No active tickets found</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredTickets.map(ticket => (
                  <TicketCard
                    key={ticket.id}
                    ticket={ticket}
                    onStatusChange={handleStatusChange}
                    onAssign={handleAssign}
                    userRole={userRole}
                    userName={user.name}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {showNewTicketModal && (
        <NewTicketModal
          onClose={() => setShowNewTicketModal(false)}
          onSubmit={handleNewTicket}
        />
      )}
    </div>
  );
}
