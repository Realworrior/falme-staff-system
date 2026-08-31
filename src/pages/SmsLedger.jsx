import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Copy,
  Check,
  Trash2,
  Search,
  X,
  Download,
  Upload,
  ChevronLeft,
  ChevronRight,
  ClipboardPaste,
  Zap,
  Eye,
  MessageSquare,
  AlertCircle,
} from "lucide-react";
import { useToast } from "../context/ToastContext";
import { supabase } from "../supabaseClient";

// SMS PARSER
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
  const mp = raw.match(/(?:paid\s+to|pay\s+to|sent\s+to|to)\s+([A-Z][A-Z0-9\s&'"'"'-]{1,28}?)(?:\s+on|\s+Ksh|\s+\d|\.|,|$)/i);
  if (mp) merchant = mp[1].trim().toUpperCase();
  let phone = null;
  for (const p of [/\b(07\d{8})\b/, /\b(\+254\d{9})\b/, /(?:from|to)\s+((?:07|01)\d{8})/i]) {
    const m = raw.match(p);
    if (m) { phone = m[1]; break; }
  }
  let dateTime = null;
  const dm = raw.match(/(\d{1,2}\/\d{1,2}\/\d{2,4})\s+at\s+(\d{1,2}:\d{2}\s*(?:AM|PM)?)/i);
  if (dm) dateTime = `${dm[1]}, ${dm[2]}`;
  return { raw, transactionCode, amount, merchant, phone, dateTime };
}

const SKIP_IDS = new Set(["hourly_counter_global", "hourly_analytics_history"]);
const SKIP_CODES = new Set(["__HOURLY_COUNTER__", "__HOURLY_ANALYTICS__"]);
const PER_PAGE = 30;
function isSystemRow(e) { return SKIP_IDS.has(e.id) || SKIP_CODES.has(e.transactionCode); }

export default function SmsLedger() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inputText, setInputText] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [copying, setCopying] = useState(null);
  const [showPasteZone, setShowPasteZone] = useState(true);
  const [dragOver, setDragOver] = useState(false);
  const [previewEntry, setPreviewEntry] = useState(null);
  const textareaRef = useRef(null);
  const importRef = useRef(null);
  const toast = useToast();
  const addToast = toast?.showToast || toast?.addToast || (() => {});

  useEffect(() => {
    const fetchEntries = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("mpesa_codes")
          .select("*")
          .order("timestamp", { ascending: false });
        if (error) throw error;
        setEntries((data || []).filter((e) => !isSystemRow(e)));
      } catch (err) {
        console.warn("Supabase fetch failed:", err?.message);
        addToast("Could not load records from database", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchEntries();
    const channel = supabase
      .channel("sms-ledger-v2")
      .on("postgres_changes", { event: "*", table: "mpesa_codes", schema: "public" }, (payload) => {
        const { new: n, old: o, eventType } = payload;
        if (isSystemRow(n || {}) || isSystemRow(o || {})) return;
        if (eventType === "INSERT") {
          setEntries((prev) => { if (prev.some((e) => e.id === n.id)) return prev; return [n, ...prev]; });
        } else if (eventType === "UPDATE") {
          setEntries((prev) => prev.map((e) => (e.id === n.id ? n : e)));
        } else if (eventType === "DELETE") {
          setEntries((prev) => prev.filter((e) => e.id !== o.id));
        }
      })
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, []);

  useEffect(() => {
    if (inputText.trim().length > 10) { setPreviewEntry(parseSMS(inputText)); }
    else { setPreviewEntry(null); }
  }, [inputText]);

  const handleAdd = useCallback(async (textOverride) => {
    const text = (textOverride ?? inputText).trim();
    if (!text) return;
    const parsed = parseSMS(text);
    if (parsed.transactionCode && entries.some((e) => e.transactionCode === parsed.transactionCode)) {
      addToast("Duplicate code — already in ledger", "error");
      return;
    }
    const entryId = typeof crypto.randomUUID === "function" ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    // Local state entry (includes UI-only fields)
    const localEntry = {
      ...parsed,
      id: entryId,
      copiedCode: false, wasCopied: false, verified: false,
      timestamp: new Date().toISOString(), keep: false, copiedAt: null,
    };
    // DB record — only columns that exist in mpesa_codes table
    const dbRecord = {
      id: entryId,
      raw: parsed.raw,
      transactionCode: parsed.transactionCode,
      amount: parsed.amount ?? null,
      merchant: parsed.merchant ?? null,
      phone: parsed.phone ?? null,
      dateTime: parsed.dateTime ?? null,
      wasCopied: false,
      verified: false,
      timestamp: localEntry.timestamp,
      copiedAt: null,
    };
    // Optimistic update
    setEntries((prev) => [localEntry, ...prev]);
    setInputText("");
    setPreviewEntry(null);
    try {
      const { error } = await supabase.from("mpesa_codes").insert([dbRecord]);
      if (error) throw error;
      addToast("Record saved", "success");
    } catch (err) {
      console.error("DB insert failed:", err?.message);
      // Roll back optimistic insert
      setEntries((prev) => prev.filter((e) => e.id !== entryId));
      addToast(`Save failed: ${err?.message || "DB error"}`, "error");
    }
  }, [inputText, entries, addToast]);

  const handlePaste = useCallback(async (e) => {
    if (e) e.preventDefault();
    let text = e?.clipboardData?.getData("text") ?? null;
    if (!text) {
      try { text = await navigator.clipboard.readText(); } catch { /* ignore */ }
    }
    if (!text?.trim()) return;
    setInputText(text.trim());
    const parsed = parseSMS(text.trim());
    if (parsed.transactionCode) { setTimeout(() => handleAdd(text.trim()), 400); }
  }, [handleAdd]);

  useEffect(() => {
    const onGlobalPaste = (e) => {
      const active = document.activeElement;
      if (active?.tagName === "TEXTAREA" || active?.tagName === "INPUT") return;
      handlePaste(e);
    };
    window.addEventListener("paste", onGlobalPaste);
    return () => window.removeEventListener("paste", onGlobalPaste);
  }, [handlePaste]);

  const handleCopy = useCallback(async (id) => {
    const entry = entries.find((e) => e.id === id);
    if (!entry?.transactionCode) return;
    try {
      await navigator.clipboard.writeText(entry.transactionCode);
      const copiedAt = new Date().toISOString();
      setCopying(id);
      setEntries((prev) => prev.map((e) => e.id === id ? { ...e, copiedCode: true, wasCopied: true, copiedAt } : e));
      addToast(`Copied: ${entry.transactionCode}`, "success");
      setTimeout(() => setCopying(null), 1500);
      await supabase.from("mpesa_codes").update({ wasCopied: true, copiedAt }).eq("id", id);
    } catch { addToast("Clipboard access denied", "error"); }
  }, [entries, addToast]);

  const handleCopyFull = useCallback(async (id) => {
    const entry = entries.find((e) => e.id === id);
    if (!entry?.raw) return;
    try {
      await navigator.clipboard.writeText(entry.raw);
      addToast("Full SMS copied", "success");
    } catch { addToast("Clipboard access denied", "error"); }
  }, [entries, addToast]);

  const handleVerify = useCallback(async (id) => {
    const entry = entries.find((e) => e.id === id);
    if (!entry) return;
    const nextVal = !entry.verified;
    setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, verified: nextVal } : e)));
    try { await supabase.from("mpesa_codes").update({ verified: nextVal }).eq("id", id); }
    catch (err) { console.error(err); }
  }, [entries]);

  const handleUnblur = useCallback(async (id) => {
    setEntries((prev) => prev.map((e) => e.id === id ? { ...e, wasCopied: false, copiedAt: null } : e));
    try { await supabase.from("mpesa_codes").update({ wasCopied: false, copiedAt: null }).eq("id", id); }
    catch (err) { console.error(err); }
  }, []);

  const handleDelete = useCallback(async (id) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
    addToast("Record deleted", "info");
    try { await supabase.from("mpesa_codes").delete().eq("id", id); }
    catch (err) { console.error(err); }
  }, [addToast]);

  const handleExport = useCallback(() => {
    const exportData = entries.map(({ id, transactionCode, amount, merchant, phone, dateTime, timestamp, raw, wasCopied, verified }) => ({
      id, transactionCode, amount, merchant, phone, dateTime, timestamp, raw, wasCopied, verified
    }));
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sms_ledger_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addToast(`Exported ${exportData.length} records`, "success");
  }, [entries, addToast]);

  const handleImport = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      if (!Array.isArray(parsed)) throw new Error("Invalid format");
      const existing = new Set(entries.map((e) => e.transactionCode).filter(Boolean));
      const newRecords = parsed.filter((r) => r.transactionCode && !existing.has(r.transactionCode));
      if (newRecords.length === 0) { addToast("No new records to import", "info"); return; }
      const toInsert = newRecords.map((r) => ({
        ...r,
        id: r.id || crypto.randomUUID(),
        timestamp: r.timestamp || new Date().toISOString(),
      }));
      setEntries((prev) => [...toInsert, ...prev]);
      const { error } = await supabase.from("mpesa_codes").insert(toInsert);
      if (error) throw error;
      addToast(`Imported ${toInsert.length} new records`, "success");
    } catch (err) {
      addToast(`Import failed: ${err.message}`, "error");
    } finally {
      e.target.value = "";
    }
  }, [entries, addToast]);

  const filtered = entries.filter((e) => {
    if (filter === "uncopied" && e.wasCopied) return false;
    if (filter === "copied" && !e.wasCopied) return false;
    if (filter === "verified" && !e.verified) return false;
    const q = search.toLowerCase();
    return !q || [e.transactionCode, e.merchant, e.phone, e.amount, e.raw].some((v) => v?.toLowerCase().includes(q));
  });

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);
  const uncopiedCount = entries.filter((e) => !e.wasCopied && e.transactionCode).length;

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const text = e.dataTransfer.getData("text");
    if (text) {
      setInputText(text.trim());
      const parsed = parseSMS(text.trim());
      if (parsed.transactionCode) setTimeout(() => handleAdd(text.trim()), 400);
    }
  }, [handleAdd]);

  return (
    <div
      className="min-h-[calc(100vh-80px)] py-6 px-4 flex flex-col items-center text-[#F4F5F1] font-sans"
      onDrop={onDrop}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
    >
      <div className="w-full max-w-[820px] space-y-4">

        {/* HEADER */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-['Space_Grotesk'] text-2xl font-semibold tracking-tight text-[#F4F5F1]">SMS Ledger</h1>
            <p className="text-xs text-[#54565F] mt-0.5">Paste M-PESA confirmations · codes sync across all browsers</p>
          </div>
          <div className="flex items-center gap-2">
            {uncopiedCount > 0 && (
              <span className="text-[11px] font-mono font-semibold text-[#F2E75A] bg-[#F2E75A]/10 border border-[#F2E75A]/20 px-2.5 py-1 rounded-full">{uncopiedCount} pending</span>
            )}
            <span className="text-[11px] font-mono text-[#8B8E97] bg-white/5 border border-white/[0.07] px-2.5 py-1 rounded-full">{entries.length} records</span>
            <button onClick={handleExport} title="Export JSON" className="w-8 h-8 rounded-full bg-[#1B1C22] border border-white/[0.07] flex items-center justify-center text-[#8B8E97] hover:text-[#F4F5F1] hover:border-white/20 transition-all cursor-pointer">
              <Download size={14} />
            </button>
            <label title="Import JSON" className="w-8 h-8 rounded-full bg-[#1B1C22] border border-white/[0.07] flex items-center justify-center text-[#8B8E97] hover:text-[#F4F5F1] hover:border-white/20 transition-all cursor-pointer">
              <Upload size={14} />
              <input ref={importRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
            </label>
            <button onClick={() => setShowPasteZone((v) => !v)} title={showPasteZone ? "Hide paste zone" : "Show paste zone"} className="w-8 h-8 rounded-full bg-[#1B1C22] border border-white/[0.07] flex items-center justify-center text-[#8B8E97] hover:text-[#F4F5F1] hover:border-white/20 transition-all cursor-pointer">
              <ClipboardPaste size={14} />
            </button>
          </div>
        </div>

        {/* DRAG OVER OVERLAY */}
        {dragOver && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 pointer-events-none">
            <div className="bg-[#1B1C22] border-2 border-dashed border-[#00D66B]/60 rounded-[28px] px-16 py-12 flex flex-col items-center gap-3">
              <ClipboardPaste size={36} className="text-[#00D66B]" />
              <p className="text-white font-semibold text-lg">Drop SMS text here</p>
            </div>
          </div>
        )}

        {/* PASTE ZONE */}
        {showPasteZone && (
          <div className="bg-[#1B1C22] border border-white/[0.07] rounded-[22px] p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#8B8E97] flex items-center gap-1.5">
                <ClipboardPaste size={13} /> Paste SMS
              </span>
              <span className="text-[11px] text-[#54565F]">Paste anywhere on page · drag &amp; drop</span>
            </div>
            <textarea
              ref={textareaRef}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onPaste={handlePaste}
              onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleAdd(); }}
              placeholder="Paste full M-PESA SMS here…  e.g.  UC8U77YY7Q Confirmed. Ksh276.00 paid to BETFALME LIMITED on 8/3/26 at 1:15 AM"
              rows={3}
              className="w-full bg-[#0E0E12] border border-white/[0.07] focus:border-[#00D66B]/40 rounded-[14px] p-3.5 text-white text-xs font-mono outline-none resize-none placeholder-[#3A3B42] transition-colors"
            />
            {previewEntry && (
              <div className="flex flex-wrap items-center gap-2 px-1">
                {previewEntry.transactionCode && (
                  <span className="bg-[#F2E75A]/10 text-[#F2E75A] border border-[#F2E75A]/20 px-2 py-0.5 rounded-full text-[11px] font-mono font-semibold">{previewEntry.transactionCode}</span>
                )}
                {previewEntry.amount && (
                  <span className="bg-[#00D66B]/10 text-[#00D66B] border border-[#00D66B]/20 px-2 py-0.5 rounded-full text-[11px] font-semibold">{previewEntry.amount}</span>
                )}
                {previewEntry.merchant && (
                  <span className="bg-white/5 text-[#8B8E97] border border-white/[0.07] px-2 py-0.5 rounded-full text-[11px]">{previewEntry.merchant}</span>
                )}
                {previewEntry.phone && (
                  <span className="bg-white/5 text-[#8B8E97] border border-white/[0.07] px-2 py-0.5 rounded-full text-[11px] font-mono">{previewEntry.phone}</span>
                )}
                {!previewEntry.transactionCode && (
                  <span className="text-[11px] text-[#54565F] flex items-center gap-1"><AlertCircle size={11} /> No transaction code detected</span>
                )}
              </div>
            )}
            <div className="flex items-center gap-2 justify-end">
              <button
                type="button"
                onClick={async () => {
                  try { const text = await navigator.clipboard.readText(); if (text) setInputText(text.trim()); }
                  catch { addToast("Clipboard not accessible", "error"); }
                }}
                className="text-[11px] text-[#54565F] hover:text-[#8B8E97] flex items-center gap-1 cursor-pointer transition-colors px-2 py-1 rounded"
              >
                <ClipboardPaste size={11} /> Read clipboard
              </button>
              {inputText.trim() && (
                <button onClick={() => { setInputText(""); setPreviewEntry(null); }} className="text-[11px] text-[#54565F] hover:text-red-400 flex items-center gap-1 cursor-pointer transition-colors px-2 py-1 rounded">
                  <X size={11} /> Clear
                </button>
              )}
              <button
                type="button"
                onClick={() => handleAdd()}
                disabled={!inputText.trim()}
                className="bg-[#00D66B] hover:brightness-105 active:scale-[0.98] text-[#04170D] font-bold text-xs py-2 px-5 rounded-full flex items-center gap-1.5 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer shadow-sm"
              >
                <Zap size={13} /> Save Record
              </button>
            </div>
          </div>
        )}

        {/* SEARCH + FILTER */}
        <div className="bg-[#1B1C22] border border-white/[0.07] rounded-[18px] px-4 py-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Search size={14} className="text-[#54565F] shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              placeholder="Search code, phone, amount, merchant…"
              className="flex-1 bg-transparent text-xs text-white placeholder-[#54565F] outline-none font-mono min-w-0"
            />
            {search && (
              <button onClick={() => setSearch("")} className="text-[#54565F] hover:text-white cursor-pointer"><X size={13} /></button>
            )}
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {[
              { id: "all", label: "All" },
              { id: "uncopied", label: "Uncopied" },
              { id: "copied", label: "Copied" },
              { id: "verified", label: "Verified" },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => { setFilter(f.id); setCurrentPage(1); }}
                className={`text-[11px] px-2.5 py-1 rounded-full border cursor-pointer transition-all ${filter === f.id ? "bg-white/10 border-white/20 text-white font-semibold" : "border-white/[0.07] text-[#54565F] hover:text-[#8B8E97]"}`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* RECORDS LIST */}
        <div className="bg-[#1B1C22] border border-white/[0.07] rounded-[22px] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.05]">
            <span className="text-xs font-semibold text-[#54565F]">
              {filtered.length} record{filtered.length !== 1 ? "s" : ""}{filter !== "all" ? ` · ${filter}` : ""}
            </span>
            {totalPages > 1 && (
              <div className="flex items-center gap-1.5 text-xs font-mono text-[#54565F]">
                <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-1 rounded bg-white/5 hover:bg-white/10 disabled:opacity-30 cursor-pointer text-[#8B8E97] hover:text-white transition-all">
                  <ChevronLeft size={13} />
                </button>
                <span className="px-1.5">{currentPage} / {totalPages}</span>
                <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage >= totalPages} className="p-1 rounded bg-white/5 hover:bg-white/10 disabled:opacity-30 cursor-pointer text-[#8B8E97] hover:text-white transition-all">
                  <ChevronRight size={13} />
                </button>
              </div>
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16 gap-3">
              <div className="w-5 h-5 border-2 border-white/10 border-t-[#00D66B] rounded-full animate-spin" />
              <span className="text-xs text-[#54565F] font-mono">Loading records…</span>
            </div>
          ) : paginated.length === 0 ? (
            <div className="text-center py-16 space-y-2">
              <MessageSquare size={28} className="mx-auto text-[#3A3B42]" />
              <p className="text-xs text-[#54565F]">
                {entries.length === 0 ? "No records yet — paste an M-PESA SMS to get started" : "No records match your filter"}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-white/[0.04]">
              {paginated.map((entry) => {
                const isCopied = entry.wasCopied;
                const isBeingCopied = copying === entry.id;
                return (
                  <div
                    key={entry.id}
                    className={`group relative px-4 py-3.5 transition-all duration-300 ${isCopied ? "opacity-40 hover:opacity-80" : "hover:bg-white/[0.02]"}`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Verify toggle */}
                      <button
                        onClick={() => handleVerify(entry.id)}
                        className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors cursor-pointer ${entry.verified ? "bg-[#00D66B] border-[#00D66B] text-[#04170D]" : "border-white/20 hover:border-white/40"}`}
                        title={entry.verified ? "Unverify" : "Mark verified"}
                      >
                        {entry.verified && <Check size={10} strokeWidth={3} />}
                      </button>

                      {/* Main content */}
                      <div className="flex-1 min-w-0 space-y-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`font-mono text-sm font-bold tracking-wide ${entry.verified ? "text-[#54565F] line-through" : isCopied ? "text-[#8B8E97]" : "text-[#F2E75A]"}`}>
                            {entry.transactionCode || "—"}
                          </span>
                          {entry.transactionCode && (
                            <button
                              onClick={() => handleCopy(entry.id)}
                              className={`flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border cursor-pointer transition-all ${
                                isBeingCopied ? "bg-[#00D66B]/20 text-[#00D66B] border-[#00D66B]/40 scale-95"
                                : isCopied ? "bg-white/5 text-[#54565F] border-white/10 hover:bg-white/10 hover:text-white"
                                : "bg-[#F2E75A]/10 text-[#F2E75A] border-[#F2E75A]/20 hover:bg-[#F2E75A]/20"
                              }`}
                              title="Copy transaction code"
                            >
                              {isBeingCopied ? <Check size={11} strokeWidth={3} /> : <Copy size={11} />}
                              {isBeingCopied ? "Copied!" : isCopied ? "Copy again" : "Copy code"}
                            </button>
                          )}
                          {isCopied && (
                            <span className="text-[10px] text-[#54565F] font-mono">
                              copied {entry.copiedAt ? new Date(entry.copiedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5">
                          {entry.amount && (
                            <span className="text-[#00D66B] bg-[#00D66B]/10 border border-[#00D66B]/15 px-2 py-0.5 rounded-full text-[11px] font-semibold">{entry.amount}</span>
                          )}
                          {entry.merchant && (
                            <span className="text-[#8B8E97] bg-white/5 border border-white/[0.07] px-2 py-0.5 rounded-full text-[11px] truncate max-w-[180px]">{entry.merchant}</span>
                          )}
                          {entry.phone && (
                            <span className="text-[#8B8E97] bg-white/5 border border-white/[0.07] px-2 py-0.5 rounded-full text-[11px] font-mono">{entry.phone}</span>
                          )}
                          {entry.dateTime && (
                            <span className="text-[#54565F] text-[11px] font-mono">{entry.dateTime}</span>
                          )}
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        {entry.raw && (
                          <button onClick={() => handleCopyFull(entry.id)} title="Copy full SMS text" className="p-1.5 rounded-lg bg-white/5 text-[#54565F] hover:text-white hover:bg-white/10 border border-white/[0.07] transition-all cursor-pointer">
                            <MessageSquare size={12} />
                          </button>
                        )}
                        {isCopied && (
                          <button onClick={() => handleUnblur(entry.id)} title="Restore (unblur)" className="p-1.5 rounded-lg bg-white/5 text-[#54565F] hover:text-[#8B8E97] hover:bg-white/10 border border-white/[0.07] transition-all cursor-pointer">
                            <Eye size={12} />
                          </button>
                        )}
                        <button onClick={() => handleDelete(entry.id)} title="Delete record" className="p-1.5 rounded-lg bg-white/5 text-[#54565F] hover:text-red-400 hover:bg-red-500/10 border border-white/[0.07] transition-all cursor-pointer">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {!loading && entries.length > 0 && (
          <p className="text-center text-[11px] text-[#3A3B42] pb-2">
            Records sync across all browsers · copied records blur automatically
          </p>
        )}
      </div>
    </div>
  );
}
