import { useState, useMemo, useEffect } from 'react';
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
  X,
  Mail,
  Send,
  Download,
  Sparkles
} from 'lucide-react';
import { format } from 'date-fns';
import emailjs from '@emailjs/browser';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField,
  Tooltip
} from '@mui/material';
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

// v4.5 - Atomic Sync Optimization
export default function App() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 3, 1));
  const [selectedStaff, setSelectedStaff] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
  const [isManagerMode, setIsManagerMode] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [staffEmail, setStaffEmail] = useState('');
  const [isSending, setIsSending] = useState(false);
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
    setEmailModalOpen(true);
  };

  const generateICS = () => {
    const nowStamp = format(new Date(), "yyyyMMdd'T'HHmmss'Z'");
    let icsContent = "BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//Falme staff system//Rota//EN\r\n";

    schedule.forEach(daySchedule => {
      let staffShiftType = 'OFF';
      if (daySchedule.shifts.AM.includes(selectedStaff)) staffShiftType = 'AM';
      else if (daySchedule.shifts.PM.includes(selectedStaff)) staffShiftType = 'PM';
      else if (daySchedule.shifts.NT.includes(selectedStaff)) staffShiftType = 'NT';

      if (staffShiftType !== 'OFF' && staffShiftType !== 'LEAVE') {
        const dateStr = format(daySchedule.date, "yyyyMMdd");
        let startTime = "";
        let endTime = "";
        let shiftTitle = "";
        let endDayDate = new Date(daySchedule.date);

        if (staffShiftType === 'AM') {
          startTime = `${dateStr}T073000`;
          endTime = `${dateStr}T153000`;
          shiftTitle = '🌅 AM Shift (07:30 - 15:30)';
        } else if (staffShiftType === 'PM') {
          startTime = `${dateStr}T153000`;
          endTime = `${dateStr}T223000`;
          shiftTitle = '🌇 PM Shift (15:30 - 22:30)';
        } else if (staffShiftType === 'NT') {
          startTime = `${dateStr}T223000`;
          endDayDate.setDate(endDayDate.getDate() + 1);
          endTime = `${format(endDayDate, "yyyyMMdd")}T073000`;
          shiftTitle = '🌙 NT Shift (22:30 - 07:30)';
        }

        // @ts-ignore
        const shiftMatesList = daySchedule.shifts[staffShiftType];
        const shiftMates = (shiftMatesList || []).filter(name => name !== selectedStaff);
        const shiftMatesText = shiftMates.length > 0 ? shiftMates.join(', ') : 'Working solo';

        icsContent += `BEGIN:VEVENT\r\n`;
        icsContent += `UID:${dateStr}-${staffShiftType}-${selectedStaff?.replace(/\s+/g, '')}@falme.local\r\n`;
        icsContent += `DTSTAMP:${nowStamp}\r\n`;
        icsContent += `DTSTART:${startTime}\r\n`;
        icsContent += `DTEND:${endTime}\r\n`;
        icsContent += `SUMMARY:Falme: ${shiftTitle}\r\n`;
        icsContent += `LOCATION:Falme Workplace\r\n`;
        icsContent += `DESCRIPTION:⭐ Premium Rota Sync\\n\\n🔹 Shift Type: ${staffShiftType}\\n👥 Co-workers on duty: ${shiftMatesText}\\n\\nHave a great shift!\r\n`;
        
        icsContent += `BEGIN:VALARM\r\n`;
        icsContent += `TRIGGER:-PT30M\r\n`;
        icsContent += `ACTION:DISPLAY\r\n`;
        icsContent += `DESCRIPTION:Falme Shift starts in 30 minutes! (${shiftMatesText} also joining)\r\n`;
        icsContent += `END:VALARM\r\n`;
        
        icsContent += `END:VEVENT\r\n`;
      }
    });

    icsContent += "END:VCALENDAR\r\n";
    return icsContent;
  };

  const downloadFile = () => {
    const icsContent = generateICS();
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Falme_Rota_${selectedStaff}_${format(currentDate, 'MMM_yyyy')}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Download started!`, 'success');
    setEmailModalOpen(false);
  };

  const sendToEmail = async () => {
    if (!staffEmail || !staffEmail.includes('@')) {
      showToast('Please enter a valid email', 'error');
      return;
    }

    setIsSending(true);
    const icsContent = generateICS();

    try {
      await emailjs.send(
        'service_0o0jqak',
        'template_ycf6b1s',
        {
          to_email: staffEmail,
          staff_name: selectedStaff,
          month: format(currentDate, 'MMMM yyyy'),
          ics_content: icsContent, // Your template should use this variable
        },
        'wOtZkUT4QoW_MzUGh'
      );
      showToast('Calendar link sent to your email!', 'success');
      setEmailModalOpen(false);
    } catch (err) {
      console.error('Email error:', err);
      showToast('Failed to send email. Try downloading instead.', 'error');
    } finally {
      setIsSending(false);
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
                className="ml-auto flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500/10 text-blue-500 border border-blue-500/20 hover:bg-blue-500 hover:text-white transition-all text-[9px] font-black uppercase tracking-widest shrink-0 shadow-lg shadow-blue-500/10"
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

        {/* Email Sync Modal */}
        <Dialog open={emailModalOpen} onClose={() => setEmailModalOpen(false)} maxWidth="xs" fullWidth PaperProps={{ 
          className: "!rounded-[32px] !bg-[#0a0a0f] !border !border-white/5 !shadow-2xl" 
        }}>
          <div className="p-8 space-y-6 relative">
            <button 
              onClick={() => setEmailModalOpen(false)}
              className="absolute top-6 right-6 p-2 text-gray-500 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-4 mb-2">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 shadow-xl shadow-blue-500/5">
                <CalendarIcon size={24} className="text-blue-500" />
              </div>
              <div>
                <DialogTitle className="!p-0 font-heading font-black text-white uppercase tracking-tighter text-xl">
                  Calendar Sync
                </DialogTitle>
                <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest mt-1">Personnel: {selectedStaff}</p>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-gray-400 text-xs font-medium leading-relaxed">
                Choose how you'd like to receive your calendar file. You can download it directly or have it sent to your email for easy mobile syncing.
              </p>
              
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-1">Email Destination</label>
                <TextField
                  autoFocus
                  placeholder="Enter your email address..."
                  type="email"
                  fullWidth
                  variant="outlined"
                  value={staffEmail}
                  onChange={(e) => setStaffEmail(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendToEmail()}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: 'white',
                      backgroundColor: 'rgba(255,255,255,0.03)',
                      borderRadius: '16px',
                      fontSize: '14px',
                      '& fieldset': { borderColor: 'rgba(255,255,255,0.05)' },
                      '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
                      '&.Mui-focused fieldset': { borderColor: '#ef4444' },
                    },
                  }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button 
                onClick={downloadFile}
                className="flex items-center justify-center gap-3 px-4 py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-black text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all group"
              >
                <Download size={16} className="text-gray-400 group-hover:text-white transition-colors" />
                Download
              </button>
              <button 
                onClick={sendToEmail}
                disabled={isSending}
                className="flex items-center justify-center gap-3 px-4 py-4 rounded-2xl accent-gradient text-white font-black text-[10px] uppercase tracking-widest hover:shadow-2xl hover:shadow-red-500/20 transition-all disabled:opacity-50"
              >
                {isSending ? (
                  <Clock size={16} className="animate-spin" />
                ) : (
                  <Mail size={16} />
                )}
                {isSending ? 'Sending...' : 'Email Me'}
              </button>
            </div>
            
            <div className="pt-2 flex items-center justify-center gap-2">
               <Sparkles size={12} className="text-red-500/50" />
               <p className="text-[9px] font-black uppercase text-gray-700 tracking-widest italic">Powered by Falme Intelligence</p>
            </div>
          </div>
        </Dialog>
      </div>
    </div>
  );
}