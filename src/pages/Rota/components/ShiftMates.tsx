import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { DailySchedule, ShiftType, STAFF_COLORS } from '../utils/scheduleGenerator';
import { Users, Edit2, RotateCcw, Check } from 'lucide-react';
import { useState } from 'react';

interface ShiftMatesProps {
  selectedDate: Date | null;
  schedule: DailySchedule[];
  selectedStaff: string | null;
  isManagerMode?: boolean;
  onOverride?: (date: string, staff: string, type: ShiftType) => void;
  overrides?: Record<string, Record<string, string>>;
}

const shiftColors = {
  AM: 'bg-[#FF6B35]',
  PM: 'bg-[#4ECDC4]',
  NT: 'bg-[#6366F1]',
  OFF: 'bg-gray-800'
};

export function ShiftMates({ selectedDate, schedule, selectedStaff, isManagerMode, onOverride, overrides = {} }: ShiftMatesProps) {
  const [editingStaff, setEditingStaff] = useState<string | null>(null);

  if (!selectedDate) {
    return (
      <div className="bg-[#0f0f17] border border-white/5 rounded-[32px] p-6 md:p-8 text-center h-full flex flex-col items-center justify-center shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-6 border border-white/5">
          <Users className="w-8 h-8 text-gray-600" />
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Awaiting Synchronized Selection</p>
        <p className="text-gray-700 text-[9px] mt-2 italic">Select a date to initialize teammate index</p>
      </div>
    );
  }

  const dateKey = format(selectedDate, 'yyyy-MM-dd');
  const daySchedule = schedule.find(d => format(d.date, 'yyyy-MM-dd') === dateKey);

  if (!daySchedule) return null;

  const shiftsForDay: Array<{ type: ShiftType; staff: string[] }> = [
    { type: 'AM', staff: daySchedule.shifts.AM },
    { type: 'PM', staff: daySchedule.shifts.PM },
    { type: 'NT', staff: daySchedule.shifts.NT },
  ].filter(shift => shift.staff.length > 0);

  const handleShiftChange = (staff: string, type: ShiftType) => {
    onOverride?.(dateKey, staff, type);
    setEditingStaff(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-[#0f0f17] border border-white/5 rounded-[32px] p-6 shadow-2xl h-full flex flex-col"
    >
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="mb-1 text-xl font-black text-white uppercase tracking-tighter font-heading">
            {format(selectedDate, 'EEEE, MMM d')}
          </h3>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 font-heading">Team Allocation Index</p>
        </div>
        {isManagerMode && (
          <div className="px-2 py-1 rounded bg-red-600/10 border border-red-500/20 text-red-500 text-[8px] font-black uppercase tracking-widest">
            Edit Mode
          </div>
        )}
      </div>

      <div className="space-y-6 flex-1 max-h-[60vh] overflow-y-auto pr-2 no-scrollbar">
        {shiftsForDay.map(shift => (
          <motion.div
            key={shift.type}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-3"
          >
            <div className="flex items-center gap-3">
              <div className={`${shiftColors[shift.type as keyof typeof shiftColors]} w-2 h-6 rounded-full shadow-lg shadow-white/5`} />
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-300">
                {shift.type} Phase
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-2 pl-5">
              {shift.staff.map(staff => {
                const isModified = overrides[dateKey]?.[staff];
                const isEditing = editingStaff === staff;

                return (
                  <div key={staff} className="relative">
                    <div
                      className={`
                        px-4 py-3 rounded-2xl transition-all text-white text-[11px] font-bold border border-white/5 flex items-center justify-between group/staff
                        ${selectedStaff === staff ? 'bg-white/10 border-white/20' : 'bg-white/2 hover:bg-white/5'}
                        ${isModified ? 'border-amber-500/30 bg-amber-500/5' : ''}
                      `}
                      style={{ borderLeft: `4px solid ${STAFF_COLORS[staff]}` }}
                    >
                      <div className="flex items-center gap-2">
                        <span className="tracking-wide">{staff}</span>
                        {isModified && (
                          <div className="w-1 h-1 rounded-full bg-amber-500 animate-pulse" title="Manually Adjusted" />
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {selectedStaff === staff && !isEditing && (
                          <span className="text-[8px] font-black uppercase tracking-widest text-red-500">Active Node</span>
                        )}
                        {isManagerMode && !isEditing && (
                          <button 
                            onClick={() => setEditingStaff(staff)}
                            className="p-1.5 opacity-0 group-hover/staff:opacity-100 transition-opacity hover:bg-white/10 rounded-lg text-gray-500 hover:text-white"
                          >
                            <Edit2 size={12} />
                          </button>
                        )}
                      </div>
                    </div>

                    <AnimatePresence>
                      {isEditing && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          className="absolute inset-0 z-10 bg-[#1a1a24] rounded-2xl border border-white/10 flex items-center p-1 gap-1"
                        >
                          {(['AM', 'PM', 'NT', 'OFF'] as ShiftType[]).map((type) => (
                            <button
                              key={type}
                              onClick={() => handleShiftChange(staff, type)}
                              className={`flex-1 h-full rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                                shift.type === type 
                                  ? 'bg-red-600 text-white shadow-lg' 
                                  : 'hover:bg-white/5 text-gray-500 hover:text-white'
                              }`}
                            >
                              {type}
                            </button>
                          ))}
                          <button 
                            onClick={() => setEditingStaff(null)}
                            className="px-2 h-full text-gray-500 hover:text-white"
                          >
                            <X size={14} />
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </motion.div>
        ))}
      </div>

      {shiftsForDay.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-12 opacity-30">
          <div className="text-[10px] font-black uppercase tracking-[0.3em]">Zero Occupancy</div>
          <p className="text-[9px] mt-1">No personnel assigned to this temporal window</p>
        </div>
      )}
      
      {isManagerMode && (
         <div className="mt-4 pt-4 border-t border-white/5">
            <p className="text-[8px] text-gray-600 font-black uppercase tracking-[0.2em] italic">
               Modifications are synchronized across all operational nodes in real-time.
            </p>
         </div>
      )}
    </motion.div>
  );
}
