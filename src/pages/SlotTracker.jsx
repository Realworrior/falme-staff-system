import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Download,
  Trash2, 
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Clock,
  MoreVertical,
  Activity
} from 'lucide-react';
import { useSupabaseData } from '../context/SupabaseDataContext';
import { useToast } from '../context/ToastContext';

const SlotTracker = () => {
  const { logs, loading: globalLoading, actions } = useSupabaseData();
  const loading = globalLoading.logs;
  const { showToast } = useToast();
  const [isReady, setIsReady] = useState(false);
  const [activeTab, setActiveTab] = useState('log'); // 'log' | 'history'
  const [currentPage, setCurrentPage] = useState(1);
  const [now, setNow] = useState(Date.now());
  const itemsPerPage = 10;

  useEffect(() => {
    const timer = setTimeout(() => setIsReady(true), 150);
    const interval = setInterval(() => setNow(Date.now()), 10000);
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

  const handleCreateRecord = (record) => actions.createRecord('aviatorLogs', record);
  const handleDeleteRecord = (id) => actions.deleteRecord('aviatorLogs', id);
  const handleSetAllData = (data) => actions.setAllData('aviatorLogs', data);

  // Sorting logs by timestamp (newest first)
  const sortedLogs = useMemo(() => {
    if (!isReady || !logs) return [];
    return [...logs].sort((a, b) => b.ts - a.ts);
  }, [logs, isReady]);

  // Statistics calculation for Slot 1 and Slot 2
  const stats = useMemo(() => {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const todayTs = startOfToday.getTime();

    // Slot 1
    const slot1Logs = sortedLogs.filter(l => l.type === 'Slot 1' || l.type === 'Both');
    const slot1Today = slot1Logs.filter(l => l.ts >= todayTs).length;
    const slot1Total = slot1Logs.length;
    const lastSlot1 = slot1Logs.length > 0 ? slot1Logs[0].ts : null;

    // Slot 2
    const slot2Logs = sortedLogs.filter(l => l.type === 'Slot 2' || l.type === 'Both');
    const slot2Today = slot2Logs.filter(l => l.ts >= todayTs).length;
    const slot2Total = slot2Logs.length;
    const lastSlot2 = slot2Logs.length > 0 ? slot2Logs[0].ts : null;

    return {
      slot1: { today: slot1Today, total: slot1Total, lastTs: lastSlot1 },
      slot2: { today: slot2Today, total: slot2Total, lastTs: lastSlot2 },
      totalFailures: sortedLogs.length
    };
  }, [sortedLogs]);

  const formatTimeSince = (ts) => {
    if (!ts) return { duration: 'Never', dateStr: 'No incidents' };
    const diffMs = Math.max(0, now - ts);
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    let duration = '';
    if (diffMins < 1) duration = 'Just now';
    else if (diffMins < 60) duration = `${diffMins}m ago`;
    else if (diffHours < 24) duration = `${diffHours}h ${diffMins % 60}m ago`;
    else duration = `${diffDays}d ago`;

    const date = new Date(ts);
    const dateStr = date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    return { duration, dateStr };
  };

  const slot1Time = formatTimeSince(stats.slot1.lastTs);
  const slot2Time = formatTimeSince(stats.slot2.lastTs);

  const logFailure = (type) => {
    handleCreateRecord({ 
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 5)}`, 
      ts: Date.now(), 
      type,
      status: 'FAILED' 
    });
    showToast(`${type} failure logged`, 'success');
  };

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(sortedLogs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `aviator_logs_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast("Exported logs successfully", "success");
  };

  // Pagination for History
  const paginatedLogs = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedLogs.slice(start, start + itemsPerPage);
  }, [sortedLogs, currentPage]);

  const totalPages = Math.ceil(sortedLogs.length / itemsPerPage);

  if (loading || !isReady) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-20 min-h-[60vh] text-[#8B8E97]">
        <div className="w-10 h-10 border-2 border-white/10 border-t-[#F2E75A] rounded-full animate-spin mb-4" />
        <p className="text-xs font-mono">Loading Aviator Logs...</p>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)] py-8 px-4 flex flex-col items-center justify-start text-[#F4F5F1] font-sans selection:bg-[#F2E75A]/20">
      
      {/* ── MAIN CONTAINER CARD ── */}
      <div className="w-full max-w-[760px] bg-[#1B1C22] border border-white/[0.07] rounded-[28px] p-6 sm:p-7 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        
        {/* Header with Tab Switcher & Export Download Button */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveTab('log')}
              className={`font-['Space_Grotesk'] text-2xl font-semibold tracking-tight transition-colors cursor-pointer ${
                activeTab === 'log' ? 'text-[#F4F5F1]' : 'text-[#54565F] hover:text-[#8B8E97]'
              }`}
            >
              Log
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`font-['Space_Grotesk'] text-2xl font-semibold tracking-tight transition-colors cursor-pointer ${
                activeTab === 'history' ? 'text-[#F4F5F1]' : 'text-[#54565F] hover:text-[#8B8E97]'
              }`}
            >
              History
            </button>
          </div>

          <button
            onClick={handleExportJSON}
            className="w-9 h-9 rounded-full bg-[#232429] hover:bg-[#0E0E12] border border-white/[0.07] flex items-center justify-center text-[#8B8E97] hover:text-[#F4F5F1] transition-all cursor-pointer shadow-sm"
            title="Download Logs JSON"
          >
            <Download size={15} />
          </button>
        </div>

        {/* Subtitle */}
        <p className="text-[13px] text-[#54565F] mb-6 font-normal">
          This log is shared. Everyone who opens this page sees the same entries.
        </p>

        {/* ── TAB 1: LOG VIEW ── */}
        {activeTab === 'log' && (
          <div>
            {/* Two Side-by-Side Dual Slot Modules with Center Divider */}
            <div className="relative grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              
              {/* SLOT 1 BOX */}
              <div className="bg-[#0E0E12] border border-white/[0.07] rounded-[18px] p-5 flex flex-col justify-between">
                
                {/* Top Row: Title, Counts & Status Pill */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[13px] text-[#8B8E97] font-medium">Aviator Slot 1</span>
                    <div className="flex items-center gap-1.5 bg-[#232429] border border-white/[0.14] rounded-full px-2.5 py-0.5 text-[11px] text-[#8B8E97]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00D66B]" />
                      <span>Stable</span>
                    </div>
                  </div>

                  <div className="text-xs text-[#54565F] font-mono mb-5">
                    <b className="text-[#8B8E97] font-semibold">{stats.slot1.today}</b> today <span className="text-[#54565F]">/</span> <b className="text-[#8B8E97] font-semibold">{stats.slot1.total}</b> all time
                  </div>

                  {/* Main Since last failure time */}
                  <div>
                    <span className="text-[11px] text-[#54565F] block mb-1">Since last failure</span>
                    <div className="font-['Space_Grotesk'] text-[36px] sm:text-[40px] font-semibold tracking-tight text-[#F4F5F1] leading-none mb-1">
                      {slot1Time.duration}
                    </div>
                    <div className="text-[11.5px] font-mono text-[#54565F]">
                      {slot1Time.dateStr}
                    </div>
                  </div>
                </div>

                {/* Log failure Button */}
                <div className="pt-6">
                  <button
                    onClick={() => logFailure('Slot 1')}
                    className="w-full flex items-center justify-center gap-2 bg-[#F2E75A] hover:brightness-105 active:scale-[0.98] text-[#2A2705] font-semibold text-[13.5px] rounded-full py-3 transition-all cursor-pointer shadow-md"
                  >
                    <span>Log failure</span>
                    <span className="font-mono text-xs font-bold leading-none tracking-tighter">»»»</span>
                  </button>
                </div>

              </div>

              {/* SLOT 2 BOX */}
              <div className="bg-[#0E0E12] border border-white/[0.07] rounded-[18px] p-5 flex flex-col justify-between">
                
                {/* Top Row: Title, Counts & Status Pill */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[13px] text-[#8B8E97] font-medium">Aviator Slot 2</span>
                    <div className="flex items-center gap-1.5 bg-[#232429] border border-white/[0.14] rounded-full px-2.5 py-0.5 text-[11px] text-[#8B8E97]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00D66B]" />
                      <span>Stable</span>
                    </div>
                  </div>

                  <div className="text-xs text-[#54565F] font-mono mb-5">
                    <b className="text-[#8B8E97] font-semibold">{stats.slot2.today}</b> today <span className="text-[#54565F]">/</span> <b className="text-[#8B8E97] font-semibold">{stats.slot2.total}</b> all time
                  </div>

                  {/* Main Since last failure time */}
                  <div>
                    <span className="text-[11px] text-[#54565F] block mb-1">Since last failure</span>
                    <div className="font-['Space_Grotesk'] text-[36px] sm:text-[40px] font-semibold tracking-tight text-[#F4F5F1] leading-none mb-1">
                      {slot2Time.duration}
                    </div>
                    <div className="text-[11.5px] font-mono text-[#54565F]">
                      {slot2Time.dateStr}
                    </div>
                  </div>
                </div>

                {/* Log failure Button */}
                <div className="pt-6">
                  <button
                    onClick={() => logFailure('Slot 2')}
                    className="w-full flex items-center justify-center gap-2 bg-[#F2E75A] hover:brightness-105 active:scale-[0.98] text-[#2A2705] font-semibold text-[13.5px] rounded-full py-3 transition-all cursor-pointer shadow-md"
                  >
                    <span>Log failure</span>
                    <span className="font-mono text-xs font-bold leading-none tracking-tighter">»»»</span>
                  </button>
                </div>

              </div>

              {/* Center Round Dots Divider Icon */}
              <div 
                onClick={() => logFailure('Both')}
                className="hidden sm:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[36px] h-[36px] rounded-full bg-[#232429] border border-white/[0.14] items-center justify-center text-[#8B8E97] hover:text-[#00D66B] hover:scale-110 active:scale-95 transition-all cursor-pointer z-10 shadow-md group"
                title="Log failure on Both Slots"
              >
                <MoreVertical size={15} className="group-hover:text-[#00D66B] transition-colors" />
              </div>

            </div>

            {/* Both Slots Action Bar */}
            <div className="bg-[#0E0E12] border border-white/[0.07] rounded-[18px] p-3.5 sm:px-5 flex flex-col sm:flex-row items-center justify-between gap-3 mb-5">
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                <span className="text-xs font-medium text-[#8B8E97]">Both slots experiencing failure simultaneously?</span>
              </div>
              <button
                onClick={() => logFailure('Both')}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#232429] hover:bg-red-500/20 border border-white/[0.1] hover:border-red-500/40 text-[#F4F5F1] hover:text-red-300 font-semibold text-xs rounded-full px-5 py-2.5 transition-all cursor-pointer active:scale-95 shadow-sm"
              >
                <span>Log Both Slots »</span>
              </button>
            </div>

            {/* Bottom Help Text */}
            <div className="text-center text-[12.5px] text-[#54565F]">
              <span>{stats.totalFailures} failures logged in total. Switch to </span>
              <button 
                onClick={() => setActiveTab('history')} 
                className="text-[#8B8E97] hover:text-[#F4F5F1] underline font-medium cursor-pointer"
              >
                History
              </button>
              <span> to review or edit them.</span>
            </div>
          </div>
        )}

        {/* ── TAB 2: HISTORY VIEW ── */}
        {activeTab === 'history' && (
          <div className="space-y-4">
            
            {/* Table / List Container */}
            <div className="bg-[#0E0E12] border border-white/[0.07] rounded-[18px] overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.05]">
                <span className="text-xs font-semibold text-[#8B8E97]">Failure Incidents ({sortedLogs.length})</span>
                
                {/* Pagination Controls */}
                <div className="flex items-center gap-1.5 text-xs font-mono text-[#54565F]">
                  <button 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-1 rounded bg-[#232429] hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none text-[#8B8E97] hover:text-white transition-all"
                  >
                    <ChevronLeft size={13} />
                  </button>
                  <span className="px-1.5">{currentPage} / {Math.max(1, totalPages)}</span>
                  <button 
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages || totalPages === 0}
                    className="p-1 rounded bg-[#232429] hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none text-[#8B8E97] hover:text-white transition-all"
                  >
                    <ChevronRight size={13} />
                  </button>
                </div>
              </div>

              {paginatedLogs.length === 0 ? (
                <div className="text-center py-12 text-xs text-[#54565F]">
                  No historical failure records found.
                </div>
              ) : (
                <div className="divide-y divide-white/[0.05]">
                  {paginatedLogs.map((log) => (
                    <div 
                      key={log.id} 
                      className="p-3.5 sm:px-4 flex items-center justify-between gap-3 text-xs hover:bg-white/[0.02] transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                          log.type === 'Slot 1'
                            ? 'bg-[#F2E75A]/15 text-[#F2E75A] border border-[#F2E75A]/20'
                            : log.type === 'Slot 2'
                            ? 'bg-[#3ED3F2]/15 text-[#3ED3F2] border border-[#3ED3F2]/20'
                            : 'bg-red-500/15 text-red-400 border border-red-500/20'
                        }`}>
                          {log.type}
                        </span>
                        <span className="font-mono text-[#F4F5F1] text-[11.5px]">
                          {new Date(log.ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        <span className="font-mono text-[#54565F] text-[11.5px] hidden sm:inline">
                          {new Date(log.ts).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </span>
                      </div>

                      <button
                        onClick={() => {
                          handleDeleteRecord(log.id);
                          showToast("Record removed", "info");
                        }}
                        className="p-1.5 rounded-lg bg-[#232429] hover:bg-red-500/20 text-[#54565F] hover:text-red-400 border border-white/[0.05] transition-all"
                        title="Delete this record"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Back to Log Link */}
            <div className="flex items-center justify-between text-xs text-[#54565F] px-1">
              <span>Failures are recorded with exact server timestamps.</span>
              <button
                onClick={() => setActiveTab('log')}
                className="text-[#F2E75A] hover:underline font-medium cursor-pointer"
              >
                « Back to Log View
              </button>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};

export default SlotTracker;
