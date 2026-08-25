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

// ─── Deterministic Time Window Engine ──────────────────────────────────────────

export function formatWindowHour(d) {
  let h = d.getHours();
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  if (h === 0) h = 12;
  return `${h}:00 ${ampm}`;
}

export function formatWindowHourShort(d) {
  let h = d.getHours();
  h = h % 12;
  if (h === 0) h = 12;
  return `${h}:00`;
}

/**
 * Returns shift window metadata:
 * - 1:00 AM to 7:00 AM is grouped as a single combined night block
 * - All other hours (7 AM - 1 AM) are 1-hour brackets
 */
export function getShiftWindow(dateInput = new Date()) {
  const date = new Date(dateInput);
  const hour = date.getHours();

  if (hour >= 1 && hour < 7) {
    const start = new Date(date);
    start.setHours(1, 0, 0, 0);
    const end = new Date(date);
    end.setHours(7, 0, 0, 0);
    return {
      windowKey: '01-07',
      startTime: start,
      endTime: end,
      timeRange: '1:00 AM – 7:00 AM',
      timeRangeShort: '1:00–7:00 AM',
      startTimeCap: '1:00 AM',
      isNightShift: true
    };
  }

  const start = new Date(date);
  start.setMinutes(0, 0, 0, 0);
  const end = new Date(start);
  end.setHours(end.getHours() + 1);

  const startAmpm = start.getHours() >= 12 ? 'PM' : 'AM';
  const endAmpm = end.getHours() >= 12 ? 'PM' : 'AM';
  const startH = start.getHours() % 12 || 12;
  const endH = end.getHours() % 12 || 12;

  const timeRangeShort = startAmpm === endAmpm
    ? `${startH}:00–${endH}:00 ${endAmpm}`
    : `${startH}:00 ${startAmpm}–${endH}:00 ${endAmpm}`;

  return {
    windowKey: `${String(start.getHours()).padStart(2, '0')}-${String(end.getHours()).padStart(2, '0')}`,
    startTime: start,
    endTime: end,
    timeRange: `${formatWindowHour(start)} – ${formatWindowHour(end)}`,
    timeRangeShort,
    startTimeCap: formatWindowHour(start),
    isNightShift: false
  };
}

/**
 * Returns the exact completed window immediately preceding the given date.
 * E.g., at 9:15 AM -> 8:00 AM – 9:00 AM
 * E.g., at 7:15 AM -> 1:00 AM – 7:00 AM
 * E.g., at 1:15 AM -> 12:00 AM – 1:00 AM
 */
export function getPreviousShiftWindow(dateInput = new Date()) {
  const current = getShiftWindow(dateInput);
  const prevDate = new Date(current.startTime.getTime() - 60000);
  return getShiftWindow(prevDate);
}

export function generateHourRange(shiftStep = 0) {
  if (shiftStep === 0) return getShiftWindow(new Date()).timeRange;
  if (shiftStep === -1) return getPreviousShiftWindow(new Date()).timeRange;
  const date = new Date();
  date.setHours(date.getHours() + shiftStep);
  return getShiftWindow(date).timeRange;
}

/**
 * Normalizes timeRange strings across hyphens, en-dashes, em-dashes and spaces
 * to eliminate lookup mismatches.
 */
export function normalizeTimeRange(str) {
  if (!str) return '';
  return str
    .replace(/[\u2013\u2014–—]/g, '-')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function buildDefaultCounter() {
  const windowObj = getShiftWindow(new Date());
  return {
    id: 'hourly_counter_global',
    transactionCode: '__HOURLY_COUNTER__',
    timeRange: windowObj.timeRange,
    depositCount: 0,
    withdrawalCount: 0,
    depositLabel: 'Deposit completed',
    withdrawalLabel: 'Completed withdrawal',
    lastActiveHour: new Date().getHours()
  };
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function HourlyCounter() {
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [copiedActiveCounter, setCopiedActiveCounter] = useState(false);

  const toast = useToast();
  const addToast = toast?.addToast || toast?.showToast || (() => {});

  const sessionIdRef = useRef(`tab_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`);
  const broadcastChannelRef = useRef(null);
  const isInitializedRef = useRef(false);

  // ── 1. Local State Initializers ──────────────────────────────────────────
  const [analyticsHistory, setAnalyticsHistory] = useState(() => {
    try {
      const saved = localStorage.getItem("betfalme_mpesa_analytics_history");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [counterState, setCounterState] = useState(() => {
    try {
      const saved = localStorage.getItem("betfalme_mpesa_hourly_counter");
      const currentWindow = getShiftWindow(new Date());
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.timeRange && normalizeTimeRange(parsed.timeRange) === normalizeTimeRange(currentWindow.timeRange)) {
          return { ...buildDefaultCounter(), ...parsed, timeRange: currentWindow.timeRange };
        }
      }
      return buildDefaultCounter();
    } catch {
      return buildDefaultCounter();
    }
  });

  const counterStateRef = useRef(counterState);
  const analyticsHistoryRef = useRef(analyticsHistory);
  useEffect(() => { counterStateRef.current = counterState; }, [counterState]);
  useEffect(() => { analyticsHistoryRef.current = analyticsHistory; }, [analyticsHistory]);

  // ── 2. LocalStorage Persistence ──────────────────────────────────────────
  useEffect(() => {
    try {
      localStorage.setItem("betfalme_mpesa_hourly_counter", JSON.stringify(counterState));
    } catch {}
  }, [counterState]);

  useEffect(() => {
    try {
      localStorage.setItem("betfalme_mpesa_analytics_history", JSON.stringify(analyticsHistory));
    } catch {}
  }, [analyticsHistory]);

  // ── 3. Supabase Sync Functions ───────────────────────────────────────────
  const syncCounterToSupabase = useCallback(async (state) => {
    try {
      const payload = {
        ...state,
        _updatedBySessionId: sessionIdRef.current,
        _updatedAt: Date.now()
      };

      // 1. Instant tab-to-tab broadcast
      if (broadcastChannelRef.current) {
        broadcastChannelRef.current.send({
          type: 'broadcast',
          event: 'COUNTER_UPDATE',
          payload: { state: payload, senderSessionId: sessionIdRef.current }
        }).catch(() => {});
      }

      // 2. Active Counter Row
      await supabase.from('mpesa_codes').upsert([{
        id: 'hourly_counter_global',
        transactionCode: '__HOURLY_COUNTER__',
        raw: JSON.stringify(payload),
        timestamp: new Date().toISOString()
      }]);
    } catch (err) {
      console.warn("[Counter] Supabase counter sync error:", err);
    }
  }, []);

  const syncAnalyticsToSupabase = useCallback(async (history) => {
    try {
      const payload = {
        history,
        _updatedBySessionId: sessionIdRef.current,
        _updatedAt: Date.now()
      };

      if (broadcastChannelRef.current) {
        broadcastChannelRef.current.send({
          type: 'broadcast',
          event: 'ANALYTICS_UPDATE',
          payload: { history, senderSessionId: sessionIdRef.current }
        }).catch(() => {});
      }

      await supabase.from('mpesa_codes').upsert([{
        id: 'hourly_analytics_history',
        transactionCode: '__HOURLY_ANALYTICS__',
        raw: JSON.stringify(history),
        timestamp: new Date().toISOString()
      }]);
    } catch (err) {
      console.warn("[Counter] Supabase analytics sync error:", err);
    }
  }, []);

  // ── 4. Initial Fetch & Realtime Subscription ─────────────────────────────
  useEffect(() => {
    const fetchInitial = async () => {
      try {
        const { data, error } = await supabase
          .from('mpesa_codes')
          .select('*')
          .in('id', ['hourly_counter_global', 'hourly_analytics_history']);

        if (error) {
          console.warn("[Counter] Supabase fetch error:", error.message);
          isInitializedRef.current = true;
          return;
        }

        const currentWindow = getShiftWindow(new Date());
        let dbHistory = [];

        // Parse DB history
        const analyticsRec = data?.find(r => r.id === 'hourly_analytics_history' || r.transactionCode === '__HOURLY_ANALYTICS__');
        if (analyticsRec?.raw) {
          try {
            const parsed = JSON.parse(analyticsRec.raw);
            if (Array.isArray(parsed)) dbHistory = parsed;
          } catch {}
        }

        // Parse active counter from DB
        const counterRec = data?.find(r => r.id === 'hourly_counter_global' || r.transactionCode === '__HOURLY_COUNTER__');
        if (counterRec?.raw) {
          try {
            const parsed = JSON.parse(counterRec.raw);
            const isSameActive = parsed.timeRange && normalizeTimeRange(parsed.timeRange) === normalizeTimeRange(currentWindow.timeRange);

            if (isSameActive) {
              setCounterState(prev => ({
                ...prev,
                depositCount: Math.max(typeof parsed.depositCount === 'number' ? parsed.depositCount : 0, prev.depositCount || 0),
                withdrawalCount: Math.max(typeof parsed.withdrawalCount === 'number' ? parsed.withdrawalCount : 0, prev.withdrawalCount || 0),
                depositLabel: parsed.depositLabel || prev.depositLabel,
                withdrawalLabel: parsed.withdrawalLabel || prev.withdrawalLabel,
                timeRange: currentWindow.timeRange,
              }));
            } else if (parsed.timeRange && !isSameActive) {
              // DB counter was from a previous hour -> merge into history immediately
              const existingIdx = dbHistory.findIndex(h => normalizeTimeRange(h.timeRange) === normalizeTimeRange(parsed.timeRange));
              if (existingIdx >= 0) {
                dbHistory[existingIdx] = {
                  ...dbHistory[existingIdx],
                  depositCount: Math.max(dbHistory[existingIdx].depositCount || 0, parsed.depositCount || 0),
                  withdrawalCount: Math.max(dbHistory[existingIdx].withdrawalCount || 0, parsed.withdrawalCount || 0),
                };
              } else {
                dbHistory.unshift({
                  id: `analytics_${Date.now()}`,
                  timeRange: parsed.timeRange,
                  depositCount: parsed.depositCount || 0,
                  withdrawalCount: parsed.withdrawalCount || 0,
                  copiedAt: new Date().toISOString(),
                  autoArchived: true,
                  date: new Date().toLocaleDateString([], { day: '2-digit', month: 'short' })
                });
              }
            }
          } catch {}
        }

        // Merge DB History + Local History with normalize deduplication
        setAnalyticsHistory(prev => {
          const map = new Map();
          for (const item of [...dbHistory, ...prev]) {
            if (!item?.timeRange) continue;
            const normKey = normalizeTimeRange(item.timeRange);
            const existing = map.get(normKey);
            if (!existing) {
              map.set(normKey, item);
            } else {
              map.set(normKey, {
                ...existing,
                ...item,
                depositCount: Math.max(existing.depositCount || 0, item.depositCount || 0),
                withdrawalCount: Math.max(existing.withdrawalCount || 0, item.withdrawalCount || 0),
                copiedAt: (new Date(item.copiedAt || 0) > new Date(existing.copiedAt || 0)) ? item.copiedAt : existing.copiedAt
              });
            }
          }
          const merged = Array.from(map.values()).sort((a, b) => new Date(b.copiedAt || 0) - new Date(a.copiedAt || 0));
          if (merged.length > dbHistory.length) {
            syncAnalyticsToSupabase(merged);
          }
          return merged;
        });

        isInitializedRef.current = true;
      } catch (err) {
        console.warn("[Counter] Supabase initialization failed:", err);
        isInitializedRef.current = true;
      }
    };

    fetchInitial();

    // Setup Realtime Broadcast and Postgres CDC
    const channel = supabase.channel('mpesa-hourly-counter-realtime', {
      config: { broadcast: { self: false } }
    });

    channel.on('broadcast', { event: 'COUNTER_UPDATE' }, ({ payload }) => {
      if (!payload || payload.senderSessionId === sessionIdRef.current) return;
      const parsed = payload.state;
      const currentWindow = getShiftWindow(new Date());
      if (parsed && (!parsed.timeRange || normalizeTimeRange(parsed.timeRange) === normalizeTimeRange(currentWindow.timeRange))) {
        setCounterState(prev => ({
          ...prev,
          depositCount: typeof parsed.depositCount === 'number' ? parsed.depositCount : prev.depositCount,
          withdrawalCount: typeof parsed.withdrawalCount === 'number' ? parsed.withdrawalCount : prev.withdrawalCount,
          depositLabel: parsed.depositLabel || prev.depositLabel,
          withdrawalLabel: parsed.withdrawalLabel || prev.withdrawalLabel,
          timeRange: currentWindow.timeRange,
        }));
      }
    });

    channel.on('broadcast', { event: 'ANALYTICS_UPDATE' }, ({ payload }) => {
      if (!payload || payload.senderSessionId === sessionIdRef.current) return;
      if (Array.isArray(payload.history)) {
        setAnalyticsHistory(prev => {
          const map = new Map();
          for (const item of [...payload.history, ...prev]) {
            if (!item?.timeRange) continue;
            const normKey = normalizeTimeRange(item.timeRange);
            const existing = map.get(normKey);
            if (!existing) {
              map.set(normKey, item);
            } else {
              map.set(normKey, {
                ...existing,
                ...item,
                depositCount: Math.max(existing.depositCount || 0, item.depositCount || 0),
                withdrawalCount: Math.max(existing.withdrawalCount || 0, item.withdrawalCount || 0),
              });
            }
          }
          return Array.from(map.values()).sort((a, b) => new Date(b.copiedAt || 0) - new Date(a.copiedAt || 0));
        });
      }
    });

    channel.on('postgres_changes', { event: '*', table: 'mpesa_codes', schema: 'public' }, (payload) => {
      const rec = payload.new;
      if (!rec?.raw) return;

      if (rec.id === 'hourly_counter_global' || rec.transactionCode === '__HOURLY_COUNTER__') {
        try {
          const parsed = JSON.parse(rec.raw);
          if (parsed._updatedBySessionId === sessionIdRef.current) return;

          const currentWindow = getShiftWindow(new Date());
          if (!parsed.timeRange || normalizeTimeRange(parsed.timeRange) === normalizeTimeRange(currentWindow.timeRange)) {
            setCounterState(prev => ({
              ...prev,
              depositCount: typeof parsed.depositCount === 'number' ? parsed.depositCount : prev.depositCount,
              withdrawalCount: typeof parsed.withdrawalCount === 'number' ? parsed.withdrawalCount : prev.withdrawalCount,
              depositLabel: parsed.depositLabel || prev.depositLabel,
              withdrawalLabel: parsed.withdrawalLabel || prev.withdrawalLabel,
              timeRange: currentWindow.timeRange,
            }));
          }
        } catch {}
      }

      if (rec.id === 'hourly_analytics_history' || rec.transactionCode === '__HOURLY_ANALYTICS__') {
        try {
          const parsed = JSON.parse(rec.raw);
          if (Array.isArray(parsed)) {
            setAnalyticsHistory(prev => {
              const map = new Map();
              for (const item of [...parsed, ...prev]) {
                if (!item?.timeRange) continue;
                const normKey = normalizeTimeRange(item.timeRange);
                const existing = map.get(normKey);
                if (!existing) {
                  map.set(normKey, item);
                } else {
                  map.set(normKey, {
                    ...existing,
                    ...item,
                    depositCount: Math.max(existing.depositCount || 0, item.depositCount || 0),
                    withdrawalCount: Math.max(existing.withdrawalCount || 0, item.withdrawalCount || 0),
                  });
                }
              }
              return Array.from(map.values()).sort((a, b) => new Date(b.copiedAt || 0) - new Date(a.copiedAt || 0));
            });
          }
        } catch {}
      }
    });

    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        broadcastChannelRef.current = channel;
      }
    });

    return () => {
      broadcastChannelRef.current = null;
      supabase.removeChannel(channel);
    };
  }, [syncAnalyticsToSupabase]);

  // ── 5. Auto Hour Rollover Engine ──────────────────────────────────────────
  useEffect(() => {
    const checkRollover = () => {
      const now = new Date();
      const currentWindow = getShiftWindow(now);
      const prev = counterStateRef.current;

      if (!prev.timeRange) return;
      if (normalizeTimeRange(prev.timeRange) === normalizeTimeRange(currentWindow.timeRange)) return;
      if (!isInitializedRef.current) return;

      // Completed window archive entry
      const archiveEntry = {
        id: `analytics_${Date.now()}`,
        timeRange: prev.timeRange,
        depositCount: prev.depositCount || 0,
        withdrawalCount: prev.withdrawalCount || 0,
        copiedAt: new Date().toISOString(),
        autoArchived: true,
        date: new Date().toLocaleDateString([], { day: '2-digit', month: 'short' })
      };

      const existingHistory = analyticsHistoryRef.current || [];
      const existingIdx = existingHistory.findIndex(h => normalizeTimeRange(h.timeRange) === normalizeTimeRange(prev.timeRange));
      let nextHistory;
      if (existingIdx >= 0) {
        nextHistory = [...existingHistory];
        nextHistory[existingIdx] = {
          ...nextHistory[existingIdx],
          depositCount: Math.max(nextHistory[existingIdx].depositCount || 0, prev.depositCount || 0),
          withdrawalCount: Math.max(nextHistory[existingIdx].withdrawalCount || 0, prev.withdrawalCount || 0),
          copiedAt: new Date().toISOString()
        };
      } else {
        nextHistory = [archiveEntry, ...existingHistory];
      }

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
      syncCounterToSupabase(newState);
    };

    checkRollover();
    const interval = setInterval(checkRollover, 2000);
    return () => clearInterval(interval);
  }, [syncCounterToSupabase, syncAnalyticsToSupabase]);

  // ── 6. Counter Modifiers ─────────────────────────────────────────────────
  const updateCounterState = useCallback((updater) => {
    setCounterState(prev => {
      const next = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater };
      setTimeout(() => syncCounterToSupabase(next), 0);
      return next;
    });
  }, [syncCounterToSupabase]);

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

  // ── 7. Formatting and Copying ─────────────────────────────────────────────
  const getFormattedCounterText = (range, dep, wth) => {
    const dLabel = counterState.depositLabel || 'Deposit completed';
    const wLabel = counterState.withdrawalLabel || 'Completed withdrawal';
    return `⏰ *${range}*\n📥 *${dLabel}:* ${dep}\n📤 *${wLabel}:* ${wth}`;
  };

  const handleCopyCounterText = useCallback(async (customRange, customDep, customWth, entryId = 'active') => {
    const activeWin = getShiftWindow(new Date());
    const range = customRange ?? counterState.timeRange ?? activeWin.timeRange;
    const dep   = customDep  !== undefined ? customDep  : (counterState.depositCount    ?? 0);
    const wth   = customWth  !== undefined ? customWth  : (counterState.withdrawalCount ?? 0);
    const text  = getFormattedCounterText(range, dep, wth);

    try {
      await navigator.clipboard.writeText(text);

      if (entryId === 'active') {
        setCopiedActiveCounter(true);
        setTimeout(() => setCopiedActiveCounter(false), 2000);
      } else {
        setCopiedId(entryId);
        setTimeout(() => setCopiedId(null), 2000);
      }

      // Save/merge to history
      const entry = {
        id: entryId !== 'active' && entryId ? entryId : `analytics_${Date.now()}`,
        timeRange: range,
        depositCount: dep,
        withdrawalCount: wth,
        copiedAt: new Date().toISOString(),
        date: new Date().toLocaleDateString([], { day: '2-digit', month: 'short' })
      };

      setAnalyticsHistory(prev => {
        const norm = normalizeTimeRange(range);
        const filtered = prev.filter(h => normalizeTimeRange(h.timeRange) !== norm);
        const next = [entry, ...filtered];
        syncAnalyticsToSupabase(next);
        return next;
      });

      addToast("Report copied to clipboard", "success");
    } catch {
      addToast("Failed to copy report", "error");
    }
  }, [counterState, syncAnalyticsToSupabase, addToast]);

  // ── 8. Derived Display Values ────────────────────────────────────────────
  const activeWindowObj = getShiftWindow(new Date());
  const activeRangeDisplay = counterState.timeRange || activeWindowObj.timeRange;
  const activeRangeShort = activeWindowObj.timeRangeShort;

  // The last completed hour window (e.g. 11:00 AM – 12:00 PM at 12:05 PM, or 1:00 AM – 7:00 AM at 7:05 AM)
  const expectedPrevWindow = getPreviousShiftWindow(new Date());
  const expectedPrevRange = expectedPrevWindow.timeRange;
  const prevEntry = analyticsHistory.find(h => 
    normalizeTimeRange(h.timeRange) === normalizeTimeRange(expectedPrevRange)
  ) || null;

  const prevRange = expectedPrevRange;
  const prevDep = prevEntry?.depositCount ?? 0;
  const prevWth = prevEntry?.withdrawalCount ?? 0;

  // ── 9. Render ────────────────────────────────────────────────────────────
  return (
    <div className="min-h-[calc(100vh-80px)] py-8 px-4 flex flex-col items-center justify-start text-[#F4F5F1] font-sans selection:bg-[#00D66B]/20 select-none">

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
              <button onClick={() => setShowSettingsModal(false)} className="hover:text-white p-0.5 cursor-pointer"><X size={13} /></button>
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
          const eightHrsAgo = Date.now() - 8 * 60 * 60 * 1000;
          const last6hLog = analyticsHistory.filter(item => {
            if (!item?.timeRange) return false;
            const ts = item.copiedAt
              ? new Date(item.copiedAt).getTime()
              : item.id?.startsWith('analytics_')
              ? parseInt(item.id.replace('analytics_', ''), 10)
              : null;
            return !ts || isNaN(ts) || ts >= eightHrsAgo;
          }).slice(0, 8);

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
                          className="ml-1.5 p-1.5 rounded-lg bg-[#232429] hover:bg-white/10 border border-white/[0.07] text-[#54565F] hover:text-white transition-all cursor-pointer"
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
