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
  getCurrentShiftType,
} from '../utils/Rota/scheduleGenerator';
import { useSupabaseData } from '../context/SupabaseDataContext';
import { exportScheduleToCSV, downloadCSV } from '../utils/Rota/RotaExportUtility';
import { useToast } from '../context/ToastContext';

// Helper to generate the ICS text with icons, mates, and reminders
const generateICSContent = (selectedStaff: string, currentDate: Date, schedule: any[]) => {
  if (!selectedStaff || !schedule.length) return '';

  let ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Falme AI//Staff Rota//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Falme Staff Rota',
    'X-WR-TIMEZONE:Africa/Nairobi',
    'BEGIN:VTIMEZONE',
    'TZID:Africa/Nairobi',
    'BEGIN:STANDARD',
    'DTSTART:19700101T000000',
    'TZOFFSETFROM:+0300',
    'TZOFFSETTO:+0300',
    'TZNAME:EAT',
    'END:STANDARD',
    'END:VTIMEZONE'
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
    const color = shiftType === 'AM' ? '#40E0D0' : shiftType === 'PM' ? '#1E90FF' : '#FFA500';
    
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

    const staffId = selectedStaff.toLowerCase().replace(/\s+/g, '-');
    ics.push('BEGIN:VEVENT');
    // Deterministic UID ensures iOS and other calendars overwrite old events instead of duplicating them
    ics.push(`UID:falme-rota-${staffId}-${d}-${shiftType}`);
    ics.push(`DTSTAMP:${format(new Date(), 'yyyyMMdd')}T000000Z`);
    ics.push(`SUMMARY:${icon} ${shiftType} Shift | ${selectedStaff}`);
    ics.push(`DTSTART;TZID=Africa/Nairobi:${startStr}`);
    ics.push(`DTEND;TZID=Africa/Nairobi:${endStr}`);
    const teamList = [selectedStaff, ...mates].map(name => `- ${name}`).join('\\n');
    ics.push(`LOCATION:Falme Operations Hub (${shiftType})`);
    ics.push(`DESCRIPTION:SHIFT PERFORMANCE DATA\\n--------------------------\\nType: ${shiftType} (${icon})\\nStaff: ${selectedStaff}\\n\\nTEAM ON THIS SHIFT:\\n${teamList}\\n\\nTime: ${shiftType === 'AM' ? '07:30 - 15:30' : shiftType === 'PM' ? '15:30 - 22:30' : '22:30 - 07:30'}\\n\\nGenerated via Falme AI Rota.`);
    ics.push(`CATEGORIES:${shiftType},FalmeRota`);
    ics.push('STATUS:CONFIRMED');
    ics.push('TRANSP:OPAQUE');
    ics.push('PRIORITY:5');
    
    // iOS Specific Coloring
    ics.push(`X-APPLE-CALENDAR-COLOR:${color}`);
    
    // Standard Colors
    if (shiftType === 'AM') ics.push('COLOR:Turquoise');
    else if (shiftType === 'PM') ics.push('COLOR:DodgerBlue');
    else ics.push('COLOR:Orange');

    // 1-hour Reminder (VALARM) - Cross Platform Support
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

// v4.5 - Atomic Sync Optimization
export default function RotaPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedStaff, setSelectedStaff] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
  const [isManagerMode, setIsManagerMode] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isManagerLoginOpen, setIsManagerLoginOpen] = useState(false);
  const [managerPassword, setManagerPassword] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [desktopView, setDesktopView] = useState<"grid" | "list">("grid");
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'matrix' | 'analytics' | 'admin' | 'transport'>('matrix');

  const [isReady, setIsReady] = useState(false);
  const { overrides: rawOverrides, loading: globalLoading, actions, user } = useSupabaseData();
  const loading = globalLoading.overrides;

  // Persistence: If user is logged in, auto-enable manager mode
  useEffect(() => {
    if (user && (user.role === 'staff' || user.role === 'technician')) {
      setIsManagerMode(true);
    }
  }, [user]);

  useEffect(() => {
    const timer = setTimeout(() => setIsReady(true), 150);
    return () => clearTimeout(timer);
  }, []);

  // Transport state derived from special keys in overrides
  const transportConfig = useMemo(() => {
    const config = (rawOverrides as any)['config_transport'] || {};
    return {
      rates: config.rates || {},
      history: config.history || []
    };
  }, [rawOverrides]);

  const handleSaveTransportRates = async (rates: Record<string, number>) => {
    try {
      const currentConfig = (rawOverrides as any)['config_transport'] || {};
      await actions.updateRecord('rota_overrides', 'config_transport', { 
        ...currentConfig,
        rates 
      });
      showToast('Transport rates updated', 'success');
    } catch (err) {
      showToast('Failed to save rates', 'error');
    }
  };

  const handleProcessPayment = async (payment: any) => {
    try {
      const currentConfig = (rawOverrides as any)['config_transport'] || {};
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
    
    const mapped: Record<string, any> = {};
    const items = Array.isArray(rawOverrides) ? rawOverrides : Object.values(rawOverrides);
    
    items.forEach((item: any) => {
      const key = item.date || item.id;
      if (key) {
        // If the item has a 'shifts' property (Supabase structure), use that.
        // Otherwise, use the item itself (Backward compatibility/Direct map).
        mapped[key] = item.shifts || item;
      }
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

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    setIsShiftModalOpen(true);
  };

  const handleOverride = async (date: string, staff: string, type: string) => {
    await actions.updateRecord('rotaOverrides', date, { shifts: { [staff]: type } });
  };

  const handleBulkImport = async (data: Record<string, Record<string, string>>, shouldReplace: boolean = false) => {
    const entries = Object.entries(data);
    if (entries.length === 0) return;

    try {
      showToast(shouldReplace ? 'Executing Full Matrix Wipe & Sync...' : 'Merging Matrix Data...', 'info');

      const updatesMap: Record<string, any> = {};
      entries.forEach(([date, staffOverrides]) => {
        let finalShifts = staffOverrides;
        
        // If replacing, enforce Excel as the absolute source of truth.
        // Any staff NOT in the Excel file will be set to 'OFF' to prevent 
        // fallback to AI/Algorithmic predictions.
        if (shouldReplace) {
          const strictShifts: Record<string, string> = {};
          STAFF_CONFIG.forEach(s => {
            strictShifts[s.name] = staffOverrides[s.name] || 'OFF';
          });
          finalShifts = strictShifts;
        }
        
        updatesMap[date] = { shifts: finalShifts };
      });

      console.log(`[Import] Processing ${entries.length} days. Replace Mode: ${shouldReplace}`);
      await actions.bulkUpdateRecords('rotaOverrides', updatesMap, shouldReplace);

      
      showToast(shouldReplace ? 'Full Rota wipe & sync complete' : 'Rota specialized merge complete', 'success');
    } catch (err) {
      console.error('Bulk import error:', err);
      showToast('Import failed - check matrix constraints', 'error');
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
      showToast('Manager controls locked.', 'info');
    } else {
      setIsManagerLoginOpen(true);
    }
  };

  const handleManagerLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (managerPassword.trim().toLowerCase() === 'admin') {
      setIsManagerMode(true);
      setIsManagerLoginOpen(false);
      setManagerPassword('');
      showToast('Manager controls unlocked.', 'success');
    } else {
      showToast('Access Denied. Incorrect password.', 'error');
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
    <div className="flex flex-col w-full">
      {/* ── Top bar ── */}
      <div
        className="flex items-center justify-between px-4 py-3 shrink-0 print:hidden"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.07)", backgroundColor: "#0a101e" }}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="rounded-lg flex items-center justify-center shrink-0" style={{ width: 28, height: 28, backgroundColor: "#4080e8" }}>
            <CalendarIcon size={14} className="text-white" />
          </div>
          <div>
            <div style={{ fontSize: 11, color: "#8faac8", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", lineHeight: 1 }}>Personnel Rota</div>
            <div style={{ fontSize: 9, color: "#4d6080", fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", lineHeight: 1.4 }}>Live Management</div>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-1">
            <button onClick={handlePrevMonth} className="p-1 hover:text-white text-gray-500 rounded transition-all active:scale-95">
              <ChevronLeft size={16} />
            </button>
            <span style={{ fontSize: 13, color: "#c8d4e8", fontWeight: 600 }}>{format(currentDate, 'MMMM yyyy')}</span>
            <button onClick={handleNextMonth} className="p-1 hover:text-white text-gray-500 rounded transition-all active:scale-95">
              <ChevronRight size={16} />
            </button>
          </div>

          <button
            onClick={handleManagerToggle}
            style={{
              fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
              padding: "4px 8px",
              color: isManagerMode ? "#ef4444" : "#5c7a9e",
              backgroundColor: isManagerMode ? "rgba(239, 68, 68, 0.1)" : "transparent",
              border: isManagerMode ? "1px solid rgba(239, 68, 68, 0.3)" : "1px solid rgba(255,255,255,0.1)",
              cursor: "pointer", borderRadius: "8px", display: "flex", gap: "4px", alignItems: "center"
            }}
          >
            {isManagerMode ? <ShieldAlert size={12} /> : <Shield size={12} />}
            {isManagerMode ? 'Admin' : 'Login'}
          </button>

          {/* Grid/List toggle  -  only visible on md+ where grid actually shows */}
          <div
            className="hidden md:flex rounded-lg overflow-hidden"
            style={{ border: "1px solid rgba(255,255,255,0.1)" }}
          >
            {(["grid", "list"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setDesktopView(v)}
                style={{
                  fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
                  padding: "4px 12px",
                  color: desktopView === v ? "#fff" : "#5c7a9e",
                  backgroundColor: desktopView === v ? "#4080e8" : "transparent",
                  cursor: "pointer", border: "none",
                }}
              >
                {v === "grid" ? "Grid" : "List"}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto w-full flex-1 flex flex-col min-h-0 print:p-0">

        {/* Manager Command Center - Gated Row */}
        <AnimatePresence>
          {isManagerMode && activeTab === 'admin' && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="px-4 mt-4 overflow-hidden print:hidden"
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

        {/* ── Info strips ── */}
        <div
          className="px-4 py-4 shrink-0 print:hidden bg-gradient-to-r from-[#0c1220] to-[#0a101e]"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}
        >
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5">
              <button
                onClick={() => { setActiveTab('matrix'); setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100); }}
                className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'matrix' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-gray-500 hover:text-gray-300'}`}
              >
                Matrix
              </button>
              <button
                onClick={() => { setActiveTab('analytics'); setTimeout(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }), 100); }}
                className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'analytics' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-gray-500 hover:text-gray-300'}`}
              >
                Trends
              </button>
              <button
                onClick={() => setActiveTab('transport')}
                className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'transport' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-gray-500 hover:text-gray-300'}`}
              >
                Transport
              </button>
              {isManagerMode && (
                <button
                  onClick={() => setActiveTab('admin')}
                  className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'admin' ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/20' : 'text-gray-500 hover:text-gray-300'}`}
                >
                  Admin
                </button>
              )}
            </div>
            
            {activeTab === 'matrix' && (
            <div className="flex flex-wrap gap-x-4 gap-y-3 items-center ml-auto">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedStaff(null)}
                className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                  !selectedStaff 
                    ? "bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-500/20" 
                    : "bg-white/5 text-gray-500 border-white/5 hover:border-white/20 hover:text-gray-300"
                }`}
              >
                Entire Team
              </motion.button>
              
              <div className="w-[1px] h-4 bg-white/10 mx-1 hidden md:block"></div>
              
              {STAFF_CONFIG.map(staff => (
                <motion.button 
                  key={staff.name} 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedStaff(staff.name)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all border ${
                    selectedStaff === staff.name 
                      ? "bg-white/10 border-white/20 text-white shadow-xl" 
                      : "bg-transparent border-transparent text-gray-500 hover:bg-white/5 hover:text-gray-300"
                  }`}
                >
                  <div 
                    style={{ backgroundColor: STAFF_COLORS[staff.name] }}
                    className={`w-2 h-2 rounded-full shadow-[0_0_8px] transition-all ${
                      selectedStaff === staff.name ? "opacity-100" : "opacity-40"
                    }`}
                    style={{ 
                      backgroundColor: STAFF_COLORS[staff.name],
                      boxShadow: selectedStaff === staff.name ? `0 0 10px ${STAFF_COLORS[staff.name]}80` : 'none'
                    }}
                  />
                  <span className="text-[11px] font-bold tracking-tight">{staff.name}</span>
                </motion.button>
              ))}

              <AnimatePresence>
                {selectedStaff && (
                  <motion.button
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    onClick={handleExportCalendar}
                    className="ml-auto flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600 hover:text-white transition-all border border-emerald-500/30 group"
                  >
                    <CalendarIcon size={14} className="group-hover:rotate-12 transition-transform" /> 
                    <span className="text-[10px] font-black uppercase tracking-widest">Sync My Rota</span>
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
        <div
          className="px-4 py-2 shrink-0 print:hidden"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", backgroundColor: "#0a101e" }}
        >
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            {[
              { label: "AM", time: "07:00–15:00", color: "#3d7ee6" },
              { label: "PM", time: "15:00–23:00", color: "#28a87c" },
              { label: "NT", time: "23:00–07:00", color: "#7a56d4" },
            ].map((s) => (
              <div key={s.label} className="flex items-center gap-1.5">
                <div style={{ width: 3, height: 12, borderRadius: 99, backgroundColor: s.color, flexShrink: 0 }} />
                <span style={{ fontSize: 10, color: "#8faac8", fontWeight: 600 }}>{s.label}</span>
                <span style={{ fontSize: 9, color: "#3d5070" }}>{s.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Content ── */}
        <div className="flex-1 overflow-y-auto px-1 md:px-0">
          <div className="p-0 md:p-4 print:p-0">
            {activeTab === 'matrix' && (
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
            {activeTab === 'analytics' && analytics && <AnalyticsDashboard analytics={analytics} />}
            {activeTab === 'transport' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="pb-12"
              >
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
               <div className="space-y-6">
                  {/* Existing Admin Panel Content (Import, Export, etc) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-8 rounded-[40px] bg-white/[0.03] border border-white/10">
                       <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-4 flex items-center gap-2">
                         <Upload className="text-blue-500" />
                         Data Import
                       </h3>
                       <button 
                         onClick={() => setIsImportModalOpen(true)}
                         className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest transition-all"
                       >
                         Launch Excel Sync
                       </button>
                    </div>
                    {/* ... other admin actions ... */}
                  </div>
               </div>
            )}
          </div>


          </div>
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
          allOverrides={overrides}
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

        {/* Manager Login Modal */}
        <AnimatePresence>
          {isManagerLoginOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsManagerLoginOpen(false)}
                className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="fixed z-[70] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-[360px] bg-[#0a0a0f] border border-red-500/10 p-6 md:p-8 rounded-3xl shadow-2xl"
              >
                <div className="absolute top-4 right-4 p-2 bg-white/5 hover:bg-white/10 rounded-full transition cursor-pointer" onClick={() => setIsManagerLoginOpen(false)}>
                  <X size={16} className="text-gray-400" />
                </div>
                
                <div className="mb-6 flex flex-col items-center justify-center text-center">
                  <div className="w-14 h-14 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center mb-4">
                    <ShieldAlert size={24} className="text-red-500" />
                  </div>
                  <h3 className="text-xl font-black text-white uppercase tracking-tighter">Manager Access</h3>
                  <p className="text-[9px] text-gray-500 uppercase tracking-widest font-bold mt-2">
                    System Configuration
                  </p>
                </div>

                <form onSubmit={handleManagerLogin} className="space-y-4">
                  <input 
                    type="password" 
                    required 
                    autoFocus
                    value={managerPassword}
                    onChange={(e) => setManagerPassword(e.target.value)}
                    placeholder="Enter Access Key..."
                    className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-3 px-5 text-sm text-center text-white focus:outline-none focus:border-red-500/50 transition-all placeholder-gray-700 tracking-[0.2em]"
                  />
                  <button 
                    type="submit" 
                    className="w-full bg-red-600 hover:bg-red-500 text-white py-4 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-lg shadow-red-500/20 active:scale-95"
                  >
                    Unlock Controls
                  </button>
                </form>
              </motion.div>
            </>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
