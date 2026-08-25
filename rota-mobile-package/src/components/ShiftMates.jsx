import React from 'react';
import { format } from 'date-fns';
import { STAFF_COLORS } from '../utils/scheduleGenerator';
import { X, Clock } from 'lucide-react';

const SHIFT_META = {
  AM: { 
    label: 'AM', 
    time: '07:30 - 15:30', 
    color: '#2DD4BF', 
    bg: 'rgba(45, 212, 191, 0.15)', 
    textColor: 'text-[#2DD4BF]' 
  },
  PM: { 
    label: 'PM', 
    time: '15:30 - 22:30', 
    color: '#60A5FA', 
    bg: 'rgba(96, 165, 250, 0.15)', 
    textColor: 'text-[#60A5FA]' 
  },
  NT: { 
    label: 'NT', 
    time: '22:30 - 07:30', 
    color: '#FBBF24', 
    bg: 'rgba(251, 191, 36, 0.15)', 
    textColor: 'text-[#FBBF24]' 
  },
  OFF: { 
    label: 'OFF', 
    time: 'Day Off', 
    color: '#9CA3AF', 
    bg: 'rgba(156, 163, 175, 0.1)', 
    textColor: 'text-gray-400' 
  },
};

export function ShiftMates({
  selectedDate,
  schedule,
  selectedStaff,
  isManagerMode,
  onOverride,
  overrides = {},
  onClose,
}) {
  if (!selectedDate) return null;

  const dateKey = format(selectedDate, 'yyyy-MM-dd');
  const daySchedule = schedule.find(d => format(d.date, 'yyyy-MM-dd') === dateKey);

  const shifts = daySchedule
    ? [
        { id: 'AM', staff: daySchedule.shifts.AM },
        { id: 'PM', staff: daySchedule.shifts.PM },
        { id: 'NT', staff: daySchedule.shifts.NT },
      ].filter(s => s.staff.length > 0)
    : [];

  const handleShiftChange = (staff, type) => {
    onOverride?.(dateKey, staff, type);
  };

  const isToday = format(selectedDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');

  return (
    <div className="bg-[#131520] border border-white/[0.08] rounded-[28px] shadow-2xl overflow-hidden text-[#F4F5F1] select-none">
      {/* Header */}
      <div className="px-6 sm:px-8 pt-6 pb-5 flex items-start justify-between gap-4 border-b border-white/[0.06]">
        <div>
          <p className="text-xs font-semibold text-[#8B8E97] mb-1">{format(selectedDate, 'EEEE')}</p>
          <div className="flex items-center gap-3">
            <h3 className="text-2xl sm:text-3xl font-['Space_Grotesk'] font-bold text-white tracking-tight">
              {format(selectedDate, 'd MMMM yyyy')}
            </h3>
            {isToday && (
              <div className="px-2.5 py-0.5 rounded-full bg-[#00D66B]/15 border border-[#00D66B]/30 text-[10px] font-bold uppercase text-[#00D66B]">
                Today
              </div>
            )}
          </div>
        </div>
        {onClose && (
          <button 
            onClick={onClose} 
            className="p-2 rounded-full bg-[#1B1C22] hover:bg-[#232429] text-[#8B8E97] hover:text-white transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Shifts */}
      <div className="flex flex-col divide-y divide-white/[0.06]">
        {shifts.length === 0 ? (
          <div className="py-16 text-center text-[#8B8E97]">
            <p className="text-xs font-bold uppercase tracking-widest">No Shift Assignments</p>
          </div>
        ) : (
          shifts.map((shift) => {
            const meta = SHIFT_META[shift.id];
            return (
              <div 
                key={shift.id} 
                className="p-5 sm:p-6"
                style={{ backgroundColor: meta.bg }}
              >
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-2">
                    <Clock size={16} className={meta.textColor} />
                    <span className={`text-sm font-black uppercase tracking-wider ${meta.textColor}`}>
                      {meta.label} Shift
                    </span>
                  </div>
                  <span className="text-xs text-white/50 font-mono font-medium">
                    {meta.time}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2.5">
                  {shift.staff.map(staffName => {
                    if (selectedStaff && selectedStaff !== staffName) return null;
                    const isModified = !!overrides[dateKey]?.[staffName];

                    return (
                      <div key={staffName} className="group relative">
                        <div
                          className="px-4 py-2 rounded-full text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
                          style={{ backgroundColor: STAFF_COLORS[staffName] || '#334466' }}
                        >
                          <span>{staffName}</span>
                          {isModified && (
                            <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" title="Manual Override Active" />
                          )}
                        </div>
                        
                        {isManagerMode && (
                          <div className="absolute -top-10 left-0 z-20 flex gap-1 p-1 bg-[#0A0A0D] border border-white/10 rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity">
                            {['AM', 'PM', 'NT', 'OFF'].map(type => (
                              <button
                                key={type}
                                onClick={() => handleShiftChange(staffName, type)}
                                className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase transition-all ${
                                  shift.id === type ? 'bg-[#00D66B] text-[#04170D]' : 'text-gray-400 hover:text-white'
                                }`}
                              >
                                {type}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>

      {isManagerMode && (
        <div className="p-4 bg-[#0A0A0D]/50 border-t border-white/[0.05] text-center">
          <p className="text-[10px] text-[#54565F] font-semibold uppercase tracking-wider">
            Manager Mode: Hover/tap staff badge to adjust shift
          </p>
        </div>
      )}
    </div>
  );
}
