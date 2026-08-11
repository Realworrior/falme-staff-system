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
import { useSupabaseData } from '../context/SupabaseDataContext';
import { useToast } from '../context/ToastContext';
import AviatorPulse from '../components/Dashboard/AviatorPulse';

const SlotTracker = () => {
  const { logs, loading: globalLoading, actions } = useSupabaseData();
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
        <div className="w-14 h-14 relative">
          <div className="absolute inset-0 border-4 border-[#2a2b2f] rounded-full" />
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 border-4 border-[#baff55] border-t-transparent rounded-full"
          />
        </div>
        <p className="mt-5 text-sm text-[#8e8e93]">Analyzing Performance Data</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 md:px-12 space-y-8 w-full mx-auto bg-[#0e1017] min-h-screen">
      {/* Header & Log Buttons */}
      <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Aviator Tracker</h1>
          <p className="text-[#8e8e93] text-sm mt-1">Record and analyze real-time slot failure performance</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl">
          <button
            onClick={() => logFailure('Slot 1')}
            className="bg-[#131520] rounded-[24px] p-5 flex items-center gap-4 hover:bg-[#191c2b] transition-all group shadow-lg"
          >
            <div className="w-10 h-10 rounded-2xl bg-[#10b981]/10 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-[#10b981]" />
            </div>
            <div className="text-left">
              <span className="block text-sm font-semibold text-white">Slot 1</span>
              <span className="text-xs text-[#10b981]">Green Slot</span>
            </div>
          </button>

          <button
            onClick={() => logFailure('Slot 2')}
            className="bg-[#131520] rounded-[24px] p-5 flex items-center gap-4 hover:bg-[#191c2b] transition-all group shadow-lg"
          >
            <div className="w-10 h-10 rounded-2xl bg-[#3b82f6]/10 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-[#3b82f6]" />
            </div>
            <div className="text-left">
              <span className="block text-sm font-semibold text-white">Slot 2</span>
              <span className="text-xs text-[#3b82f6]">Blue Slot</span>
            </div>
          </button>

          <button
            onClick={() => logFailure('Both')}
            className="bg-[#131520] rounded-[24px] p-5 flex items-center gap-4 hover:bg-[#191c2b] transition-all group shadow-lg"
          >
            <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <span className="block text-sm font-semibold text-white">Both</span>
              <span className="text-xs text-[#8e8e93]">Simultaneous</span>
            </div>
          </button>
        </div>
      </motion.div>

      {/* Failure Log Table */}
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}
        className="bg-[#131520] rounded-[32px] overflow-hidden shadow-2xl"
      >
        <div className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-white">Failure Log History</h2>
            <div className="px-3 py-1 text-xs bg-[#ff4d4d]/10 text-[#ff4d4d] rounded-full font-semibold">
              {logs.length} records
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="w-9 h-9 rounded-full bg-[#1b1e2b] flex items-center justify-center text-[#8e8e93] hover:text-white disabled:opacity-30 transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-xs font-medium text-[#8e8e93] px-2">
              {currentPage} / {Math.max(1, totalPages)}
            </span>
            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="w-9 h-9 rounded-full bg-[#1b1e2b] flex items-center justify-center text-[#8e8e93] hover:text-white disabled:opacity-30 transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
        
        <div className="w-full">
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
            <thead>
              <tr className="bg-white/[0.02]">
                <th className="text-left py-4 px-6 text-[#8e8e93] text-xs font-medium">#</th>
                <th className="text-left py-4 px-6 text-[#8e8e93] text-xs font-medium">Slot</th>
                <th className="text-left py-4 px-6 text-[#8e8e93] text-xs font-medium">Date</th>
                <th className="text-left py-4 px-6 text-[#8e8e93] text-xs font-medium">Time</th>
                <th className="text-right py-4 px-6 text-[#8e8e93] text-xs font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              <AnimatePresence>
                {paginatedLogs.map((log, index) => (
                  <motion.tr 
                    key={log.id} 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    layout
                    className="hover:bg-white/[0.02] transition-colors group"
                  >
                    <td className="py-4 px-6 text-[#8e8e93] text-xs">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                    <td className="py-4 px-6">
                      <div className="flex gap-2">
                        {(log.type === 'Slot 1' || log.type === 'Both') && (
                          <span className="px-3 py-1 rounded-full bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/20 text-xs font-semibold">
                            Slot 1
                          </span>
                        )}
                        {(log.type === 'Slot 2' || log.type === 'Both') && (
                          <span className="px-3 py-1 rounded-full bg-[#3b82f6]/10 text-[#3b82f6] border border-[#3b82f6]/20 text-xs font-semibold">
                            Slot 2
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-white text-xs">{new Date(log.ts).toLocaleDateString()}</td>
                    <td className="py-4 px-6 text-[#8e8e93] text-xs font-mono">{new Date(log.ts).toLocaleTimeString('en-GB')}</td>
                    <td className="py-4 px-6 text-right">
                      <button 
                        onClick={() => handleDeleteRecord(log.id)}
                        className="w-8 h-8 rounded-full bg-[#161616] border border-[#3a3b3f] flex items-center justify-center ml-auto text-[#8e8e93] hover:text-[#ff4d4d] hover:border-[#ff4d4d]/30 transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden flex flex-col divide-y divide-[#3a3b3f]/50">
            <AnimatePresence>
              {paginatedLogs.map((log, index) => (
                <motion.div 
                  key={log.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  layout
                  className="p-5 flex items-center justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      {(log.type === 'Slot 1' || log.type === 'Both') && (
                        <span className="px-3 py-1 rounded-full bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/20 text-xs font-semibold">Slot 1</span>
                      )}
                      {(log.type === 'Slot 2' || log.type === 'Both') && (
                        <span className="px-3 py-1 rounded-full bg-[#3b82f6]/10 text-[#3b82f6] border border-[#3b82f6]/20 text-xs font-semibold">Slot 2</span>
                      )}
                    </div>
                    <div className="text-xs text-[#8e8e93]">
                      {new Date(log.ts).toLocaleDateString()} <span className="font-mono ml-1">{new Date(log.ts).toLocaleTimeString('en-GB')}</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleDeleteRecord(log.id)}
                    className="w-9 h-9 rounded-full bg-[#161616] border border-[#3a3b3f] flex items-center justify-center text-[#8e8e93] hover:text-[#ff4d4d] hover:border-[#ff4d4d]/30 transition-all"
                  >
                    <Trash2 size={15} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {logs.length === 0 && (
            <div className="py-16 text-center text-[#8e8e93] text-sm">No historical records found</div>
          )}
        </div>
        <div className="p-4 border-t border-[#3a3b3f] flex justify-center gap-8">
          <button 
            onClick={restoreFromBackup}
            className="flex items-center gap-2 text-xs font-medium text-[#baff55]/60 hover:text-[#baff55] transition-colors"
          >
            <RefreshCw size={12} /> Emergency Restore
          </button>
          <button 
            onClick={handleSafeWipe}
            className="flex items-center gap-2 text-xs font-medium text-[#8e8e93] hover:text-[#ff4d4d] transition-colors"
          >
            <Trash2 size={12} /> Secure Wipe
          </button>
        </div>
      </motion.div>

      {/* Performance Chart / Aviator Pulse */}
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }}>
        <AviatorPulse />
      </motion.div>
    </div>
  );
};

export default SlotTracker;
