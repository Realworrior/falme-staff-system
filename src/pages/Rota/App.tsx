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
} from 'lucide-react';
import { format, addDays } from 'date-fns';
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
import { useGlobalData } from '../../context/FirebaseDataContext';
import { exportScheduleToCSV, downloadCSV } from './utils/RotaExportUtility';
import { useToast } from '../../context/ToastContext';
import { ref, update, set } from 'firebase/database';
import { db } from '../../firebase';

// Helper to generate the ICS text with icons, mates, and reminders
const generateICSContent = (selectedStaff: string, currentDate: Date, schedule: any[]) => {
  if (!selectedStaff || !schedule.length) return '';

  let ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Falme AI//Staff Rota//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Falme Staff Rota'
  ];

  // Filter shifts specifically for this staff
  const staffSchedule = schedule.filter(day => 
    day.shifts.AM.includes(selectedStaff) || 
    day.shifts.PM.includes(selectedStaff) || 
    day.shifts.NT.includes(selectedStaff)
  ).filter(day => day.date.getMonth() === currentDate.getMonth());

  staffSchedule.forEach((day, index) => {
    const shiftType = day.shifts.AM.includes(selectedStaff) ? 'AM' :
                     day.shifts.PM.includes(selectedStaff) ? 'PM' : 'NT';
    
    const mates = day.shifts[shiftType].filter((n: string) => n !== selectedStaff);
    const icon = shiftType === 'AM' ? '☀️' : shiftType === 'PM' ? '🌇' : '🌑';
    
    let startStr, endStr;
    const d = format(day.date, 'yyyyMMdd');
    
    // Shift Times Pattern
    if (shiftType === 'AM') {
      startStr = `${d}T073000`;
      endStr = `${d}T153000`;
    } else if (shiftType === 'PM') {
      startStr = `${d}T153000`;
      endStr = `${d}T223000`;
    } else {
      // NT: 22:30 to 07:30 next day
      startStr = `${d}T223000`;
      const nextDay = format(addDays(day.date, 1), 'yyyyMMdd');
      endStr = `${nextDay}T073000`;
    }

    ics.push('BEGIN:VEVENT');
    ics.push(`UID:falme-rota-${selectedStaff}-${index}-${d}`);
    ics.push(`DTSTAMP:${format(new Date(), 'yyyyMMdd')}T000000Z`);
    ics.push(`SUMMARY:${icon} ${shiftType} Shift | ${selectedStaff}`);
    ics.push(`DTSTART;TZID=Africa/Nairobi:${startStr}`);
    ics.push(`DTEND;TZID=Africa/Nairobi:${endStr}`);
    ics.push(`DESCRIPTION:Shift Type: ${shiftType}\\nTime Context: ${icon}\\n\\nTeam Mates on Shift:\\n${mates.length ? mates.join(', ') : 'Solo Shift'}\\n\\nGenerated via Falme Rota Matrix.`);
    ics.push(`CATEGORIES:${shiftType},FalmeRota`);
    
    // Different colors via categories (supported by some clients)
    if (shiftType === 'AM') ics.push('COLOR:Turquoise');
    else if (shiftType === 'PM') ics.push('COLOR:DodgerBlue');
    else ics.push('COLOR:Orange');

    // 1-hour Reminder (VALARM)
    ics.push('BEGIN:VALARM');
    ics.push('TRIGGER:-PT1H');
    ics.push('ACTION:DISPLAY');
    ics.push('DESCRIPTION:Reminder: Your ${shiftType} shift starts in 1 hour');
    ics.push('END:VALARM');
    
    ics.push('END:VEVENT');
  });

  ics.push('END:VCALENDAR');
  return ics.join('\r\n');
};

// v4.5 - Atomic Sync Optimization
export default function App() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 3, 1));
  const [selectedStaff, setSelectedStaff] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
  const [isManagerMode, setIsManagerMode] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const { showToast } = useToast();

  const [isReady, setIsReady] = useState(false);
  const { overrides: rawOverrides, loading: globalLoading, actions } = useGlobalData();
  const loading = globalLoading.overrides;

  useEffect(() => {
    const timer = setTimeout(() => setIsReady(true), 150);
    return () => clearTimeout(timer);
  }, []);

  const overrides = useMemo(() => {
    if (!isReady || !rawOverrides) return {};
    if (Array.isArray(rawOverrides)) {
      const mapped: Record<string, Record<string, any>> = {};
      rawOverrides.forEach(item => {
        if (typeof item === 'object' && item !== null) {
          const { firebaseKey, id, ...rest } = item;
          if (firebaseKey || id) {
            mapped[firebaseKey || id] = rest;
          }
        }
      });
      return mapped;
    }
    if (typeof rawOverrides === 'object') {
      return rawOverrides as Record<string, Record<string, any>>;
    }
    return {};
  }, [rawOverrides, isReady]);

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

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    setIsShiftModalOpen(true);
  };

  const handleOverride = async (date: string, staff: string, type: string) => {
    await actions.updateRecord('rotaOverrides', date, { [staff]: type });
  };

  const handleBulkImport = async (data: Record<string, Record<string, string>>, shouldReplace: boolean = false) => {
    const entries = Object.entries(data);
    if (entries.length === 0) return;

    try {
      const promises = entries.map(([date, staffOverrides]) => {
        const dateRef = ref(db, `rotaOverrides/${date}`);
        if (shouldReplace) {
          // Atomic full replace for this date node
          return set(dateRef, staffOverrides);
        } else {
          // Atomic merge for specific staff within this date
          return update(dateRef, staffOverrides);
        }
      });
      await Promise.all(promises);
      showToast('Rota specialized update complete', 'success');
    } catch (err) {
      console.error('Bulk import error:', err);
      showToast('Import failed - check console', 'error');
    }
  };

  const handleExport = () => {
    const csv = exportScheduleToCSV(schedule);
    const fileName = `Rota_${format(currentDate, 'MMM_yyyy')}.csv`;
    downloadCSV(csv, fileName);
  };

  const handleExportCalendar = () => {
    if (!selectedStaff || !schedule.length) {
      showToast('Please select a specific staff member first', 'info');
      return;
    }
    setIsEmailModalOpen(true);
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userEmail) {
      showToast('Please enter an email address', 'error');
      return;
    }

    setIsSendingEmail(true);

    try {
      const icsContent = generateICSContent(selectedStaff!, currentDate, schedule);

      // Passing raw ICS text so Apple Mail/Outlook can organically parse it into an 'Add' button, 
      // avoiding EmailJS free-tier strict attachment rejection policies.
      await emailjs.send(
        'service_0o0jqak', 
        'template_ycf6b1s', 
        {
          to_email: userEmail, // Standard
          email: userEmail,    // Fallback
          staff_name: selectedStaff,
          message: `Hello ${selectedStaff},\n\nYour premium Falme schedule is ready. If your mail client supports it, an 'Add to Calendar' button will appear automatically.\n\nOtherwise, just save the block below as a .ics file:\n\n${icsContent}`
        }, 
        'wOtZkUT4QoW_MzUGh'
      );

      showToast(`Calendar sent directly to ${userEmail}!`, 'success');
      setIsEmailModalOpen(false);
      setUserEmail('');
    } catch (err: any) {
      console.error("EmailJS Error:", err);
      // Surface exact EmailJS error text to the UI to hint if attachment isn't mapped
      const errorMsg = err?.text || 'Review Dashboard Attachment Variable mapping';
      showToast(`Email API failed: ${errorMsg}`, 'error');
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleDirectDownload = () => {
    if (!selectedStaff) return;
    const icsContent = generateICSContent(selectedStaff, currentDate, schedule);
    const fileName = `Falme_Rota_${selectedStaff.replace(/\s+/g, '_')}_${format(currentDate, 'MMM_yyyy')}.ics`;
    
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Direct download triggered for ${selectedStaff}`, 'success');
    setIsEmailModalOpen(false);
  };

  const handleNativeShare = async () => {
    const icsContent = generateICSContent(selectedStaff!, currentDate, schedule);
    const fileName = `Falme_Rota_${selectedStaff!.replace(/\s+/g, '_')}_${format(currentDate, 'MMM_yyyy')}.ics`;
    const file = new File([icsContent], fileName, { type: 'text/calendar' });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          title: 'Falme Rota Calendar',
          text: `Here is the shift schedule for ${selectedStaff}.`,
          files: [file]
        });
        showToast('Shared successfully!', 'success');
        setIsEmailModalOpen(false);
      } catch (err) {
        console.error('Share rejected or failed:', err);
      }
    } else {
      handleDirectDownload();
    }
  };

  const handleManagerToggle = () => {
    if (isManagerMode) {
      setIsManagerMode(false);
    } else {
      const pass = prompt('Enter Manager Password (hint: admin):');
      if (pass && pass.trim().toLowerCase() === 'admin') {
        setIsManagerMode(true);
      } else {
        alert('Access Denied. The password is "admin"');
      }
    }
  };

  if (loading || !isReady) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-20 min-h-[60vh] bg-background">
        <div className="w-16 h-16 relative">
          <div className="absolute inset-0 border-4 border-white/5 rounded-full" />
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 border-4 border-red-500 border-t-transparent rounded-full"
          />
        </div>
        <p className="mt-6 text-[10px] font-black uppercase tracking-[0.4em] text-gray-500 animate-pulse">Synchronizing Team Matrix</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-background px-1 md:px-3 py-6 print:p-0">
      <div className="max-w-[1600px] mx-auto">

        {/* Compact Header & Navigation */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl accent-gradient flex items-center justify-center shadow-lg shadow-red-500/20">
              <CalendarIcon size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black text-white tracking-widest uppercase font-heading leading-tight">
                Staff Rota
              </h1>
              <div className="text-[8px] font-black uppercase tracking-[0.3em] text-red-500">Live Management</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-black/40 border border-white/5 p-1 rounded-xl">
              <button onClick={handlePrevMonth} className="p-2 hover:text-white text-gray-500 bg-white/5 hover:bg-white/10 rounded-lg transition-all active:scale-95">
                <ChevronLeft size={16} />
              </button>
              <div className="min-w-[120px] text-center px-2">
                <span className="text-xs font-black text-white uppercase tracking-widest">
                  {format(currentDate, 'MMMM yyyy')}
                </span>
              </div>
              <button onClick={handleNextMonth} className="p-2 hover:text-white text-gray-500 bg-white/5 hover:bg-white/10 rounded-lg transition-all active:scale-95">
                <ChevronRight size={16} />
              </button>
            </div>

            <button
              onClick={handleManagerToggle}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all font-black text-[9px] uppercase tracking-widest ${
                isManagerMode 
                  ? 'bg-red-600/10 border-red-500/30 text-red-500' 
                  : 'bg-white/5 border-white/5 text-gray-500 hover:text-white'
              }`}
            >
              {isManagerMode ? <ShieldAlert size={14} /> : <Shield size={14} />}
              {isManagerMode ? 'Manager ON' : 'Login'}
            </button>
          </div>
        </div>

        {/* Manager Command Center - Gated Row */}
        <AnimatePresence>
          {isManagerMode && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mb-6 overflow-hidden"
            >
              <div className="flex flex-wrap items-center gap-3 p-4 bg-red-600/5 border border-red-500/20 rounded-2xl">
                 <div className="flex items-center gap-2 mr-2">
                    <ShieldAlert size={14} className="text-red-500" />
                    <span className="text-[9px] font-black uppercase text-red-500 tracking-widest">Admin Controls:</span>
                 </div>
                 <button
                   onClick={() => setIsImportModalOpen(true)}
                   className="flex items-center gap-2 px-4 py-2 rounded-xl bg-black border border-white/10 text-white text-[9px] font-black uppercase tracking-widest hover:border-red-500/30 transition-all"
                 >
                   <Upload size={14} className="text-red-500" />
                   Bulk Import
                 </button>
                 <button
                   onClick={handleExport}
                   className="flex items-center gap-2 px-4 py-2 rounded-xl bg-black border border-white/10 text-white text-[9px] font-black uppercase tracking-widest hover:border-blue-500/30 transition-all"
                 >
                   <TrendingUp size={14} className="text-blue-500" />
                   Export CSV
                 </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Personnel Filter Row */}
        <div className="mb-6 flex overflow-x-auto no-scrollbar gap-2 print:hidden backdrop-blur-md bg-white/[0.02] p-3 rounded-2xl border border-white/[0.03]">
          <button
            onClick={() => setSelectedStaff(null)}
            className={`px-4 py-2 rounded-lg font-black text-[9px] uppercase tracking-widest transition-all shrink-0 ${
              !selectedStaff ? 'accent-gradient text-white shadow-lg' : 'bg-white/5 text-gray-500 hover:text-white'
            }`}
          >
            Team View
          </button>
          {STAFF_CONFIG.map(staff => (
            <button
              key={staff.name}
              onClick={() => setSelectedStaff(staff.name)}
              className={`px-3 py-2 rounded-lg font-black text-[9px] uppercase tracking-widest transition-all shrink-0 ${
                selectedStaff === staff.name ? 'text-white border' : 'text-gray-500 bg-white/2 hover:text-gray-300'
              }`}
              style={{
                backgroundColor: selectedStaff === staff.name ? STAFF_COLORS[staff.name] : undefined,
                borderColor: selectedStaff === staff.name ? 'rgba(255,255,255,0.2)' : 'transparent',
              }}
            >
              {staff.name}
            </button>
          ))}
          
          <AnimatePresence>
            {selectedStaff && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={handleExportCalendar}
                className="ml-auto flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500 hover:text-white transition-all text-[9px] font-black uppercase tracking-widest shrink-0 shadow-lg shadow-emerald-500/10"
              >
                <CalendarIcon size={14} /> Sync to Cal
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Main Unified Content */}
        <div className="space-y-12">
          {/* Monthly Schedule Section */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
            <div className="bg-[#0f0f17] border border-white/5 rounded-3xl shadow-2xl p-4 md:p-8 print:bg-white">
              <div className="flex items-center justify-between mb-6 md:mb-8 print:mb-4">
                <div>
                  <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-tighter font-heading print:text-black">
                    Monthly Schedule
                  </h2>
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-500 mt-1 print:hidden">
                    Personnel Assignment View
                  </p>
                </div>
                <div className="flex items-center gap-3 print:hidden">
                  {[
                    { id: 'AM', color: '#2DD4BF' },
                    { id: 'PM', color: '#60A5FA' },
                    { id: 'NT', color: '#FBBF24' },
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
                overrides={overrides}
              />
            </div>

            {/* Legend */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-6 bg-[#0f0f17] border border-white/5 rounded-3xl p-4 md:p-6 shadow-xl print:hidden"
            >
              <h3 className="mb-4 text-white text-xs font-black uppercase tracking-widest">Staff Color Legend</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {STAFF_CONFIG.map(staff => (
                  <div key={staff.name} className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-lg flex-shrink-0" style={{ backgroundColor: STAFF_COLORS[staff.name] }} />
                    <span className="text-xs text-gray-400 font-bold truncate">{staff.name}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>

          {/* Impact Analysis Section (Moved to Bottom) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="pt-12 border-t border-white/5"
          >
            <div className="mb-8">
              <h2 className="text-2xl font-black text-white uppercase tracking-tighter font-heading">
                Impact Analysis
              </h2>
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-500 mt-1">
                Operational Performance & Allocation Metrics
              </p>
            </div>
            <AnalyticsDashboard analytics={analytics} />
          </motion.div>
        </div>

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

        <ImportModal
          isOpen={isImportModalOpen}
          onClose={() => setIsImportModalOpen(false)}
          onImport={handleBulkImport}
          year={year}
          month={month}
        />

        {/* Send Email Modal */}
        <AnimatePresence>
          {isEmailModalOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsEmailModalOpen(false)}
                className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="fixed z-[70] left-1/2 top-1/2 md:top-[25vh] -translate-x-1/2 -translate-y-1/2 md:translate-y-0 w-[90%] max-w-[420px] bg-[#0a0a0f] border border-white/10 p-6 md:p-8 rounded-[40px] shadow-2xl"
              >
                <div className="absolute top-4 right-4 p-2 bg-white/5 hover:bg-white/10 rounded-full transition cursor-pointer" onClick={() => setIsEmailModalOpen(false)}>
                  <X size={16} className="text-gray-400" />
                </div>
                
                <div className="mb-6 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center mb-4 transform rotate-3">
                    <CalendarIcon size={28} className="text-emerald-500" />
                  </div>
                  <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Sync Matrix</h3>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mt-2">
                    Get Shifts for {selectedStaff}
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Primary Rollback - Direct Download */}
                  <button 
                    onClick={handleDirectDownload}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-5 rounded-2xl font-black text-[11px] uppercase tracking-[0.3em] transition-all shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-3 active:scale-95"
                  >
                    <Upload size={18} className="rotate-180" strokeWidth={3} />
                    Download .ICS File
                  </button>

                  <div className="relative py-2 flex items-center">
                    <div className="flex-grow border-t border-white/5"></div>
                    <span className="flex-shrink mx-4 text-[8px] font-black text-gray-700 uppercase tracking-widest">or secondary sync</span>
                    <div className="flex-grow border-t border-white/5"></div>
                  </div>

                  <form onSubmit={handleSendEmail} className="space-y-4">
                    <div className="relative">
                      <input 
                        type="email" 
                        required 
                        value={userEmail}
                        onChange={(e) => setUserEmail(e.target.value)}
                        placeholder="Email for sync..."
                        className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-4 px-5 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-all placeholder-gray-700"
                      />
                      <button 
                        type="submit" 
                        disabled={isSendingEmail}
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white transition-all disabled:opacity-50"
                      >
                        <ChevronRight size={20} strokeWidth={3} />
                      </button>
                    </div>
                  </form>
                  
                  <button 
                    type="button"
                    onClick={handleNativeShare}
                    className="w-full bg-white/5 hover:bg-white/10 text-gray-300 py-3 rounded-xl font-bold text-[10px] uppercase tracking-[0.2em] transition-all border border-white/10 flex items-center justify-center gap-2"
                  >
                    <TrendingUp size={14} className="text-gray-400" /> Mobile Native Share
                  </button>

                  <p className="text-[8px] text-center text-gray-600 font-bold uppercase tracking-widest leading-relaxed px-4">
                    Direct Download is recommended for Google Calendar, Outlook, and Apple Mail.
                  </p>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}