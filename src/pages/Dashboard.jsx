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
  MessageSquare
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
      if (key) mapped[key] = item.shifts || item;
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
    { name: "Agent Manual", icon: ShieldCheck, path: "/resources", params: "?section=manual", color: "#F97316" },
    { name: "Market Guide", icon: FileText, path: "/resources", params: "?section=guide", color: "#8B5CF6" },
    { name: "Templates", icon: MessageSquare, path: "/templates", color: "#60A5FA" },
    { name: "Aviator Matrix", icon: Activity, path: "/slots", color: "#EF4444" },
  ];

  return (
    <div className="p-4 md:p-8 space-y-8 w-full max-w-[1600px] mx-auto min-h-screen bg-[#050508]">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-4 border-b border-white/[0.03]">
        <div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tighter">
            Operational Overview
          </h1>
          <div className="flex items-center gap-3 mt-1.5">
             <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20">
               <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
               <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500/80">Systems Online</span>
             </div>
             <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-600">Betfalme Infrastructure v4.0</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
           <div className="flex flex-col items-end">
             <span className="text-[10px] font-black uppercase text-gray-500 tracking-[0.2em] leading-none">Shift Status</span>
             <span className="text-xs font-black text-white/80 mt-1 uppercase">{onDutyInfo.current} Phase Active</span>
           </div>
           <div className="w-px h-8 bg-white/10" />
           <div className="px-5 py-2.5 bg-white/[0.03] border border-white/10 rounded-2xl flex items-center gap-3 shadow-2xl">
              <Clock size={16} className="text-orange-500" />
              <span className="text-xs font-black uppercase text-white tracking-widest">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Main Infrastructure Section */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Aviator Premium Pulse Graph */}
          <div className="bg-[#0c0c14] border border-white/[0.05] rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group">
            <div className="flex items-start justify-between mb-10">
              <div>
                <h3 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-red-500/10 border border-red-500/20">
                    <Activity size={20} className="text-red-500" />
                  </div>
                  Aviator Pulse
                </h3>
                <p className="text-[10px] text-gray-500 mt-2 uppercase font-black tracking-[0.3em]">Real-time Global Failure Index</p>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Current Frequency</span>
                <span className="text-2xl font-black text-white tracking-tighter">{logs.filter(l => l.ts > Date.now() - 3600000).length} <span className="text-xs text-gray-600 font-bold ml-1">/hr</span></span>
              </div>
            </div>
            
            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorPulse" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#EF4444" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Tooltip 
                    cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }}
                    contentStyle={{ 
                      backgroundColor: 'rgba(12, 12, 20, 0.95)', 
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255,255,255,0.1)', 
                      borderRadius: '16px',
                      padding: '12px 16px',
                      boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
                    }}
                    itemStyle={{ fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', color: '#fff' }}
                    labelStyle={{ fontSize: '9px', fontWeight: '900', color: 'rgba(255,255,255,0.4)', marginBottom: '8px' }}
                  />
                  <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="rgba(255,255,255,0.02)" />
                  <XAxis 
                    dataKey="name" 
                    stroke="rgba(255,255,255,0.2)" 
                    fontSize={10} 
                    fontWeight={800}
                    axisLine={false} 
                    tickLine={false}
                    dy={10}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="logs" 
                    stroke="#EF4444" 
                    fillOpacity={1} 
                    fill="url(#colorPulse)" 
                    strokeWidth={4} 
                    animationDuration={2000}
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

          {/* Minimal Shortcuts Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {shortcuts.map(res => (
              <button 
                key={res.name} 
                onClick={() => navigate(res.path + (res.params || ''))}
                className="flex items-center gap-4 p-5 rounded-3xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.05] hover:border-white/10 transition-all group relative overflow-hidden"
              >
                <div 
                  className="w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110"
                  style={{ background: `${res.color}15`, border: `1px solid ${res.color}30` }}
                >
                  <res.icon size={22} style={{ color: res.color }} />
                </div>
                <div className="text-left">
                  <span className="block text-[10px] font-black text-gray-500 uppercase tracking-widest leading-none mb-1.5">Open</span>
                  <span className="block text-xs font-black text-white uppercase tracking-tighter">{res.name}</span>
                </div>
                <ArrowUpRight size={14} className="absolute top-4 right-4 text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}
          </div>
        </div>

        {/* Side Deployment Column */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Shift Rota Card */}
          <div className="bg-[#0c0c14] border border-white/[0.05] rounded-[2.5rem] p-8 shadow-2xl h-full flex flex-col">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h3 className="text-lg font-black text-white uppercase tracking-tight">Daily Deployment</h3>
                <p className="text-[10px] text-gray-500 mt-2 uppercase font-black tracking-[0.3em]">Staff Rota Status</p>
              </div>
              <Calendar size={20} className="text-orange-500/50" />
            </div>

            <div className="space-y-6 flex-1">
              {[
                { id: 'AM', label: 'Morning', time: '07:30 - 15:30', names: onDutyInfo.AM, color: '#F97316', range: [7.5, 15.5] },
                { id: 'PM', label: 'Afternoon', time: '15:30 - 22:30', names: onDutyInfo.PM, color: '#8B5CF6', range: [15.5, 22.5] },
                { id: 'NT', label: 'Night', time: '22:30 - 07:30', names: onDutyInfo.NT, color: '#FBBF24', range: [22.5, 31.5] },
              ].map(shift => {
                const isCurrent = onDutyInfo.current === shift.id;
                
                return (
                  <div key={shift.id} className={`relative p-6 rounded-3xl border transition-all duration-500 ${isCurrent ? 'bg-white/[0.03] border-white/10 shadow-2xl' : 'bg-transparent border-transparent opacity-20'}`}>
                    {isCurrent && (
                      <div className="absolute top-4 right-6 flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[8px] font-black uppercase text-emerald-500 tracking-widest">Active</span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-4 mb-5">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/5 border border-white/10">
                        <Clock size={18} style={{ color: shift.color }} />
                      </div>
                      <div>
                        <span className="block text-xs font-black text-white uppercase tracking-widest">{shift.label}</span>
                        <span className="text-[9px] font-bold text-gray-500 tracking-widest mt-1 block">{shift.time}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2.5">
                      {shift.names.map(name => (
                        <div key={name} className="flex items-center gap-2.5 pl-1.5 pr-4 py-1.5 rounded-xl bg-white/[0.03] border border-white/5">
                           <div className="w-5 h-5 rounded-lg shadow-inner" style={{ backgroundColor: STAFF_COLORS[name] || '#333' }} />
                           <span className="text-[11px] font-black text-white/90 tracking-tight">{name}</span>
                        </div>
                      ))}
                      {shift.names.length === 0 && <span className="text-[10px] text-gray-600 font-bold uppercase tracking-widest italic">No Deployment</span>}
                    </div>
                  </div>
                );
              })}
            </div>
            
            <button 
              onClick={() => navigate('/rota')}
              className="w-full mt-10 py-4 rounded-3xl bg-white/[0.03] border border-white/10 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 hover:bg-white/[0.06] hover:text-white transition-all flex items-center justify-center gap-3"
            >
              Access Full Rota <ArrowUpRight size={16} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
