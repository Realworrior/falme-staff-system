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
  Plane
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
   AVIATOR STATUS
───────────────────────────────────────── */
const AviatorStatusCard = ({ logs, chartData }) => {
  const [prevCount, setPrevCount] = useState(0);

  const hourCount = useMemo(() => logs.filter(l => l.ts > Date.now() - 3600000).length, [logs]);

  const trending = hourCount >= prevCount;

  useEffect(() => {
    setPrevCount(hourCount);
  }, [hourCount]);

  const statusColor = hourCount > 10 ? '#ff4d4d' : hourCount > 4 ? '#ffa64d' : '#baff55';

  return (
    <div
      style={{
        background: 'linear-gradient(145deg, #131520 0%, #0f111a 100%)',
        borderRadius: 28,
        padding: '0',
        overflow: 'hidden',
        boxShadow: `0 30px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.05)`,
        position: 'relative',
      }}
    >
      {/* Ambient glow backdrop */}
      <div style={{
        position: 'absolute', top: -60, right: -40,
        width: 300, height: 300, borderRadius: '50%',
        background: `radial-gradient(circle, ${statusColor}18 0%, transparent 70%)`,
        pointerEvents: 'none', transition: 'background 1s ease',
      }} />



      {/* Main content */}
      <div style={{ padding: '24px 28px 0' }}>

        {/* Title row */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            {/* Animated plane icon */}
            <div style={{
              width: 44, height: 44, borderRadius: 16,
              background: `linear-gradient(135deg, ${statusColor}25, ${statusColor}10)`,
              border: `1px solid ${statusColor}30`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              position: 'relative', flexShrink: 0,
            }}>
              <Plane size={20} color={statusColor} style={{ transform: 'rotate(-45deg)' }} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: '#fff', letterSpacing: '-0.01em' }}>
                Aviator Status
              </h3>
              <p style={{ margin: '3px 0 0', fontSize: 12, color: '#8e8e93', fontWeight: 500 }}>
                Real-time Global Failure Index
              </p>
            </div>
          </div>

          {/* Frequency big number */}
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: 11, color: '#8e8e93', fontWeight: 600, letterSpacing: '0.05em', display: 'block', marginBottom: 4 }}>FREQ / HR</span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, justifyContent: 'flex-end' }}>
              <span style={{
                fontSize: 38, fontWeight: 800, lineHeight: 1,
                color: statusColor,
                textShadow: `0 0 20px ${statusColor}60`,
                fontVariantNumeric: 'tabular-nums',
                letterSpacing: '-0.02em',
              }}>
                {hourCount}
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                {trending ? (
                  <TrendingUp size={14} color="#baff55" />
                ) : (
                  <TrendingDown size={14} color="#ff4d4d" />
                )}
                <span style={{ fontSize: 10, color: '#8e8e93', fontWeight: 600 }}>{trending ? 'UP' : 'DN'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div style={{ height: 220, width: '100%', marginLeft: -8 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 8, right: 4, left: -24, bottom: 0 }}>
              <defs>
                <linearGradient id="pulseGradMain" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={statusColor} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={statusColor} stopOpacity={0.0} />
                </linearGradient>
                <filter id="pulseGlow">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <CartesianGrid strokeDasharray="2 6" vertical={false} stroke="rgba(255,255,255,0.035)" />
              <XAxis
                dataKey="name"
                stroke="transparent"
                fontSize={10}
                fontWeight={600}
                tick={{ fill: '#8e8e93' }}
                axisLine={false}
                tickLine={false}
                dy={10}
                interval={2}
              />
              <Tooltip
                cursor={{ stroke: `${statusColor}40`, strokeWidth: 1, strokeDasharray: '4 4' }}
                contentStyle={{
                  backgroundColor: '#1a1d2b',
                  border: `1px solid ${statusColor}30`,
                  borderRadius: 14,
                  padding: '10px 14px',
                  boxShadow: `0 12px 40px rgba(0,0,0,0.6), 0 0 20px ${statusColor}10`,
                }}
                itemStyle={{ fontSize: 12, fontWeight: 700, color: statusColor }}
                labelStyle={{ fontSize: 10, color: '#8e8e93', marginBottom: 4, fontWeight: 600, letterSpacing: '0.05em' }}
              />
              {/* Baseline ghost line */}
              <Area
                type="monotone"
                dataKey="baseline"
                stroke="rgba(255,255,255,0.06)"
                fill="transparent"
                strokeWidth={1}
                strokeDasharray="4 4"
                dot={false}
                isAnimationActive={false}
              />
              {/* Main data area */}
              <Area
                type="monotone"
                dataKey="logs"
                stroke={statusColor}
                fill="url(#pulseGradMain)"
                strokeWidth={2.5}
                dot={false}
                activeDot={{
                  r: 5,
                  fill: statusColor,
                  stroke: '#0f111a',
                  strokeWidth: 2,
                  style: { filter: `drop-shadow(0 0 6px ${statusColor})` }
                }}
                animationDuration={800}
                animationEasing="ease-out"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>



      {/* CSS keyframes via style tag */}
      <style>{`
        @keyframes aviator-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
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
    { name: "Cashback", icon: Calculator, path: "/tools", color: "#10b981" },
    { name: "Odds Converter", icon: Zap, path: "/tools", params: "?tab=odds", color: "#3b82f6" },
    { name: "Agent Manual", icon: ShieldCheck, path: "/resources", params: "?section=manual", color: "#ff7a59" },
    { name: "Market Guide", icon: FileText, path: "/resources", params: "?section=guide", color: "#8b5cf6" },
    { name: "Templates", icon: MessageSquare, path: "/templates", color: "#60a5fa" },
    { name: "Aviator Slots", icon: Activity, path: "/slots", color: "#ef4444" },
  ];

  return (
    <div className="p-4 md:p-8 space-y-8 w-full max-w-[1600px] mx-auto min-h-screen bg-[#0e1017]">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
            Operational Overview
          </h1>
        
        </div>
        
        <div className="flex items-center gap-4">
           <div className="flex flex-col items-end">
             <span className="text-xs font-medium text-[#8e8e93] mb-1">Shift Status</span>
             <span className="text-sm font-semibold text-white bg-[#181a26] px-4 py-2 rounded-full">{onDutyInfo.current} Phase Active</span>
           </div>
           <div className="bg-[#181a26] rounded-full flex items-center gap-3 px-5 py-2.5">
              <Clock size={15} className="text-[#baff55]" />
              <span className="text-sm font-semibold text-white">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Main Infrastructure Section */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Aviator Status */}
          <AviatorStatusCard logs={logs} chartData={chartData} />

          {/* Shortcuts Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
            {shortcuts.map(res => {
              const Icon = res.icon;
              return (
                <button 
                  key={res.name} 
                  onClick={() => navigate(res.path + (res.params || ''))}
                  className="bg-[#131520] hover:bg-[#191c2b] rounded-2xl flex flex-col items-start gap-4 p-5 transition-all duration-300 group relative overflow-hidden cursor-pointer text-left shadow-lg"
                >
                  <div 
                    className="w-10 h-10 rounded-2xl flex items-center justify-center"
                    style={{ background: `${res.color}20` }}
                  >
                    <Icon size={18} style={{ color: res.color }} />
                  </div>
                  <div>
                    <span className="block text-xs text-[#8e8e93] font-medium mb-1">Launch</span>
                    <span className="block text-sm font-semibold text-white">{res.name}</span>
                  </div>
                  <div className="absolute top-3 right-3 w-8 h-8 bg-[#1b1e2b] rounded-full flex items-center justify-center transition-all">
                    <ArrowUpRight size={14} className="text-white" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Side Deployment Column */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Shift Rota Card */}
          <div className="bg-[#131520] rounded-[28px] p-6 md:p-8 h-full flex flex-col relative group cursor-pointer shadow-2xl" onClick={() => navigate('/rota')}>
            <div className="absolute top-4 right-4 w-10 h-10 bg-[#1b1e2b] rounded-full flex items-center justify-center transition-all">
              <ArrowUpRight size={18} className="text-white" />
            </div>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-lg font-semibold text-white">Daily Deployment</h3>
                <p className="text-sm text-[#8e8e93] mt-1">Staff Rota Status</p>
              </div>
              <Calendar size={20} className="text-[#8e8e93]" />
            </div>

            <div className="space-y-4 flex-1">
              {[
                { id: 'AM', label: 'Morning', time: '07:30 - 15:30', names: onDutyInfo.AM, color: '#ffa64d' },
                { id: 'PM', label: 'Afternoon', time: '15:30 - 22:30', names: onDutyInfo.PM, color: '#baff55' },
                { id: 'NT', label: 'Night', time: '22:30 - 07:30', names: onDutyInfo.NT, color: '#3b82f6' },
              ].map(shift => {
                const isCurrent = onDutyInfo.current === shift.id;
                
                return (
                  <div 
                    key={shift.id} 
                    className={`relative p-5 rounded-2xl transition-all ${
                      isCurrent 
                        ? 'bg-[#1b221a]' 
                        : 'bg-[#181a24] opacity-50'
                    }`}
                  >
                    {isCurrent && (
                      <div className="absolute top-4 right-5 flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-[#baff55]" />
                        <span className="text-xs font-semibold text-[#baff55]">Active</span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-[#0d0e15]">
                        <Clock size={16} style={{ color: shift.color }} />
                      </div>
                      <div>
                        <span className="block text-sm font-semibold text-white">{shift.label}</span>
                        <span className="text-xs text-[#8e8e93] mt-0.5 block">{shift.time}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {shift.names.map(name => (
                        <div key={name} className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full bg-[#0d0e15]">
                           <div className="w-3 h-3 rounded-full" style={{ backgroundColor: STAFF_COLORS[name] || '#3a3b3f' }} />
                           <span className="text-xs font-medium text-white">{name}</span>
                        </div>
                      ))}
                      {shift.names.length === 0 && <span className="text-xs text-[#8e8e93] italic">No Deployment</span>}
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="mt-8 pt-6 space-y-3">
              <button 
                onClick={(e) => { e.stopPropagation(); navigate('/templates'); }}
                className="w-full bg-[#1b1e2b] hover:bg-[#242838] text-white font-medium py-3 px-6 rounded-full flex items-center justify-center gap-2 transition-all"
              >
                Admin Templates <ArrowUpRight size={14} />
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
