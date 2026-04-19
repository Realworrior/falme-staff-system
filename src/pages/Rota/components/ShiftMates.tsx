import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { DailySchedule, ShiftType, STAFF_COLORS } from '../utils/scheduleGenerator';
import { Edit2, X, Clock, Trash2, Plus } from 'lucide-react';

interface ShiftMatesProps {
  selectedDate: Date;
  schedule: DailySchedule[];
  selectedStaff: string | null;
  isManagerMode?: boolean;
  onOverride?: (date: string, staff: string, type: ShiftType) => void;
  overrides?: Record<string, Record<string, string>>;
  onClose?: () => void;
}

const SHIFT_META: Record<string, { label: string; time: string; color: string; bg: string; textColor: string }> = {
  AM: { 
    label: 'AM', 
    time: '07:30 - 15:30', 
    color: '#2DD4BF', 
    bg: 'rgba(45, 212, 191, 0.2)', 
    textColor: 'text-[#2DD4BF]' 
  },
  PM: { 
    label: 'PM', 
    time: '15:30 - 22:30', 
    color: '#60A5FA', 
    bg: 'rgba(96, 165, 250, 0.2)', 
    textColor: 'text-[#60A5FA]' 
  },
  NT: { 
    label: 'NT', 
    time: '22:30 - 07:30', 
    color: '#FBBF24', 
    bg: 'rgba(251, 191, 36, 0.25)', 
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
}: ShiftMatesProps) {
  const dateKey = format(selectedDate, 'yyyy-MM-dd');
  const daySchedule = schedule.find(d => format(d.date, 'yyyy-MM-dd') === dateKey);

  // Group staff by their current shift
  const shifts = daySchedule
    ? [
        { id: 'AM' as ShiftType, staff: daySchedule.shifts.AM },
        { id: 'PM' as ShiftType, staff: daySchedule.shifts.PM },
        { id: 'NT' as ShiftType, staff: daySchedule.shifts.NT },
      ].filter(s => s.staff.length > 0)
    : [];

  const handleShiftChange = (staff: string, type: ShiftType) => {
    onOverride?.(dateKey, staff, type);
  };

  return (
    <div className="bg-[#1a1a24]/90 backdrop-blur-2xl border border-white/10 rounded-[40px] shadow-2xl overflow-hidden glass-card">
      {/* Premium Header */}
      <div className="px-8 pt-8 pb-6 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold text-gray-500 mb-1">{format(selectedDate, 'EEEE')}</p>
          <div className="flex items-center gap-3">
            <h3 className="text-4xl font-black text-white tracking-tight">
              {format(selectedDate, 'd MMM')}
            </h3>
            <div className="px-3 py-1 rounded-lg bg-white/10 text-[10px] font-black uppercase text-gray-400">
               Today
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4 mt-2">
           <Edit2 size={22} className="text-gray-400 hover:text-white cursor-pointer transition-colors" />
           <Trash2 size={22} className="text-gray-400 hover:text-white cursor-pointer transition-colors" />
           <Plus size={22} className="text-gray-400 hover:text-white cursor-pointer transition-colors" />
           {onClose && (
             <button onClick={onClose} className="ml-2 p-1.5 rounded-full hover:bg-white/10 transition-colors">
               <X size={24} className="text-white/40" />
             </button>
           )}
        </div>
      </div>

      {/* Full Width Shift Sections */}
      <div className="flex flex-col">
        {shifts.length === 0 && (
          <div className="py-20 text-center opacity-30">
            <p className="text-xs font-black uppercase tracking-[0.3em]">No Assignments</p>
          </div>
        )}

        {shifts.map((shift, idx) => {
          const meta = SHIFT_META[shift.id];
          return (
            <div 
              key={shift.id} 
              className={`p-8 border-t border-white/5 first:border-t-0`}
              style={{ backgroundColor: meta.bg }}
            >
              <div className="flex items-center gap-3 mb-6">
                <Clock size={20} className={meta.textColor} />
                <span className={`text-lg font-black uppercase tracking-widest ${meta.textColor}`}>
                  {meta.label}
                </span>
                <span className="text-base text-white/30 font-bold tracking-tight">
                  {meta.time}
                </span>
              </div>

              <div className="flex flex-wrap gap-3">
                {shift.staff.map(staffName => {
                  if (selectedStaff && selectedStaff !== staffName) return null;
                  const isModified = !!overrides[dateKey]?.[staffName];

                  return (
                    <div key={staffName} className="group relative">
                      <div
                        className={`
                          px-6 py-2.5 rounded-full border border-white/10
                          text-white text-base font-bold transition-all shadow-xl
                        `}
                        style={{ backgroundColor: STAFF_COLORS[staffName] }}
                      >
                        <span className="flex items-center gap-2">
                          {staffName}
                          {isModified && (
                             <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                          )}
                        </span>
                      </div>
                      
                      {isManagerMode && (
                        <div className="absolute -top-12 left-0 z-10 flex gap-1 p-1 bg-[#1a1a24] rounded-2xl border border-white/10 shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity">
                          {(['AM', 'PM', 'NT', 'OFF'] as ShiftType[]).map(type => (
                            <button
                              key={type}
                              onClick={() => handleShiftChange(staffName, type)}
                              className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase transition-all ${
                                shift.id === type ? 'bg-white text-black' : 'text-gray-400 hover:text-white'
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
        })}
      </div>

      {isManagerMode && (
        <div className="px-6 pb-5">
          <p className="text-[8px] text-gray-600 font-black uppercase tracking-[0.2em] italic text-center">
            Changes sync to Firebase in real-time
          </p>
        </div>
      )}
    </div>
  );
}
