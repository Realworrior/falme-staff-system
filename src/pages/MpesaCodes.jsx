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
  ChevronDown, 
  ChevronUp, 
  ChevronLeft, 
  ChevronRight, 
  RotateCcw,
  CheckCircle2, 
  XCircle,
  AlertCircle
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
      timeRange: `${formatWindowHour(start)} - ${formatWindowHour(end)}`,
      isNightShift: true
    };
  } else {
    // 1-hour standard window (e.g., 7:00 AM - 8:00 AM, 12:00 PM - 1:00 PM)
    const start = new Date(date);
    start.setMinutes(0, 0, 0, 0);
    const end = new Date(start);
    end.setHours(end.getHours() + 1);
    return {
      startTime: start,
      endTime: end,
      timeRange: `${formatWindowHour(start)} - ${formatWindowHour(end)}`,
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
  depositLabel: 'Deposit Completed',
  withdrawalIcon: 'check',
  withdrawalLabel: 'Completed withdrawal',
  lastActiveHour: new Date().getHours()
};

export default function MpesaCodes() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryView = new URLSearchParams(location.search).get('view');
  const activeTab = queryView === 'ledger' ? 'ledger' : 'counter';
  
  const setActiveTab = (tab) => {
    const params = new URLSearchParams(location.search);
    if (tab === 'counter') params.delete('view');
    else params.set('view', tab);
    navigate({ search: params.toString() }, { replace: true });
  };

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

  const [copiedId, setCopiedId] = useState(null);
  const [copiedActiveCounter, setCopiedActiveCounter] = useState(false);
  const [shiftStepOffset, setShiftStepOffset] = useState(0);
  const [isNearHourEnd, setIsNearHourEnd] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(0);

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

      // Exact ms remaining in current shift window
      const msLeft = Math.max(0, currentWindow.endTime.getTime() - now.getTime());
      const secsLeft = Math.floor(msLeft / 1000);
      setSecondsRemaining(secsLeft);
      
      // Trigger alert strictly during the last 5 minutes (300 seconds)
      setIsNearHourEnd(secsLeft > 0 && secsLeft <= 300);

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
          addToast(`Shift updated to ${newRange}. Previous hour saved to history.`, "info");
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

  const handleDeleteAnalyticsItem = async (id) => {
    setAnalyticsHistory((prev) => {
      const next = prev.filter(item => item.id !== id);
      syncAnalyticsToSupabase(next);
      return next;
    });
    addToast("History entry removed", "info");
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

  const handleToggleAutoDelete = async (id) => {
    const entry = entries.find((e) => e.id === id);
    if (!entry) return;
    const nextVal = !entry.autoDeleteAfterCopy;
    setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, autoDeleteAfterCopy: nextVal } : e)));
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

  const RECORDS_PER_PAGE = 100;
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

  const formatCountdown = (totalSecs) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-5">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">MPesa Tools</h1>
          <p className="text-xs text-[#8e8e93] mt-0.5">Hourly counter, reporting, and SMS records</p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center bg-[#131520] p-1 rounded-2xl border border-white/5 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab("counter")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === "counter"
                ? "bg-[#baff55] text-black font-bold shadow-sm"
                : "text-[#8e8e93] hover:text-white"
            }`}
          >
            <Clock size={14} />
            <span>Hourly Counter</span>
          </button>
          
          <button
            onClick={() => setActiveTab("ledger")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === "ledger"
                ? "bg-[#baff55] text-black font-bold shadow-sm"
                : "text-[#8e8e93] hover:text-white"
            }`}
          >
            <FileText size={14} />
            <span>SMS Records</span>
            {filtered.length > 0 && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                activeTab === "ledger" ? "bg-black/20 text-black font-bold" : "bg-white/10 text-[#8e8e93]"
              }`}>
                {filtered.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ── 24-HOUR STATS STRIP ── */}
      <div className="bg-[#131520] rounded-2xl p-4 border border-white/5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#191c2b] flex items-center justify-center text-[#8e8e93] shrink-0">
            <Clock size={16} />
          </div>
          <div>
            <div className="text-xs font-semibold text-white">Past 24 Hours</div>
            <div className="text-[11px] text-[#8e8e93]">Aggregated completed transactions</div>
          </div>
        </div>

        <div className="flex items-center gap-4 sm:gap-6 bg-[#191c2b] px-4 py-2 rounded-xl self-start sm:self-auto border border-white/5">
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#8e8e93]">Deposits:</span>
            <span className="text-sm font-mono font-bold text-[#baff55]">{totalDepositsLogged}</span>
          </div>
          <div className="w-px h-4 bg-white/10" />
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#8e8e93]">Withdrawals:</span>
            <span className="text-sm font-mono font-bold text-sky-400">{totalWithdrawalsLogged}</span>
          </div>
        </div>

        <button
          onClick={() => setShowAnalyticsDetails(!showAnalyticsDetails)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#191c2b] hover:bg-[#242838] text-xs font-semibold text-[#8e8e93] hover:text-white transition-all self-end sm:self-auto border border-white/5"
        >
          <span>{showAnalyticsDetails ? "Hide History" : "View History"}</span>
          {showAnalyticsDetails ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </button>
      </div>

      {/* ── COLLAPSIBLE HISTORY TABLE ── */}
      {showAnalyticsDetails && (
        <div className="bg-[#131520] rounded-2xl p-5 border border-white/5 space-y-3 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-white">Recorded Hour History</h4>
            <span className="text-xs font-mono text-[#8e8e93]">{last24hAnalytics.length} shifts logged</span>
          </div>

          {last24hAnalytics.length === 0 ? (
            <p className="text-xs text-[#8e8e93] italic py-6 text-center">
              No previous hours logged yet. They will appear here automatically when hours complete or when you copy reports.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/5 text-[#8e8e93] font-semibold">
                    <th className="pb-2.5">Time Window</th>
                    <th className="pb-2.5">Date</th>
                    <th className="pb-2.5 text-right">Deposits</th>
                    <th className="pb-2.5 text-right">Withdrawals</th>
                    <th className="pb-2.5 text-right">Total</th>
                    <th className="pb-2.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-mono">
                  {last24hAnalytics.map((item) => (
                    <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-2.5 font-sans font-medium text-white">{item.timeRange}</td>
                      <td className="py-2.5 text-[#8e8e93]">{item.date || 'Today'}</td>
                      <td className="py-2.5 text-right font-bold text-[#baff55]">{item.depositCount ?? 0}</td>
                      <td className="py-2.5 text-right font-bold text-sky-400">{item.withdrawalCount ?? 0}</td>
                      <td className="py-2.5 text-right font-bold text-white">{(item.depositCount ?? 0) + (item.withdrawalCount ?? 0)}</td>
                      <td className="py-2.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleCopyCounterText(item.timeRange, item.depositCount, item.withdrawalCount, item.id)}
                            className="px-2.5 py-1 rounded-lg bg-[#191c2b] hover:bg-[#242838] text-[11px] font-sans font-semibold text-[#8e8e93] hover:text-white transition-all flex items-center gap-1 border border-white/5"
                            title="Copy this hour's report"
                          >
                            {copiedId === item.id ? <Check size={11} className="text-[#baff55]" /> : <Copy size={11} />}
                            <span>{copiedId === item.id ? "Copied" : "Copy"}</span>
                          </button>
                          <button
                            onClick={() => handleDeleteAnalyticsItem(item.id)}
                            className="p-1 rounded-lg hover:bg-red-500/10 text-[#8e8e93] hover:text-red-400 transition-colors"
                            title="Delete entry"
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
      )}

      {/* ── TAB 1: HOURLY COUNTER ── */}
      {activeTab === "counter" && (
        <div className="space-y-6">

          {/* Near-End Alert Notice */}
          {isNearHourEnd && (
            <div className="bg-amber-500/10 border border-amber-500/20 text-amber-300 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <AlertCircle size={16} className="text-amber-400 shrink-0" />
                <span>Current hour window is ending ({formatCountdown(secondsRemaining)} left). Make sure to copy your report.</span>
              </div>
              <button
                onClick={() => handleCopyCounterText()}
                className="bg-amber-400 hover:bg-amber-300 text-black font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shrink-0 transition-all cursor-pointer"
              >
                <Copy size={13} />
                <span>Copy Report</span>
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Main Active Counter (8 cols) */}
            <div className="lg:col-span-8 bg-[#131520] rounded-[24px] p-5 sm:p-6 border border-white/5 space-y-5">
              
              {/* Header & Reset */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-white">Active Hour</h2>
                  <p className="text-xs text-[#8e8e93] mt-0.5">Track and copy hourly transaction counts</p>
                </div>
                <button
                  onClick={handleResetCounts}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#191c2b] hover:bg-[#242838] text-xs font-semibold text-[#8e8e93] hover:text-white transition-all border border-white/5 cursor-pointer"
                  title="Reset both counts to 0"
                >
                  <RotateCcw size={12} />
                  <span>Reset</span>
                </button>
              </div>

              {/* Time Window Bar */}
              <div className="flex items-center justify-between gap-2 bg-[#191c2b] p-2 sm:p-2.5 rounded-2xl border border-white/5">
                <button
                  onClick={() => handleStepShift(-1)}
                  className="p-2 rounded-xl hover:bg-white/5 text-[#8e8e93] hover:text-white transition-colors"
                  title="Previous hour"
                >
                  <ChevronLeft size={16} />
                </button>

                <div className="flex-1 flex items-center justify-center gap-2">
                  <Clock size={14} className="text-[#baff55]" />
                  <input
                    type="text"
                    value={counterState.timeRange || generateHourRange(0)}
                    onChange={(e) => updateCounterState({ timeRange: e.target.value })}
                    className="bg-transparent text-xs sm:text-sm font-mono font-bold text-white text-center outline-none w-48 sm:w-60 focus:text-[#baff55]"
                    placeholder="e.g. 1:00 PM - 2:00 PM"
                  />
                  {shiftStepOffset !== 0 && (
                    <button
                      onClick={() => {
                        setShiftStepOffset(0);
                        updateCounterState({ timeRange: generateHourRange(0) });
                      }}
                      className="text-[10px] font-bold text-[#baff55] hover:underline px-1.5"
                    >
                      (Current)
                    </button>
                  )}
                </div>

                <button
                  onClick={() => handleStepShift(1)}
                  className="p-2 rounded-xl hover:bg-white/5 text-[#8e8e93] hover:text-white transition-colors"
                  title="Next hour"
                >
                  <ChevronRight size={16} />
                </button>
              </div>

              {/* Counter Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Deposit Counter */}
                <div className="bg-[#191c2b] rounded-2xl p-4 sm:p-5 border border-white/5 flex flex-col justify-between space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <button
                        onClick={() => updateCounterState({ depositIcon: counterState.depositIcon === 'check' ? 'x' : 'check' })}
                        className="p-1 rounded-lg hover:bg-white/5 text-[#8e8e93] shrink-0"
                        title="Toggle status icon"
                      >
                        {counterState.depositIcon === 'x' ? <XCircle size={16} className="text-red-400" /> : <CheckCircle2 size={16} className="text-[#baff55]" />}
                      </button>
                      <input
                        type="text"
                        value={counterState.depositLabel || 'Deposit Completed'}
                        onChange={(e) => updateCounterState({ depositLabel: e.target.value })}
                        className="bg-transparent text-xs font-semibold text-white outline-none truncate"
                      />
                    </div>
                    <span className="text-[10px] font-bold text-[#baff55] bg-[#baff55]/10 px-2 py-0.5 rounded-md shrink-0">
                      DEPOSITS
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-4xl sm:text-5xl font-mono font-bold text-white">
                      {counterState.depositCount ?? 0}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleAdjustCount('deposit', -1)}
                        className="w-9 h-9 rounded-xl bg-[#131520] hover:bg-white/10 text-white font-bold flex items-center justify-center transition-all border border-white/5 active:scale-95 cursor-pointer"
                        title="Decrease"
                      >
                        <Minus size={15} />
                      </button>
                      <button
                        onClick={() => handleAdjustCount('deposit', 1)}
                        className="w-9 h-9 rounded-xl bg-[#baff55] hover:bg-[#a8f044] text-black font-bold flex items-center justify-center transition-all active:scale-95 cursor-pointer shadow-sm"
                        title="Increase"
                      >
                        <Plus size={15} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Withdrawal Counter */}
                <div className="bg-[#191c2b] rounded-2xl p-4 sm:p-5 border border-white/5 flex flex-col justify-between space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <button
                        onClick={() => updateCounterState({ withdrawalIcon: counterState.withdrawalIcon === 'check' ? 'x' : 'check' })}
                        className="p-1 rounded-lg hover:bg-white/5 text-[#8e8e93] shrink-0"
                        title="Toggle status icon"
                      >
                        {counterState.withdrawalIcon === 'x' ? <XCircle size={16} className="text-red-400" /> : <CheckCircle2 size={16} className="text-sky-400]" />}
                      </button>
                      <input
                        type="text"
                        value={counterState.withdrawalLabel || 'Completed withdrawal'}
                        onChange={(e) => updateCounterState({ withdrawalLabel: e.target.value })}
                        className="bg-transparent text-xs font-semibold text-white outline-none truncate"
                      />
                    </div>
                    <span className="text-[10px] font-bold text-sky-400 bg-sky-400/10 px-2 py-0.5 rounded-md shrink-0">
                      WITHDRAWALS
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-4xl sm:text-5xl font-mono font-bold text-white">
                      {counterState.withdrawalCount ?? 0}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleAdjustCount('withdrawal', -1)}
                        className="w-9 h-9 rounded-xl bg-[#131520] hover:bg-white/10 text-white font-bold flex items-center justify-center transition-all border border-white/5 active:scale-95 cursor-pointer"
                        title="Decrease"
                      >
                        <Minus size={15} />
                      </button>
                      <button
                        onClick={() => handleAdjustCount('withdrawal', 1)}
                        className="w-9 h-9 rounded-xl bg-sky-400 hover:bg-sky-300 text-black font-bold flex items-center justify-center transition-all active:scale-95 cursor-pointer shadow-sm"
                        title="Increase"
                      >
                        <Plus size={15} />
                      </button>
                    </div>
                  </div>
                </div>

              </div>

              {/* Formatted Report Preview & Copy Button */}
              <div className="pt-2 space-y-3">
                <div className="bg-[#191c2b] rounded-2xl p-3.5 sm:p-4 border border-white/5">
                  <div className="text-[11px] font-semibold text-[#8e8e93] mb-2">Report Output Preview:</div>
                  <pre className="text-xs sm:text-sm font-mono text-white whitespace-pre-wrap select-all leading-relaxed">
                    {getFormattedCounterText()}
                  </pre>
                </div>

                <button
                  onClick={() => handleCopyCounterText()}
                  className="w-full bg-[#baff55] hover:bg-[#a8f044] text-black font-bold text-sm py-3.5 px-6 rounded-full flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.99] cursor-pointer"
                >
                  {copiedActiveCounter ? <Check size={16} /> : <Copy size={16} />}
                  <span>{copiedActiveCounter ? "Copied to Clipboard!" : "Copy Active Hour Report"}</span>
                </button>
              </div>

            </div>

            {/* Previous Hour Quick Card (4 cols) */}
            <div className="lg:col-span-4 bg-[#131520] rounded-[24px] p-5 sm:p-6 border border-white/5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white">Previous Hour</h3>
                <span className="text-[11px] text-[#8e8e93]">Auto-Saved</span>
              </div>

              <div className="bg-[#191c2b] rounded-2xl p-4 border border-white/5 space-y-3">
                <div className="text-xs font-mono font-semibold text-white">
                  ⏰ {prevRange}
                </div>

                <div className="grid grid-cols-2 gap-2.5 pt-1">
                  <div className="bg-[#131520] p-3 rounded-xl border border-white/5">
                    <span className="text-[11px] text-[#8e8e93] block">Deposits</span>
                    <span className="text-xl font-mono font-bold text-[#baff55]">{prevDep}</span>
                  </div>
                  <div className="bg-[#131520] p-3 rounded-xl border border-white/5">
                    <span className="text-[11px] text-[#8e8e93] block">Withdrawals</span>
                    <span className="text-xl font-mono font-bold text-sky-400">{prevWth}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleCopyCounterText(prevRange, prevDep, prevWth, 'prev_quick')}
                  className="w-full mt-2 bg-[#131520] hover:bg-[#242838] border border-white/5 text-white font-semibold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  {copiedId === 'prev_quick' ? <Check size={13} className="text-[#baff55]" /> : <Copy size={13} />}
                  <span>{copiedId === 'prev_quick' ? "Copied!" : "Copy Previous Hour"}</span>
                </button>
              </div>

              <p className="text-[11px] text-[#8e8e93] leading-relaxed">
                When the hour changes, current counts auto-archive here and in History.
              </p>
            </div>

          </div>

        </div>
      )}

      {/* ── TAB 2: SMS RECORDS LEDGER ── */}
      {activeTab === "ledger" && (
        <div className="space-y-5">
          
          {/* Input Panel */}
          <div className="bg-[#131520] rounded-[24px] p-4 sm:p-5 border border-white/5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">Add SMS Transaction</span>
              <span className="text-[11px] text-[#8e8e93]">Press Ctrl+Enter to submit</span>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3">
              <textarea
                ref={textareaRef}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleAdd(); }}
                placeholder="Paste full MPESA SMS confirmation (e.g. UG2D2A2YF9 confirmed. Ksh1,000.00 from 0712345678...) or code"
                rows={2}
                className="flex-1 bg-[#191c2b] border border-white/5 rounded-2xl p-3.5 text-white text-xs sm:text-sm outline-none focus:border-[#baff55] font-mono resize-none placeholder-[#8e8e93]"
              />
              <button
                type="button"
                onClick={handleAdd}
                disabled={!inputText.trim()}
                className="bg-[#baff55] hover:bg-[#a8f044] text-black font-bold text-xs py-3 px-5 rounded-full flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:pointer-events-none transition-all shrink-0 cursor-pointer"
              >
                <Plus size={14} />
                <span>Add Record</span>
              </button>
            </div>
          </div>

          {/* Ledger Table & Search */}
          <div className="bg-[#131520] rounded-[24px] border border-white/5 overflow-hidden">
            
            {/* Search Bar */}
            <div className="flex items-center gap-3 px-5 py-3.5 border-b border-white/5 bg-white/[0.01]">
              <Search size={14} className="text-[#8e8e93] shrink-0" />
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                placeholder="Search transaction code, phone, merchant, amount..."
                className="flex-1 bg-transparent text-xs sm:text-sm text-white placeholder-[#8e8e93] outline-none"
              />
              {search && (
                <button onClick={() => setSearch("")} className="text-[#8e8e93] hover:text-white p-1">
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Desktop Table Header */}
            <div 
              className="hidden lg:grid text-[11px] font-bold text-[#8e8e93] uppercase tracking-wider border-b border-white/5 bg-[#191c2b]/50 px-5 py-3 gap-3 items-center"
              style={{ gridTemplateColumns: '28px 1fr 100px 120px 120px 90px 100px 32px' }}
            >
              <span />
              <span>Transaction Code</span>
              <span>Amount</span>
              <span>Phone</span>
              <span>Merchant</span>
              <span>Time</span>
              <span className="text-center">Flags</span>
              <span />
            </div>

            {/* Rows */}
            {paginatedEntries.length === 0 ? (
              <div className="text-center py-12 text-xs text-[#8e8e93]">
                {entries.length === 0 ? "No records yet. Paste an SMS above to add." : "No records match your search."}
              </div>
            ) : (
              paginatedEntries.map((entry) => (
                <div key={entry.id}>
                  {/* Mobile Row */}
                  <div className={`lg:hidden p-4 border-b border-white/5 space-y-2.5 ${
                    entry.wasCopied ? "bg-[#baff55]/[0.02]" : ""
                  }`}>
                    <div className="flex items-center gap-2.5">
                      <button
                        onClick={() => handleVerify(entry.id)}
                        className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-all ${
                          entry.verified ? "bg-[#baff55] border-[#baff55] text-black" : "border-white/20 hover:border-white/40"
                        }`}
                      >
                        {entry.verified && <Check size={11} strokeWidth={3} />}
                      </button>
                      <span className={`font-mono text-sm font-bold flex-1 truncate ${
                        entry.verified ? "text-[#8e8e93] line-through" : "text-white"
                      }`}>
                        {entry.transactionCode || "No code detected"}
                      </span>
                      {entry.transactionCode && (
                        <button
                          onClick={() => handleCopy(entry.id)}
                          className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 ${
                            entry.copiedCode ? "bg-[#baff55]/20 text-[#baff55] border-[#baff55]/40" : "bg-[#191c2b] text-[#8e8e93] border-white/5"
                          }`}
                        >
                          {entry.copiedCode ? <Check size={12} /> : <Copy size={12} />}
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(entry.id)}
                        className="p-1.5 rounded-lg text-[#8e8e93] hover:text-red-400"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                      {entry.amount && <span className="text-[#baff55] bg-white/5 px-2 py-0.5 rounded-md">{entry.amount}</span>}
                      {entry.phone && <span className="text-white bg-white/5 px-2 py-0.5 rounded-md">{entry.phone}</span>}
                      {entry.merchant && <span className="text-sky-400 bg-sky-400/10 px-2 py-0.5 rounded-md">{entry.merchant}</span>}
                      <span className="text-[#8e8e93] text-[10px] ml-auto">
                        {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>

                  {/* Desktop Grid Row */}
                  <div
                    className={`hidden lg:grid items-center border-b border-white/5 px-5 py-3 gap-3 text-xs transition-colors ${
                      entry.wasCopied ? "bg-[#baff55]/[0.02]" : "hover:bg-white/[0.01]"
                    }`}
                    style={{ gridTemplateColumns: '28px 1fr 100px 120px 120px 90px 100px 32px' }}
                  >
                    <button
                      onClick={() => handleVerify(entry.id)}
                      className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-all ${
                        entry.verified ? "bg-[#baff55] border-[#baff55] text-black" : "border-white/20 hover:border-white/40"
                      }`}
                    >
                      {entry.verified && <Check size={11} strokeWidth={3} />}
                    </button>

                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`font-mono font-bold truncate ${entry.verified ? "text-[#8e8e93] line-through" : "text-white"}`}>
                        {entry.transactionCode || "—"}
                      </span>
                      {entry.transactionCode && (
                        <button
                          onClick={() => handleCopy(entry.id)}
                          className={`p-1.5 rounded-lg border text-xs transition-all ${
                            entry.copiedCode ? "bg-[#baff55]/20 text-[#baff55] border-[#baff55]/40" : "bg-[#191c2b] text-[#8e8e93] border-white/5 hover:text-white"
                          }`}
                        >
                          {entry.copiedCode ? <Check size={11} /> : <Copy size={11} />}
                        </button>
                      )}
                    </div>

                    <span className="font-mono font-bold text-[#baff55] truncate">
                      {entry.amount || "—"}
                    </span>

                    <span className="font-mono text-white truncate">
                      {entry.phone || "—"}
                    </span>

                    <span className="font-mono text-sky-400 truncate">
                      {entry.merchant || "—"}
                    </span>

                    <span className="text-[11px] text-[#8e8e93] whitespace-nowrap">
                      {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>

                    <div className="flex items-center justify-center gap-2">
                      <label className="flex items-center gap-1 cursor-pointer select-none text-[10px] text-[#8e8e93]" title="Auto-delete 1h after copy">
                        <input type="checkbox" checked={entry.autoDeleteAfterCopy} onChange={() => handleToggleAutoDelete(entry.id)} className="w-3 h-3 accent-[#baff55]" />
                        <span>1h</span>
                      </label>
                      <label className="flex items-center gap-1 cursor-pointer select-none text-[10px] text-[#baff55]" title="Keep entry">
                        <input type="checkbox" checked={entry.keep} onChange={() => handleToggleKeep(entry.id)} className="w-3 h-3 accent-[#baff55]" />
                        <span>Keep</span>
                      </label>
                    </div>

                    <button
                      onClick={() => handleDelete(entry.id)}
                      className="p-1 rounded-lg text-[#8e8e93] hover:text-red-400 transition-colors"
                      title="Delete record"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-3 border-t border-white/5 text-xs text-[#8e8e93]">
                <span>Page <strong className="text-white">{currentPage}</strong> of <strong className="text-white">{totalPages}</strong></span>
                <div className="flex items-center gap-2">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => p - 1)}
                    className="px-3 py-1 rounded-xl bg-[#191c2b] text-white hover:bg-[#242838] disabled:opacity-30"
                  >
                    Prev
                  </button>
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => p + 1)}
                    className="px-3 py-1 rounded-xl bg-[#191c2b] text-white hover:bg-[#242838] disabled:opacity-30"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}

          </div>

        </div>
      )}

    </div>
  );
}
