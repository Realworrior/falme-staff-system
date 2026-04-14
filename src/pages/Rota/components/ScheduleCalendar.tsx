import { format, getDay } from 'date-fns';
import { motion } from 'framer-motion';
import { DailySchedule, STAFF_COLORS } from '../utils/scheduleGenerator';

interface ScheduleCalendarProps {
  schedule: DailySchedule[];
  selectedStaff: string | null;
  onDayClick: (date: Date) => void;
}

export function ScheduleCalendar({ schedule, selectedStaff, onDayClick }: ScheduleCalendarProps) {
  if (schedule.length === 0) return null;

  const firstDay = schedule[0].date;
  const startDay = getDay(firstDay);

  // Create array of days including empty slots for alignment
  const calendarDays = [];
  for (let i = 0; i < startDay; i++) {
    calendarDays.push(null);
  }
  calendarDays.push(...schedule);

  return (
    <div className="w-full">
      {/* Calendar Header */}
      <div className="grid grid-cols-7 gap-1 md:gap-2 mb-4 md:mb-6">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center text-[9px] font-black uppercase tracking-widest text-gray-500">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1.5 md:gap-3">
        {calendarDays.map((day, index) => {
          if (!day) {
            return <div key={`empty-${index}`} className="aspect-square" />;
          }

          const isSelected = selectedStaff
            ? Object.values(day.shifts).some(shift => shift.includes(selectedStaff))
            : false;

          // Collect all staff with their shifts for this day
          const allStaffShifts: Array<{ name: string; shift: string }> = [];
          Object.entries(day.shifts).forEach(([shiftType, staffList]) => {
            staffList.forEach(staffName => {
              if (!selectedStaff || staffName === selectedStaff) {
                allStaffShifts.push({ name: staffName, shift: shiftType });
              }
            });
          });

          return (
            <motion.div
              key={day.date.toISOString()}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.005 }}
              onClick={() => onDayClick(day.date)}
              className={`
                aspect-square border rounded-2xl p-1 md:p-2 cursor-pointer transition-all overflow-hidden relative group/day
                ${isSelected 
                  ? 'border-red-500 bg-red-500/5 shadow-[0_0_15px_rgba(239,68,68,0.1)]' 
                  : 'border-white/5 bg-white/2 hover:border-white/10 hover:bg-white/5'}
                ${!selectedStaff ? 'opacity-100' : isSelected ? 'opacity-100' : 'opacity-20'}
              `}
            >
              <div className="h-full flex flex-col">
                <div className="text-[10px] md:text-sm mb-1 flex-shrink-0">
                  {format(day.date, 'd')}
                </div>

                {/* Staff Names */}
                <div className="flex-1 flex flex-col gap-[2px] md:gap-1 overflow-hidden">
                  {allStaffShifts.map((item, idx) => (
                    <div
                      key={`${item.name}-${idx}`}
                      className="flex-shrink-0 text-white px-1 py-[2px] md:py-0.5 rounded text-[7px] md:text-[9px] leading-tight truncate"
                      style={{ backgroundColor: STAFF_COLORS[item.name] }}
                      title={`${item.name} - ${item.shift}`}
                    >
                      {item.name}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
