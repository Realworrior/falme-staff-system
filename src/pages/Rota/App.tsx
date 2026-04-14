import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  TrendingUp,
  Shield, 
  ShieldAlert, 
  Upload, 
  Clock, 
  Eye,
  ArrowRight,
  Printer
} from 'lucide-react';
import { format } from 'date-fns';
import { ScheduleCalendar } from './components/ScheduleCalendar';
import { ShiftMates } from './components/ShiftMates';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { 
  STAFF_CONFIG, 
  STAFF_COLORS, 
  generateMonthSchedule, 
  calculateMonthlyAnalytics,
  getCurrentShiftType
} from './utils/scheduleGenerator';
import { useFirebaseData } from '../../hooks/useFirebase';
import { ImportModal } from './components/ImportModal';

export default function App() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 3, 1)); // April 2026
  const [selectedStaff, setSelectedStaff] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [activeTab, setActiveTab] = useState<'schedule' | 'analytics'>('schedule');
  const [isManagerMode, setIsManagerMode] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Fetch Overrides from Firebase
  const { data: rawOverrides, updateRecord } = useFirebaseData('rotaOverrides', {});
  
  const overrides = useMemo(() => {
    const map: Record<string, Record<string, any>> = {};
    if (Array.isArray(rawOverrides)) {
      rawOverrides.forEach(item => {
        if (item.date && item.staff) {
          if (!map[item.date]) map[item.date] = {};
          map[item.date][item.staff] = item.type;
        }
      });
    } else if (rawOverrides && typeof rawOverrides === 'object') {
       return rawOverrides as any;
    }
    return map;
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

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDate(null);
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDate(null);
  };

  const handleOverride = async (date: string, staff: string, type: string) => {
    await updateRecord(date, { [staff]: type });
  };

  const handleBulkImport = async (data: Record<string, Record<string, string>>) => {
    const promises = Object.entries(data).map(([date, staffOverrides]) => 
      updateRecord(date, staffOverrides)
    );
    await Promise.all(promises);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-background p-3 md:p-6 lg:p-8 print:p-0">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 md:mb-12 print:hidden"
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
              onClick={handlePrint}
              className="p-4 bg-white/5 border border-white/5 rounded-2xl text-gray-400 hover:text-white transition-all shadow-xl"
            >
              <Printer size={20} />
            </button>
          </div>
          <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.3em] font-heading mt-4">
            Synchronized Operational Schedule & Resource Analytics
          </p>
        </motion.header>

        {/* Live Operations & Status */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.05 }}
          className="mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 print:hidden"
        >
          {/* Active Shift Indicator */}
          <div className="bg-[#0f0f17] border border-white/5 rounded-3xl p-5 flex items-center gap-5 shadow-2xl relative overflow-hidden group">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${
              currentShiftType === 'AM' ? 'bg-orange-500/20 text-orange-500 shadow-orange-500/10' :
              currentShiftType === 'PM' ? 'bg-emerald-500/20 text-emerald-500 shadow-emerald-500/10' :
              'bg-indigo-500/20 text-indigo-500 shadow-indigo-500/10'
            }`}>
              <Clock size={28} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Live Operation Mode</p>
              <h4 className="text-xl font-black text-white uppercase tracking-tighter font-heading mt-1">
                {currentShiftType} Session Active
              </h4>
            </div>
          </div>

          {/* Personnel on Duty */}
          <div className="bg-[#0f0f17] border border-white/5 rounded-3xl p-5 shadow-2xl overflow-hidden">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-3 ml-1">Personnel On Duty</p>
            <div className="flex flex-wrap gap-2">
              {currentStaffOnShift.map(name => (
                <span 
                  key={name} 
                  className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 text-white text-[11px] font-bold flex items-center gap-2"
                >
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: STAFF_COLORS[name] }} />
                  {name}
                </span>
              ))}
              {currentStaffOnShift.length === 0 && <span className="text-gray-700 text-[10px] italic">Zero Occupancy</span>}
            </div>
          </div>

          {/* Admin Controls */}
          <div className="bg-black/20 border border-white/5 rounded-3xl p-5 flex items-center justify-between shadow-xl">
             <div className="flex items-center gap-4">
                <button 
                  onClick={() => setIsManagerMode(!isManagerMode)}
                  className={`p-3 rounded-2xl transition-all ${
                    isManagerMode 
                      ? 'bg-red-600 text-white shadow-lg shadow-red-500/30' 
                      : 'bg-white/5 text-gray-500 border border-white/5 hover:bg-white/10'
                  }`}
                >
                  {isManagerMode ? <ShieldAlert size={20} /> : <Shield size={20} />}
                </button>
                <div>
                   <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-600">Access Tier</p>
                   <h5 className="text-sm font-black text-white uppercase tracking-tight">{isManagerMode ? 'Managed Session' : 'ReadOnly View'}</h5>
                </div>
             </div>
             {isManagerMode && (
               <motion.button
                 initial={{ opacity: 0, x: 20 }}
                 animate={{ opacity: 1, x: 0 }}
                 onClick={() => setIsImportModalOpen(true)}
                 className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest transition-all"
               >
                 <Upload size={16} className="text-red-500" />
                 Import
               </motion.button>
             )}
          </div>
        </motion.div>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-10 flex flex-col xl:flex-row gap-6 items-start xl:items-center justify-between print:hidden"
        >
          {/* Month Navigation */}
          <div className="flex items-center gap-4 bg-[#0f0f17] border border-white/5 p-2 rounded-2xl shadow-xl">
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

          {/* Staff Filter */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedStaff(null)}
              className={`px-5 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all
                ${!selectedStaff ? 'accent-gradient text-white shadow-lg shadow-red-500/20' : 'bg-white/5 text-gray-500 border border-white/5 hover:text-white hover:bg-white/10'}
              `}
            >
              Universal View
            </button>
            {STAFF_CONFIG.map(staff => (
              <button
                key={staff.name}
                onClick={() => setSelectedStaff(staff.name)}
                className={`px-4 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all border
                  ${selectedStaff === staff.name ? 'border-white text-white shadow-lg' : 'border-transparent text-gray-500 bg-white/2 hover:bg-white/5 hover:text-gray-300'}
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
          className="mb-8 flex gap-4 border-b border-white/5 print:hidden"
        >
          <button
            onClick={() => setActiveTab('schedule')}
            className={`pb-4 px-2 transition-all relative ${activeTab === 'schedule' ? 'text-white' : 'text-gray-600 hover:text-gray-400'}`}
          >
            <div className="flex items-center gap-2.5">
              <CalendarIcon size={16} className={activeTab === 'schedule' ? 'text-red-500' : ''} />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] font-heading">Schedule Matrix</span>
            </div>
            {activeTab === 'schedule' && (
              <motion.div layoutId="activeTab" className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-red-600 shadow-[0_0_10px_rgba(220,38,38,0.5)]" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`pb-4 px-2 transition-all relative ${activeTab === 'analytics' ? 'text-white' : 'text-gray-600 hover:text-gray-400'}`}
          >
            <div className="flex items-center gap-2.5">
              <TrendingUp size={16} className={activeTab === 'analytics' ? 'text-red-500' : ''} />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] font-heading">Impact Analytics</span>
            </div>
            {activeTab === 'analytics' && (
              <motion.div layoutId="activeTab" className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-red-600 shadow-[0_0_10px_rgba(220,38,38,0.5)]" />
            )}
          </button>
        </motion.div>

        {/* Content */}
        {activeTab === 'schedule' ? (
          <div className="w-full">
            {/* Calendar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="bg-[#0f0f17] border border-white/5 rounded-[40px] shadow-2xl p-4 md:p-10 print:bg-white print:text-black print:border-black">
                <div className="flex items-center justify-between mb-8 md:mb-12 print:mb-4">
                  <div>
                    <h2 className="text-2xl md:text-3xl font-black text-white print:text-black uppercase tracking-tighter font-heading">
                      Monthly Operations Matrix
                    </h2>
                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] mt-1 print:hidden">Global Resource Synchronization</p>
                  </div>
                  <div className="flex items-center gap-3 print:hidden">
                    <div className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-600">Dynamic Scaling Active</div>
                    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                  </div>
                </div>
                <ScheduleCalendar
                  schedule={schedule}
                  selectedStaff={selectedStaff}
                  onDayClick={(date) => {
                    setSelectedDate(date);
                  }}
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

        {/* Shift Details Modal */}
        <Dialog open={!!selectedDate} onOpenChange={(open) => !open && setSelectedDate(null)}>
          <DialogContent className="bg-transparent border-none shadow-none max-w-2xl p-0">
             <ShiftMates
               selectedDate={selectedDate}
               schedule={schedule}
               selectedStaff={selectedStaff}
               isManagerMode={isManagerMode}
               onOverride={handleOverride}
               overrides={overrides}
               onClose={() => setSelectedDate(null)}
             />
          </DialogContent>
        </Dialog>

        <ImportModal
          isOpen={isImportModalOpen}
          onClose={() => setIsImportModalOpen(false)}
          onImport={handleBulkImport}
        />

        {/* Legend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 bg-[#0f0f17] border border-white/5 rounded-3xl p-4 md:p-6 shadow-xl print:hidden"
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