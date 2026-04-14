import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { DailySchedule, ShiftType, STAFF_COLORS } from '../utils/scheduleGenerator';
import { Users } from 'lucide-react';

interface ShiftMatesProps {
  selectedDate: Date | null;
  schedule: DailySchedule[];
  selectedStaff: string | null;
}

const shiftColors = {
  AM: 'bg-[#FF6B35]',
  PM: 'bg-[#4ECDC4]',
  NT: 'bg-[#6366F1]',
};

export function ShiftMates({ selectedDate, schedule, selectedStaff }: ShiftMatesProps) {
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

  const daySchedule = schedule.find(
    d => format(d.date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
  );

  if (!daySchedule) return null;

  const shiftsForDay: Array<{ type: ShiftType; staff: string[] }> = [
    { type: 'AM', staff: daySchedule.shifts.AM },
    { type: 'PM', staff: daySchedule.shifts.PM },
    { type: 'NT', staff: daySchedule.shifts.NT },
  ].filter(shift => shift.staff.length > 0);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-[#0f0f17] border border-white/5 rounded-[32px] p-6 shadow-2xl h-full flex flex-col"
    >
      <div className="mb-6">
        <h3 className="mb-1 text-xl font-black text-white uppercase tracking-tighter font-heading">
          {format(selectedDate, 'EEEE, MMM d')}
        </h3>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 font-heading">Team Allocation Index</p>
      </div>

      <div className="space-y-6 flex-1">
        {shiftsForDay.map(shift => (
          <motion.div
            key={shift.type}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-3"
          >
            <div className="flex items-center gap-3">
              <div className={`${shiftColors[shift.type]} w-2 h-6 rounded-full shadow-lg shadow-white/5`} />
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-300">
                {shift.type} Phase
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-2 pl-5">
              {shift.staff.map(staff => (
                <div
                  key={staff}
                  className={`
                    px-4 py-2.5 rounded-2xl transition-all text-white text-[11px] font-bold border border-white/5 flex items-center justify-between group/staff
                    ${selectedStaff === staff ? 'bg-white/10 border-white/20' : 'bg-white/2 hover:bg-white/5'}
                  `}
                  style={{ 
                    borderLeft: `4px solid ${STAFF_COLORS[staff]}`
                  }}
                >
                  <span className="tracking-wide">{staff}</span>
                  {selectedStaff === staff && (
                    <span className="text-[8px] font-black uppercase tracking-widest text-red-500">Active Node</span>
                  )}
                </div>
              ))}
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
    </motion.div>
  );
}
