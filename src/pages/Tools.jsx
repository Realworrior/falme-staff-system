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
        <div className="bg-black/20 border border-white/5 rounded-[32px] p-8 space-y-6">
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
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-accent/40 focus:ring-1 focus:ring-accent/40 transition-all"
              />
            </div>
            <div>
              <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-2 block">Decimal Odds</label>
              <input
                type="number"
                step="0.01"
                value={odds}
                onChange={(e) => setOdds(Math.max(1, parseFloat(e.target.value) || 0))}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-accent/40 focus:ring-1 focus:ring-accent/40 transition-all"
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
        <div className="bg-black/20 border border-white/5 rounded-[32px] p-8 flex flex-col justify-between">
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
      <div className="bg-black/20 border border-white/5 rounded-[32px] p-8">
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
            <div key={m.code} className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.05] transition-all">
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

  const handleCopySummary = (day) => {
    const netLoss = Math.max(0, day.deposits - day.withdrawals);
    const cb = netLoss * 0.1;
    const summary = `Total Withdrawals (Yesterday to today): ${Math.round(day.withdrawals).toLocaleString()}KSh
Total Deposits from 8:30pm (Yesterday to today) : ${Math.round(day.deposits).toLocaleString()}ksh 
Cashback calculation : ${Math.round(day.withdrawals).toLocaleString()} / ${Math.round(day.deposits).toLocaleString()} * 10% = ${Math.round(cb).toLocaleString()}ksh`;
    
    navigator.clipboard.writeText(summary);
    showToast('Daily Summary Copied!', 'success');
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
      if (inPeriod && !tx.ignored) {
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
      if (!tx.date || tx.ignored) return;
      let cEnd = setSeconds(setMinutes(setHours(new Date(tx.date), 20), 30), 0);
      if (isAfter(tx.date, cEnd)) cEnd = new Date(cEnd.getTime() + 86400000);
      const key = format(cEnd, 'yyyy-MM-dd');
      if (!groups[key]) groups[key] = { start: subDays(cEnd, 1), end: cEnd, deposits: 0, withdrawals: 0, count: 0, label: isAfter(cEnd, new Date()) ? "Current" : "History" };
      if (tx.type === 'deposit') groups[key].deposits += tx.amount;
      else if (tx.type === 'withdrawal') groups[key].withdrawals += tx.amount;
      groups[key].count++;
    });
    return Object.values(groups).sort((a, b) => b.end.getTime() - a.end.getTime());
  };

  const dailyBreakdown = getDailyBreakdown();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Interface: Left Column */}
        <div className="lg:col-span-8 space-y-8">
          
          <div className="bg-black/20 border border-white/5 rounded-[32px] p-8 space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-accent/10 border border-accent/20 text-accent">
                  <Zap size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white uppercase tracking-tighter">Smart Analysis</h3>
                  <p className="text-[10px] text-gray-500 uppercase font-black tracking-[0.2em] mt-1">Supreme Accuracy Engine</p>
                </div>
              </div>

              <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 self-start">
                <button onClick={() => setIsSmartPasteMode(true)} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isSmartPasteMode ? 'bg-accent text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}>Smart Paste</button>
                <button onClick={() => setIsSmartPasteMode(false)} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${!isSmartPasteMode ? 'bg-accent text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}>Manual</button>
              </div>
            </div>

            {isSmartPasteMode ? (
              <div className="space-y-6">
                <div className="relative group">
                  <textarea 
                    value={pasteContent}
                    onChange={(e) => setPasteContent(e.target.value)}
                    placeholder="Paste transaction logs from portal..."
                    className="w-full h-48 bg-white/5 border border-white/10 rounded-[24px] p-6 text-white text-sm font-medium outline-none focus:border-accent/40 focus:ring-1 focus:ring-accent/40 transition-all placeholder:text-gray-700 resize-none"
                  />
                  <div className="absolute top-4 right-6 flex items-center gap-2">
                    <span className="text-[8px] font-black text-gray-700 uppercase tracking-widest">Awaiting Input</span>
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-800" />
                  </div>
                </div>
                <button 
                  onClick={handleSmartPaste}
                  className="w-full py-5 rounded-[24px] bg-accent text-white text-xs font-black uppercase tracking-[0.2em] shadow-2xl shadow-accent/20 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-3 group"
                >
                  <Zap size={16} className="group-hover:animate-pulse" />
                  Analyze & Sync Summary
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-3 block">Total Deposits</label>
                  <div className="relative">
                    <input type="number" value={deposits} onChange={(e) => setDeposits(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-accent/40" placeholder="0.00" />
                    <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-600">KES</span>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-3 block">Total Withdrawals</label>
                  <div className="relative">
                    <input type="number" value={withdrawals} onChange={(e) => setWithdrawals(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-accent/40" placeholder="0.00" />
                    <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-600">KES</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Audit Table (if data exists) */}
          {parsedTx.length > 0 && (
            <div className="bg-black/20 border border-white/5 rounded-[32px] overflow-hidden">
              <div className="p-8 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <History size={18} className="text-gray-500" />
                  <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Detailed Record Log</h4>
                </div>
                <span className="text-[10px] font-black text-accent uppercase tracking-widest">{parsedTx.length} Total Records</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white/5">
                      <th className="px-8 py-4 text-[9px] font-black text-gray-500 uppercase tracking-widest">Action</th>
                      <th className="px-8 py-4 text-[9px] font-black text-gray-500 uppercase tracking-widest">Amount</th>
                      <th className="px-8 py-4 text-[9px] font-black text-gray-500 uppercase tracking-widest text-right">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedTx.map((tx, idx) => (
                      <tr key={idx} className="border-t border-white/5 hover:bg-white/[0.02] transition-colors">
                        <td className="px-8 py-4">
                          <span className={`px-2 py-1 rounded text-[8px] font-black uppercase tracking-widest ${tx.type === 'deposit' ? 'bg-emerald-500/10 text-emerald-500' : tx.type === 'withdrawal' ? 'bg-red-500/10 text-red-500' : 'bg-gray-500/10 text-gray-500'}`}>
                            {tx.rawType}
                          </span>
                        </td>
                        <td className="px-8 py-4 font-bold text-white text-xs">KSh {tx.amount.toLocaleString()}</td>
                        <td className="px-8 py-4 text-right text-[10px] font-medium text-gray-500">
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
        <div className="lg:col-span-4 space-y-8">
          <h4 className="text-[10px] font-black text-white uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
            <LayoutGrid size={14} className="text-accent" />
            Automated Daily Summary
          </h4>
          
          <div className="space-y-4">
            {dailyBreakdown.length > 0 ? dailyBreakdown.map((day, i) => {
              const netLoss = Math.max(0, day.deposits - day.withdrawals);
              const cb = netLoss * 0.1;
              
              return (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, x: 20 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  transition={{ delay: i * 0.1 }}
                  className={`p-6 rounded-[32px] border ${day.label === 'Current' ? 'bg-accent/5 border-accent/40 shadow-[0_0_30px_rgba(var(--accent-rgb),0.1)]' : 'bg-black/20 border-white/5'}`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-black text-accent uppercase tracking-widest">{day.label} Cycle</span>
                        {day.label === 'Current' && (
                          <motion.span 
                            animate={{ opacity: [1, 0.5, 1] }} 
                            transition={{ repeat: Infinity, duration: 1.5 }}
                            className="w-2 h-2 rounded-full bg-accent"
                          />
                        )}
                      </div>
                      <p className="text-[11px] font-black text-white mt-2 uppercase tracking-tighter">
                        {format(day.end, 'eeee, MMM d')}
                        {isSameDay(day.end, new Date()) && <span className="ml-2 text-accent/60">(Today)</span>}
                        {isSameDay(day.end, subDays(new Date(), 1)) && <span className="ml-2 text-gray-600">(Yesterday)</span>}
                      </p>
                    </div>
                    <div className="text-right flex flex-col items-end gap-2">
                      <div className="flex flex-col items-end">
                        <span className="text-[8px] font-black text-accent uppercase block tracking-widest">Cashback Due</span>
                        <span className="text-xl font-black text-emerald-500">KSh {cb.toLocaleString()}</span>
                      </div>
                      <button 
                        onClick={() => handleCopySummary(day)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all group"
                      >
                        <Copy size={10} className="text-accent group-hover:scale-110 transition-transform" />
                        <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Copy Report</span>
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-white/5">
                    <div><span className="text-[7px] font-black text-gray-600 uppercase block">Deposits</span><span className="text-[10px] font-bold text-gray-300">KSh {day.deposits.toLocaleString()}</span></div>
                    <div className="text-right"><span className="text-[7px] font-black text-gray-600 uppercase block">Withdrawals</span><span className="text-[10px] font-bold text-gray-300">KSh {day.withdrawals.toLocaleString()}</span></div>
                  </div>
                </motion.div>
              );
            }) : (
              <div className="bg-white/5 border border-dashed border-white/10 rounded-[32px] p-12 text-center">
                <Calculator size={40} className="mx-auto text-gray-700 mb-4" />
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Paste data to generate breakdown</p>
              </div>
            )}
          </div>

          {/* Quick Help Card */}
          <div className="bg-black/20 border border-white/5 rounded-[32px] p-8 space-y-4">
             <div className="flex items-center gap-2">
               <ShieldCheck size={14} className="text-accent" />
               <span className="text-[10px] font-black text-white uppercase tracking-widest">System Protocol</span>
             </div>
             <p className="text-[10px] text-gray-500 leading-relaxed font-medium italic">"Calculated daily from 8:30 PM to 8:30 PM. Note: 8:30 PM–8:40 PM is a technical reset window; deposits within this gap are not counted in the 24hr cycle."</p>
          </div>
        </div>
      </div>

      {/* Staff Guide & Protocol (On-Page) */}
      <div className="bg-black/20 border border-white/5 rounded-[32px] p-8 space-y-6">
         <div className="flex items-center justify-between">
           <div className="flex items-center gap-3">
             <HelpCircle size={18} className="text-accent" />
             <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Operational Protocol</span>
           </div>
           <div className="px-3 py-1 bg-accent/10 rounded-full border border-accent/20">
             <span className="text-[8px] font-black text-accent uppercase">Staff Training</span>
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
             className="relative group rounded-2xl overflow-hidden border border-white/10 aspect-video bg-black/40 cursor-pointer hover:border-accent/40 transition-all shadow-2xl flex items-center justify-center"
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
             <div className="absolute top-2 right-2 px-2 py-0.5 bg-black/60 backdrop-blur-md rounded text-[7px] font-black text-white uppercase tracking-widest border border-white/10 z-20">
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
            className="relative w-full max-w-5xl aspect-video rounded-3xl overflow-hidden border border-white/10 shadow-[0_0_100px_rgba(var(--accent-rgb),0.2)] bg-black flex items-center justify-center"
          >
             <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
               <Calculator size={32} className="text-gray-800 mb-2 animate-bounce" />
               <span className="text-[10px] font-black text-gray-700 uppercase tracking-widest">Optimizing Visual...</span>
             </div>
            <img src={demoVideo} className="w-full h-full object-contain relative z-10" alt="Expanded Tutorial" />
            <button className="absolute top-6 right-6 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors backdrop-blur-md border border-white/10 z-20">
              <LayoutGrid size={20} className="rotate-45" />
            </button>
          </motion.div>
        </div>
      )}
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
  const activeTab = queryTab === 'odds' ? 'odds' : 'cashback';

  const setActiveTab = (tab) => {
    const params = new URLSearchParams(location.search);
    if (tab === 'cashback') {
      params.delete('tab');
    } else {
      params.set('tab', tab);
    }
    navigate({ search: params.toString() }, { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#08080c] pt-24 pb-32 px-4 md:px-8 max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="px-3 py-1 bg-accent/10 border border-accent/20 rounded-full">
              <span className="text-[10px] font-black text-accent uppercase tracking-[0.2em]">Operational Suite</span>
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter">Cashback Calculator</h1>
          <p className="text-gray-500 text-sm mt-2 max-w-md">Professional utilities designed to streamline support workflows and increase accuracy.</p>
        </div>

        <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/10">
          <button onClick={() => setActiveTab('cashback')} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] transition-all ${activeTab === 'cashback' ? 'bg-accent text-white shadow-lg shadow-accent/20' : 'text-gray-500 hover:text-gray-300'}`}>Calculator</button>
          <button onClick={() => setActiveTab('odds')} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] transition-all ${activeTab === 'odds' ? 'bg-accent text-white shadow-lg shadow-accent/20' : 'text-gray-500 hover:text-gray-300'}`}>Odds Converter</button>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
        {activeTab === 'cashback' ? <CashbackCalculator /> : <OddsCalculator />}
      </motion.div>
    </div>
  );
}
