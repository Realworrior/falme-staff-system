import React, { useState, useEffect, useRef } from "react";
import { 
  Copy, 
  Check, 
  Trash2, 
  Search, 
  Plus, 
  Minus, 
  X, 
  Clock, 
  FileText, 
  RotateCcw,
  CheckCircle2, 
  XCircle,
  SlidersHorizontal,
  ChevronRight,
  ChevronLeft
} from "lucide-react";
import { useToast } from '../context/ToastContext';
import { supabase } from '../supabaseClient';
import { useLocation, useNavigate } from 'react-router-dom';

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
        // Step forward into next window
        date = new Date(window.endTime.getTime() + 1000);
      } else {
        // Step backward into previous window
        date = new Date(window.startTime.getTime() - 1000);
      }
      steps--;
    }
  }

  return getShiftWindow(date).timeRange;
}

function parseSMS(text) {
  const raw = text.trim();

  let transactionCode = null;
  const codePatterns = [
    /\b([A-Z]{2,4}[0-9][A-Z0-9]{5,10})\b/,
    /confirmation\s+code[:\s]+([A-Z0-9]+)/i,
    /transaction\s+(?:id|code)[:\s]+([A-Z0-9]+)/i,
    /ref(?:erence)?[:\s#]+([A-Z0-9]+)/i,
    /\b([A-Z][A-Z0-9]{7,11})\b/,
  ];
  for (const p of codePatterns) {
    const m = raw.match(p);
    if (m) { transactionCode = m[1]; break; }
  }

  let amount = null;
  for (const p of [/Ksh\s?([\d,]+\.?\d*)/i, /KES\s?([\d,]+\.?\d*)/i]) {
    const m = raw.match(p);
    if (m) { amount = `Ksh ${m[1]}`; break; }
  }

  let merchant = null;
  const mp = raw.match(/(?:paid\s+to|pay\s+to|sent\s+to|to)\s+([A-Z][A-Z0-9\s&'-]{1,28}?)(?:\s+on|\s+Ksh|\s+\d|\.|,|$)/i);
  if (mp) merchant = mp[1].trim().toUpperCase();

  let phone = null;
  for (const p of [/\b(07\d{8})\b/, /\b(\+254\d{9})\b/, /(?:from|to)\s+((?:07|01)\d{8})/i]) {
    const m = raw.match(p);
    if (m) { phone = m[1]; break; }
  }

  let dateTime = null;
  const dm = raw.match(/(\d{1,2}\/\d{1,2}\/\d{2,4})\s+at\s+(\d{1,2}:\d{2}\s*(?:AM|PM)?)/i);
  if (dm) dateTime = `${dm[1]}, ${dm[2]}`;

  const isCodeOnly = !!(transactionCode && !amount && !merchant && !phone && !dateTime);
  return { raw, transactionCode, amount, merchant, phone, dateTime, isCodeOnly };
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

export default function MpesaCodes() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryView = new URLSearchParams(location.search).get('view');
  const activeTab = queryView === 'ledger' ? 'records' : 'counter';
  
  const setActiveTab = (tab) => {
    const params = new URLSearchParams(location.search);
    if (tab === 'counter') params.delete('view');
    else params.set('view', 'ledger');
    navigate({ search: params.toString() }, { replace: true });
  };

  const [activeStep, setActiveStep] = useState(1);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [inputText, setInputText] = useState("");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  
  const [entries, setEntries] = useState(() => {
    const saved = localStorage.getItem("betfalme_mpesa_entries");
    return saved ? JSON.parse(saved) : [];
  });

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

  const [copiedId, setCopiedId] = useState(null);
  const [copiedActiveCounter, setCopiedActiveCounter] = useState(false);
  const [shiftStepOffset, setShiftStepOffset] = useState(0);

  const textareaRef = useRef(null);
  const toast = useToast();
  const addToast = toast?.addToast || toast?.showToast || (() => {});

  // Save entries to localStorage on local updates
  useEffect(() => {
    const smsOnly = entries.filter(e => e.transactionCode !== '__HOURLY_COUNTER__' && e.transactionCode !== '__HOURLY_ANALYTICS__');
    localStorage.setItem("betfalme_mpesa_entries", JSON.stringify(smsOnly));
  }, [entries]);

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
          .order('timestamp', { ascending: false });

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

          const smsEntries = data.filter(item => 
            item.id !== 'hourly_counter_global' && 
            item.transactionCode !== '__HOURLY_COUNTER__' &&
            item.id !== 'hourly_analytics_history' &&
            item.transactionCode !== '__HOURLY_ANALYTICS__'
          );
          setEntries(smsEntries);
        }
      } catch (err) {
        console.warn("Supabase connection error:", err);
      }
    };

    fetchEntries();

    // Subscribe to realtime database changes
    const channel = supabase
      .channel('mpesa-codes-realtime')
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

        // Regular SMS code entries
        if (payload.eventType === 'INSERT') {
          setEntries((prev) => {
            if (prev.some((e) => e.id === payload.new.id)) return prev;
            return [payload.new, ...prev];
          });
        } else if (payload.eventType === 'UPDATE') {
          setEntries((prev) =>
            prev.map((e) => (e.id === payload.new.id ? payload.new : e))
          );
        } else if (payload.eventType === 'DELETE') {
          setEntries((prev) => prev.filter((e) => e.id !== payload.old.id));
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
        // If current window is different from recorded active window, auto-archive the finished window
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

  // SMS Ledger Handlers
  const handleAdd = async () => {
    const text = inputText.trim();
    if (!text) return;
    const parsed = parseSMS(text);
    
    if (parsed.transactionCode && entries.some(e => e.transactionCode === parsed.transactionCode)) {
      addToast("Duplicate MPESA code detected", "error");
      return;
    }

    const randomId = typeof crypto.randomUUID === 'function' 
      ? crypto.randomUUID() 
      : Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    const newEntry = {
      ...parsed,
      id: randomId,
      copiedCode: false,
      wasCopied: false,
      verified: false,
      timestamp: new Date().toISOString(),
      keep: false,
      autoDeleteAfterCopy: false,
      copiedAt: null,
    };

    setEntries((prev) => [newEntry, ...prev]);
    setInputText("");
    addToast("Record added", "success");

    try {
      const { error } = await supabase.from('mpesa_codes').insert([newEntry]);
      if (error) console.error("Failed to sync record to database:", error.message);
    } catch (err) {
      console.warn("DB offline, saved locally.");
    }
  };

  const handleCopy = async (id) => {
    const entry = entries.find((e) => e.id === id);
    if (!entry?.transactionCode) return;
    try {
      await navigator.clipboard.writeText(entry.transactionCode);
      
      const copiedTime = entry.copiedAt || new Date().toISOString();
      setEntries((prev) =>
        prev.map((e) => (e.id === id ? { ...e, copiedCode: true, wasCopied: true, copiedAt: copiedTime } : e))
      );
      addToast("Code copied", "success");
      setTimeout(() => {
        setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, copiedCode: false } : e)));
      }, 2000);

      await supabase
        .from('mpesa_codes')
        .update({ wasCopied: true, copiedAt: copiedTime })
        .eq('id', id);

    } catch (err) {
      addToast("Failed to copy", "error");
    }
  };

  const handleToggleKeep = async (id) => {
    const entry = entries.find((e) => e.id === id);
    if (!entry) return;
    const nextVal = !entry.keep;
    setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, keep: nextVal } : e)));
    try {
      await supabase.from('mpesa_codes').update({ keep: nextVal }).eq('id', id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleVerify = async (id) => {
    const entry = entries.find((e) => e.id === id);
    if (!entry) return;
    const nextVal = !entry.verified;
    setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, verified: nextVal } : e)));
    try {
      await supabase.from('mpesa_codes').update({ verified: nextVal }).eq('id', id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
    addToast("Record deleted", "info");
    try {
      await supabase.from('mpesa_codes').delete().eq('id', id);
    } catch (err) {
      console.error(err);
    }
  };

  // Filter SMS entries
  const filtered = entries
    .filter(e => 
      e.id !== 'hourly_counter_global' && 
      e.transactionCode !== '__HOURLY_COUNTER__' &&
      e.id !== 'hourly_analytics_history' &&
      e.transactionCode !== '__HOURLY_ANALYTICS__'
    )
    .filter((e) => {
      const q = search.toLowerCase();
      return (
        !q ||
        [e.transactionCode, e.merchant, e.phone, e.amount, e.raw]
          .some((v) => v?.toLowerCase().includes(q))
      );
    });

  const RECORDS_PER_PAGE = 50;
  const totalPages = Math.ceil(filtered.length / RECORDS_PER_PAGE);
  const paginatedEntries = filtered.slice(
    (currentPage - 1) * RECORDS_PER_PAGE,
    currentPage * RECORDS_PER_PAGE
  );

  // 24-Hour Shift Analytics Metrics
  const last24hAnalytics = analyticsHistory.filter((item) => {
    if (!item) return false;
    const itemTime = item.copiedAt
      ? new Date(item.copiedAt).getTime()
      : item.timestamp
      ? new Date(item.timestamp).getTime()
      : item.id && typeof item.id === 'string' && item.id.startsWith('analytics_')
      ? parseInt(item.id.replace('analytics_', ''), 10)
      : null;

    if (!itemTime || isNaN(itemTime)) return true;
    return (Date.now() - itemTime) <= 24 * 60 * 60 * 1000;
  });

  const totalDepositsLogged = last24hAnalytics.reduce((sum, item) => sum + (item.depositCount || 0), 0);
  const totalWithdrawalsLogged = last24hAnalytics.reduce((sum, item) => sum + (item.withdrawalCount || 0), 0);

  const prevEntry = analyticsHistory.length > 0 ? analyticsHistory[0] : null;
  const prevRange = prevEntry ? prevEntry.timeRange : generateHourRange(-1);
  const prevDep = prevEntry ? (prevEntry.depositCount ?? 0) : 0;
  const prevWth = prevEntry ? (prevEntry.withdrawalCount ?? 0) : 0;

  // Active shift time display calculations
  const activeWindowObj = getShiftWindow(new Date());
  const activeRangeDisplay = counterState.timeRange || activeWindowObj.timeRange;
  const activeRangeShort = activeWindowObj.timeRangeShort;
  const activeStartCap = activeWindowObj.startTimeCap;

  return (
    <div className="min-h-[calc(100vh-80px)] py-8 px-4 flex flex-col items-center justify-start text-[#F4F5F1] font-sans selection:bg-[#00D66B]/20">
      
      {/* ── MAIN CARD: COUNTER / RECORDS ── */}
      <div className="w-full max-w-[760px] bg-[#1B1C22] border border-white/[0.07] rounded-[28px] p-6 sm:p-7 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        
        {/* Card Header with Tabs & Action Buttons */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-5">
            <button
              onClick={() => setActiveTab('counter')}
              className={`font-['Space_Grotesk'] text-xl font-semibold tracking-tight transition-colors cursor-pointer ${
                activeTab === 'counter' ? 'text-[#F4F5F1]' : 'text-[#54565F] hover:text-[#8B8E97]'
              }`}
            >
              Counter
            </button>
            <button
              onClick={() => setActiveTab('records')}
              className={`font-['Space_Grotesk'] text-xl font-semibold tracking-tight transition-colors cursor-pointer ${
                activeTab === 'records' ? 'text-[#F4F5F1]' : 'text-[#54565F] hover:text-[#8B8E97]'
              }`}
            >
              Records
            </button>
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

        {/* ── TAB CONTENT: COUNTER VIEW ── */}
        {activeTab === 'counter' && (
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
                    <div className="font-['Space_Grotesk'] text-[48px] font-semibold tracking-tight text-[#F4F5F1] leading-none mt-1.5 flex items-center gap-3">
                      <span>{counterState.depositCount ?? 0}</span>
                      <span className="text-xl text-[#54565F] font-normal">txns</span>
                    </div>
                    <div className="text-[12.5px] text-[#54565F] mt-1.5">
                      Since <b className="text-[#00D66B] font-semibold">{activeStartCap}</b>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 self-end mb-1">
                    <button
                      onClick={() => handleAdjustCount('deposit', -1)}
                      className="w-[30px] h-[30px] rounded-[9px] border border-white/[0.14] bg-[#232429] hover:bg-[#0E0E12] text-[#F4F5F1] text-base leading-none flex items-center justify-center cursor-pointer active:scale-90 transition-transform"
                      title="Minus 1"
                    >
                      –
                    </button>
                    <button
                      onClick={() => handleAdjustCount('deposit', 1)}
                      className="w-[30px] h-[30px] rounded-[9px] bg-[#00D66B] hover:brightness-105 text-[#04170D] font-bold text-base leading-none flex items-center justify-center cursor-pointer active:scale-90 transition-transform shadow-sm"
                      title="Plus 1"
                    >
                      +
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
                    <div className="font-['Space_Grotesk'] text-[48px] font-semibold tracking-tight text-[#F4F5F1] leading-none mt-1.5 flex items-center gap-3">
                      <span>{counterState.withdrawalCount ?? 0}</span>
                      <span className="text-xl text-[#54565F] font-normal">txns</span>
                    </div>
                    <div className="text-[12.5px] text-[#54565F] mt-1.5">
                      Since <b className="text-[#3ED3F2] font-semibold">{activeStartCap}</b>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 self-end mb-1">
                    <button
                      onClick={() => handleAdjustCount('withdrawal', -1)}
                      className="w-[30px] h-[30px] rounded-[9px] border border-white/[0.14] bg-[#232429] hover:bg-[#0E0E12] text-[#F4F5F1] text-base leading-none flex items-center justify-center cursor-pointer active:scale-90 transition-transform"
                      title="Minus 1"
                    >
                      –
                    </button>
                    <button
                      onClick={() => handleAdjustCount('withdrawal', 1)}
                      className="w-[30px] h-[30px] rounded-[9px] bg-[#3ED3F2] hover:brightness-105 text-[#04232B] font-bold text-base leading-none flex items-center justify-center cursor-pointer active:scale-90 transition-transform shadow-sm"
                      title="Plus 1"
                    >
                      +
                    </button>
                  </div>
                </div>

              </div>

              {/* Center Round Clock Divider Icon */}
              <div 
                onClick={() => handleStepShift(1)}
                className="hidden sm:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[34px] h-[34px] rounded-full bg-[#232429] border border-white/[0.14] items-center justify-center text-[#8B8E97] hover:text-[#F4F5F1] hover:scale-105 transition-all cursor-pointer z-10 shadow-md"
                title="Step shift window"
              >
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
                <span className="text-[11.5px] text-[#54565F]">Counters reset automatically on the hour boundary.</span>
              </div>

              <button
                onClick={() => handleCopyCounterText()}
                className="flex items-center gap-2 bg-[#F2E75A] hover:brightness-105 active:scale-[0.98] text-[#2A2705] font-semibold text-[14.5px] rounded-full px-6 py-3.5 transition-all cursor-pointer shadow-md"
              >
                <span>Copy report</span>
                <span className="font-mono text-xs font-bold leading-none">»</span>
              </button>
            </div>

          </div>
        )}

        {/* ── TAB CONTENT: RECORDS VIEW (SMS LEDGER) ── */}
        {activeTab === 'records' && (
          <div className="space-y-4">
            
            {/* Input Form */}
            <div className="bg-[#0E0E12] border border-white/[0.07] rounded-[18px] p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#8B8E97]">Add SMS Transaction</span>
                <span className="text-[11px] text-[#54565F]">Press Ctrl+Enter to save</span>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3">
                <textarea
                  ref={textareaRef}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleAdd(); }}
                  placeholder="Paste full MPESA SMS confirmation (e.g. UC8U77YY7Q Confirmed. Ksh276.00 transferred to FALMEBET LIMITED for account 0798534993 on 8/3/26 at 1:15 AM...)"
                  rows={2}
                  className="flex-1 bg-[#1B1C22] border border-white/10 rounded-xl p-3 text-white text-xs font-mono outline-none focus:border-[#00D66B] resize-none placeholder-[#54565F]"
                />
                <button
                  type="button"
                  onClick={handleAdd}
                  disabled={!inputText.trim()}
                  className="bg-[#00D66B] hover:brightness-105 text-[#04170D] font-bold text-xs py-3 px-5 rounded-full flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:pointer-events-none transition-all shrink-0 cursor-pointer"
                >
                  <Plus size={14} />
                  <span>Add Record</span>
                </button>
              </div>
            </div>

            {/* Search and Table */}
            <div className="bg-[#0E0E12] border border-white/[0.07] rounded-[18px] overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.05]">
                <Search size={14} className="text-[#54565F] shrink-0" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                  placeholder="Search transaction code, phone, amount..."
                  className="flex-1 bg-transparent text-xs text-white placeholder-[#54565F] outline-none font-mono"
                />
                {search && (
                  <button onClick={() => setSearch("")} className="text-[#54565F] hover:text-white p-1">
                    <X size={13} />
                  </button>
                )}
              </div>

              {paginatedEntries.length === 0 ? (
                <div className="text-center py-10 text-xs text-[#54565F]">
                  {entries.length === 0 ? "No SMS records stored yet. Paste an SMS to record." : "No matching records found."}
                </div>
              ) : (
                <div className="divide-y divide-white/[0.05]">
                  {paginatedEntries.map((entry) => (
                    <div key={entry.id} className="p-3 sm:px-4 flex items-center justify-between gap-3 text-xs font-mono hover:bg-white/[0.02] transition-colors">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <button
                          onClick={() => handleVerify(entry.id)}
                          className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                            entry.verified ? "bg-[#00D66B] border-[#00D66B] text-black" : "border-white/20 hover:border-white/40"
                          }`}
                        >
                          {entry.verified && <Check size={10} strokeWidth={3} />}
                        </button>
                        <span className={`font-bold truncate ${entry.verified ? "text-[#54565F] line-through" : "text-[#F4F5F1]"}`}>
                          {entry.transactionCode || "—"}
                        </span>
                        {entry.amount && <span className="text-[#00D66B] bg-[#00D66B]/10 px-1.5 py-0.5 rounded text-[11px] shrink-0">{entry.amount}</span>}
                        {entry.phone && <span className="text-[#8B8E97] hidden sm:inline truncate">{entry.phone}</span>}
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {entry.transactionCode && (
                          <button
                            onClick={() => handleCopy(entry.id)}
                            className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 ${
                              entry.copiedCode ? "bg-[#00D66B]/20 text-[#00D66B] border-[#00D66B]/40" : "bg-[#232429] text-[#8B8E97] border-white/5 hover:text-white"
                            }`}
                          >
                            {entry.copiedCode ? <Check size={12} /> : <Copy size={12} />}
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(entry.id)}
                          className="p-1.5 text-[#54565F] hover:text-red-400"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

      </div>

      {/* ── SECONDARY 2-COLUMN CARDS ── */}
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
