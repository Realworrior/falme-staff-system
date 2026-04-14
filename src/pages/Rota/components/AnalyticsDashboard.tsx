import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { MonthlyAnalytics, STAFF_COLORS } from '../utils/scheduleGenerator';
import { format } from 'date-fns';

interface AnalyticsDashboardProps {
  analytics: MonthlyAnalytics;
}

export function AnalyticsDashboard({ analytics }: AnalyticsDashboardProps) {
  const staffChartData = analytics.staffStats.map(stat => ({
    name: stat.name,
    AM: stat.amShifts,
    PM: stat.pmShifts,
    NT: stat.ntShifts,
    Total: stat.totalShifts,
  }));

  const dailyChartData = analytics.dailyMetrics.map(metric => ({
    date: format(metric.date, 'MMM d'),
    AM: metric.amCount,
    PM: metric.pmCount,
    NT: metric.ntCount,
  }));

  return (
    <div className="space-y-4 md:space-y-8">
      {/* Staff Statistics */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#0f0f17] border border-white/5 rounded-[32px] p-6 shadow-2xl"
      >
        <h3 className="mb-6 text-sm font-black uppercase tracking-[0.2em] text-gray-400 font-heading">
          Staff Shift Distribution
        </h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={staffChartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#4b5563' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: '#4b5563' }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f0f17',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '16px',
                fontSize: '12px',
                color: '#fff'
              }}
              itemStyle={{ color: '#fff' }}
            />
            <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '20px' }} />
            <Bar dataKey="AM" fill="#ef4444" radius={[6, 6, 0, 0]} />
            <Bar dataKey="PM" fill="#3b82f6" radius={[6, 6, 0, 0]} />
            <Bar dataKey="NT" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Daily Metrics */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-[#0f0f17] border border-white/5 rounded-[32px] p-6 shadow-2xl"
      >
        <h3 className="mb-6 text-sm font-black uppercase tracking-[0.2em] text-gray-400 font-heading">
          Daily Staff Coverage
        </h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={dailyChartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: '#4b5563' }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis tick={{ fontSize: 10, fill: '#4b5563' }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f0f17',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '16px',
                fontSize: '12px',
                color: '#fff'
              }}
              itemStyle={{ color: '#fff' }}
            />
            <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '20px' }} />
            <Line type="stepAfter" dataKey="AM" stroke="#ef4444" strokeWidth={2} dot={{ r: 3, fill: '#ef4444' }} />
            <Line type="stepAfter" dataKey="PM" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3, fill: '#3b82f6' }} />
            <Line type="stepAfter" dataKey="NT" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 3, fill: '#8b5cf6' }} />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
        {analytics.staffStats.map((stat, index) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 + index * 0.05 }}
            className="rounded-[28px] p-5 text-white border border-white/5 shadow-xl relative overflow-hidden group/stat"
            style={{
              background: `linear-gradient(135deg, ${STAFF_COLORS[stat.name]}22, ${STAFF_COLORS[stat.name]}05)`
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 font-heading">
                {stat.name}
              </div>
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: STAFF_COLORS[stat.name] }} />
            </div>

            <div className="text-3xl font-black font-heading mb-4 tracking-tighter">
              {stat.totalShifts} <span className="text-xs font-medium uppercase tracking-widest text-gray-500">Shifts</span>
            </div>

            <div className="flex flex-wrap gap-3">
              <div className="px-2 py-1 rounded-lg bg-white/5 border border-white/5 flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                <span className="text-[9px] font-bold text-gray-400">{stat.amShifts} AM</span>
              </div>
              <div className="px-2 py-1 rounded-lg bg-white/5 border border-white/5 flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                <span className="text-[9px] font-bold text-gray-400">{stat.pmShifts} PM</span>
              </div>
              <div className="px-2 py-1 rounded-lg bg-white/5 border border-white/5 flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                <span className="text-[9px] font-bold text-gray-400">{stat.ntShifts} NT</span>
              </div>
            </div>
            
            {/* Hover Decor */}
            <div className="absolute -bottom-2 -right-2 w-16 h-16 rounded-full opacity-10 group-hover:scale-150 transition-transform duration-500" style={{ backgroundColor: STAFF_COLORS[stat.name] }} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
