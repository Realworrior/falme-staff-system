import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  TrendingUp,
  Shield,
  ShieldAlert,
  Upload,
  Clock,
  Printer,
  X,
} from 'lucide-react';
import { format } from 'date-fns';
import { ScheduleCalendar } from './components/ScheduleCalendar';
import { ShiftMates } from './components/ShiftMates';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { ImportModal } from './components/ImportModal';
import {
  STAFF_CONFIG,
  STAFF_COLORS,
  generateMonthSchedule,
  calculateMonthlyAnalytics,
  getCurrentShiftType,
} from './utils/scheduleGenerator';
import { useFirebaseData } from '../../hooks/useFirebase';

export default function App() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 3, 1));
  const [selectedStaff, setSelectedStaff] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'schedule' | 'analytics'>('schedule');
  const [isManagerMode, setIsManagerMode] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const { data: rawOverrides, updateRecord } = useFirebaseData('rotaOverrides', {});

  const overrides = useMemo(() => {
    if (rawOverrides && typeof rawOverrides === 'object' && !Array.isArray(rawOverrides)) {
      return rawOverrides as Record<string, Record<string, any>>;
    }
    return {};
  }, [rawOverrides]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const schedule = useMemo(() => generateMonthSchedule(year, month, overrides), [year, month, overrides]);
  const analytics = useMemo(() => calculateMonthlyAnalytics(year, month, overrides), [year, month, overrides]);

  const currentShiftType = useMemo(() => getCurrentShiftType(), []);
  const todayKey = format(new Date(), 'yyyy-MM-dd');
  const currentStaffOnShift = useMemo(() => {
    const today = schedule.find(d => format(d.date, 'yyyy-MM-dd') === todayKey);
    return today ? today.shifts[currentShiftType as 'AM' | 'PM' | 'NT'] : [];
  }, [schedule, todayKey, currentShiftType]);

  const handlePrevMonth = () => { setCurrentDate(new Date(year, month - 1, 1)); setSelectedDate(null); };
  const handleNextMonth = () => { setCurrentDate(new Date(year, month + 1, 1)); setSelectedDate(null); };

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    setIsShiftModalOpen(true);
  };

  const handleOverride = async (date: string, staff: string, type: string) => {
    await updateRecord(date, { [staff]: type });
  };

  const handleBulkImport = async (data: Record<string, Record<string, string>>) => {
    await Promise.all(Object.entries(data).map(([date, staffOverrides]) => updateRecord(date, staffOverrides)));
  };

  return (
    <div className="min-h-screen bg-background p-3 md:p-6 lg:p-8 print:p-0">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 md:mb-10 print:hidden"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
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
            <button
              onClick={() => window.print()}
              className="p-4 bg-white/5 border border-white/5 rounded-2xl text-gray-400 hover:text-white transition-all"
              title="Print schedule"
            >
              <Printer size={20} />
            </button>
          </div>
          <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.3em] font-heading mt-4">
            Synchronized Operational Schedule & Resource Analytics
          </p>
        </motion.header>

        {/* Live Operations Panel */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4 print:hidden"
        >
          {/* Current Shift */}
          <div className="bg-[#0f0f17] border border-white/5 rounded-3xl p-5 flex items-center gap-5 shadow-xl relative overflow-hidden group">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${
              currentShiftType === 'AM' ? 'bg-orange-500/20 text-orange-400' :
              currentShiftType === 'PM' ? 'bg-emerald-500/20 text-emerald-400' :
              'bg-indigo-500/20 text-indigo-400'
            }`}>
              <Clock size={28} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-500">Live Session</p>
                <span className="text-[8px] bg-white/5 px-1.5 py-0.5 rounded text-gray-600 font-bold border border-white/5">v1.2.0</span>
              </div>
              <h4 className="text-xl font-black text-white uppercase tracking-tight font-heading">{currentShiftType} Active</h4>
            </div>
          </div>

          {/* Staff on Duty */}
          <div className="bg-[#0f0f17] border border-white/5 rounded-3xl p-5 shadow-xl">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-500 mb-3">Personnel On Duty</p>
            <div className="flex flex-wrap gap-2">
              {currentStaffOnShift.map(name => (
                <span key={name} className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 text-white text-[11px] font-bold flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: STAFF_COLORS[name] }} />
                  {name}
                </span>
              ))}
              {currentStaffOnShift.length === 0 && <span className="text-gray-600 text-[10px] italic">None assigned</span>}
            </div>
          </div>

          {/* Admin Controls */}
          <div className="bg-[#0f0f17] border border-white/5 rounded-3xl p-5 flex items-center justify-between shadow-xl">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsManagerMode(v => !v)}
                className={`p-3 rounded-2xl transition-all flex-shrink-0 ${
                  isManagerMode ? 'bg-red-600 text-white shadow-lg shadow-red-500/30' : 'bg-white/5 text-gray-500 hover:bg-white/10'
                }`}
              >
                {isManagerMode ? <ShieldAlert size={20} /> : <Shield size={20} />}
              </button>
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-600">Access Tier</p>
                <h5 className="text-sm font-black text-white uppercase tracking-tight">
                  {isManagerMode ? 'Manager Mode' : 'Read Only'}
                </h5>
              </div>
            </div>
            {isManagerMode && (
              <motion.button
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={() => setIsImportModalOpen(true)}
                className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest transition-all"
              >
                <Upload size={14} className="text-red-500" />
                Import
              </motion.button>
            )}
          </div>
        </motion.div>

        {/* Month Nav + Staff Filter */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 flex flex-col xl:flex-row gap-6 items-start xl:items-center justify-between print:hidden"
        >
          <div className="flex items-center gap-3 bg-[#0f0f17] border border-white/5 p-2 rounded-2xl shadow-xl">
            <button onClick={handlePrevMonth} className="p-3 hover:text-white text-gray-500 bg-white/5 hover:bg-white/10 rounded-xl transition-all active:scale-95">
              <ChevronLeft size={20} />
            </button>
            <div className="min-w-[160px] text-center">
              <div className="text-lg font-black text-white uppercase tracking-wider font-heading">
                {format(currentDate, 'MMMM yyyy')}
              </div>
            </div>
            <button onClick={handleNextMonth} className="p-3 hover:text-white text-gray-500 bg-white/5 hover:bg-white/10 rounded-xl transition-all active:scale-95">
              <ChevronRight size={20} />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedStaff(null)}
              className={`px-5 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
                !selectedStaff ? 'accent-gradient text-white shadow-lg shadow-red-500/20' : 'bg-white/5 text-gray-500 border border-white/5 hover:text-white hover:bg-white/10'
              }`}
            >
              All Staff
            </button>
            {STAFF_CONFIG.map(staff => (
              <button
                key={staff.name}
                onClick={() => setSelectedStaff(staff.name)}
                className={`px-4 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all border ${
                  selectedStaff === staff.name ? 'text-white shadow-lg' : 'border-transparent text-gray-500 bg-white/2 hover:bg-white/5 hover:text-gray-300'
                }`}
                style={{
                  backgroundColor: selectedStaff === staff.name ? STAFF_COLORS[staff.name] : undefined,
                  borderColor: selectedStaff === staff.name ? 'rgba(255,255,255,0.2)' : undefined,
                }}
              >
                {staff.name}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Tab Nav */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="mb-8 flex gap-4 border-b border-white/5 print:hidden"
        >
          {[
            { key: 'schedule', label: 'Schedule Matrix', icon: CalendarIcon },
            { key: 'analytics', label: 'Impact Analytics', icon: TrendingUp },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as any)}
              className={`pb-4 px-2 transition-all relative ${activeTab === key ? 'text-white' : 'text-gray-600 hover:text-gray-400'}`}
            >
              <div className="flex items-center gap-2.5">
                <Icon size={16} className={activeTab === key ? 'text-red-500' : ''} />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] font-heading">{label}</span>
              </div>
              {activeTab === key && (
                <motion.div layoutId="activeTab" className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-red-600 shadow-[0_0_10px_rgba(220,38,38,0.5)]" />
              )}
            </button>
          ))}
        </motion.div>

        {/* Main Content */}
        {activeTab === 'schedule' ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
            <div className="bg-[#0f0f17] border border-white/5 rounded-3xl shadow-2xl p-4 md:p-8 print:bg-white">
              <div className="flex items-center justify-between mb-6 md:mb-8 print:mb-4">
                <div>
                  <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-tighter font-heading print:text-black">
                    Monthly Schedule
                  </h2>
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-500 mt-1 print:hidden">
                    Tap a date to view team allocation
                  </p>
                </div>
                <div className="flex items-center gap-3 print:hidden">
                  {[
                    { id: 'AM', color: '#FF6B35' },
                    { id: 'PM', color: '#4ECDC4' },
                    { id: 'NT', color: '#6366F1' },
                  ].map(s => (
                    <div key={s.id} className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                      <span className="text-[9px] font-black uppercase text-gray-500">{s.id}</span>
                    </div>
                  ))}
                </div>
              </div>
              <ScheduleCalendar
                schedule={schedule}
                selectedStaff={selectedStaff}
                onDayClick={handleDayClick}
              />
            </div>

            {/* Legend */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-6 bg-[#0f0f17] border border-white/5 rounded-3xl p-4 md:p-6 shadow-xl print:hidden"
            >
              <h3 className="mb-4 text-white text-sm font-black uppercase tracking-widest">Staff Color Legend</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {STAFF_CONFIG.map(staff => (
                  <div key={staff.name} className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg flex-shrink-0" style={{ backgroundColor: STAFF_COLORS[staff.name] }} />
                    <span className="text-sm text-gray-300 truncate">{staff.name}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
            <AnalyticsDashboard analytics={analytics} />
          </motion.div>
        )}

        {/* Shift Detail Modal (popup on date click) */}
        <AnimatePresence>
          {isShiftModalOpen && selectedDate && (
            <>
              {/* Backdrop */}
              <motion.div
                key="modal-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsShiftModalOpen(false)}
                className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
              />
              {/* Panel */}
              <motion.div
                key="modal-panel"
                initial={{ opacity: 0, scale: 0.92, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, y: 20 }}
                transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                className="fixed z-50 inset-x-4 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 top-[10vh] md:w-[480px] max-h-[80vh] overflow-y-auto"
              >
                <ShiftMates
                  selectedDate={selectedDate}
                  schedule={schedule}
                  selectedStaff={selectedStaff}
                  isManagerMode={isManagerMode}
                  onOverride={handleOverride}
                  overrides={overrides}
                  onClose={() => setIsShiftModalOpen(false)}
                />
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Bulk Import Modal */}
        <ImportModal
          isOpen={isImportModalOpen}
          onClose={() => setIsImportModalOpen(false)}
          onImport={handleBulkImport}
        />
      </div>
    </div>
  );
}