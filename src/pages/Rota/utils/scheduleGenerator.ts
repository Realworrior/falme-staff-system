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
      // Use override if exists, otherwise generate algorithmically
      const shiftType = dayOverrides[staff.name] || getStaffShift(staff, date, baseDate).type;
      
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
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 14) return 'AM';
  if (hour >= 14 && hour < 22) return 'PM';
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
      const type = (overrides[dateKey] && overrides[dateKey][staff.name]) 
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
