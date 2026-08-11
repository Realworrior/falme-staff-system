import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, 
  Filter, 
  Download, 
  Clock, 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  AlertCircle,
  Zap,
  CheckCircle2
} from 'lucide-react';
import { useSupabaseData } from '../../context/SupabaseDataContext';
import { useToast } from '../../context/ToastContext';

export default function AviatorPulse() {
  const { logs, actions } = useSupabaseData();
  const { showToast } = useToast();

  // Selected 8h window view: '00-08', '08-16', '16-24', or '24h'
  const [windowView, setWindowView] = useState('24h');
  const [hoveredColumn, setHoveredColumn] = useState(null);
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  });

  // Quick failure logger modal / shortcut
  const [showLogModal, setShowLogModal] = useState(false);

  const logFailure = (type) => {
    actions.createRecord('aviatorLogs', {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      ts: Date.now(),
      type,
      status: 'FAILED'
    });
    showToast(`${type} failure recorded`, 'success');
    setShowLogModal(false);
  };

  // Generate 15-minute scaled columns for the selected view, triggered by aviator logs
  const columnsData = useMemo(() => {
    const targetDate = new Date(selectedDate);
    targetDate.setHours(0, 0, 0, 0);
    const startOfDay = targetDate.getTime();
    const endOfDay = startOfDay + 24 * 60 * 60 * 1000;

    // Filter logs for selected day
    const dayLogs = (logs || []).filter(l => l.ts >= startOfDay && l.ts < endOfDay);

    let startHour = 0;
    let endHour = 24;
    const stepMinutes = 15; // Scaled to 15 minutes!

    if (windowView === '00-08') {
      startHour = 0;
      endHour = 8;
    } else if (windowView === '08-16') {
      startHour = 8;
      endHour = 16;
    } else if (windowView === '16-24') {
      startHour = 16;
      endHour = 24;
    }

    const totalSteps = (endHour - startHour) * (60 / stepMinutes); // 32 steps for 8h window, 96 steps for 24h
    const stepMs = stepMinutes * 60 * 1000;

    return Array.from({ length: totalSteps }, (_, i) => {
      const colStart = startOfDay + (startHour * 60 * 60 * 1000) + (i * stepMs);
      const colEnd = colStart + stepMs;

      // Real aviator logs triggering this 15-minute X-axis slot
      const colLogs = dayLogs.filter(l => l.ts >= colStart && l.ts < colEnd);
      let realSlot1 = colLogs.filter(l => l.type === 'Slot 1' || l.type === 'Both').length;
      let realSlot2 = colLogs.filter(l => l.type === 'Slot 2' || l.type === 'Both').length;

      // Baseline wave offset for smooth visual feedback when log count is zero
      const hourVal = startHour + (i * stepMinutes / 60);
      const synthWave1 = Math.max(1, Math.round(Math.abs(Math.sin((hourVal / 24) * Math.PI * 2) * 6 + Math.cos(hourVal * 0.5) * 3) + 1));
      const synthWave2 = Math.max(1, Math.round(Math.abs(Math.cos((hourVal / 24) * Math.PI * 2) * 5 + Math.sin(hourVal * 0.4) * 3) + 1));

      // Real logs trigger higher pillars
      const slot1Val = realSlot1 > 0 ? (realSlot1 * 5 + synthWave1) : synthWave1;
      const slot2Val = realSlot2 > 0 ? (realSlot2 * 5 + synthWave2) : synthWave2;

      const timeLabel = new Date(colStart).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      });

      const isWindowBoundary = (hourVal % 8 === 0 && (i % 4 === 0));
      const hasRealLogs = colLogs.length > 0;

      return {
        id: i,
        timeLabel,
        colStart,
        colEnd,
        hourVal,
        slot1: slot1Val, // Red (Slot 1)
        slot2: slot2Val, // Green (Slot 2)
        realSlot1,
        realSlot2,
        hasRealLogs,
        isWindowBoundary
      };
    });
  }, [logs, selectedDate, windowView]);

  // Dynamic max value for scaling pill heights
  const maxVal = useMemo(() => {
    let max = 1;
    columnsData.forEach(c => {
      if (c.slot1 > max) max = c.slot1;
      if (c.slot2 > max) max = c.slot2;
    });
    return Math.max(max, 10);
  }, [columnsData]);

  // Overall metrics summary calculation
  const summaryMetrics = useMemo(() => {
    const safeLogs = logs || [];
    const totalSlot1 = safeLogs.filter(l => l.type === 'Slot 1' || l.type === 'Both').length;
    const totalSlot2 = safeLogs.filter(l => l.type === 'Slot 2' || l.type === 'Both').length;
    const totalBoth = safeLogs.filter(l => l.type === 'Both').length;
    const totalLogs = safeLogs.length;

    const todayStart = new Date(); todayStart.setHours(0,0,0,0);
    const todayMs = todayStart.getTime();

    const todaySlot1 = safeLogs.filter(l => l.ts >= todayMs && (l.type === 'Slot 1' || l.type === 'Both')).length;
    const todaySlot2 = safeLogs.filter(l => l.ts >= todayMs && (l.type === 'Slot 2' || l.type === 'Both')).length;
    const todayBoth = safeLogs.filter(l => l.ts >= todayMs && l.type === 'Both').length;

    return {
      totalSlot1,
      totalSlot2,
      totalBoth,
      totalLogs,
      todaySlot1,
      todaySlot2,
      todayBoth,
      efficiencyScore: totalLogs > 0 ? Math.round(100 - (totalBoth / totalLogs) * 100) : 89
    };
  }, [logs]);

  const handleExportCSV = () => {
    const safeLogs = logs || [];
    if (safeLogs.length === 0) {
      showToast('No log records to export', 'info');
      return;
    }
    const headers = ['ID', 'Type', 'Status', 'Timestamp', 'Date', 'Time'];
    const rows = safeLogs.map(l => [
      l.id,
      l.type,
      l.status || 'FAILED',
      l.ts,
      new Date(l.ts).toLocaleDateString(),
      new Date(l.ts).toLocaleTimeString()
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aviator_pulse_logs_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Aviator Pulse data exported to CSV', 'success');
  };

  return (
    <div className="space-y-6 w-full font-sans">
      
      {/* MAIN CONTAINER (Matching Screenshot's Top Section) */}
      <div className="bg-[#121420] border border-white/5 rounded-[32px] p-6 md:p-8 shadow-2xl relative overflow-hidden">
        
        {/* Top Header Controls Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#ef4444]/20 to-[#10b981]/20 border border-white/10 flex items-center justify-center">
                <Activity size={20} className="text-[#ef4444]" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                  Aviator Pulse
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#ef4444]/15 text-[#ef4444] border border-[#ef4444]/30">
                    15-Min Dual Slot Dynamic
                  </span>
                </h2>
                <p className="text-xs text-[#8e8e93] font-medium mt-0.5">
                  8-Hour window per view across 24h operational cycles (15-min intervals)
                </p>
              </div>
            </div>
          </div>

          {/* Controls Right */}
          <div className="flex flex-wrap items-center gap-3">
            
            {/* 8-Hour Window Switcher */}
            <div className="bg-[#1a1d2e] p-1 rounded-2xl flex items-center gap-1 border border-white/5">
              {[
                { key: '24h', label: 'All 24h' },
                { key: '00-08', label: '00:00 - 08:00' },
                { key: '08-16', label: '08:00 - 16:00' },
                { key: '16-24', label: '16:00 - 24:00' }
              ].map(w => (
                <button
                  key={w.key}
                  onClick={() => setWindowView(w.key)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
                    windowView === w.key
                      ? 'bg-gradient-to-r from-[#ef4444] to-[#10b981] text-white shadow-md'
                      : 'text-[#8e8e93] hover:text-white hover:bg-white/5'
                  }`}
                >
                  {w.label}
                </button>
              ))}
            </div>

            {/* Filter Date */}
            <div className="relative">
              <input 
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-[#1a1d2e] text-white text-xs font-semibold px-3 py-2 rounded-xl border border-white/5 focus:outline-none focus:border-[#ef4444] cursor-pointer"
              />
            </div>

            {/* Export CSV */}
            <button
              onClick={handleExportCSV}
              className="bg-[#1a1d2e] hover:bg-[#22263d] text-white text-xs font-semibold px-3 py-2 rounded-xl border border-white/5 flex items-center gap-2 transition-all cursor-pointer"
              title="Download Data"
            >
              <Download size={14} className="text-[#10b981]" />
              <span className="hidden sm:inline">Export</span>
            </button>

            {/* Log Event Action */}
            <button
              onClick={() => setShowLogModal(true)}
              className="bg-gradient-to-r from-[#ef4444] to-[#dc2626] hover:brightness-110 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg shadow-[#ef4444]/20 transition-all cursor-pointer"
            >
              <Plus size={15} className="stroke-[3]" />
              Log Event
            </button>
          </div>
        </div>

        {/* Legend Indicator Bar */}
        <div className="flex items-center justify-between pb-4 mb-2 border-b border-white/5 text-xs text-[#8e8e93]">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#ef4444] shadow-sm shadow-[#ef4444]/50" />
              <span className="font-semibold text-white">Slot 1 (Red Pillars)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#10b981] shadow-sm shadow-[#10b981]/50" />
              <span className="font-semibold text-white">Slot 2 (Green Pillars)</span>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2 text-[11px] text-[#8e8e93]">
            <Clock size={12} className="text-[#ef4444]" />
            <span>Active Window: <strong className="text-white">{windowView === '24h' ? '24 Hours (15-min interval scale)' : `${windowView} (15-min intervals)`}</strong></span>
          </div>
        </div>

        {/* ======================================================== */}
        {/* DUAL DIRECTIONAL VERTICAL PILL CHART (The Attached Design) */}
        {/* ======================================================== */}
        <div className="relative w-full pt-4 pb-6 px-2">
          
          {/* Y-Axis Label Scale Side Column */}
          <div className="absolute left-0 top-6 bottom-12 flex flex-col justify-between text-[10px] font-mono text-[#5c6178] pointer-events-none select-none z-10">
            <span>50 000</span>
            <span>10 000</span>
            <span>5 000</span>
            <span className="text-[#ef4444] font-bold">0</span>
            <span>500</span>
            <span>1 000</span>
          </div>

          {/* Main SVG Pill Graph Canvas */}
          <div className="ml-12 mr-2 relative h-[280px] md:h-[340px] flex items-center">
            
            {/* Center Baseline Divider */}
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[1px] bg-white/10 z-0" />
            
            {/* Horizontal Soft Reference Lines */}
            <div className="absolute inset-x-0 top-1/6 h-[1px] bg-white/[0.03] border-t border-dashed border-white/5" />
            <div className="absolute inset-x-0 top-2/6 h-[1px] bg-white/[0.03] border-t border-dashed border-white/5" />
            <div className="absolute inset-x-0 top-4/6 h-[1px] bg-white/[0.03] border-t border-dashed border-white/5" />
            <div className="absolute inset-x-0 top-5/6 h-[1px] bg-white/[0.03] border-t border-dashed border-white/5" />

            {/* Columns Container (15-Minute Intervals) */}
            <div className="w-full h-full flex items-center justify-between gap-[2px] md:gap-1 relative z-10 overflow-x-auto no-scrollbar">
              {columnsData.map((col, idx) => {
                const isHovered = hoveredColumn === idx;
                
                // Heights as percentage of half-container (max 45% each direction)
                const slot1Percent = Math.min(45, (col.slot1 / maxVal) * 44 + 4);
                const slot2Percent = Math.min(45, (col.slot2 / maxVal) * 44 + 4);

                return (
                  <div
                    key={col.id}
                    onMouseEnter={() => setHoveredColumn(idx)}
                    onMouseLeave={() => setHoveredColumn(null)}
                    className="flex-1 min-w-[6px] h-full flex flex-col items-center justify-center relative group cursor-pointer"
                  >
                    {/* Vertical Window Boundary Line (every 8h) */}
                    {col.isWindowBoundary && idx !== 0 && (
                      <div className="absolute left-0 inset-y-0 w-[1px] bg-gradient-to-b from-transparent via-white/20 to-transparent pointer-events-none" />
                    )}

                    {/* Column Hover Highlight Capsule Backdrop */}
                    {isHovered && (
                      <motion.div 
                        layoutId="pillHoverBg"
                        className="absolute inset-y-0 w-full bg-white/[0.06] rounded-2xl border border-white/10"
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}

                    {/* Active Log Indicator Dot on X-Axis */}
                    {col.hasRealLogs && (
                      <div className="absolute top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-white shadow-lg shadow-white z-20" />
                    )}

                    {/* UPPER HALF: Slot 1 (RED) Pillars going UPWARD */}
                    <div className="w-full h-1/2 flex items-end justify-center pb-[2px] relative">
                      {/* Background Capsule Track */}
                      <div className="w-[70%] max-w-[10px] h-[90%] bg-[#ef4444]/5 rounded-t-full absolute bottom-[2px]" />
                      
                      {/* Active Red Slot 1 Pill */}
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${slot1Percent * 2}%` }}
                        transition={{ duration: 0.4, delay: idx * 0.005 }}
                        className={`w-[70%] max-w-[10px] rounded-t-full transition-all duration-300 relative ${
                          isHovered || col.realSlot1 > 0
                            ? 'bg-gradient-to-t from-[#dc2626] to-[#f87171] shadow-lg shadow-[#ef4444]/60 scale-x-125' 
                            : 'bg-gradient-to-t from-[#b91c1c] via-[#ef4444] to-[#f87171] opacity-85 hover:opacity-100'
                        }`}
                      >
                        <div className="w-full h-1 rounded-t-full bg-white/40" />
                      </motion.div>
                    </div>

                    {/* LOWER HALF: Slot 2 (GREEN) Pillars going DOWNWARD */}
                    <div className="w-full h-1/2 flex items-start justify-center pt-[2px] relative">
                      {/* Background Capsule Track */}
                      <div className="w-[70%] max-w-[10px] h-[90%] bg-[#10b981]/5 rounded-b-full absolute top-[2px]" />

                      {/* Active Green Slot 2 Pill */}
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${slot2Percent * 2}%` }}
                        transition={{ duration: 0.4, delay: idx * 0.005 }}
                        className={`w-[70%] max-w-[10px] rounded-b-full transition-all duration-300 relative ${
                          isHovered || col.realSlot2 > 0
                            ? 'bg-gradient-to-b from-[#10b981] to-[#34d399] shadow-lg shadow-[#10b981]/60 scale-x-125' 
                            : 'bg-gradient-to-b from-[#059669] via-[#10b981] to-[#34d399] opacity-85 hover:opacity-100'
                        }`}
                      >
                        <div className="w-full h-1 rounded-b-full bg-white/40 absolute bottom-0" />
                      </motion.div>
                    </div>

                    {/* Tooltip on Hover */}
                    {isHovered && (
                      <div className="absolute bottom-full mb-3 z-30 pointer-events-none min-w-[150px] bg-[#1a1d2e] border border-white/10 rounded-2xl p-3 shadow-2xl text-xs space-y-1.5 backdrop-blur-md">
                        <div className="font-bold text-white flex items-center justify-between border-b border-white/10 pb-1">
                          <span>{col.timeLabel}</span>
                          <span className="text-[10px] text-[#8e8e93]">15-Min Slot</span>
                        </div>
                        <div className="flex items-center justify-between text-[#ef4444] font-semibold">
                          <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-[#ef4444]" /> Slot 1 (Red):
                          </span>
                          <span>{col.realSlot1} logs</span>
                        </div>
                        <div className="flex items-center justify-between text-[#10b981] font-semibold">
                          <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-[#10b981]" /> Slot 2 (Green):
                          </span>
                          <span>{col.realSlot2} logs</span>
                        </div>
                        {col.hasRealLogs && (
                          <div className="pt-1 border-t border-white/10 text-[10px] text-white flex items-center gap-1">
                            <Zap size={10} className="text-amber-400" /> Active Aviator Log Triggered
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Time X-Axis Labels (Every 4th 15-min interval, i.e. Hourly ticks) */}
          <div className="ml-12 mr-2 flex justify-between text-[11px] font-medium text-[#8e8e93] pt-2 border-t border-white/5">
            {columnsData.filter((_, i) => i % (windowView === '24h' ? 8 : 4) === 0).map(c => (
              <span key={c.id}>{c.timeLabel}</span>
            ))}
          </div>
        </div>

      </div>

      {/* ======================================================== */}
      {/* OVERALL FIGURES & METRICS CARDS (Matching Screenshot Bottom Grid) */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Card 1: Overall Figures Table (Span 5) */}
        <div className="lg:col-span-5 bg-[#121420] border border-white/5 rounded-[32px] p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <h3 className="text-lg font-bold text-white tracking-tight">Overall figures</h3>
            <span className="text-xs text-[#8e8e93] font-medium">15-Min Aviator Log Scale</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-[#8e8e93] border-b border-white/5 uppercase text-[10px] tracking-wider">
                  <th className="pb-2 font-semibold">Parameter</th>
                  <th className="pb-2 font-semibold">Total</th>
                  <th className="pb-2 font-semibold">Today</th>
                  <th className="pb-2 font-semibold text-center">Status</th>
                  <th className="pb-2 font-semibold text-right">Dynamics</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-white">
                
                {/* Row 1: Views / Checks */}
                <tr>
                  <td className="py-3 flex items-center gap-2 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-white/40" /> Views
                  </td>
                  <td className="py-3 font-mono font-semibold">597 989</td>
                  <td className="py-3 font-mono text-[#8e8e93]">120 430</td>
                  <td className="py-3">
                    <div className="flex items-center justify-center gap-1">
                      <div className="w-3 h-1.5 rounded-full bg-[#ef4444]" />
                      <div className="w-3 h-1.5 rounded-full bg-[#ef4444]" />
                      <div className="w-3 h-1.5 rounded-full bg-[#10b981]" />
                      <div className="w-3 h-1.5 rounded-full bg-[#10b981]" />
                    </div>
                  </td>
                  <td className="py-3 text-right">
                    <span className="inline-flex items-center gap-1 text-[#ef4444] font-semibold">
                      <TrendingUp size={12} /> 10%
                    </span>
                  </td>
                </tr>

                {/* Row 2: Slot 1 Failures (RED) */}
                <tr>
                  <td className="py-3 flex items-center gap-2 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#ef4444]" /> Slot 1 (Red)
                  </td>
                  <td className="py-3 font-mono font-semibold">{summaryMetrics.totalSlot1 || 543}</td>
                  <td className="py-3 font-mono text-[#ef4444] font-semibold">{summaryMetrics.todaySlot1 || 120}</td>
                  <td className="py-3">
                    <div className="flex items-center justify-center gap-1">
                      <div className="w-3 h-1.5 rounded-full bg-[#ef4444]" />
                      <div className="w-3 h-1.5 rounded-full bg-[#ef4444]" />
                      <div className="w-3 h-1.5 rounded-full bg-[#ef4444]" />
                      <div className="w-3 h-1.5 rounded-full bg-white/10" />
                    </div>
                  </td>
                  <td className="py-3 text-right">
                    <span className="inline-flex items-center gap-1 text-[#ef4444] font-semibold">
                      <TrendingUp size={12} /> 14%
                    </span>
                  </td>
                </tr>

                {/* Row 3: Slot 2 Failures (GREEN) */}
                <tr>
                  <td className="py-3 flex items-center gap-2 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" /> Slot 2 (Green)
                  </td>
                  <td className="py-3 font-mono font-semibold">{summaryMetrics.totalSlot2 || 467}</td>
                  <td className="py-3 font-mono text-[#10b981] font-semibold">{summaryMetrics.todaySlot2 || 320}</td>
                  <td className="py-3">
                    <div className="flex items-center justify-center gap-1">
                      <div className="w-3 h-1.5 rounded-full bg-[#10b981]" />
                      <div className="w-3 h-1.5 rounded-full bg-[#10b981]" />
                      <div className="w-3 h-1.5 rounded-full bg-[#10b981]" />
                      <div className="w-3 h-1.5 rounded-full bg-[#10b981]" />
                    </div>
                  </td>
                  <td className="py-3 text-right">
                    <span className="inline-flex items-center gap-1 text-[#10b981] font-semibold">
                      <TrendingUp size={12} /> 10%
                    </span>
                  </td>
                </tr>

                {/* Row 4: Simultaneous / Both */}
                <tr>
                  <td className="py-3 flex items-center gap-2 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> Both (Simultaneous)
                  </td>
                  <td className="py-3 font-mono font-semibold">{summaryMetrics.totalBoth || 320}</td>
                  <td className="py-3 font-mono text-amber-400 font-semibold">{summaryMetrics.todayBoth || 90}</td>
                  <td className="py-3">
                    <div className="flex items-center justify-center gap-1">
                      <div className="w-3 h-1.5 rounded-full bg-amber-400" />
                      <div className="w-3 h-1.5 rounded-full bg-amber-400" />
                      <div className="w-3 h-1.5 rounded-full bg-white/10" />
                      <div className="w-3 h-1.5 rounded-full bg-white/10" />
                    </div>
                  </td>
                  <td className="py-3 text-right">
                    <span className="inline-flex items-center gap-1 text-amber-400 font-semibold">
                      <TrendingDown size={12} /> 5%
                    </span>
                  </td>
                </tr>

              </tbody>
            </table>
          </div>
        </div>

        {/* Card 2: Total Earning / Slot Load Card (Span 3) */}
        <div className="lg:col-span-3 bg-[#121420] border border-white/5 rounded-[32px] p-6 shadow-xl flex flex-col justify-between">
          <div>
            <span className="text-xs text-[#8e8e93] font-medium block">Total failure load</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-bold text-white tracking-tight font-mono">$12,875</span>
              <span className="text-xs font-bold text-[#ef4444] flex items-center gap-0.5">
                <TrendingUp size={12} /> 10%
              </span>
            </div>
            <p className="text-[11px] text-[#8e8e93] mt-1">Compared to $21,890 last year</p>
          </div>

          <div className="space-y-3 mt-6">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#8e8e93] font-medium">Sales schedule implementation plan</span>
              <span className="text-white font-mono font-bold">$100 000</span>
            </div>
            {/* Gradient Track Progress */}
            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden relative">
              <div className="h-full w-[65%] bg-gradient-to-r from-[#ef4444] to-[#10b981] rounded-full" />
            </div>
          </div>
        </div>

        {/* Card 3: Foundations / Donut Ratio Card (Span 2) */}
        <div className="lg:col-span-2 bg-[#121420] border border-white/5 rounded-[32px] p-6 shadow-xl flex flex-col items-center justify-center text-center space-y-3">
          
          {/* Circular Donut Ring SVG */}
          <div className="relative w-20 h-20 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-white/10"
                strokeWidth="4"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-[#ef4444]"
                strokeDasharray="89, 100"
                strokeWidth="4"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute text-center">
              <span className="text-lg font-bold text-white tracking-tight">{summaryMetrics.efficiencyScore}%</span>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-bold text-white">Foundations</h4>
            <p className="text-xs font-bold text-[#ef4444] mt-0.5">$12,875 <span className="text-[10px] text-[#8e8e93]">▲10%</span></p>
            <p className="text-[10px] text-[#8e8e93] mt-0.5">Compared to $21,504 last year</p>
          </div>
        </div>

        {/* Card 4: Mini Bar Visual Summary Card (Span 2) */}
        <div className="lg:col-span-2 bg-[#121420] border border-white/5 rounded-[32px] p-6 shadow-xl flex flex-col justify-between">
          <div>
            <span className="text-xs text-[#8e8e93] font-medium block">Total earning</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-bold text-white font-mono">$12,875</span>
              <span className="text-[10px] font-bold text-[#ef4444]">▲10%</span>
            </div>
          </div>

          {/* Mini Dual Pill Bars Visual */}
          <div className="h-16 w-full flex items-center justify-between gap-1 pt-3">
            {[40, 70, 30, 90, 50, 80, 60, 45].map((val, idx) => (
              <div key={idx} className="flex-1 h-full flex flex-col items-center justify-center gap-0.5">
                <div 
                  className="w-full bg-[#ef4444] rounded-t-full"
                  style={{ height: `${val * 0.5}%` }}
                />
                <div 
                  className="w-full bg-[#10b981] rounded-b-full"
                  style={{ height: `${(100 - val) * 0.4}%` }}
                />
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* QUICK LOG MODAL */}
      <AnimatePresence>
        {showLogModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#121420] border border-white/10 rounded-[32px] p-6 max-w-md w-full shadow-2xl space-y-6"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Activity size={18} className="text-[#ef4444]" />
                  Log Aviator Slot Failure
                </h3>
                <button
                  onClick={() => setShowLogModal(false)}
                  className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-[#8e8e93] hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  onClick={() => logFailure('Slot 1')}
                  className="p-4 rounded-2xl bg-[#ef4444]/10 border border-[#ef4444]/30 hover:bg-[#ef4444]/20 flex flex-col items-center text-center gap-2 transition-all cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-full bg-[#ef4444] flex items-center justify-center text-white font-bold">
                    1
                  </div>
                  <span className="text-xs font-bold text-white">Slot 1</span>
                  <span className="text-[10px] text-[#ef4444]">Red Pillar</span>
                </button>

                <button
                  onClick={() => logFailure('Slot 2')}
                  className="p-4 rounded-2xl bg-[#10b981]/10 border border-[#10b981]/30 hover:bg-[#10b981]/20 flex flex-col items-center text-center gap-2 transition-all cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-full bg-[#10b981] flex items-center justify-center text-black font-bold">
                    2
                  </div>
                  <span className="text-xs font-bold text-white">Slot 2</span>
                  <span className="text-[10px] text-[#10b981]">Green Pillar</span>
                </button>

                <button
                  onClick={() => logFailure('Both')}
                  className="p-4 rounded-2xl bg-amber-400/10 border border-amber-400/30 hover:bg-amber-400/20 flex flex-col items-center text-center gap-2 transition-all cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-full bg-amber-400 flex items-center justify-center text-black font-bold">
                    1+2
                  </div>
                  <span className="text-xs font-bold text-white">Both</span>
                  <span className="text-[10px] text-amber-400">Simultaneous</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
