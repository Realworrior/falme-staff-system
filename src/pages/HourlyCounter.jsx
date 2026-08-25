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
 */
export function getPreviousShiftWindow(dateInput = new Date()) {
  const current = getShiftWindow(dateInput);
  const prevDate = new Date(current.startTime.getTime() - 60000);
  return getShiftWindow(prevDate);
}

/**
 * Formats a unique date-keyed window ID e.g. "2026-08-25_14-15" or "2026-08-25_01-07"
 */
export function getWindowKey(dateInput = new Date()) {
  const date = new Date(dateInput);
  const win = getShiftWindow(date);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}_${win.windowKey}`;
}

/**
 * Generates the last N completed windows before the given date.
 */
export function getPastWindows(count = 6, refDate = new Date()) {
  const list = [];
  let curr = new Date(getShiftWindow(refDate).startTime.getTime() - 60000);
  for (let i = 0; i < count; i++) {
    const win = getShiftWindow(curr);
    const key = getWindowKey(curr);
    list.push({ 
      ...win, 
      key, 
      dateStr: win.startTime.toLocaleDateString([], { day: '2-digit', month: 'short' }) 
    });
    curr = new Date(win.startTime.getTime() - 60000);
  }
  return list;
}

export function normalizeTimeRange(str) {
  if (!str) return '';
  return str
    .replace(/[\u2013\u2014–—]/g, '-')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function HourlyCounter() {
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [copiedActiveCounter, setCopiedActiveCounter] = useState(false);
  const [nowTime, setNowTime] = useState(() => new Date());

  const [depositLabel, setDepositLabel] = useState(() => {
    return localStorage.getItem("betfalme_mpesa_dep_label") || "Deposit completed";
  });
  const [withdrawalLabel, setWithdrawalLabel] = useState(() => {
    return localStorage.getItem("betfalme_mpesa_wth_label") || "Completed withdrawal";
  });

  const toast = useToast();
  const addToast = toast?.addToast || toast?.showToast || (() => {});

  const sessionIdRef = useRef(`tab_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`);
  const broadcastChannelRef = useRef(null);

  // ── Core State: Window-Keyed Immutable Logs Map ───────────────────────────
  // Key format: "YYYY-MM-DD_HH-HH", e.g., "2026-08-25_14-15"
  const [hourlyLogsMap, setHourlyLogsMap] = useState(() => {
    try {
      const saved = localStorage.getItem("betfalme_hourly_records_map");
      if (saved) return JSON.parse(saved);

      // Migration from legacy history if present
      const legacyHistory = localStorage.getItem("betfalme_mpesa_analytics_history");
      const legacyCounter = localStorage.getItem("betfalme_mpesa_hourly_counter");
      const map = {};

      if (legacyHistory) {
        const list = JSON.parse(legacyHistory);
        list.forEach(item => {
          if (!item.timeRange) return;
          const ts = item.copiedAt ? new Date(item.copiedAt) : new Date();
          const k = getWindowKey(ts);
          map[k] = {
            timeRange: item.timeRange,
            depositCount: item.depositCount || 0,
            withdrawalCount: item.withdrawalCount || 0,
            dateStr: item.date || ts.toLocaleDateString([], { day: '2-digit', month: 'short' }),
            updatedAt: ts.getTime()
          };
        });
      }

      if (legacyCounter) {
        const c = JSON.parse(legacyCounter);
        const k = getWindowKey(new Date());
        map[k] = {
          timeRange: c.timeRange || getShiftWindow(new Date()).timeRange,
          depositCount: c.depositCount || 0,
          withdrawalCount: c.withdrawalCount || 0,
          dateStr: new Date().toLocaleDateString([], { day: '2-digit', month: 'short' }),
          updatedAt: Date.now()
        };
      }

      return map;
    } catch {
      return {};
    }
  });

  const hourlyLogsMapRef = useRef(hourlyLogsMap);
  useEffect(() => { hourlyLogsMapRef.current = hourlyLogsMap; }, [hourlyLogsMap]);

  // Keep nowTime updated every second
  useEffect(() => {
    const timer = setInterval(() => setNowTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("betfalme_hourly_records_map", JSON.stringify(hourlyLogsMap));
    } catch {}
  }, [hourlyLogsMap]);

  useEffect(() => {
    try {
      localStorage.setItem("betfalme_mpesa_dep_label", depositLabel);
      localStorage.setItem("betfalme_mpesa_wth_label", withdrawalLabel);
    } catch {}
  }, [depositLabel, withdrawalLabel]);

  // ── Database Sync ─────────────────────────────────────────────────────────
  const syncMapToSupabase = useCallback(async (map) => {
    try {
      if (broadcastChannelRef.current) {
        broadcastChannelRef.current.send({
          type: 'broadcast',
          event: 'HOURLY_MAP_UPDATE',
          payload: { map, senderSessionId: sessionIdRef.current }
        }).catch(() => {});
      }

      // Upsert full map
      await supabase.from('mpesa_codes').upsert([{
        id: 'hourly_records_map',
        transactionCode: '__HOURLY_MAP__',
        raw: JSON.stringify(map),
        timestamp: new Date().toISOString()
      }]);

      // Also update legacy counter row for other views
      const activeK = getWindowKey(new Date());
      const activeData = map[activeK] || { depositCount: 0, withdrawalCount: 0 };
      await supabase.from('mpesa_codes').upsert([{
        id: 'hourly_counter_global',
        transactionCode: '__HOURLY_COUNTER__',
        raw: JSON.stringify({
          timeRange: getShiftWindow(new Date()).timeRange,
          depositCount: activeData.depositCount || 0,
          withdrawalCount: activeData.withdrawalCount || 0,
          depositLabel,
          withdrawalLabel,
          lastActiveHour: new Date().getHours()
        }),
        timestamp: new Date().toISOString()
      }]);
    } catch (err) {
      console.warn("[Counter] Supabase sync error:", err);
    }
  }, [depositLabel, withdrawalLabel]);

  // ── Initial Fetch & Realtime ──────────────────────────────────────────────
  useEffect(() => {
    const fetchInitial = async () => {
      try {
        const { data, error } = await supabase
          .from('mpesa_codes')
          .select('*')
          .in('id', ['hourly_records_map', 'hourly_counter_global', 'hourly_analytics_history']);

        if (error) {
          console.warn("[Counter] Supabase fetch error:", error.message);
          return;
        }

        const mapRec = data?.find(r => r.id === 'hourly_records_map' || r.transactionCode === '__HOURLY_MAP__');
        let dbMap = {};

        if (mapRec?.raw) {
          try {
            dbMap = JSON.parse(mapRec.raw) || {};
          } catch {}
        } else {
          // Fallback legacy parse
          const analyticsRec = data?.find(r => r.id === 'hourly_analytics_history' || r.transactionCode === '__HOURLY_ANALYTICS__');
          if (analyticsRec?.raw) {
            try {
              const list = JSON.parse(analyticsRec.raw);
              if (Array.isArray(list)) {
                list.forEach(item => {
                  if (!item.timeRange) return;
                  const ts = item.copiedAt ? new Date(item.copiedAt) : new Date();
                  const k = getWindowKey(ts);
                  dbMap[k] = {
                    timeRange: item.timeRange,
                    depositCount: item.depositCount || 0,
                    withdrawalCount: item.withdrawalCount || 0,
                    dateStr: item.date || ts.toLocaleDateString([], { day: '2-digit', month: 'short' }),
                    updatedAt: ts.getTime()
                  };
                });
              }
            } catch {}
          }
        }

        // Merge DB map with local map (Math.max for counts)
        setHourlyLogsMap(prev => {
          const merged = { ...prev };
          Object.entries(dbMap).forEach(([k, val]) => {
            if (!merged[k]) {
              merged[k] = val;
            } else {
              merged[k] = {
                ...merged[k],
                ...val,
                depositCount: Math.max(merged[k].depositCount || 0, val.depositCount || 0),
                withdrawalCount: Math.max(merged[k].withdrawalCount || 0, val.withdrawalCount || 0),
              };
            }
          });
          return merged;
        });
      } catch (err) {
        console.warn("[Counter] Supabase fetch failed:", err);
      }
    };

    fetchInitial();

    // Realtime channel
    const channel = supabase.channel('mpesa-hourly-counter-realtime-v2', {
      config: { broadcast: { self: false } }
    });

    channel.on('broadcast', { event: 'HOURLY_MAP_UPDATE' }, ({ payload }) => {
      if (!payload || payload.senderSessionId === sessionIdRef.current) return;
      if (payload.map) {
        setHourlyLogsMap(prev => {
          const merged = { ...prev };
          Object.entries(payload.map).forEach(([k, val]) => {
            if (!merged[k]) {
              merged[k] = val;
            } else {
              merged[k] = {
                ...merged[k],
                ...val,
                depositCount: Math.max(merged[k].depositCount || 0, val.depositCount || 0),
                withdrawalCount: Math.max(merged[k].withdrawalCount || 0, val.withdrawalCount || 0),
              };
            }
          });
          return merged;
        });
      }
    });

    channel.on('postgres_changes', { event: '*', table: 'mpesa_codes', schema: 'public' }, (payload) => {
      const rec = payload.new;
      if (rec?.id === 'hourly_records_map' && rec?.raw) {
        try {
          const incoming = JSON.parse(rec.raw);
          setHourlyLogsMap(prev => {
            const merged = { ...prev };
            Object.entries(incoming).forEach(([k, val]) => {
              if (!merged[k]) {
                merged[k] = val;
              } else {
                merged[k] = {
                  ...merged[k],
                  ...val,
                  depositCount: Math.max(merged[k].depositCount || 0, val.depositCount || 0),
                  withdrawalCount: Math.max(merged[k].withdrawalCount || 0, val.withdrawalCount || 0),
                };
              }
            });
            return merged;
          });
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
  }, []);

  // ── 5. Modify Counts for Current Active Window ───────────────────────────
  const activeWindow = getShiftWindow(nowTime);
  const activeKey = getWindowKey(nowTime);
  const activeRecord = hourlyLogsMap[activeKey] || {
    timeRange: activeWindow.timeRange,
    depositCount: 0,
    withdrawalCount: 0,
    dateStr: nowTime.toLocaleDateString([], { day: '2-digit', month: 'short' }),
    updatedAt: Date.now()
  };

  const handleAdjustCount = useCallback((type, delta) => {
    const k = getWindowKey(new Date());
    const win = getShiftWindow(new Date());

    setHourlyLogsMap(prev => {
      const current = prev[k] || {
        timeRange: win.timeRange,
        depositCount: 0,
        withdrawalCount: 0,
        dateStr: new Date().toLocaleDateString([], { day: '2-digit', month: 'short' }),
        updatedAt: Date.now()
      };

      const updated = {
        ...current,
        depositCount: type === 'deposit' ? Math.max(0, (current.depositCount || 0) + delta) : (current.depositCount || 0),
        withdrawalCount: type === 'withdrawal' ? Math.max(0, (current.withdrawalCount || 0) + delta) : (current.withdrawalCount || 0),
        updatedAt: Date.now()
      };

      const nextMap = { ...prev, [k]: updated };
      setTimeout(() => syncMapToSupabase(nextMap), 0);
      return nextMap;
    });
  }, [syncMapToSupabase]);

  const handleResetCounts = useCallback(() => {
    const k = getWindowKey(new Date());
    const win = getShiftWindow(new Date());

    setHourlyLogsMap(prev => {
      const updated = {
        timeRange: win.timeRange,
        depositCount: 0,
        withdrawalCount: 0,
        dateStr: new Date().toLocaleDateString([], { day: '2-digit', month: 'short' }),
        updatedAt: Date.now()
      };

      const nextMap = { ...prev, [k]: updated };
      setTimeout(() => syncMapToSupabase(nextMap), 0);
      return nextMap;
    });
    addToast("Hour counters reset", "info");
  }, [syncMapToSupabase, addToast]);

  // ── 6. Copying Reports ────────────────────────────────────────────────────
  const getFormattedCounterText = (range, dep, wth) => {
    return `⏰ *${range}*\n📥 *${depositLabel}:* ${dep}\n📤 *${withdrawalLabel}:* ${wth}`;
  };

  const handleCopyCounterText = useCallback(async (customRange, customDep, customWth, entryId = 'active') => {
    const range = customRange ?? activeWindow.timeRange;
    const dep   = customDep  !== undefined ? customDep  : (activeRecord.depositCount || 0);
    const wth   = customWth  !== undefined ? customWth  : (activeRecord.withdrawalCount || 0);
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

      addToast("Report copied to clipboard", "success");
    } catch {
      addToast("Failed to copy report", "error");
    }
  }, [activeWindow.timeRange, activeRecord, depositLabel, withdrawalLabel, addToast]);

  // ── 7. Previous Hour Calculation ("Last Hour Stats") ─────────────────────
  const prevWindow = getPreviousShiftWindow(nowTime);
  const prevKey = getWindowKey(prevWindow.startTime);
  const prevRecord = hourlyLogsMap[prevKey] || null;

  const prevRange = prevWindow.timeRange;
  const prevDep = prevRecord ? (prevRecord.depositCount || 0) : 0;
  const prevWth = prevRecord ? (prevRecord.withdrawalCount || 0) : 0;

  // ── 8. Last 6 Hours Windows List ─────────────────────────────────────────
  const pastWindows = getPastWindows(6, nowTime);

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
                  value={depositLabel}
                  onChange={(e) => setDepositLabel(e.target.value)}
                  className="w-full bg-[#1B1C22] border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-[#00D66B]"
                />
              </div>
              <div>
                <label className="text-[11px] text-[#54565F] block mb-1">Withdrawal Label in Copied Report:</label>
                <input
                  type="text"
                  value={withdrawalLabel}
                  onChange={(e) => setWithdrawalLabel(e.target.value)}
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
                  <span>{activeWindow.timeRangeShort}</span>
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
                  <span className="text-[13px] text-[#8B8E97]">{depositLabel}:</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="font-['Space_Grotesk'] text-[38px] sm:text-[44px] font-semibold tracking-tight text-[#00D66B] leading-none">
                      {activeRecord.depositCount || 0}
                    </span>
                    <span className="text-[13px] text-[#54565F] font-medium">times</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleAdjustCount('deposit', -1)}
                    disabled={(activeRecord.depositCount || 0) <= 0}
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
                  <span>{activeWindow.timeRangeShort}</span>
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
                  <span className="text-[13px] text-[#8B8E97]">{withdrawalLabel}:</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="font-['Space_Grotesk'] text-[38px] sm:text-[44px] font-semibold tracking-tight text-[#3ED3F2] leading-none">
                      {activeRecord.withdrawalCount || 0}
                    </span>
                    <span className="text-[13px] text-[#54565F] font-medium">times</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleAdjustCount('withdrawal', -1)}
                    disabled={(activeRecord.withdrawalCount || 0) <= 0}
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
                <b className="font-semibold text-[#F4F5F1]">{activeWindow.timeRange}</b>
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
        <div className="bg-[#1B1C22] border border-white/[0.07] rounded-[22px] p-5 sm:p-6 flex flex-col gap-3 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-medium text-[#F4F5F1]">
              <Clock size={15} className="text-[#8B8E97]" />
              <span>Last 6 hrs</span>
            </div>
            <span className="text-[10.5px] font-mono text-[#54565F] bg-[#232429] px-2.5 py-1 rounded-full border border-white/[0.05]">
              {pastWindows.length} windows
            </span>
          </div>

          <div className="space-y-1.5 max-h-[210px] overflow-y-auto no-scrollbar">
            {pastWindows.map((win, i) => {
              const record = hourlyLogsMap[win.key] || null;
              const dep = record ? (record.depositCount || 0) : 0;
              const wth = record ? (record.withdrawalCount || 0) : 0;

              return (
                <div
                  key={win.key}
                  className="flex items-center justify-between bg-[#0E0E12] border border-white/[0.05] rounded-[12px] px-3 py-2.5"
                >
                  <span className="font-mono text-[11.5px] text-[#8B8E97] truncate mr-2 max-w-[140px]">
                    {win.timeRange}
                  </span>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="flex items-center gap-1 text-[11.5px] font-mono font-semibold text-[#00D66B]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00D66B]" />
                      {dep}
                    </span>
                    <span className="text-[#54565F] text-xs">·</span>
                    <span className="flex items-center gap-1 text-[11.5px] font-mono font-semibold text-[#3ED3F2]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#3ED3F2]" />
                      {wth}
                    </span>
                    <button
                      onClick={() => handleCopyCounterText(win.timeRange, dep, wth, `log_${i}`)}
                      className="ml-1.5 p-1.5 rounded-lg bg-[#232429] hover:bg-white/10 border border-white/[0.07] text-[#54565F] hover:text-white transition-all cursor-pointer"
                      title="Copy this window's report"
                    >
                      {copiedId === `log_${i}` ? <Check size={10} className="text-[#00D66B]" /> : <Copy size={10} />}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center gap-3 pt-1 border-t border-white/[0.05]">
            <span className="flex items-center gap-1 text-[11px] text-[#54565F]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00D66B]" /> Deposits
            </span>
            <span className="flex items-center gap-1 text-[11px] text-[#54565F]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#3ED3F2]" /> Withdrawals
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
