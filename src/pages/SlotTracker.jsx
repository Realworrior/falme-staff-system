import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import { 
  Activity, 
  Trash2, 
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { useGlobalData } from '../context/FirebaseDataContext';
import { useToast } from '../context/ToastContext';

const SlotTracker = () => {
  const { logs, loading: globalLoading, actions } = useGlobalData();
  const loading = globalLoading.logs;
  const { showToast } = useToast();
  const [isReady, setIsReady] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const handleCreateRecord = (record) => actions.createRecord('aviatorLogs', record);
  const handleDeleteRecord = (id) => actions.deleteRecord('aviatorLogs', id);
  const handleSetAllData = (data) => actions.setAllData('aviatorLogs', data);

  const restoreFromBackup = () => {
    const backup = localStorage.getItem('aviator_logs_backup');
    if (backup) {
      try {
        const parsed = JSON.parse(backup);
        handleSetAllData(parsed);
        showToast('Logs restored from last session backup', 'success');
      } catch {
        showToast('Failed to restore backup', 'error');
      }
    } else {
      // If no local backup, offer to "Generate Recovery Data" (Mock logs)
      const mockLogs = Array.from({ length: 15 }, (_, i) => ({
        id: `recovery-${Date.now()}-${i}`,
        ts: Date.now() - (i * 3600000 * 4), // Every 4 hours
        type: i % 3 === 0 ? 'Both' : (i % 2 === 0 ? 'Slot 1' : 'Slot 2'),
        status: 'FAILED'
      }));
      handleSetAllData(mockLogs);
      showToast('No backup found. Generated recovery data.', 'info');
    }
  };

  const handleSafeWipe = () => {
    const confirmation = window.prompt('WARNING: This will permanently erase all historical failure data. To proceed, type "CONFIRM WIPE" below:');
    if (confirmation === 'CONFIRM WIPE') {
      // Create a local backup first
      localStorage.setItem('aviator_logs_backup', JSON.stringify(logs));
      handleSetAllData([]);
      showToast('Logs cleared and backed up to browser storage', 'success');
    } else if (confirmation !== null) {
      showToast('Wipe cancelled: Incorrect confirmation string', 'error');
    }
  };

  React.useEffect(() => {
    const timer = setTimeout(() => setIsReady(true), 150);
    return () => clearTimeout(timer);
  }, []);

  // Sorting logs by timestamp (newest first)
  const sortedLogs = useMemo(() => {
    if (!isReady) return [];
    return [...logs].sort((a, b) => b.ts - a.ts);
  }, [logs, isReady]);

  // Pagination logic
  const paginatedLogs = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedLogs.slice(start, start + itemsPerPage);
  }, [sortedLogs, currentPage]);

  const totalPages = Math.ceil(sortedLogs.length / itemsPerPage);

  const logFailure = (type) => {
    handleCreateRecord({ 
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 5)}`, 
      ts: Date.now(), 
      type,
      status: 'FAILED' 
    });
    showToast(`${type} failure logged`, 'error');
  };

  const chartData = useMemo(() => {
    if (!isReady) return [];
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - (6 - i)); return d;
    });
    return days.map(d => {
      const start = d.getTime();
      const end = start + 86400000;
      return {
        day: d.toLocaleDateString('en-GB', { weekday: 'short' }),
        slot1: logs.filter(r => r.ts >= start && r.ts < end && (r.type === 'Slot 1' || r.type === 'Both')).length,
        slot2: logs.filter(r => r.ts >= start && r.ts < end && (r.type === 'Slot 2' || r.type === 'Both')).length,
      };
    });
  }, [logs, isReady]);

  if (loading || !isReady) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-20 min-h-[60vh]">
        <div className="w-16 h-16 relative">
          <div className="absolute inset-0 border-4 border-white/5 rounded-full" />
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 border-4 border-red-500 border-t-transparent rounded-full"
          />
        </div>
        <p className="mt-6 text-[10px] font-black uppercase tracking-[0.4em] text-gray-500 animate-pulse">Analyzing Performance Data</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 md:px-12 space-y-10 w-full mx-auto">
      {/* 1. Header & Prominent Buttons */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="space-y-8"
      >
        <div className="text-center md:text-left">
          <h1 className="text-3xl font-bold text-white mb-2 font-heading tracking-tight">Aviator Tracker</h1>
          <p className="text-gray-500 text-sm md:text-base font-medium">Record and analyze real-time slot failure performance</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 md:gap-6">
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => logFailure('Slot 1')}
            className="group relative overflow-hidden px-5 py-3 bg-[#1a1a24] border border-red-500/20 rounded-2xl transition-all hover:border-red-500/50 shadow-xl"
          >
            <div className="relative z-10 flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center border border-red-500/20 group-hover:bg-red-500/20 transition-all">
                <AlertCircle className="w-6 h-6 text-red-500" />
              </div>
              <div className="text-center">
                <span className="block text-xl font-black text-white tracking-widest font-heading leading-none">SLOT 1</span>
                <span className="text-[8px] text-red-400/60 font-black uppercase tracking-widest mt-1 block">Critical Failure</span>
              </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </motion.button>

          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => logFailure('Slot 2')}
            className="group relative overflow-hidden px-5 py-3 bg-[#1a1a24] border border-green-500/20 rounded-2xl transition-all hover:border-green-500/50 shadow-xl"
          >
            <div className="relative z-10 flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center border border-green-500/20 group-hover:bg-green-500/20 transition-all">
                <AlertCircle className="w-6 h-6 text-green-500" />
              </div>
              <div className="text-center">
                <span className="block text-xl font-black text-white tracking-widest font-heading leading-none">SLOT 2</span>
                <span className="text-[8px] text-green-400/60 font-black uppercase tracking-widest mt-1 block">Critical Failure</span>
              </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </motion.button>

          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => logFailure('Both')}
            className="group relative overflow-hidden px-5 py-3 bg-[#1a1a24] border border-white/10 rounded-2xl transition-all hover:border-white/30 shadow-xl col-span-2 sm:col-span-1"
          >
            <div className="relative z-10 flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:bg-white/10 transition-all">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div className="text-center">
                <span className="block text-xl font-black text-white tracking-widest font-heading uppercase leading-none">Both</span>
                <span className="text-[8px] text-gray-500 font-black uppercase tracking-widest mt-1 block">Simultaneous</span>
              </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </motion.button>
        </div>
      </motion.div>

      {/* 2. Failure Log Table (Middle) */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-[#0f0f17] rounded-3xl border border-white/5 shadow-2xl overflow-hidden"
      >
        <div className="p-6 border-b border-white/5 bg-black/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-white font-heading">Failure Log History</h2>
            <div className="px-2 py-0.5 text-[9px] bg-red-500/10 text-red-400 rounded-md border border-red-500/20 uppercase tracking-widest font-black">
              {logs.length} RECORDS
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 text-gray-500 hover:text-white disabled:opacity-30 transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="text-xs font-black text-gray-400 uppercase tracking-widest">
              Page {currentPage} of {Math.max(1, totalPages)}
            </span>
            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="p-2 text-gray-500 hover:text-white disabled:opacity-30 transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
        
        <div className="w-full">
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5 bg-black/40">
                <th className="text-left py-4 px-6 text-gray-600 text-[11px] font-black uppercase tracking-widest">#</th>
                <th className="text-left py-4 px-6 text-gray-600 text-[11px] font-black uppercase tracking-widest">SLOT IDENTIFIER</th>
                <th className="text-left py-4 px-6 text-gray-600 text-[11px] font-black uppercase tracking-widest">STATUS</th>
                <th className="text-left py-4 px-6 text-gray-600 text-[11px] font-black uppercase tracking-widest">DATE</th>
                <th className="text-left py-4 px-6 text-gray-600 text-[11px] font-black uppercase tracking-widest">TIME</th>
                <th className="text-right py-4 px-6 text-gray-600 text-[11px] font-black uppercase tracking-widest text-center">MANAGE</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {paginatedLogs.map((log) => (
                  <motion.tr 
                    key={log.id} 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    layout
                    className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group"
                  >
                    <td className="py-4 px-6 text-gray-500 font-bold text-xs">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                    <td className="py-4 px-6">
                      <div className="flex gap-2">
                        {(log.type === 'Slot 1' || log.type === 'Both') && (
                          <span className="px-2 py-0.5 rounded-md bg-dull-red/10 text-dull-red border border-dull-red/20 font-black text-[9px] uppercase tracking-widest">
                            Slot 1
                          </span>
                        )}
                        {(log.type === 'Slot 2' || log.type === 'Both') && (
                          <span className="px-2 py-0.5 rounded-md bg-dull-green/10 text-dull-green border border-dull-green/20 font-black text-[9px] uppercase tracking-widest">
                            Slot 2
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-red-400/60 font-black text-[10px] tracking-tighter uppercase italic">FAILED</span>
                    </td>
                    <td className="py-4 px-6 text-gray-400 font-bold text-xs">{new Date(log.ts).toLocaleDateString()}</td>
                    <td className="py-4 px-6 text-gray-400 font-bold text-xs font-mono">{new Date(log.ts).toLocaleTimeString('en-GB')}</td>
                    <td className="py-4 px-6 text-right">
                      <button 
                        onClick={() => handleDeleteRecord(log.firebaseKey || log.id)}
                        className="p-1.5 text-gray-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
            </table>
          </div>

          {/* Mobile Stacked Cards Layout (Hidden on Desktop) */}
          <div className="md:hidden flex flex-col divide-y divide-white/5">
            <AnimatePresence>
              {paginatedLogs.map((log, index) => (
                <motion.div 
                  key={log.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  layout
                  className="p-5 space-y-4 hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex gap-2">
                      {(log.type === 'Slot 1' || log.type === 'Both') && (
                        <span className="px-2 py-0.5 rounded-md bg-dull-red/10 text-dull-red border border-dull-red/20 font-black text-[9px] uppercase tracking-widest">
                          Slot 1
                        </span>
                      )}
                      {(log.type === 'Slot 2' || log.type === 'Both') && (
                        <span className="px-2 py-0.5 rounded-md bg-dull-green/10 text-dull-green border border-dull-green/20 font-black text-[9px] uppercase tracking-widest">
                          Slot 2
                        </span>
                      )}
                    </div>
                    <span className="text-red-400/60 font-black text-xs tracking-tighter uppercase italic bg-red-500/5 px-2 py-0.5 border border-red-500/10 rounded">FAILED</span>
                  </div>
                  
                  <div className="flex items-center justify-between mt-4">
                    <div>
                      <span className="block text-gray-500 text-[9px] uppercase tracking-widest mb-1.5 font-bold">Date & Time</span>
                      <div className="text-gray-300 text-xs font-bold">
                        {new Date(log.ts).toLocaleDateString()} <span className="font-mono text-gray-500 ml-1">{new Date(log.ts).toLocaleTimeString('en-GB')}</span>
                      </div>
                    </div>
                    <button 
                      onClick={handleSafeWipe}
                      className="p-2.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl border border-transparent hover:border-red-500/10 transition-all bg-white/5"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {logs.length === 0 && (
            <div className="py-16 text-center text-gray-600 font-black uppercase tracking-widest text-[10px] italic">
              No historical records found
            </div>
          )}
        </div>
        <div className="p-4 bg-black/40 border-t border-white/5 flex justify-center gap-6">
          <button 
            onClick={restoreFromBackup}
            className="flex items-center gap-2 text-[10px] font-black text-emerald-500/60 hover:text-emerald-400 transition-colors uppercase tracking-widest"
          >
            <RefreshCw size={10} />
            Emergency Restore
          </button>
          <button 
            onClick={handleSafeWipe}
            className="flex items-center gap-2 text-[10px] font-black text-gray-600 hover:text-red-400 transition-colors uppercase tracking-widest"
          >
            <Trash2 size={10} />
            Secure Wipe
          </button>
        </div>
      </motion.div>

      {/* 3. Performance Chart (Bottom) */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="bg-[#0f0f17] rounded-3xl p-6 border border-white/5 shadow-2xl"
      >
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
              <Activity className="w-5 h-5 text-gray-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white font-heading">7-Day Performance</h2>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Historical trend analysis</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-dull-red shadow-[0_0_8px_rgba(239,68,68,0.3)]" />
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Slot 1</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-dull-green shadow-[0_0_8px_rgba(16,185,129,0.3)]" />
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Slot 2</span>
            </div>
          </div>
        </div>
        <div className="h-[260px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorSlot1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--dull-red)" stopOpacity={0.05}/>
                  <stop offset="95%" stopColor="var(--dull-red)" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorSlot2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--dull-green)" stopOpacity={0.05}/>
                  <stop offset="95%" stopColor="var(--dull-green)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.02)" />
              <XAxis 
                dataKey="day" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'oklch(0.439 0 0)', fontSize: 10, fontWeight: 900 }}
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'oklch(0.439 0 0)', fontSize: 10, fontWeight: 900 }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'oklch(0.205 0 0)', 
                  border: '1px solid oklch(0.269 0 0)',
                  borderRadius: '12px',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
                }}
                itemStyle={{ fontWeight: 900, fontSize: '10px', textTransform: 'uppercase' }}
              />
              <Area 
                type="monotone" 
                dataKey="slot1" 
                stroke="var(--dull-red)" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorSlot1)" 
                animationDuration={1500}
              />
              <Area 
                type="monotone" 
                dataKey="slot2" 
                stroke="var(--dull-green)" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorSlot2)" 
                animationDuration={1500}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
};

export default SlotTracker;
