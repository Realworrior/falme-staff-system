import { addDays, startOfMonth, endOfMonth, format, isSameDay } from 'date-fns';

export type ShiftType = 'AM' | 'PM' | 'NT' | 'OFF';

export interface StaffMember {
  name: string;
  type: 'NT_ROTATION' | 'AM_ROTATION';
  cycleOffset: number; // Days offset from the base cycle start
}

export interface Shift {
  date: Date;
  staff: string;
  type: ShiftType;
}

export interface DailySchedule {
  date: Date;
  shifts: {
    AM: string[];
    PM: string[];
    NT: string[];
  };
}

// Balanced 18-day cycle pattern (5 AM, 5 PM, 2 NT, 6 OFF)
export const CYCLE_18: ShiftType[] = [
  'AM', 'AM', 'PM', 'PM', 'NT', 'OFF', 'OFF', 'AM', 'OFF', // Part 1: 3 AM, 2 PM
  'AM', 'AM', 'PM', 'PM', 'NT', 'OFF', 'OFF', 'PM', 'OFF'  // Part 2: 2 AM, 3 PM
];

// Staff configuration with balanced offsets for the 18-day cycle
export const STAFF_CONFIG: StaffMember[] = [
  { name: 'Ascar', type: 'NT_ROTATION', cycleOffset: 0 },
  { name: 'Chris', type: 'NT_ROTATION', cycleOffset: 2 },
  { name: 'Faye', type: 'NT_ROTATION', cycleOffset: 4 },
  { name: 'Joyce', type: 'NT_ROTATION', cycleOffset: 6 },
  { name: 'Linda', type: 'AM_ROTATION', cycleOffset: 8 },
  { name: 'Nickson', type: 'AM_ROTATION', cycleOffset: 10 },
  { name: 'Pauline', type: 'NT_ROTATION', cycleOffset: 12 },
  { name: 'Sylvia', type: 'NT_ROTATION', cycleOffset: 14 },
  { name: 'Terry', type: 'NT_ROTATION', cycleOffset: 16 },
].sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));

// Color mapping for each staff member
export type PersonColor = { bg: string; text: string; bar: string };

export const STAFF_THEME: Record<string, PersonColor> = {
  Ascar:   { bg: "#3d7ee6", text: "#ffffff", bar: "#2f68cc" },
  Chris:   { bg: "#c88428", text: "#ffffff", bar: "#a86e1e" },
  Faye:    { bg: "#c84a76", text: "#ffffff", bar: "#aa3860" },
  Joyce:   { bg: "#28a87c", text: "#ffffff", bar: "#1e8e66" },
  Linda:   { bg: "#c8a020", text: "#ffffff", bar: "#a88218" },
  Nickson: { bg: "#7a56d4", text: "#ffffff", bar: "#6244b8" },
  Pauline: { bg: "#cc4040", text: "#ffffff", bar: "#aa3030" },
  Sylvia:  { bg: "#1ea8cc", text: "#ffffff", bar: "#168caa" },
  Terry:   { bg: "#cc6424", text: "#ffffff", bar: "#aa5018" },
};

export const STAFF_COLORS: Record<string, string> = {
  'Ascar': STAFF_THEME.Ascar.bg,
  'Faye': STAFF_THEME.Faye.bg,
  'Joyce': STAFF_THEME.Joyce.bg,
  'Chris': STAFF_THEME.Chris.bg,
  'Terry': STAFF_THEME.Terry.bg,
  'Pauline': STAFF_THEME.Pauline.bg,
  'Sylvia': STAFF_THEME.Sylvia.bg,
  'Linda': STAFF_THEME.Linda.bg,
  'Nickson': STAFF_THEME.Nickson.bg,
};

// Generate shift for a specific staff member on a specific date
export function getStaffShift(staff: StaffMember, date: Date, baseDate: Date): Shift {
  const daysSinceBase = Math.round((date.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24));
  // Use the balanced 18-day cycle for everyone
  const pos = (daysSinceBase + staff.cycleOffset) % 18;
  const type = CYCLE_18[pos];

  return {
    date,
    staff: staff.name,
    type,
  };
}

// Generate full schedule for a month with optional overrides
export function generateMonthSchedule(year: number, month: number, overrides: Record<string, Record<string, ShiftType>> = {}): DailySchedule[] {
  const baseDate = new Date(2026, 0, 1); // Reference date for cycle calculation
  const monthStart = startOfMonth(new Date(year, month));
  const monthEnd = endOfMonth(new Date(year, month));

  const schedule: DailySchedule[] = [];

  for (let date = monthStart; date <= monthEnd; date = addDays(date, 1)) {
    const dateKey = format(date, 'yyyy-MM-dd');
    const dayOverrides = overrides[dateKey] || {};
    
    const dailyShifts: DailySchedule = {
      date: new Date(date),
      shifts: { AM: [], PM: [], NT: [] },
    };

    STAFF_CONFIG.forEach(staff => {
      // Use override if exists (case-insensitive), otherwise generate algorithmically
      const staffOverrideKey = Object.keys(dayOverrides).find(
        k => k.toLowerCase() === staff.name.toLowerCase()
      );
      const shiftType = (staffOverrideKey ? dayOverrides[staffOverrideKey] : undefined) || getStaffShift(staff, date, baseDate).type;
      
      if (shiftType !== 'OFF' && (shiftType === 'AM' || shiftType === 'PM' || shiftType === 'NT')) {
        dailyShifts.shifts[shiftType].push(staff.name);
      }
    });

    schedule.push(dailyShifts);
  }

  return schedule;
}

// Get current shift type based on hour of day
export function getCurrentShiftType(): ShiftType {
  const now = new Date();
  const hour = now.getHours();
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();
  const timeValue = hour + minutes / 60 + seconds / 3600;

  // AM: 07:30 - 15:30 (15.5)
  if (timeValue >= 7.5 && timeValue < 15.5) return 'AM';
  // PM: 15:30 - 22:30 (22.5)
  if (timeValue >= 15.5 && timeValue < 22.5) return 'PM';
  // NT: 22:30 - 07:30
  return 'NT';
}

// Calculate analytics for the month with overrides
export function calculateMonthlyAnalytics(year: number, month: number, overrides: Record<string, Record<string, ShiftType>> = {}): MonthlyAnalytics {
  const schedule = generateMonthSchedule(year, month, overrides);

  // Calculate staff stats
  const staffStats = STAFF_CONFIG.map(staff => {
    const baseDate = new Date(2026, 0, 1);
    const monthStart = startOfMonth(new Date(year, month));
    const monthEnd = endOfMonth(new Date(year, month));
    
    let total = 0, am = 0, pm = 0, nt = 0;
    
    for (let date = monthStart; date <= monthEnd; date = addDays(date, 1)) {
      const dateKey = format(date, 'yyyy-MM-dd');
      const dayOverrides = overrides[dateKey] || {};
      const staffOverrideKey = Object.keys(dayOverrides).find(
        k => k.toLowerCase() === staff.name.toLowerCase()
      );
      const type = (staffOverrideKey ? dayOverrides[staffOverrideKey] : undefined)
        || getStaffShift(staff, date, baseDate).type;
        
      if (type === 'AM') { am++; total++; }
      else if (type === 'PM') { pm++; total++; }
      else if (type === 'NT') { nt++; total++; }
    }

    return {
      name: staff.name,
      totalShifts: total,
      amShifts: am,
      pmShifts: pm,
      ntShifts: nt,
    };
  });

  // Calculate daily metrics
  const dailyMetrics = schedule.map(day => ({
    date: day.date,
    amCount: day.shifts.AM.length,
    pmCount: day.shifts.PM.length,
    ntCount: day.shifts.NT.length,
  }));

  return { staffStats, dailyMetrics };
}
