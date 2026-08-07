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
  AlertTriangle
} from "lucide-react";
import { useToast } from '../context/ToastContext';
import { supabase } from '../supabaseClient';

// Helper to generate formatted 1-hour window string based on offset from current time
function generateHourRange(offsetHours = 0) {
  const now = new Date();
  const targetDate = new Date(now.getTime() + offsetHours * 3600 * 1000);
  
  const start = new Date(targetDate);
  start.setMinutes(0, 0, 0);
  
  const end = new Date(start);
  end.setHours(end.getHours() + 1);

  const formatTime = (d) => {
    return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  return `${formatTime(start)} - ${formatTime(end)}`;
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
  depositCount: 1,
  withdrawalCount: 0,
  depositIcon: '✅',
  depositLabel: 'Deposit Completed',
  withdrawalIcon: '✅',
  withdrawalLabel: 'Completed withdrawal',
  customItems: []
};

export default function MpesaCodes() {
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

  const [copiedCounter, setCopiedCounter] = useState(false);
  const [hourOffset, setHourOffset] = useState(0);

  const textareaRef = useRef(null);
  const { addToast } = useToast();

  // Save entries to localStorage on local updates
  useEffect(() => {
    const smsOnly = entries.filter(e => e.transactionCode !== '__HOURLY_COUNTER__');
    localStorage.setItem("betfalme_mpesa_entries", JSON.stringify(smsOnly));
  }, [entries]);

  // Save counter state to localStorage
  useEffect(() => {
    localStorage.setItem("betfalme_mpesa_hourly_counter", JSON.stringify(counterState));
  }, [counterState]);

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

          // Filter out internal counter record from regular SMS entries list
          const smsEntries = data.filter(item => item.id !== 'hourly_counter_global' && item.transactionCode !== '__HOURLY_COUNTER__');
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

        // Check if change is for the hourly counter record
        if ((newRecord && (newRecord.id === 'hourly_counter_global' || newRecord.transactionCode === '__HOURLY_COUNTER__')) ||
            (oldRecord && (oldRecord.id === 'hourly_counter_global' || oldRecord.transactionCode === '__HOURLY_COUNTER__'))) {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            if (newRecord.raw) {
              try {
                const parsed = JSON.parse(newRecord.raw);
                setCounterState((prev) => ({
                  ...prev,
                  ...parsed
                }));
              } catch (e) {
                console.error("Realtime counter parse error", e);
              }
            }
          }
          return;
        }

        // Handle regular SMS code entries
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

  // Periodic cleaner: Expiration logic for SMS notes (ignores counter record)
  useEffect(() => {
    const cleanExpired = () => {
      const now = Date.now();
      const expiredIds = [];

      setEntries((prev) => {
        const nextEntries = prev.filter((e) => {
          if (e.id === 'hourly_counter_global' || e.transactionCode === '__HOURLY_COUNTER__') return true;

          // 1. Check autoDeleteAfterCopy rule
          if (e.autoDeleteAfterCopy && e.copiedAt) {
            const copiedTime = new Date(e.copiedAt).getTime();
            if (now - copiedTime > 60 * 60 * 1000) {
              expiredIds.push(e.id);
              return false;
            }
          }
          // 2. Check 24-hour expiration unless keep toggle is enabled
          if (!e.keep) {
            const entryTime = new Date(e.timestamp).getTime();
            if (now - entryTime > 24 * 60 * 60 * 1000) {
              expiredIds.push(e.id);
              return false;
            }
          }
          return true;
        });

        if (expiredIds.length > 0) {
          supabase
            .from('mpesa_codes')
            .delete()
            .in('id', expiredIds)
            .then(({ error }) => {
              if (error) {
                console.error("Failed to delete expired entries on remote server:", error.message);
              }
            });
        }

        return nextEntries;
      });
    };

    cleanExpired();
    const interval = setInterval(cleanExpired, 10000);
    return () => clearInterval(interval);
  }, []);

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

  // Counter Actions
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

  const handleSetHourOffset = (offset) => {
    setHourOffset(offset);
    const newRange = generateHourRange(offset);
    updateCounterState((prev) => ({
      ...prev,
      timeRange: newRange
    }));
  };

  // Generate copyable text format exactly matching user prompt:
  // ⏰ 1:00 PM - 2:00 PM
  // ✅ Deposit Completed: 1
  // ✅Completed withdrawal: 0
  const getFormattedCounterText = () => {
    const range = counterState.timeRange || generateHourRange(0);
    const dIcon = counterState.depositIcon || '✅';
    const dLabel = counterState.depositLabel || 'Deposit Completed';
    const dCount = counterState.depositCount ?? 1;

    const wIcon = counterState.withdrawalIcon || '✅';
    const wLabel = counterState.withdrawalLabel || 'Completed withdrawal';
    const wCount = counterState.withdrawalCount ?? 0;

    return `⏰ ${range}\n${dIcon} ${dLabel}: ${dCount}\n${wIcon}${wLabel}: ${wCount}`;
  };

  const handleCopyCounterText = async () => {
    const textToCopy = getFormattedCounterText();
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopiedCounter(true);
      addToast("Copied MPesa hourly report to clipboard!", "success");
      setTimeout(() => setCopiedCounter(false), 3000);
    } catch (err) {
      addToast("Failed to copy report", "error");
    }
  };

  // SMS Ledger Handlers
  const handleAdd = async () => {
    const text = inputText.trim();
    if (!text) return;
    const parsed = parseSMS(text);
    
    // Check for duplicates
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

  // Filter SMS entries (excluding internal counter record)
  const filtered = entries
    .filter(e => e.id !== 'hourly_counter_global' && e.transactionCode !== '__HOURLY_COUNTER__')
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

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-10 space-y-8">

      {/* ── PAGE HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 rounded-xl bg-[#baff55]/10 border border-[#baff55]/20 text-[#baff55]">
              <ClipboardList size={20} />
            </div>
            <h1 className="text-xl md:text-2xl font-black text-white tracking-wide">MPesa Operations Hub</h1>
          </div>
          <p className="text-xs text-gray-400 font-medium">
            Hourly failure & completion counters + SMS code verification notes
          </p>
        </div>
        <div className="text-xs font-bold text-gray-400 bg-white/5 border border-white/10 px-3.5 py-2 rounded-xl flex items-center gap-2 self-start sm:self-auto">
          <Activity size={14} className="text-[#baff55] animate-pulse" />
          <span>Cross-Browser Sync Active</span>
        </div>
      </div>

      {/* ── SECTION 1: MPESA HOURLY FAILURE & COMPLETION COUNTER ── */}
      <div className="bg-[#12141c] border border-white/10 rounded-2xl p-5 md:p-6 shadow-2xl relative overflow-hidden space-y-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#baff55]/5 rounded-full blur-3xl pointer-events-none" />

        {/* Counter Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Clock size={18} className="text-[#baff55]" />
              <h2 className="text-base md:text-lg font-bold text-white uppercase tracking-wider">
                MPesa Hourly Failure Counter
              </h2>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              Tracks completed or failed MPesa transactions per 1-hour shift window
            </p>
          </div>

          {/* Time Window Selector */}
          <div className="flex items-center gap-2 bg-[#1a1c27] p-1.5 rounded-xl border border-white/10 shrink-0">
            <button
              onClick={() => handleSetHourOffset(hourOffset - 1)}
              className="px-2.5 py-1 text-xs font-bold text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-all"
              title="Previous Hour"
            >
              &lt; Prev
            </button>
            <button
              onClick={() => handleSetHourOffset(0)}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                hourOffset === 0 
                  ? "bg-[#baff55] text-black font-black" 
                  : "text-gray-300 hover:text-white bg-white/5"
              }`}
            >
              Current Hour
            </button>
            <button
              onClick={() => handleSetHourOffset(hourOffset + 1)}
              className="px-2.5 py-1 text-xs font-bold text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-all"
              title="Next Hour"
            >
              Next &gt;
            </button>
          </div>
        </div>

        {/* Time Window Editable Field */}
        <div className="flex flex-col sm:flex-row items-center gap-3 bg-[#181a24] p-3 rounded-xl border border-white/5">
          <span className="text-xs font-bold text-gray-400 shrink-0 flex items-center gap-1.5">
            <Clock size={14} className="text-[#baff55]" /> Time Window:
          </span>
          <div className="flex-1 w-full flex items-center gap-2">
            <span className="text-base shrink-0">⏰</span>
            <input
              type="text"
              value={counterState.timeRange || generateHourRange(0)}
              onChange={(e) => updateCounterState({ timeRange: e.target.value })}
              className="flex-1 bg-[#0d0e14] border border-white/10 rounded-lg px-3 py-1.5 text-sm font-mono text-white outline-none focus:border-[#baff55]/50 transition-all"
              placeholder="e.g. 1:00 PM - 2:00 PM"
            />
            <button
              onClick={() => updateCounterState({ timeRange: generateHourRange(hourOffset) })}
              className="p-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all"
              title="Reset Time Window"
            >
              <RefreshCw size={12} />
              Reset Time
            </button>
          </div>
        </div>

        {/* Counter Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Deposit Completed / Failed Card */}
          <div className="bg-[#181a26] border border-white/10 rounded-xl p-4 flex flex-col justify-between space-y-4 hover:border-white/20 transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateCounterState({ depositIcon: counterState.depositIcon === '✅' ? '❌' : '✅' })}
                  className="text-lg p-1 hover:bg-white/10 rounded-lg transition-all"
                  title="Toggle status emoji"
                >
                  {counterState.depositIcon || '✅'}
                </button>
                <input
                  type="text"
                  value={counterState.depositLabel || 'Deposit Completed'}
                  onChange={(e) => updateCounterState({ depositLabel: e.target.value })}
                  className="bg-transparent text-sm font-bold text-white outline-none border-b border-transparent focus:border-[#baff55]/40 transition-all"
                />
              </div>
              <span className="text-[10px] uppercase font-bold text-gray-500 bg-white/5 px-2 py-0.5 rounded">Deposit</span>
            </div>

            <div className="flex items-center justify-between bg-[#0e1017] p-4 rounded-xl border border-white/5">
              <span className="text-4xl font-black font-mono text-[#baff55]">
                {counterState.depositCount ?? 1}
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleAdjustCount('deposit', -1)}
                  className="p-2.5 bg-white/5 hover:bg-white/15 text-white rounded-lg transition-all active:scale-95"
                  title="Decrease count"
                >
                  <Minus size={16} />
                </button>
                <button
                  onClick={() => handleAdjustCount('deposit', 1)}
                  className="p-2.5 bg-[#baff55] text-black hover:bg-[#a8f044] rounded-lg transition-all font-black active:scale-95"
                  title="Increase count"
                >
                  <Plus size={16} />
                </button>
                <button
                  onClick={() => updateCounterState({ depositCount: 0 })}
                  className="px-2 py-2 text-[10px] font-bold text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-all"
                  title="Set to 0"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>

          {/* Completed / Failed Withdrawal Card */}
          <div className="bg-[#181a26] border border-white/10 rounded-xl p-4 flex flex-col justify-between space-y-4 hover:border-white/20 transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateCounterState({ withdrawalIcon: counterState.withdrawalIcon === '✅' ? '❌' : '✅' })}
                  className="text-lg p-1 hover:bg-white/10 rounded-lg transition-all"
                  title="Toggle status emoji"
                >
                  {counterState.withdrawalIcon || '✅'}
                </button>
                <input
                  type="text"
                  value={counterState.withdrawalLabel || 'Completed withdrawal'}
                  onChange={(e) => updateCounterState({ withdrawalLabel: e.target.value })}
                  className="bg-transparent text-sm font-bold text-white outline-none border-b border-transparent focus:border-[#baff55]/40 transition-all"
                />
              </div>
              <span className="text-[10px] uppercase font-bold text-gray-500 bg-white/5 px-2 py-0.5 rounded">Withdrawal</span>
            </div>

            <div className="flex items-center justify-between bg-[#0e1017] p-4 rounded-xl border border-white/5">
              <span className="text-4xl font-black font-mono text-[#baff55]">
                {counterState.withdrawalCount ?? 0}
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleAdjustCount('withdrawal', -1)}
                  className="p-2.5 bg-white/5 hover:bg-white/15 text-white rounded-lg transition-all active:scale-95"
                  title="Decrease count"
                >
                  <Minus size={16} />
                </button>
                <button
                  onClick={() => handleAdjustCount('withdrawal', 1)}
                  className="p-2.5 bg-[#baff55] text-black hover:bg-[#a8f044] rounded-lg transition-all font-black active:scale-95"
                  title="Increase count"
                >
                  <Plus size={16} />
                </button>
                <button
                  onClick={() => updateCounterState({ withdrawalCount: 0 })}
                  className="px-2 py-2 text-[10px] font-bold text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-all"
                  title="Set to 0"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Copyable Summary Format Preview & Actions */}
        <div className="bg-[#0b0c12] border border-white/10 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 flex items-center gap-1.5">
              <Sparkles size={14} className="text-[#baff55]" /> Copyable Format Preview:
            </span>
            <button
              onClick={handleResetCounts}
              className="text-[11px] font-bold text-gray-400 hover:text-red-400 transition-colors flex items-center gap-1"
            >
              <RefreshCw size={11} /> Reset Counts
            </button>
          </div>

          <pre className="bg-[#141620] border border-white/5 rounded-lg p-3 text-sm font-mono text-[#baff55] whitespace-pre-wrap select-all">
            {getFormattedCounterText()}
          </pre>

          <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
            <button
              onClick={handleCopyCounterText}
              className="w-full sm:w-auto flex-1 bg-[#baff55] text-black hover:bg-[#a8f044] font-black text-sm py-3 px-6 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.98]"
            >
              {copiedCounter ? <Check size={18} /> : <Copy size={18} />}
              {copiedCounter ? "Copied to Clipboard!" : "Copy Hourly Report"}
            </button>
          </div>
        </div>
      </div>

      {/* ── SECTION 2: SMS CODE LEDGER & NOTES (PRESERVED) ── */}
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
                        ? <span className="text-[9px] font-black bg-accent/10 text-accent border border-accent/20 px-2 py-0.5 rounded-lg uppercase tracking-wider truncate block max-w-full">{entry.merchant}</span>
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

    </div>
  );
}
