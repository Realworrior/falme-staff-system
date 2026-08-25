export type ShiftType = 'AM' | 'PM' | 'NT' | 'OFF';

export interface PersonColor {
  bg: string;
  text: string;
  bar: string;
}

export interface StaffMember {
  name: string;
  type: 'NT_ROTATION' | 'AM_ROTATION';
  cycleOffset: number;
  transportRate?: number;
  color?: PersonColor;
}

export interface BranchConfig {
  id: string;
  name: string;
  staff: StaffMember[];
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

export interface StaffShiftStat {
  name: string;
  totalShifts: number;
  amShifts: number;
  pmShifts: number;
  ntShifts: number;
}

export interface DailyMetric {
  date: Date;
  amCount: number;
  pmCount: number;
  ntCount: number;
}

export interface MonthlyAnalytics {
  staffStats: StaffShiftStat[];
  dailyMetrics: DailyMetric[];
}

export type OverridesMap = Record<string, Record<string, ShiftType>>;

export interface TransportPaymentMilestone {
  id: string;
  date: string;
  amount: number;
  periodLabel: string;
  recipientCount: number;
  notes?: string;
}
