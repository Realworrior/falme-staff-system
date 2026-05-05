import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns';
import { STAFF_CONFIG, STAFF_THEME } from '../../utils/Rota/scheduleGenerator';

export function TransportDashboard({ schedule, savedRates, paymentHistory, onSaveRates, onPay }) {
  const [filterType, setFilterType] = useState('weekly'); // weekly, monthly, custom
  const [customRange, setCustomRange] = useState({ start: new Date(), end: new Date() });
  const [editingRates, setEditingRates] = useState(false);
  const [tempRates, setTempRates] = useState(savedRates || {});

  // Date range logic
  const range = useMemo(() => {
    const now = new Date();
    if (filterType === 'weekly') {
      return { start: startOfWeek(now), end: endOfWeek(now) };
    } else if (filterType === 'monthly') {
      return { start: startOfMonth(now), end: endOfMonth(now) };
    }
    return customRange;
  }, [filterType, customRange]);

  // Calculate allowances
  const allowances = useMemo(() => {
    const stats = {};
    
    // Initialize stats for all staff
    STAFF_CONFIG.forEach(s => {
      stats[s.name] = { pm: 0, nt: 0, totalShifts: 0, amount: 0, rate: savedRates[s.name] || 0 };
    });

    schedule.forEach(day => {
      if (isWithinInterval(day.date, range)) {
        // PM Shifts
        day.shifts.PM.forEach(name => {
          if (stats[name]) {
            stats[name].pm++;
            stats[name].totalShifts++;
            stats[name].amount += (stats[name].rate);
          }
        });
        // NT Shifts
        day.shifts.NT.forEach(name => {
          if (stats[name]) {
            stats[name].nt++;
            stats[name].totalShifts++;
            stats[name].amount += (stats[name].rate);
          }
        });
      }
    });

    return Object.entries(stats)
      .map(([name, data]) => ({ name, ...data }))
      .filter(s => s.totalShifts > 0 || editingRates)
      .sort((a, b) => b.amount - a.amount);
  }, [schedule, range, savedRates, editingRates]);

  const totalPayout = allowances.reduce((sum, s) => sum + s.amount, 0);

  const handleSave = () => {
    onSaveRates(tempRates);
    setEditingRates(false);
  };

  const handlePay = () => {
    const payment = {
      id: Date.now(),
      date: new Date().toISOString(),
      range: `${format(range.start, 'MMM d')} - ${format(range.end, 'MMM d, yyyy')}`,
      amount: totalPayout,
      staffCount: allowances.filter(s => s.amount > 0).length,
      type: filterType
    };
    onPay(payment);
  };

  return (
    <div className="space-y-8">
      {/* Premium Header Card */}
      <div className="relative overflow-hidden p-8 md:p-12 rounded-2xl bg-accent border border-white/10 shadow-lg">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-black uppercase tracking-[0.2em] text-white">
                Financial Operations
              </div>
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase mb-2">
              Transport <br /> Allowances
            </h2>
            <p className="text-blue-100 text-sm font-medium max-w-md">
              Automated KSh calculations for PM and NT shifts based on staff distance configurations.
            </p>
          </div>

          <div className="bg-black/20 backdrop-blur-2xl p-8 rounded-xl border border-white/10 min-w-[280px]">
            <p className="text-blue-200 text-[10px] font-black uppercase tracking-widest mb-2">Total Estimated Payout</p>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-black text-white tracking-tighter">
                {totalPayout.toLocaleString()}
              </span>
              <span className="text-xl font-bold text-blue-300">KSh</span>
            </div>
            <div className="mt-6 flex gap-3">
              <button 
                onClick={handlePay}
                className="flex-1 py-3 bg-white text-blue-600 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-50 transition-all shadow-lg"
              >
                Mark Paid
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-4">
        <div className="flex bg-white/5 p-1 rounded-xl border border-border">
          {['weekly', 'monthly', 'custom'].map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                filterType === type ? 'bg-white text-black shadow-lg' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        <button 
          onClick={() => {
            if (editingRates) handleSave();
            else {
              setTempRates(savedRates);
              setEditingRates(true);
            }
          }}
          className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all ${
            editingRates 
              ? "bg-emerald-600 text-white shadow-emerald-600/20" 
              : "bg-white/5 text-gray-400 border border-white/10 hover:border-white/20 hover:text-white"
          }`}
        >
          {editingRates ? <CheckCircle2 size={14} /> : <TrendingUp size={14} />}
          {editingRates ? "Save Configurations" : "Configure Rates"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="px-6 py-2 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-gray-500">
            <span>Staff Member</span>
            <div className="flex gap-12">
              <span className="w-20 text-center">Shifts (PM/NT)</span>
              <span className="w-24 text-right">Amount (KSh)</span>
            </div>
          </div>

          <div className="space-y-3">
            {allowances.map((s) => (
              <motion.div 
                layout
                key={s.name}
                className="p-6 rounded-2xl bg-card border border-border hover:border-white/10 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-black uppercase"
                      style={{ backgroundColor: STAFF_THEME[s.name]?.bg || '#334466', color: STAFF_THEME[s.name]?.text || '#fff' }}
                    >
                      {s.name[0]}
                    </div>
                    <div>
                      <h4 className="text-lg font-black text-white tracking-tight">{s.name}</h4>
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                        Rate: {editingRates ? '' : `${s.rate} KSh/shift`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-12">
                    {editingRates ? (
                      <div className="flex items-center bg-black/40 rounded-xl border border-white/10 px-3 py-2">
                        <DollarSign size={12} className="text-gray-500 mr-2" />
                        <input 
                          type="number"
                          value={tempRates[s.name] || ''}
                          onChange={(e) => setTempRates({...tempRates, [s.name]: parseInt(e.target.value) || 0})}
                          className="w-16 bg-transparent text-white font-bold text-sm focus:outline-none"
                          placeholder="0"
                        />
                      </div>
                    ) : (
                      <div className="flex gap-4">
                         <div className="flex flex-col items-center">
                            <span className="text-xs font-black text-white">{s.pm}</span>
                            <span className="text-[8px] font-bold text-gray-500 uppercase">PM</span>
                         </div>
                         <div className="flex flex-col items-center">
                            <span className="text-xs font-black text-white">{s.nt}</span>
                            <span className="text-[8px] font-bold text-gray-500 uppercase">NT</span>
                         </div>
                      </div>
                    )}
                    
                    <div className="w-24 text-right">
                      <span className="text-xl font-black text-white tracking-tighter">
                        {s.amount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* History / Sidebar */}
        <div className="space-y-6">
          <div className="p-8 rounded-2xl bg-card border border-border">
            <h3 className="text-lg font-black text-white uppercase tracking-tighter mb-6 flex items-center gap-2">
              <History size={18} className="text-blue-500" />
              Payment Registry
            </h3>
            
            <div className="space-y-4">
              {paymentHistory.length === 0 && (
                <div className="py-12 text-center">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-600 italic">No payment milestones recorded</p>
                </div>
              )}
              {paymentHistory.map(h => (
                <div key={h.id} className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all cursor-pointer">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">{h.type} Sync</span>
                    <span className="text-[9px] text-gray-500 font-bold">{format(parseISO(h.date), 'MMM d, HH:mm')}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-black text-white">{h.amount.toLocaleString()} KSh</span>
                    <span className="text-[9px] text-gray-500 font-bold">{h.staffCount} Personnel</span>
                  </div>
                  <p className="text-[8px] text-gray-600 mt-2 font-medium">{h.range}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="p-8 rounded-2xl bg-accent/5 border border-accent/10">
            <div className="flex items-center gap-3 mb-4">
              <Info size={16} className="text-blue-500" />
              <h4 className="text-xs font-black text-white uppercase tracking-widest">Policy Insight</h4>
            </div>
            <p className="text-[11px] text-gray-400 leading-relaxed">
              Transport allowances are only applicable to Late (PM) and Night (NT) shifts due to specialized commute requirements. Morning (AM) shifts do not qualify for this benefit.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
