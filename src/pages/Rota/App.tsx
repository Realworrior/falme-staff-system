import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { ScheduleCalendar } from './components/ScheduleCalendar';
import { ShiftMates } from './components/ShiftMates';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import {
  STAFF_CONFIG,
  STAFF_COLORS,
  generateMonthSchedule,
  calculateMonthlyAnalytics,
} from './utils/scheduleGenerator';

export default function App() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 3, 1)); // April 2026
  const [selectedStaff, setSelectedStaff] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [activeTab, setActiveTab] = useState<'schedule' | 'analytics'>('schedule');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const schedule = useMemo(() => generateMonthSchedule(year, month), [year, month]);
  const analytics = useMemo(() => calculateMonthlyAnalytics(year, month), [year, month]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDate(null);
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDate(null);
  };

  return (
    <div className="min-h-screen bg-background p-3 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 md:mb-12"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl accent-gradient flex items-center justify-center shadow-lg shadow-red-500/20">
              <CalendarIcon size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter uppercase font-heading leading-none">
                Staff Rota
              </h1>
              <div className="h-1 w-12 bg-red-600 rounded-full mt-2" />
            </div>
          </div>
          <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.3em] font-heading">
            Synchronized Operational Schedule & Resource Analytics
          </p>
        </motion.header>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-10 flex flex-col xl:flex-row gap-6 items-start xl:items-center justify-between"
        >
          {/* Month Navigation */}
          <div className="flex items-center gap-4 bg-[#0f0f17] border border-white/5 p-2 rounded-2xl shadow-xl">
            <button
              onClick={handlePrevMonth}
              className="p-3 hover:text-white text-gray-500 bg-white/5 hover:bg-white/10 rounded-xl transition-all active:scale-95"
              aria-label="Previous month"
            >
              <ChevronLeft size={20} />
            </button>
            <div className="min-w-[160px] text-center">
              <div className="text-lg font-black text-white uppercase tracking-wider font-heading">
                {format(currentDate, 'MMMM yyyy')}
              </div>
            </div>
            <button
              onClick={handleNextMonth}
              className="p-3 hover:text-white text-gray-500 bg-white/5 hover:bg-white/10 rounded-xl transition-all active:scale-95"
              aria-label="Next month"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Staff Filter */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedStaff(null)}
              className={`
                px-5 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all
                ${!selectedStaff
                  ? 'accent-gradient text-white shadow-lg shadow-red-500/20'
                  : 'bg-white/5 text-gray-500 border border-white/5 hover:text-white hover:bg-white/10'
                }
              `}
            >
              Universal View
            </button>
            {STAFF_CONFIG.map(staff => (
              <button
                key={staff.name}
                onClick={() => setSelectedStaff(staff.name)}
                className={`
                  px-4 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all border
                  ${selectedStaff === staff.name
                    ? 'border-white text-white shadow-lg'
                    : 'border-transparent text-gray-500 bg-white/2 hover:bg-white/5 hover:text-gray-300'
                  }
                `}
                style={{ 
                  backgroundColor: selectedStaff === staff.name ? STAFF_COLORS[staff.name] : 'transparent',
                  borderColor: selectedStaff === staff.name ? 'rgba(255,255,255,0.2)' : 'transparent'
                }}
              >
                {staff.name}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-8 flex gap-4 border-b border-white/5"
        >
          <button
            onClick={() => setActiveTab('schedule')}
            className={`
              pb-4 px-2 transition-all relative
              ${activeTab === 'schedule' ? 'text-white' : 'text-gray-600 hover:text-gray-400'}
            `}
          >
            <div className="flex items-center gap-2.5">
              <CalendarIcon size={16} className={activeTab === 'schedule' ? 'text-red-500' : ''} />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] font-heading">Schedule Matrix</span>
            </div>
            {activeTab === 'schedule' && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-red-600 shadow-[0_0_10px_rgba(220,38,38,0.5)]"
              />
            )}
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`
              pb-4 px-2 transition-all relative
              ${activeTab === 'analytics' ? 'text-white' : 'text-gray-600 hover:text-gray-400'}
            `}
          >
            <div className="flex items-center gap-2.5">
              <TrendingUp size={16} className={activeTab === 'analytics' ? 'text-red-500' : ''} />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] font-heading">Impact Analytics</span>
            </div>
            {activeTab === 'analytics' && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-red-600 shadow-[0_0_10px_rgba(220,38,38,0.5)]"
              />
            )}
          </button>
        </motion.div>

        {/* Content */}
        {activeTab === 'schedule' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
            {/* Calendar */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="lg:col-span-2"
            >
              <div className="bg-[#0f0f17] border border-white/5 rounded-3xl shadow-xl p-3 md:p-6">
                <h2 className="text-xl md:text-2xl mb-4 md:mb-6 text-white" style={{ fontFamily: 'var(--font-display)' }}>
                  Monthly Calendar
                </h2>
                <ScheduleCalendar
                  schedule={schedule}
                  selectedStaff={selectedStaff}
                  onDayClick={setSelectedDate}
                />
              </div>
            </motion.div>

            {/* Shift Mates */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="bg-[#0f0f17] border border-white/5 shadow-xl rounded-3xl overflow-hidden h-full">
                 <ShiftMates
                   selectedDate={selectedDate}
                   schedule={schedule}
                   selectedStaff={selectedStaff}
                 />
              </div>
            </motion.div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <AnalyticsDashboard analytics={analytics} />
          </motion.div>
        )}

        {/* Legend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 bg-[#0f0f17] border border-white/5 rounded-3xl p-4 md:p-6 shadow-xl"
        >
          <h3 className="mb-4 text-white" style={{ fontFamily: 'var(--font-display)' }}>
            Staff Color Codes
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 md:gap-4">
            {STAFF_CONFIG.map(staff => (
              <div key={staff.name} className="flex items-center gap-2">
                <div
                  className="w-6 h-6 md:w-8 md:h-8 rounded"
                  style={{ backgroundColor: STAFF_COLORS[staff.name] }}
                />
                <div className="text-sm md:text-base text-gray-300">{staff.name}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}