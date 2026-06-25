import React, { useMemo } from 'react';
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
  Calculator
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
    { name: "Aviator Matrix", icon: Activity, path: "/slots", color: "#ef4444" },
  ];

  return (
    <div className="p-4 md:p-8 space-y-8 w-full max-w-[1600px] mx-auto min-h-screen bg-[#161616]">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-[#2a2b2f]">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
            Operational Overview
          </h1>
          <div className="flex items-center gap-3 mt-2">
             <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#2a2b2f] border border-[#3a3b3f]">
               <div className="w-2 h-2 rounded-full bg-[#baff55]" />
               <span className="text-xs font-semibold text-[#baff55]">Systems Online</span>
             </div>
             <p className="text-sm text-[#8e8e93] font-medium">Betfalme Infrastructure v4.0</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
           <div className="flex flex-col items-end">
             <span className="text-xs font-medium text-[#8e8e93] mb-1">Shift Status</span>
             <span className="text-sm font-semibold text-white bg-[#2a2b2f] border border-[#3a3b3f] px-4 py-2 rounded-full">{onDutyInfo.current} Phase Active</span>
           </div>
           <div className="bg-[#2a2b2f] border border-[#3a3b3f] rounded-full flex items-center gap-3 px-5 py-2.5">
              <Clock size={15} className="text-[#baff55]" />
              <span className="text-sm font-semibold text-white">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Main Infrastructure Section */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Aviator Pulse Graph */}
          <div className="cutout-card p-6 md:p-8 relative">
            <div className="flex items-start justify-between mb-8">
              <div>
                <h3 className="text-lg font-semibold text-white flex items-center gap-3">
                  <div className="w-9 h-9 rounded-2xl bg-[#161616] border border-[#3a3b3f] flex items-center justify-center">
                    <Activity size={18} className="text-[#ff4d4d]" />
                  </div>
                  Aviator Pulse
                </h3>
                <p className="text-sm text-[#8e8e93] mt-1 font-medium">Real-time Global Failure Index</p>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-xs text-[#8e8e93] font-medium mb-1">Frequency</span>
                <span className="text-2xl font-bold text-white">
                  {logs.filter(l => l.ts > Date.now() - 3600000).length}
                  <span className="text-sm text-[#8e8e93] font-normal ml-1">/hr</span>
                </span>
              </div>
            </div>
            
            <div className="h-[240px] md:h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorPulse" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ff4d4d" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#ff4d4d" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <Tooltip 
                    cursor={{ stroke: 'rgba(186,255,85,0.2)', strokeWidth: 1 }}
                    contentStyle={{ 
                      backgroundColor: '#2a2b2f',
                      border: '1px solid #3a3b3f',
                      borderRadius: '16px',
                      padding: '12px 16px',
                    }}
                    itemStyle={{ fontSize: '12px', fontWeight: '600', color: '#fff' }}
                    labelStyle={{ fontSize: '11px', color: '#8e8e93', marginBottom: '4px' }}
                  />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.04)" />
                  <XAxis 
                    dataKey="name" 
                    stroke="transparent"
                    fontSize={11}
                    fontWeight={500}
                    tick={{ fill: '#8e8e93' }}
                    axisLine={false} 
                    tickLine={false}
                    dy={10}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="logs" 
                    stroke="#ff4d4d" 
                    fill="url(#colorPulse)" 
                    strokeWidth={2} 
                    animationDuration={1000}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="baseline" 
                    stroke="rgba(255,255,255,0.05)" 
                    fill="transparent" 
                    strokeWidth={1} 
                    strokeDasharray="5 5"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Shortcuts Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
            {shortcuts.map(res => (
              <button 
                key={res.name} 
                onClick={() => navigate(res.path + (res.params || ''))}
                className="cutout-card flex flex-col items-start gap-4 p-5 hover:bg-[#2d2f34] transition-all duration-300 group relative overflow-hidden cursor-pointer text-left"
              >
                <div 
                  className="w-10 h-10 rounded-2xl flex items-center justify-center"
                  style={{ background: `${res.color}20` }}
                >
                  <res.icon size={18} style={{ color: res.color }} />
                </div>
                <div>
                  <span className="block text-xs text-[#8e8e93] font-medium mb-1">Launch</span>
                  <span className="block text-sm font-semibold text-white">{res.name}</span>
                </div>
                <div className="absolute top-3 right-3 w-8 h-8 bg-[#161616] rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                  <ArrowUpRight size={14} className="text-white" />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Side Deployment Column */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Shift Rota Card */}
          <div className="cutout-card p-6 md:p-8 h-full flex flex-col relative group cursor-pointer" onClick={() => navigate('/rota')}>
            <div className="absolute top-4 right-4 w-10 h-10 bg-[#161616] rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
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
                    className={`relative p-5 rounded-2xl border transition-all ${
                      isCurrent 
                        ? 'bg-[#161616] border-[#baff55]/30' 
                        : 'bg-transparent border-[#3a3b3f]/50 opacity-40'
                    }`}
                  >
                    {isCurrent && (
                      <div className="absolute top-4 right-5 flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-[#baff55]" />
                        <span className="text-xs font-semibold text-[#baff55]">Active</span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-[#2a2b2f]">
                        <Clock size={16} style={{ color: shift.color }} />
                      </div>
                      <div>
                        <span className="block text-sm font-semibold text-white">{shift.label}</span>
                        <span className="text-xs text-[#8e8e93] mt-0.5 block">{shift.time}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {shift.names.map(name => (
                        <div key={name} className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full bg-[#2a2b2f] border border-[#3a3b3f]">
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
            
            <div className="mt-8 pt-6 border-t border-[#3a3b3f] space-y-3">
              <button 
                onClick={(e) => { e.stopPropagation(); navigate('/templates'); }}
                className="w-full pill-dark flex items-center justify-center gap-2"
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
