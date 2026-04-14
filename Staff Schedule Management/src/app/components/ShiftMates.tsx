import { motion } from 'motion/react';
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
      <div className="bg-card border-2 border-border rounded-xl p-6 md:p-8 text-center">
        <Users className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-3 md:mb-4 opacity-30" />
        <p className="text-sm md:text-base opacity-60">Select a date to view shift mates</p>
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border-2 border-border rounded-xl p-4 md:p-6"
    >
      <div className="mb-4 md:mb-6">
        <h3 className="mb-1 text-lg md:text-xl" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
          {format(selectedDate, 'EEEE, MMMM d, yyyy')}
        </h3>
        <p className="text-xs md:text-sm opacity-60">Team members on shift</p>
      </div>

      <div className="space-y-3 md:space-y-4">
        {shiftsForDay.map(shift => (
          <motion.div
            key={shift.type}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-2"
          >
            <div className={`${shiftColors[shift.type]} text-white px-2 md:px-3 py-1 md:py-1.5 rounded-lg inline-block text-sm md:text-base`}>
              {shift.type} Shift
            </div>
            <div className="grid grid-cols-1 gap-2 ml-2 md:ml-4">
              {shift.staff.map(staff => (
                <div
                  key={staff}
                  className={`
                    px-3 md:px-4 py-1.5 md:py-2 rounded-lg transition-all text-white text-sm md:text-base
                    ${selectedStaff === staff ? 'ring-2 ring-foreground ring-offset-2' : ''}
                  `}
                  style={{ backgroundColor: STAFF_COLORS[staff] }}
                >
                  {staff}
                  {selectedStaff === staff && (
                    <span className="ml-2 text-xs opacity-80">(You)</span>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {shiftsForDay.length === 0 && (
        <div className="text-center py-8 opacity-60">
          No staff scheduled for this day
        </div>
      )}
    </motion.div>
  );
}
