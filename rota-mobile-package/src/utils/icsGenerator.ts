import { format, addDays } from 'date-fns';
import { DailySchedule } from '../types/rotaTypes';

const SHIFT_METAS = [
  { id: 'AM', label: 'Morning Shift', time: '07:30 – 15:30', color: '#3d7ee6' },
  { id: 'PM', label: 'Afternoon Shift', time: '15:30 – 22:30', color: '#28a87c' },
  { id: 'NT', label: 'Night Shift', time: '22:30 – 07:30', color: '#7a56d4' }
];

export function generateICSContent(staffName: string, currentDate: Date, schedule: DailySchedule[]): string {
  const ics: string[] = [];
  ics.push('BEGIN:VCALENDAR');
  ics.push('VERSION:2.0');
  ics.push('PRODID:-//Falme Rota System//EN');
  ics.push('CALSCALE:GREGORIAN');
  ics.push('METHOD:PUBLISH');
  ics.push(`X-WR-CALNAME:Rota - ${staffName}`);
  ics.push('X-WR-TIMEZONE:Africa/Nairobi');

  schedule.forEach((day) => {
    let shiftType: string | null = null;
    if (day.shifts.AM.includes(staffName)) shiftType = 'AM';
    else if (day.shifts.PM.includes(staffName)) shiftType = 'PM';
    else if (day.shifts.NT.includes(staffName)) shiftType = 'NT';

    if (!shiftType) return;

    const meta = SHIFT_METAS.find(s => s.id === shiftType);
    const dateStr = format(day.date, 'yyyyMMdd');
    const color = meta?.color || '#3d7ee6';
    
    const startHour = shiftType === 'AM' ? '073000' : shiftType === 'PM' ? '153000' : '223000';
    const endHour = shiftType === 'AM' ? '153000' : shiftType === 'PM' ? '223000' : '073000';
    
    let endDateStr = dateStr;
    if (shiftType === 'NT') {
      endDateStr = format(addDays(day.date, 1), 'yyyyMMdd');
    }

    ics.push('BEGIN:VEVENT');
    ics.push(`UID:${dateStr}-${shiftType}-${staffName.replace(/\s+/g, '')}@falme.ai`);
    ics.push(`DTSTAMP:${format(new Date(), "yyyyMMdd'T'HHmmss'Z'")}`);
    ics.push(`DTSTART;TZID=Africa/Nairobi:${dateStr}T${startHour}`);
    ics.push(`DTEND;TZID=Africa/Nairobi:${endDateStr}T${endHour}`);
    ics.push(`SUMMARY:${shiftType} Shift - Falme`);
    ics.push(`DESCRIPTION:Scheduled shift for ${staffName}. Time: ${meta?.time || ''}`);
    ics.push('LOCATION:Main Operations Center');
    ics.push('STATUS:CONFIRMED');
    ics.push('TRANSP:OPAQUE');
    ics.push('PRIORITY:5');
    ics.push(`X-APPLE-CALENDAR-COLOR:${color}`);
    
    if (shiftType === 'AM') ics.push('COLOR:Turquoise');
    else if (shiftType === 'PM') ics.push('COLOR:DodgerBlue');
    else ics.push('COLOR:Orange');

    // 1-Hour Reminder
    ics.push('BEGIN:VALARM');
    ics.push('TRIGGER:-PT1H');
    ics.push('ACTION:DISPLAY');
    ics.push(`DESCRIPTION:Reminder: Your ${shiftType} shift starts in 1 hour`);
    ics.push('END:VALARM');
    
    ics.push('END:VEVENT');
  });

  ics.push('END:VCALENDAR');
  return ics.join('\r\n');
}

export function downloadICSFile(icsContent: string, filename: string) {
  if (typeof window === 'undefined') return;
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
