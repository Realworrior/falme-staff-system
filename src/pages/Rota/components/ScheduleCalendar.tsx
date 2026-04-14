import { format, getDay } from 'date-fns';
import { motion } from 'framer-motion';
import { DailySchedule, STAFF_COLORS } from '../utils/scheduleGenerator';

interface ScheduleCalendarProps {
  schedule: DailySchedule[];
  selectedStaff: string | null;
  onDayClick: (date: Date) => void;
}

const SHIFT_COLORS: Record<string, string> = {
  AM: '#FF6B35',
  PM: '#4ECDC4',
  NT: '#6366F1',
};

export function ScheduleCalendar({ schedule, selectedStaff, onDayClick }: ScheduleCalendarProps) {
  if (schedule.length === 0) return null;

  const firstDay = schedule[0].date;
  const startDay = getDay(firstDay); // 0=Sun

  // Pad the start with empty slots
  const calendarSlots: (DailySchedule | null)[] = [
    ...Array(startDay).fill(null),
    ...schedule,
  ];

  return (
    <div className="w-full">
      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 mb-3">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
          <div key={d} className="text-center text-[9px] md:text-[10px] font-black uppercase tracking-widest text-gray-600 py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid — each row auto-sizes to content */}
      <div className="grid grid-cols-7 gap-1 md:gap-2">
        {calendarSlots.map((day, index) => {
          if (!day) {
            return <div key={`empty-${index}`} />;
          }

          const isToday = format(day.date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
          const hasSelectedStaff = selectedStaff
            ? Object.values(day.shifts).some(arr => arr.includes(selectedStaff))
            : false;

          const dimmed = selectedStaff && !hasSelectedStaff;

          // Collect shifts in order, filtered if a staff member is selected
          const displayShifts = [
            { id: 'AM', staff: day.shifts.AM.filter(s => !selectedStaff || s === selectedStaff) },
            { id: 'PM', staff: day.shifts.PM.filter(s => !selectedStaff || s === selectedStaff) },
            { id: 'NT', staff: day.shifts.NT.filter(s => !selectedStaff || s === selectedStaff) },
          ].filter(s => s.staff.length > 0);

          return (
            <motion.div
              key={day.date.toISOString()}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.004, duration: 0.2 }}
              onClick={() => onDayClick(day.date)}
              className={`
                relative rounded-xl md:rounded-2xl cursor-pointer transition-all duration-200
                border p-1.5 md:p-2.5
                ${isToday ? 'border-red-500/50 bg-red-500/5 shadow-[0_0_12px_rgba(239,68,68,0.08)]' : ''}
                ${!isToday && hasSelectedStaff ? 'border-white/20 bg-white/5' : ''}
                ${!isToday && !hasSelectedStaff && !dimmed ? 'border-white/5 bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.04]' : ''}
                ${dimmed ? 'border-white/[0.03] bg-transparent opacity-30' : ''}
              `}
            >
              {/* Date number */}
              <div className={`text-[10px] md:text-xs font-black mb-1.5 ${isToday ? 'text-red-500' : 'text-gray-500'}`}>
                {format(day.date, 'd')}
                {isToday && <span className="ml-1 text-[7px] uppercase tracking-widest">Today</span>}
              </div>

              {/* Shift groups */}
              <div className="flex flex-col gap-2">
                {displayShifts.map(shift => (
                  <div key={shift.id}>
                    {/* Shift label */}
                    <div className="flex items-center gap-1 mb-1">
                      <div
                        className="w-1 h-1 rounded-full flex-shrink-0"
                        style={{ backgroundColor: SHIFT_COLORS[shift.id] }}
                      />
                      <span
                        className="text-[6px] md:text-[7px] font-black uppercase tracking-widest"
                        style={{ color: SHIFT_COLORS[shift.id] }}
                      >
                        {shift.id}
                      </span>
                    </div>

                    {/* Staff name pills */}
                    <div className="flex flex-col gap-[3px] w-full min-w-0">
                      {shift.staff.map(name => (
                        <div
                          key={name}
                          className="w-full rounded-[4px] md:rounded-[6px] px-1 md:px-1.5 py-[2px] md:py-1 text-white leading-tight shadow-sm"
                          style={{ backgroundColor: STAFF_COLORS[name] ?? '#555' }}
                          title={`${name} — ${shift.id}`}
                        >
                          <span className="text-[7px] md:text-[9px] font-bold block whitespace-normal break-words w-full">
                            {name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
