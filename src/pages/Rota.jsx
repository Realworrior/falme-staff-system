import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import emailjs from '@emailjs/browser';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  TrendingUp,
  Shield,
  ShieldAlert,
  Upload,
  Clock,
  X,
  Truck,
  Database
} from 'lucide-react';
import { format, addDays } from 'date-fns';
import { ScheduleCalendar } from '../components/Rota/ScheduleCalendar';
import { ShiftMates } from '../components/Rota/ShiftMates';
import { AnalyticsDashboard } from '../components/Rota/AnalyticsDashboard';
import { ImportModal } from '../components/Rota/ImportModal';
import { TransportDashboard } from '../components/Rota/TransportDashboard';
import { 
  STAFF_CONFIG, 
  STAFF_COLORS, 
  generateMonthSchedule, 
  calculateMonthlyAnalytics,
} from '../utils/Rota/scheduleGenerator';
import { useSupabaseData } from '../context/SupabaseDataContext';
import { exportScheduleToCSV, downloadCSV } from '../utils/Rota/RotaExportUtility';
import { useToast } from '../context/ToastContext';

// Standardized Shift Times (Cross-Platform)
const SHIFTS = [
  { id: 'AM', label: 'Morning Shift', time: '07:30 – 15:30', color: '#3d7ee6' },
  { id: 'PM', label: 'Afternoon Shift', time: '15:30 – 22:30', color: '#28a87c' },
  { id: 'NT', label: 'Night Shift', time: '22:30 – 07:30', color: '#7a56d4' }
];

const generateICSContent = (staffName, currentDate, schedule) => {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  const ics = [];
  ics.push('BEGIN:VCALENDAR');
  ics.push('VERSION:2.0');
  ics.push('PRODID:-//Falme AI//Rota Sync//EN');
  ics.push('CALSCALE:GREGORIAN');
  ics.push('METHOD:PUBLISH');
  ics.push(`X-WR-CALNAME:Falme Rota - ${staffName}`);
  ics.push('X-WR-TIMEZONE:Africa/Nairobi');

  schedule.forEach((day) => {
    let shiftType = null;
    if (day.shifts.AM.includes(staffName)) shiftType = 'AM';
    else if (day.shifts.PM.includes(staffName)) shiftType = 'PM';
    else if (day.shifts.NT.includes(staffName)) shiftType = 'NT';

    if (!shiftType) return;

    const meta = SHIFTS.find(s => s.id === shiftType);
    const dateStr = format(day.date, 'yyyyMMdd');
    const color = meta.color;
    
    const startHour = shiftType === 'AM' ? '073000' : shiftType === 'PM' ? '153000' : '223000';
    const endHour = shiftType === 'AM' ? '153000' : shiftType === 'PM' ? '223000' : '073000';
    
    let endDateStr = dateStr;
    if (shiftType === 'NT') {
      endDateStr = format(addDays(day.date, 1), 'yyyyMMdd');
    }

    ics.push('BEGIN:VEVENT');
    ics.push(`UID:${dateStr}-${shiftType}-${staffName.replace(/\s+/g, '')}@falme.ai`);
    ics.push(`DTSTAMP:${format(new Date(), "yyyyMMdd'T'HHmmss'Z'")}`);
    ics.push(`DTSTART;TZID=Africa/Nairobi:${dateStr}T${startHour}`);
    ics.push(`DTEND;TZID=Africa/Nairobi:${endDateStr}T${endHour}`);
    ics.push(`SUMMARY:${shiftType} Shift - Falme`);
    ics.push(`DESCRIPTION:Scheduled shift for ${staffName}. Time: ${meta.time}`);
    ics.push('LOCATION:Main Operations Center');
    ics.push('STATUS:CONFIRMED');
    ics.push('TRANSP:OPAQUE');
    ics.push('PRIORITY:5');
    ics.push(`X-APPLE-CALENDAR-COLOR:${color}`);
    
    if (shiftType === 'AM') ics.push('COLOR:Turquoise');
    else if (shiftType === 'PM') ics.push('COLOR:DodgerBlue');
    else ics.push('COLOR:Orange');

    ics.push('BEGIN:VALARM');
    ics.push('TRIGGER:-PT1H');
    ics.push('ACTION:DISPLAY');
    ics.push(`DESCRIPTION:Reminder: Your ${shiftType} shift starts in 1 hour`);
    ics.push('END:VALARM');
    ics.push('END:VEVENT');
  });

  ics.push('END:VCALENDAR');
  return ics.join('\r\n');
};

export default function RotaPage() {
  const { overrides: rawOverrides, loading: globalLoading, actions, user } = useSupabaseData();
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Role-based state initialization
  const isManagerModeInitial = user?.role === 'technician';
  const [isManagerMode, setIsManagerMode] = useState(isManagerModeInitial);
  const [activeTab, setActiveTab] = useState(isManagerModeInitial ? 'matrix' : 'rota');
  const [selectedStaff, setSelectedStaff] = useState(isManagerModeInitial ? null : (user?.name || null));
  
  const [selectedDate, setSelectedDate] = useState(null);
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isManagerLoginOpen, setIsManagerLoginOpen] = useState(false);
  const [managerPassword, setManagerPassword] = useState('');
  const [desktopView, setDesktopView] = useState("grid");
  const { showToast } = useToast();

  const [isReady, setIsReady] = useState(false);
  const loading = globalLoading.overrides;

  // Sync state if user changes
  useEffect(() => {
    if (user) {
      const isTech = user.role === 'technician';
      setIsManagerMode(isTech);
      if (!isTech) {
        setActiveTab('rota');
        if (!selectedStaff) setSelectedStaff(user.name);
      }
    }
  }, [user]);

  useEffect(() => {
    const timer = setTimeout(() => setIsReady(true), 150);
    return () => clearTimeout(timer);
  }, []);

  const transportConfig = useMemo(() => {
    const config = (rawOverrides && rawOverrides['config_transport']) || {};
    return {
      rates: config.rates || {},
      history: config.history || []
    };
  }, [rawOverrides]);

  const handleSaveTransportRates = async (rates) => {
    try {
      const currentConfig = (rawOverrides && rawOverrides['config_transport']) || {};
      await actions.updateRecord('rota_overrides', 'config_transport', { 
        ...currentConfig,
        rates 
      });
      showToast('Transport rates updated', 'success');
    } catch (err) {
      showToast('Failed to save rates', 'error');
    }
  };

  const handleProcessPayment = async (payment) => {
    try {
      const currentConfig = (rawOverrides && rawOverrides['config_transport']) || {};
      const history = [payment, ...(currentConfig.history || [])].slice(0, 50);
      await actions.updateRecord('rota_overrides', 'config_transport', {
        ...currentConfig,
        history
      });
      showToast('Payment milestone recorded', 'success');
    } catch (err) {
      showToast('Failed to record payment', 'error');
    }
  };

  const overrides = useMemo(() => {
    if (!isReady || !rawOverrides) return {};
    const mapped = {};
    const items = Array.isArray(rawOverrides) ? rawOverrides : Object.values(rawOverrides);
    items.forEach((item) => {
      const key = item.date || item.id;
      if (key) mapped[key] = item.shifts || item;
    });
    return mapped;
  }, [isReady, rawOverrides]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const schedule = useMemo(() => {
    if (!isReady) return [];
    return generateMonthSchedule(year, month, overrides);
  }, [year, month, overrides, isReady]);

  const analytics = useMemo(() => {
    if (!isReady) return null;
    return calculateMonthlyAnalytics(year, month, overrides);
  }, [year, month, overrides, isReady]);

  const handlePrevMonth = () => { setCurrentDate(new Date(year, month - 1, 1)); setSelectedDate(null); };
  const handleNextMonth = () => { setCurrentDate(new Date(year, month + 1, 1)); setSelectedDate(null); };

  const handleDayClick = (date) => {
    setSelectedDate(date);
    setIsShiftModalOpen(true);
  };

  const handleOverride = async (date, staff, type) => {
    await actions.updateRecord('rota_overrides', date, { shifts: { [staff]: type } });
  };

  const handleBulkImport = async (data, shouldReplace = false) => {
    const entries = Object.entries(data);
    if (entries.length === 0) return;
    try {
      showToast(shouldReplace ? 'Executing Full Matrix Wipe & Sync...' : 'Merging Matrix Data...', 'info');
      const updatesMap = {};
      entries.forEach(([date, staffOverrides]) => {
        let finalShifts = staffOverrides;
        if (shouldReplace) {
          finalShifts = {};
          STAFF_CONFIG.forEach(staff => {
            finalShifts[staff.name] = staffOverrides[staff.name] || 'OFF';
          });
        }
        updatesMap[date] = { date, shifts: finalShifts };
      });
      await actions.bulkUpdateRecords('rota_overrides', updatesMap, shouldReplace);
      showToast('Matrix Synchronization Complete', 'success');
    } catch (err) {
      showToast('Synchronization Failed', 'error');
    }
  };

  const handleExportCalendar = () => {
    if (!selectedStaff) return;
    const icsContent = generateICSContent(selectedStaff, currentDate, schedule);
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${selectedStaff.replace(/\s+/g, '_')}_Rota_${format(currentDate, 'MMM_yyyy')}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Calendar Sync File Generated', 'success');
  };

  const handleExportCSV = () => {
    const csvContent = exportScheduleToCSV(schedule, year, month);
    downloadCSV(csvContent, `Rota_Export_${format(currentDate, 'MMM_yyyy')}.csv`);
    showToast('CSV Export Ready', 'success');
  };

  if (loading && !isReady) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 animate-pulse">Initializing Matrix...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#05050D] text-white font-sans selection:bg-blue-500/30">
      <div className="max-w-[1600px] mx-auto flex flex-col min-h-screen relative">
        
        {/* ── Top Command Bar ── */}
        <div className="sticky top-0 z-30 bg-[#05050D]/80 backdrop-blur-xl border-b border-white/5 px-4 py-6 md:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
                  <CalendarIcon size={18} className="text-white" />
                </div>
                <h1 className="text-2xl md:text-3xl font-black tracking-tighter uppercase font-heading">
                  Operational Matrix
                </h1>
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 flex items-center gap-2">
                <Shield size={10} className="text-blue-500" />
                {isManagerMode ? 'Admin Command Center' : 'Staff Schedule Portal'}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5">
                <button onClick={handlePrevMonth} className="p-2.5 hover:bg-white/5 rounded-xl transition-all text-gray-400 hover:text-white"><ChevronLeft size={20} /></button>
                <div className="px-6 flex flex-col items-center justify-center min-w-[140px]">
                  <span className="text-[10px] font-black uppercase tracking-widest text-blue-500 leading-none mb-1">{format(currentDate, 'yyyy')}</span>
                  <span className="text-lg font-black tracking-tighter uppercase leading-none">{format(currentDate, 'MMMM')}</span>
                </div>
                <button onClick={handleNextMonth} className="p-2.5 hover:bg-white/5 rounded-xl transition-all text-gray-400 hover:text-white"><ChevronRight size={20} /></button>
              </div>

              {!isManagerMode && (
                <button 
                  onClick={() => setIsManagerLoginOpen(true)}
                  className="p-3 rounded-2xl bg-white/5 border border-white/10 hover:border-blue-500/50 hover:bg-blue-500/10 transition-all text-gray-400 hover:text-blue-400 group"
                >
                  <ShieldAlert size={20} className="group-hover:scale-110 transition-transform" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── Personnel Selection (Admin Only or Staff Self) ── */}
        <div className="px-4 py-4 md:px-8 overflow-x-auto no-scrollbar bg-[#05050D] sticky top-[100px] md:top-[88px] z-20 border-b border-white/5">
          <div className="flex items-center min-w-max pb-2">
            <div className="flex items-center gap-2 mr-6">
              {isManagerMode ? (
                <>
                  <motion.button 
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedStaff(null)}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${!selectedStaff ? "bg-blue-600 border-blue-500 text-white shadow-xl" : "bg-white/5 border-white/10 text-gray-500"}`}
                  >
                    Entire Team
                  </motion.button>
                  <div className="w-[1px] h-4 bg-white/10 mx-1 hidden md:block"></div>
                  {STAFF_CONFIG.map(staff => (
                    <motion.button 
                      key={staff.name} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedStaff(staff.name)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all border ${selectedStaff === staff.name ? "bg-white/10 border-white/20 text-white shadow-xl" : "bg-transparent border-transparent text-gray-500 hover:bg-white/5"}`}
                    >
                      <div className={`w-2 h-2 rounded-full`} style={{ backgroundColor: STAFF_COLORS[staff.name], boxShadow: selectedStaff === staff.name ? `0 0 10px ${STAFF_COLORS[staff.name]}80` : 'none' }} />
                      <span className="text-[11px] font-bold tracking-tight">{staff.name}</span>
                    </motion.button>
                  ))}
                </>
              ) : (
                <div className="flex items-center gap-3">
                   <div className="px-4 py-2 rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-widest">
                     Personal Schedule: {user?.name || 'Authorized Operator'}
                   </div>
                </div>
              )}

              <AnimatePresence>
                {selectedStaff && (
                  <motion.button
                    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
                    onClick={handleExportCalendar}
                    className="ml-auto flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600 hover:text-white transition-all border border-emerald-500/30 group"
                  >
                    <CalendarIcon size={14} className="group-hover:rotate-12" /> 
                    <span className="text-[10px] font-black uppercase tracking-widest">Sync My Rota</span>
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* ── Tab Navigation ── */}
        <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5 m-4 md:mx-8 w-fit">
          <button
            onClick={() => setActiveTab(isManagerMode ? 'matrix' : 'rota')}
            className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${(['matrix', 'rota'].includes(activeTab)) ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
          >
            {isManagerMode ? 'Team Matrix' : 'Rota'}
          </button>
          {isManagerMode && (
            <>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'analytics' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
              >
                Trends
              </button>
              <button
                onClick={() => setActiveTab('transport')}
                className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'transport' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
              >
                Logistics
              </button>
              <button
                onClick={() => setActiveTab('admin')}
                className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'admin' ? 'bg-amber-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
              >
                System
              </button>
            </>
          )}
        </div>

        {/* ── Content Area ── */}
        <div className="flex-1 overflow-y-auto px-1 md:px-0">
          <div className="p-0 md:p-4 print:p-0">
            {['matrix', 'rota'].includes(activeTab) && (
              <ScheduleCalendar
                schedule={schedule}
                selectedStaff={selectedStaff}
                onDayClick={handleDayClick}
                overrides={overrides}
                desktopView={desktopView}
                year={year}
                month={month}
              />
            )}
            {activeTab === 'analytics' && isManagerMode && analytics && <AnalyticsDashboard analytics={analytics} />}
            {activeTab === 'transport' && isManagerMode && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="pb-12">
                <TransportDashboard 
                  schedule={schedule}
                  savedRates={transportConfig.rates}
                  paymentHistory={transportConfig.history}
                  onSaveRates={handleSaveTransportRates}
                  onPay={handleProcessPayment}
                />
              </motion.div>
            )}
            {activeTab === 'admin' && isManagerMode && (
               <div className="space-y-6 px-4 md:px-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-8 rounded-[40px] bg-white/[0.03] border border-white/10 group hover:border-blue-500/30 transition-all">
                       <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 mb-6 group-hover:scale-110 transition-transform">
                          <Upload size={24} />
                       </div>
                       <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-2">Matrix Synchronization</h3>
                       <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-6">Import operational data from Excel/CSV</p>
                       <button onClick={() => setIsImportModalOpen(true)} className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest transition-all">Launch Excel Sync</button>
                    </div>
                    <div className="p-8 rounded-[40px] bg-white/[0.03] border border-white/10 group hover:border-amber-500/30 transition-all">
                       <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 mb-6 group-hover:scale-110 transition-transform">
                          <Database size={24} />
                       </div>
                       <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-2">Record Export</h3>
                       <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-6">Export current schedule to raw CSV format</p>
                       <button onClick={handleExportCSV} className="w-full py-4 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white font-black uppercase tracking-widest transition-all">Download Dataset</button>
                    </div>
                  </div>
               </div>
            )}
          </div>
        </div>

        {/* Modals and Overlays */}
        <AnimatePresence>
          {isShiftModalOpen && selectedDate && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsShiftModalOpen(false)} className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" />
              <motion.div initial={{ opacity: 0, scale: 0.92, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.92, y: 20 }} className="fixed z-50 inset-x-4 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 top-[10vh] md:w-[480px]">
                <ShiftMates selectedDate={selectedDate} schedule={schedule} selectedStaff={selectedStaff} isManagerMode={isManagerMode} onOverride={handleOverride} overrides={overrides} onClose={() => setIsShiftModalOpen(false)} />
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <ImportModal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} onImport={handleBulkImport} year={year} month={month} allOverrides={overrides} />

        <AnimatePresence>
          {isManagerLoginOpen && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsManagerLoginOpen(false)} className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm" />
              <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="fixed z-[90] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-[400px] bg-[#0a0a0f] border border-white/10 p-8 rounded-[40px]">
                <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-2">Manager Access</h3>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-6">Enter Admin PIN</p>
                <input type="password" value={managerPassword} onChange={(e) => setManagerPassword(e.target.value)} placeholder="••••" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white text-center text-3xl tracking-[0.5em] focus:outline-none mb-6" />
                <button 
                  onClick={() => {
                    if (managerPassword === 'admin') {
                      setIsManagerMode(true);
                      setActiveTab('matrix');
                      setIsManagerLoginOpen(false);
                      setManagerPassword('');
                      showToast('Admin Mode Active', 'success');
                    } else {
                      showToast('Invalid PIN', 'error');
                    }
                  }}
                  className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest"
                >
                  Unlock
                </button>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
