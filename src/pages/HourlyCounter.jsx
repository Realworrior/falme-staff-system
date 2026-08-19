import React, { useState, useEffect, useRef, useCallback } from "react";
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

// ─── Time Helpers ──────────────────────────────────────────────────────────────

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

function getShiftWindow(dateInput) {
  const date = new Date(dateInput);
  const hour = date.getHours();

  if (hour >= 1 && hour < 7) {
    const start = new Date(date); start.setHours(1, 0, 0, 0);
    const end   = new Date(date); end.setHours(7, 0, 0, 0);
    return {
      startTime: start, endTime: end,
      timeRange: `${formatWindowHour(start)} – ${formatWindowHour(end)}`,
      timeRangeShort: `1:00–7:00 AM`,
      startTimeCap: formatWindowHour(start),
      isNightShift: true
    };
  }

  const start = new Date(date); start.setMinutes(0, 0, 0, 0);
  const end   = new Date(start); end.setHours(end.getHours() + 1);
  return {
    startTime: start, endTime: end,
    timeRange: `${formatWindowHour(start)} – ${formatWindowHour(end)}`,
    timeRangeShort: `${formatWindowHourShort(start)}–${formatWindowHourShort(end)} ${end.getHours() >= 12 ? 'PM' : 'AM'}`,
    startTimeCap: formatWindowHour(start),
    isNightShift: false
  };
}

function generateHourRange(shiftStep = 0) {
  let date = new Date();
  if (shiftStep !== 0) {
    let steps = Math.abs(shiftStep);
    const direction = shiftStep > 0 ? 1 : -1;
    while (steps > 0) {
      const window = getShiftWindow(date);
      date = direction > 0
        ? new Date(window.endTime.getTime() + 1000)
        : new Date(window.startTime.getTime() - 1000);
      steps--;
    }
  }
  return getShiftWindow(date).timeRange;
}

// ─── Default State ─────────────────────────────────────────────────────────────

function buildDefaultCounter() {
  return {
    id: 'hourly_counter_global',
    transactionCode: '__HOURLY_COUNTER__',
    timeRange: generateHourRange(0),
    depositCount: 0,
    withdrawalCount: 0,
    depositLabel: 'Deposit completed',
    withdrawalLabel: 'Completed withdrawal',
    lastActiveHour: new Date().getHours()
  };
}

// ─── Component ─────────────────────────────────────────────────────────────────

export default function HourlyCounter() {
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [copiedActiveCounter, setCopiedActiveCounter] = useState(false);

  const toast = useToast();
  const addToast = toast?.addToast || toast?.showToast || (() => {});

  // ── State ─────────────────────────────────────────────────────────────────
  const [counterState, setCounterState] = useState(() => {
    try {
      const saved = localStorage.getItem("betfalme_mpesa_hourly_counter");
      if (!saved) return buildDefaultCounter();
      const parsed = JSON.parse(saved);
      const currentWindow = getShiftWindow(new Date()).timeRange;
      // If the saved record is from the current active window, restore its counts.
      // If it's from a previous hour, start fresh so the rollover interval
      // doesn't see a mismatch and needlessly archive + reset mid-session.
      if (parsed.timeRange && parsed.timeRange === currentWindow) {
        return { ...buildDefaultCounter(), ...parsed };
      } else {
        // Previous hour's data: keep labels/settings but reset counts
        return {
          ...buildDefaultCounter(),
          depositLabel:    parsed.depositLabel    || 'Deposit completed',
          withdrawalLabel: parsed.withdrawalLabel || 'Completed withdrawal',
          timeRange:       currentWindow,
          depositCount:    0,
          withdrawalCount: 0,
        };
      }
    } catch { return buildDefaultCounter(); }
  });

  const [analyticsHistory, setAnalyticsHistory] = useState(() => {
    try {
      const saved = localStorage.getItem("betfalme_mpesa_analytics_history");
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  // Flag to prevent realtime echo from overwriting our own optimistic writes
  const suppressRealtimeUntil = useRef(0);

  // ── Persist to localStorage ───────────────────────────────────────────────
  useEffect(() => {
    localStorage.setItem("betfalme_mpesa_hourly_counter", JSON.stringify(counterState));
  }, [counterState]);

  useEffect(() => {
    localStorage.setItem("betfalme_mpesa_analytics_history", JSON.stringify(analyticsHistory));
  }, [analyticsHistory]);

  // ── Supabase Sync (write-only from our side) ──────────────────────────────
  const syncCounterToSupabase = useCallback(async (state) => {
    try {
      await supabase.from('mpesa_codes').upsert([{
        id: 'hourly_counter_global',
        transactionCode: '__HOURLY_COUNTER__',
        raw: JSON.stringify(state),
        timestamp: new Date().toISOString()
      }]);
    } catch (err) {
      console.warn("[Counter] Supabase counter sync failed:", err);
    }
  }, []);

  const syncAnalyticsToSupabase = useCallback(async (history) => {
    try {
      await supabase.from('mpesa_codes').upsert([{
        id: 'hourly_analytics_history',
        transactionCode: '__HOURLY_ANALYTICS__',
        raw: JSON.stringify(history),
        timestamp: new Date().toISOString()
      }]);
    } catch (err) {
      console.warn("[Counter] Supabase analytics sync failed:", err);
    }
  }, []);

  // ── Initial Supabase Fetch + Realtime ─────────────────────────────────────
  useEffect(() => {
    const fetchInitial = async () => {
      try {
        const { data, error } = await supabase
          .from('mpesa_codes')
          .select('*')
          .in('id', ['hourly_counter_global', 'hourly_analytics_history']);

        if (error) { console.warn("[Counter] Supabase fetch error:", error.message); return; }
        if (!data) return;

        const currentActiveWindow = getShiftWindow(new Date()).timeRange;

        const counterRecord = data.find(r => r.id === 'hourly_counter_global');
        if (counterRecord?.raw) {
          try {
            const parsed = JSON.parse(counterRecord.raw);
            // CRITICAL: Only apply Supabase counter data if it belongs to the CURRENT
            // active time window. If it's from a previous hour, skip it — the rollover
            // will have already reset counts and we must NOT overwrite current counts.
            if (parsed.timeRange && parsed.timeRange === currentActiveWindow) {
              setCounterState(prev => ({
                ...prev,
                // Take the MAX of localStorage vs Supabase for each count
                // so neither source loses increments from a brief sync delay
                depositCount:    Math.max(prev.depositCount    ?? 0, parsed.depositCount    ?? 0),
                withdrawalCount: Math.max(prev.withdrawalCount ?? 0, parsed.withdrawalCount ?? 0),
                // Non-count fields are safe to merge
                depositLabel:    parsed.depositLabel    || prev.depositLabel,
                withdrawalLabel: parsed.withdrawalLabel || prev.withdrawalLabel,
                timeRange:       currentActiveWindow,
              }));
            } else if (parsed.timeRange && parsed.timeRange !== currentActiveWindow) {
              console.log("[Counter] Supabase record is from a different window — skipping count merge to prevent reset.");
            }
          } catch (e) { console.error("[Counter] Counter parse error:", e); }
        }

        const analyticsRecord = data.find(r => r.id === 'hourly_analytics_history');
        if (analyticsRecord?.raw) {
          try {
            const parsed = JSON.parse(analyticsRecord.raw);
            if (Array.isArray(parsed)) setAnalyticsHistory(parsed);
          } catch (e) { console.error("[Counter] Analytics parse error:", e); }
        }
      } catch (err) {
        console.warn("[Counter] Supabase connection error:", err);
      }
    };

    fetchInitial();

    // Realtime — only apply remote updates if not suppressed (i.e., from another browser/tab)
    const channel = supabase
      .channel('mpesa-hourly-counter-realtime')
      .on('postgres_changes', { event: '*', table: 'mpesa_codes', schema: 'public' }, (payload) => {
        // Ignore echoes from our own writes for 3 seconds
        if (Date.now() < suppressRealtimeUntil.current) return;

        const rec = payload.new;
        if (!rec?.raw) return;

        if (rec.id === 'hourly_counter_global') {
          try {
            const parsed = JSON.parse(rec.raw);
            const currentWindow = getShiftWindow(new Date()).timeRange;
            // Same window guard for realtime updates — never apply stale-hour data
            if (parsed.timeRange && parsed.timeRange === currentWindow) {
              setCounterState(prev => ({
                ...prev,
                depositCount:    Math.max(prev.depositCount    ?? 0, parsed.depositCount    ?? 0),
                withdrawalCount: Math.max(prev.withdrawalCount ?? 0, parsed.withdrawalCount ?? 0),
                depositLabel:    parsed.depositLabel    || prev.depositLabel,
                withdrawalLabel: parsed.withdrawalLabel || prev.withdrawalLabel,
                timeRange:       currentWindow,
              }));
            }
          } catch (e) { console.error("[Realtime] Counter parse error:", e); }
        }

        if (rec.id === 'hourly_analytics_history') {
          try {
            const parsed = JSON.parse(rec.raw);
            if (Array.isArray(parsed)) setAnalyticsHistory(parsed);
          } catch (e) { console.error("[Realtime] Analytics parse error:", e); }
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  // ── Auto Hour Rollover ────────────────────────────────────────────────────
  // Uses a ref to access latest state without re-subscribing the interval
  const counterStateRef = useRef(counterState);
  const analyticsHistoryRef = useRef(analyticsHistory);
  useEffect(() => { counterStateRef.current = counterState; }, [counterState]);
  useEffect(() => { analyticsHistoryRef.current = analyticsHistory; }, [analyticsHistory]);

  useEffect(() => {
    const checkRollover = () => {
      const now = new Date();
      const currentWindow = getShiftWindow(now);
      const prev = counterStateRef.current;

      // Only trigger rollover if the time window has actually changed
      if (!prev.timeRange || prev.timeRange === currentWindow.timeRange) return;

      const archiveEntry = {
        id: `analytics_${Date.now()}`,
        timeRange: prev.timeRange,
        depositCount: prev.depositCount || 0,
        withdrawalCount: prev.withdrawalCount || 0,
        copiedAt: new Date().toISOString(),
        autoArchived: true,
        date: new Date().toLocaleDateString([], { day: '2-digit', month: 'short' })
      };

      const nextHistory = [archiveEntry, ...analyticsHistoryRef.current.filter(h => h.timeRange !== prev.timeRange)];
      setAnalyticsHistory(nextHistory);
      syncAnalyticsToSupabase(nextHistory);

      const newState = {
        ...prev,
        timeRange: currentWindow.timeRange,
        depositCount: 0,
        withdrawalCount: 0,
        lastActiveHour: now.getHours()
      };
      setCounterState(newState);
      suppressRealtimeUntil.current = Date.now() + 3000;
      syncCounterToSupabase(newState);
    };

    checkRollover();
    const interval = setInterval(checkRollover, 5000);
    return () => clearInterval(interval);
  }, [syncCounterToSupabase, syncAnalyticsToSupabase]);

  // ── Counter Updater — optimistic + deferred Supabase write ───────────────
  const updateCounterState = useCallback((updater) => {
    setCounterState(prev => {
      const next = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater };
      // Suppress realtime echo for 3s after our own write
      suppressRealtimeUntil.current = Date.now() + 3000;
      // Defer Supabase sync outside the setState call to avoid stale closure
      setTimeout(() => syncCounterToSupabase(next), 0);
      return next;
    });
  }, [syncCounterToSupabase]);

  // ── Increment / Decrement ─────────────────────────────────────────────────
  const handleAdjustCount = useCallback((type, delta) => {
    updateCounterState(prev => {
      if (type === 'deposit') {
        return { ...prev, depositCount: Math.max(0, (prev.depositCount || 0) + delta) };
      }
      if (type === 'withdrawal') {
        return { ...prev, withdrawalCount: Math.max(0, (prev.withdrawalCount || 0) + delta) };
      }
      return prev;
    });
  }, [updateCounterState]);

  const handleResetCounts = useCallback(() => {
    updateCounterState(prev => ({ ...prev, depositCount: 0, withdrawalCount: 0 }));
    addToast("Hour counters reset", "info");
  }, [updateCounterState, addToast]);

  const handleStepShift = useCallback((step) => {
    setCounterState(prev => {
      // Compute the new range by stepping from the current stored range's anchor
      const currentWindowAnchor = (() => {
        // Walk step direction from current window
        let date = new Date();
        // Find the date that matches our current timeRange by comparing
        // Then step forward/backward from there
        return null; // fallback to live calculation below
      })();

      // Simpler: just step from "now" using the stored timeRange as reference
      // Walk N steps in direction from now
      let date = new Date();
      const now = getShiftWindow(date);
      
      // Figure out how many steps we are from current window
      // by parsing the stored timeRange and comparing hours
      // Simplest correct approach: step from NOW
      let steps = Math.abs(step);
      const dir = step > 0 ? 1 : -1;
      // Start from the boundary of the current window in prev state
      // We'll just use the current real window as origin
      date = new Date();
      while (steps > 0) {
        const w = getShiftWindow(date);
        date = dir > 0
          ? new Date(w.endTime.getTime() + 1000)
          : new Date(w.startTime.getTime() - 1000);
        steps--;
      }
      const newRange = getShiftWindow(date).timeRange;
      const next = { ...prev, timeRange: newRange };
      suppressRealtimeUntil.current = Date.now() + 3000;
      setTimeout(() => syncCounterToSupabase(next), 0);
      return next;
    });
  }, [syncCounterToSupabase]);

  // ── Copy Report ───────────────────────────────────────────────────────────
  const getFormattedCounterText = (range, dep, wth) => {
    const dLabel = counterState.depositLabel || 'Deposit completed';
    const wLabel = counterState.withdrawalLabel || 'Completed withdrawal';
    return `⏰ *${range}*\n📥 *${dLabel}:* ${dep}\n📤 *${wLabel}:* ${wth}`;
  };

  const handleCopyCounterText = useCallback(async (customRange, customDep, customWth, entryId = 'active') => {
    const range  = customRange ?? counterState.timeRange ?? generateHourRange(0);
    const dep    = customDep  !== undefined ? customDep  : (counterState.depositCount    ?? 0);
    const wth    = customWth  !== undefined ? customWth  : (counterState.withdrawalCount ?? 0);
    const text   = getFormattedCounterText(range, dep, wth);

    try {
      await navigator.clipboard.writeText(text);

      if (entryId === 'active') {
        setCopiedActiveCounter(true);
        setTimeout(() => setCopiedActiveCounter(false), 2000);
      } else {
        setCopiedId(entryId);
        setTimeout(() => setCopiedId(null), 2000);
      }

      // Archive to history on copy (deduped by timeRange)
      const entry = {
        id: entryId !== 'active' && entryId ? entryId : `analytics_${Date.now()}`,
        timeRange: range,
        depositCount: dep,
        withdrawalCount: wth,
        copiedAt: new Date().toISOString(),
        date: new Date().toLocaleDateString([], { day: '2-digit', month: 'short' })
      };

      setAnalyticsHistory(prev => {
        const next = [entry, ...prev.filter(h => h.timeRange !== range)];
        syncAnalyticsToSupabase(next);
        return next;
      });

      addToast("Report copied to clipboard", "success");
    } catch {
      addToast("Failed to copy report", "error");
    }
  }, [counterState, syncAnalyticsToSupabase, addToast]);

  // ── Derived Display Values ────────────────────────────────────────────────
  const prevEntry          = analyticsHistory[0] ?? null;
  const prevRange          = prevEntry?.timeRange  ?? generateHourRange(-1);
  const prevDep            = prevEntry?.depositCount    ?? 0;
  const prevWth            = prevEntry?.withdrawalCount ?? 0;

  const activeWindowObj    = getShiftWindow(new Date());
  const activeRangeDisplay = counterState.timeRange || activeWindowObj.timeRange;
  const activeRangeShort   = activeWindowObj.timeRangeShort;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-[calc(100vh-80px)] py-8 px-4 flex flex-col items-center justify-start text-[#F4F5F1] font-sans selection:bg-[#00D66B]/20">

      {/* ── MAIN CARD ── */}
      <div className="w-full max-w-[760px] bg-[#1B1C22] border border-white/[0.07] rounded-[28px] p-6 sm:p-7 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">

        {/* Header */}
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
              onClick={() => setShowSettingsModal(v => !v)}
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

        {/* Settings Panel */}
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

        {/* ── COUNTER BOXES ── */}
        <div>
          <div className="relative grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">

            {/* DEPOSIT BOX */}
            <div className="bg-[#0E0E12] border border-white/[0.07] rounded-[18px] p-5 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-3.5">
                <span className="text-[13px] text-[#8B8E97] font-medium">Deposits:</span>
                <div className="flex items-center gap-1.5 bg-[#232429] border border-white/[0.14] rounded-full px-3 py-1 font-mono text-[11.5px] text-[#8B8E97]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00D66B]"></span>
                  <span>{activeRangeShort}</span>
                </div>
              </div>

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

              <div className="flex items-baseline justify-between pt-1">
                <div>
                  <span className="text-[13px] text-[#8B8E97]">{counterState.depositLabel || 'Deposit completed'}:</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="font-['Space_Grotesk'] text-[38px] sm:text-[44px] font-semibold tracking-tight text-[#00D66B] leading-none">
                      {counterState.depositCount ?? 0}
                    </span>
                    <span className="text-[13px] text-[#54565F] font-medium">times</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleAdjustCount('deposit', -1)}
                    disabled={(counterState.depositCount ?? 0) <= 0}
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
              <div className="flex items-center justify-between mb-3.5">
                <span className="text-[13px] text-[#8B8E97] font-medium">Withdrawals:</span>
                <div className="flex items-center gap-1.5 bg-[#232429] border border-white/[0.14] rounded-full px-3 py-1 font-mono text-[11.5px] text-[#8B8E97]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#3ED3F2]"></span>
                  <span>{activeRangeShort}</span>
                </div>
              </div>

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

              <div className="flex items-baseline justify-between pt-1">
                <div>
                  <span className="text-[13px] text-[#8B8E97]">{counterState.withdrawalLabel || 'Completed withdrawal'}:</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="font-['Space_Grotesk'] text-[38px] sm:text-[44px] font-semibold tracking-tight text-[#3ED3F2] leading-none">
                      {counterState.withdrawalCount ?? 0}
                    </span>
                    <span className="text-[13px] text-[#54565F] font-medium">times</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleAdjustCount('withdrawal', -1)}
                    disabled={(counterState.withdrawalCount ?? 0) <= 0}
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

            {/* Central Clock Divider */}
            <div className="hidden sm:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[34px] h-[34px] rounded-full bg-[#232429] border border-white/[0.14] items-center justify-center text-[#8B8E97] z-10 shadow-md">
              <Clock size={14} />
            </div>
          </div>

          {/* Footer: Active Range + Copy Button */}
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
              <span>{copiedActiveCounter ? "Copied!" : "Copy report"}</span>
              <span className="font-mono text-xs font-bold leading-none">»</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── SECONDARY CARDS: LAST HOUR + LAST 6 HRS ── */}
      <div className="w-full max-w-[760px] mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">

        {/* Card 1: Last Hour */}
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

            <div className="font-mono text-[13px] text-[#8B8E97] mb-4">{prevRange}</div>

            <div className="flex gap-2.5 mb-4">
              <div className="flex-1 bg-[#0E0E12] border border-white/[0.07] rounded-[12px] p-3">
                <div className="flex items-center gap-1.5 text-[11.5px] text-[#8B8E97] mb-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00D66B]"></span>
                  <span>Deposits</span>
                </div>
                <div className="font-['Space_Grotesk'] text-[22px] font-semibold text-[#00D66B]">{prevDep}</div>
              </div>
              <div className="flex-1 bg-[#0E0E12] border border-white/[0.07] rounded-[12px] p-3">
                <div className="flex items-center gap-1.5 text-[11.5px] text-[#8B8E97] mb-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#3ED3F2]"></span>
                  <span>Withdrawals</span>
                </div>
                <div className="font-['Space_Grotesk'] text-[22px] font-semibold text-[#3ED3F2]">{prevWth}</div>
              </div>
            </div>
          </div>

          <button
            onClick={() => handleCopyCounterText(prevRange, prevDep, prevWth, 'last_hour_card')}
            className="w-full flex items-center justify-center gap-2 bg-[#232429] hover:bg-[#0E0E12] border border-white/[0.14] text-[#F4F5F1] font-medium text-[13px] rounded-[12px] p-3 cursor-pointer transition-colors"
          >
            <Copy size={13} />
            <span>{copiedId === 'last_hour_card' ? "Copied!" : "Copy last hour report"}</span>
          </button>
        </div>

        {/* Card 2: Last 6 hrs log */}
        {(() => {
          const sixHrsAgo = Date.now() - 6 * 60 * 60 * 1000;
          const last6hLog = analyticsHistory.filter(item => {
            const ts = item.copiedAt
              ? new Date(item.copiedAt).getTime()
              : item.id?.startsWith('analytics_')
              ? parseInt(item.id.replace('analytics_', ''), 10)
              : null;
            return ts && !isNaN(ts) && ts >= sixHrsAgo;
          });

          return (
            <div className="bg-[#1B1C22] border border-white/[0.07] rounded-[22px] p-5 sm:p-6 flex flex-col gap-3 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-medium text-[#F4F5F1]">
                  <Clock size={15} className="text-[#8B8E97]" />
                  <span>Last 6 hrs</span>
                </div>
                <span className="text-[10.5px] font-mono text-[#54565F] bg-[#232429] px-2.5 py-1 rounded-full border border-white/[0.05]">
                  {last6hLog.length} window{last6hLog.length !== 1 ? 's' : ''}
                </span>
              </div>

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
                      <span className="font-mono text-[11.5px] text-[#8B8E97] truncate mr-2 max-w-[140px]">
                        {item.timeRange || '—'}
                      </span>
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
