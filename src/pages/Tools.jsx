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
    <div className="space-y-6 animate-in fade-in duration-300 max-w-[760px] mx-auto">
      {/* Main Container Card */}
      <div className="bg-[#1B1C22] border border-white/[0.07] rounded-[28px] p-6 sm:p-7 shadow-[0_20px_50px_rgba(0,0,0,0.5)] space-y-6">
        
        {/* Card Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#232429] border border-white/[0.07] flex items-center justify-center text-[#F2E75A]">
              <Percent size={16} />
            </div>
            <div>
              <h3 className="font-['Space_Grotesk'] text-xl font-semibold text-[#F4F5F1] tracking-tight">Odds Converter</h3>
              <p className="text-xs text-[#8B8E97]">Decimal payout and market probability analysis</p>
            </div>
          </div>
          <span className="text-[11px] font-mono text-[#8B8E97] bg-[#232429] border border-white/[0.07] px-3 py-1 rounded-full">
            Live Math
          </span>
        </div>

        {/* 2 Column Box Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Input Box */}
          <div className="bg-[#0E0E12] border border-white/[0.07] rounded-[18px] p-5 space-y-4">
            <span className="text-[13px] text-[#8B8E97] font-medium block">Bet Parameters</span>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] text-[#54565F] block mb-1">Stake Amount (KES)</label>
                <div className="relative">
                  <input
                    type="number"
                    value={stake}
                    onChange={(e) => setStake(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full bg-[#1B1C22] border border-white/10 rounded-xl px-4 py-2.5 text-white font-mono text-sm font-bold outline-none focus:border-[#00D66B]"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-[#54565F]">KES</span>
                </div>
              </div>

              <div>
                <label className="text-[11px] text-[#54565F] block mb-1">Decimal Odds</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    value={odds}
                    onChange={(e) => setOdds(Math.max(1, parseFloat(e.target.value) || 0))}
                    className="w-full bg-[#1B1C22] border border-white/10 rounded-xl px-4 py-2.5 text-white font-mono text-sm font-bold outline-none focus:border-[#3ED3F2]"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-[#54565F]">ODDS</span>
                </div>
              </div>
            </div>

            <div className="text-[11.5px] text-[#54565F] pt-1 leading-relaxed">
              Formula: <span className="font-mono text-[#8B8E97]">Stake × Odds = Return</span>
            </div>
          </div>

          {/* Result Box */}
          <div className="bg-[#0E0E12] border border-white/[0.07] rounded-[18px] p-5 flex flex-col justify-between">
            <div>
              <span className="text-[13px] text-[#8B8E97] font-medium block mb-2">Total Potential Return:</span>
              <div className="font-['Space_Grotesk'] text-[42px] font-semibold text-[#F4F5F1] tracking-tight leading-none flex items-baseline gap-2">
                <span className="text-xl font-normal text-[#54565F]">KES</span>
                <span>{Number(totalReturn).toLocaleString()}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-4 border-t border-white/[0.05] mt-4">
              <div className="bg-[#1B1C22] rounded-xl p-3 border border-white/[0.05]">
                <span className="text-[10.5px] text-[#8B8E97] block">Pure Profit</span>
                <span className="text-base font-mono font-bold text-[#00D66B]">
                  +{Number(profit).toLocaleString()}
                </span>
              </div>
              <div className="bg-[#1B1C22] rounded-xl p-3 border border-white/[0.05]">
                <span className="text-[10.5px] text-[#8B8E97] block">Multiplier</span>
                <span className="text-base font-mono font-bold text-[#3ED3F2]">
                  {odds}x
                </span>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Quick Reference Mini Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { code: "1X2", name: "Match Result", desc: "1 (Home), X (Draw), 2 (Away)" },
          { code: "O/U", name: "Over / Under", desc: "Goals above or below line" },
          { code: "GG/NG", name: "Both Teams Score", desc: "Goal (GG) or No Goal (NG)" },
          { code: "DC", name: "Double Chance", desc: "Covers 2 of 3 outcomes" }
        ].map((m) => (
          <div key={m.code} className="bg-[#1B1C22] border border-white/[0.07] rounded-[18px] p-3.5 space-y-1">
            <span className="font-mono text-xs font-bold text-[#00D66B] block">{m.code}</span>
            <span className="text-xs font-semibold text-[#F4F5F1] block truncate">{m.name}</span>
            <p className="text-[10.5px] text-[#54565F] leading-snug">{m.desc}</p>
          </div>
        ))}
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
    <div className="space-y-5 animate-in fade-in duration-300">

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Main Interface: Left Column */}
        <div className="lg:col-span-8 space-y-4">

          <div className="bg-[#1B1C22] border border-white/[0.07] rounded-[24px] p-5 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#0E0E12] border border-white/[0.07] flex items-center justify-center text-[#F2E75A]">
                  <Zap size={15} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#F4F5F1]">Smart Paste Analysis</h3>
                  <p className="text-[11px] text-[#8B8E97]">Auto-parse portal transactions</p>
                </div>
              </div>

              <div className="flex items-center bg-[#0E0E12] border border-white/[0.07] p-1 rounded-full self-start">
                <button onClick={() => setIsSmartPasteMode(true)} className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${isSmartPasteMode ? 'bg-[#F2E75A] text-[#2A2705] shadow' : 'text-[#54565F] hover:text-[#8B8E97]'}`}>Smart Paste</button>
                <button onClick={() => setIsSmartPasteMode(false)} className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${!isSmartPasteMode ? 'bg-[#F2E75A] text-[#2A2705] shadow' : 'text-[#54565F] hover:text-[#8B8E97]'}`}>Manual</button>
              </div>
            </div>

            {isSmartPasteMode ? (
              <div className="relative">
                <textarea
                  value={pasteContent}
                  onChange={(e) => setPasteContent(e.target.value)}
                  placeholder={`Paste portal transactions here...\nExample:\n20608273\twithdraw\t-KSH 4,555.00\tKSH 200.00\t—\t5/11/2026, 9:39:06 PM\n20607525\tDeposit\t+KSH 90.00\tKSH 189.00\t—\t5/11/2026, 9:27:14 PM`}
                  className="w-full h-44 bg-[#0E0E12] border border-white/[0.07] rounded-[18px] p-4 text-[#00D66B] font-mono text-xs outline-none focus:border-[#00D66B]/40 transition-all placeholder:text-[#54565F] resize-none"
                />
                <div className="absolute top-3 right-4 flex items-center gap-1.5">
                  <span className="text-[10px] text-[#54565F]">Auto-Analyzing</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-[#00D66B] animate-pulse" />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] text-[#54565F] mb-1.5 block">Total Deposits (KES)</label>
                  <div className="relative">
                    <input type="number" value={deposits} onChange={(e) => setDeposits(e.target.value)} className="w-full bg-[#0E0E12] border border-white/[0.07] rounded-xl px-4 py-2.5 text-white font-mono text-sm font-bold outline-none focus:border-[#00D66B]" placeholder="0.00" />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-[#54565F]">DEP</span>
                  </div>
                </div>
                <div>
                  <label className="text-[11px] text-[#54565F] mb-1.5 block">Total Withdrawals (KES)</label>
                  <div className="relative">
                    <input type="number" value={withdrawals} onChange={(e) => setWithdrawals(e.target.value)} className="w-full bg-[#0E0E12] border border-white/[0.07] rounded-xl px-4 py-2.5 text-white font-mono text-sm font-bold outline-none focus:border-[#3ED3F2]" placeholder="0.00" />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-[#54565F]">WTH</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Audit Table (if data exists) */}
          {parsedTx.length > 0 && (
            <div className="bg-[#1B1C22] border border-white/[0.07] rounded-[22px] overflow-hidden">
              <div className="px-5 py-3.5 flex items-center justify-between border-b border-white/[0.05]">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-[#0E0E12] border border-white/[0.07] flex items-center justify-center text-[#00D66B]">
                    <History size={13} />
                  </div>
                  <h4 className="text-xs font-semibold text-[#F4F5F1]">Parsed Transaction Log</h4>
                </div>
                <span className="text-[11px] font-mono text-[#8B8E97] bg-[#0E0E12] border border-white/[0.07] px-3 py-0.5 rounded-full">{parsedTx.length} Records</span>
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
                        <td className="px-5 py-2.5">
                          <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${tx.type === 'deposit' ? 'bg-[#00D66B]/10 text-[#00D66B]' : tx.type === 'withdrawal' ? 'bg-[#3ED3F2]/10 text-[#3ED3F2]' : 'bg-white/5 text-[#54565F]'}`}>
                            {tx.rawType}
                          </span>
                        </td>
                        <td className="px-5 py-2.5 font-mono font-bold text-[#F4F5F1] text-xs">KSh {tx.amount.toLocaleString()}</td>
                        <td className="px-5 py-2.5 text-right text-[11px] font-mono text-[#8B8E97]">
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
        <div className="lg:col-span-4 space-y-3">
          <div className="bg-[#1B1C22] border border-white/[0.07] rounded-[22px] p-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#0E0E12] border border-white/[0.07] flex items-center justify-center text-[#F2E75A]">
              <LayoutGrid size={14} />
            </div>
            <div>
              <h3 className="text-xs font-semibold text-[#F4F5F1]">Daily Cycle Breakdown</h3>
              <p className="text-[11px] text-[#54565F]">Click copy to share the full message</p>
            </div>
          </div>

          <div className="space-y-2.5">
            {dailyBreakdown.length > 0 ? dailyBreakdown.map((day, i) => {
              const netLoss = Math.max(0, day.deposits - day.withdrawals);
              const cb = netLoss * 0.1;

              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="bg-[#1B1C22] border border-white/[0.07] rounded-[20px] p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-medium text-[#F2E75A]">{day.label} Cycle</span>
                        {day.label === 'Current' && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#F2E75A] animate-pulse" />
                        )}
                      </div>
                      <p className="text-xs font-semibold text-[#F4F5F1] mt-0.5">{format(day.end, 'eeee, MMM d')}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-[#54565F] block">Cashback</span>
                      <span className={`text-base font-mono font-bold ${cb > 0 ? 'text-[#00D66B]' : 'text-[#54565F]'}`}>
                        {cb.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-2.5 border-t border-white/[0.05]">
                    {[
                      { label: 'Sum of Deposits', value: `KSh ${day.deposits.toLocaleString()}`, line: 1 },
                      { label: 'Sum of Withdrawals', value: `KSh ${day.withdrawals.toLocaleString()}`, line: 2 },
                      { label: 'Cashback Verdict', value: cb > 0 ? `KSh ${cb.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })} due` : 'Not Eligible', line: 3 }
                    ].map(({ label, value, line }) => (
                      <div key={line} className="flex items-center justify-between bg-[#0E0E12] border border-white/[0.05] rounded-xl px-3 py-2">
                        <div className="min-w-0 pr-2">
                          <span className="text-[10px] text-[#54565F] block">{label}</span>
                          <span className={`text-xs font-mono font-bold truncate block ${
                            line === 1 ? 'text-[#00D66B]' : line === 2 ? 'text-[#3ED3F2]' : cb > 0 ? 'text-[#F2E75A]' : 'text-[#8B8E97]'
                          }`}>{value}</span>
                        </div>
                        <button
                          onClick={() => handleCopySummary(day, line)}
                          className="flex items-center gap-1 px-2 py-1 bg-[#232429] hover:bg-white/10 border border-white/[0.07] rounded-lg text-[#8B8E97] hover:text-white text-[10px] transition-all shrink-0"
                        >
                          <Copy size={10} />
                          Copy
                        </button>
                      </div>
                    ))}
                  </div>
                </motion.div>
              );
            }) : (
              <div className="bg-[#1B1C22] border border-white/[0.07] rounded-[20px] py-10 text-center">
                <Calculator size={30} className="mx-auto text-[#54565F] mb-2" />
                <p className="text-xs text-[#54565F]">Paste portal data to see breakdown</p>
              </div>
            )}
          </div>

          <div className="bg-[#1B1C22] border border-white/[0.07] rounded-[20px] p-4 space-y-2">
            <div className="flex items-center gap-2">
              <ShieldCheck size={13} className="text-[#00D66B]" />
              <span className="text-xs font-semibold text-[#F4F5F1]">Calculation Rules</span>
            </div>
            <p className="text-[11px] text-[#8B8E97] leading-relaxed">Calculated daily 8:30 PM → 8:30 PM. The 8:30–8:40 PM window is a reset gap and is excluded.</p>
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
    <div className="space-y-5 animate-in fade-in duration-300 max-w-4xl mx-auto">

      {/* Rules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {rules.map((rule) => (
          <div key={rule.id} className="bg-[#1B1C22] border border-white/[0.07] rounded-[22px] p-5 space-y-3 hover:border-white/[0.12] transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono text-[#54565F]">Rule {rule.id}</span>
              <span
                className="text-[11px] font-medium px-2.5 py-0.5 rounded-full"
                style={{ background: `${rule.color}1A`, color: rule.color }}
              >
                {rule.title}
              </span>
            </div>
            <p className="text-xs text-[#8B8E97] leading-relaxed">{rule.desc}</p>
            <div className="bg-[#0E0E12] border border-white/[0.05] rounded-xl p-3 flex gap-2">
              <span className="text-[#F2E75A] text-[10px] font-mono shrink-0 mt-0.5">eg.</span>
              <span className="text-[11px] text-[#8B8E97] leading-relaxed font-mono">{rule.example}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Reference Formula */}
      <div className="bg-[#1B1C22] border border-white/[0.07] rounded-[22px] p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Calculator size={14} className="text-[#00D66B]" />
          <h3 className="text-xs font-semibold text-[#F4F5F1]">Quick Formula Reference</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { label: "Net Loss", formula: "Deposits − Withdrawals", color: "#3ED3F2" },
            { label: "Cashback", formula: "Net Loss × 10%", color: "#00D66B" },
            { label: "Minimum", formula: "Net Loss ≥ KES 100", color: "#F2E75A" }
          ].map((f) => (
            <div key={f.label} className="bg-[#0E0E12] border border-white/[0.05] rounded-[16px] p-4 text-center space-y-1">
              <span className="text-[10px] text-[#54565F] uppercase tracking-wider block">{f.label}</span>
              <span className="text-sm font-semibold font-mono" style={{ color: f.color }}>{f.formula}</span>
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
    { id: 'cashback', num: '1', label: 'Cashback Calculator' },
    { id: 'odds', num: '2', label: 'Odds Converter' },
    { id: 'rules', num: '3', label: 'Cashback Rules' },
  ];

  return (
    <div className="min-h-[calc(100vh-80px)] py-8 px-4 flex flex-col items-center justify-start text-[#F4F5F1] font-sans selection:bg-[#00D66B]/20">
      
      {/* ── STEP PILLS HEADER ── */}
      <div className="flex items-center gap-2 mb-8 overflow-x-auto no-scrollbar max-w-full">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium border transition-all cursor-pointer select-none ${
              activeTab === t.id
                ? 'bg-[#0E0E12] text-[#F4F5F1] border-white/20 shadow-sm'
                : 'bg-[#232429] text-[#54565F] border-white/[0.07] hover:text-[#8B8E97]'
            }`}
          >
            <span className={`font-mono text-xs font-semibold ${activeTab === t.id ? 'text-[#F2E75A]' : 'text-[#54565F]'}`}>{t.num}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      <div className="w-full max-w-6xl space-y-6">
        {activeTab === 'cashback' && <CashbackCalculator />}
        {activeTab === 'odds' && <OddsCalculator />}
        {activeTab === 'rules' && <CashbackRules />}
      </div>
    </div>
  );
}
