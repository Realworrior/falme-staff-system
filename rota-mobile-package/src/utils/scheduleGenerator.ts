import { addDays, startOfMonth, endOfMonth, format } from 'date-fns';
import { ShiftType, StaffMember, DailySchedule, MonthlyAnalytics, PersonColor } from '../types/rotaTypes';
import branchesData from '../../data/branchesAndStaff.json';

// Balanced 18-day cycle pattern (5 AM, 5 PM, 2 NT, 6 OFF)
export const CYCLE_18: ShiftType[] = [
  'AM', 'AM', 'PM', 'PM', 'NT', 'OFF', 'OFF', 'AM', 'OFF',
  'AM', 'AM', 'PM', 'PM', 'NT', 'OFF', 'OFF', 'PM', 'OFF'
];

export const STAFF_CONFIG: StaffMember[] = (branchesData.branches.find(b => b.id === 'betfalme')?.staff as StaffMember[]) || [];
export const SOFASAFI_STAFF_CONFIG: StaffMember[] = (branchesData.branches.find(b => b.id === 'sofasafi')?.staff as StaffMember[]) || [];

export const STAFF_THEME: Record<string, PersonColor> = {};
export const STAFF_COLORS: Record<string, string> = {};

branchesData.branches.forEach(b => {
  b.staff.forEach(s => {
    if (s.color) {
      STAFF_THEME[s.name] = s.color;
      STAFF_COLORS[s.name] = s.color.bg;
    }
  });
});

export function getStaffShift(staff: StaffMember, date: Date, baseDate: Date = new Date(2026, 0, 1)): { date: Date; staff: string; type: ShiftType } {
  const daysSinceBase = Math.round((date.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24));
  const pos = (daysSinceBase + staff.cycleOffset) % 18;
  const normalizedPos = pos < 0 ? (pos + 18) % 18 : pos;
  const type = CYCLE_18[normalizedPos];

  return {
    date,
    staff: staff.name,
    type,
  };
}

export function generateMonthSchedule(
  year: number,
  month: number,
  overrides: Record<string, Record<string, ShiftType>> = {},
  branch: string = 'betfalme'
): DailySchedule[] {
  const baseDate = new Date(2026, 0, 1);
  const monthStart = startOfMonth(new Date(year, month));
  const monthEnd = endOfMonth(new Date(year, month));

  const schedule: DailySchedule[] = [];
  const staffList = branch === 'sofasafi' ? SOFASAFI_STAFF_CONFIG : STAFF_CONFIG;

  for (let date = monthStart; date <= monthEnd; date = addDays(date, 1)) {
    const dateKey = format(date, 'yyyy-MM-dd');
    const dayOverrides = overrides[dateKey] || {};
    
    const dailyShifts: DailySchedule = {
      date: new Date(date),
      shifts: { AM: [], PM: [], NT: [] },
    };

    staffList.forEach(staff => {
      const staffOverrideKey = Object.keys(dayOverrides).find(
        k => k.toLowerCase() === staff.name.toLowerCase()
      );
      let shiftType = staffOverrideKey ? dayOverrides[staffOverrideKey] : undefined;

      if (!shiftType) {
        shiftType = getStaffShift(staff, date, baseDate).type;
      }

      if (shiftType === 'AM') dailyShifts.shifts.AM.push(staff.name);
      else if (shiftType === 'PM') dailyShifts.shifts.PM.push(staff.name);
      else if (shiftType === 'NT') dailyShifts.shifts.NT.push(staff.name);
    });

    schedule.push(dailyShifts);
  }

  return schedule;
}

export function calculateMonthlyAnalytics(
  year: number,
  month: number,
  overrides: Record<string, Record<string, ShiftType>> = {},
  branch: string = 'betfalme'
): MonthlyAnalytics {
  const schedule = generateMonthSchedule(year, month, overrides, branch);
  const staffList = branch === 'sofasafi' ? SOFASAFI_STAFF_CONFIG : STAFF_CONFIG;

  const staffStats = staffList.map(staff => {
    let amShifts = 0;
    let pmShifts = 0;
    let ntShifts = 0;

    schedule.forEach(day => {
      if (day.shifts.AM.includes(staff.name)) amShifts++;
      if (day.shifts.PM.includes(staff.name)) pmShifts++;
      if (day.shifts.NT.includes(staff.name)) ntShifts++;
    });

    return {
      name: staff.name,
      totalShifts: amShifts + pmShifts + ntShifts,
      amShifts,
      pmShifts,
      ntShifts,
    };
  });

  const dailyMetrics = schedule.map(day => ({
    date: day.date,
    amCount: day.shifts.AM.length,
    pmCount: day.shifts.PM.length,
    ntCount: day.shifts.NT.length,
  }));

  return {
    staffStats,
    dailyMetrics,
  };
}

export function getCurrentShiftType(now: Date = new Date()): 'AM' | 'PM' | 'NT' {
  const hour = now.getHours();
  const min = now.getMinutes();
  const timeVal = hour * 60 + min;

  // 07:30 - 15:30 -> 450 to 930
  if (timeVal >= 450 && timeVal < 930) return 'AM';
  // 15:30 - 22:30 -> 930 to 1350
  if (timeVal >= 930 && timeVal < 1350) return 'PM';
  // 22:30 - 07:30 -> NT
  return 'NT';
}
