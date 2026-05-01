import React, { useState, useMemo } from 'react';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns';
import { 
  TrendingUp, 
  DollarSign, 
  Calendar as CalendarIcon, 
  Filter, 
  ChevronRight, 
  CheckCircle2, 
  History,
  Info,
  Clock,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { STAFF_CONFIG, STAFF_THEME } from '../../utils/Rota/scheduleGenerator';

interface TransportDashboardProps {
  schedule: any[];
  onSaveRates: (rates: Record<string, number>) => void;
  onPay: (paymentData: any) => void;
  paymentHistory: any[];
  savedRates?: Record<string, number>;
}

export function TransportDashboard({ 
  schedule, 
  onSaveRates, 
  onPay, 
  paymentHistory = [], 
  savedRates = {} 
}: TransportDashboardProps) {
  const [dateRange, setDateRange] = useState<'weekly' | 'monthly' | 'custom'>('weekly');
  const [customStart, setCustomStart] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
  const [customEnd, setCustomEnd] = useState(format(endOfMonth(new Date()), 'yyyy-MM-dd'));
  const [editingRates, setEditingRates] = useState(false);
  const [tempRates, setTempRates] = useState<Record<string, number>>(savedRates);
  const [showHistory, setShowHistory] = useState(false);

  // Initialize tempRates if empty
  React.useEffect(() => {
    if (Object.keys(tempRates).length === 0) {
      const initial: Record<string, number> = {};
      STAFF_CONFIG.forEach(s => {
        initial[s.name] = savedRates[s.name] || s.transportRate || 0;
      });
      setTempRates(initial);
    }
  }, [savedRates]);

  const activeInterval = useMemo(() => {
    const now = new Date();
    if (dateRange === 'weekly') {
      return { start: startOfWeek(now), end: endOfWeek(now) };
    }
    if (dateRange === 'monthly') {
      return { start: startOfMonth(now), end: endOfMonth(now) };
    }
    return { start: parseISO(customStart), end: parseISO(customEnd) };
  }, [dateRange, customStart, customEnd]);

  const stats = useMemo(() => {
    const report: Record<string, { pm: number; nt: number; total: number }> = {};
    STAFF_CONFIG.forEach(s => {
      report[s.name] = { pm: 0, nt: 0, total: 0 };
    });

    schedule.forEach(day => {
      const dayDate = day.date instanceof Date ? day.date : parseISO(day.date);
      if (isWithinInterval(dayDate, activeInterval)) {
        day.shifts.PM.forEach((name: string) => {
          if (report[name]) {
            report[name].pm++;
            report[name].total += (tempRates[name] || savedRates[name] || 0);
          }
        });
        day.shifts.NT.forEach((name: string) => {
          if (report[name]) {
            report[name].nt++;
            report[name].total += (tempRates[name] || savedRates[name] || 0);
          }
        });
      }
    });

    return report;
  }, [schedule, activeInterval, tempRates, savedRates]);

  const grandTotal = Object.values(stats).reduce((acc, s) => acc + s.total, 0);

  const handlePay = () => {
    const payment = {
      id: `PAY-${Date.now()}`,
      date: new Date().toISOString(),
      range: `${format(activeInterval.start, 'MMM dd')} - ${format(activeInterval.end, 'MMM dd, yyyy')}`,
      total: grandTotal,
      details: stats
    };
    onPay(payment);
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-[32px] bg-white/[0.03] border border-white/5 relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <DollarSign size={80} className="text-emerald-500" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-1">Total Allowance</p>
          <h3 className="text-3xl font-black text-white tracking-tighter">
            KSh {grandTotal.toLocaleString()}
          </h3>
          <div className="mt-4 flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[8px] font-black uppercase tracking-widest">
              Live Calculation
            </span>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-6 rounded-[32px] bg-white/[0.03] border border-white/5"
        >
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-1">Active Window</p>
          <div className="flex items-center gap-2 mb-4">
            <CalendarIcon size={14} className="text-blue-500" />
            <span className="text-xs font-bold text-white">
              {format(activeInterval.start, 'MMM dd')} — {format(activeInterval.end, 'MMM dd')}
            </span>
          </div>
          <div className="flex gap-2">
            {['weekly', 'monthly', 'custom'].map((mode) => (
              <button
                key={mode}
                onClick={() => setDateRange(mode as any)}
                className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                  dateRange === mode ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' : 'bg-white/5 text-gray-500 hover:text-gray-300'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-6 rounded-[32px] bg-white/[0.03] border border-white/5 flex flex-col justify-between"
        >
           <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Actions</p>
              <button 
                onClick={() => setShowHistory(true)}
                className="p-2 hover:bg-white/5 rounded-full text-gray-400 transition-colors"
              >
                <History size={16} />
              </button>
           </div>
           <div className="flex gap-3">
              <button 
                onClick={() => setEditingRates(!editingRates)}
                className={`flex-1 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all border ${
                  editingRates ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-white/5 border-white/5 text-gray-400 hover:text-white'
                }`}
              >
                {editingRates ? 'Cancel Editing' : 'Edit Rates'}
              </button>
              <button 
                onClick={handlePay}
                disabled={grandTotal === 0}
                className="flex-1 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-[9px] font-black uppercase tracking-widest shadow-xl shadow-emerald-500/20 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle2 size={12} />
                Mark as Paid
              </button>
           </div>
        </motion.div>
      </div>

      {/* Main Table */}
      <div className="bg-[#0a0a0f] border border-white/5 rounded-[40px] overflow-hidden">
        <div className="p-6 border-b border-white/5 bg-white/[0.01] flex items-center justify-between">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                <TrendingUp size={20} />
              </div>
              <div>
                <h4 className="text-sm font-black text-white uppercase tracking-tighter">Transport Allowance Matrix</h4>
                <p className="text-[9px] text-gray-500 uppercase tracking-widest font-black mt-1">Calculated per PM/NT shift across {Object.keys(stats).length} staff</p>
              </div>
           </div>
           {dateRange === 'custom' && (
             <div className="flex items-center gap-2">
                <input 
                  type="date" 
                  value={customStart} 
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-[10px] text-white focus:outline-none focus:border-blue-500/50"
                />
                <ArrowRight size={12} className="text-gray-600" />
                <input 
                  type="date" 
                  value={customEnd} 
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-[10px] text-white focus:outline-none focus:border-blue-500/50"
                />
             </div>
           )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead>
              <tr className="text-[9px] font-black uppercase tracking-widest text-gray-500 border-b border-white/5">
                <th className="p-6">Staff Member</th>
                <th className="p-6">Shift Count (PM+NT)</th>
                <th className="p-6">Rate (KSh)</th>
                <th className="p-6 text-right">Total Allowance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {STAFF_CONFIG.map((staff) => {
                const s = stats[staff.name];
                const theme = STAFF_THEME[staff.name];
                return (
                  <tr key={staff.name} className="group hover:bg-white/[0.02] transition-colors">
                    <td className="p-6">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black"
                          style={{ backgroundColor: `${theme.bg}20`, color: theme.bg }}
                        >
                          {staff.name[0]}
                        </div>
                        <span className="text-xs font-bold text-white">{staff.name}</span>
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black text-white">{s.pm + s.nt} shifts</span>
                          <span className="text-[8px] text-gray-500 uppercase tracking-tighter">PM: {s.pm} | NT: {s.nt}</span>
                        </div>
                        <div className="flex gap-0.5">
                          {Array.from({ length: Math.min(s.pm + s.nt, 10) }).map((_, i) => (
                             <div key={i} className="w-1 h-3 rounded-full bg-blue-500/20" />
                          ))}
                        </div>
                      </div>
                    </td>
                    <td className="p-6">
                      {editingRates ? (
                        <div className="flex items-center gap-2">
                           <input 
                             type="number" 
                             value={tempRates[staff.name] || ''}
                             onChange={(e) => setTempRates({...tempRates, [staff.name]: parseInt(e.target.value)})}
                             className="w-20 bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-[10px] text-white focus:outline-none focus:border-emerald-500/50"
                           />
                           <button 
                             onClick={() => onSaveRates(tempRates)}
                             className="p-1.5 bg-emerald-500/10 text-emerald-500 rounded-lg hover:bg-emerald-500/20 transition-all"
                           >
                             <CheckCircle2 size={12} />
                           </button>
                        </div>
                      ) : (
                        <span className="text-[10px] font-black text-gray-400">KSh {(savedRates[staff.name] || staff.transportRate || 0).toLocaleString()}</span>
                      )}
                    </td>
                    <td className="p-6 text-right">
                      <span className="text-xs font-black text-white">KSh {s.total.toLocaleString()}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* History Modal (Simplified) */}
      <AnimatePresence>
        {showHistory && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setShowHistory(false)}
               className="absolute inset-0 bg-black/80 backdrop-blur-sm"
             />
             <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.95 }}
               className="relative w-full max-w-2xl bg-[#0d0d12] border border-white/10 rounded-[40px] shadow-2xl overflow-hidden"
             >
                <div className="p-8 border-b border-white/5 flex items-center justify-between">
                   <div className="flex items-center gap-3">
                      <History className="text-emerald-500" />
                      <h3 className="text-xl font-black text-white uppercase tracking-tighter">Payment Milestones</h3>
                   </div>
                   <button onClick={() => setShowHistory(false)} className="p-2 hover:bg-white/5 rounded-full text-gray-500"><X size={20}/></button>
                </div>
                <div className="p-8 max-h-[60vh] overflow-y-auto space-y-4 scrollbar-thin">
                   {paymentHistory.length === 0 ? (
                     <div className="py-12 text-center">
                        <Info className="mx-auto text-gray-600 mb-4" size={32} />
                        <p className="text-sm text-gray-500 font-bold">No payment history recorded yet.</p>
                     </div>
                   ) : (
                     paymentHistory.map((p, i) => (
                       <div key={i} className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl flex items-center justify-between group hover:border-emerald-500/20 transition-all">
                          <div className="flex items-center gap-4">
                             <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                <DollarSign size={24} />
                             </div>
                             <div>
                                <p className="text-xs font-black text-white uppercase tracking-widest">{p.range}</p>
                                <p className="text-[10px] text-gray-500 font-bold mt-0.5">Processed on {format(parseISO(p.date), 'MMM dd, HH:mm')}</p>
                             </div>
                          </div>
                          <div className="text-right">
                             <p className="text-sm font-black text-emerald-500">KSh {p.total.toLocaleString()}</p>
                             <span className="text-[8px] font-black uppercase tracking-widest text-gray-600">Reference: {p.id}</span>
                          </div>
                       </div>
                     ))
                   )}
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function X({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}
