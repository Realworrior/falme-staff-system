import React, { useState, useEffect, useRef } from "react";
import { 
  Copy, 
  Check, 
  Trash2, 
  Search, 
  Plus, 
  X, 
  Receipt
} from "lucide-react";
import { useToast } from '../context/ToastContext';
import { supabase } from '../supabaseClient';

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

export default function SmsLedger() {
  const [inputText, setInputText] = useState("");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  
  const [entries, setEntries] = useState(() => {
    const saved = localStorage.getItem("betfalme_mpesa_entries");
    return saved ? JSON.parse(saved) : [];
  });

  const textareaRef = useRef(null);
  const toast = useToast();
  const addToast = toast?.addToast || toast?.showToast || (() => {});

  // Save entries to localStorage on local updates
  useEffect(() => {
    const smsOnly = entries.filter(e => e.transactionCode !== '__HOURLY_COUNTER__' && e.transactionCode !== '__HOURLY_ANALYTICS__');
    localStorage.setItem("betfalme_mpesa_entries", JSON.stringify(smsOnly));
  }, [entries]);

  // Fetch initial SMS entries from Supabase & realtime updates
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

    const channel = supabase
      .channel('mpesa-sms-ledger-realtime')
      .on('postgres_changes', { event: '*', table: 'mpesa_codes', schema: 'public' }, (payload) => {
        const newRecord = payload.new;
        const oldRecord = payload.old;

        if (newRecord?.id === 'hourly_counter_global' || newRecord?.id === 'hourly_analytics_history' ||
            oldRecord?.id === 'hourly_counter_global' || oldRecord?.id === 'hourly_analytics_history') {
          return;
        }

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

  return (
    <div className="min-h-[calc(100vh-80px)] py-8 px-4 flex flex-col items-center justify-start text-[#F4F5F1] font-sans selection:bg-[#00D66B]/20">
      
      {/* ── MAIN CARD: SMS LEDGER ── */}
      <div className="w-full max-w-[760px] bg-[#1B1C22] border border-white/[0.07] rounded-[28px] p-6 sm:p-7 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        
        {/* Card Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="font-['Space_Grotesk'] text-2xl font-semibold tracking-tight text-[#F4F5F1]">
              SMS Ledger
            </h1>
            <p className="text-xs text-[#8B8E97] mt-0.5">Parse, search, verify and copy MPESA messages</p>
          </div>
          <span className="text-[11px] font-mono font-semibold text-[#00D66B] bg-[#00D66B]/10 border border-[#00D66B]/20 px-3 py-1 rounded-full">
            {filtered.length} SMS stored
          </span>
        </div>

        {/* ── LEDGER VIEW ── */}
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
                className="bg-[#00D66B] hover:brightness-105 text-[#04170D] font-bold text-xs py-3 px-5 rounded-full flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:pointer-events-none transition-all shrink-0 cursor-pointer shadow-md"
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
                        className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                          entry.verified ? "bg-[#00D66B] border-[#00D66B] text-[#04170D]" : "border-white/20 hover:border-white/40"
                        }`}
                        title={entry.verified ? "Mark unverified" : "Mark verified"}
                      >
                        {entry.verified && <Check size={10} strokeWidth={3} />}
                      </button>
                      <span className={`font-bold truncate ${entry.verified ? "text-[#54565F] line-through" : "text-[#F4F5F1]"}`}>
                        {entry.transactionCode || "—"}
                      </span>
                      {entry.amount && <span className="text-[#00D66B] bg-[#00D66B]/10 px-1.5 py-0.5 rounded text-[11px] shrink-0 font-semibold">{entry.amount}</span>}
                      {entry.phone && <span className="text-[#8B8E97] hidden sm:inline truncate">{entry.phone}</span>}
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {entry.transactionCode && (
                        <button
                          onClick={() => handleCopy(entry.id)}
                          className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 cursor-pointer transition-all ${
                            entry.copiedCode ? "bg-[#00D66B]/20 text-[#00D66B] border-[#00D66B]/40" : "bg-[#232429] text-[#8B8E97] border-white/5 hover:text-white"
                          }`}
                          title="Copy MPESA code"
                        >
                          {entry.copiedCode ? <Check size={12} /> : <Copy size={12} />}
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(entry.id)}
                        className="p-1.5 text-[#54565F] hover:text-red-400 cursor-pointer transition-colors"
                        title="Delete record"
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

      </div>

    </div>
  );
}
