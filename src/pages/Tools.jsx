import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Calculator, 
  Zap, 
  HelpCircle, 
  Copy, 
  ArrowRight,
  ShieldCheck,
  History,
  AlertCircle,
  LayoutGrid,
  TrendingUp,
  Percent
} from 'lucide-react';
import { 
  isAfter, 
  isBefore, 
  setHours, 
  setMinutes, 
  setSeconds,
  subDays, 
  format,
  parse,
  isSameDay} from "date-fns";
import demoVideo from '../assets/copy_demo.png';

import { useToast } from '../context/ToastContext';

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

const formatDateForUI = (mode, offset) => {
  if (mode === 'all') return "Full Audit Mode";
  
  const now = new Date();
  let baseDate = subDays(new Date(now), offset);
  let cycleEnd = setSeconds(setMinutes(setHours(baseDate, 20), 30), 0);
  
  if (mode === 'previous') {
    if (isBefore(now, setSeconds(setMinutes(setHours(new Date(now), 20), 30), 0)) && offset === 0) {
      cycleEnd = subDays(cycleEnd, 1);
    }
  } else if (mode === 'current') {
    if (isAfter(now, setSeconds(setMinutes(setHours(new Date(now), 20), 30), 0)) && offset === 0) {
      cycleEnd = new Date(cycleEnd.getTime() + 86400000);
    }
  }
  
  const cycleStart = subDays(cycleEnd, 1);
  return `${format(cycleStart, 'MMM d, h:mm a')} – ${format(cycleEnd, 'MMM d, h:mm a')}`;
};

// ─────────────────────────────────────────────────────────────────────────────
// ODDS CALCULATOR COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

function OddsCalculator() {
  const [stake, setStake] = useState(100);
  const [odds, setOdds] = useState(2.5);
  const totalReturn = (stake * odds).toFixed(2);
  const profit = (stake * odds - stake).toFixed(2);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Card */}
        <div className="glass-card p-8 space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-accent/10 border border-accent/20 text-accent">
              <Percent size={20} />
            </div>
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-widest">Live Odds Converter</h3>
              <p className="text-[10px] text-gray-500 uppercase font-bold tracking-[0.2em] mt-1">Decimal Payout Analysis</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-2 block">Stake Amount (KES)</label>
              <input
                type="number"
                value={stake}
                onChange={(e) => setStake(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full bg-[#1b1e2b] rounded-2xl px-6 py-4 text-white font-bold outline-none focus:ring-2 focus:ring-accent/40 transition-all"
              />
            </div>
            <div>
              <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-2 block">Decimal Odds</label>
              <input
                type="number"
                step="0.01"
                value={odds}
                onChange={(e) => setOdds(Math.max(1, parseFloat(e.target.value) || 0))}
                className="w-full bg-[#1b1e2b] rounded-2xl px-6 py-4 text-white font-bold outline-none focus:ring-2 focus:ring-accent/40 transition-all"
              />
            </div>
          </div>

          <div className="p-4 bg-accent/5 border border-accent/10 rounded-2xl">
             <p className="text-[10px] text-accent/60 italic leading-relaxed font-medium text-center">
               "Returns are calculated using the standard decimal formula: Stake × Odds = Total Return."
             </p>
          </div>
        </div>

        {/* Results Card */}
        <div className="glass-card p-8 flex flex-col justify-between">
          <div className="space-y-8">
            <div className="text-center lg:text-left">
              <span className="text-[10px] font-black text-accent uppercase tracking-widest block mb-2">Potential Returns</span>
              <div className="text-5xl font-black text-white tracking-tighter">
                <span className="text-xl text-gray-600 mr-2">KES</span>
                {Number(totalReturn).toLocaleString()}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="p-6 rounded-3xl bg-emerald-500/5 border border-emerald-500/10">
                <span className="text-[9px] font-black text-emerald-500/60 uppercase block mb-1">Pure Profit</span>
                <span className="text-xl font-black text-emerald-500">KES {Number(profit).toLocaleString()}</span>
              </div>
              <div className="p-6 rounded-3xl bg-blue-500/5 border border-blue-500/10">
                <span className="text-[9px] font-black text-blue-500/60 uppercase block mb-1">Return Multiplier</span>
                <span className="text-xl font-black text-blue-500">{odds}x</span>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp size={16} className="text-gray-700" />
              <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Market Advantage Active</span>
            </div>
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Market Quick Reference */}
      <div className="glass-card p-8">
        <h4 className="text-[10px] font-black text-white uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
          <LayoutGrid size={14} className="text-accent" />
          Market Quick Reference
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { code: "1X2", name: "Match Result", desc: "1 (Home), X (Draw), 2 (Away)" },
            { code: "O/U", name: "Over / Under", desc: "Total goals above/below line" },
            { code: "GG/NG", name: "BTTS", desc: "Both teams score (GG) or not (NG)" },
            { code: "DC", name: "Double Chance", desc: "Covers two possible outcomes" }
          ].map((m) => (
            <div key={m.code} className="p-4 rounded-2xl bg-[#1b1e2b] hover:bg-[#222538] transition-all">
              <span className="text-[10px] font-black text-accent uppercase tracking-widest block mb-1">{m.code}</span>
              <span className="text-xs font-bold text-white block mb-1">{m.name}</span>
              <p className="text-[10px] text-gray-500 leading-tight">{m.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CASHBACK CALCULATOR COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

function CashbackCalculator() {
  const [deposits, setDeposits] = useState("");
  const [withdrawals, setWithdrawals] = useState("");
  const [isSmartPasteMode, setIsSmartPasteMode] = useState(true);
  const [pasteContent, setPasteContent] = useState("");
  const [cycleMode, setCycleMode] = useState('all'); 
  const [cycleOffset, setCycleOffset] = useState(0);
  const [parsedTx, setParsedTx] = useState([]);
  const { showToast } = useToast();
  const [isVideoExpanded, setIsVideoExpanded] = useState(false);

  const isResetWindow = (date) => {
    if (!date) return false;
    const h = date.getHours();
    const m = date.getMinutes();
    return (h === 20 && m >= 30 && m < 40);
  };

  const handleCopySummary = (day, lineIndex) => {
    const netLoss = Math.max(0, day.deposits - day.withdrawals);
    const cb = netLoss * 0.1;

    const startStr = format(day.start, 'MMM d, h:mm a');
    const endStr = format(day.end, 'MMM d, h:mm a');

    // Helper: show all individual amounts summed, e.g. "500 + 1,000 + 2,000 = 3,500"
    const formatBreakdown = (list, total) => {
      if (!list || list.length === 0) return "0";
      if (list.length === 1) return `${list[0].toLocaleString()} ksh`;
      const sorted = [...list].reverse();
      return `${sorted.map(n => n.toLocaleString()).join(' + ')} = ${total.toLocaleString()} ksh`;
    };

    const depBreakdown = formatBreakdown(day.depList, day.deposits);
    const withBreakdown = formatBreakdown(day.withList, day.withdrawals);

    const verdictLine = cb > 0
      ? `Cashback Verdict: Eligible for cashback! (${day.deposits.toLocaleString()} deposits - ${day.withdrawals.toLocaleString()} withdrawals) × 10% = KSh ${cb.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })} cashback due.`
      : `Cashback Verdict: Not eligible for cashback. Cashback is calculated as 10% of net losses (Deposits minus Withdrawals). Since total withdrawals (KSh ${day.withdrawals.toLocaleString()}) equal or exceed total deposits (KSh ${day.deposits.toLocaleString()}), the net loss is KSh 0, so no cashback is generated.`;

    const lines = [
      `Sum of Deposits (${startStr} – ${endStr}): ${depBreakdown}`,
      `Sum of Withdrawals (${startStr} – ${endStr}): ${withBreakdown}`,
      verdictLine
    ];

    const text = lines[lineIndex - 1];
    navigator.clipboard.writeText(text);
    showToast(`Copied!`, 'success');
  };

  const depNum = parseFloat(deposits) || 0;
  const withNum = parseFloat(withdrawals) || 0;
  const netLoss = Math.max(0, depNum - withNum);
  const cashback = netLoss * 0.1;

  // Live Parser Effect — Precise regex-based approach for portal data format
  React.useEffect(() => {
    if (!pasteContent.trim()) {
      setParsedTx([]);
      return;
    }

    const lines = pasteContent.split("\n").map(l => l.trim()).filter(l => l.length > 0);
    const results = [];

    // Detect and skip header row
    const firstLineLower = lines[0].toLowerCase();
    const headerKeywords = ["type", "action", "amount", "balance", "date", "id"];
    const isHeader = headerKeywords.filter(k => firstLineLower.includes(k)).length >= 2;

    lines.forEach((line, i) => {
      if (isHeader && i === 0) return;
      const lowerLine = line.toLowerCase();

      // ── 1. Classify transaction type ──────────────────────────────────────
      let type = "other";
      let rawType = "Unknown";

      if (lowerLine.includes("cash back") || lowerLine.includes("cashback")) {
        type = "other"; rawType = "Cash Back";
      } else if (lowerLine.includes("admin deposit")) {
        type = "deposit"; rawType = "Admin Deposit";
      } else if (lowerLine.includes("withdraw")) {
        type = "withdrawal"; rawType = "Withdraw";
      } else if (lowerLine.includes("deposit")) {
        type = "deposit"; rawType = "Deposit";
      } else {
        return; // skip unrecognised lines
      }

      // ── 2. Extract amount — match the SIGNED amount (first +/- KSH value) ─
      // Portal format: "+KSH 1,000.00" or "-KSH 2,000.00" or "KSH 63.00"
      const amountMatch = line.match(/[+-]?\s*KSH\s+([0-9,]+(?:\.[0-9]{1,2})?)/i)
                       || line.match(/([+-])\s*([0-9,]+(?:\.[0-9]{1,2})?)/);
      let amount = 0;
      if (amountMatch) {
        // Take the first captured group that looks like a number
        const numStr = (amountMatch[1] || amountMatch[2] || "").replace(/,/g, "");
        amount = parseFloat(numStr) || 0;
      } else {
        // Fallback: grab first standalone number with decimals
        const fallback = line.match(/\b([0-9,]+\.[0-9]{2})\b/);
        if (fallback) amount = parseFloat(fallback[1].replace(/,/g, "")) || 0;
      }

      // ── 3. Extract date ────────────────────────────────────────────────────
      const dateMatch = line.match(/\d{1,2}\/\d{1,2}\/\d{4},?\s+\d{1,2}:\d{2}(?::\d{2})?\s+(?:AM|PM)/i)
                     || line.match(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
      const dateStr = dateMatch ? dateMatch[0] : "";
      let txDate = null;
      if (dateStr) {
        try {
          if (dateStr.includes("T")) {
            txDate = new Date(dateStr);
          } else {
            const cleanDate = dateStr.replace(",", "");
            txDate = parse(cleanDate, "M/d/yyyy h:mm:ss a", new Date());
            if (isNaN(txDate?.getTime())) txDate = parse(cleanDate, "M/d/yyyy h:mm a", new Date());
            if (isNaN(txDate?.getTime())) txDate = new Date(cleanDate);
          }
        } catch(e) { /* leave null */ }
      }

      const parts = line.split(/\s+/);
      if (rawType !== "Unknown") {
        results.push({
          id: parts[0],
          type,
          rawType,
          amount,
          date: txDate,
          dateStr: dateStr || "N/A",
          ignored: type === "other"
        });
      }
    });

    setParsedTx(results.sort((a, b) => (b.date?.getTime() || 0) - (a.date?.getTime() || 0)));
  }, [pasteContent]);

  const handleSmartPaste = () => {
    if (parsedTx.length === 0) return;
    let totalDep = 0; let totalWith = 0;
    const now = new Date();
    let cEnd = setSeconds(setMinutes(setHours(subDays(new Date(now), cycleOffset), 20), 30), 0);
    if (cycleMode === 'previous' && isBefore(now, setSeconds(setMinutes(setHours(new Date(now), 20), 30), 0)) && cycleOffset === 0) {
      cEnd = subDays(cEnd, 1);
    } else if (cycleMode === 'current' && isAfter(now, setSeconds(setMinutes(setHours(new Date(now), 20), 30), 0)) && cycleOffset === 0) {
      cEnd = new Date(cEnd.getTime() + 86400000);
    }
    const cStart = subDays(cEnd, 1);
    parsedTx.forEach(tx => {
      const inPeriod = cycleMode === 'all' || (tx.date && isAfter(tx.date, cStart) && isBefore(tx.date, cEnd));
      const inReset = tx.date && isResetWindow(tx.date);
      
      if (inPeriod && !tx.ignored && !inReset) {
        if (tx.type === "deposit") totalDep += tx.amount;
        else if (tx.type === "withdrawal") totalWith += tx.amount;
      }
    });
    setDeposits(totalDep.toFixed(2)); setWithdrawals(totalWith.toFixed(2));
  };

  const getDailyBreakdown = () => {
    if (parsedTx.length === 0) return [];
    const groups = {};
    parsedTx.forEach(tx => {
      if (!tx.date || tx.ignored || isResetWindow(tx.date)) return;
      let cEnd = setSeconds(setMinutes(setHours(new Date(tx.date), 20), 30), 0);
      if (isAfter(tx.date, cEnd)) cEnd = new Date(cEnd.getTime() + 86400000);
      const key = format(cEnd, 'yyyy-MM-dd');
      if (!groups[key]) groups[key] = { 
        start: subDays(cEnd, 1), 
        end: cEnd, 
        deposits: 0, 
        withdrawals: 0, 
        depList: [], 
        withList: [],
        count: 0, 
        label: isAfter(cEnd, new Date()) ? "Current" : "History" 
      };
      if (tx.type === 'deposit') {
        groups[key].deposits += tx.amount;
        groups[key].depList.push(tx.amount);
      } else if (tx.type === 'withdrawal') {
        groups[key].withdrawals += tx.amount;
        groups[key].withList.push(tx.amount);
      }
      groups[key].count++;
    });
    return Object.values(groups).sort((a, b) => b.end.getTime() - a.end.getTime());
  };

  const dailyBreakdown = getDailyBreakdown();

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* ── PAGE HEADER — MpesaCodes style ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 rounded-xl bg-[#baff55]/10 text-[#baff55]">
              <Calculator size={20} />
            </div>
            <h1 className="text-xl md:text-2xl font-black text-white tracking-wide">Cashback Calculator</h1>
          </div>
          <p className="text-xs text-gray-400 font-medium">
            Paste portal transactions to auto-calculate cashback per 24-hr cycle (8:30 PM – 8:30 PM)
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Main Interface: Left Column */}
        <div className="lg:col-span-8 space-y-5">

          <div className="bg-[#131520] rounded-2xl p-5 shadow-xl space-y-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-[#baff55]/10 text-[#baff55]">
                  <Zap size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-tight">Smart Paste Analysis</h3>
                  <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mt-0.5">Auto-parse portal transactions</p>
                </div>
              </div>

              <div className="flex items-center bg-[#1b1e2b] p-1 rounded-2xl self-start">
                <button onClick={() => setIsSmartPasteMode(true)} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isSmartPasteMode ? 'bg-[#baff55] text-black shadow-lg shadow-[#baff55]/20' : 'text-gray-400 hover:text-white bg-transparent'}`}>Smart Paste</button>
                <button onClick={() => setIsSmartPasteMode(false)} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${!isSmartPasteMode ? 'bg-[#baff55] text-black shadow-lg shadow-[#baff55]/20' : 'text-gray-400 hover:text-white bg-transparent'}`}>Manual</button>
              </div>
            </div>

            {isSmartPasteMode ? (
              <div className="space-y-6">
                <div className="relative group">
                  <textarea 
                    value={pasteContent}
                    onChange={(e) => setPasteContent(e.target.value)}
                    placeholder="Paste portal transactions here...
Example:
20608273	withdraw	-KSH 4,555.00	KSH 200.00	—	5/11/2026, 9:39:06 PM
20607525	Deposit	+KSH 90.00	KSH 189.00	—	5/11/2026, 9:27:14 PM"
                    className="w-full h-48 bg-[#0d0f18] rounded-[24px] p-6 text-[#10b981] font-mono text-sm outline-none focus:border-[#ff7a59]/50 focus:ring-1 focus:ring-[#ff7a59]/50 transition-all placeholder:text-gray-700/50 resize-none shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]"
                  />
                  <div className="absolute top-4 right-6 flex items-center gap-2">
                    <span className="text-[8px] font-black text-gray-700 uppercase tracking-widest">Auto-Analyzing</span>
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-3 block">Total Deposits</label>
                  <div className="relative">
                    <input type="number" value={deposits} onChange={(e) => setDeposits(e.target.value)} className="premium-input w-full px-6 py-4 text-sm font-bold" placeholder="0.00" />
                    <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-600">KES</span>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-3 block">Total Withdrawals</label>
                  <div className="relative">
                    <input type="number" value={withdrawals} onChange={(e) => setWithdrawals(e.target.value)} className="premium-input w-full px-6 py-4 text-sm font-bold" placeholder="0.00" />
                    <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-600">KES</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Audit Table (if data exists) */}
          {parsedTx.length > 0 && (
            <div className="bg-[#131520] rounded-2xl shadow-xl overflow-hidden">
              <div className="px-5 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-[#baff55]/10 text-[#baff55]">
                    <History size={15} />
                  </div>
                  <h4 className="text-xs font-black text-white uppercase tracking-widest">Parsed Transaction Log</h4>
                </div>
                <span className="text-[10px] font-black text-[#baff55] bg-[#baff55]/10 px-3 py-1 rounded-full uppercase tracking-widest">{parsedTx.length} Records</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-white/[0.02] text-[9px] font-black text-gray-400 uppercase tracking-widest">
                    <tr>
                      <th className="px-5 py-3">Type</th>
                      <th className="px-5 py-3">Amount</th>
                      <th className="px-5 py-3 text-right">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedTx.map((tx, idx) => (
                      <tr key={idx} className="border-t border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                        <td className="px-5 py-3">
                          <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${tx.type === 'deposit' ? 'bg-emerald-500/10 text-emerald-500' : tx.type === 'withdrawal' ? 'bg-red-500/10 text-red-500' : 'bg-gray-500/10 text-gray-500'}`}>
                            {tx.rawType}
                          </span>
                        </td>
                        <td className="px-5 py-3 font-bold text-white text-xs">KSh {tx.amount.toLocaleString()}</td>
                        <td className="px-5 py-3 text-right text-[10px] font-medium text-gray-500">
                          {tx.date ? format(tx.date, 'eee, MMM d • HH:mm') : tx.dateStr}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar: Right Column */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-[#131520] rounded-2xl p-4 shadow-xl flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#baff55]/10 text-[#baff55]">
              <LayoutGrid size={15} />
            </div>
            <div>
              <h3 className="text-xs font-black text-white uppercase tracking-wider">Daily Cycle Breakdown</h3>
              <p className="text-[10px] text-gray-500">Click any copy button to send the full message</p>
            </div>
          </div>

          <div className="space-y-3">
            {dailyBreakdown.length > 0 ? dailyBreakdown.map((day, i) => {
              const netLoss = Math.max(0, day.deposits - day.withdrawals);
              const cb = netLoss * 0.1;

              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="bg-[#131520] rounded-2xl p-4 shadow-xl space-y-3"
                >
                  {/* Card Header */}
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-black text-[#baff55] uppercase tracking-widest">{day.label} Cycle</span>
                        {day.label === 'Current' && (
                          <motion.span
                            animate={{ opacity: [1, 0.4, 1] }}
                            transition={{ repeat: Infinity, duration: 1.5 }}
                            className="w-1.5 h-1.5 rounded-full bg-[#baff55]"
                          />
                        )}
                      </div>
                      <p className="text-xs font-black text-white mt-0.5 uppercase tracking-tight">
                        {format(day.end, 'eeee, MMM d')}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-[8px] font-black text-gray-500 uppercase block tracking-widest">Cashback</span>
                      <span className={`text-base font-black ${cb > 0 ? 'text-emerald-400' : 'text-gray-500'}`}>
                        KSh {cb.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>

                  {/* Copy Lines */}
                  <div className="space-y-2 pt-3 border-t border-white/[0.06]">
                    {/* Line 1 — Deposits */}
                    <div className="flex items-center justify-between bg-[#1b1e2b] rounded-xl px-3 py-2.5">
                      <div>
                        <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest block">Sum of Deposits</span>
                        <span className="text-xs font-bold text-white">KSh {day.deposits.toLocaleString()}</span>
                      </div>
                      <button
                        onClick={() => handleCopySummary(day, 1)}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#baff55]/10 hover:bg-[#baff55]/20 rounded-lg text-[#baff55] text-[9px] font-black uppercase tracking-widest transition-all"
                      >
                        <Copy size={10} />
                        Copy
                      </button>
                    </div>

                    {/* Line 2 — Withdrawals */}
                    <div className="flex items-center justify-between bg-[#1b1e2b] rounded-xl px-3 py-2.5">
                      <div>
                        <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest block">Sum of Withdrawals</span>
                        <span className="text-xs font-bold text-white">KSh {day.withdrawals.toLocaleString()}</span>
                      </div>
                      <button
                        onClick={() => handleCopySummary(day, 2)}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#baff55]/10 hover:bg-[#baff55]/20 rounded-lg text-[#baff55] text-[9px] font-black uppercase tracking-widest transition-all"
                      >
                        <Copy size={10} />
                        Copy
                      </button>
                    </div>

                    {/* Line 3 — Cashback Verdict */}
                    <div className="flex items-center justify-between bg-[#1b1e2b] rounded-xl px-3 py-2.5">
                      <div className="flex-1 pr-2 min-w-0">
                        <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest block">Cashback Verdict</span>
                        <span className={`text-xs font-bold block truncate ${cb > 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {cb > 0 ? `KSh ${cb.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })} due` : `Not Eligible — Withdrawals (KSh ${day.withdrawals.toLocaleString()}) ≥ Deposits (KSh ${day.deposits.toLocaleString()})`}
                        </span>
                      </div>
                      <button
                        onClick={() => handleCopySummary(day, 3)}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#baff55]/10 hover:bg-[#baff55]/20 rounded-lg text-[#baff55] text-[9px] font-black uppercase tracking-widest transition-all shrink-0"
                      >
                        <Copy size={10} />
                        Copy
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            }) : (
              <div className="bg-[#131520] rounded-2xl p-10 text-center shadow-xl">
                <Calculator size={36} className="mx-auto text-gray-700 mb-3" />
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Paste portal data to see breakdown</p>
              </div>
            )}
          </div>

          {/* Rules card */}
          <div className="bg-[#131520] rounded-2xl p-4 shadow-xl space-y-2">
            <div className="flex items-center gap-2">
              <ShieldCheck size={14} className="text-[#baff55]" />
              <span className="text-[10px] font-bold text-white uppercase tracking-wider">Calculation Rules</span>
            </div>
            <p className="text-[10px] text-gray-400 leading-relaxed">Calculated daily from 8:30 PM to 8:30 PM. The 8:30 PM to 8:40 PM window is a reset gap; deposits during this time are not counted.</p>
          </div>
        </div>
      </div>

      {/* Staff Guidelines (On-Page) */}
      <div className="glass-card p-8 space-y-6">
         <div className="flex items-center justify-between">
           <div className="flex items-center gap-3">
             <HelpCircle size={18} className="text-accent" />
             <span className="text-xs font-bold text-white uppercase tracking-wider">Staff Guidelines</span>
           </div>
           <div className="px-3 py-1 bg-accent/10 rounded-full border border-accent/20">
             <span className="text-[9px] font-bold text-accent uppercase">Reference</span>
           </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
           <div className="space-y-4">
             <div className="space-y-2">
               <h3 className="text-xs font-black text-white uppercase tracking-wider">How to Copy (The Selection Zone)</h3>
               <p className="text-[10px] text-gray-500 leading-relaxed italic">
                 "Position your mouse at the Transaction ID and drag all the way to the Date column. Include as many rows as needed. **No need to copy the column headers.**"
               </p>
             </div>
             
             <ul className="space-y-2">
               {[
                 "Must include Action Type (Deposit/Withdraw)",
                 "Must include Amount & Full Timestamp",
                 "No need to copy column headers",
                 "Handles thousands of rows instantly"
               ].map((item, i) => (
                 <li key={i} className="flex items-center gap-2 text-[9px] font-bold text-gray-600 uppercase">
                   <ShieldCheck size={10} className="text-emerald-500" />
                   {item}
                 </li>
               ))}
             </ul>
           </div>

           <div 
             onClick={() => setIsVideoExpanded(true)}
             className="relative group rounded-2xl overflow-hidden aspect-video bg-black/40 cursor-pointer hover:border-accent/40 transition-all shadow-2xl flex items-center justify-center"
           >
             <img 
               src={demoVideo}
               alt="How to Copy Tutorial"
               className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity z-10"
               loading="lazy"
             />
             {/* Loading / Fallback UI */}
             <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 bg-white/5 animate-pulse">
               <Calculator size={20} className="text-gray-800 mb-2" />
               <span className="text-[7px] font-black text-gray-700 uppercase tracking-widest">Loading Tutorial...</span>
             </div>
             
             <div className="absolute inset-0 bg-accent/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20">
               <LayoutGrid size={24} className="text-white drop-shadow-lg" />
             </div>
             <div className="absolute top-2 right-2 px-2 py-0.5 bg-black/60 backdrop-blur-md rounded text-[7px] font-black text-white uppercase tracking-widest z-20">
               Click to Expand
             </div>
           </div>
         </div>
      </div>

      {/* Video Lightbox Modal */}
      {isVideoExpanded && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-12 bg-black/95 backdrop-blur-xl animate-in fade-in duration-300"
          onClick={() => setIsVideoExpanded(false)}
        >
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative w-full max-w-5xl aspect-video rounded-3xl overflow-hidden shadow-[0_0_100px_rgba(var(--accent-rgb),0.2)] bg-black flex items-center justify-center"
          >
             <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
               <Calculator size={32} className="text-gray-800 mb-2 animate-bounce" />
               <span className="text-[10px] font-black text-gray-700 uppercase tracking-widest">Optimizing Visual...</span>
             </div>
            <img src={demoVideo} className="w-full h-full object-contain relative z-10" alt="Expanded Tutorial" />
            <button className="absolute top-6 right-6 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors backdrop-blur-md z-20">
              <LayoutGrid size={20} className="rotate-45" />
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CASHBACK RULES COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

function CashbackRules() {
  const rules = [
    {
      id: "01",
      title: "Cycle Window",
      color: "#baff55",
      desc: "Each cashback cycle runs from 8:30 PM to 8:30 PM the following day. Transactions outside this window do not count toward the current cycle.",
      example: "Deposits at 8:45 PM on Monday count for Monday's cycle, which closes at 8:30 PM Tuesday."
    },
    {
      id: "02",
      title: "Net Loss Calculation",
      color: "#3b82f6",
      desc: "Cashback = 10% of net loss. Net loss = Total Deposits − Total Withdrawals within the cycle. If withdrawals exceed deposits, net loss is KES 0 and no cashback applies.",
      example: "Deposits KES 3,000 · Withdrawals KES 1,200 → Net Loss KES 1,800 → Cashback KES 180."
    },
    {
      id: "03",
      title: "Eligible Transaction Types",
      color: "#ffa64d",
      desc: "Only Deposit and Withdrawal transactions count. Admin Deposits, Cash Back credits, and any 'other' type entries are ignored in the calculation.",
      example: "A KES 500 Cash Back credit does NOT add to the deposit total."
    },
    {
      id: "04",
      title: "One Cashback Per Cycle",
      color: "#a855f7",
      desc: "Only one cashback can be awarded per customer per cycle, regardless of how many transactions they made during that window.",
      example: "A user who deposited 10 times still gets a single cashback payout at end of cycle."
    },
    {
      id: "05",
      title: "Minimum Threshold",
      color: "#10b981",
      desc: "Net loss must be at least KES 100 for the customer to qualify. Below this threshold no cashback is generated even if they have a net loss.",
      example: "Deposits KES 500 · Withdrawals KES 450 → Net Loss KES 50 → No cashback (below KES 100 minimum)."
    },
    {
      id: "06",
      title: "Cashback Payout",
      color: "#ff4d4d",
      desc: "Cashback is credited as bonus funds and is NOT withdrawable directly. It can be used for betting only. Wagering requirements may apply per the active promotion terms.",
      example: "KES 300 cashback credited → customer can bet with KES 300 but must wager before withdrawing any winnings from it."
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="bg-[#131520] rounded-2xl p-6 flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-[#baff55]/10 flex items-center justify-center">
          <ShieldCheck size={22} className="text-[#baff55]" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">Cashback Rules</h2>
          <p className="text-xs text-gray-500 mt-0.5">Official eligibility criteria and calculation logic — 6 rules</p>
        </div>
      </div>

      {/* Rules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {rules.map((rule) => (
          <div key={rule.id} className="bg-[#131520] rounded-2xl p-6 space-y-3 hover:bg-[#161824] transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em]">Rule {rule.id}</span>
              <span 
                className="text-[10px] font-bold px-2.5 py-0.5 rounded-full"
                style={{ background: `${rule.color}18`, color: rule.color }}
              >
                {rule.title}
              </span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">{rule.desc}</p>
            <div className="bg-[#0e1017] rounded-xl p-3 flex gap-2">
              <span className="text-[#baff55] text-[10px] font-black shrink-0 uppercase tracking-wider mt-0.5">eg.</span>
              <span className="text-[11px] text-gray-300 leading-relaxed font-mono">{rule.example}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Reference Formula */}
      <div className="bg-[#131520] rounded-2xl p-6 space-y-4">
        <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
          <Calculator size={14} className="text-[#baff55]" /> Quick Formula Reference
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "Net Loss", formula: "Deposits − Withdrawals", color: "#3b82f6" },
            { label: "Cashback", formula: "Net Loss × 10%", color: "#baff55" },
            { label: "Minimum", formula: "Net Loss ≥ KES 100", color: "#10b981" }
          ].map((f) => (
            <div key={f.label} className="bg-[#0e1017] rounded-2xl p-4 text-center space-y-1">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">{f.label}</span>
              <span className="text-sm font-black font-mono" style={{ color: f.color }}>{f.formula}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN TOOLS PAGE
// ─────────────────────────────────────────────────────────────────────────────

export default function Tools() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryTab = new URLSearchParams(location.search).get('tab');
  const activeTab = queryTab === 'odds' ? 'odds' : queryTab === 'rules' ? 'rules' : 'cashback';

  const setActiveTab = (tab) => {
    const params = new URLSearchParams(location.search);
    if (tab === 'cashback') {
      params.delete('tab');
    } else {
      params.set('tab', tab);
    }
    navigate({ search: params.toString() }, { replace: true });
  };

  const tabs = [
    { id: 'cashback', label: 'Calculator' },
    { id: 'odds', label: 'Odds Converter' },
    { id: 'rules', label: 'Cashback Rules' },
  ];

  return (
    <div className="min-h-screen bg-[#0e1017] pt-8 pb-32 px-4 md:px-8 max-w-7xl mx-auto space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter">Cashback & Tools</h1>
          <p className="text-gray-500 text-sm mt-2 max-w-md">Calculators, converters, and the rules that govern them.</p>
        </div>

        <div className="flex bg-[#131520] p-1.5 rounded-2xl shadow-lg">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] transition-all ${
                activeTab === t.id ? 'bg-[#baff55] text-black shadow-lg' : 'text-gray-400 hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
        {activeTab === 'cashback' && <CashbackCalculator />}
        {activeTab === 'odds' && <OddsCalculator />}
        {activeTab === 'rules' && <CashbackRules />}
      </motion.div>
    </div>
  );
}
