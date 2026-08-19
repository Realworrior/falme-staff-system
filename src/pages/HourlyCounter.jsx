import React, { useState, useEffect, useRef } from "react";
import { 
  Copy, 
  Check, 
  Plus, 
  Minus, 
  X, 
  Clock, 
  RotateCcw,
  SlidersHorizontal,
} from "lucide-react";
import { useToast } from '../context/ToastContext';
import { supabase } from '../supabaseClient';

// Format time string consistently across all environments (e.g. "7:00 AM", "12:00 PM")
function formatWindowHour(d) {
  let h = d.getHours();
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  if (h === 0) h = 12;
  return `${h}:00 ${ampm}`;
}

function formatWindowHourShort(d) {
  let h = d.getHours();
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  if (h === 0) h = 12;
  return `${h}:00`;
}

// Calculate shift windows (1:00 AM - 7:00 AM combined bracket, standard 1-hour brackets for the rest)
function getShiftWindow(dateInput) {
  const date = new Date(dateInput);
  const hour = date.getHours();

  // 1:00 AM to 7:00 AM night window (hours 1, 2, 3, 4, 5, 6)
  if (hour >= 1 && hour < 7) {
    const start = new Date(date);
    start.setHours(1, 0, 0, 0);
    const end = new Date(date);
    end.setHours(7, 0, 0, 0);
    return {
      startTime: start,
      endTime: end,
      timeRange: `${formatWindowHour(start)} – ${formatWindowHour(end)}`,
      timeRangeShort: `1:00–7:00 AM`,
      startTimeCap: formatWindowHour(start),
      isNightShift: true
    };
  } else {
    // 1-hour standard window (e.g., 7:00 AM – 8:00 AM, 12:00 PM – 1:00 PM)
    const start = new Date(date);
    start.setMinutes(0, 0, 0, 0);
    const end = new Date(start);
    end.setHours(end.getHours() + 1);
    const endAmpm = end.getHours() >= 12 ? 'PM' : 'AM';
    return {
      startTime: start,
      endTime: end,
      timeRange: `${formatWindowHour(start)} – ${formatWindowHour(end)}`,
      timeRangeShort: `${formatWindowHourShort(start)}–${formatWindowHourShort(end)} ${endAmpm}`,
      startTimeCap: formatWindowHour(start),
      isNightShift: false
    };
  }
}

// Generate time window string with forward/backward step support
function generateHourRange(shiftStep = 0) {
  let date = new Date();
  
  if (shiftStep !== 0) {
    let steps = Math.abs(shiftStep);
    let direction = shiftStep > 0 ? 1 : -1;
    
    while (steps > 0) {
      const window = getShiftWindow(date);
      if (direction > 0) {
        date = new Date(window.endTime.getTime() + 1000);
      } else {
        date = new Date(window.startTime.getTime() - 1000);
      }
      steps--;
    }
  }

  return getShiftWindow(date).timeRange;
}

const DEFAULT_HOURLY_COUNTER = {
  id: 'hourly_counter_global',
  transactionCode: '__HOURLY_COUNTER__',
  timeRange: generateHourRange(0),
  depositCount: 0,
  withdrawalCount: 0,
  depositIcon: 'check',
  depositLabel: 'Deposit completed',
  withdrawalIcon: 'check',
  withdrawalLabel: 'Completed withdrawal',
  lastActiveHour: new Date().getHours()
};

export default function HourlyCounter() {
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [copiedActiveCounter, setCopiedActiveCounter] = useState(false);
  const [shiftStepOffset, setShiftStepOffset] = useState(0);

  const toast = useToast();
  const addToast = toast?.addToast || toast?.showToast || (() => {});

  // Hourly Counter State
  const [counterState, setCounterState] = useState(() => {
    const saved = localStorage.getItem("betfalme_mpesa_hourly_counter");
    return saved ? JSON.parse(saved) : DEFAULT_HOURLY_COUNTER;
  });

  // Analytics History State
  const [analyticsHistory, setAnalyticsHistory] = useState(() => {
    const saved = localStorage.getItem("betfalme_mpesa_analytics_history");
    return saved ? JSON.parse(saved) : [];
  });

  // Save counter state to localStorage
  useEffect(() => {
    localStorage.setItem("betfalme_mpesa_hourly_counter", JSON.stringify(counterState));
  }, [counterState]);

  // Save analytics history to localStorage
  useEffect(() => {
    localStorage.setItem("betfalme_mpesa_analytics_history", JSON.stringify(analyticsHistory));
  }, [analyticsHistory]);

  // Sync Analytics to Supabase
  const syncAnalyticsToSupabase = async (updatedHistory) => {
    try {
      const record = {
        id: 'hourly_analytics_history',
        transactionCode: '__HOURLY_ANALYTICS__',
        raw: JSON.stringify(updatedHistory),
        timestamp: new Date().toISOString()
      };
      await supabase.from('mpesa_codes').upsert([record]);
    } catch (err) {
      console.warn("Failed to sync analytics to Supabase:", err);
    }
  };

  // Sync Counter State to Supabase
  const syncCounterToSupabase = async (updatedState) => {
    try {
      const record = {
        id: 'hourly_counter_global',
        transactionCode: '__HOURLY_COUNTER__',
        raw: JSON.stringify(updatedState),
        timestamp: new Date().toISOString()
      };
      await supabase.from('mpesa_codes').upsert([record]);
    } catch (err) {
      console.warn("Failed to sync counter to Supabase:", err);
    }
  };

  // Fetch initial data from Supabase and subscribe to realtime updates
  useEffect(() => {
    const fetchEntries = async () => {
      try {
        const { data, error } = await supabase
          .from('mpesa_codes')
          .select('*')
          .in('id', ['hourly_counter_global', 'hourly_analytics_history']);

        if (error) {
          console.warn("Supabase fetch failed (falling back to local storage):", error.message);
          return;
        }

        if (data) {
          // Counter Record
          const counterRecord = data.find(item => item.id === 'hourly_counter_global' || item.transactionCode === '__HOURLY_COUNTER__');
          if (counterRecord && counterRecord.raw) {
            try {
              const parsedCounter = JSON.parse(counterRecord.raw);
              setCounterState((prev) => ({
                ...prev,
                ...parsedCounter,
                id: 'hourly_counter_global',
                transactionCode: '__HOURLY_COUNTER__'
              }));
            } catch (e) {
              console.error("Error parsing counter record raw data", e);
            }
          }

          // Analytics Record
          const analyticsRecord = data.find(item => item.id === 'hourly_analytics_history' || item.transactionCode === '__HOURLY_ANALYTICS__');
          if (analyticsRecord && analyticsRecord.raw) {
            try {
              const parsedAnalytics = JSON.parse(analyticsRecord.raw);
              if (Array.isArray(parsedAnalytics)) {
                setAnalyticsHistory(parsedAnalytics);
              }
            } catch (e) {
              console.error("Error parsing analytics history raw data", e);
            }
          }
        }
      } catch (err) {
        console.warn("Supabase connection error:", err);
      }
    };

    fetchEntries();

    // Subscribe to realtime database changes
    const channel = supabase
      .channel('mpesa-hourly-counter-realtime')
      .on('postgres_changes', { event: '*', table: 'mpesa_codes', schema: 'public' }, (payload) => {
        const newRecord = payload.new;
        const oldRecord = payload.old;

        // Counter Record Realtime
        if ((newRecord && (newRecord.id === 'hourly_counter_global' || newRecord.transactionCode === '__HOURLY_COUNTER__')) ||
            (oldRecord && (oldRecord.id === 'hourly_counter_global' || oldRecord.transactionCode === '__HOURLY_COUNTER__'))) {
          if ((payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') && newRecord?.raw) {
            try {
              const parsed = JSON.parse(newRecord.raw);
              setCounterState((prev) => ({ ...prev, ...parsed }));
            } catch (e) {
              console.error("Realtime counter parse error", e);
            }
          }
          return;
        }

        // Analytics Record Realtime
        if ((newRecord && (newRecord.id === 'hourly_analytics_history' || newRecord.transactionCode === '__HOURLY_ANALYTICS__')) ||
            (oldRecord && (oldRecord.id === 'hourly_analytics_history' || oldRecord.transactionCode === '__HOURLY_ANALYTICS__'))) {
          if ((payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') && newRecord?.raw) {
            try {
              const parsed = JSON.parse(newRecord.raw);
              if (Array.isArray(parsed)) setAnalyticsHistory(parsed);
            } catch (e) {
              console.error("Realtime analytics parse error", e);
            }
          }
          return;
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Auto-Hour Detection & Shift Window Rollover Logic
  useEffect(() => {
    const checkHourRollover = () => {
      const now = new Date();
      const currentWindow = getShiftWindow(now);

      setCounterState((prev) => {
        if (prev.timeRange && prev.timeRange !== currentWindow.timeRange) {
          const finishedRange = prev.timeRange;
          const depCount = prev.depositCount || 0;
          const wthCount = prev.withdrawalCount || 0;

          // Auto-archive completed shift to Analytics
          const archiveEntry = {
            id: `analytics_${Date.now()}`,
            timeRange: finishedRange,
            depositCount: depCount,
            withdrawalCount: wthCount,
            copiedAt: new Date().toISOString(),
            autoArchived: true,
            date: new Date().toLocaleDateString([], { day: '2-digit', month: 'short' })
          };

          setAnalyticsHistory((prevHistory) => {
            const filtered = prevHistory.filter(h => h.timeRange !== finishedRange);
            const nextHistory = [archiveEntry, ...filtered];
            syncAnalyticsToSupabase(nextHistory);
            return nextHistory;
          });

          // Auto-advance to new shift window and reset active counts
          const newRange = currentWindow.timeRange;
          const newState = {
            ...prev,
            timeRange: newRange,
            depositCount: 0,
            withdrawalCount: 0,
            lastActiveHour: now.getHours()
          };

          syncCounterToSupabase(newState);
          return newState;
        }

        return prev;
      });
    };

    checkHourRollover();
    const interval = setInterval(checkHourRollover, 1000);
    return () => clearInterval(interval);
  }, []);

  // Counter State Updater
  const updateCounterState = (updater) => {
    setCounterState((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater };
      syncCounterToSupabase(next);
      return next;
    });
  };

  const handleAdjustCount = (type, delta) => {
    updateCounterState((prev) => {
      if (type === 'deposit') {
        const nextVal = Math.max(0, (prev.depositCount || 0) + delta);
        return { ...prev, depositCount: nextVal };
      } else if (type === 'withdrawal') {
        const nextVal = Math.max(0, (prev.withdrawalCount || 0) + delta);
        return { ...prev, withdrawalCount: nextVal };
      }
      return prev;
    });
  };

  const handleResetCounts = () => {
    updateCounterState((prev) => ({
      ...prev,
      depositCount: 0,
      withdrawalCount: 0
    }));
    addToast("Hour reset", "info");
  };

  const handleStepShift = (step) => {
    const nextOffset = shiftStepOffset + step;
    setShiftStepOffset(nextOffset);
    const newRange = generateHourRange(nextOffset);
    updateCounterState((prev) => ({
      ...prev,
      timeRange: newRange
    }));
  };

  const getFormattedCounterText = (customRange, customDep, customWth) => {
    const range = customRange || counterState.timeRange || generateHourRange(0);
    const dCount = customDep ?? counterState.depositCount ?? 0;
    const wCount = customWth ?? counterState.withdrawalCount ?? 0;
    const dLabel = counterState.depositLabel || 'Deposit completed';
    const wLabel = counterState.withdrawalLabel || 'Completed withdrawal';

    return `⏰ *${range}*\n📥 *${dLabel}:* ${dCount}\n📤 *${wLabel}:* ${wCount}`;
  };

  const handleCopyCounterText = async (customRange, customDep, customWth, entryId = 'active') => {
    const targetRange = customRange || counterState.timeRange || generateHourRange(0);
    const depVal = customDep !== undefined ? customDep : (counterState.depositCount ?? 0);
    const wthVal = customWth !== undefined ? customWth : (counterState.withdrawalCount ?? 0);
    const textToCopy = getFormattedCounterText(targetRange, depVal, wthVal);

    try {
      await navigator.clipboard.writeText(textToCopy);
      
      if (entryId === 'active') {
        setCopiedActiveCounter(true);
        setTimeout(() => setCopiedActiveCounter(false), 2000);
      } else {
        setCopiedId(entryId);
        setTimeout(() => setCopiedId(null), 2000);
      }

      const newAnalyticsEntry = {
        id: entryId !== 'active' && entryId ? entryId : `analytics_${Date.now()}`,
        timeRange: targetRange,
        depositCount: depVal,
        withdrawalCount: wthVal,
        copiedAt: new Date().toISOString(),
        date: new Date().toLocaleDateString([], { day: '2-digit', month: 'short' })
      };

      setAnalyticsHistory((prevHistory) => {
        const filtered = prevHistory.filter(h => h.timeRange !== targetRange);
        const updated = [newAnalyticsEntry, ...filtered];
        syncAnalyticsToSupabase(updated);
        return updated;
      });

      addToast("Report copied to clipboard", "success");
    } catch (err) {
      addToast("Failed to copy report", "error");
    }
  };

  const prevEntry = analyticsHistory.length > 0 ? analyticsHistory[0] : null;
  const prevRange = prevEntry ? prevEntry.timeRange : generateHourRange(-1);
  const prevDep = prevEntry ? (prevEntry.depositCount ?? 0) : 0;
  const prevWth = prevEntry ? (prevEntry.withdrawalCount ?? 0) : 0;

  // Active shift time display calculations
  const activeWindowObj = getShiftWindow(new Date());
  const activeRangeDisplay = counterState.timeRange || activeWindowObj.timeRange;
  const activeRangeShort = activeWindowObj.timeRangeShort;

  return (
    <div className="min-h-[calc(100vh-80px)] py-8 px-4 flex flex-col items-center justify-start text-[#F4F5F1] font-sans selection:bg-[#00D66B]/20">
      
      {/* ── MAIN CARD: HOURLY COUNTER ── */}
      <div className="w-full max-w-[760px] bg-[#1B1C22] border border-white/[0.07] rounded-[28px] p-6 sm:p-7 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        
        {/* Card Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="font-['Space_Grotesk'] text-2xl font-semibold tracking-tight text-[#F4F5F1]">
              Hourly Counter
            </h1>
            <p className="text-xs text-[#8B8E97] mt-0.5">Live transaction counting &amp; shift reports</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleResetCounts}
              className="w-9 h-9 rounded-full bg-[#232429] hover:bg-[#0E0E12] border border-white/[0.07] flex items-center justify-center text-[#8B8E97] hover:text-[#F4F5F1] transition-all cursor-pointer"
              title="Reset hour counters"
            >
              <RotateCcw size={15} />
            </button>
            <button
              onClick={() => setShowSettingsModal(!showSettingsModal)}
              className={`w-9 h-9 rounded-full border transition-all flex items-center justify-center cursor-pointer ${
                showSettingsModal 
                  ? 'bg-[#0E0E12] text-[#F4F5F1] border-white/20' 
                  : 'bg-[#232429] hover:bg-[#0E0E12] border-white/[0.07] text-[#8B8E97] hover:text-[#F4F5F1]'
              }`}
              title="Settings & Labels"
            >
              <SlidersHorizontal size={15} />
            </button>
          </div>
        </div>

        {/* Settings Subpanel if toggled */}
        {showSettingsModal && (
          <div className="mb-5 p-4 rounded-2xl bg-[#0E0E12] border border-white/[0.07] space-y-3 animate-in fade-in duration-150 text-xs">
            <div className="flex items-center justify-between text-[#8B8E97] font-medium border-b border-white/[0.05] pb-2">
              <span>Counter Settings &amp; Custom Labels</span>
              <button onClick={() => setShowSettingsModal(false)} className="hover:text-white p-0.5"><X size={13} /></button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-[#54565F] block mb-1">Deposit Label in Copied Report:</label>
                <input
                  type="text"
                  value={counterState.depositLabel || 'Deposit completed'}
                  onChange={(e) => updateCounterState({ depositLabel: e.target.value })}
                  className="w-full bg-[#1B1C22] border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-[#00D66B]"
                />
              </div>
              <div>
                <label className="text-[11px] text-[#54565F] block mb-1">Withdrawal Label in Copied Report:</label>
                <input
                  type="text"
                  value={counterState.withdrawalLabel || 'Completed withdrawal'}
                  onChange={(e) => updateCounterState({ withdrawalLabel: e.target.value })}
                  className="w-full bg-[#1B1C22] border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-[#3ED3F2]"
                />
              </div>
            </div>
          </div>
        )}

        {/* ── COUNTER VIEW ── */}
        <div>
          {/* Two Side-by-Side Boxes: Deposit & Withdrawal with Centered Time Divider */}
          <div className="relative grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
            
            {/* DEPOSIT BOX */}
            <div className="bg-[#0E0E12] border border-white/[0.07] rounded-[18px] p-5 flex flex-col justify-between">
              
              {/* Top Row: Label & Time Pill */}
              <div className="flex items-center justify-between mb-3.5">
                <span className="text-[13px] text-[#8B8E97] font-medium">Deposits:</span>
                <div className="flex items-center gap-1.5 bg-[#232429] border border-white/[0.14] rounded-full px-3 py-1 font-mono text-[11.5px] text-[#8B8E97]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00D66B]"></span>
                  <span>{activeRangeShort}</span>
                </div>
              </div>

              {/* Sub Row: Type & Status */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex flex-col gap-1.5">
                  <span className="text-[11px] text-[#54565F]">Type</span>
                  <div className="flex items-center gap-2 text-[15px] font-medium text-[#F4F5F1]">
                    <span className="w-5 h-5 rounded-full bg-[#00D66B]/15 text-[#00D66B] flex items-center justify-center shrink-0">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="w-2.5 h-2.5">
                        <path d="M12 5v14M5 12l7 7 7-7"/>
                      </svg>
                    </span>
                    <span>Deposit</span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1.5">
                  <span className="text-[11px] text-[#54565F]">Status</span>
                  <div className="flex items-center gap-1 text-[15px] font-medium text-[#F4F5F1]">
                    <span>Completed</span>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3 text-[#54565F]">
                      <path d="m6 9 6 6 6-6"/>
                    </svg>
                  </div>
                </div>
              </div>

              {/* Value Row: Count, Unit & Controls */}
              <div className="flex items-baseline justify-between pt-1">
                <div>
                  <span className="text-[13px] text-[#8B8E97]">Deposit completed:</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="font-['Space_Grotesk'] text-[38px] sm:text-[44px] font-semibold tracking-tight text-[#00D66B] leading-none">
                      {counterState.depositCount || 0}
                    </span>
                    <span className="text-[13px] text-[#54565F] font-medium">times</span>
                  </div>
                </div>

                {/* Stepper Buttons (- and +) */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleAdjustCount('deposit', -1)}
                    disabled={(counterState.depositCount || 0) <= 0}
                    className="w-10 h-10 rounded-full bg-[#232429] hover:bg-[#2c2e35] active:bg-[#0E0E12] border border-white/[0.07] text-[#8B8E97] hover:text-[#F4F5F1] disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center transition-all cursor-pointer select-none"
                  >
                    <Minus size={15} />
                  </button>
                  <button
                    onClick={() => handleAdjustCount('deposit', 1)}
                    className="w-10 h-10 rounded-full bg-[#00D66B] hover:brightness-105 active:scale-95 text-[#04170D] font-bold flex items-center justify-center transition-all cursor-pointer select-none shadow-[0_4px_12px_rgba(0,214,107,0.3)]"
                  >
                    <Plus size={16} strokeWidth={2.5} />
                  </button>
                </div>
              </div>

            </div>

            {/* WITHDRAWAL BOX */}
            <div className="bg-[#0E0E12] border border-white/[0.07] rounded-[18px] p-5 flex flex-col justify-between">
              
              {/* Top Row: Label & Time Pill */}
              <div className="flex items-center justify-between mb-3.5">
                <span className="text-[13px] text-[#8B8E97] font-medium">Withdrawals:</span>
                <div className="flex items-center gap-1.5 bg-[#232429] border border-white/[0.14] rounded-full px-3 py-1 font-mono text-[11.5px] text-[#8B8E97]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#3ED3F2]"></span>
                  <span>{activeRangeShort}</span>
                </div>
              </div>

              {/* Sub Row: Type & Status */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex flex-col gap-1.5">
                  <span className="text-[11px] text-[#54565F]">Type</span>
                  <div className="flex items-center gap-2 text-[15px] font-medium text-[#F4F5F1]">
                    <span className="w-5 h-5 rounded-full bg-[#3ED3F2]/15 text-[#3ED3F2] flex items-center justify-center shrink-0">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="w-2.5 h-2.5">
                        <path d="M12 19V5M5 12l7-7 7 7"/>
                      </svg>
                    </span>
                    <span>Withdrawal</span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1.5">
                  <span className="text-[11px] text-[#54565F]">Status</span>
                  <div className="flex items-center gap-1 text-[15px] font-medium text-[#F4F5F1]">
                    <span>Completed</span>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3 text-[#54565F]">
                      <path d="m6 9 6 6 6-6"/>
                    </svg>
                  </div>
                </div>
              </div>

              {/* Value Row: Count, Unit & Controls */}
              <div className="flex items-baseline justify-between pt-1">
                <div>
                  <span className="text-[13px] text-[#8B8E97]">Completed withdrawal:</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="font-['Space_Grotesk'] text-[38px] sm:text-[44px] font-semibold tracking-tight text-[#3ED3F2] leading-none">
                      {counterState.withdrawalCount || 0}
                    </span>
                    <span className="text-[13px] text-[#54565F] font-medium">times</span>
                  </div>
                </div>

                {/* Stepper Buttons (- and +) */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleAdjustCount('withdrawal', -1)}
                    disabled={(counterState.withdrawalCount || 0) <= 0}
                    className="w-10 h-10 rounded-full bg-[#232429] hover:bg-[#2c2e35] active:bg-[#0E0E12] border border-white/[0.07] text-[#8B8E97] hover:text-[#F4F5F1] disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center transition-all cursor-pointer select-none"
                  >
                    <Minus size={15} />
                  </button>
                  <button
                    onClick={() => handleAdjustCount('withdrawal', 1)}
                    className="w-10 h-10 rounded-full bg-[#3ED3F2] hover:brightness-105 active:scale-95 text-[#04170D] font-bold flex items-center justify-center transition-all cursor-pointer select-none shadow-[0_4px_12px_rgba(62,211,242,0.3)]"
                  >
                    <Plus size={16} strokeWidth={2.5} />
                  </button>
                </div>
              </div>

            </div>

            {/* Central Stepper Shift Clock Button between boxes */}
            <div className="hidden sm:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[34px] h-[34px] rounded-full bg-[#232429] border border-white/[0.14] items-center justify-center text-[#8B8E97] z-10 shadow-md">
              <Clock size={14} />
            </div>

          </div>

          {/* Footer Row: Active Rate & Copy Button */}
          <div className="flex items-center justify-between flex-wrap gap-4 pt-1">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 text-[13.5px]">
                <b className="font-semibold text-[#F4F5F1]">{activeRangeDisplay}</b>
                <span className="flex items-center gap-1 text-[#00D66B] text-xs font-semibold">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3 h-3">
                    <path d="m18 15-6-6-6 6"/>
                  </svg>
                  Active now
                </span>
              </div>
              <span className="text-[11.5px] text-[#54565F]">Counters auto-advance and archive on the hour boundary.</span>
            </div>

            <button
              onClick={() => handleCopyCounterText()}
              className="flex items-center gap-2 bg-[#F2E75A] hover:brightness-105 active:scale-[0.98] text-[#2A2705] font-semibold text-[14.5px] rounded-full px-6 py-3.5 transition-all cursor-pointer shadow-md"
            >
              <span>{copiedActiveCounter ? "Copied report!" : "Copy report"}</span>
              <span className="font-mono text-xs font-bold leading-none">»</span>
            </button>
          </div>

        </div>

      </div>

      {/* ── SECONDARY 2-COLUMN CARDS: LAST HOUR & LAST 6 HRS ── */}
      <div className="w-full max-w-[760px] mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
        
        {/* Card 1: Last hour stats */}
        <div className="bg-[#1B1C22] border border-white/[0.07] rounded-[22px] p-5 sm:p-6 flex flex-col justify-between shadow-lg">
          <div>
            <div className="flex items-center justify-between mb-3.5">
              <div className="flex items-center gap-2 text-sm font-medium text-[#F4F5F1]">
                <Clock size={15} className="text-[#8B8E97]" />
                <span>Last hour stats</span>
              </div>
              <span className="text-[10.5px] font-semibold text-[#54565F] bg-[#232429] px-2.5 py-1 rounded-full border border-white/[0.05]">
                Archived
              </span>
            </div>

            <div className="font-mono text-[13px] text-[#8B8E97] mb-4">
              {prevRange}
            </div>

            <div className="flex gap-2.5 mb-4">
              <div className="flex-1 bg-[#0E0E12] border border-white/[0.07] rounded-[12px] p-3">
                <div className="flex items-center gap-1.5 text-[11.5px] text-[#8B8E97] mb-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00D66B]"></span>
                  <span>Deposits</span>
                </div>
                <div className="font-['Space_Grotesk'] text-[22px] font-semibold text-[#00D66B]">
                  {prevDep}
                </div>
              </div>

              <div className="flex-1 bg-[#0E0E12] border border-white/[0.07] rounded-[12px] p-3">
                <div className="flex items-center gap-1.5 text-[11.5px] text-[#8B8E97] mb-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#3ED3F2]"></span>
                  <span>Withdrawals</span>
                </div>
                <div className="font-['Space_Grotesk'] text-[22px] font-semibold text-[#3ED3F2]">
                  {prevWth}
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => handleCopyCounterText(prevRange, prevDep, prevWth, 'last_hour_card')}
            className="w-full flex items-center justify-center gap-2 bg-[#232429] hover:bg-[#0E0E12] border border-white/[0.14] text-[#F4F5F1] font-medium text-[13px] rounded-[12px] p-3 cursor-pointer transition-colors"
          >
            <Copy size={13} />
            <span>{copiedId === 'last_hour_card' ? "Copied to clipboard!" : "Copy last hour report"}</span>
          </button>
        </div>

        {/* Card 2: Last 6 hrs — History Log */}
        {(() => {
          const sixHrsAgo = Date.now() - 6 * 60 * 60 * 1000;
          const last6hLog = analyticsHistory.filter((item) => {
            const ts = item.copiedAt
              ? new Date(item.copiedAt).getTime()
              : item.id && item.id.startsWith('analytics_')
              ? parseInt(item.id.replace('analytics_', ''), 10)
              : null;
            return ts && !isNaN(ts) && ts >= sixHrsAgo;
          });

          return (
            <div className="bg-[#1B1C22] border border-white/[0.07] rounded-[22px] p-5 sm:p-6 flex flex-col gap-3 shadow-lg">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-medium text-[#F4F5F1]">
                  <Clock size={15} className="text-[#8B8E97]" />
                  <span>Last 6 hrs</span>
                </div>
                <span className="text-[10.5px] font-mono text-[#54565F] bg-[#232429] px-2.5 py-1 rounded-full border border-white/[0.05]">
                  {last6hLog.length} window{last6hLog.length !== 1 ? 's' : ''}
                </span>
              </div>

              {/* Log Rows */}
              {last6hLog.length === 0 ? (
                <div className="py-6 text-center text-[12px] text-[#54565F]">
                  No hourly logs in the last 6 hours yet.
                </div>
              ) : (
                <div className="space-y-1.5 max-h-[210px] overflow-y-auto no-scrollbar">
                  {last6hLog.map((item, i) => (
                    <div
                      key={item.id || i}
                      className="flex items-center justify-between bg-[#0E0E12] border border-white/[0.05] rounded-[12px] px-3 py-2.5"
                    >
                      {/* Time range */}
                      <span className="font-mono text-[11.5px] text-[#8B8E97] truncate mr-2 max-w-[140px]">
                        {item.timeRange || '—'}
                      </span>

                      {/* Dep + Wth counts */}
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="flex items-center gap-1 text-[11.5px] font-mono font-semibold text-[#00D66B]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#00D66B]" />
                          {item.depositCount ?? 0}
                        </span>
                        <span className="text-[#54565F] text-xs">·</span>
                        <span className="flex items-center gap-1 text-[11.5px] font-mono font-semibold text-[#3ED3F2]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#3ED3F2]" />
                          {item.withdrawalCount ?? 0}
                        </span>
                        <button
                          onClick={() => handleCopyCounterText(item.timeRange, item.depositCount ?? 0, item.withdrawalCount ?? 0, `log_${i}`)}
                          className="ml-1.5 p-1.5 rounded-lg bg-[#232429] hover:bg-white/10 border border-white/[0.07] text-[#54565F] hover:text-white transition-all"
                          title="Copy this window's report"
                        >
                          {copiedId === `log_${i}` ? <Check size={10} className="text-[#00D66B]" /> : <Copy size={10} />}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Legend */}
              <div className="flex items-center gap-3 pt-1 border-t border-white/[0.05]">
                <span className="flex items-center gap-1 text-[11px] text-[#54565F]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00D66B]" /> Deposits
                </span>
                <span className="flex items-center gap-1 text-[11px] text-[#54565F]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#3ED3F2]" /> Withdrawals
                </span>
              </div>
            </div>
          );
        })()}

      </div>

    </div>
  );
}
