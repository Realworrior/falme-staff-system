import { addDays, format, startOfMonth, endOfMonth, differenceInDays } from 'date-fns';
import { STAFF_CONFIG, SOFASAFI_STAFF_CONFIG, CYCLE_18 } from './scheduleGenerator';
import { ShiftType } from '../types/rotaTypes';

export function predictMonthRota(
  targetYear: number,
  targetMonth: number,
  previousMonthOverrides: Record<string, any>,
  branch: string = 'betfalme'
): Record<string, Record<string, ShiftType>> {
  const result: Record<string, Record<string, ShiftType>> = {};
  
  const prevMonth = targetMonth === 0 ? 11 : targetMonth - 1;
  const prevYear = targetMonth === 0 ? targetYear - 1 : targetYear;
  const lastDayOfPrevMonth = endOfMonth(new Date(prevYear, prevMonth));
  const lastDayKey = format(lastDayOfPrevMonth, 'yyyy-MM-dd');
  
  const staffList = branch === 'sofasafi' ? SOFASAFI_STAFF_CONFIG : STAFF_CONFIG;
  const sortedStaff = [...staffList].sort((a, b) => a.name.localeCompare(b.name));

  // 1. Calculate the 'ideal' next position in the 18-day cycle
  const idealPositions = sortedStaff.map((staff, index) => {
    const lastShift = previousMonthOverrides[lastDayKey]?.shifts?.[staff.name] || 
                     previousMonthOverrides[lastDayKey]?.[staff.name] || 
                     'OFF';
    
    let pos = -1;
    for (let i = 0; i < 18; i++) {
      if (CYCLE_18[i] === lastShift) {
        if (lastShift === 'NT' || (i % 2 === index % 2)) {
          pos = i;
          break;
        }
      }
    }
    if (pos === -1) pos = (index * 2) % 18;
    
    return (pos + 1) % 18;
  });

  // 2. Enforce unique even offsets (0, 2, 4, 6, 8, 10, 12, 14, 16)
  const finalOffsets = new Array(9).fill(-1);
  const availableOffsets = new Set([0, 2, 4, 6, 8, 10, 12, 14, 16]);

  sortedStaff.forEach((staff, i) => {
    const ideal = idealPositions[i];
    const closestEven = (ideal % 2 === 0) ? ideal : (ideal + 1) % 18;
    
    if (availableOffsets.has(closestEven)) {
      finalOffsets[i] = closestEven;
      availableOffsets.delete(closestEven);
    }
  });

  sortedStaff.forEach((staff, i) => {
    if (finalOffsets[i] === -1) {
      const remaining = Array.from(availableOffsets);
      finalOffsets[i] = remaining[0];
      availableOffsets.delete(remaining[0]);
    }
  });

  // 3. Generate the Rota
  const monthStart = startOfMonth(new Date(targetYear, targetMonth));
  const monthEnd = endOfMonth(new Date(targetYear, targetMonth));
  
  for (let date = monthStart; date <= monthEnd; date = addDays(date, 1)) {
    const dateKey = format(date, 'yyyy-MM-dd');
    result[dateKey] = {};
    
    const daysSinceStart = differenceInDays(date, monthStart);
    
    sortedStaff.forEach((staff, i) => {
      const pos = (finalOffsets[i] + daysSinceStart) % 18;
      result[dateKey][staff.name] = CYCLE_18[pos];
    });
  }

  return result;
}

export function validateRota(rota: Record<string, Record<string, ShiftType>>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const staffStats: Record<string, { total: number; am: number; pm: number; nt: number; lastShift?: ShiftType; offStreak: number }> = {};

  const dates = Object.keys(rota).sort();
  dates.forEach(dateKey => {
    const dayShifts = rota[dateKey];
    const counts = { AM: 0, PM: 0, NT: 0, OFF: 0 };
    
    Object.entries(dayShifts).forEach(([staffName, type]) => {
      if (!staffStats[staffName]) staffStats[staffName] = { total: 0, am: 0, pm: 0, nt: 0, offStreak: 0 };
      const stats = staffStats[staffName];
      
      if (stats.lastShift === 'PM' && type === 'AM') errors.push(`${dateKey}: ${staffName} (PM->AM)`);
      if (stats.lastShift === 'NT' && (type === 'AM' || type === 'PM')) errors.push(`${dateKey}: ${staffName} (NT->${type})`);
      
      if (type === 'OFF') {
        stats.offStreak++;
        if (stats.offStreak > 2) errors.push(`${dateKey}: ${staffName} (>2 OFF)`);
      } else {
        stats.offStreak = 0;
        stats.total++;
        if (type === 'AM') stats.am++;
        if (type === 'PM') stats.pm++;
        if (type === 'NT') stats.nt++;
      }
      stats.lastShift = type;
      counts[type]++;
    });
    
    if (counts.NT !== 1) errors.push(`${dateKey}: NT count is ${counts.NT}`);
    if (counts.AM < 2 || counts.AM > 3) errors.push(`${dateKey}: AM count is ${counts.AM}`);
    if (counts.PM < 2 || counts.PM > 3) errors.push(`${dateKey}: PM count is ${counts.PM}`);
  });

  return { valid: errors.length === 0, errors };
}
