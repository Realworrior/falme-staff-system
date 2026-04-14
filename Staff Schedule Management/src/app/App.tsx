import { useState, useMemo } from 'react';
import { motion } from 'motion/react';
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
          className="mb-6 md:mb-8"
        >
          <h1
            className="text-4xl md:text-6xl lg:text-7xl mb-2"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Staff Schedule
          </h1>
          <p className="text-sm md:text-lg opacity-60">
            Manage shifts, view teammates, and track analytics
          </p>
        </motion.header>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between"
        >
          {/* Month Navigation */}
          <div className="flex items-center gap-2 md:gap-4">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 md:p-2 hover:bg-accent rounded-lg transition-colors"
              aria-label="Previous month"
            >
              <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
            </button>
            <div className="min-w-[140px] md:min-w-[200px] text-center">
              <div
                className="text-xl md:text-3xl"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {format(currentDate, 'MMMM yyyy')}
              </div>
            </div>
            <button
              onClick={handleNextMonth}
              className="p-1.5 md:p-2 hover:bg-accent rounded-lg transition-colors"
              aria-label="Next month"
            >
              <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
            </button>
          </div>

          {/* Staff Filter */}
          <div className="flex flex-wrap gap-1.5 md:gap-2">
            <button
              onClick={() => setSelectedStaff(null)}
              className={`
                px-2 md:px-4 py-1.5 md:py-2 rounded-lg border-2 transition-all text-xs md:text-base
                ${!selectedStaff
                  ? 'border-foreground bg-foreground text-background'
                  : 'border-border hover:border-foreground/50'
                }
              `}
            >
              All
            </button>
            {STAFF_CONFIG.map(staff => (
              <button
                key={staff.name}
                onClick={() => setSelectedStaff(staff.name)}
                className={`
                  px-2 md:px-4 py-1.5 md:py-2 rounded-lg transition-all text-xs md:text-base text-white
                  ${selectedStaff === staff.name
                    ? 'ring-2 ring-foreground ring-offset-2'
                    : 'opacity-80 hover:opacity-100'
                  }
                `}
                style={{ backgroundColor: STAFF_COLORS[staff.name] }}
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
          className="mb-4 md:mb-6 flex gap-1 md:gap-2 border-b-2 border-border"
        >
          <button
            onClick={() => setActiveTab('schedule')}
            className={`
              px-3 md:px-6 py-2 md:py-3 transition-all relative text-sm md:text-base
              ${activeTab === 'schedule' ? 'opacity-100' : 'opacity-50 hover:opacity-75'}
            `}
          >
            <div className="flex items-center gap-1.5 md:gap-2">
              <CalendarIcon className="w-4 h-4 md:w-5 md:h-5" />
              <span>Schedule</span>
            </div>
            {activeTab === 'schedule' && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground"
              />
            )}
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`
              px-3 md:px-6 py-2 md:py-3 transition-all relative text-sm md:text-base
              ${activeTab === 'analytics' ? 'opacity-100' : 'opacity-50 hover:opacity-75'}
            `}
          >
            <div className="flex items-center gap-1.5 md:gap-2">
              <TrendingUp className="w-4 h-4 md:w-5 md:h-5" />
              <span>Analytics</span>
            </div>
            {activeTab === 'analytics' && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground"
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
              <div className="bg-card border-2 border-border rounded-xl p-3 md:p-6">
                <h2 className="text-xl md:text-2xl mb-4 md:mb-6" style={{ fontFamily: 'var(--font-display)' }}>
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
              <ShiftMates
                selectedDate={selectedDate}
                schedule={schedule}
                selectedStaff={selectedStaff}
              />
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
          className="mt-8 bg-card border-2 border-border rounded-xl p-4 md:p-6"
        >
          <h3 className="mb-4" style={{ fontFamily: 'var(--font-display)' }}>
            Staff Color Codes
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 md:gap-4">
            {STAFF_CONFIG.map(staff => (
              <div key={staff.name} className="flex items-center gap-2">
                <div
                  className="w-6 h-6 md:w-8 md:h-8 rounded"
                  style={{ backgroundColor: STAFF_COLORS[staff.name] }}
                />
                <div className="text-sm md:text-base">{staff.name}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}