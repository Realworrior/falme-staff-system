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

          // Group staff by shift
          const shifts = [
            { id: 'AM', label: 'A', color: 'bg-[#FF6B35]', staff: day.shifts.AM },
            { id: 'PM', label: 'P', color: 'bg-[#4ECDC4]', staff: day.shifts.PM },
            { id: 'NT', label: 'N', color: 'bg-[#6366F1]', staff: day.shifts.NT },
          ].filter(s => s.staff.length > 0);

          return (
            <motion.div
              key={day.date.toISOString()}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.005 }}
              onClick={() => onDayClick(day.date)}
              className={`
                min-h-[140px] md:min-h-[180px] h-auto border rounded-2xl p-2 md:p-3 cursor-pointer transition-all relative group/day
                ${isSelected 
                  ? 'border-red-500 bg-red-500/5 shadow-[0_0_15px_rgba(239,68,68,0.1)]' 
                  : 'border-white/5 bg-white/2 hover:border-white/10 hover:bg-white/5'}
                ${!selectedStaff ? 'opacity-100' : isSelected ? 'opacity-100' : 'opacity-20'}
              `}
            >
              <div className="flex flex-col">
                <div className="text-[10px] md:text-sm font-bold opacity-40 mb-2">
                  {format(day.date, 'd')}
                </div>

                <div className="flex flex-col gap-3">
                  {shifts.map(s => (
                    <div key={s.id} className="space-y-1">
                      <div className="flex items-center gap-1.5 opacity-60">
                        <div className={`w-1 h-1 rounded-full ${s.color}`} />
                        <span className="text-[7px] md:text-[8px] font-black uppercase tracking-widest">{s.id}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        {s.staff.map((staffName, idx) => {
                          const isStaffSelected = selectedStaff === staffName || !selectedStaff;
                          if (!isStaffSelected) return null;

                          return (
                            <div
                              key={`${staffName}-${idx}`}
                              className="text-white px-1.5 py-0.5 md:py-1 rounded text-[7px] md:text-[9px] font-bold leading-tight truncate shadow-sm"
                              style={{ 
                                backgroundColor: STAFF_COLORS[staffName],
                                opacity: selectedStaff === staffName ? 1 : 0.9
                              }}
                              title={`${staffName} - ${s.id}`}
                            >
                              {staffName}
                            </div>
                          );
                        })}
                      </div>
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
