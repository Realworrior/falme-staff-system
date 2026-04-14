import { DailySchedule, STAFF_CONFIG } from './scheduleGenerator';
import { format } from 'date-fns';

/**
 * Exports the current schedule view to a Matrix-formatted CSV string.
 * Format: Date, Name1, Name2, Name3...
 */
export function exportScheduleToCSV(schedule: DailySchedule[]): string {
  if (schedule.length === 0) return '';

  // Get staff names from config
  const staffNames = STAFF_CONFIG.map(s => s.name);
  
  // Header row: Date, Staff1, Staff2...
  const headers = ['Date', ...staffNames];
  const rows = [headers.join(',')];

  // Data rows
  schedule.forEach(day => {
    const row = [format(day.date, 'eee, d')]; // e.g., "Wed, 1" to match user preference
    
    staffNames.forEach(name => {
      // Find shift for this staff in this day
      // Note: Weekly shifts are arrays, so we check which array contains the name
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

/**
 * Triggers a browser download for the CSV data.
 */
export function downloadCSV(csvContent: string, filename: string) {
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
