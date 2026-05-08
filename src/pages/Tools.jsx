import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Calculator, 
  Zap, 
  HelpCircle, 
  Copy, 
  ArrowRight,
  ShieldCheck,
  History,
  AlertCircle,
  LayoutGrid
} from 'lucide-react';
import { 
  isAfter, 
  isBefore, 
  setHours, 
  setMinutes, 
  setSeconds,
  subDays, 
  format,
  parse 
} from "date-fns";

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

  const depNum = parseFloat(deposits) || 0;
  const withNum = parseFloat(withdrawals) || 0;
  const netLoss = Math.max(0, depNum - withNum);
  const cashback = netLoss * 0.1;

  // Live Parser Effect
  React.useEffect(() => {
    if (!pasteContent.trim()) {
      setParsedTx([]);
      return;
    }

    const lines = pasteContent.split("\n").map(l => l.trim()).filter(l => l.length > 0);
    const results = [];
    const isHeader = lines[0].toLowerCase().includes("type") || lines[0].toLowerCase().includes("action");

    lines.forEach((line, i) => {
      if (isHeader && i === 0) return;
      const lowerLine = line.toLowerCase();
      let type = "other";
      let rawType = "Unknown";
      
      if (lowerLine.includes("admin deposit")) { type = "deposit"; rawType = "Admin Deposit"; }
      else if (lowerLine.includes("cash back")) { type = "other"; rawType = "Cash Back"; }
      else if (lowerLine.includes("withdraw")) { type = "withdrawal"; rawType = "Withdrawal"; }
      else if (lowerLine.includes("deposit")) { type = "deposit"; rawType = "Deposit"; }
      else {
        const parts = line.split(/\s+/);
        const actionPart = parts.find(p => p.toLowerCase().includes("dep") || p.toLowerCase().includes("with"));
        if (actionPart) { type = actionPart.toLowerCase().includes("dep") ? "deposit" : "withdrawal"; rawType = actionPart; }
      }

      const dateMatch = line.match(/\d{1,2}\/\d{1,2}\/\d{4},?\s+\d{1,2}:\d{2}(?::\d{2})?\s+(?:AM|PM|am|pm)/i) 
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
            if (isNaN(txDate.getTime())) txDate = parse(cleanDate, "M/d/yyyy h:mm a", new Date());
            if (isNaN(txDate.getTime())) txDate = new Date(cleanDate);
          }
        } catch(e) { try { txDate = new Date(dateStr); } catch(ee) {} }
      }

      const parts = line.split(/\s+/).filter(p => p.length > 0);
      const lowerParts = parts.map(p => p.toLowerCase());
      const actionIdx = lowerParts.findIndex(p => p.includes("dep") || p.includes("with"));
      
      const numericParts = parts.map((p, idx) => {
        const v = p.replace(/[^\d.]/g, "");
        if (!v || isNaN(parseFloat(v)) || p.includes("T") || p.includes(":") || v.length > 10) return null;
        return { val: parseFloat(v), raw: p, idx };
      }).filter(n => n !== null);

      let amount = 0;
      if (numericParts.length > 0) {
        // Priority 1: The first significant number AFTER the action keyword
        const afterAction = numericParts.find(n => n.idx > actionIdx);
        // Priority 2: Any part containing currency hints (. or KSH)
        const withContext = numericParts.find(n => n.raw.includes(".") || n.raw.includes("KSH") || n.raw.includes("+") || n.raw.includes("-"));
        
        amount = (afterAction?.val) || (withContext?.val) || numericParts[0].val;
      }

      if (rawType !== "Unknown" || amount > 0) {
        results.push({ id: parts[0], type, rawType, amount, date: txDate, dateStr: dateStr || "N/A", ignored: type === "other" });
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
      const cStart = subDays(cEnd, 1);
      const key = format(cEnd, 'yyyy-MM-dd');
      if (!groups[key]) groups[key] = { start: cStart, end: cEnd, deposits: 0, withdrawals: 0, count: 0, label: isAfter(cEnd, new Date()) ? "Current" : "History" };
      if (tx.type === 'deposit') groups[key].deposits += tx.amount;
      else if (tx.type === 'withdrawal') groups[key].withdrawals += tx.amount;
      groups[key].count++;
    });
    return Object.values(groups).sort((a, b) => b.end.getTime() - a.end.getTime());
  };

  const breakdown = getDailyBreakdown();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Left Column: Data Input & Audit Log */}
      <div className="lg:col-span-7 space-y-6">
        <div className="bg-card border border-border rounded-[32px] p-8 relative overflow-hidden">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center text-accent">
                <Zap size={24} />
              </div>
              <div>
                <h2 className="text-xl font-black text-white uppercase tracking-tight">Smart Analysis</h2>
                <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Supreme Accuracy Engine</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 bg-white/5 p-1 rounded-xl">
               <button onClick={() => setIsSmartPasteMode(true)} className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${isSmartPasteMode ? 'bg-accent text-white shadow-lg shadow-accent/20' : 'text-white/30'}`}>Smart Paste</button>
               <button onClick={() => setIsSmartPasteMode(false)} className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${!isSmartPasteMode ? 'bg-accent text-white shadow-lg shadow-accent/20' : 'text-white/30'}`}>Manual</button>
            </div>
          </div>

          {isSmartPasteMode ? (
            <div className="space-y-6">
              <div className="bg-black/40 border border-white/5 rounded-3xl p-6 focus-within:border-accent/30 transition-colors">
                <textarea
                  value={pasteContent}
                  onChange={(e) => setPasteContent(e.target.value)}
                  placeholder="Paste transaction logs from portal..."
                  className="w-full h-40 bg-transparent border-none text-white text-xs font-mono focus:outline-none resize-none placeholder:text-gray-800"
                />
              </div>
              <button
                onClick={handleSmartPaste}
                className="w-full py-5 bg-accent text-white rounded-2xl font-black uppercase tracking-[0.3em] text-[11px] hover:opacity-90 transition-all active:scale-[0.98] shadow-xl shadow-accent/20 flex items-center justify-center gap-3"
              >
                <Zap size={16} />
                Analyze &amp; Sync Summary
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">Deposits</label>
                <input type="number" value={deposits} onChange={(e) => setDeposits(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-6 text-white text-lg font-bold focus:outline-none focus:border-accent transition-all" placeholder="0.00" />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">Withdrawals</label>
                <input type="number" value={withdrawals} onChange={(e) => setWithdrawals(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-6 text-white text-lg font-bold focus:outline-none focus:border-accent transition-all" placeholder="0.00" />
              </div>
            </div>
          )}
        </div>

        {/* Audit Log (Table) - Now directly below the paste area */}
        {parsedTx.length > 0 && (
          <div className="bg-card border border-border rounded-[32px] p-8 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <History size={16} className="text-gray-500" />
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Detailed Record Log</span>
              </div>
              <span className="text-[9px] font-black text-accent uppercase bg-accent/5 px-2 py-1 rounded-md">{parsedTx.length} Total Records</span>
            </div>
            <div className="bg-black/20 rounded-2xl overflow-hidden border border-white/5">
              <div className="max-h-96 overflow-y-auto custom-scrollbar">
                <table className="w-full text-left text-[10px] border-collapse">
                  <thead className="bg-white/5 sticky top-0 z-10 backdrop-blur-md">
                    <tr>
                      <th className="p-4 text-gray-500 font-black uppercase tracking-widest border-b border-white/5">Action</th>
                      <th className="p-4 text-gray-500 font-black uppercase tracking-widest border-b border-white/5 text-right">Amount</th>
                      <th className="p-4 text-gray-500 font-black uppercase tracking-widest border-b border-white/5">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {parsedTx.map((tx, idx) => (
                      <tr key={idx} className={`hover:bg-white/5 transition-colors ${tx.ignored ? 'opacity-30' : ''}`}>
                        <td className="p-4">
                          <span className={`font-black uppercase px-2 py-0.5 rounded text-[9px] ${
                            tx.type === 'deposit' ? 'bg-emerald-500/10 text-emerald-500' : tx.type === 'withdrawal' ? 'bg-red-500/10 text-red-500' : 'bg-gray-500/10 text-gray-500'
                          }`}>{tx.rawType}</span>
                        </td>
                        <td className="p-4 text-right text-white font-bold">KSh {tx.amount.toLocaleString()}</td>
                        <td className="p-4 text-gray-400 whitespace-nowrap">{tx.dateStr}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Right Column: Automated Daily Summary & Overall Totals */}
      <div className="lg:col-span-5 space-y-6">
        {/* Dynamic Summary Cards */}
        {breakdown.length > 0 ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3 ml-2">
              <LayoutGrid size={16} className="text-accent" />
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Automated Daily Summary</span>
            </div>
            {breakdown.map((day, idx) => {
              const loss = Math.max(0, day.deposits - day.withdrawals);
              const cb = loss * 0.1;
              return (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 }}
                  key={idx} className={`border rounded-[24px] p-6 relative group overflow-hidden transition-all ${
                    day.label === 'Current' 
                    ? 'bg-accent/5 border-accent/60 border-2 shadow-[0_0_25px_rgba(var(--accent-rgb),0.15)] ring-1 ring-accent/20' 
                    : 'bg-card border-border'
                  }`}
                >
                  <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform"><Calculator size={40} /></div>
                  <div className="flex justify-between items-start relative z-10">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${day.label === 'Current' ? 'bg-accent text-white' : 'bg-white/10 text-gray-500'}`}>{day.label} Cycle</span>
                        {day.label === 'Current' && (
                          <motion.span 
                            animate={{ opacity: [1, 0.5, 1] }} 
                            transition={{ repeat: Infinity, duration: 1.5 }}
                            className="w-2 h-2 rounded-full bg-accent"
                          />
                        )}
                      </div>
                      <p className="text-[11px] font-black text-white mt-2 uppercase tracking-tighter">{format(day.start, 'MMM d')} – {format(day.end, 'MMM d')}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[8px] font-black text-accent uppercase block tracking-widest">Cashback Due</span>
                      <span className="text-xl font-black text-emerald-500">KSh {cb.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-white/5">
                    <div><span className="text-[7px] font-black text-gray-600 uppercase block">Deposits</span><span className="text-[10px] font-bold text-gray-300">KSh {day.deposits.toLocaleString()}</span></div>
                    <div className="text-right"><span className="text-[7px] font-black text-gray-600 uppercase block">Withdrawals</span><span className="text-[10px] font-bold text-gray-300">KSh {day.withdrawals.toLocaleString()}</span></div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white/5 border border-dashed border-white/10 rounded-[32px] p-12 text-center">
            <Calculator size={40} className="mx-auto text-gray-700 mb-4" />
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Paste data to generate breakdown</p>
          </div>
        )}

        {/* Quick Help Card */}
        <div className="bg-black/20 border border-white/5 rounded-[32px] p-6 space-y-4">
           <div className="flex items-center gap-2">
             <ShieldCheck size={14} className="text-accent" />
             <span className="text-[10px] font-black text-white uppercase tracking-widest">System Protocol</span>
           </div>
           <p className="text-[10px] text-gray-500 leading-relaxed font-medium italic">"Cashback is 10% of the difference between total deposits and total withdrawals made from 8:35 PM to 8:35 PM daily."</p>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN TOOLS PAGE
// ─────────────────────────────────────────────────────────────────────────────

export default function Tools() {
  const [activeTab, setActiveTab] = useState('cashback');

  return (
    <div className="min-h-screen bg-[#08080c] pt-24 pb-32 px-4 md:px-8 max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="px-3 py-1 bg-accent/10 border border-accent/20 rounded-full">
              <span className="text-[10px] font-black text-accent uppercase tracking-[0.2em]">Operational Suite</span>
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter">Staff Tools</h1>
          <p className="text-gray-500 text-sm mt-2 max-w-md">Professional utilities designed to streamline support workflows and increase accuracy.</p>
        </div>

        <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/10">
          <button onClick={() => setActiveTab('cashback')} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] transition-all ${activeTab === 'cashback' ? 'bg-accent text-white shadow-lg shadow-accent/20' : 'text-gray-500 hover:text-gray-300'}`}>Cashback</button>
          <button disabled className="px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] text-gray-700 cursor-not-allowed">Coming Soon</button>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
        {activeTab === 'cashback' && <CashbackCalculator />}
      </motion.div>
    </div>
  );
}
