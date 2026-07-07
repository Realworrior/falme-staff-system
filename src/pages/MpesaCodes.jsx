import React, { useState, useEffect, useRef } from "react";
import { Copy, Check, Trash2, Search, Plus, X, ClipboardList, Clock, ShieldAlert } from "lucide-react";
import { useToast } from '../context/ToastContext';

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

export default function MpesaCodes() {
  const [inputText, setInputText] = useState("");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [entries, setEntries] = useState(() => {
    const saved = localStorage.getItem("betfalme_mpesa_entries");
    return saved ? JSON.parse(saved) : [];
  });
  
  const textareaRef = useRef(null);
  const { addToast } = useToast();

  // Save entries to localStorage
  useEffect(() => {
    localStorage.setItem("betfalme_mpesa_entries", JSON.stringify(entries));
  }, [entries]);

  // Periodic cleaner: Expiration logic
  useEffect(() => {
    const cleanExpired = () => {
      const now = Date.now();
      setEntries((prev) => {
        const filtered = prev.filter((e) => {
          // 1. Check autoDeleteAfterCopy rule: must be copied, autoDeleteAfterCopy enabled, and 1 hour passed
          if (e.autoDeleteAfterCopy && e.copiedAt) {
            const copiedTime = new Date(e.copiedAt).getTime();
            if (now - copiedTime > 60 * 60 * 1000) {
              return false; // delete
            }
          }
          // 2. Check 24-hour expiration unless keep toggle is enabled
          if (!e.keep) {
            const entryTime = new Date(e.timestamp).getTime();
            if (now - entryTime > 24 * 60 * 60 * 1000) {
              return false; // delete
            }
          }
          return true;
        });

        return filtered;
      });
    };

    cleanExpired();
    const interval = setInterval(cleanExpired, 15000); // Check every 15 seconds
    return () => clearInterval(interval);
  }, [addToast]);

  const handleAdd = () => {
    const text = inputText.trim();
    if (!text) return;
    const parsed = parseSMS(text);
    
    // Check for duplicates
    if (parsed.transactionCode && entries.some(e => e.transactionCode === parsed.transactionCode)) {
      addToast("Duplicate MPESA code detected", "error");
      return;
    }

    const newEntry = {
      ...parsed,
      id: crypto.randomUUID(),
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
  };

  const handleCopy = async (id) => {
    const entry = entries.find((e) => e.id === id);
    if (!entry?.transactionCode) return;
    try {
      await navigator.clipboard.writeText(entry.transactionCode);
      setEntries((prev) =>
        prev.map((e) => {
          if (e.id === id) {
            return { 
              ...e, 
              copiedCode: true, 
              wasCopied: true,
              copiedAt: e.copiedAt || new Date().toISOString() // Set copy timestamp if not set
            };
          }
          return e;
        })
      );
      addToast("Transaction code copied!", "success");
      setTimeout(() => {
        setEntries((prev) => prev.map((e) => e.id === id ? { ...e, copiedCode: false } : e));
      }, 3000);
    } catch {
      addToast("Failed to copy", "error");
    }
  };

  const handleToggleKeep = (id) => {
    setEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, keep: !e.keep } : e))
    );
  };

  const handleToggleAutoDelete = (id) => {
    setEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, autoDeleteAfterCopy: !e.autoDeleteAfterCopy } : e))
    );
  };

  const handleVerify = (id) => {
    setEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, verified: !e.verified } : e))
    );
  };

  const handleDelete = (id) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
    addToast("Record deleted", "info");
  };

  // Filter logic
  const filtered = entries.filter((e) => {
    const q = search.toLowerCase();
    return (
      !q ||
      [e.transactionCode, e.merchant, e.phone, e.amount, e.raw]
        .some((v) => v?.toLowerCase().includes(q))
    );
  });

  // Pagination (100 records limit)
  const RECORDS_PER_PAGE = 100;
  const totalPages = Math.ceil(filtered.length / RECORDS_PER_PAGE);
  const paginatedEntries = filtered.slice(
    (currentPage - 1) * RECORDS_PER_PAGE,
    currentPage * RECORDS_PER_PAGE
  );

  // Session break helper — returns a label when gap >= 30 minutes
  const SESSION_BREAK_MS = 30 * 60 * 1000; // 30 minutes
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
    // pb-40 leaves room for the sticky input bar
    <div className="w-full max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-10 pb-44 space-y-6 md:space-y-8">

      {/* ── PAGE HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 rounded-lg bg-accent/10 border border-accent/20 text-accent">
              <ClipboardList size={16} />
            </div>
            <h3 className="text-sm font-black text-white uppercase tracking-widest">SMS verification ledger</h3>
          </div>
          <p className="text-[10px] text-gray-500 uppercase font-bold tracking-[0.2em]">Temp MPESA Code Repository</p>
        </div>
        <div className="text-[11px] font-bold text-gray-400 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl flex items-center gap-2 self-start sm:self-auto">
          <Clock size={12} className="text-accent" />
          <span>24h Auto-Expiry Active</span>
        </div>
      </div>

      {/* ── MAIN LEDGER CARD ── */}
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

        {/* ── DESKTOP HEADER ROW (lg+) ── */}
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

        {/* ── ROWS ── */}
        {paginatedEntries.length === 0 ? (
          <div className="text-center py-16 text-sm text-gray-500 font-bold uppercase tracking-wider">
            {entries.length === 0 ? "No records yet — paste a code below" : "No matching records"}
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
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                      {breakLabel} break
                    </span>
                    <div className="flex-1 h-px bg-white/5" />
                  </div>
                )}

                {/* ── MOBILE / TABLET CARD (< lg) ── */}
                <div className={`lg:hidden px-4 py-4 border-b border-white/5 transition-colors ${
                  entry.wasCopied ? "bg-[#baff55]/[0.03] border-l-2 border-l-[#baff55]" : "hover:bg-white/[0.01]"
                }`}>
                  {/* Row 1: checkbox + code + copy + delete */}
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
                  {/* Row 2: metadata chips */}
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
                  {/* Row 3: toggles */}
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

                {/* ── DESKTOP ROW (lg+) ── */}
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

      {/* ── STICKY INPUT BAR ── */}
      <div className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-50 w-[min(680px,calc(100vw-2rem))]">
        <div className="glass-card border border-white/10 shadow-2xl shadow-black/60 p-3 md:p-4 space-y-2 rounded-2xl">
          <div className="flex items-center gap-2 mb-1">
            <Plus size={12} className="text-accent shrink-0" />
            <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Paste Full SMS or Code</span>
            <span className="ml-auto text-[9px] text-gray-600">Duplicates auto-filtered</span>
          </div>
          <div className="flex items-end gap-2">
            <textarea
              ref={textareaRef}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleAdd(); }}
              placeholder="UG2D2A2YF9 confirmed. Ksh1,000.00 from 0712345678…   or just: UG2D2A2YF9"
              rows={2}
              className="flex-1 bg-[#161616] border border-white/10 rounded-xl p-3 text-white text-sm outline-none focus:border-accent/30 focus:ring-1 focus:ring-accent/30 font-mono resize-none transition-all placeholder-gray-600 min-w-0"
            />
            <button
              onClick={handleAdd}
              disabled={!inputText.trim()}
              className="pill-lime shrink-0 flex items-center gap-1.5 disabled:opacity-40 disabled:pointer-events-none py-3"
            >
              <Plus size={14} />
              Add
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
