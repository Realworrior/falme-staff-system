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

// Staff configuration based on the 7-day cycle pattern
export const STAFF_CONFIG: StaffMember[] = [
  // 7 NT rotation workers (4-day streak: AM·PM·PM·NT, then 3 days off)
  { name: 'Ascar', type: 'NT_ROTATION', cycleOffset: 0 },
  { name: 'Faye', type: 'NT_ROTATION', cycleOffset: 1 },
  { name: 'Joyce', type: 'NT_ROTATION', cycleOffset: 2 },
  { name: 'Chris', type: 'NT_ROTATION', cycleOffset: 3 },
  { name: 'Terry', type: 'NT_ROTATION', cycleOffset: 4 },
  { name: 'pauline', type: 'NT_ROTATION', cycleOffset: 5 },
  { name: 'Sylvia', type: 'NT_ROTATION', cycleOffset: 6 },

  // 2 AM rotation workers (5-day streak: AM·AM·AM·AM·AM, then 2 days off)
  { name: 'Linda', type: 'AM_ROTATION', cycleOffset: 0 }, // Mon-Fri
  { name: 'Nickson', type: 'AM_ROTATION', cycleOffset: 2 }, // Wed-Sun
];

// Color mapping for each staff member
export const STAFF_COLORS: Record<string, string> = {
  'Ascar': '#8B5CF6',     // Purple
  'Faye': '#EC4899',      // Pink
  'Joyce': '#10B981',     // Green
  'Chris': '#F59E0B',     // Amber
  'Terry': '#3B82F6',     // Blue
  'pauline': '#EF4444',   // Red
  'Sylvia': '#14B8A6',    // Teal
  'Linda': '#8B5A00',     // Brown
  'Nickson': '#6366F1',   // Indigo
};

// Get shift type for NT rotation worker on a specific day
function getNTRotationShift(dayInCycle: number): ShiftType {
  const pattern: ShiftType[] = ['AM', 'PM', 'PM', 'NT', 'OFF', 'OFF', 'OFF'];
  return pattern[dayInCycle % 7];
}

// Get shift type for AM rotation worker on a specific day
function getAMRotationShift(dayInCycle: number): ShiftType {
  const pattern: ShiftType[] = ['AM', 'AM', 'AM', 'AM', 'AM', 'OFF', 'OFF'];
  return pattern[dayInCycle % 7];
}

// Generate shift for a specific staff member on a specific date
export function getStaffShift(staff: StaffMember, date: Date, baseDate: Date): Shift {
  const daysSinceBase = Math.floor((date.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24));
  const dayInCycle = (daysSinceBase + staff.cycleOffset) % 7;

  const type = staff.type === 'NT_ROTATION'
    ? getNTRotationShift(dayInCycle)
    : getAMRotationShift(dayInCycle);

  return {
    date,
    staff: staff.name,
    type,
  };
}

// Generate full schedule for a month
export function generateMonthSchedule(year: number, month: number): DailySchedule[] {
  const baseDate = new Date(2026, 0, 1); // Reference date for cycle calculation
  const monthStart = startOfMonth(new Date(year, month));
  const monthEnd = endOfMonth(new Date(year, month));

  const schedule: DailySchedule[] = [];

  for (let date = monthStart; date <= monthEnd; date = addDays(date, 1)) {
    const dailyShifts: DailySchedule = {
      date: new Date(date),
      shifts: { AM: [], PM: [], NT: [] },
    };

    STAFF_CONFIG.forEach(staff => {
      const shift = getStaffShift(staff, date, baseDate);
      if (shift.type !== 'OFF') {
        dailyShifts.shifts[shift.type].push(staff.name);
      }
    });

    schedule.push(dailyShifts);
  }

  return schedule;
}

// Get all shifts for a specific staff member in a month
export function getStaffMonthSchedule(staffName: string, year: number, month: number): Shift[] {
  const staff = STAFF_CONFIG.find(s => s.name === staffName);
  if (!staff) return [];

  const baseDate = new Date(2026, 0, 1);
  const monthStart = startOfMonth(new Date(year, month));
  const monthEnd = endOfMonth(new Date(year, month));

  const shifts: Shift[] = [];

  for (let date = monthStart; date <= monthEnd; date = addDays(date, 1)) {
    shifts.push(getStaffShift(staff, date, baseDate));
  }

  return shifts;
}

// Calculate analytics for the month
export interface MonthlyAnalytics {
  staffStats: {
    name: string;
    totalShifts: number;
    amShifts: number;
    pmShifts: number;
    ntShifts: number;
  }[];
  dailyMetrics: {
    date: Date;
    amCount: number;
    pmCount: number;
    ntCount: number;
  }[];
}

export function calculateMonthlyAnalytics(year: number, month: number): MonthlyAnalytics {
  const schedule = generateMonthSchedule(year, month);

  // Calculate staff stats
  const staffStats = STAFF_CONFIG.map(staff => {
    const shifts = getStaffMonthSchedule(staff.name, year, month);
    return {
      name: staff.name,
      totalShifts: shifts.filter(s => s.type !== 'OFF').length,
      amShifts: shifts.filter(s => s.type === 'AM').length,
      pmShifts: shifts.filter(s => s.type === 'PM').length,
      ntShifts: shifts.filter(s => s.type === 'NT').length,
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
