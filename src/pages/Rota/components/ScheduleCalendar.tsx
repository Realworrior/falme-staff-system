import React, { useState, useEffect } from 'react';
import { format, getDay } from 'date-fns';
import { STAFF_THEME } from '../utils/scheduleGenerator';

interface ScheduleCalendarProps {
  schedule: any[];
  selectedStaff: string | null;
  onDayClick: (date: Date) => void;
  overrides?: Record<string, Record<string, string>>;
  desktopView?: "grid" | "list";
}

const DEFAULT_COLOR = { bg: "#334466", text: "#aabbcc", bar: "#2a3a55" };
function getColor(name: string) {
  return STAFF_THEME[name] ?? DEFAULT_COLOR;
}

function Pill({ name, size = "sm" }: { name: string; size?: "xs" | "sm" | "md" | "lg" }) {
  const c = getColor(name);
  const styles: Record<string, React.CSSProperties> = {
    xs: { fontSize: "10px", padding: "1px 6px",  borderRadius: 99 },
    sm: { fontSize: "11px", padding: "2.5px 8px",  borderRadius: 99 },
    md: { fontSize: "12px", padding: "3px 10px", borderRadius: 99 },
    lg: { fontSize: "13px", padding: "4px 12px", borderRadius: 99 },
  };
  return (
    <span style={{ ...styles[size], backgroundColor: c.bg, color: c.text, fontWeight: 700, whiteSpace: "nowrap", display: "inline-block" }}>
      {name}
    </span>
  );
}

function GridCard({ day, data, isToday, scheduleDate, onClick, hasSelectedStaff, dimmed, overrideActive }: any) {
  // If NT has multiple people, we just use the first for the bar color, or show all
  const ntStaff = data.NT.length > 0 ? data.NT[0] : null;
  const ntColor = ntStaff ? getColor(ntStaff) : null;
  const dayStr = format(scheduleDate, 'd');

  return (
    <div
      onClick={onClick}
      className={`flex flex-col h-full rounded-xl overflow-hidden cursor-pointer transition-all ${dimmed ? 'opacity-30' : 'opacity-100'} hover:scale-[1.02]`}
      style={{
        backgroundColor: "#131c31",
        border: isToday ? "1.5px solid #4080e8" : (hasSelectedStaff ? "1px solid rgba(255,255,255,0.2)" : "1px solid rgba(255,255,255,0.07)"),
        boxShadow: isToday ? "0 0 0 3px rgba(64,128,232,0.13), 0 4px 16px rgba(0,0,0,0.35)" : "0 2px 8px rgba(0,0,0,0.22)",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-2 pt-1.5 pb-1 shrink-0">
        <div className="flex items-baseline gap-1">
          <span style={{ fontSize: 13, color: isToday ? "#4080e8" : "#c8d4e8", fontWeight: isToday ? 700 : 600 }}>
            {dayStr}
          </span>
          {isToday && (
            <span style={{ fontSize: 8, color: "#4080e8", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>
              Today
            </span>
          )}
          {overrideActive && (
            <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)] ml-1" title="Manual Override Active" />
          )}
        </div>
        <div style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: ntColor ? ntColor.bg : "rgba(255,255,255,0.1)", boxShadow: ntColor ? `0 0 4px ${ntColor.bg}90` : "none" }} />
      </div>

      {/* AM / PM */}
      <div className="flex flex-1 gap-px px-1.5 pb-1 min-h-0">
        <div className="flex-1 flex flex-col gap-1 min-w-0 overflow-hidden">
          <span style={{ fontSize: 9, color: "#3d7ee6", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em" }}>AM</span>
          <div className="flex flex-wrap gap-[3px]">
            {data.AM.map((n: string) => <Pill key={n} name={n} size="sm" />)}
          </div>
        </div>
        <div style={{ width: 1.5, backgroundColor: "rgba(255,255,255,0.2)", alignSelf: "stretch", margin: "0 4px" }} />
        <div className="flex-1 flex flex-col gap-1 min-w-0 overflow-hidden">
          <span style={{ fontSize: 9, color: "#28a87c", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em" }}>PM</span>
          <div className="flex flex-wrap gap-[3px]">
            {data.PM.map((n: string) => <Pill key={n} name={n} size="sm" />)}
          </div>
        </div>
      </div>

      {/* NT bar — always same height */}
      <div className="shrink-0 mt-auto">
        <div style={{ height: 1, backgroundColor: "rgba(255,255,255,0.1)" }} />
        {data.NT.length > 0 ? (
          <div className="flex items-center gap-2 px-2 py-[5px]" style={{ backgroundColor: ntColor!.bar }}>
            <span style={{ fontSize: 9, color: "rgba(255,255,255,0.8)", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em" }}>NT</span>
            <span style={{ fontSize: 12, color: "#fff", fontWeight: 700 }}>{data.NT.join(', ')}</span>
          </div>
        ) : (
          <div className="flex items-center px-2 py-[4px]" style={{ backgroundColor: "rgba(255,255,255,0.02)" }}>
            <span style={{ fontSize: 8, color: "rgba(255,255,255,0.12)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>—</span>
          </div>
        )}
      </div>
    </div>
  );
}

function MobileCard({ day, data, isToday, scheduleDate, onClick, hasSelectedStaff, dimmed, overrideActive }: any) {
  const ntStaff = data.NT.length > 0 ? data.NT[0] : null;
  const ntColor = ntStaff ? getColor(ntStaff) : null;
  const dowLabel = format(scheduleDate, 'EEE');
  const dayStr = format(scheduleDate, 'd');

  return (
    <div
      onClick={onClick}
      className={`rounded-2xl overflow-hidden cursor-pointer transition-all ${dimmed ? 'opacity-30' : 'opacity-100'} hover:scale-[1.01]`}
      style={{
        backgroundColor: "#131c31",
        border: isToday ? "1.5px solid #4080e8" : (hasSelectedStaff ? "1px solid rgba(255,255,255,0.2)" : "1px solid rgba(255,255,255,0.08)"),
        boxShadow: isToday ? "0 0 0 3px rgba(64,128,232,0.14)" : "0 2px 10px rgba(0,0,0,0.28)",
      }}
    >
      <div className="flex">
        {/* Date column */}
        <div
          className="flex flex-col items-center justify-center shrink-0 relative"
          style={{
            width: 60,
            padding: "12px 0",
            backgroundColor: isToday ? "rgba(64,128,232,0.12)" : "rgba(255,255,255,0.025)",
            borderRight: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          {overrideActive && (
            <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" title="Manual Override Active" />
          )}
          <span style={{ fontSize: 26, lineHeight: 1, color: isToday ? "#4080e8" : "#c8d4e8", fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
            {dayStr}
          </span>
          <span style={{ fontSize: 10, color: isToday ? "#4080e8" : "#5c7a9e", fontWeight: 600, marginTop: 2, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            {isToday ? "Today" : dowLabel}
          </span>
        </div>

        {/* Shifts */}
        <div className="flex-1 flex flex-col gap-0 min-w-0">
          {/* AM row */}
          <div
            className="flex items-start gap-2 px-3 py-2"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
          >
            <span
              className="shrink-0"
              style={{ fontSize: 10, color: "#3d7ee6", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.12em", paddingTop: 3, width: 20 }}
            >
              AM
            </span>
            <div className="flex flex-wrap gap-1.5 flex-1">
              {data.AM.map((n: string) => <Pill key={n} name={n} size="md" />)}
            </div>
          </div>
          {/* PM row */}
          <div className="flex items-start gap-2 px-3 py-2">
            <span
              className="shrink-0"
              style={{ fontSize: 10, color: "#28a87c", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.12em", paddingTop: 3, width: 20 }}
            >
              PM
            </span>
            <div className="flex flex-wrap gap-1.5 flex-1">
              {data.PM.map((n: string) => <Pill key={n} name={n} size="md" />)}
            </div>
          </div>
        </div>
      </div>

      {/* NT strip */}
      {data.NT.length > 0 ? (
        <div
          className="flex items-center gap-3 px-4 py-2.5"
          style={{ backgroundColor: ntColor!.bar, borderTop: "1px solid rgba(0,0,0,0.15)" }}
        >
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.8)", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.14em" }}>Night</span>
          <span style={{ fontSize: 14, color: "#fff", fontWeight: 700 }}>{data.NT.join(', ')}</span>
        </div>
      ) : (
        <div
          className="flex items-center gap-2 px-4 py-1.5"
          style={{ backgroundColor: "rgba(255,255,255,0.018)", borderTop: "1px solid rgba(255,255,255,0.04)" }}
        >
          <span style={{ fontSize: 9, color: "rgba(255,255,255,0.18)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.12em" }}>No night shift</span>
        </div>
      )}
    </div>
  );
}

export function ScheduleCalendar({ schedule, selectedStaff, onDayClick, overrides = {}, desktopView = "grid" }: ScheduleCalendarProps) {
  if (schedule.length === 0) return null;

  const firstDay = schedule[0].date;
  const startDay = getDay(firstDay); // 0=Sun

  // Pad the start with empty slots for grid view
  const calendarSlots: (any | null)[] = [
    ...Array(startDay).fill(null),
    ...schedule,
  ];

  const renderCard = (day: any, isMobileList: boolean) => {
    const isToday = format(day.date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
    const hasSelectedStaff = selectedStaff
      ? Object.values(day.shifts).some((arr: any) => arr.includes(selectedStaff))
      : false;

    // Filter shifts to only show the selected staff and their shift mates
    const filteredData = selectedStaff ? {
      AM: day.shifts.AM.includes(selectedStaff) ? day.shifts.AM : [],
      PM: day.shifts.PM.includes(selectedStaff) ? day.shifts.PM : [],
      NT: day.shifts.NT.includes(selectedStaff) ? day.shifts.NT : [],
    } : day.shifts;

    // Dim if someone is selected but they don't have a shift this day
    const dimmed = selectedStaff && !hasSelectedStaff;
    const overrideActive = Object.keys(overrides[format(day.date, 'yyyy-MM-dd')] || {}).length > 0;

    const props = {
      day: day, // we don't really rely on this explicitly if we pass date
      scheduleDate: day.date,
      data: filteredData,
      isToday,
      hasSelectedStaff,
      dimmed,
      overrideActive,
      onClick: () => onDayClick(day.date)
    };

    if (isMobileList) {
      return <MobileCard key={day.date.toISOString()} {...props} />;
    } else {
      return <GridCard key={day.date.toISOString()} {...props} />;
    }
  };

  return (
    <div className="w-full">
      {/* ════════════════════════════════════════════════
          MOBILE: always list view, hidden on md+
          ════════════════════════════════════════════════ */}
      <div className="md:hidden pt-2 flex flex-col gap-2.5">
        {schedule.map((day) => renderCard(day, true))}
      </div>

      {/* ════════════════════════════════════════════════
          DESKTOP: grid or list, hidden on mobile
          ════════════════════════════════════════════════ */}
      <div className="hidden md:block">
        {desktopView === "grid" && (
          <div>
            <div className="grid grid-cols-7 gap-2 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d, i) => (
                <div
                  key={d}
                  className="text-center py-1"
                  style={{
                    fontSize: 10,
                    color: (i === 0 || i === 6) ? "#3d5070" : "#4d6080",
                    fontWeight: 700,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                  }}
                >
                  {d}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2" style={{ gridAutoRows: "1fr" }}>
              {calendarSlots.map((day, idx) =>
                !day ? (
                  <div
                    key={`e-${idx}`}
                    className="rounded-xl"
                    style={{ backgroundColor: "rgba(255,255,255,0.012)", border: "1px solid rgba(255,255,255,0.03)" }}
                  />
                ) : (
                  renderCard(day, false)
                )
              )}
            </div>
          </div>
        )}

        {desktopView === "list" && (
          <div className="flex flex-col gap-2.5 w-full">
            {schedule.map((day) => renderCard(day, true))}
          </div>
        )}
      </div>
    </div>
  );
}
