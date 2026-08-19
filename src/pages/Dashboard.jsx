import React, { useMemo, useState, useEffect } from 'react';
// AI Knowledge Integration Active
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Activity, 
  Ticket, 
  ShieldCheck,
  ArrowUpRight,
  Clock,
  ExternalLink,
  ChevronRight,
  Zap,
  Layout,
  Database,
  Cloud,
  Calendar,
  MessageSquare,
  Calculator,
  TrendingUp,
  Radio,
  Plane,
  ClipboardList,
  Receipt
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
// Migration to Supabase complete
import { 
  generateMonthSchedule, 
  getCurrentShiftType,
  STAFF_COLORS 
} from '../utils/Rota/scheduleGenerator';
import { isSameDay, subDays } from 'date-fns';
import { useSupabaseData } from '../context/SupabaseDataContext';

/* ─────────────────────────────────────────
   AVIATOR ACTIVITY — Multi-View Interactive Visualizer
   Views:
   1. pills: Dual Uptime Tracks (Slot 1 & Slot 2)
   2. pulse: Dual ECG Heartbeat Pulse Line
   3. gauges: Live Status Gauges & Incident Clock
   4. heatmap: 24-Hour Dual Heatmap Grid
   5. bars: Grouped Hourly Incident Bars
───────────────────────────────────────── */
const AviatorPulseCard = ({ logs }) => {
  const [activeVisual, setActiveVisual] = useState('pills'); // 'pills' | 'pulse' | 'gauges' | 'heatmap' | 'bars'
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 10000);
    return () => clearInterval(timer);
  }, []);

  // Stats calculation
  const hourLogs = useMemo(() => logs.filter(l => l.ts > now - 3600000), [logs, now]);
  const slot1HourLogs = useMemo(() => hourLogs.filter(l => l.type === 'Slot 1' || l.type === 'Both'), [hourLogs]);
  const slot2HourLogs = useMemo(() => hourLogs.filter(l => l.type === 'Slot 2' || l.type === 'Both'), [hourLogs]);

  // Last failure times
  const lastLogSlot1 = useMemo(() => {
    const s1 = logs.filter(l => l.type === 'Slot 1' || l.type === 'Both');
    return s1.length > 0 ? Math.max(...s1.map(l => l.ts)) : null;
  }, [logs]);

  const lastLogSlot2 = useMemo(() => {
    const s2 = logs.filter(l => l.type === 'Slot 2' || l.type === 'Both');
    return s2.length > 0 ? Math.max(...s2.map(l => l.ts)) : null;
  }, [logs]);

  const formatUptime = (lastTs) => {
    if (!lastTs) return 'No incidents recorded';
    const diff = Math.max(0, now - lastTs);
    const mins = Math.floor(diff / 60000);
    const hrs = Math.floor(mins / 60);
    const remMins = mins % 60;
    if (hrs > 24) return `${Math.floor(hrs / 24)}d ${hrs % 24}h uptime`;
    if (hrs > 0) return `${hrs}h ${remMins}m uptime`;
    return `${mins}m uptime`;
  };

  // 1. Dual Pill Uptime Blocks (Last 24 30-min intervals)
  const pillData = useMemo(() => {
    const intervals = [];
    const intervalMs = 30 * 60 * 1000;
    for (let i = 23; i >= 0; i--) {
      const end = now - i * intervalMs;
      const start = end - intervalMs;
      const slot1Count = logs.filter(l => l.ts >= start && l.ts < end && (l.type === 'Slot 1' || l.type === 'Both')).length;
      const slot2Count = logs.filter(l => l.ts >= start && l.ts < end && (l.type === 'Slot 2' || l.type === 'Both')).length;
      const timeLabel = new Date(end).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
      intervals.push({
        id: i,
        time: timeLabel,
        slot1Count,
        slot2Count,
        slot1Healthy: slot1Count === 0,
        slot2Healthy: slot2Count === 0
      });
    }
    return intervals;
  }, [logs, now]);

  // 2. Pulse ECG waveform (Continuous 100-point stream)
  const ecgData = useMemo(() => {
    const points = [];
    const windowMs = 12 * 60 * 60 * 1000; // 12 hours
    const step = windowMs / 24;
    for (let i = 23; i >= 0; i--) {
      const t = now - i * step;
      const s1 = logs.filter(l => l.ts >= t - step && l.ts < t && (l.type === 'Slot 1' || l.type === 'Both')).length;
      const s2 = logs.filter(l => l.ts >= t - step && l.ts < t && (l.type === 'Slot 2' || l.type === 'Both')).length;
      points.push({
        time: new Date(t).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
        slot1Health: s1 > 0 ? Math.max(10, 100 - s1 * 35) : 100,
        slot2Health: s2 > 0 ? Math.max(10, 100 - s2 * 35) : 100,
        slot1Fails: s1,
        slot2Fails: s2
      });
    }
    return points;
  }, [logs, now]);

  // 3. 24-Hour Dual Heatmap (24 hours: 0 to 23)
  const heatmapData = useMemo(() => {
    const currentHour = new Date(now).getHours();
    const hours = [];
    for (let i = 23; i >= 0; i--) {
      const h = (currentHour - i + 24) % 24;
      const targetDate = new Date(now - i * 3600000);
      const s1 = logs.filter(l => {
        const d = new Date(l.ts);
        return d.getHours() === h && isSameDay(d, targetDate) && (l.type === 'Slot 1' || l.type === 'Both');
      }).length;
      const s2 = logs.filter(l => {
        const d = new Date(l.ts);
        return d.getHours() === h && isSameDay(d, targetDate) && (l.type === 'Slot 2' || l.type === 'Both');
      }).length;

      const hourLabel = targetDate.toLocaleTimeString([], { hour: 'numeric', hour12: true });
      hours.push({
        hour: hourLabel,
        slot1: s1,
        slot2: s2
      });
    }
    return hours;
  }, [logs, now]);

  // 4. Grouped Hourly Bars (Last 12 hours)
  const barData = useMemo(() => {
    const bars = [];
    for (let i = 11; i >= 0; i--) {
      const tEnd = now - i * 3600000;
      const tStart = tEnd - 3600000;
      const s1 = logs.filter(l => l.ts >= tStart && l.ts < tEnd && (l.type === 'Slot 1' || l.type === 'Both')).length;
      const s2 = logs.filter(l => l.ts >= tStart && l.ts < tEnd && (l.type === 'Slot 2' || l.type === 'Both')).length;
      bars.push({
        name: new Date(tEnd).toLocaleTimeString([], { hour: 'numeric', hour12: true }),
        Slot1: s1,
        Slot2: s2
      });
    }
    return bars;
  }, [logs, now]);

  const visuals = [
    { id: 'pills', label: 'Uptime Tracks' },
    { id: 'pulse', label: 'ECG Health' },
    { id: 'gauges', label: 'Status & Clocks' },
    { id: 'heatmap', label: '24h Matrix' },
    { id: 'bars', label: 'Incident Bars' }
  ];

  return (
    <div className="bg-[#131520] rounded-[28px] p-6 md:p-8 shadow-2xl space-y-6 relative overflow-hidden">
      
      {/* Top Header Row with Visual Switcher Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#1b1e2b] flex items-center justify-center text-[#baff55]">
            <Activity size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Aviator Slot Health</h2>
            <p className="text-xs text-[#8e8e93]">Real-time continuous slot uptime vs failure logs</p>
          </div>
        </div>

        {/* Visual View Switcher Tabs (Replaces Nominal Tag) */}
        <div className="flex items-center bg-[#0d0e15] p-1 rounded-2xl overflow-x-auto no-scrollbar self-start md:self-auto border border-white/5">
          {visuals.map(v => (
            <button
              key={v.id}
              onClick={() => setActiveVisual(v.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeVisual === v.id
                  ? 'bg-[#baff55] text-black shadow-md font-bold'
                  : 'text-[#8e8e93] hover:text-white bg-transparent'
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── VISUAL 1: DUAL UPTIME PILLS (Datadog / GitHub Uptime Style) ── */}
      {activeVisual === 'pills' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Slot 1 Track */}
          <div className="bg-[#0e1017] p-5 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]" />
                <span className="text-sm font-bold text-white">Slot 1</span>
                <span className="text-xs text-[#8e8e93]">({slot1HourLogs.length} fails this hour)</span>
              </div>
              <span className="text-xs font-mono font-semibold text-[#10b981]">
                {formatUptime(lastLogSlot1)}
              </span>
            </div>

            {/* Pill Bar */}
            <div className="grid grid-cols-24 gap-1 sm:gap-1.5 h-7">
              {pillData.map((p) => (
                <div
                  key={`s1-${p.id}`}
                  title={`${p.time}: ${p.slot1Healthy ? 'Running smoothly' : `${p.slot1Count} failure(s)`}`}
                  className={`rounded-md transition-all cursor-pointer hover:scale-110 ${
                    p.slot1Healthy 
                      ? 'bg-[#10b981]/25 hover:bg-[#10b981]' 
                      : 'bg-[#ff4d4d] shadow-[0_0_8px_rgba(255,77,77,0.6)]'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Slot 2 Track */}
          <div className="bg-[#0e1017] p-5 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#3b82f6]" />
                <span className="text-sm font-bold text-white">Slot 2</span>
                <span className="text-xs text-[#8e8e93]">({slot2HourLogs.length} fails this hour)</span>
              </div>
              <span className="text-xs font-mono font-semibold text-sky-400">
                {formatUptime(lastLogSlot2)}
              </span>
            </div>

            {/* Pill Bar */}
            <div className="grid grid-cols-24 gap-1 sm:gap-1.5 h-7">
              {pillData.map((p) => (
                <div
                  key={`s2-${p.id}`}
                  title={`${p.time}: ${p.slot2Healthy ? 'Running smoothly' : `${p.slot2Count} failure(s)`}`}
                  className={`rounded-md transition-all cursor-pointer hover:scale-110 ${
                    p.slot2Healthy 
                      ? 'bg-[#3b82f6]/25 hover:bg-[#3b82f6]' 
                      : 'bg-[#ff4d4d] shadow-[0_0_8px_rgba(255,77,77,0.6)]'
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-[#8e8e93] px-1">
            <span>12 hours ago</span>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#10b981]/30" /> Running
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#ff4d4d]" /> Logged Failure
              </span>
            </div>
            <span>Now</span>
          </div>
        </div>
      )}

      {/* ── VISUAL 2: DUAL ECG HEARTBEAT PULSE ── */}
      {activeVisual === 'pulse' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs text-[#8e8e93]">Continuous running = 100% flatline. Failure logs trigger downward health drops.</span>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5 text-[#10b981] font-semibold">
                <span className="w-2 h-2 rounded-full bg-[#10b981]" /> Slot 1 Health
              </span>
              <span className="flex items-center gap-1.5 text-sky-400 font-semibold">
                <span className="w-2 h-2 rounded-full bg-[#3b82f6]" /> Slot 2 Health
              </span>
            </div>
          </div>

          <div className="h-[230px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={ecgData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="s1Grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="s2Grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="time" stroke="transparent" fontSize={10} tick={{ fill: '#8e8e93' }} dy={10} />
                <YAxis domain={[0, 100]} stroke="transparent" fontSize={10} tick={{ fill: '#8e8e93' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#131520', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }}
                  formatter={(val, name) => [`${val}% Health`, name === 'slot1Health' ? 'Slot 1' : 'Slot 2']}
                />
                <Area type="monotone" dataKey="slot1Health" stroke="#10b981" fill="url(#s1Grad)" strokeWidth={2.5} />
                <Area type="monotone" dataKey="slot2Health" stroke="#3b82f6" fill="url(#s2Grad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ── VISUAL 3: LIVE STATUS GAUGES & INCIDENT CLOCKS ── */}
      {activeVisual === 'gauges' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-in fade-in duration-200">
          {/* Slot 1 Gauge Card */}
          <div className="bg-[#0e1017] rounded-2xl p-6 space-y-4 border border-white/5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-[#8e8e93] block">Channel</span>
                <h3 className="text-xl font-bold text-white">Slot 1</h3>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                slot1HourLogs.length === 0 ? 'bg-[#10b981]/15 text-[#10b981]' : 'bg-[#ff4d4d]/15 text-[#ff4d4d]'
              }`}>
                {slot1HourLogs.length === 0 ? 'Running Smoothly' : 'Incidents Logged'}
              </span>
            </div>

            <div className="bg-[#131520] p-4 rounded-xl space-y-1">
              <span className="text-[11px] text-[#8e8e93] block">Time Since Last Incident</span>
              <span className="text-2xl font-black font-mono text-[#10b981]">
                {formatUptime(lastLogSlot1)}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-[#131520] p-3 rounded-xl">
                <span className="text-[#8e8e93] block mb-1">Last Hour Fails</span>
                <span className="text-lg font-bold font-mono text-white">{slot1HourLogs.length}</span>
              </div>
              <div className="bg-[#131520] p-3 rounded-xl">
                <span className="text-[#8e8e93] block mb-1">Total Logs (All-Time)</span>
                <span className="text-lg font-bold font-mono text-white">
                  {logs.filter(l => l.type === 'Slot 1' || l.type === 'Both').length}
                </span>
              </div>
            </div>
          </div>

          {/* Slot 2 Gauge Card */}
          <div className="bg-[#0e1017] rounded-2xl p-6 space-y-4 border border-white/5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-[#8e8e93] block">Channel</span>
                <h3 className="text-xl font-bold text-white">Slot 2</h3>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                slot2HourLogs.length === 0 ? 'bg-[#3b82f6]/15 text-sky-400' : 'bg-[#ff4d4d]/15 text-[#ff4d4d]'
              }`}>
                {slot2HourLogs.length === 0 ? 'Running Smoothly' : 'Incidents Logged'}
              </span>
            </div>

            <div className="bg-[#131520] p-4 rounded-xl space-y-1">
              <span className="text-[11px] text-[#8e8e93] block">Time Since Last Incident</span>
              <span className="text-2xl font-black font-mono text-sky-400">
                {formatUptime(lastLogSlot2)}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-[#131520] p-3 rounded-xl">
                <span className="text-[#8e8e93] block mb-1">Last Hour Fails</span>
                <span className="text-lg font-bold font-mono text-white">{slot2HourLogs.length}</span>
              </div>
              <div className="bg-[#131520] p-3 rounded-xl">
                <span className="text-[#8e8e93] block mb-1">Total Logs (All-Time)</span>
                <span className="text-lg font-bold font-mono text-white">
                  {logs.filter(l => l.type === 'Slot 2' || l.type === 'Both').length}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── VISUAL 4: 24-HOUR DUAL HEATMAP MATRIX ── */}
      {activeVisual === 'heatmap' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          <div className="bg-[#0e1017] p-5 rounded-2xl space-y-4">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-white">24-Hour Failure Density Matrix</span>
              <span className="text-[#8e8e93]">Dark = 0 fails (Good) · Colored = Failures</span>
            </div>

            {/* Heatmap Rows */}
            <div className="space-y-3">
              {/* Row 1: Slot 1 */}
              <div>
                <span className="text-[11px] font-semibold text-[#10b981] mb-1.5 block">Slot 1</span>
                <div className="grid grid-cols-12 sm:grid-cols-24 gap-1.5">
                  {heatmapData.map((h, i) => (
                    <div
                      key={`hm-s1-${i}`}
                      title={`${h.hour}: ${h.slot1} fails`}
                      className={`h-9 rounded-lg flex items-center justify-center text-[10px] font-mono font-bold transition-transform hover:scale-110 cursor-pointer ${
                        h.slot1 === 0
                          ? 'bg-[#181b28] text-gray-600'
                          : h.slot1 === 1
                          ? 'bg-amber-500/40 text-amber-200 border border-amber-500/50'
                          : 'bg-[#ff4d4d] text-white shadow-[0_0_10px_rgba(255,77,77,0.5)]'
                      }`}
                    >
                      {h.slot1 > 0 ? h.slot1 : ''}
                    </div>
                  ))}
                </div>
              </div>

              {/* Row 2: Slot 2 */}
              <div>
                <span className="text-[11px] font-semibold text-sky-400 mb-1.5 block">Slot 2</span>
                <div className="grid grid-cols-12 sm:grid-cols-24 gap-1.5">
                  {heatmapData.map((h, i) => (
                    <div
                      key={`hm-s2-${i}`}
                      title={`${h.hour}: ${h.slot2} fails`}
                      className={`h-9 rounded-lg flex items-center justify-center text-[10px] font-mono font-bold transition-transform hover:scale-110 cursor-pointer ${
                        h.slot2 === 0
                          ? 'bg-[#181b28] text-gray-600'
                          : h.slot2 === 1
                          ? 'bg-amber-500/40 text-amber-200 border border-amber-500/50'
                          : 'bg-[#ff4d4d] text-white shadow-[0_0_10px_rgba(255,77,77,0.5)]'
                      }`}
                    >
                      {h.slot2 > 0 ? h.slot2 : ''}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── VISUAL 5: GROUPED INCIDENT BARS ── */}
      {activeVisual === 'bars' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between px-1 text-xs">
            <span className="text-[#8e8e93]">Failure volume per hour comparison</span>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 text-[#10b981] font-semibold">
                <span className="w-2.5 h-2.5 rounded bg-[#10b981]" /> Slot 1
              </span>
              <span className="flex items-center gap-1.5 text-sky-400 font-semibold">
                <span className="w-2.5 h-2.5 rounded bg-[#3b82f6]" /> Slot 2
              </span>
            </div>
          </div>

          <div className="h-[230px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="name" stroke="transparent" fontSize={10} tick={{ fill: '#8e8e93' }} dy={10} />
                <YAxis stroke="transparent" fontSize={10} tick={{ fill: '#8e8e93' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#131520', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }}
                />
                <Area type="stepAfter" dataKey="Slot1" stroke="#10b981" fill="#10b981" fillOpacity={0.2} strokeWidth={2} />
                <Area type="stepAfter" dataKey="Slot2" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

    </div>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { logs, overrides: rawOverrides, loading } = useSupabaseData();
  
  const overrides = useMemo(() => {
    if (!rawOverrides) return {};
    const mapped = {};
    const items = Array.isArray(rawOverrides) ? rawOverrides : Object.values(rawOverrides);
    items.forEach(item => {
      const key = item.date || item.id;
      if (key && !key.startsWith('sofasafi_') && key !== 'config_transport') {
        mapped[key] = item.shifts || item;
      }
    });
    return mapped;
  }, [rawOverrides]);

  const onDutyInfo = useMemo(() => {
    const today = new Date();
    const currentShift = getCurrentShiftType();
    const hour = today.getHours();
    const minutes = today.getMinutes();
    const timeValue = hour + minutes / 60;
    const isNTRollover = timeValue < 7.5;

    const schedule = generateMonthSchedule(today.getFullYear(), today.getMonth(), overrides);
    const todaySchedule = schedule.find(d => isSameDay(d.date, today));

    let displayNT = todaySchedule?.shifts.NT || [];
    if (isNTRollover) {
      const yesterday = subDays(today, 1);
      const yesterdayScheduleArray = generateMonthSchedule(yesterday.getFullYear(), yesterday.getMonth(), overrides);
      const yesterdaySchedule = yesterdayScheduleArray.find(d => isSameDay(d.date, yesterday));
      displayNT = yesterdaySchedule?.shifts.NT || [];
    }

    return {
      AM: todaySchedule?.shifts.AM || [],
      PM: todaySchedule?.shifts.PM || [],
      NT: displayNT,
      current: currentShift
    };
  }, [overrides]);

  const chartData = useMemo(() => {
    const now = Date.now();
    const day = 24 * 60 * 60 * 1000;
    return Array.from({ length: 14 }, (_, i) => {
      const time = now - (13 - i) * (day / 14);
      const count = logs.filter(l => l.ts > time - (day / 14) && l.ts <= time).length;
      return {
        name: new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        logs: count,
        // Visual baseline to keep the graph "alive"
        baseline: Math.sin(i * 0.5) * 2 + 5
      };
    });
  }, [logs]);

  const shortcuts = [
    { 
      name: "Hourly Counter", 
      desc: "Live transaction counting & shift reports", 
      icon: Clock, 
      path: "/counter", 
      color: "#00D66B",
      accentBg: "rgba(0, 214, 107, 0.12)",
      tag: "Live Sync"
    },
    { 
      name: "SMS Ledger", 
      desc: "Parse, search & verify MPESA transactions", 
      icon: Receipt, 
      path: "/sms-ledger", 
      color: "#3ED3F2",
      accentBg: "rgba(62, 211, 242, 0.12)",
      tag: "Database"
    },
    { 
      name: "Cashback Calculator", 
      desc: "24h cycle net loss calculation", 
      icon: Calculator, 
      path: "/tools", 
      color: "#10b981",
      accentBg: "rgba(16, 185, 129, 0.12)",
      tag: "8:30 PM Cycle"
    },
    { 
      name: "Response Templates", 
      desc: "Instant customer reply macros", 
      icon: MessageSquare, 
      path: "/templates", 
      color: "#60a5fa",
      accentBg: "rgba(96, 165, 250, 0.12)",
      tag: "Quick Copy"
    },
    { 
      name: "Aviator Tracker", 
      desc: "Slot 1 & Slot 2 failure log", 
      icon: Activity, 
      path: "/slots", 
      color: "#ff4d4d",
      accentBg: "rgba(255, 77, 77, 0.12)",
      tag: "Incident Log"
    },
    { 
      name: "Agent Manual", 
      desc: "Operational guidelines & escalation", 
      icon: ShieldCheck, 
      path: "/resources", 
      params: "?section=manual", 
      color: "#ff7a59",
      accentBg: "rgba(255, 122, 89, 0.12)",
      tag: "Guidelines"
    },
    { 
      name: "Market Guide", 
      desc: "Sports markets & betting rules", 
      icon: FileText, 
      path: "/resources", 
      params: "?section=guide", 
      color: "#8b5cf6",
      accentBg: "rgba(139, 92, 246, 0.12)",
      tag: "Reference"
    },
  ];

  return (
    <div className="p-4 md:p-8 space-y-8 w-full max-w-[1600px] mx-auto min-h-screen bg-[#0A0A0D] text-[#F4F5F1] font-sans">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2">
        <div>
          <h1 className="font-['Space_Grotesk'] text-3xl md:text-4xl font-semibold tracking-tight text-[#F4F5F1]">
            Overview
          </h1>
          <p className="text-sm text-[#8B8E97] mt-1">Falme Staff Portal & Operations</p>
        </div>
        
        <div className="flex items-center gap-3">
           <div className="flex flex-col items-end">
             <span className="text-[11px] font-mono text-[#54565F] mb-0.5">Current Shift</span>
             <span className="text-xs font-semibold text-[#F4F5F1] bg-[#1B1C22] border border-white/[0.07] px-3.5 py-1.5 rounded-full">{onDutyInfo.current} Shift</span>
           </div>
           <div className="bg-[#1B1C22] border border-white/[0.07] rounded-full flex items-center gap-2.5 px-4 py-2">
              <Clock size={14} className="text-[#00D66B]" />
              <span className="text-xs font-mono font-semibold text-[#F4F5F1]">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Main Section */}
        <div className="lg:col-span-8 space-y-6">
          
          <AviatorPulseCard logs={logs} chartData={chartData} />

          {/* Quick Access Grid — Premium Card Design */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-semibold text-[#8B8E97] uppercase tracking-wider">Quick Actions &amp; Workflows</h2>
              <span className="text-xs font-mono text-[#54565F]">6 direct modules</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {shortcuts.map(res => {
                const Icon = res.icon;
                return (
                  <button 
                    key={res.name} 
                    onClick={() => navigate(res.path + (res.params || ''))}
                    className="bg-[#1B1C22] hover:bg-[#232429] border border-white/[0.07] hover:border-white/[0.14] rounded-[22px] p-5 transition-all duration-200 group relative flex flex-col justify-between text-left shadow-lg hover:shadow-2xl hover:-translate-y-0.5 active:translate-y-0 cursor-pointer min-h-[140px]"
                  >
                    {/* Top Row: Icon + Badge + Arrow */}
                    <div className="flex items-center justify-between w-full mb-3">
                      <div 
                        className="w-10 h-10 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105 bg-[#0E0E12] border border-white/[0.05]"
                      >
                        <Icon size={18} style={{ color: res.color }} />
                      </div>

                      <div className="flex items-center gap-2">
                        <span 
                          className="text-[10px] font-medium font-mono px-2.5 py-0.5 rounded-full"
                          style={{ 
                            background: `${res.color}15`, 
                            color: res.color 
                          }}
                        >
                          {res.tag}
                        </span>
                        <div className="w-6 h-6 rounded-full bg-white/5 group-hover:bg-white/10 flex items-center justify-center text-[#8B8E97] group-hover:text-white transition-colors">
                          <ArrowUpRight size={13} />
                        </div>
                      </div>
                    </div>

                    {/* Bottom Row: Name + Description */}
                    <div>
                      <h3 className="text-sm font-semibold text-[#F4F5F1] group-hover:text-[#00D66B] transition-colors leading-snug">
                        {res.name}
                      </h3>
                      <p className="text-xs text-[#8B8E97] mt-1 leading-normal line-clamp-1">
                        {res.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Side Deployment Column */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Shift Rota Card */}
          <div className="bg-[#1B1C22] border border-white/[0.07] rounded-[28px] p-6 md:p-7 flex flex-col relative group cursor-pointer shadow-xl" onClick={() => navigate('/rota')}>
            <div className="absolute top-5 right-5 w-8 h-8 bg-[#232429] border border-white/[0.07] rounded-full flex items-center justify-center transition-all group-hover:bg-[#00D66B] group-hover:text-black">
              <ArrowUpRight size={14} className="text-[#8B8E97] group-hover:text-black transition-colors" />
            </div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-['Space_Grotesk'] text-lg font-semibold text-[#F4F5F1]">Staff on Duty</h3>
                <p className="text-xs text-[#8B8E97] mt-0.5">Today's active shifts</p>
              </div>
            </div>

            <div className="space-y-3 flex-1">
              {[
                { id: 'AM', label: 'Morning', time: '07:30 - 15:30', names: onDutyInfo.AM, color: '#3ED3F2' },
                { id: 'PM', label: 'Afternoon', time: '15:30 - 22:30', names: onDutyInfo.PM, color: '#00D66B' },
                { id: 'NT', label: 'Night', time: '22:30 - 07:30', names: onDutyInfo.NT, color: '#F2E75A' },
              ].map(shift => {
                const isCurrent = onDutyInfo.current === shift.id;
                
                return (
                  <div 
                    key={shift.id} 
                    className={`relative p-4 rounded-[18px] transition-all border ${
                      isCurrent 
                        ? 'bg-[#0E0E12] border-[#00D66B]/30 shadow-md' 
                        : 'bg-[#0E0E12]/60 border-white/[0.04] opacity-60'
                    }`}
                  >
                    {isCurrent && (
                      <div className="absolute top-3.5 right-4 flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#00D66B] animate-pulse" />
                        <span className="text-[11px] font-medium text-[#00D66B]">Active</span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-[#1B1C22] border border-white/[0.05]">
                        <Clock size={14} style={{ color: shift.color }} />
                      </div>
                      <div>
                        <span className="block text-xs font-semibold text-[#F4F5F1]">{shift.label}</span>
                        <span className="text-[11px] font-mono text-[#54565F] block">{shift.time}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {shift.names.map(name => (
                        <div key={name} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#1B1C22] border border-white/[0.05]">
                           <div className="w-2 h-2 rounded-full" style={{ backgroundColor: STAFF_COLORS[name] || '#54565F' }} />
                           <span className="text-[11px] font-medium text-[#F4F5F1]">{name}</span>
                        </div>
                      ))}
                      {shift.names.length === 0 && <span className="text-xs text-[#54565F] italic">No Deployment</span>}
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="mt-6 pt-4 border-t border-white/[0.05]">
              <button 
                onClick={(e) => { e.stopPropagation(); navigate('/templates'); }}
                className="w-full bg-[#232429] hover:bg-white/10 border border-white/[0.07] text-[#F4F5F1] font-medium py-2.5 px-5 rounded-full flex items-center justify-center gap-2 text-xs transition-all cursor-pointer"
              >
                <span>Open Templates</span>
                <ArrowUpRight size={13} />
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
