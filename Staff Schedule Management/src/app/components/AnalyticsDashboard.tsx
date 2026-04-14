import { motion } from 'motion/react';
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
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border-2 border-border rounded-xl p-4 md:p-6"
      >
        <h3 className="mb-4 md:mb-6 text-lg md:text-xl" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
          Staff Shift Distribution
        </h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={staffChartData}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--card)',
                border: '2px solid var(--border)',
                borderRadius: '8px',
              }}
            />
            <Legend />
            <Bar dataKey="AM" fill="#FF6B35" radius={[4, 4, 0, 0]} />
            <Bar dataKey="PM" fill="#4ECDC4" radius={[4, 4, 0, 0]} />
            <Bar dataKey="NT" fill="#6366F1" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Daily Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-card border-2 border-border rounded-xl p-4 md:p-6"
      >
        <h3 className="mb-4 md:mb-6 text-lg md:text-xl" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
          Daily Staff Coverage
        </h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={dailyChartData}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11 }}
              interval="preserveStartEnd"
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--card)',
                border: '2px solid var(--border)',
                borderRadius: '8px',
              }}
            />
            <Legend />
            <Line type="monotone" dataKey="AM" stroke="#FF6B35" strokeWidth={3} dot={{ r: 4 }} />
            <Line type="monotone" dataKey="PM" stroke="#4ECDC4" strokeWidth={3} dot={{ r: 4 }} />
            <Line type="monotone" dataKey="NT" stroke="#6366F1" strokeWidth={3} dot={{ r: 4 }} />
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
            className="rounded-xl p-3 md:p-4 text-white border-2 border-opacity-20"
            style={{
              backgroundColor: STAFF_COLORS[stat.name],
              borderColor: STAFF_COLORS[stat.name]
            }}
          >
            <div className="text-base md:text-lg mb-2 opacity-90" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              {stat.name}
            </div>
            <div className="text-2xl md:text-3xl mb-2 md:mb-3">{stat.totalShifts} shifts</div>
            <div className="flex gap-2 md:gap-3 text-xs md:text-sm opacity-90">
              <div className="flex items-center gap-1">
                <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-white/40" />
                <span>{stat.amShifts} AM</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-white/40" />
                <span>{stat.pmShifts} PM</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-white/40" />
                <span>{stat.ntShifts} NT</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
