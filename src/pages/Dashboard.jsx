import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Activity, 
  Ticket, 
  ShieldCheck,
  ArrowUpRight,
  Clock,
  Users
} from 'lucide-react';
import { useGlobalData } from '../context/FirebaseDataContext';
import { 
  generateMonthSchedule, 
  getCurrentShiftType,
  STAFF_COLORS 
} from './Rota/utils/scheduleGenerator';

const Dashboard = () => {
  const { templates, logs, tickets, overrides: rawOverrides, loading } = useGlobalData();

  // Derived loading state for the whole dashboard
  const isInitialLoading = loading.templates || loading.logs || loading.tickets;

  // Convert rawOverrides to mapped format if needed (consistent with App.tsx)
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
    const schedule = generateMonthSchedule(today.getFullYear(), today.getMonth(), overrides);
    const todaySchedule = schedule.find(d => 
      d.date.getDate() === today.getDate() && 
      d.date.getMonth() === today.getMonth() && 
      d.date.getFullYear() === today.getFullYear()
    );

    const onDutyNames = todaySchedule?.shifts[currentShift] || [];
    return {
      count: onDutyNames.length,
      names: onDutyNames,
      shift: currentShift
    };
  }, [overrides]);

  const metrics = useMemo(() => {
    // Calculate total templates across all categories
    const totalTemplates = templates.reduce((sum, cat) => sum + (cat.templates?.length || 0), 0);
    const recentLogsCount = logs.filter(l => l.ts > Date.now() - 86400000).length;
    const activeTicketsCount = tickets.filter(t => t.status !== 'Resolved').length;

    return [
      { 
        label: "Team on Duty", 
        value: onDutyInfo.count, 
        detail: `${onDutyInfo.shift} Shift: ${onDutyInfo.names.join(', ') || 'None'}`, 
        icon: Users, 
        color: "from-indigo-600 to-violet-500",
        shadow: "shadow-indigo-500/20"
      },
      { 
        label: "Library Assets", 
        value: totalTemplates, 
        detail: `${templates.length} Categories`, 
        icon: FileText, 
        color: "from-blue-600 to-cyan-500",
        shadow: "shadow-blue-500/20"
      },
      { 
        label: "Aviator Failures", 
        value: logs.length, 
        detail: `${recentLogsCount} in last 24h`, 
        icon: Activity, 
        color: "from-red-600 to-orange-500",
        shadow: "shadow-red-500/20"
      },
      { 
        label: "Active Tickets", 
        value: activeTicketsCount, 
        detail: "Awaiting Resolution", 
        icon: Ticket, 
        color: "from-amber-500 to-yellow-400",
        shadow: "shadow-amber-500/20"
      }
    ];
  }, [templates, logs, tickets, onDutyInfo]);

  const recentActivities = useMemo(() => {
    const combined = [
      ...logs.map(l => ({ type: 'Log', title: `Failure: ${l.type}`, ts: l.ts, detail: l.status })),
      ...tickets.map(t => ({ type: 'Ticket', title: t.title, ts: t.created, detail: t.status })),
    ]
    .sort((a, b) => b.ts - a.ts)
    .slice(0, 5);

    return combined;
  }, [logs, tickets]);

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <div className="p-4 md:p-8 md:px-12 space-y-10 w-full mx-auto">
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 font-heading tracking-tight">System Overview</h1>
          <p className="text-gray-500 text-sm md:text-base font-medium uppercase tracking-widest text-[10px]">Real-time Platform Monitoring</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/5">
          <Clock size={14} className="text-gray-500" />
          <span className="text-gray-400 font-bold text-xs font-mono">{new Date().toLocaleTimeString()}</span>
        </div>
      </motion.div>

      {/* Dynamic Stats Grid */}
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {metrics.map((stat) => (
          <motion.div
            key={stat.label}
            variants={item}
            className="bg-[#0f0f17] rounded-3xl p-6 border border-white/5 hover:border-white/10 transition-all duration-500 group shadow-xl"
          >
            <div className="flex items-start justify-between mb-6">
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center ${stat.shadow} shadow-lg group-hover:scale-110 transition-transform duration-500`}>
                <stat.icon className="w-7 h-7 text-white" />
              </div>
              <div className="flex flex-col items-end">
                <span className="text-white/40 text-[10px] font-black uppercase tracking-widest">Growth</span>
                <span className="text-white font-bold text-sm leading-none flex items-center gap-1 mt-1">
                  <ArrowUpRight size={12} className="text-emerald-500" />
                  Stable
                </span>
              </div>
            </div>
            <h3 className="text-3xl font-black text-white mb-1 font-heading">{stat.value}</h3>
            <p className="text-gray-600 text-xs font-black uppercase tracking-[0.2em]">{stat.label}</p>
            <div className="mt-4 pt-4 border-t border-white/5">
              <span className="text-gray-500 text-xs font-bold italic">{stat.detail}</span>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Core Activity Feed */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="bg-[#0f0f17] rounded-3xl border border-white/5 shadow-2xl overflow-hidden"
      >
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-black/20">
          <h2 className="text-xl font-bold text-white font-heading tracking-tight">Recent Infrastructure Events</h2>
          <button className="text-[10px] text-red-500 hover:text-red-400 font-black uppercase tracking-[0.2em] transition-colors">View Deep Logs</button>
        </div>
        <div className="divide-y divide-white/[0.03]">
          {recentActivities.map((activity, index) => (
            <div 
              key={index} 
              className="group flex items-center gap-6 p-6 hover:bg-white/[0.01] transition-all duration-300"
            >
              <div className="relative">
                <div className={`w-2.5 h-2.5 rounded-full ${activity.type === 'Log' ? 'bg-red-500' : 'bg-amber-500'} shadow-[0_0_12px_rgba(255,255,255,0.1)]`} />
                <div className={`absolute inset-0 rounded-full animate-ping opacity-20 ${activity.type === 'Log' ? 'bg-red-500' : 'bg-amber-500'}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-black text-sm uppercase tracking-tight group-hover:text-red-500 transition-colors">{activity.title}</p>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="px-2 py-0.5 rounded bg-white/5 text-gray-500 text-xs font-black uppercase tracking-widest border border-white/5">
                    {activity.type}
                  </span>
                  <span className="text-gray-600 text-xs font-bold italic">{activity.detail}</span>
                </div>
              </div>
              <div className="text-right">
                <span className="block text-gray-600 text-[10px] font-black uppercase tracking-widest">{new Date(activity.ts).toLocaleDateString()}</span>
                <span className="block text-gray-400 text-[9px] font-mono mt-1">{new Date(activity.ts).toLocaleTimeString()}</span>
              </div>
            </div>
          ))}
          {recentActivities.length === 0 && (
            <div className="py-20 text-center text-gray-600 font-black uppercase tracking-widest text-[10px] italic underline decoration-white/5">
              No recent synchronization events recorded
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
