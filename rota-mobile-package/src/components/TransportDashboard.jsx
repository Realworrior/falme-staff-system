import React, { useState, useEffect, useMemo } from 'react';
import { 
  DollarSign, 
  Calendar as CalendarIcon, 
  Filter, 
  CheckCircle2, 
  History,
  Info,
  Clock,
  ArrowRight
} from 'lucide-react';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import { STAFF_CONFIG, SOFASAFI_STAFF_CONFIG, STAFF_THEME } from '../utils/scheduleGenerator';

export function TransportDashboard({ 
  currentDate, 
  schedule, 
  savedRates = {}, 
  paymentHistory = [], 
  onSaveRates, 
  onPay,
  activeBranch = 'betfalme',
  isManagerMode = false
}) {
  const [filterType, setFilterType] = useState('weekly'); // weekly, monthly, custom
  const [customRange, setCustomRange] = useState({ start: new Date(), end: new Date() });
  const [editingRates, setEditingRates] = useState(false);
  const [tempRates, setTempRates] = useState(savedRates || {});

  useEffect(() => {
    setTempRates(savedRates || {});
  }, [savedRates]);

  const anchorDate = useMemo(() => {
    const now = new Date();
    const refDate = currentDate || (schedule[0]?.date) || now;
    if (now.getMonth() === refDate.getMonth() && now.getFullYear() === refDate.getFullYear()) {
      return now;
    }
    return startOfMonth(refDate);
  }, [currentDate, schedule]);

  useEffect(() => {
    setCustomRange({
      start: startOfDay(startOfMonth(anchorDate)),
      end: endOfDay(endOfMonth(anchorDate))
    });
  }, [anchorDate]);

  const range = useMemo(() => {
    if (filterType === 'weekly') {
      return { 
        start: startOfDay(startOfWeek(anchorDate, { weekStartsOn: 1 })), 
        end: endOfDay(endOfWeek(anchorDate, { weekStartsOn: 1 })) 
      };
    } else if (filterType === 'monthly') {
      return { start: startOfDay(startOfMonth(anchorDate)), end: endOfDay(endOfMonth(anchorDate)) };
    }
    return {
      start: startOfDay(customRange.start),
      end: endOfDay(customRange.end)
    };
  }, [filterType, anchorDate, customRange]);

  const rangeLabel = useMemo(() => {
    try {
      return `${format(range.start, 'MMM d')} – ${format(range.end, 'MMM d, yyyy')}`;
    } catch {
      return '';
    }
  }, [range]);

  const staffList = activeBranch === 'sofasafi' ? SOFASAFI_STAFF_CONFIG : STAFF_CONFIG;

  const allowances = useMemo(() => {
    const stats = {};
    const currentRates = editingRates ? tempRates : savedRates;
    
    staffList.forEach(s => {
      stats[s.name] = { pm: 0, nt: 0, totalShifts: 0, amount: 0, rate: currentRates[s.name] || s.transportRate || 350 };
    });

    schedule.forEach(day => {
      if (isWithinInterval(day.date, range)) {
        day.shifts.PM.forEach(name => {
          if (stats[name]) {
            stats[name].pm++;
            stats[name].totalShifts++;
            stats[name].amount += stats[name].rate;
          }
        });
        day.shifts.NT.forEach(name => {
          if (stats[name]) {
            stats[name].nt++;
            stats[name].totalShifts++;
            stats[name].amount += stats[name].rate;
          }
        });
      }
    });

    return stats;
  }, [staffList, schedule, range, editingRates, tempRates, savedRates]);

  const totalAmount = useMemo(() => {
    return Object.values(allowances).reduce((acc, curr) => acc + curr.amount, 0);
  }, [allowances]);

  const totalEligibleShifts = useMemo(() => {
    return Object.values(allowances).reduce((acc, curr) => acc + curr.totalShifts, 0);
  }, [allowances]);

  const handleSaveAllRates = () => {
    onSaveRates?.(tempRates);
    setEditingRates(false);
  };

  const handleTriggerPayment = () => {
    if (totalAmount <= 0) return;
    const paymentRecord = {
      id: `pay_${Date.now()}`,
      date: new Date().toISOString(),
      amount: totalAmount,
      periodLabel: rangeLabel,
      recipientCount: Object.values(allowances).filter(a => a.amount > 0).length,
      breakdown: allowances
    };
    onPay?.(paymentRecord);
  };

  return (
    <div className="space-y-6 text-[#F4F5F1] select-none">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#131520] border border-white/[0.07] rounded-3xl p-5 shadow-lg">
          <div className="flex items-center justify-between text-[#8B8E97] text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Total Allowance</span>
            <DollarSign className="w-4 h-4 text-[#00D66B]" />
          </div>
          <div className="text-3xl font-['Space_Grotesk'] font-bold text-[#00D66B]">
            KSh {totalAmount.toLocaleString()}
          </div>
          <p className="text-[11px] text-[#54565F] mt-1 font-mono">{rangeLabel}</p>
        </div>

        <div className="bg-[#131520] border border-white/[0.07] rounded-3xl p-5 shadow-lg">
          <div className="flex items-center justify-between text-[#8B8E97] text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Night &amp; PM Shifts</span>
            <Clock className="w-4 h-4 text-[#3ED3F2]" />
          </div>
          <div className="text-3xl font-['Space_Grotesk'] font-bold text-[#3ED3F2]">
            {totalEligibleShifts}
          </div>
          <p className="text-[11px] text-[#54565F] mt-1">Eligible transport shifts</p>
        </div>

        <div className="bg-[#131520] border border-white/[0.07] rounded-3xl p-5 shadow-lg">
          <div className="flex items-center justify-between text-[#8B8E97] text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Staff Count</span>
            <CheckCircle2 className="w-4 h-4 text-[#F2E75A]" />
          </div>
          <div className="text-3xl font-['Space_Grotesk'] font-bold text-[#F2E75A]">
            {staffList.length}
          </div>
          <p className="text-[11px] text-[#54565F] mt-1">Active team members</p>
        </div>
      </div>

      {/* Filter Tabs & Controls */}
      <div className="bg-[#131520] border border-white/[0.07] rounded-3xl p-5 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.06] pb-4">
          <div className="flex bg-[#0E0E12] border border-white/[0.07] p-1 rounded-full w-fit">
            {['weekly', 'monthly'].map(t => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold capitalize transition-all cursor-pointer ${
                  filterType === t
                    ? 'bg-[#1B1C22] text-[#F4F5F1] shadow border border-white/10'
                    : 'text-[#54565F] hover:text-[#8B8E97]'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {isManagerMode && (
              <button
                onClick={() => setEditingRates(prev => !prev)}
                className="px-4 py-2 rounded-full bg-[#1B1C22] hover:bg-[#232429] border border-white/[0.07] text-xs font-semibold text-[#8B8E97] hover:text-white transition-all cursor-pointer"
              >
                {editingRates ? 'Cancel Editing' : 'Edit Rates'}
              </button>
            )}
            {editingRates && (
              <button
                onClick={handleSaveAllRates}
                className="px-4 py-2 rounded-full bg-[#00D66B] text-[#04170D] text-xs font-bold transition-all cursor-pointer shadow-md hover:brightness-105"
              >
                Save Rates
              </button>
            )}
            {isManagerMode && !editingRates && totalAmount > 0 && (
              <button
                onClick={handleTriggerPayment}
                className="px-4 py-2 rounded-full bg-[#3ED3F2] text-[#04170D] text-xs font-bold transition-all cursor-pointer shadow-md hover:brightness-105"
              >
                Record Milestone
              </button>
            )}
          </div>
        </div>

        {/* Staff Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/[0.06] text-[#8B8E97] font-semibold">
                <th className="py-3 px-3">Staff Name</th>
                <th className="py-3 px-3">PM Shifts</th>
                <th className="py-3 px-3">Night Shifts</th>
                <th className="py-3 px-3">Total Shifts</th>
                <th className="py-3 px-3">Rate / Shift</th>
                <th className="py-3 px-3 text-right">Total Allowance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {staffList.map(s => {
                const stat = allowances[s.name] || { pm: 0, nt: 0, totalShifts: 0, amount: 0, rate: 350 };
                return (
                  <tr key={s.name} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-3 font-semibold text-[#F4F5F1] flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: STAFF_THEME[s.name]?.bg || '#334466' }} />
                      <span>{s.name}</span>
                    </td>
                    <td className="py-3 px-3 text-[#8B8E97]">{stat.pm}</td>
                    <td className="py-3 px-3 text-[#8B8E97]">{stat.nt}</td>
                    <td className="py-3 px-3 font-mono font-bold text-white">{stat.totalShifts}</td>
                    <td className="py-3 px-3">
                      {editingRates ? (
                        <input
                          type="number"
                          value={tempRates[s.name] !== undefined ? tempRates[s.name] : stat.rate}
                          onChange={e => setTempRates({ ...tempRates, [s.name]: parseInt(e.target.value, 10) || 0 })}
                          className="w-20 bg-[#0E0E12] border border-white/10 rounded-lg px-2 py-1 text-white font-mono text-xs focus:outline-none focus:border-[#00D66B]"
                        />
                      ) : (
                        <span className="font-mono text-[#8B8E97]">KSh {stat.rate}</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-[#00D66B]">
                      KSh {stat.amount.toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
