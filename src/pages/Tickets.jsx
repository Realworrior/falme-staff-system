import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
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
    <div className="p-4 md:p-8 md:px-12 space-y-8 w-full mx-auto pb-24 md:pb-8 min-h-screen bg-[#0e1017]">
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-6"
      >
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-[#131520] shadow-lg flex items-center justify-center">
            {userRole === 'staff' ? <User className="text-[#baff55]" /> : <Shield className="text-[#baff55]" />}
          </div>
          <div>
            <div className="flex flex-col md:flex-row md:items-center gap-3">
              <h1 className="text-2xl md:text-3xl font-semibold text-white tracking-tight">
                {userRole === 'staff' ? 'Support Portal' : 'Technical Ops'}
              </h1>
              <span className="w-fit px-3 py-1 rounded-full bg-[#131520] text-xs font-semibold text-white">
                {user.name}
              </span>
            </div>
            <p className="text-[#8e8e93] text-sm mt-1 flex items-center gap-2">
              <Zap size={12} className="text-[#baff55]" />
              Real-time Issue Tracking • {user.phone}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={handleLogout}
            className="pill-dark"
          >
            Log Out
          </button>
          
          {userRole === 'staff' && (
            <button 
              onClick={() => setShowNewTicketModal(true)}
              className="pill-lime flex items-center gap-2"
            >
              <Plus size={16} strokeWidth={2.5} />
              New Ticket
            </button>
          )}
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard label="Pending / Open" value={stats.open} color="text-[#baff55]" />
        <StatsCard label="In Progress" value={stats.inProgress} color="text-[#ffa64d]" />
        <StatsCard label="Resolved" value={stats.resolved} color="text-[#3b82f6]" />
        <StatsCard label="Total Tickets" value={stats.total} color="text-white" />
      </div>

      {/* Filters & Search */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8e8e93]" />
            <input
              type="text"
              placeholder="Search by ID, Phone, or Content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#2a2b2f] border border-[#3a3b3f] text-white pl-14 pr-6 py-4 rounded-full focus:outline-none focus:border-[#baff55] transition-colors placeholder:text-[#8e8e93]"
            />
          </div>
        </div>

        <div className="bg-[#2a2b2f] rounded-[32px] overflow-hidden min-h-[400px]">
          <div className="p-6 border-b border-[#3a3b3f] flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Filter size={18} className="text-[#baff55]" />
              <h2 className="text-lg font-semibold text-white">Operational Feed</h2>
            </div>
            
            <div className="flex bg-[#161616] p-1.5 rounded-full border border-[#3a3b3f] gap-1">
              {['all', 'open', 'in-progress', 'resolved'].map((s) => (
                <button
                  key={s}
                  onClick={() => setFilterStatus(s)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold capitalize transition-all ${
                    filterStatus === s 
                      ? 'bg-[#baff55] text-black' 
                      : 'text-[#8e8e93] hover:text-white'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            <span className="text-sm font-medium text-[#8e8e93]">{filteredTickets.length} results</span>
          </div>

          <div className="p-6 space-y-4">
            {loading?.tickets ? (
              <div className="py-24 text-center">
                <div className="w-10 h-10 mx-auto mb-4 border-4 border-[#baff55]/20 border-t-[#baff55] rounded-full animate-spin" />
                <p className="text-sm text-[#8e8e93]">Syncing with database...</p>
              </div>
            ) : filteredTickets.length === 0 ? (
              <div className="py-24 text-center">
                <LayoutDashboard className="w-12 h-12 mx-auto mb-4 text-[#3a3b3f]" />
                <p className="text-sm text-[#8e8e93]">No active tickets found</p>
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
