import React, { useState, useEffect, useMemo } from 'react';
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
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval, parseISO, startOfDay, endOfDay } from 'date-fns';
import { STAFF_CONFIG, SOFASAFI_STAFF_CONFIG, STAFF_THEME } from '../../utils/Rota/scheduleGenerator';

export function TransportDashboard({ 
  currentDate, 
  schedule, 
  savedRates, 
  paymentHistory, 
  onSaveRates, 
  onPay,
  sofasafiSchedule,
  sofasafiSavedRates,
  sofasafiPaymentHistory,
  onSaveSofaSafiRates,
  onPaySofaSafi,
  isLoggedIn
}) {
  const [filterType, setFilterType] = useState('weekly'); // weekly, monthly, custom
  const [customRange, setCustomRange] = useState({ start: new Date(), end: new Date() });
  const [editingRates, setEditingRates] = useState(false);
  
  // Separate local state buffers for editing rates
  const [tempRates, setTempRates] = useState(savedRates || {});
  const [sofasafiTempRates, setSofaSafiTempRates] = useState(sofasafiSavedRates || {});
  
  // Active sub-tab inside dashboard ('combined', 'betfalme', 'sofasafi')
  const [activeSubTab, setActiveSubTab] = useState(isLoggedIn ? 'combined' : 'betfalme');

  useEffect(() => {
    setTempRates(savedRates || {});
  }, [savedRates]);

  useEffect(() => {
    setSofaSafiTempRates(sofasafiSavedRates || {});
  }, [sofasafiSavedRates]);

  // Lock to betfalme tab if user logs out
  useEffect(() => {
    if (!isLoggedIn) {
      setActiveSubTab('betfalme');
    } else {
      setActiveSubTab('combined');
    }
  }, [isLoggedIn]);

  // Determine active month anchor date from schedule or current page selection
  const anchorDate = useMemo(() => {
    const now = new Date();
    const refDate = currentDate || (schedule[0]?.date) || now;
    if (now.getMonth() === refDate.getMonth() && now.getFullYear() === refDate.getFullYear()) {
      return now;
    }
    return startOfMonth(refDate);
  }, [currentDate, schedule]);

  // Pre-fill customRange start & end dates dynamically when active month shifts
  useEffect(() => {
    setCustomRange({
      start: startOfDay(startOfMonth(anchorDate)),
      end: endOfDay(endOfMonth(anchorDate))
    });
  }, [anchorDate]);

  // Date range logic
  const range = useMemo(() => {
    if (filterType === 'weekly') {
      return { start: startOfDay(startOfWeek(anchorDate)), end: endOfDay(endOfWeek(anchorDate)) };
    } else if (filterType === 'monthly') {
      return { start: startOfDay(startOfMonth(anchorDate)), end: endOfDay(endOfMonth(anchorDate)) };
    }
    return {
      start: startOfDay(customRange.start),
      end: endOfDay(customRange.end)
    };
  }, [filterType, anchorDate, customRange]);

  // Calculate Betfalme allowances
  const betfalmeAllowances = useMemo(() => {
    const stats = {};
    const currentRates = (editingRates && activeSubTab === 'betfalme') ? tempRates : savedRates;
    
    // Initialize stats for all staff
    STAFF_CONFIG.forEach(s => {
      stats[s.name] = { pm: 0, nt: 0, totalShifts: 0, amount: 0, rate: currentRates[s.name] || 0 };
    });

    schedule.forEach(day => {
      if (isWithinInterval(day.date, range)) {
        day.shifts.PM.forEach(name => {
          if (stats[name]) {
            stats[name].pm++;
            stats[name].totalShifts++;
            stats[name].amount += stats[name].rate;
          }
        });
        day.shifts.NT.forEach(name => {
          if (stats[name]) {
            stats[name].nt++;
            stats[name].totalShifts++;
            stats[name].amount += stats[name].rate;
          }
        });
      }
    });

    return Object.entries(stats)
      .map(([name, data]) => ({ name, ...data }))
      .filter(s => s.totalShifts > 0 || (editingRates && activeSubTab === 'betfalme'))
      .sort((a, b) => b.amount - a.amount);
  }, [schedule, range, savedRates, tempRates, editingRates, activeSubTab]);

  // Calculate SofaSafi allowances
  const sofasafiAllowances = useMemo(() => {
    if (!isLoggedIn) return [];
    
    const stats = {};
    const currentRates = (editingRates && activeSubTab === 'sofasafi') ? sofasafiTempRates : sofasafiSavedRates;
    
    // Initialize stats for all staff
    SOFASAFI_STAFF_CONFIG.forEach(s => {
      stats[s.name] = { pm: 0, nt: 0, totalShifts: 0, amount: 0, rate: currentRates[s.name] || 0 };
    });

    if (sofasafiSchedule) {
      sofasafiSchedule.forEach(day => {
        if (isWithinInterval(day.date, range)) {
          day.shifts.PM.forEach(name => {
            if (stats[name]) {
              stats[name].pm++;
              stats[name].totalShifts++;
              stats[name].amount += stats[name].rate;
            }
          });
          day.shifts.NT.forEach(name => {
            if (stats[name]) {
              stats[name].nt++;
              stats[name].totalShifts++;
              stats[name].amount += stats[name].rate;
            }
          });
        }
      });
    }

    return Object.entries(stats)
      .map(([name, data]) => ({ name, ...data }))
      .filter(s => s.totalShifts > 0 || (editingRates && activeSubTab === 'sofasafi'))
      .sort((a, b) => b.amount - a.amount);
  }, [sofasafiSchedule, range, sofasafiSavedRates, sofasafiTempRates, editingRates, activeSubTab, isLoggedIn]);

  // Calculate Totals
  const betfalmeTotal = useMemo(() => {
    return betfalmeAllowances.reduce((sum, s) => sum + s.amount, 0);
  }, [betfalmeAllowances]);

  const sofasafiTotal = useMemo(() => {
    return sofasafiAllowances.reduce((sum, s) => sum + s.amount, 0);
  }, [sofasafiAllowances]);

  const combinedTotal = useMemo(() => {
    return betfalmeTotal + sofasafiTotal;
  }, [betfalmeTotal, sofasafiTotal]);

  // Aggregate Combined allowances
  const combinedAllowances = useMemo(() => {
    if (!isLoggedIn) return [];
    
    const stats = {};
    const allStaff = [...STAFF_CONFIG, ...SOFASAFI_STAFF_CONFIG];
    allStaff.forEach(s => {
      stats[s.name] = {
        name: s.name,
        betfalmePM: 0,
        betfalmeNT: 0,
        betfalmeShifts: 0,
        betfalmeAmount: 0,
        sofasafiPM: 0,
        sofasafiNT: 0,
        sofasafiShifts: 0,
        sofasafiAmount: 0,
        totalAmount: 0
      };
    });

    betfalmeAllowances.forEach(item => {
      if (stats[item.name]) {
        stats[item.name].betfalmePM = item.pm;
        stats[item.name].betfalmeNT = item.nt;
        stats[item.name].betfalmeShifts = item.totalShifts;
        stats[item.name].betfalmeAmount = item.amount;
        stats[item.name].totalAmount += item.amount;
      }
    });

    sofasafiAllowances.forEach(item => {
      if (stats[item.name]) {
        stats[item.name].sofasafiPM = item.pm;
        stats[item.name].sofasafiNT = item.nt;
        stats[item.name].sofasafiShifts = item.totalShifts;
        stats[item.name].sofasafiAmount = item.amount;
        stats[item.name].totalAmount += item.amount;
      }
    });

    return Object.values(stats)
      .filter(s => s.totalAmount > 0)
      .sort((a, b) => b.totalAmount - a.totalAmount);
  }, [betfalmeAllowances, sofasafiAllowances, isLoggedIn]);

  const handleSave = () => {
    if (activeSubTab === 'sofasafi') {
      onSaveSofaSafiRates(sofasafiTempRates);
    } else {
      onSaveRates(tempRates);
    }
    setEditingRates(false);
  };

  const handlePay = () => {
    if (activeSubTab === 'sofasafi') {
      const payment = {
        id: Date.now(),
        date: new Date().toISOString(),
        range: `${format(range.start, 'MMM d')} - ${format(range.end, 'MMM d, yyyy')}`,
        amount: sofasafiTotal,
        staffCount: sofasafiAllowances.filter(s => s.amount > 0).length,
        type: filterType
      };
      onPaySofaSafi(payment);
    } else {
      const payment = {
        id: Date.now(),
        date: new Date().toISOString(),
        range: `${format(range.start, 'MMM d')} - ${format(range.end, 'MMM d, yyyy')}`,
        amount: betfalmeTotal,
        staffCount: betfalmeAllowances.filter(s => s.amount > 0).length,
        type: filterType
      };
      onPay(payment);
    }
  };

  // Determine current active display list and registries based on sub tab selection
  const currentList = activeSubTab === 'sofasafi' ? sofasafiAllowances : betfalmeAllowances;
  const currentHistory = activeSubTab === 'sofasafi' ? sofasafiPaymentHistory : paymentHistory;
  const currentRates = activeSubTab === 'sofasafi' ? sofasafiSavedRates : savedRates;

  return (
    <div className="space-y-8">
      {/* Sleek Compact Combined Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 p-6 rounded-2xl bg-card border border-border">
        <div>
          <h2 className="text-xl font-black text-white uppercase tracking-tighter">Transport Allowances</h2>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">
            Automated calculations for Late (PM) and Night (NT) commutes
          </p>
        </div>
        
        {isLoggedIn ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white/5 p-4 rounded-xl border border-white/5 w-full lg:w-auto">
            <div className="px-4 py-1 border-b sm:border-b-0 sm:border-r border-white/10">
              <p className="text-gray-500 text-[8px] font-black uppercase tracking-widest">Combined Total</p>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-xl font-black text-white tracking-tighter">{combinedTotal.toLocaleString()}</span>
                <span className="text-[10px] font-bold text-accent">KSh</span>
              </div>
            </div>
            <div className="px-4 py-1 border-b sm:border-b-0 sm:border-r border-white/10">
              <p className="text-gray-500 text-[8px] font-black uppercase tracking-widest">Betfalme Total</p>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-xl font-black text-white tracking-tighter">{betfalmeTotal.toLocaleString()}</span>
                <span className="text-[10px] font-bold text-emerald-400">KSh</span>
              </div>
            </div>
            <div className="px-4 py-1">
              <p className="text-gray-500 text-[8px] font-black uppercase tracking-widest">SofaSafi Total</p>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-xl font-black text-white tracking-tighter">{sofasafiTotal.toLocaleString()}</span>
                <span className="text-[10px] font-bold text-amber-500">KSh</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-6 bg-white/5 px-6 py-3 rounded-xl border border-white/5">
            <div>
              <p className="text-gray-500 text-[9px] font-black uppercase tracking-widest">Estimated Payout</p>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-2xl font-black text-white tracking-tighter">{betfalmeTotal.toLocaleString()}</span>
                <span className="text-xs font-bold text-accent">KSh</span>
              </div>
            </div>
            <button 
              onClick={handlePay}
              className="px-4 py-2 bg-accent hover:bg-accent/80 text-white rounded-lg font-black uppercase text-[9px] tracking-widest transition-all shadow-lg"
            >
              Mark Paid
            </button>
          </div>
        )}
      </div>

      {/* Filters & Actions */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 px-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* Main Date Filter */}
          <div className="flex bg-white/5 p-1 rounded-xl border border-border">
            {['weekly', 'monthly', 'custom'].map(type => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  filterType === type ? 'bg-white text-black shadow-lg shadow-black/10' : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Custom Range Picker */}
          {filterType === 'custom' && (
            <div className="flex flex-wrap items-center gap-4 bg-white/5 p-1.5 rounded-xl border border-border">
              <div className="flex items-center gap-2 px-2">
                <span className="text-[9px] font-black uppercase text-gray-500">From</span>
                <input 
                  type="date"
                  value={format(customRange.start, 'yyyy-MM-dd')}
                  onChange={(e) => {
                    if (e.target.value) {
                      setCustomRange(prev => ({ ...prev, start: new Date(e.target.value + 'T00:00:00') }));
                    }
                  }}
                  className="bg-black/40 border border-white/10 rounded-lg px-3 py-1 text-xs text-white font-bold focus:outline-none focus:border-accent [color-scheme:dark]"
                />
              </div>
              <div className="flex items-center gap-2 px-2 border-l border-white/10">
                <span className="text-[9px] font-black uppercase text-gray-500">To</span>
                <input 
                  type="date"
                  value={format(customRange.end, 'yyyy-MM-dd')}
                  onChange={(e) => {
                    if (e.target.value) {
                      setCustomRange(prev => ({ ...prev, end: new Date(e.target.value + 'T23:59:59') }));
                    }
                  }}
                  className="bg-black/40 border border-white/10 rounded-lg px-3 py-1 text-xs text-white font-bold focus:outline-none focus:border-accent [color-scheme:dark]"
                />
              </div>
            </div>
          )}
        </div>

        {/* Sub-Tabs Switcher for Branches (Only visible when logged in) */}
        <div className="flex flex-wrap items-center gap-4">
          {isLoggedIn && (
            <div className="flex bg-white/5 p-1 rounded-xl border border-border">
              <button
                onClick={() => { setActiveSubTab('combined'); setEditingRates(false); }}
                className={`px-5 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                  activeSubTab === 'combined' ? 'bg-white text-black shadow-lg shadow-black/10' : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                Combined View
              </button>
              <button
                onClick={() => { setActiveSubTab('betfalme'); setEditingRates(false); }}
                className={`px-5 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                  activeSubTab === 'betfalme' ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/20' : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                Betfalme
              </button>
              <button
                onClick={() => { setActiveSubTab('sofasafi'); setEditingRates(false); }}
                className={`px-5 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                  activeSubTab === 'sofasafi' ? 'bg-amber-600/20 text-amber-500 border border-amber-500/20' : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                SofaSafi
              </button>
            </div>
          )}

          {/* Configuration Action Trigger */}
          {activeSubTab !== 'combined' && (
            <button 
              onClick={() => {
                if (editingRates) handleSave();
                else {
                  setTempRates(savedRates);
                  setSofaSafiTempRates(sofasafiSavedRates);
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
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main List */}
        <div className="lg:col-span-2 space-y-4">
          
          {activeSubTab === 'combined' ? (
            /* Combined View Grid */
            <div className="space-y-4">
              <div className="px-6 py-2 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-gray-500">
                <span>Staff Member</span>
                <div className="flex gap-8 md:gap-16">
                  <span className="w-16 text-center">Betfalme</span>
                  <span className="w-16 text-center">SofaSafi</span>
                  <span className="w-24 text-right">Combined</span>
                </div>
              </div>

              <div className="space-y-3">
                {combinedAllowances.length === 0 ? (
                  <div className="py-16 text-center bg-card border border-border rounded-2xl">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 italic">No commute records for selected range</p>
                  </div>
                ) : (
                  combinedAllowances.map((s) => (
                    <motion.div 
                      layout
                      key={s.name}
                      className="p-6 rounded-2xl bg-card border border-border hover:border-white/10 transition-all group animate-fade-in"
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
                            <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Multiple Branch Commutes</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-8 md:gap-16">
                          <div className="flex flex-col items-center w-16">
                            <span className="text-xs font-black text-white">{s.betfalmeShifts} shifts</span>
                            <span className="text-[8px] font-bold text-emerald-400 tracking-wider uppercase mt-0.5">{s.betfalmeAmount.toLocaleString()} KSh</span>
                          </div>
                          <div className="flex flex-col items-center w-16">
                            <span className="text-xs font-black text-white">{s.sofasafiShifts} shifts</span>
                            <span className="text-[8px] font-bold text-amber-500 tracking-wider uppercase mt-0.5">{s.sofasafiAmount.toLocaleString()} KSh</span>
                          </div>
                          <div className="w-24 text-right">
                            <span className="text-xl font-black text-white tracking-tighter">
                              {s.totalAmount.toLocaleString()}
                            </span>
                            <span className="text-[9px] font-bold text-gray-500 ml-1">KSh</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          ) : (
            /* Specific Branch Grid (Betfalme or SofaSafi) */
            <div className="space-y-4">
              <div className="px-6 py-2 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-gray-500">
                <span>Staff Member</span>
                <div className="flex gap-12">
                  <span className="w-20 text-center">Shifts (PM/NT)</span>
                  <span className="w-24 text-right">Amount (KSh)</span>
                </div>
              </div>

              <div className="space-y-3">
                {currentList.length === 0 ? (
                  <div className="py-16 text-center bg-card border border-border rounded-2xl">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 italic">No commute records for this branch</p>
                  </div>
                ) : (
                  currentList.map((s) => (
                    <motion.div 
                      layout
                      key={s.name}
                      className="p-6 rounded-2xl bg-card border border-border hover:border-white/10 transition-all group animate-fade-in"
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
                                value={activeSubTab === 'sofasafi' ? (sofasafiTempRates[s.name] || '') : (tempRates[s.name] || '')}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value) || 0;
                                  if (activeSubTab === 'sofasafi') {
                                    setSofaSafiTempRates({ ...sofasafiTempRates, [s.name]: val });
                                  } else {
                                    setTempRates({ ...tempRates, [s.name]: val });
                                  }
                                }}
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
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar / Registry (Only visible when a specific branch is selected, combined tab shows Policy/Actions) */}
        <div className="space-y-6">
          {activeSubTab !== 'combined' ? (
            /* Branch Payment Registry */
            <div className="p-8 rounded-2xl bg-card border border-border animate-fade-in">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-black text-white uppercase tracking-tighter flex items-center gap-2">
                  <History size={18} className="text-blue-500" />
                  Registry
                </h3>
                
                <button 
                  onClick={handlePay}
                  disabled={currentList.length === 0}
                  className="px-4 py-2 bg-white text-black font-black uppercase text-[9px] tracking-widest rounded-xl hover:bg-gray-100 disabled:opacity-40 transition-all"
                >
                  Mark Paid
                </button>
              </div>
              
              <div className="space-y-4">
                {currentHistory.length === 0 && (
                  <div className="py-12 text-center">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-600 italic">No payments recorded</p>
                  </div>
                )}
                {currentHistory.map(h => (
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
          ) : (
            /* Combined Payout Breakdown Card */
            <div className="p-8 rounded-2xl bg-card border border-border animate-fade-in space-y-6">
              <h3 className="text-lg font-black text-white uppercase tracking-tighter flex items-center gap-2">
                <TrendingUp size={18} className="text-accent" />
                Branch Breakdown
              </h3>
              
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
                  <span className="text-[9px] text-emerald-400 font-black uppercase tracking-widest block mb-1">Betfalme</span>
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-black text-white tracking-tighter">{betfalmeTotal.toLocaleString()} <span className="text-xs font-bold text-gray-500">KSh</span></span>
                    <span className="text-[10px] text-gray-400 font-bold">{betfalmeAllowances.filter(s => s.amount > 0).length} staff</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10">
                  <span className="text-[9px] text-amber-400 font-black uppercase tracking-widest block mb-1">SofaSafi</span>
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-black text-white tracking-tighter">{sofasafiTotal.toLocaleString()} <span className="text-xs font-bold text-gray-500">KSh</span></span>
                    <span className="text-[10px] text-gray-400 font-bold">{sofasafiAllowances.filter(s => s.amount > 0).length} staff</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="p-8 rounded-2xl bg-accent/5 border border-accent/10">
            <div className="flex items-center gap-3 mb-4">
              <Info size={16} className="text-blue-500" />
              <h4 className="text-xs font-black text-white uppercase tracking-widest">Policy Insight</h4>
            </div>
            <p className="text-[11px] text-gray-400 leading-relaxed">
              Transport allowances are only applicable to Late (PM) and Night (NT) shifts due to commute requirements. Morning (AM) shifts do not qualify.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
