import React, { useState } from 'react';
import { X, Zap, ArrowRight, Shield, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORIES = [
  "Pending Bet",
  "Pending Withdrawal",
  "Enable Withdrawal",
  "Failed Deposit",
  "Pending Cashout",
  "Lost Amount"
];

const PRIORITIES = ["Low", "Medium", "High", "Urgent"];

export function NewTicketModal({ onClose, onSubmit }) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: CATEGORIES[0],
    priority: PRIORITIES[1]
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.title.trim() && (form.description.trim() || form.comments?.trim())) {
      onSubmit(form);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-[999]">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="glass rounded-[32px] w-full max-w-lg overflow-hidden border border-white/10 shadow-2xl"
      >
        <div className="flex items-center justify-between p-8 border-b border-white/5 bg-black/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center shadow-lg shadow-red-500/20">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white font-heading uppercase tracking-tighter">Report Issue</h2>
              <p className="text-[9px] text-gray-500 font-black uppercase tracking-[0.2em]">Operational Support Request</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-1.5">
            <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest ml-4 italic">Issue Summary</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-6 py-4 bg-black/40 border border-white/5 rounded-2xl text-white text-sm font-bold focus:outline-none focus:border-red-500/30 transition-all placeholder:text-gray-700"
              placeholder="e.g., Cannot withdraw funds, Bet not settled"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest ml-4 italic">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-6 py-4 bg-black/40 border border-white/5 rounded-2xl text-white text-[10px] font-black uppercase tracking-widest focus:outline-none focus:border-red-500/30 transition-all"
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest ml-4 italic">Priority</label>
              <select
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
                className="w-full px-6 py-4 bg-black/40 border border-white/5 rounded-2xl text-white text-[10px] font-black uppercase tracking-widest focus:outline-none focus:border-red-500/30 transition-all"
              >
                {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest ml-4 italic">Detailed explanation</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value, comments: e.target.value })}
              className="w-full px-6 py-4 bg-black/40 border border-white/5 rounded-2xl text-white text-sm font-medium focus:outline-none focus:border-red-500/30 transition-all resize-none h-32 italic placeholder:text-gray-700"
              placeholder="Provide account number, bet ID, and any relevant context..."
              required
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-4 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-8 py-4 bg-red-600 text-white rounded-[20px] font-black text-[10px] uppercase tracking-[0.3em] shadow-xl shadow-red-500/20 hover:shadow-red-500/40 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              Submit Ticket
              <ArrowRight className="w-4 h-4" strokeWidth={3} />
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
