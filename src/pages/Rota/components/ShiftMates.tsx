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
  onClose?: () => void;
}

const shiftColors = {
  AM: 'bg-[#FF6B35]',
  PM: 'bg-[#4ECDC4]',
  NT: 'bg-[#6366F1]',
  OFF: 'bg-gray-800'
};

export function ShiftMates({ 
  selectedDate, 
  schedule, 
  selectedStaff, 
  isManagerMode, 
  onOverride, 
  overrides = {},
  onClose 
}: ShiftMatesProps) {
  const [editingStaff, setEditingStaff] = useState<string | null>(null);

  if (!selectedDate) return null;

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
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-[#0a0a0f] border border-white/10 rounded-[40px] p-8 md:p-10 shadow-[0_0_50px_rgba(0,0,0,1)] relative overflow-hidden"
    >
      {/* Background Glow */}
      <div className="absolute top-0 left-0 w-full h-1 bg-red-600 shadow-[0_0_20px_rgba(220,38,38,1)]" />
      
      <div className="mb-10 flex items-center justify-between">
        <div>
          <h3 className="mb-2 text-3xl font-black text-white uppercase tracking-tighter font-heading">
            {format(selectedDate, 'EEEE, MMM d')}
          </h3>
          <div className="flex items-center gap-3">
             <p className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-500 font-heading">Personnel Allocation Index</p>
             {isManagerMode && (
               <div className="px-2 py-0.5 rounded-full bg-red-600/20 border border-red-500/30 text-red-500 text-[9px] font-black uppercase tracking-widest">
                 Live Edit
               </div>
             )}
          </div>
        </div>
        <button 
          onClick={onClose}
          className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/10 transition-all active:scale-95"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="space-y-8 max-h-[70vh] overflow-y-auto pr-4 no-scrollbar">
        {shiftsForDay.map(shift => (
          <motion.div
            key={shift.type}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-4">
              <div className={`${shiftColors[shift.type as keyof typeof shiftColors]} w-4 h-4 rounded-full shadow-lg shadow-white/5`} />
              <div className="text-[12px] font-black uppercase tracking-[0.4em] text-gray-400">
                {shift.type} Operational Window
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-8">
              {shift.staff.map(staff => {
                const isModified = overrides[dateKey]?.[staff];
                const isEditing = editingStaff === staff;

                return (
                  <div key={staff} className="relative">
                    <div
                      className={`
                        px-5 py-4 rounded-2xl transition-all text-white text-[13px] font-black border border-white/5 flex items-center justify-between group/staff
                        ${selectedStaff === staff ? 'bg-white/10 border-white/20' : 'bg-white/2 hover:bg-white/5 shadow-xl'}
                        ${isModified ? 'border-amber-500/30 bg-amber-500/5' : ''}
                      `}
                      style={{ borderLeft: `6px solid ${STAFF_COLORS[staff]}` }}
                    >
                      <div className="flex items-center gap-3">
                        <span className="tracking-tighter">{staff}</span>
                        {isModified && (
                          <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {isManagerMode && !isEditing && (
                          <button 
                            onClick={() => setEditingStaff(staff)}
                            className="p-2 opacity-30 group-hover/staff:opacity-100 transition-all hover:bg-white/10 rounded-xl text-gray-400 hover:text-red-500"
                          >
                            <Edit2 size={16} />
                          </button>
                        )}
                        {selectedStaff === staff && !isEditing && (
                          <div className="w-2 h-2 rounded-full bg-red-600 shadow-[0_0_10px_rgba(220,38,38,0.5)]" />
                        )}
                      </div>
                    </div>

                    <AnimatePresence>
                      {isEditing && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          className="absolute inset-0 z-50 bg-[#16161f] rounded-2xl border border-white/10 flex items-center p-2 gap-2"
                        >
                          {(['AM', 'PM', 'NT', 'OFF'] as ShiftType[]).map((type) => (
                            <button
                              key={type}
                              onClick={() => handleShiftChange(staff, type)}
                              className={`flex-1 h-full rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                shift.type === type 
                                  ? 'bg-red-600 text-white shadow-lg shadow-red-500/30' 
                                  : 'hover:bg-white/5 text-gray-600 hover:text-white'
                              }`}
                            >
                              {type}
                            </button>
                          ))}
                          <button 
                            onClick={() => setEditingStaff(null)}
                            className="p-2 text-gray-500 hover:text-white"
                          >
                            <X size={20} />
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

      {isManagerMode && (
         <div className="mt-8 pt-6 border-t border-white/5">
            <p className="text-[10px] text-gray-600 font-black uppercase tracking-[0.3em] italic text-center">
               Synchronized Operational Adjustments Node Active
            </p>
         </div>
      )}
    </motion.div>
  );
}
