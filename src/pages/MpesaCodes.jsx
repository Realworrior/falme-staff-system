import React, { useState, useEffect, useRef } from "react";
import { 
  Copy, 
  Check, 
  Trash2, 
  Search, 
  Plus, 
  Minus,
  X, 
  ClipboardList, 
  Clock, 
  RefreshCw,
  Sparkles,
  Zap,
  Activity,
  AlertTriangle,
  TrendingUp,
  BarChart3,
  Calendar,
  FileText,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Layers,
  CheckCircle2,
  XCircle
} from "lucide-react";
import { useToast } from '../context/ToastContext';
import { supabase } from '../supabaseClient';

// Helper to calculate shift window (1 AM to 7 AM condensed, rest 1-hour brackets)
function getShiftWindow(dateInput) {
  const date = new Date(dateInput);
  const hour = date.getHours();

  // 1:00 AM to 7:00 AM condensed bracket (hours 1, 2, 3, 4, 5, 6)
  if (hour >= 1 && hour < 7) {
    const start = new Date(date);
    start.setHours(1, 0, 0, 0);
    const end = new Date(date);
    end.setHours(7, 0, 0, 0);
    const formatTime = (d) => d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
    return {
      startTime: start,
      endTime: end,
      timeRange: `${formatTime(start)} - ${formatTime(end)}`,
      isNightShift: true
    };
  } else {
    // Regular 1-hour window
    const start = new Date(date);
    start.setMinutes(0, 0, 0);
    const end = new Date(start);
    end.setHours(end.getHours() + 1);
    const formatTime = (d) => d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
    return {
      startTime: start,
      endTime: end,
      timeRange: `${formatTime(start)} - ${formatTime(end)}`,
      isNightShift: false
    };
  }
}

// Generate hour range with shift stepping support
function generateHourRange(shiftStep = 0) {
  let date = new Date();
  
  if (shiftStep !== 0) {
    let steps = Math.abs(shiftStep);
    let direction = shiftStep > 0 ? 1 : -1;
    
    while (steps > 0) {
      const window = getShiftWindow(date);
      if (direction > 0) {
        // Step forward past current shift end
        date = new Date(window.endTime.getTime() + 1000);
      } else {
        // Step backward before current shift start
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
  depositLabel: 'Deposit Completed',
  withdrawalIcon: 'check',
  withdrawalLabel: 'Completed withdrawal',
  lastActiveHour: new Date().getHours()
};

export default function MpesaCodes() {
  const [activeTab, setActiveTab] = useState("counter"); // 'counter' or 'ledger'
  const [showAnalyticsDetails, setShowAnalyticsDetails] = useState(false);
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

  const [copiedCounter, setCopiedCounter] = useState(false);
  const [shiftStepOffset, setShiftStepOffset] = useState(0);
  const [isNearHourEnd, setIsNearHourEnd] = useState(false);
  const [minutesRemaining, setMinutesRemaining] = useState(60);

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
      const currentMinute = now.getMinutes();

      // Time remaining in current shift window
      const msLeft = currentWindow.endTime.getTime() - now.getTime();
      const minsLeft = Math.max(0, Math.ceil(msLeft / 60000));
      setMinutesRemaining(minsLeft);
      setIsNearHourEnd(minsLeft <= 10);

      setCounterState((prev) => {
        // If current window is different from recorded active window
        if (prev.timeRange && prev.timeRange !== currentWindow.timeRange) {
          const finishedRange = prev.timeRange;
          const depCount = prev.depositCount || 0;
          const wthCount = prev.withdrawalCount || 0;

          // Auto-archive previous shift to Analytics
          if (depCount > 0 || wthCount > 0) {
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
              if (prevHistory.some(h => h.timeRange === finishedRange && h.date === archiveEntry.date)) {
                return prevHistory;
              }
              const nextHistory = [archiveEntry, ...prevHistory];
              syncAnalyticsToSupabase(nextHistory);
              return nextHistory;
            });
          }

          // Auto-advance to new shift window and reset counts
          const newRange = currentWindow.timeRange;
          const newState = {
            ...prev,
            timeRange: newRange,
            depositCount: 0,
            withdrawalCount: 0,
            lastActiveHour: now.getHours()
          };

          syncCounterToSupabase(newState);
          addToast(`New shift window (${newRange}). Counters auto-reset!`, "info");
          return newState;
        }

        return prev;
      });
    };

    checkHourRollover();
    const interval = setInterval(checkHourRollover, 5000);
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
    addToast("Counters reset to 0", "info");
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
    const iconToText = (key) => (key === 'x' ? '\u274c' : '\u2705');
    const dIcon = iconToText(counterState.depositIcon);
    const dLabel = counterState.depositLabel || 'Deposit Completed';
    const dCount = customDep ?? counterState.depositCount ?? 0;

    const wIcon = iconToText(counterState.withdrawalIcon);
    const wLabel = counterState.withdrawalLabel || 'Completed withdrawal';
    const wCount = customWth ?? counterState.withdrawalCount ?? 0;

    return `⏰ ${range}\n${dIcon} ${dLabel}: ${dCount}\n${wIcon} ${wLabel}: ${wCount}`;
  };

  const handleCopyCounterText = async (customRange, customDep, customWth) => {
    const textToCopy = getFormattedCounterText(customRange, customDep, customWth);
    const targetRange = customRange || counterState.timeRange || generateHourRange(0);
    const depVal = customDep ?? counterState.depositCount ?? 0;
    const wthVal = customWth ?? counterState.withdrawalCount ?? 0;

    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopiedCounter(true);

      const newAnalyticsEntry = {
        id: `analytics_${Date.now()}`,
        timeRange: targetRange,
        depositCount: depVal,
        withdrawalCount: wthVal,
        copiedAt: new Date().toISOString(),
        date: new Date().toLocaleDateString([], { day: '2-digit', month: 'short' })
      };

      setAnalyticsHistory((prevHistory) => {
        if (prevHistory.length > 0 && prevHistory[0].timeRange === targetRange && 
            Math.abs(new Date(prevHistory[0].copiedAt).getTime() - Date.now()) < 60000) {
          return prevHistory;
        }
        const updated = [newAnalyticsEntry, ...prevHistory];
        syncAnalyticsToSupabase(updated);
        return updated;
      });

      addToast("Copied MPesa report & saved to Analytics!", "success");
      setTimeout(() => setCopiedCounter(false), 3000);
    } catch (err) {
      addToast("Failed to copy report", "error");
    }
  };

  const handleClearAnalytics = async () => {
    if (window.confirm("Are you sure you want to clear all analytics history?")) {
      setAnalyticsHistory([]);
      syncAnalyticsToSupabase([]);
      addToast("Analytics history cleared", "info");
    }
  };

  const handleDeleteAnalyticsItem = async (id) => {
    setAnalyticsHistory((prev) => {
      const next = prev.filter(item => item.id !== id);
      syncAnalyticsToSupabase(next);
      return next;
    });
    addToast("Analytics entry removed", "info");
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
    addToast("Record added successfully", "success");

    try {
      const { error } = await supabase.from('mpesa_codes').insert([newEntry]);
      if (error) {
        console.error("Failed to sync record to database:", error.message);
      }
    } catch (err) {
      console.warn("DB connection offline, saved locally.");
    }
  };

  const handleCopy = async (id) => {
    const entry = entries.find((e) => e.id === id);
    if (!entry?.transactionCode) return;
    try {
      await navigator.clipboard.writeText(entry.transactionCode);
      
      const copiedTime = entry.copiedAt || new Date().toISOString();
      setEntries((prev) =>
        prev.map((e) => {
          if (e.id === id) {
            return { 
              ...e, 
              copiedCode: true, 
              wasCopied: true,
              copiedAt: copiedTime
            };
          }
          return e;
        })
      );
      addToast("Transaction code copied!", "success");
      setTimeout(() => {
        setEntries((prev) => prev.map((e) => e.id === id ? { ...e, copiedCode: false } : e));
      }, 3000);

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

    setEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, keep: nextVal } : e))
    );

    try {
      await supabase.from('mpesa_codes').update({ keep: nextVal }).eq('id', id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleAutoDelete = async (id) => {
    const entry = entries.find((e) => e.id === id);
    if (!entry) return;
    const nextVal = !entry.autoDeleteAfterCopy;

    setEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, autoDeleteAfterCopy: nextVal } : e))
    );

    try {
      await supabase.from('mpesa_codes').update({ autoDeleteAfterCopy: nextVal }).eq('id', id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleVerify = async (id) => {
    const entry = entries.find((e) => e.id === id);
    if (!entry) return;
    const nextVal = !entry.verified;

    setEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, verified: nextVal } : e))
    );

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

  const RECORDS_PER_PAGE = 100;
  const totalPages = Math.ceil(filtered.length / RECORDS_PER_PAGE);
  const paginatedEntries = filtered.slice(
    (currentPage - 1) * RECORDS_PER_PAGE,
    currentPage * RECORDS_PER_PAGE
  );

  const SESSION_BREAK_MS = 30 * 60 * 1000;
  const getBreakLabel = (prev, curr) => {
    if (!prev) return null;
    const gap = new Date(prev.timestamp).getTime() - new Date(curr.timestamp).getTime();
    if (gap < SESSION_BREAK_MS) return null;
    const hrs = Math.floor(gap / 3_600_000);
    const mins = Math.round((gap % 3_600_000) / 60_000);
    if (hrs >= 24) {
      const days = Math.floor(hrs / 24);
      return `${days}d gap`;
    }
    return hrs > 0 ? `${hrs}h ${mins > 0 ? mins + 'm ' : ''}gap` : `${mins}m gap`;
  };

  // Analytics Metrics Calculation
  const totalDepositsLogged = analyticsHistory.reduce((sum, item) => sum + (item.depositCount || 0), 0);
  const totalWithdrawalsLogged = analyticsHistory.reduce((sum, item) => sum + (item.withdrawalCount || 0), 0);
  const totalShiftsLogged = analyticsHistory.length;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8 space-y-5">

      {/* ── PAGE HEADER ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 rounded-xl bg-[#baff55]/10 border border-[#baff55]/20 text-[#baff55]">
              <ClipboardList size={20} />
            </div>
            <h1 className="text-xl md:text-2xl font-black text-white tracking-wide">MPesa Operations Hub</h1>
          </div>
          <p className="text-xs text-gray-400 font-medium">
            Hourly counters & night-shift brackets (1am-7am) + real-time analytics & SMS ledger
          </p>
        </div>

        {/* ── HEADER NAV TOGGLE SWITCH ── */}
        <div className="flex items-center bg-[#161822] p-1.5 rounded-2xl border border-white/10 self-start md:self-auto shadow-inner">
          <button
            onClick={() => setActiveTab("counter")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${
              activeTab === "counter"
                ? "bg-[#baff55] text-black shadow-lg shadow-[#baff55]/20"
                : "text-gray-400 hover:text-white bg-transparent"
            }`}
          >
            <Clock size={15} />
            <span>Counter & Analytics</span>
          </button>
          
          <button
            onClick={() => setActiveTab("ledger")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${
              activeTab === "ledger"
                ? "bg-[#baff55] text-black shadow-lg shadow-[#baff55]/20"
                : "text-gray-400 hover:text-white bg-transparent"
            }`}
          >
            <FileText size={15} />
            <span>SMS Ledger</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
              activeTab === "ledger" ? "bg-black/20 text-black font-extrabold" : "bg-white/10 text-gray-400"
            }`}>
              {filtered.length}
            </span>
          </button>
        </div>
      </div>

      {/* ── TOP MINIMIZED SHIFT ANALYTICS HEADER ── */}
      <div className="bg-[#131520] rounded-2xl p-3.5 md:px-5 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left: Section Label */}
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#baff55]/10 text-[#baff55]">
            <BarChart3 size={18} />
          </div>
          <div>
            <h3 className="text-xs font-black text-white uppercase tracking-wider">
              Shift Analytics Summary
            </h3>
            <p className="text-[10px] text-gray-400">
              Live statistics from current & past recorded shift reports
            </p>
          </div>
        </div>

        {/* Center: Live Quick Metrics */}
        <div className="flex flex-wrap items-center justify-center gap-4 bg-[#1a1c2a] px-4 py-2 rounded-xl">
          {/* Metric 1: Deposits */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">Deposits</span>
            <span className="text-base font-black font-mono text-white">{totalDepositsLogged}</span>
            <span className="text-[10px] font-bold text-black bg-[#baff55] px-2 py-0.5 rounded-full flex items-center gap-0.5">
              <CheckCircle2 size={10} /> Logged
            </span>
          </div>

          {/* Metric 2: Withdrawals */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">Withdrawals</span>
            <span className="text-base font-black font-mono text-white">{totalWithdrawalsLogged}</span>
            <span className="text-[10px] font-bold text-black bg-[#baff55] px-2 py-0.5 rounded-full flex items-center gap-0.5">
              <CheckCircle2 size={10} /> Logged
            </span>
          </div>

          {/* Metric 3: Shifts Tracked */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">Shifts</span>
            <span className="text-base font-black font-mono text-white">{totalShiftsLogged}</span>
          </div>
        </div>

        {/* Collapsible History Log Toggle Button */}
        <button
          onClick={() => setShowAnalyticsDetails(!showAnalyticsDetails)}
          className="w-full md:w-auto flex items-center justify-center gap-2 text-xs font-bold text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl transition-all shrink-0"
        >
          <span>{showAnalyticsDetails ? "Hide History Log" : "View Detailed Log"}</span>
          {showAnalyticsDetails ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>

      {/* ── EXPANDABLE DETAILED ANALYTICS LOG TABLE ── */}
      {showAnalyticsDetails && (
        <div className="bg-[#131520] rounded-2xl p-5 shadow-2xl space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between pb-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Calendar size={15} className="text-[#baff55]" />
              Detailed Shift History Log
            </h3>
            {analyticsHistory.length > 0 && (
              <button
                onClick={handleClearAnalytics}
                className="text-[11px] font-bold text-red-400 hover:text-red-300 bg-red-500/10 px-3 py-1 rounded-xl transition-all"
              >
                Clear History
              </button>
            )}
          </div>

          <div className="bg-[#0b0c12] rounded-xl overflow-hidden">
            {analyticsHistory.length === 0 ? (
              <div className="text-center py-10 text-xs text-gray-500 font-bold uppercase tracking-wider">
                No shift reports saved yet — click "Copy Hourly Report" to log analytics
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-white/[0.02] text-[9px] font-black text-gray-400 uppercase tracking-widest">
                    <tr>
                      <th className="p-3">Shift Date</th>
                      <th className="p-3">Time Window</th>
                      <th className="p-3">Deposits</th>
                      <th className="p-3">Withdrawals</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-mono">
                    {analyticsHistory.map((item) => (
                      <tr key={item.id} className="hover:bg-white/[0.01] transition-colors">
                        <td className="p-3 text-gray-400 whitespace-nowrap">
                          {item.date || new Date(item.copiedAt).toLocaleDateString([], { day: '2-digit', month: 'short' })}
                        </td>
                        <td className="p-3 text-white font-bold whitespace-nowrap">
                          <span className="flex items-center gap-1.5"><Clock size={12} className="text-gray-400" /> {item.timeRange}</span>
                        </td>
                        <td className="p-3 text-[#baff55] font-bold">
                          <span className="flex items-center gap-1"><CheckCircle2 size={12} /> {item.depositCount ?? 0}</span>
                        </td>
                        <td className="p-3 text-[#baff55] font-bold">
                          <span className="flex items-center gap-1"><CheckCircle2 size={12} /> {item.withdrawalCount ?? 0}</span>
                        </td>
                        <td className="p-3">
                          <span className={`text-[9px] font-bold px-2.5 py-1 rounded-full uppercase ${
                            item.autoArchived 
                              ? "bg-blue-500/10 text-blue-400" 
                              : "bg-[#baff55]/10 text-[#baff55]"
                          }`}>
                            {item.autoArchived ? 'Auto-Archived' : 'Copied & Logged'}
                          </span>
                        </td>
                        <td className="p-3 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleCopyCounterText(item.timeRange, item.depositCount, item.withdrawalCount)}
                              className="p-1.5 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-all"
                              title="Re-copy report"
                            >
                              <Copy size={12} />
                            </button>
                            <button
                              onClick={() => handleDeleteAnalyticsItem(item.id)}
                              className="p-1.5 text-gray-500 hover:text-red-400 bg-white/5 hover:bg-red-500/10 rounded-lg transition-all"
                              title="Delete record"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TAB 1: MPESA HOURLY COUNTER & ANALYTICS ── */}
      {activeTab === "counter" && (() => {
        const currentRange = counterState.timeRange || generateHourRange(0);
        const currentDep = counterState.depositCount ?? 0;
        const currentWth = counterState.withdrawalCount ?? 0;

        const prevEntry = analyticsHistory.length > 0 ? analyticsHistory[0] : null;
        const prevRange = prevEntry ? prevEntry.timeRange : generateHourRange(-1);
        const prevDep = prevEntry ? (prevEntry.depositCount ?? 0) : 0;
        const prevWth = prevEntry ? (prevEntry.withdrawalCount ?? 0) : 0;

        return (
          <div className="space-y-6">

            {/* End of Hour Reminder Notification Banner */}
            {isNearHourEnd && (
              <div className="bg-[#baff55]/10 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#baff55] text-black rounded-xl font-black">
                    <Clock size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                      <Clock size={16} className="text-black" /> Shift Window Ending Soon ({minutesRemaining} min remaining)
                    </h3>
                    <p className="text-xs text-gray-300">
                      Click <strong className="text-[#baff55]">Copy Report</strong> to log this shift before counters auto-reset!
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleCopyCounterText()}
                  className="w-full sm:w-auto bg-[#baff55] text-black font-black text-xs py-3 px-6 rounded-2xl flex items-center justify-center gap-2 hover:bg-[#a8f044] transition-all shrink-0 shadow-lg"
                >
                  <Copy size={14} />
                  Copy Active Hour Report
                </button>
              </div>
            )}

            {/* Responsive Grid Layout: Counter Card + Side Panel */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* Main Counter Card & Copy Controls (Left 2 cols) */}
              <div className="lg:col-span-2 space-y-6">
                {/* Main Card with CLEAN BORDERLESS styling */}
                <div className="bg-[#131520] rounded-[28px] p-6 md:p-8 shadow-2xl relative overflow-hidden space-y-6">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-[#baff55]/5 rounded-full blur-3xl pointer-events-none" />

                  {/* Counter Header */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-1">
                    <div>
                      <div className="flex items-center gap-2.5">
                        <Clock size={18} className="text-[#baff55]" />
                        <h2 className="text-lg font-black text-white uppercase tracking-wider">
                          MPesa Shift Counter
                        </h2>
                        <span className="text-[10px] font-black uppercase text-black bg-[#baff55] px-3 py-1 rounded-full flex items-center gap-1.5 shadow-md">
                          <span className="w-2 h-2 rounded-full bg-black animate-ping" /> LATEST ACTIVE HOUR
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        Counters auto-reset on hour boundary. Showing live active shift.
                      </p>
                    </div>
                  </div>

                  {/* Time Window Field */}
                  <div className="flex flex-col sm:flex-row items-center gap-3 bg-[#191b28] p-3.5 rounded-2xl">
                    <span className="text-xs font-bold text-gray-400 shrink-0 flex items-center gap-1.5">
                      <Clock size={14} className="text-[#baff55]" /> Active Shift Window:
                    </span>
                    <div className="flex-1 w-full flex items-center gap-2">
                      <button
                        onClick={() => handleStepShift(-1)}
                        className="p-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl transition-all"
                        title="Previous Shift Window"
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <input
                        type="text"
                        value={counterState.timeRange || generateHourRange(0)}
                        onChange={(e) => updateCounterState({ timeRange: e.target.value })}
                        className="flex-1 bg-[#0d0e15] rounded-xl px-3 py-2 text-sm font-mono font-bold text-[#baff55] outline-none text-center transition-all"
                        placeholder="e.g. 1:00 PM - 2:00 PM or 1:00 AM - 7:00 AM"
                      />
                      <button
                        onClick={() => handleStepShift(1)}
                        className="p-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl transition-all"
                        title="Next Shift Window"
                      >
                        <ChevronRight size={16} />
                      </button>
                      {shiftStepOffset !== 0 && (
                        <button
                          onClick={() => {
                            setShiftStepOffset(0);
                            updateCounterState({ timeRange: generateHourRange(0) });
                          }}
                          className="px-3 py-2 bg-[#baff55]/10 text-[#baff55] hover:bg-[#baff55]/20 rounded-xl text-xs font-bold transition-all"
                          title="Reset to current hour"
                        >
                          Reset
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Counter Cards Grid — BORDERLESS SOFT TINTED CARDS LIKE INSPO */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    
                    {/* Deposit Completed Card — SOFT GREEN TINTED CARD */}
                    <div className="bg-[#1b241a] rounded-2xl p-5 flex flex-col justify-between space-y-5 shadow-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateCounterState({ depositIcon: counterState.depositIcon === 'check' ? 'x' : 'check' })}
                            className="p-1.5 bg-[#baff55]/10 hover:bg-[#baff55]/20 rounded-xl transition-all"
                            title="Toggle status icon"
                          >
                            {(counterState.depositIcon === 'x') ? <XCircle size={18} className="text-red-400" /> : <CheckCircle2 size={18} className="text-[#baff55]" />}
                          </button>
                          <input
                            type="text"
                            value={counterState.depositLabel || 'Deposit Completed'}
                            onChange={(e) => updateCounterState({ depositLabel: e.target.value })}
                            className="bg-transparent text-sm font-bold text-white outline-none"
                          />
                        </div>
                        <span className="text-[10px] uppercase font-black tracking-wider text-black bg-[#baff55] px-3 py-1 rounded-full shadow">
                          DEPOSITS
                        </span>
                      </div>

                      <div className="flex items-center justify-between bg-[#0e140d] p-5 rounded-2xl">
                        <span className="text-5xl font-black font-mono text-[#baff55]">
                          {counterState.depositCount ?? 0}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleAdjustCount('deposit', -1)}
                            className="w-10 h-10 bg-black/40 hover:bg-black/60 text-white rounded-full transition-all flex items-center justify-center active:scale-95 shadow"
                            title="Decrease count"
                          >
                            <Minus size={18} />
                          </button>
                          <button
                            onClick={() => handleAdjustCount('deposit', 1)}
                            className="w-10 h-10 bg-[#baff55] text-black hover:bg-[#a8f044] rounded-full transition-all font-black flex items-center justify-center active:scale-95 shadow-md"
                            title="Increase count"
                          >
                            <Plus size={18} />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Completed Withdrawal Card — SOFT BLUE TINTED CARD */}
                    <div className="bg-[#152230] rounded-2xl p-5 flex flex-col justify-between space-y-5 shadow-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateCounterState({ withdrawalIcon: counterState.withdrawalIcon === 'check' ? 'x' : 'check' })}
                            className="p-1.5 bg-sky-400/10 hover:bg-sky-400/20 rounded-xl transition-all"
                            title="Toggle status icon"
                          >
                            {(counterState.withdrawalIcon === 'x') ? <XCircle size={18} className="text-red-400" /> : <CheckCircle2 size={18} className="text-sky-400" />}
                          </button>
                          <input
                            type="text"
                            value={counterState.withdrawalLabel || 'Completed withdrawal'}
                            onChange={(e) => updateCounterState({ withdrawalLabel: e.target.value })}
                            className="bg-transparent text-sm font-bold text-white outline-none"
                          />
                        </div>
                        <span className="text-[10px] uppercase font-black tracking-wider text-black bg-sky-400 px-3 py-1 rounded-full shadow">
                          WITHDRAWALS
                        </span>
                      </div>

                      <div className="flex items-center justify-between bg-[#0b121a] p-5 rounded-2xl">
                        <span className="text-5xl font-black font-mono text-sky-400">
                          {counterState.withdrawalCount ?? 0}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleAdjustCount('withdrawal', -1)}
                            className="w-10 h-10 bg-black/40 hover:bg-black/60 text-white rounded-full transition-all flex items-center justify-center active:scale-95 shadow"
                            title="Decrease count"
                          >
                            <Minus size={18} />
                          </button>
                          <button
                            onClick={() => handleAdjustCount('withdrawal', 1)}
                            className="w-10 h-10 bg-sky-400 text-black hover:bg-sky-300 rounded-full transition-all font-black flex items-center justify-center active:scale-95 shadow-md"
                            title="Increase count"
                          >
                            <Plus size={18} />
                          </button>
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* Copyable Summary Format Preview & Actions for Current Active Hour */}
                  <div className="bg-[#0a0b12] rounded-2xl p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-400 flex items-center gap-1.5">
                        <Sparkles size={14} className="text-[#baff55]" /> Active Hour Report Preview:
                      </span>
                    </div>

                    <pre className="bg-[#121420] rounded-xl p-4 text-xs sm:text-sm font-mono text-[#baff55] whitespace-pre-wrap select-all">
                      {getFormattedCounterText()}
                    </pre>

                    <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
                      <button
                        onClick={() => handleCopyCounterText()}
                        className="w-full bg-[#baff55] text-black hover:bg-[#a8f044] font-black text-sm py-4 px-6 rounded-2xl flex items-center justify-center gap-2 shadow-xl transition-all active:scale-[0.98]"
                      >
                        {copiedCounter ? <Check size={18} /> : <Copy size={18} />}
                        {copiedCounter ? "Copied Active Hour Report!" : "Copy Active Hour Report"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── LAST HOUR STATS SIDE PANEL (Right 1 col - BLUE THEME BORDERLESS) ── */}
              <div className="lg:col-span-1 space-y-4">
                <div className="bg-[#141829] rounded-[28px] p-6 shadow-2xl space-y-5 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

                  {/* Header */}
                  <div className="flex items-center justify-between pb-1">
                    <div className="flex items-center gap-2">
                      <Clock size={18} className="text-blue-400" />
                      <h3 className="text-sm font-black text-white uppercase tracking-wider">
                        Last Hour Stats
                      </h3>
                    </div>
                    <span className="text-[9px] font-black uppercase bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full flex items-center gap-1">
                      {prevEntry ? "Archived Shift" : "Last Shift"}
                    </span>
                  </div>

                  {/* Last Hour Card (Blue Theme Borderless) */}
                  <div className="bg-[#0e1322] rounded-2xl p-5 space-y-4 shadow-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest flex items-center gap-1">
                        <Clock size={11} className="text-blue-400" /> Shift Window:
                      </span>
                      <span className="text-[9px] font-black uppercase text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-md">
                        Previous Hour
                      </span>
                    </div>

                    <div className="text-xs font-mono font-bold text-blue-400 bg-[#161c30] px-3.5 py-2.5 rounded-xl truncate">
                      ⏰ {prevRange}
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs pt-1">
                      <div className="bg-[#171f34] p-3.5 rounded-xl">
                        <span className="text-[10px] text-gray-400 block font-sans mb-0.5">Deposits</span>
                        <span className="text-2xl font-black font-mono text-[#baff55]">{prevDep}</span>
                      </div>
                      <div className="bg-[#171f34] p-3.5 rounded-xl">
                        <span className="text-[10px] text-gray-400 block font-sans mb-0.5">Withdrawals</span>
                        <span className="text-2xl font-black font-mono text-sky-400">{prevWth}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleCopyCounterText(prevRange, prevDep, prevWth)}
                      className="w-full mt-2 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95"
                    >
                      <Copy size={14} />
                      Copy Last Hour Report
                    </button>
                  </div>

                  {/* Quick Hint */}
                  <p className="text-[11px] text-gray-400 text-center leading-relaxed">
                    Shows stats from the previous shift. Click <strong className="text-blue-400">Copy Last Hour Report</strong> to copy this shift instance.
                  </p>
                </div>
              </div>

            </div>

          </div>
        );
      })()}

      {/* ── TAB 2: SMS VERIFICATION LEDGER (NOTES) ── */}
      {activeTab === "ledger" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-2">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="p-1.5 rounded-lg bg-accent/10 border border-accent/20 text-accent">
                  <ClipboardList size={16} />
                </div>
                <h2 className="text-sm font-black text-white uppercase tracking-widest">SMS Verification Ledger</h2>
              </div>
              <p className="text-[10px] text-gray-500 uppercase font-bold tracking-[0.2em]">Temp MPESA Code Notes & SMS Repository</p>
            </div>
            <div className="text-[11px] font-bold text-gray-400 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl flex items-center gap-2 self-start sm:self-auto">
              <Clock size={12} className="text-accent" />
              <span>24h Auto-Expiry Active</span>
            </div>
          </div>

          {/* Inline SMS Input Panel */}
          <div className="glass-card border border-white/10 p-4 space-y-2">
            <div className="flex items-center gap-2 mb-1">
              <Plus size={12} className="text-accent shrink-0" />
              <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Paste Full SMS or Code</span>
              <span className="ml-auto text-[9px] text-gray-600">Duplicates auto-filtered · Ctrl+Enter to submit</span>
            </div>
            <div className="flex items-end gap-3">
              <textarea
                ref={textareaRef}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleAdd(); }}
                placeholder="UG2D2A2YF9 confirmed. Ksh1,000.00 from 0712345678 paid to METABET on 7/7/26…   or just: UG2D2A2YF9"
                rows={2}
                className="flex-1 bg-[#161616] border border-white/10 rounded-xl p-3 text-white text-sm outline-none focus:border-accent/30 focus:ring-1 focus:ring-accent/30 font-mono resize-none transition-all placeholder-gray-600 min-w-0"
              />
              <button
                type="button"
                onClick={handleAdd}
                disabled={!inputText.trim()}
                className="pill-lime shrink-0 flex items-center gap-1.5 disabled:opacity-40 disabled:pointer-events-none py-3 px-5"
              >
                <Plus size={14} />
                Add Note
              </button>
            </div>
          </div>

          {/* Ledger Card */}
          <div className="glass-card overflow-hidden">
            {/* Search */}
            <div className="flex items-center gap-3 px-4 md:px-6 py-3.5 border-b border-white/5 bg-white/[0.01]">
              <Search size={14} className="text-gray-500 shrink-0" />
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                placeholder="Search code, phone, merchant…"
                className="flex-1 bg-transparent text-sm text-white placeholder-gray-600 outline-none min-w-0"
              />
              {search && (
                <button onClick={() => setSearch("")} className="text-gray-500 hover:text-white shrink-0">
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Table Header (Desktop) */}
            <div className="hidden lg:grid text-[9px] font-black text-gray-500 uppercase tracking-widest border-b border-white/5 bg-white/[0.005]"
              style={{ gridTemplateColumns: '32px 1fr 90px 108px 108px 76px auto 32px', padding: '10px 16px', gap: '12px' }}>
              <span />
              <span>Transaction Code</span>
              <span>Amount</span>
              <span>Phone</span>
              <span>Merchant</span>
              <span>Time</span>
              <span className="text-center">Options</span>
              <span />
            </div>

            {/* Rows */}
            {paginatedEntries.length === 0 ? (
              <div className="text-center py-16 text-sm text-gray-500 font-bold uppercase tracking-wider">
                {entries.length === 0 ? "No code records yet — paste an SMS above" : "No matching records"}
              </div>
            ) : (
              paginatedEntries.map((entry, idx) => {
                const breakLabel = getBreakLabel(paginatedEntries[idx - 1], entry);
                return (
                  <React.Fragment key={entry.id}>
                    {breakLabel && (
                      <div className="flex items-center gap-3 px-4 py-2">
                        <div className="flex-1 h-px bg-white/5" />
                        <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest flex items-center gap-1.5 bg-white/[0.03] border border-white/5 rounded-full px-3 py-1">
                          <Clock size={10} />
                          {breakLabel} break
                        </span>
                        <div className="flex-1 h-px bg-white/5" />
                      </div>
                    )}

                    {/* Mobile Card */}
                    <div className={`lg:hidden px-4 py-4 border-b border-white/5 transition-colors ${
                      entry.wasCopied ? "bg-[#baff55]/[0.03] border-l-2 border-l-[#baff55]" : "hover:bg-white/[0.01]"
                    }`}>
                      <div className="flex items-center gap-2 mb-2">
                        <button
                          onClick={() => handleVerify(entry.id)}
                          className={`w-5 h-5 rounded-lg border-2 shrink-0 flex items-center justify-center transition-all ${
                            entry.verified ? "bg-[#baff55] border-[#baff55] text-black" : "border-white/20 hover:border-accent"
                          }`}
                        >
                          {entry.verified && <Check size={11} strokeWidth={3} />}
                        </button>
                        <span className={`font-mono text-sm font-bold flex-1 min-w-0 truncate ${
                          entry.verified ? "text-gray-400 line-through" : "text-white"
                        }`}>
                          {entry.transactionCode || <span className="text-gray-600 italic text-xs">No code</span>}
                        </span>
                        {entry.transactionCode && (
                          <button
                            onClick={() => handleCopy(entry.id)}
                            className={`p-1.5 rounded-lg border shrink-0 transition-all ${
                              entry.copiedCode ? "text-accent border-accent/40 bg-accent/5" : "text-gray-500 border-white/5 bg-white/5 hover:border-accent hover:text-accent"
                            }`}
                          >
                            {entry.copiedCode ? <Check size={12} /> : <Copy size={12} />}
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(entry.id)}
                          className="p-1.5 rounded-xl text-gray-600 hover:text-red-400 hover:bg-red-500/10 shrink-0 transition-all"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 pl-7">
                        {entry.amount && (
                          <span className="font-mono text-[10px] font-bold text-white bg-white/5 px-2 py-0.5 rounded-lg">{entry.amount}</span>
                        )}
                        {entry.phone && (
                          <span className="font-mono text-[10px] text-gray-300 bg-white/5 px-2 py-0.5 rounded-lg">{entry.phone}</span>
                        )}
                        {entry.merchant && (
                          <span className="text-[9px] font-black bg-accent/10 text-accent border border-accent/20 px-2 py-0.5 rounded-lg uppercase tracking-wider">{entry.merchant}</span>
                        )}
                        <span className="text-[9px] text-gray-600 ml-auto">
                          {new Date(entry.timestamp).toLocaleDateString([], { day: '2-digit', month: 'short' })} · {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 pl-7 mt-2">
                        <label className="flex items-center gap-1.5 cursor-pointer select-none" title="Auto-delete 1h after copied">
                          <input type="checkbox" checked={entry.autoDeleteAfterCopy} onChange={() => handleToggleAutoDelete(entry.id)} className="w-3 h-3 accent-accent" />
                          <span className="text-[9px] font-bold text-gray-600 uppercase">1h Kill</span>
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer select-none" title="Keep beyond 24h">
                          <input type="checkbox" checked={entry.keep} onChange={() => handleToggleKeep(entry.id)} className="w-3 h-3 accent-accent" />
                          <span className="text-[9px] font-bold text-accent uppercase">Keep</span>
                        </label>
                      </div>
                    </div>

                    {/* Desktop Row */}
                    <div
                      className={`hidden lg:grid items-center border-b border-white/5 last:border-0 transition-colors duration-200 ${
                        entry.wasCopied ? "bg-[#baff55]/[0.02] border-l-2 border-l-[#baff55]" : "hover:bg-white/[0.01]"
                      }`}
                      style={{ gridTemplateColumns: '32px 1fr 90px 108px 108px 76px auto 32px', padding: '12px 16px', gap: '12px' }}
                    >
                      <button
                        onClick={() => handleVerify(entry.id)}
                        className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all ${
                          entry.verified ? "bg-[#baff55] border-[#baff55] text-black" : "border-white/20 hover:border-accent"
                        }`}
                      >
                        {entry.verified && <Check size={11} strokeWidth={3} />}
                      </button>

                      <div className="flex items-center gap-2 min-w-0">
                        <span className={`font-mono text-sm font-bold truncate ${entry.verified ? "text-gray-400 line-through" : "text-white"}`}>
                          {entry.transactionCode || <span className="text-gray-600 font-normal italic text-xs">—</span>}
                        </span>
                        {entry.transactionCode && (
                          <button onClick={() => handleCopy(entry.id)}
                            className={`p-1.5 rounded-lg border shrink-0 transition-all ${
                              entry.copiedCode ? "text-accent border-accent/40 bg-accent/5" : "text-gray-500 border-white/5 bg-white/5 hover:border-accent hover:text-accent"
                            }`}>
                            {entry.copiedCode ? <Check size={11} /> : <Copy size={11} />}
                          </button>
                        )}
                        {entry.isCodeOnly && <span className="text-[8px] font-black text-gray-500 bg-white/10 px-1 py-0.5 rounded uppercase shrink-0">SMS</span>}
                      </div>

                      <span className="font-mono text-xs font-bold text-white truncate">
                        {entry.amount || <span className="text-gray-600 font-normal">—</span>}
                      </span>
                      <span className="font-mono text-xs text-gray-300 truncate">
                        {entry.phone || <span className="text-gray-600">—</span>}
                      </span>

                      <div className="min-w-0">
                        {entry.merchant
                          ? <span className="text-[9px] font-black bg-[#baff55]/10 text-[#baff55] border border-[#baff55]/20 px-2 py-0.5 rounded-lg uppercase tracking-wider truncate block max-w-full">{entry.merchant}</span>
                          : <span className="text-gray-600 text-xs">—</span>}
                      </div>

                      <div className="flex flex-col">
                        <span className="text-[10px] text-gray-400 whitespace-nowrap">
                          {new Date(entry.timestamp).toLocaleDateString([], { day: '2-digit', month: 'short' })}
                        </span>
                        <span className="text-[9px] text-gray-600 whitespace-nowrap">
                          {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <label className="flex items-center gap-1 cursor-pointer select-none" title="Auto-delete 1h after copied">
                          <input type="checkbox" checked={entry.autoDeleteAfterCopy} onChange={() => handleToggleAutoDelete(entry.id)} className="w-3 h-3 accent-accent" />
                          <span className="text-[8.5px] font-bold text-gray-600 uppercase whitespace-nowrap">1h Kill</span>
                        </label>
                        <label className="flex items-center gap-1 cursor-pointer select-none" title="Keep beyond 24h">
                          <input type="checkbox" checked={entry.keep} onChange={() => handleToggleKeep(entry.id)} className="w-3 h-3 accent-accent" />
                          <span className="text-[8.5px] font-bold text-accent uppercase whitespace-nowrap">Keep</span>
                        </label>
                      </div>

                      <button onClick={() => handleDelete(entry.id)}
                        className="p-1.5 rounded-xl text-gray-600 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all shrink-0">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </React.Fragment>
                );
              })
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-white/5 bg-white/[0.005]">
                <span className="text-xs text-gray-500">
                  Page <strong className="text-white">{currentPage}</strong> / <strong className="text-white">{totalPages}</strong>
                  <span className="hidden sm:inline"> · {filtered.length} records</span>
                </span>
                <div className="flex items-center gap-2">
                  <button disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)}
                    className="pill-dark py-1.5 px-4 text-xs disabled:opacity-40 disabled:pointer-events-none">Previous</button>
                  <button disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => p + 1)}
                    className="pill-dark py-1.5 px-4 text-xs disabled:opacity-40 disabled:pointer-events-none">Next</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
