import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { DailySchedule, ShiftType, STAFF_COLORS } from '../utils/scheduleGenerator';
import { Edit2, X } from 'lucide-react';

interface ShiftMatesProps {
  selectedDate: Date;
  schedule: DailySchedule[];
  selectedStaff: string | null;
  isManagerMode?: boolean;
  onOverride?: (date: string, staff: string, type: ShiftType) => void;
  overrides?: Record<string, Record<string, string>>;
  onClose?: () => void;
}

const SHIFT_META: Record<string, { label: string; color: string; bg: string; textColor: string }> = {
  AM: { label: 'AM — Morning', color: '#FF6B35', bg: 'bg-[#FF6B35]/10', textColor: 'text-[#FF6B35]' },
  PM: { label: 'PM — Afternoon', color: '#4ECDC4', bg: 'bg-[#4ECDC4]/10', textColor: 'text-[#4ECDC4]' },
  NT: { label: 'NT — Night', color: '#6366F1', bg: 'bg-[#6366F1]/10', textColor: 'text-[#6366F1]' },
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
  const [editingStaff, setEditingStaff] = useState<string | null>(null);

  const dateKey = format(selectedDate, 'yyyy-MM-dd');
  const daySchedule = schedule.find(d => format(d.date, 'yyyy-MM-dd') === dateKey);

  const shifts = daySchedule
    ? [
        { id: 'AM' as ShiftType, staff: daySchedule.shifts.AM },
        { id: 'PM' as ShiftType, staff: daySchedule.shifts.PM },
        { id: 'NT' as ShiftType, staff: daySchedule.shifts.NT },
      ].filter(s => s.staff.length > 0)
    : [];

  const handleShiftChange = (staff: string, type: ShiftType) => {
    onOverride?.(dateKey, staff, type);
    setEditingStaff(null);
  };

  return (
    <div className="bg-[#0f0f17] border border-white/10 rounded-[32px] shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 border-b border-white/5 flex items-start justify-between gap-4">
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.25em] text-gray-500 mb-1">Team Allocation</p>
          <h3 className="text-2xl font-black text-white uppercase tracking-tighter font-heading leading-tight">
            {format(selectedDate, 'EEEE')}
          </h3>
          <p className="text-sm text-gray-400 font-bold">{format(selectedDate, 'MMMM d, yyyy')}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {isManagerMode && (
            <div className="px-2 py-1 rounded-lg bg-red-600/10 border border-red-500/20 text-red-500 text-[8px] font-black uppercase tracking-widest">
              Edit Mode
            </div>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Shift blocks */}
      <div className="p-6 space-y-5">
        {shifts.length === 0 && (
          <div className="py-12 text-center opacity-30">
            <p className="text-[10px] font-black uppercase tracking-[0.3em]">No Assignments</p>
            <p className="text-[9px] mt-1 text-gray-500">This date has no personnel assigned</p>
          </div>
        )}

        {shifts.map(shift => {
          const meta = SHIFT_META[shift.id];
          return (
            <div key={shift.id} className={`rounded-2xl p-4 ${meta.bg} border border-white/5`}>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: meta.color }} />
                <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${meta.textColor}`}>
                  {meta.label}
                </span>
                <span className="ml-auto text-[9px] text-gray-500 font-bold">{shift.staff.length} staff</span>
              </div>

              <div className="space-y-2">
                {shift.staff.map(staffName => {
                  if (selectedStaff && selectedStaff !== staffName) return null;
                  const isModified = !!overrides[dateKey]?.[staffName];
                  const isEditing = editingStaff === staffName;

                  return (
                    <div key={staffName} className="relative">
                      <div
                        className={`
                          flex items-center justify-between px-4 py-3 rounded-xl border
                          text-white text-[12px] font-bold transition-all group/card
                          ${isModified ? 'border-amber-500/30 bg-amber-500/5' : 'border-white/5 bg-white/5 hover:bg-white/8'}
                        `}
                        style={{ borderLeft: `4px solid ${STAFF_COLORS[staffName]}` }}
                      >
                        <div className="flex items-center gap-2">
                          <span>{staffName}</span>
                          {isModified && (
                            <span className="text-[8px] text-amber-500 font-black uppercase tracking-widest">Modified</span>
                          )}
                        </div>
                        
                        {isManagerMode ? (
                          <div className="flex gap-1 p-0.5 bg-black/20 rounded-lg border border-white/5">
                            {(['AM', 'PM', 'NT', 'OFF'] as ShiftType[]).map(type => (
                              <button
                                key={type}
                                onClick={() => onOverride?.(dateKey, staffName, type)}
                                className={`
                                  px-2 py-1 rounded md:px-2.5 md:py-1.5 text-[7px] md:text-[8px] font-black uppercase tracking-widest transition-all
                                  ${(overrides[dateKey]?.[staffName] || (shift.id === type && !overrides[dateKey]?.[staffName]))
                                    ? 'bg-white/10 text-white shadow-sm' 
                                    : 'text-gray-600 hover:text-gray-400 hover:bg-white/5'}
                                `}
                                style={(overrides[dateKey]?.[staffName] === type || (shift.id === type && !overrides[dateKey]?.[staffName])) && type !== 'OFF' 
                                  ? { backgroundColor: SHIFT_META[type].color + '40', color: SHIFT_META[type].color } 
                                  : {}}
                              >
                                {type}
                              </button>
                            ))}
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-gray-500 font-bold uppercase">{shift.id}</span>
                          </div>
                        )}
                      </div>
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
