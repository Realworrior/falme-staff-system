import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Search, Filter, Trash2, Eye, AlertCircle, Clock, 
  CheckCircle2, AlertTriangle, User, Shield, Briefcase, 
  Image as ImageIcon, Upload, ChevronRight, ArrowLeft, Zap
} from 'lucide-react';
import { useFirebaseData } from '../hooks/useFirebase';
import { useToast } from '../context/ToastContext';
import TicketAuth from '../components/TicketAuth';
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, 
  TextField, Button, FormControl, InputLabel, Select, 
  MenuItem, Switch, FormControlLabel, Box
} from '@mui/material';

const CATEGORIES = [
  "Pending Bet",
  "Pending Withdrawal",
  "Enable Withdrawal",
  "Failed Deposit",
  "Pending Cashout",
  "Lost Amount"
];

const MERCHANTS = ["METAPAY", "FALMEBET"];
const URGENCY_LEVELS = ["Low", "Normal", "High", "Critical"];

const Tickets = () => {
  const { data: tickets, loading, createRecord, deleteRecord, setAllData } = useFirebaseData('supportTickets', []);
  const { showToast } = useToast();
  
  // Auth State
  const [auth, setAuth] = useState({ isAuth: false, role: 'Staff' });
  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const { data: templates } = useFirebaseData('supportTemplates', []);
  const [suggestionModalOpen, setSuggestionModalOpen] = useState(false);
  const [suggestedResponses, setSuggestedResponses] = useState([]);

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    showToast('Copied to clipboard!', 'success');
  };
  
  // Form State
  const [form, setForm] = useState({ 
    category: CATEGORIES[0],
    title: '', // Summary
    phone: '',
    comments: '',
    amount: '',
    time: '',
    game: '',
    betId: '',
    possibleWin: '',
    tenDigitCode: '',
    merchant: MERCHANTS[0],
    tokenExpired: false,
    urgency: URGENCY_LEVELS[1],
    screenshot: null,
    priority: 'Normal',
    status: 'Pending'
  });

  const handleQuickPaste = (e) => {
    const text = e.target.value;
    const newForm = { ...form };

    // Advanced Phone extraction (Targeting 10 digits starting with 0)
    // Handles: 2547..., 25407..., +254..., spaces, etc.
    let digits = text.replace(/[^\d]/g, '');
    let phone = '';
    
    if (digits.startsWith('254')) {
      let after254 = digits.substring(3);
      if (after254.startsWith('0')) {
        phone = after254; // e.g. 2540712... -> 0712...
      } else {
        phone = '0' + after254; // e.g. 254712... -> 0712...
      }
    } else if (digits.startsWith('0')) {
      phone = digits;
    } else if (digits.length === 9 && (digits.startsWith('7') || digits.startsWith('1'))) {
      phone = '0' + digits;
    }

    if (phone.length >= 10) {
      newForm.phone = phone.substring(0, 10);
    }

    const amountMatch = text.match(/\b\d+(?:[.,]\d+)?\s*(?:\/=|KES|Ksh|\$|)\b/i);
    if (amountMatch) newForm.amount = amountMatch[0].replace(/[a-z/=,$\s]/gi, '');

    const timeMatch = text.match(/\b(1[0-2]|0?[1-9])(?::[0-5][0-9])?\s*(am|pm)\b|\b([01]?[0-9]|2[0-3]):[0-5][0-9]\b/i);
    if (timeMatch) newForm.time = timeMatch[0];

    // Infer category
    const tLower = text.toLowerCase();
    if (tLower.includes("cashout")) newForm.category = "Pending Cashout";
    else if (tLower.includes("deposit")) newForm.category = "Failed Deposit";
    else if (tLower.includes("withdraw")) newForm.category = "Pending Withdrawal";
    else if (tLower.includes("bet") && !tLower.includes("cashout")) newForm.category = "Pending Bet";
    else if (tLower.includes("lost")) newForm.category = "Lost Amount";

    setForm(newForm);
  };

  const handleLogin = (role) => {
    setAuth({ isAuth: true, role });
    showToast(`Authenticated as ${role}`, 'success');
  };

  const handleLogout = () => {
    setAuth({ isAuth: false, role: 'Staff' });
  };

  const stats = useMemo(() => ([
    { label: "TOTAL VOLUME", value: tickets.length, color: "oklch(0.708 0 0)" },
    { label: "PENDING", value: tickets.filter(t => t.status === 'Pending').length, color: "oklch(0.769 0.188 70.08)" },
    { label: "IN PROGRESS", value: tickets.filter(t => t.status === 'In Progress').length, color: "oklch(0.696 0.17 162.48)" },
    { label: "CRITICAL", value: tickets.filter(t => t.urgency === 'Critical' || t.priority === 'Urgent').length, color: "oklch(0.627 0.265 303.9)" },
  ]), [tickets]);

  const filteredTickets = useMemo(() => {
    const q = searchQuery.toLowerCase();
    let result = tickets;
    
    // Dept role might see everything, Staff might only see their categories or specific types
    // For now, let's filter by search
    return result.filter(t => {
      const cat = t.category || t.type || 'General Enquiry';
      const searchStr = (cat + (t.phone || '') + (t.id || '') + (t.title || '')).toLowerCase();
      return searchStr.includes(q);
    }).sort((a, b) => (b.created || 0) - (a.created || 0));
  }, [tickets, searchQuery]);

  const handleCreate = () => {
    if (!form.title && !form.category) return showToast('Details required', 'error');
    
    const newId = Math.random().toString(36).substr(2, 6).toUpperCase();
    const payload = {
      ...form,
      id: newId,
      created: Date.now(),
      author: auth.role,
      status: 'Pending'
    };
    
    // High priority logic for Deposit Expired Token
    if (form.category === "Deposit (Expired Token/Manual)" && form.tokenExpired) {
      payload.priority = 'Urgent';
      payload.urgency = 'Critical';
    }

    // Find template responses
    const matchedCategory = templates.find(c => c.category === form.category);
    if (matchedCategory && matchedCategory.templates.length > 0) {
      const allResponses = matchedCategory.templates.flatMap(t => t.responses || []);
      if (allResponses.length > 0) {
        setSuggestedResponses(allResponses);
        setSuggestionModalOpen(true);
      }
    }

    createRecord(payload);
    setModalOpen(false);
    resetForm();
    showToast('Ticket created successfully!', 'success');
  };

  const resetForm = () => {
    setForm({
      category: CATEGORIES[0],
      title: '', phone: '', comments: '', amount: '', time: '', game: '', betId: '', possibleWin: '', tenDigitCode: '',
      merchant: MERCHANTS[0], tokenExpired: false, urgency: URGENCY_LEVELS[1],
      screenshot: null, priority: 'Normal', status: 'Pending'
    });
  };

  if (!auth.isAuth) {
    return <TicketAuth onLogin={handleLogin} />;
  }

  return (
    <div className="p-4 md:p-8 md:px-12 space-y-10 w-full mx-auto pb-24">
      {/* Dynamic Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-6"
      >
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shadow-xl">
            {auth.role === 'Staff' ? <User className="text-red-500" /> : <Shield className="text-red-500" />}
          </div>
          <div>
            <div className="flex flex-col md:flex-row md:items-center gap-2">
              <h1 className="text-2xl md:text-3xl font-black text-white font-heading tracking-tighter uppercase">{auth.role} Portal</h1>
              <span className="w-fit px-2 py-0.5 rounded bg-red-600/10 text-red-500 text-[8px] font-black uppercase tracking-widest border border-red-500/20">Active Session</span>
            </div>
            <p className="text-gray-600 text-[10px] font-black uppercase tracking-[0.3em] mt-1.5 flex items-center gap-2">
              <Briefcase size={10} />
              Customer Support System
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
          <button 
            onClick={() => { resetForm(); setModalOpen(true); }}
            className="px-8 py-4 accent-gradient text-white rounded-2xl font-black shadow-2xl hover:shadow-red-500/40 transition-all duration-300 flex items-center justify-center gap-3 text-[10px] uppercase tracking-[0.2em]"
          >
            <Plus size={18} strokeWidth={3} />
            New Ticket
          </button>
        </div>
      </motion.div>

      {/* Stats Summary (Dept View only show full, Staff might show simplified) */}
      <AnimatePresence>
        {auth.role === 'Dept' && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-6 overflow-hidden"
          >
            {stats.map((stat, index) => (
              <div key={stat.label} className="bg-[#0f0f17] rounded-3xl p-6 border border-white/5 shadow-inner shadow-white/5">
                <p className="text-gray-600 text-[9px] font-black uppercase tracking-[0.2em] mb-4 italic italic underline decoration-red-500/10">{stat.label}</p>
                <div className="flex items-end justify-between">
                  <h3 className="text-4xl font-black text-white font-heading" style={{ color: stat.color }}>{stat.value}</h3>
                  <div className="w-8 h-1 bg-white/5 rounded-full" />
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Operational Interface */}
      <div className="grid grid-cols-1 gap-8">
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-700 group-focus-within:text-red-500 transition-colors" />
              <input
                type="text"
                placeholder="Search tickets by ID, Phone, or Category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-14 pr-6 py-5 bg-[#0f0f17] border border-white/5 rounded-3xl text-white placeholder-gray-700 focus:outline-none focus:border-red-500/20 transition-all shadow-2xl"
              />
            </div>
          </div>

          <div className="bg-[#0f0f17] rounded-[40px] border border-white/5 shadow-2xl overflow-hidden">
            <div className="p-8 border-b border-white/5 flex items-center justify-between bg-black/20">
              <div className="flex items-center gap-3">
                <Filter size={18} className="text-red-500" />
                <h2 className="text-lg font-black text-white font-heading uppercase tracking-tighter">Ticket Feed</h2>
              </div>
              <span className="text-[10px] font-black text-gray-700 uppercase tracking-[0.3em]">{filteredTickets.length} Tickets Found</span>
            </div>
            
            <div className="no-scrollbar">
              {/* Desktop Table (Visible on md+) */}
              <table className="w-full text-sm hidden md:table">
                <thead>
                  <tr className="border-b border-white/5 bg-black/40">
                    <th className="text-left py-6 px-8 text-gray-500 text-[11px] font-black uppercase tracking-widest">TICKET ID / INFO</th>
                    <th className="text-left py-6 px-8 text-gray-500 text-[11px] font-black uppercase tracking-widest">ISSUE CATEGORY</th>
                    <th className="text-left py-6 px-8 text-gray-500 text-[11px] font-black uppercase tracking-widest">CURRENT STATUS</th>
                    <th className="text-left py-6 px-8 text-gray-500 text-[11px] font-black uppercase tracking-widest">CONTEXTUAL DETAILS</th>
                    <th className="text-center py-6 px-8 text-gray-500 text-[11px] font-black uppercase tracking-widest">ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence mode="popLayout">
                    {filteredTickets.map((ticket) => (
                      <motion.tr 
                        key={ticket.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="border-b border-white/5 hover:bg-white/[0.01] transition-all group"
                      >
                        <td className="py-6 px-8">
                          <div className="flex flex-col">
                            <span className="text-white font-black uppercase tracking-tight text-sm md:text-base">{ticket.title || "No Summary Provided"}</span>
                            <span className="text-gray-600 text-[11px] font-mono mt-1 font-bold">UID: #{(ticket.id || '').toUpperCase()}</span>
                          </div>
                        </td>
                        <td className="py-6 px-8">
                          <span className={`px-4 py-1.5 rounded-lg text-[10px] font-black tracking-widest border shadow-sm ${
                            (ticket.category || ticket.type || "").includes("Pending") 
                              ? "bg-amber-500/10 text-amber-500 border-amber-500/20" 
                              : "bg-red-500/10 text-red-500 border-red-500/20"
                          }`}>
                            {(ticket.category || ticket.type || "General Inquiry").toUpperCase()}
                          </span>
                        </td>
                        <td className="py-6 px-8">
                          <div className="flex items-center gap-2.5">
                             <div className={`w-2 h-2 rounded-full animate-pulse ${
                               ticket.status === 'Resolved' ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.6)]' : 
                               ticket.status === 'In Progress' ? 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.6)]' : 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.6)]'
                             }`} />
                             <span className="text-gray-400 font-black text-xs uppercase tracking-[0.2em]">{ticket.status}</span>
                          </div>
                        </td>
                        <td className="py-6 px-8">
                          <div className="flex flex-wrap gap-2.5">
                            {ticket.phone && <span onClick={() => handleCopy(ticket.phone)} className="text-gray-300 font-bold font-mono text-xs bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg cursor-pointer transition-colors active:scale-95 border border-white/5 shadow-inner" title="Copy Phone Number">{ticket.phone}</span>}
                            {ticket.amount && <span className="text-red-400 font-black text-xs bg-red-500/10 px-3 py-1.5 rounded-lg border border-red-500/20">KES {ticket.amount}</span>}
                            {ticket.betId && <span onClick={() => handleCopy(ticket.betId)} className="text-indigo-400 font-bold font-mono text-[11px] bg-indigo-500/10 hover:bg-indigo-500/20 px-3 py-1.5 rounded-lg cursor-pointer transition-colors active:scale-95 border border-indigo-500/20" title="Copy Bet ID">BET: {ticket.betId}</span>}
                            {ticket.game && <span className="text-amber-400 font-black text-[11px] bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/20">GAME: {ticket.game}</span>}
                            {ticket.comments && <div className="w-full mt-2 text-gray-500 font-medium italic text-xs leading-relaxed break-words px-3 border-l-4 border-red-500/20 py-1">"{ticket.comments}"</div>}
                            {ticket.category === "Pending Cashout" && (
                              <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-1 text-emerald-400 font-black text-[9px] bg-emerald-500/5 px-2 py-1 rounded">
                                  <ImageIcon size={10} /> 
                                  PROOF ATTACHED
                                </div>
                                <div className="w-20 h-12 rounded-lg border border-emerald-500/20 bg-black/40 overflow-hidden relative group/thumb cursor-pointer">
                                  <div className="absolute inset-0 bg-emerald-500/10 animate-pulse group-hover/thumb:opacity-0 transition-opacity" />
                                  <div className="w-full h-full flex items-center justify-center italic text-[6px] text-emerald-500/40 font-black uppercase tracking-tighter">
                                    SCREENSHOT
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-6 px-8 text-right">
                          <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all scale-95 group-hover:scale-100">
                             <button className="p-2.5 bg-white/5 border border-white/5 text-gray-500 hover:text-white hover:border-white/10 rounded-xl transition-all shadow-xl"><Eye size={16} /></button>
                             <button className="p-2.5 bg-red-500/5 border border-red-500/10 text-gray-700 hover:text-red-500 hover:border-red-500/20 rounded-xl transition-all shadow-xl" onClick={() => deleteRecord(ticket.firebaseKey || ticket.id)}><Trash2 size={16} /></button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>

              {/* Mobile Card List (Visible on <md) */}
              <div className="md:hidden divide-y divide-white/5">
                <AnimatePresence mode="popLayout">
                  {filteredTickets.map((ticket) => (
                    <motion.div 
                      key={ticket.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="p-4 sm:p-6 space-y-4 hover:bg-white/[0.02] transition-colors"
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div className="min-w-0 flex-1">
                          {ticket.phone ? (
                            <p onClick={() => handleCopy(ticket.phone)} className="text-white font-black font-mono text-lg tracking-tight hover:text-emerald-400 transition-colors cursor-pointer" title="Copy Phone">
                              {ticket.phone}
                            </p>
                          ) : (
                            <p className="text-white font-black uppercase tracking-tight text-sm truncate">{ticket.title || "No Summary"}</p>
                          )}
                          <p className="text-gray-500 text-[10px] font-mono mt-1 font-bold">
                            #{(ticket.id || '').toUpperCase()} {ticket.phone && ticket.title ? `• ${ticket.title}` : ''}
                          </p>
                        </div>
                        <span className={`flex-shrink-0 px-2.5 py-1 rounded text-[8px] font-black tracking-widest border h-fit ${
                           (ticket.category || ticket.type || "").includes("Pending") ? "bg-amber-500/10 text-amber-500 border-amber-500/20" : "bg-white/5 text-gray-400 border-white/5"
                         }`}>
                          {(ticket.category || ticket.type || "General").toUpperCase()}
                        </span>
                      </div>

                      <div className="flex items-center justify-between py-3 border-y border-white/5">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${
                             ticket.status === 'Resolved' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 
                             ticket.status === 'In Progress' ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]' : 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]'
                          }`} />
                          <span className="text-gray-400 font-black text-xs uppercase tracking-[0.2em]">{ticket.status}</span>
                        </div>
                        <div className="flex gap-3">
                           <button className="p-2.5 bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all rounded-xl shadow-lg active:scale-95"><Eye size={16} /></button>
                           <button className="p-2.5 bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20 transition-all rounded-xl shadow-lg active:scale-95" onClick={() => deleteRecord(ticket.firebaseKey || ticket.id)}><Trash2 size={16} /></button>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2.5">
                         {ticket.phone && <span onClick={() => handleCopy(ticket.phone)} className="text-gray-300 font-bold font-mono text-xs bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg cursor-pointer transition-colors active:scale-95 border border-white/10 shadow-sm" title="Copy Phone Number">{ticket.phone}</span>}
                         {ticket.amount && <span className="text-red-400 font-black text-xs bg-red-500/10 px-3 py-1.5 rounded-lg border border-red-500/20 shadow-sm">KES {ticket.amount}</span>}
                         {ticket.betId && <span onClick={() => handleCopy(ticket.betId)} className="text-indigo-400 font-bold font-mono text-xs bg-indigo-500/10 hover:bg-indigo-500/20 px-3 py-1.5 rounded-lg cursor-pointer transition-colors active:scale-95 border border-indigo-500/20 shadow-sm" title="Copy Bet ID">BET: {ticket.betId}</span>}
                         {ticket.game && <span className="text-amber-400 font-black text-xs bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/20 shadow-sm">GAME: {ticket.game}</span>}
                         {ticket.comments && <div className="w-full mt-3 text-gray-400 font-medium italic text-xs leading-relaxed break-words px-4 py-3 bg-black/20 rounded-xl border border-white/5">"{ticket.comments}"</div>}
                         {(ticket.category === "Pending Cashout" || ticket.type === "Pending Cashout") && (
                           <div className="w-full mt-2">
                             <div className="w-full h-20 rounded-xl border border-emerald-500/20 bg-emerald-500/5 flex items-center justify-center italic text-[8px] text-emerald-500/50 font-black uppercase tracking-[0.3em] shadow-inner shadow-emerald-500/5 hover:bg-emerald-500/10 transition-colors cursor-pointer">
                               View Screenshot Proof
                             </div>
                           </div>
                         )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {filteredTickets.length === 0 && (
                <div className="py-32 text-center text-gray-800 font-black uppercase tracking-[0.4em] text-[10px] italic underline decoration-white/5">
                  No tickets found
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Initialize Specialized Record Dialog */}
      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} maxWidth="md" fullWidth PaperProps={{ elevation: 0, className: "m-4 rounded-3xl overflow-hidden" }}>
        <DialogTitle className="font-heading font-black text-white border-b border-white/5 px-6 md:px-8 py-5 md:py-6 uppercase tracking-tighter bg-black">Create New Ticket</DialogTitle>
        <DialogContent className="flex flex-col gap-6 pt-8 px-6 md:px-8 bg-[#0a0a0f]">
          {/* Quick Paste Auto-Fill Section */}
          <Box className="p-6 rounded-2xl bg-gradient-to-br from-red-600/5 to-transparent border border-red-500/10 shadow-inner relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-2 opacity-20 group-hover:opacity-100 transition-opacity">
              <Zap className="text-red-500 w-4 h-4" />
            </div>
            <TextField 
              label="Quick Paste / Auto-fill (Paste details here...)" 
              fullWidth 
              placeholder="e.g. Withdrawal, 200/=, 9am, 0710435678"
              onChange={handleQuickPaste} 
              variant="standard"
              InputProps={{ 
                disableUnderline: true,
                sx: { 
                  color: 'white', 
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  '&::placeholder': { color: 'rgba(255,255,255,0.2)' }
                }
              }}
              InputLabelProps={{
                sx: { 
                  color: 'rgba(255,255,255,0.4)', 
                  fontSize: '0.75rem', 
                  textTransform: 'uppercase', 
                  letterSpacing: '0.1em',
                  fontWeight: 900
                }
              }}
            />
          </Box>

          <Box className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <TextField label="Phone Number" fullWidth value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
            
            <FormControl fullWidth>
              <InputLabel>Issue Category</InputLabel>
              <Select 
                value={form.category} 
                label="Issue Category" 
                onChange={e => setForm({ ...form, category: e.target.value })}
                MenuProps={{ PaperProps: { sx: { maxHeight: 400, width: { xs: 280, sm: 'auto' } } } }}
              >
                {CATEGORIES.map(c => (
                  <MenuItem key={c} value={c} sx={{ whiteSpace: 'normal' }}>{c}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Box className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Conditional Fields Based on Category */}
            {form.category === "Pending Bet" && (
              <>
                <TextField label="Bet ID" fullWidth value={form.betId} onChange={e => setForm({ ...form, betId: e.target.value })} />
                <TextField label="Possible Win" fullWidth value={form.possibleWin} onChange={e => setForm({ ...form, possibleWin: e.target.value })} />
              </>
            )}

            {(form.category === "Pending Withdrawal" || form.category === "Enable Withdrawal") && (
              <>
                <TextField label="Amount" fullWidth value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} />
                <TextField label="Time" fullWidth value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} />
              </>
            )}

            {form.category === "Failed Deposit" && (
              <>
                <TextField label="10-Digit Code" fullWidth value={form.tenDigitCode} onChange={e => {
                  setForm({ ...form, tenDigitCode: e.target.value.toUpperCase() })
                }} />
                <TextField label="Time" fullWidth value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} />
                <TextField label="Deposit Amount" fullWidth value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} />
                <FormControl fullWidth>
                  <InputLabel>Merchant Portal</InputLabel>
                  <Select value={form.merchant} label="Merchant Portal" onChange={e => setForm({ ...form, merchant: e.target.value })}>
                    {MERCHANTS.map(m => <MenuItem key={m} value={m}>{m}</MenuItem>)}
                  </Select>
                </FormControl>
              </>
            )}

            {form.category === "Pending Cashout" && (
              <>
                <TextField label="Amount Pending" fullWidth value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} />
                <TextField label="Time of Action" fullWidth value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} />
                <div className="col-span-full p-8 rounded-3xl border-2 border-dashed border-white/5 bg-white/[0.02] flex flex-col items-center justify-center gap-4 group hover:border-red-500/30 transition-all cursor-pointer">
                  <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform">
                    <Upload size={24} />
                  </div>
                  <div className="text-center">
                    <p className="text-white font-black text-[10px] uppercase tracking-widest">Upload Bet History Screenshot</p>
                    <p className="text-gray-600 text-[8px] font-bold uppercase tracking-widest mt-1">REQ</p>
                  </div>
                </div>
              </>
            )}

            {form.category === "Lost Amount" && (
              <>
                <TextField label="Active Game Played" fullWidth value={form.game} onChange={e => setForm({ ...form, game: e.target.value })} />
                <TextField label="Amount Lost" fullWidth value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} />
                <TextField label="Time of Issue" fullWidth placeholder="e.g., 14:30" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} />
              </>
            )}
          </Box>

          <TextField 
            label="Issue Summary & Additional Comments" 
            fullWidth 
            multiline
            rows={3}
            value={form.title} 
            onChange={e => setForm({ ...form, title: e.target.value })} 
          />
        </DialogContent>
        <DialogActions className="px-6 md:px-8 py-4 md:py-6 border-t border-white/5 bg-black flex-col sm:flex-row gap-3">
          <button onClick={() => setModalOpen(false)} className="w-full sm:w-auto px-6 py-4 text-[10px] font-black text-gray-400 hover:text-white transition-colors uppercase tracking-[0.2em] border border-white/5 sm:border-none rounded-xl">Cancel</button>
          <button onClick={handleCreate} className="w-full sm:w-auto px-10 py-4 accent-gradient text-white rounded-xl font-black text-[10px] shadow-2xl shadow-red-500/20 uppercase tracking-[0.3em] active:scale-95 transition-transform">Submit Ticket</button>
        </DialogActions>
      </Dialog>

      {/* Suggested Template Response Dialog */}
      <Dialog open={suggestionModalOpen} onClose={() => setSuggestionModalOpen(false)} maxWidth="sm" fullWidth PaperProps={{ elevation: 0, className: "m-4 rounded-3xl overflow-hidden" }}>
        <DialogTitle className="font-heading font-black text-white border-b border-white/5 px-6 md:px-8 py-5 bg-black uppercase tracking-tighter text-sm flex items-center gap-2">
          <CheckCircle2 className="text-emerald-500" size={18} />
          Ticket Initialized - Suggested Response
        </DialogTitle>
        <DialogContent className="pt-8 px-6 md:px-8 bg-[#0a0a0f]">
          <div className="space-y-4">
            {suggestedResponses.map((resp, i) => (
              <div 
                key={i} 
                className="p-4 rounded-2xl bg-black/40 border border-white/5 hover:bg-black/60 hover:border-emerald-500/20 transition-all cursor-pointer group"
                onClick={() => { handleCopy(resp.text); setSuggestionModalOpen(false); }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`px-2 py-0.5 text-[8px] uppercase tracking-widest font-black rounded border ${
                    resp.type === 'Standard' ? 'bg-blue-500/5 text-blue-400 border-blue-500/10' : 'bg-pink-500/5 text-pink-400 border-pink-500/10'
                  }`}>
                    {resp.type}
                  </span>
                  <span className="text-gray-500 text-[9px] font-black uppercase group-hover:text-emerald-500 transition-colors">Click to Copy</span>
                </div>
                <p className="text-gray-300 text-xs md:text-sm">{resp.text}</p>
              </div>
            ))}
          </div>
        </DialogContent>
        <DialogActions className="px-6 md:px-8 py-4 border-t border-white/5 bg-black">
          <button onClick={() => setSuggestionModalOpen(false)} className="w-full sm:w-auto px-6 py-3 text-[10px] font-black text-gray-400 hover:text-white transition-colors uppercase tracking-[0.2em] border border-white/5 sm:border-none rounded-xl">Dismiss</button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Tickets;
