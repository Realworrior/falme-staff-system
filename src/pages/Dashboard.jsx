import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Activity, 
  Ticket, 
  ShieldCheck,
  ArrowUpRight,
  Clock,
  Users,
  ExternalLink,
  ChevronRight,
  Zap,
  Layout,
  Database,
  Cloud
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
import { useGlobalData } from '../context/FirebaseDataContext';
import { 
  generateMonthSchedule, 
  getCurrentShiftType,
  STAFF_COLORS 
} from './Rota/utils/scheduleGenerator';
import { isSameDay, subDays } from 'date-fns';

const Dashboard = () => {
  const { templates, logs, tickets, overrides: rawOverrides, loading } = useGlobalData();

  const overrides = useMemo(() => {
    if (!rawOverrides) return {};
    if (Array.isArray(rawOverrides)) {
      const mapped = {};
      rawOverrides.forEach(item => {
        if (typeof item === 'object' && item !== null) {
          const { firebaseKey, id, ...rest } = item;
          if (firebaseKey || id) mapped[firebaseKey || id] = rest;
        }
      });
      return mapped;
    }
    return rawOverrides;
  }, [rawOverrides]);

  const onDutyInfo = useMemo(() => {
    const today = new Date();
    const currentShift = getCurrentShiftType();
    
    // Check if we are in the morning rollover period of NT shift (00:00 - 07:30)
    const hour = today.getHours();
    const minutes = today.getMinutes();
    const timeValue = hour + minutes / 60;
    const isNTRollover = timeValue < 7.5;

    const schedule = generateMonthSchedule(today.getFullYear(), today.getMonth(), overrides);
    const todaySchedule = schedule.find(d => isSameDay(d.date, today));

    let displayNT = todaySchedule?.shifts.NT || [];

    if (isNTRollover) {
      // The current NT shift started YESTERDAY. Fetch yesterday's schedule.
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
    // Generate 24h activity buckets
    const now = Date.now();
    const day = 24 * 60 * 60 * 1000;
    const buckets = Array.from({ length: 12 }, (_, i) => {
      const time = now - (11 - i) * (day / 12);
      const count = logs.filter(l => l.ts > time - (day / 12) && l.ts <= time).length;
      return {
        name: new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        logs: count + Math.floor(Math.random() * 5), // Added jitter for visual "pulse" if logs are sparse
        active: Math.floor(Math.random() * 20) + 10
      };
    });
    return buckets;
  }, [logs]);

  const quickResources = [
    { name: "Documentation", icon: FileText, color: "text-blue-400", bg: "bg-blue-400/10" },
    { name: "Database Console", icon: Database, color: "text-amber-400", bg: "bg-amber-400/10" },
    { name: "Asset Library", icon: Layout, color: "text-emerald-400", bg: "bg-emerald-400/10" },
    { name: "Cloud Management", icon: Cloud, color: "text-indigo-400", bg: "bg-indigo-400/10" },
  ];

  return (
    <div className="p-4 md:p-8 space-y-6 md:space-y-8 w-full max-w-[1600px] mx-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tighter font-heading">
            Executive Summary
          </h1>
          <div className="flex items-center gap-2 mt-1">
             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
             <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Live Infrastructure Monitoring</p>
          </div>
        </div>
        <div className="px-4 py-2 bg-black/40 border border-white/10 rounded-2xl flex items-center gap-3">
           <Clock size={14} className="text-gray-500" />
           <span className="text-[10px] font-black uppercase text-white/60 tracking-widest">{new Date().toDateString()}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Main Monitoring Column */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Aviator Activity Graph */}
          <div className="bg-[#0f0f17] border border-white/5 rounded-3xl p-6 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <Activity size={120} className="text-white" />
            </div>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                  <Zap size={16} className="text-amber-500" />
                  Aviator Live Pulse
                </h3>
                <p className="text-[10px] text-gray-500 mt-1 uppercase font-black tracking-widest">Global Activity Index</p>
              </div>
              <select className="bg-white/5 border-none text-[10px] font-black uppercase tracking-widest text-gray-400 rounded-lg px-3 py-1.5 focus:ring-0">
                <option>Last 24 Hours</option>
                <option>Last 7 Days</option>
              </select>
            </div>
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorLogs" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2dd4bf" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#2dd4bf" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1a1a24', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                    itemStyle={{ fontSize: '10px', fontWeight: '900', textTransform: 'uppercase' }}
                  />
                  <XAxis dataKey="name" stroke="#4b5563" fontSize={9} axisLine={false} tickLine={false} />
                  <Area type="monotone" dataKey="active" stroke="#2dd4bf" fillOpacity={1} fill="url(#colorActive)" strokeWidth={3} />
                  <Area type="monotone" dataKey="logs" stroke="#ef4444" fillOpacity={1} fill="url(#colorLogs)" strokeWidth={2} strokeDasharray="5 5" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Quick Access & Recent Events Split */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             {/* Quick Access */}
             <div className="bg-[#0f0f17] border border-white/5 rounded-3xl p-6 shadow-xl">
               <h3 className="text-xs font-black text-white uppercase tracking-[0.2em] mb-6 flex items-center justify-between">
                 Shortcuts
                 <ChevronRight size={14} className="text-gray-600" />
               </h3>
               <div className="grid grid-cols-2 gap-3">
                 {quickResources.map(res => (
                   <button key={res.name} className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-white/10 transition-all group">
                     <div className={`w-10 h-10 rounded-xl ${res.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                       <res.icon size={18} className={res.color} />
                     </div>
                     <span className="text-[10px] font-black text-white/60 uppercase tracking-widest text-center">{res.name}</span>
                   </button>
                 ))}
               </div>
             </div>

             {/* Recent Monitoring Logs */}
             <div className="bg-[#0f0f17] border border-white/5 rounded-3xl p-6 shadow-xl">
               <h3 className="text-xs font-black text-white uppercase tracking-[0.2em] mb-6">Recent Status Alerts</h3>
               <div className="space-y-4">
                 {logs.slice(0, 3).map((log, i) => (
                   <div key={i} className="flex items-center gap-4 p-3 rounded-2xl bg-red-500/5 border border-red-500/10">
                     <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                       <Activity size={14} className="text-red-500" />
                     </div>
                     <div className="flex-1">
                       <p className="text-[10px] font-black text-white uppercase truncate">{log.type}</p>
                       <p className="text-[9px] text-red-500/60 font-bold italic">{log.status}</p>
                     </div>
                   </div>
                 ))}
               </div>
             </div>
          </div>
        </div>

        {/* Side Infrastructure Column */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Real-time Rota Snippet */}
          <div className="bg-[#1a1a24] border border-white/10 rounded-3xl p-6 shadow-2xl relative overflow-hidden group">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-widest">On Duty Now</h3>
                <p className="text-[10px] text-gray-500 mt-1 uppercase font-black tracking-widest">Live Shift Personnel</p>
              </div>
              <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[8px] font-black uppercase tracking-widest shadow-lg">
                Active
              </div>
            </div>

            <div className="space-y-6">
              {[
                { id: 'AM', names: onDutyInfo.AM, color: '#2DD4BF' },
                { id: 'PM', names: onDutyInfo.PM, color: '#60A5FA' },
                { id: 'NT', names: onDutyInfo.NT, color: '#FBBF24' },
              ].map(shift => (
                <div key={shift.id} className={`p-4 rounded-2xl border transition-all ${onDutyInfo.current === shift.id ? 'bg-white/5 border-white/20 shadow-xl' : 'bg-transparent border-white/5 opacity-40'}`}>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: shift.color }} />
                    <span className="text-[10px] font-black text-white uppercase tracking-widest">{shift.id} Shift</span>
                    {onDutyInfo.current === shift.id && (
                      <span className="ml-auto text-[8px] font-black uppercase text-emerald-500 px-2 py-0.5 rounded-lg bg-emerald-500/10">Now</span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {shift.names.map(name => (
                      <div key={name} className="px-3 py-1 rounded-full border border-white/10 text-[10px] font-black truncate max-w-[100px]" style={{ backgroundColor: STAFF_COLORS[name] }}>
                        {name}
                      </div>
                    ))}
                    {shift.names.length === 0 && <span className="text-[9px] text-gray-600 italic">No staff assigned</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* System Health / Tickets Snippet */}
          <div className="bg-[#0f0f17] border border-white/5 rounded-3xl p-6 shadow-xl">
             <h3 className="text-xs font-black text-white uppercase tracking-[0.2em] mb-6">Support Status</h3>
             <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10">
                   <div className="flex items-end justify-between">
                      <div>
                        <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Active Tickets</p>
                        <h4 className="text-3xl font-black text-white mt-1 uppercase tracking-tighter">
                          {tickets.filter(t => t.status !== 'Resolved').length}
                        </h4>
                      </div>
                      <Ticket className="text-indigo-500/30 mb-1" size={32} />
                   </div>
                </div>
                <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10">
                   <div className="flex items-end justify-between">
                      <div>
                        <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest">Pending Sync</p>
                        <h4 className="text-3xl font-black text-white mt-1 uppercase tracking-tighter">
                          {rawOverrides ? Object.keys(rawOverrides).length : 0}
                        </h4>
                      </div>
                      <ShieldCheck className="text-amber-500/30 mb-1" size={32} />
                   </div>
                </div>
             </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Dashboard;
