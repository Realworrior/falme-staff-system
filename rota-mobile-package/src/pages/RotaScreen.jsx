import React, { useState } from 'react';
import { format } from 'date-fns';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Upload, 
  Download, 
  ShieldAlert, 
  ShieldCheck, 
  X, 
  DollarSign, 
  BarChart2, 
  Grid 
} from 'lucide-react';
import { useRota } from '../context/RotaContext';
import { useToast } from '../context/ToastContext';
import { ScheduleCalendar } from '../components/ScheduleCalendar';
import { ShiftMates } from '../components/ShiftMates';
import { TransportDashboard } from '../components/TransportDashboard';
import { AnalyticsDashboard } from '../components/AnalyticsDashboard';
import { ImportModal } from '../components/ImportModal';
import { ManagerLoginModal } from '../components/ManagerLoginModal';
import { STAFF_THEME } from '../utils/scheduleGenerator';

export function RotaScreen() {
  const {
    currentDate,
    setCurrentDate,
    activeBranch,
    setActiveBranch,
    isManagerMode,
    setIsManagerMode,
    selectedStaff,
    setSelectedStaff,
    selectedDate,
    setSelectedDate,
    activeTab,
    setActiveTab,
    schedule,
    analytics,
    overrides,
    transportConfig,
    updateShiftOverride,
    bulkImportOverrides,
    saveTransportRates,
    recordTransportPayment,
    exportCSV,
    exportStaffICS,
    staffList
  } = useRota();

  const { showToast } = useToast();
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [desktopView, setDesktopView] = useState('grid');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDate(null);
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDate(null);
  };

  const handleDayClick = (date) => {
    setSelectedDate(date);
    setIsShiftModalOpen(true);
  };

  const handleExportCSV = () => {
    exportCSV();
    showToast('CSV export ready', 'success');
  };

  const handleExportICS = () => {
    if (!selectedStaff) {
      showToast('Select a staff member to download their calendar file', 'info');
      return;
    }
    exportStaffICS(selectedStaff);
    showToast(`Calendar sync generated for ${selectedStaff}`, 'success');
  };

  return (
    <div className="min-h-screen bg-[#0A0A0D] text-[#F4F5F1] font-sans selection:bg-[#00D66B]/20 flex flex-col">
      {/* ── Sticky Top Bar ── */}
      <header className="sticky top-0 z-30 bg-[#0A0A0D]/95 backdrop-blur-xl px-4 py-4 md:px-8 border-b border-white/[0.06] select-none">
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Branding & Title */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-[#00D66B] text-[#04170D] font-bold flex items-center justify-center shrink-0 shadow-sm">
                <CalendarIcon size={18} />
              </div>
              <div>
                <h1 className="font-['Space_Grotesk'] text-xl font-bold tracking-tight text-white leading-none">
                  Shift Rota
                </h1>
                <span className="text-[11px] text-[#8B8E97] block mt-0.5">
                  {activeBranch === 'sofasafi' ? 'SofaSafi Branch' : 'Betfalme Operations'}
                </span>
              </div>
            </div>

            {/* Mobile Actions Right */}
            <div className="flex md:hidden items-center gap-2">
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className={`p-2 rounded-full border text-xs ${
                  isManagerMode 
                    ? 'bg-[#00D66B]/15 text-[#00D66B] border-[#00D66B]/30' 
                    : 'bg-[#1B1C22] border-white/10 text-[#8B8E97]'
                }`}
              >
                {isManagerMode ? <ShieldCheck size={16} /> : <ShieldAlert size={16} />}
              </button>
            </div>
          </div>

          {/* Month Navigator & Branch Switcher */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Branch switcher */}
            <div className="flex bg-[#131520] border border-white/[0.07] p-1 rounded-full">
              <button
                onClick={() => {
                  setActiveBranch('betfalme');
                  showToast('Switched to Betfalme branch', 'info');
                }}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  activeBranch === 'betfalme'
                    ? 'bg-[#00D66B] text-[#04170D] shadow font-bold'
                    : 'text-[#8B8E97] hover:text-white'
                }`}
              >
                Betfalme
              </button>
              <button
                onClick={() => {
                  setActiveBranch('sofasafi');
                  showToast('Switched to SofaSafi branch', 'info');
                }}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  activeBranch === 'sofasafi'
                    ? 'bg-[#00D66B] text-[#04170D] shadow font-bold'
                    : 'text-[#8B8E97] hover:text-white'
                }`}
              >
                SofaSafi
              </button>
            </div>

            {/* Month Stepper */}
            <div className="flex bg-[#131520] border border-white/[0.07] p-1 rounded-full items-center">
              <button
                onClick={handlePrevMonth}
                className="p-1.5 hover:bg-white/5 rounded-full transition-all text-[#8B8E97] hover:text-white cursor-pointer"
              >
                <ChevronLeft size={16} />
              </button>
              <div className="px-3 flex flex-col items-center justify-center min-w-[100px]">
                <span className="text-[10px] font-mono text-[#00D66B] font-bold leading-none mb-0.5">
                  {format(currentDate, 'yyyy')}
                </span>
                <span className="text-xs font-['Space_Grotesk'] font-bold text-white leading-none">
                  {format(currentDate, 'MMMM')}
                </span>
              </div>
              <button
                onClick={handleNextMonth}
                className="p-1.5 hover:bg-white/5 rounded-full transition-all text-[#8B8E97] hover:text-white cursor-pointer"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            {/* Desktop Manager Toggle */}
            <div className="hidden md:flex items-center gap-2">
              {isManagerMode ? (
                <button
                  onClick={() => setIsImportModalOpen(true)}
                  className="flex items-center gap-1.5 bg-[#131520] hover:bg-[#1B1C22] border border-white/[0.08] text-xs text-white px-3.5 py-2 rounded-full transition-all cursor-pointer"
                >
                  <Upload size={13} className="text-[#00D66B]" />
                  <span>Import Matrix</span>
                </button>
              ) : (
                <button
                  onClick={() => setIsLoginModalOpen(true)}
                  className="p-2.5 rounded-full bg-[#131520] border border-white/[0.07] hover:border-[#00D66B]/40 transition-all text-[#8B8E97] hover:text-[#00D66B] cursor-pointer"
                  title="Unlock Manager Mode"
                >
                  <ShieldAlert size={16} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── Sub Navigation: Tabs & Staff Filter Pills ── */}
        <div className="max-w-[1600px] mx-auto mt-3.5 flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-2 border-t border-white/[0.04]">
          {/* Main View Tabs */}
          <div className="flex items-center gap-1 bg-[#131520] p-1 rounded-2xl border border-white/[0.06] w-fit">
            <button
              onClick={() => setActiveTab('matrix')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'matrix' ? 'bg-[#232429] text-[#00D66B] font-bold' : 'text-[#8B8E97] hover:text-white'
              }`}
            >
              <Grid size={13} />
              <span>Calendar</span>
            </button>
            <button
              onClick={() => setActiveTab('transport')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'transport' ? 'bg-[#232429] text-[#00D66B] font-bold' : 'text-[#8B8E97] hover:text-white'
              }`}
            >
              <DollarSign size={13} />
              <span>Transport</span>
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'analytics' ? 'bg-[#232429] text-[#00D66B] font-bold' : 'text-[#8B8E97] hover:text-white'
              }`}
            >
              <BarChart2 size={13} />
              <span>Analytics</span>
            </button>
          </div>

          {/* Staff Quick-Filter Pills (Active on Matrix view) */}
          {activeTab === 'matrix' && (
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
              <button
                onClick={() => setSelectedStaff(null)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer shrink-0 ${
                  !selectedStaff
                    ? 'bg-white text-black font-bold'
                    : 'bg-[#131520] text-[#8B8E97] hover:text-white border border-white/5'
                }`}
              >
                All Team
              </button>
              {staffList.map(s => {
                const isSelected = selectedStaff === s.name;
                const theme = STAFF_THEME[s.name];
                return (
                  <button
                    key={s.name}
                    onClick={() => setSelectedStaff(isSelected ? null : s.name)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 border ${
                      isSelected
                        ? 'border-white text-white font-bold shadow-md'
                        : 'border-transparent text-[#8B8E97] hover:text-white bg-[#131520]'
                    }`}
                    style={{
                      backgroundColor: isSelected ? theme?.bg : undefined
                    }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: theme?.bg || '#3d7ee6' }} />
                    <span>{s.name}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </header>

      {/* ── Main Content Body ── */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto p-4 sm:p-6 md:p-8">
        {activeTab === 'matrix' && (
          <div className="space-y-4">
            {/* Action Bar (Export CSV / Sync to Phone) */}
            <div className="flex items-center justify-between flex-wrap gap-3 pb-1">
              <div className="flex items-center gap-2 text-xs text-[#8B8E97]">
                <span className="w-2 h-2 rounded-full bg-[#00D66B] inline-block animate-pulse" />
                <span>Balanced 18-Day Rotation Cycle Active</span>
              </div>

              <div className="flex items-center gap-2 ml-auto">
                {selectedStaff && (
                  <button
                    onClick={handleExportICS}
                    className="flex items-center gap-1.5 bg-[#131520] hover:bg-[#1B1C22] border border-white/[0.08] text-xs text-white px-3.5 py-1.5 rounded-full transition-all cursor-pointer shadow-sm"
                  >
                    <Download size={13} className="text-[#3ED3F2]" />
                    <span>Sync to Phone Calendar (.ics)</span>
                  </button>
                )}
                <button
                  onClick={handleExportCSV}
                  className="flex items-center gap-1.5 bg-[#131520] hover:bg-[#1B1C22] border border-white/[0.08] text-xs text-white px-3.5 py-1.5 rounded-full transition-all cursor-pointer shadow-sm"
                >
                  <Download size={13} className="text-[#00D66B]" />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>

            {/* Schedule Calendar View */}
            <ScheduleCalendar
              schedule={schedule}
              selectedStaff={selectedStaff}
              onDayClick={handleDayClick}
              overrides={overrides}
              desktopView={desktopView}
              year={year}
              month={month}
            />
          </div>
        )}

        {activeTab === 'transport' && (
          <TransportDashboard
            currentDate={currentDate}
            schedule={schedule}
            savedRates={transportConfig.rates}
            paymentHistory={transportConfig.history}
            onSaveRates={(rates) => {
              saveTransportRates(activeBranch, rates);
              showToast('Transport rates saved', 'success');
            }}
            onPay={(milestone) => {
              recordTransportPayment(activeBranch, milestone);
              showToast('Payment milestone recorded', 'success');
            }}
            activeBranch={activeBranch}
            isManagerMode={isManagerMode}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsDashboard analytics={analytics} />
        )}
      </main>

      {/* ── Modals ── */}
      {isShiftModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xl">
            <ShiftMates
              selectedDate={selectedDate || new Date()}
              schedule={schedule}
              selectedStaff={selectedStaff}
              isManagerMode={isManagerMode}
              onOverride={(dateStr, staffName, shiftType) => {
                updateShiftOverride(dateStr, staffName, shiftType);
                showToast(`Shift updated for ${staffName}`, 'success');
              }}
              overrides={overrides}
              onClose={() => setIsShiftModalOpen(false)}
            />
          </div>
        </div>
      )}

      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={(importData, shouldReplace) => {
          bulkImportOverrides(importData, shouldReplace);
          showToast('Schedule import synchronized', 'success');
        }}
        year={year}
        month={month}
        allOverrides={overrides}
        activeBranch={activeBranch}
      />

      <ManagerLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLogin={() => {
          setIsManagerMode(true);
          showToast('Manager Mode unlocked', 'success');
        }}
      />
    </div>
  );
}
