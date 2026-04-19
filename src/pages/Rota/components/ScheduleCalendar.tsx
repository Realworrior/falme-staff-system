import React, { useState, useEffect } from 'react';
import { format, getDay } from 'date-fns';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';
import { DailySchedule, STAFF_COLORS } from '../utils/scheduleGenerator';

interface ScheduleCalendarProps {
  schedule: DailySchedule[];
  selectedStaff: string | null;
  onDayClick: (date: Date) => void;
  overrides?: Record<string, Record<string, string>>;
}

const SHIFT_CONFIG: Record<string, { label: string, time: string, color: string, bg: string }> = {
  AM: { 
    label: 'AM', 
    time: '06:00 - 14:00', 
    color: '#2DD4BF', 
    bg: 'rgba(45, 212, 191, 0.15)' 
  },
  PM: { 
    label: 'PM', 
    time: '14:00 - 22:00', 
    color: '#60A5FA', 
    bg: 'rgba(96, 165, 250, 0.15)' 
  },
  NT: { 
    label: 'NT', 
    time: '22:00 - 06:00', 
    color: '#FBBF24', 
    bg: 'rgba(251, 191, 36, 0.15)' 
  },
};

export function ScheduleCalendar({ schedule, selectedStaff, onDayClick, overrides = {} }: ScheduleCalendarProps) {
  const [mobileMode, setMobileMode] = useState(false);
  
  useEffect(() => {
    const check = () => setMobileMode(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  if (schedule.length === 0) return null;

  const SHORT_NAMES: Record<string, string> = {
    'Nickson': 'Nick',
    'Pauline': 'Paula',
    'Kipkemoi': 'Kip',
  };

  const getDisplayName = (name: string) => {
    if (mobileMode && SHORT_NAMES[name]) return SHORT_NAMES[name];
    return name;
  };

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
            {mobileMode ? d[0] : d}
          </div>
        ))}
      </div>

      {/* Calendar grid — each row auto-sizes to content */}
      <div className="grid grid-cols-7 gap-0.5 md:gap-2">
        {calendarSlots.map((day, index) => {
          if (!day) {
            return <div key={`empty-${index}`} />;
          }

          const isToday = format(day.date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
          const hasSelectedStaff = selectedStaff
            ? Object.values(day.shifts).some(arr => arr.includes(selectedStaff))
            : false;

          const dimmed = selectedStaff && !hasSelectedStaff;

          // Collect shifts: if a staff is selected, show the ENTIRE shift they belong to (Shift Mates)
          const displayShifts = [
            { id: 'AM', staff: day.shifts.AM },
            { id: 'PM', staff: day.shifts.PM },
            { id: 'NT', staff: day.shifts.NT },
          ].filter(s => {
            if (!selectedStaff) return s.staff.length > 0;
            return s.staff.includes(selectedStaff);
          });

          return (
            <motion.div
              key={day.date.toISOString()}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.004, duration: 0.2 }}
              onClick={() => onDayClick(day.date)}
              className={`
                relative rounded-lg md:rounded-2xl cursor-pointer transition-all duration-200
                border p-1 md:p-2.5
                ${isToday ? 'border-red-500/50 bg-red-500/5 shadow-[0_0_12px_rgba(239,68,68,0.08)]' : ''}
                ${!isToday && hasSelectedStaff ? 'border-white/20 bg-white/5' : ''}
                ${!isToday && !hasSelectedStaff && !dimmed ? 'border-white/5 bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.04]' : ''}
                ${dimmed ? 'border-white/[0.03] bg-transparent opacity-30' : ''}
              `}
            >
              {/* Date & Status */}
              <div className="flex items-center justify-between mb-1 min-h-[14px]">
                <div className={`text-[9px] md:text-xs font-black ${isToday ? 'text-red-500' : 'text-gray-500'}`}>
                  {format(day.date, 'd')}
                  {isToday && <span className="ml-0.5 text-[6px] uppercase tracking-tighter">{mobileMode ? "TDY" : "Today"}</span>}
                </div>
                {Object.keys(overrides[format(day.date, 'yyyy-MM-dd')] || {}).length > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-1 h-1 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]"
                    title="Manual Override Active"
                  />
                )}
              </div>

              {/* Shift groups */}
              <div className="flex flex-col gap-0.5 mt-1 overflow-hidden rounded-xl border border-white/5">
                {displayShifts.map((shift, sIdx) => {
                  const config = SHIFT_CONFIG[shift.id];
                  return (
                    <div 
                      key={shift.id}
                      className="p-1.5 transition-all relative group"
                      style={{ backgroundColor: config.bg }}
                    >
                      {/* Shift label & Time */}
                      <div className="flex items-center justify-between mb-1.5 px-0.5">
                        <div className="flex items-center gap-1">
                          <Clock size={8} style={{ color: config.color }} className="opacity-70" />
                          <span className="text-[6px] md:text-[8px] font-black uppercase tracking-widest" style={{ color: config.color }}>
                            {shift.id}
                          </span>
                        </div>
                        <span className="text-[5px] md:text-[7px] text-white/30 font-bold whitespace-nowrap">
                          {!mobileMode && config.time}
                        </span>
                      </div>

                      {/* Staff name pills - horizontal wrapping */}
                      <div className="flex flex-wrap gap-1 w-full">
                        {shift.staff.map(name => (
                          <div
                            key={name}
                            className="rounded-full px-1.5 md:px-2.5 py-[1px] md:py-0.5 text-white leading-tight shadow-sm border border-white/10"
                            style={{ backgroundColor: STAFF_COLORS[name] ?? '#555' }}
                            title={`${name} — ${shift.id}`}
                          >
                            <span className="text-[6px] md:text-[8px] font-black tracking-tight whitespace-nowrap">
                              {getDisplayName(name)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
