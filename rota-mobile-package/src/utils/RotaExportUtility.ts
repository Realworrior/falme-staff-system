import { DailySchedule } from '../types/rotaTypes';
import { STAFF_CONFIG, SOFASAFI_STAFF_CONFIG } from './scheduleGenerator';
import { format } from 'date-fns';

export function exportScheduleToCSV(schedule: DailySchedule[], branch: string = 'betfalme'): string {
  if (schedule.length === 0) return '';

  const staffList = branch === 'sofasafi' ? SOFASAFI_STAFF_CONFIG : STAFF_CONFIG;
  const staffNames = staffList.map(s => s.name);
  
  const headers = ['Date', ...staffNames];
  const rows = [headers.join(',')];

  schedule.forEach(day => {
    const row = [format(day.date, 'eee, d')];
    
    staffNames.forEach(name => {
      let shiftType = 'OFF';
      if (day.shifts.AM.includes(name)) shiftType = 'AM';
      else if (day.shifts.PM.includes(name)) shiftType = 'PM';
      else if (day.shifts.NT.includes(name)) shiftType = 'NT';
      
      row.push(shiftType);
    });
    
    rows.push(row.join(','));
  });

  return rows.join('\n');
}

export function downloadCSV(csvContent: string, filename: string) {
  if (typeof window === 'undefined') return;
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
