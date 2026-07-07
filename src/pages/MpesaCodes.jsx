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
  const [showInput, setShowInput] = useState(true);
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
    setShowInput(false);
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

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-10 space-y-6 md:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="p-1.5 rounded-lg bg-accent/10 border border-accent/20 text-accent">
              <ClipboardList size={16} />
            </div>
            <h3 className="text-sm font-black text-white uppercase tracking-widest">SMS verification ledger</h3>
          </div>
          <p className="text-[10px] text-gray-500 uppercase font-bold tracking-[0.2em]">Temp MPESA Code Repository</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-[11px] font-bold text-gray-400 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl flex items-center gap-2">
            <Clock size={12} className="text-accent" />
            <span>24h Auto-Expiry Active</span>
          </div>
          <button
            onClick={() => {
              setShowInput((v) => !v);
              if (!showInput) setTimeout(() => textareaRef.current?.focus(), 100);
            }}
            className="pill-lime flex items-center gap-1.5"
          >
            <Plus size={16} />
            Add Record
          </button>
        </div>
      </div>

      {/* Paste panel */}
      {showInput && (
        <div className="glass-card p-6 space-y-4 max-w-2xl border border-white/15">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black text-white uppercase tracking-widest">Paste Full SMS or Code</h4>
            <button 
              onClick={() => setShowInput(false)}
              className="text-gray-500 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
          </div>
          <textarea
            ref={textareaRef}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Paste Mpesa SMS message, e.g.:&#10;UG2D2A2YF9 confirmed. You have received Ksh1,000.00 from 0727410570. Paid to METABET.&#10;&#10;Or just code: UG2D2A2YF9"
            rows={4}
            className="w-full bg-[#161616] border border-white/10 rounded-2xl p-4 text-white text-sm outline-none focus:border-accent/40 focus:ring-1 focus:ring-accent/40 font-mono resize-none transition-all"
          />
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
              Duplicates are auto-filtered
            </span>
            <button
              onClick={handleAdd}
              disabled={!inputText.trim()}
              className="pill-lime disabled:opacity-40 disabled:pointer-events-none"
            >
              Verify & Add
            </button>
          </div>
        </div>
      )}

      {/* Main Ledger Table Card */}
      <div className="glass-card overflow-hidden">
        {/* Search */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-white/5 bg-white/[0.01]">
          <Search size={14} className="text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by Transaction Code, Phone number, or Merchant details..."
            className="flex-1 bg-transparent text-sm text-white placeholder-gray-600 outline-none"
          />
          {search && (
            <button 
              onClick={() => setSearch("")}
              className="text-gray-500 hover:text-white transition-colors"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Responsive Table Wrapper */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-white/5 text-[9px] font-black text-gray-500 uppercase tracking-widest bg-white/[0.005]">
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Transaction Code</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Phone Number</th>
                <th className="px-6 py-4">Merchant</th>
                <th className="px-6 py-4">Timestamp</th>
                <th className="px-6 py-4 text-center">Settings</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {paginatedEntries.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-16 text-sm text-gray-500 font-bold uppercase tracking-wider">
                    {entries.length === 0 ? "No transaction records present" : "No matching records found"}
                  </td>
                </tr>
              ) : (
                paginatedEntries.map((entry) => (
                  <tr 
                    key={entry.id}
                    className={`transition-colors duration-200 ${
                      entry.wasCopied 
                        ? "bg-[#baff55]/[0.02] border-l-2 border-[#baff55]" 
                        : "hover:bg-white/[0.01]"
                    }`}
                  >
                    {/* Status Checkbox */}
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleVerify(entry.id)}
                        className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${
                          entry.verified 
                            ? "bg-[#baff55] border-[#baff55] text-black" 
                            : "border-white/20 hover:border-accent"
                        }`}
                      >
                        {entry.verified && <Check size={12} strokeWidth={3} />}
                      </button>
                    </td>

                    {/* Transaction Code */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span 
                          className={`font-mono text-sm font-bold ${
                            entry.verified ? "text-gray-400 line-through" : "text-white"
                          }`}
                        >
                          {entry.transactionCode || <span className="text-gray-600 font-normal italic">Unavailable</span>}
                        </span>
                        {entry.transactionCode && (
                          <button
                            onClick={() => handleCopy(entry.id)}
                            className={`p-1.5 rounded-lg border border-white/5 bg-white/5 hover:border-accent hover:text-accent transition-all ${
                              entry.copiedCode ? "text-accent border-accent/40" : "text-gray-500"
                            }`}
                          >
                            {entry.copiedCode ? <Check size={12} /> : <Copy size={12} />}
                          </button>
                        )}
                        {entry.isCodeOnly && (
                          <span className="text-[8px] font-black text-gray-400 bg-white/10 px-1.5 py-0.5 rounded uppercase tracking-wider">
                            Code Only
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs font-bold text-white">
                        {entry.amount || <span className="text-gray-600 font-normal">—</span>}
                      </span>
                    </td>

                    {/* Phone */}
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs text-gray-300">
                        {entry.phone || <span className="text-gray-600">—</span>}
                      </span>
                    </td>

                    {/* Merchant */}
                    <td className="px-6 py-4">
                      {entry.merchant ? (
                        <span className="text-[10px] font-black bg-accent/10 text-accent border border-accent/20 px-2 py-0.5 rounded-lg uppercase tracking-wider">
                          {entry.merchant}
                        </span>
                      ) : (
                        <span className="text-gray-600">—</span>
                      )}
                    </td>

                    {/* Timestamp */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-400">
                          {new Date(entry.timestamp).toLocaleDateString()}
                        </span>
                        <span className="text-[10px] text-gray-600">
                          {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </td>

                    {/* Settings toggles */}
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-4">
                        {/* Auto delete after 1 hr */}
                        <label className="flex items-center gap-1.5 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={entry.autoDeleteAfterCopy}
                            onChange={() => handleToggleAutoDelete(entry.id)}
                            className="w-3.5 h-3.5 rounded border-white/20 bg-transparent accent-accent"
                          />
                          <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Kills 1h post-copy</span>
                        </label>

                        {/* Keep Toggle */}
                        <label className="flex items-center gap-1.5 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={entry.keep}
                            onChange={() => handleToggleKeep(entry.id)}
                            className="w-3.5 h-3.5 rounded border-white/20 bg-transparent accent-accent"
                          />
                          <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider text-accent">Keep</span>
                        </label>
                      </div>
                    </td>

                    {/* Delete Action */}
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(entry.id)}
                        className="p-2 rounded-xl text-gray-600 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all"
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-white/5 bg-white/[0.005]">
            <span className="text-xs text-gray-500">
              Showing page <strong className="text-white">{currentPage}</strong> of <strong className="text-white">{totalPages}</strong> ({filtered.length} total records)
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="pill-dark py-1.5 px-4 text-xs disabled:opacity-40 disabled:pointer-events-none"
              >
                Previous
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="pill-dark py-1.5 px-4 text-xs disabled:opacity-40 disabled:pointer-events-none"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
