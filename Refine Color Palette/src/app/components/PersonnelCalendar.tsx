import { useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type ShiftData = {
  am: string[];
  pm: string[];
  nt: string;
};

type PersonColor = { bg: string; text: string; bar: string };

// ─── Colour palette ───────────────────────────────────────────────────────────

const COLORS: Record<string, PersonColor> = {
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

const DEFAULT_COLOR: PersonColor = { bg: "#334466", text: "#aabbcc", bar: "#2a3a55" };
function getColor(name: string): PersonColor {
  return COLORS[name] ?? DEFAULT_COLOR;
}

// ─── Schedule data ────────────────────────────────────────────────────────────

const SCHEDULE: Record<number, ShiftData> = {
  1:  { am: ["Linda", "Pauline"],              pm: ["Chris", "Nickson"],              nt: "Faye"    },
  2:  { am: ["Ascar", "Pauline"],              pm: ["Chris", "Linda", "Sylvia"],      nt: "Nickson" },
  3:  { am: ["Ascar", "Joyce", "Terry"],       pm: ["Chris", "Sylvia"],               nt: "Pauline" },
  4:  { am: ["Joyce", "Terry"],                pm: ["Ascar", "Faye"],                 nt: "Sylvia"  },
  5:  { am: ["Joyce", "Terry", "Linda"],       pm: ["Ascar"],                         nt: "Nickson" },
  6:  { am: ["Chris", "Faye", "Joyce"],        pm: ["Faye", "Linda", "Pauline"],      nt: "Ascar"   },
  7:  { am: ["Chris", "Faye"],                 pm: ["Linda", "Sylvia", "Pauline"],    nt: "Terry"   },
  8:  { am: ["Chris", "Sylvia"],               pm: ["Linda", "Nickson", "Pauline"],   nt: "Faye"    },
  9:  { am: ["Chris", "Sylvia"],               pm: ["Linda", "Nickson"],              nt: "Linda"   },
  10: { am: ["Chris", "Joyce"],                pm: ["Ascar", "Nickson", "Pauline"],   nt: "Chris"   },
  11: { am: ["Faye", "Ascar"],                 pm: ["Ascar", "Joyce"],                nt: "Sylvia"  },
  12: { am: ["Faye", "Linda", "Nickson"],      pm: ["Ascar", "Terry"],                nt: "Joyce"   },
  13: { am: ["Linda", "Nickson", "Pauline"],   pm: ["Chris", "Faye"],                 nt: "Ascar"   },
  14: { am: ["Nickson", "Pauline"],            pm: ["Chris", "Faye", "Sylvia"],       nt: "Terry"   },
  15: { am: ["Nickson", "Pauline"],            pm: ["Joyce", "Chris", "Sylvia"],      nt: "Faye"    },
  16: { am: ["Ascar", "Joyce"],                pm: ["Chris", "Pauline", "Sylvia"],    nt: "Pauline" },
  17: { am: ["Ascar", "Joyce"],                pm: ["Chris", "Nickson", "Sylvia"],    nt: ""        },
  18: { am: ["Faye", "Joyce", "Terry"],        pm: ["Ascar", "Sylvia"],               nt: "Chris"   },
  19: { am: ["Ascar", "Linda", "Pauline"],     pm: ["Nickson", "Terry"],              nt: "Joyce"   },
  20: { am: ["Chris", "Nickson"],              pm: ["Linda", "Terry"],                nt: "Ascar"   },
  21: { am: ["Chris", "Faye", "Sylvia"],       pm: ["Linda", "Nickson", "Pauline"],   nt: "Terry"   },
  22: { am: ["Chris", "Sylvia"],               pm: ["Joyce", "Linda", "Nickson"],     nt: "Pauline" },
  23: { am: ["Ascar", "Chris"],                pm: ["Joyce", "Linda", "Sylvia"],      nt: "Linda"   },
  24: { am: ["Ascar", "Faye", "Terry"],        pm: ["Joyce", "Nickson"],              nt: "Chris"   },
  25: { am: ["Pauline", "Ascar"],              pm: ["Faye", "Joyce", "Terry"],        nt: "Sylvia"  },
  26: { am: ["Linda", "Ascar"],                pm: ["Nickson", "Terry"],              nt: ""        },
  27: { am: ["Chris", "Nickson"],              pm: ["Faye", "Sylvia", "Terry"],       nt: ""        },
  28: { am: ["Linda", "Sylvia"],               pm: ["Faye", "Joyce", "Terry"],        nt: "Chris"   },
  29: { am: ["Joyce", "Nickson"],              pm: ["Linda", "Ascar", "Sylvia"],      nt: ""        },
  30: { am: ["Ascar", "Joyce"],                pm: ["Linda", "Pauline", "Sylvia"],    nt: ""        },
};

const DOW_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const START_DOW  = 3;   // April 2026 starts on Wednesday
const TOTAL_DAYS = 30;
const TODAY      = 21;

// ─── Shared pill ─────────────────────────────────────────────────────────────

function Pill({ name, size = "sm" }: { name: string; size?: "xs" | "sm" | "md" }) {
  const c = getColor(name);
  const styles: Record<string, React.CSSProperties> = {
    xs: { fontSize: "9px",  padding: "1px 5px",  borderRadius: 99 },
    sm: { fontSize: "11px", padding: "2px 7px",  borderRadius: 99 },
    md: { fontSize: "12px", padding: "3px 10px", borderRadius: 99 },
  };
  return (
    <span style={{ ...styles[size], backgroundColor: c.bg, color: c.text, fontWeight: 600, whiteSpace: "nowrap", display: "inline-block" }}>
      {name}
    </span>
  );
}

// ─── Grid card (desktop) ──────────────────────────────────────────────────────

function GridCard({ day, data, isToday }: { day: number; data: ShiftData; isToday: boolean }) {
  const ntColor = data.nt ? getColor(data.nt) : null;

  return (
    <div
      className="flex flex-col h-full rounded-xl overflow-hidden"
      style={{
        backgroundColor: "#131c31",
        border: isToday ? "1.5px solid #4080e8" : "1px solid rgba(255,255,255,0.07)",
        boxShadow: isToday ? "0 0 0 3px rgba(64,128,232,0.13), 0 4px 16px rgba(0,0,0,0.35)" : "0 2px 8px rgba(0,0,0,0.22)",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-2 pt-1.5 pb-1 shrink-0">
        <div className="flex items-baseline gap-1">
          <span style={{ fontSize: 13, color: isToday ? "#4080e8" : "#c8d4e8", fontWeight: isToday ? 700 : 600 }}>
            {day}
          </span>
          {isToday && (
            <span style={{ fontSize: 8, color: "#4080e8", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>
              Today
            </span>
          )}
        </div>
        <div style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: ntColor ? ntColor.bg : "rgba(255,255,255,0.1)", boxShadow: ntColor ? `0 0 4px ${ntColor.bg}90` : "none" }} />
      </div>

      {/* AM / PM */}
      <div className="flex flex-1 gap-px px-1.5 pb-1 min-h-0">
        <div className="flex-1 flex flex-col gap-0.5 min-w-0 overflow-hidden">
          <span style={{ fontSize: 8, color: "#5c7a9e", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>AM</span>
          <div className="flex flex-wrap gap-[2px]">
            {data.am.map((n) => <Pill key={n} name={n} size="xs" />)}
          </div>
        </div>
        <div style={{ width: 1, backgroundColor: "rgba(255,255,255,0.06)", alignSelf: "stretch", margin: "0 2px" }} />
        <div className="flex-1 flex flex-col gap-0.5 min-w-0 overflow-hidden">
          <span style={{ fontSize: 8, color: "#5c7a9e", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>PM</span>
          <div className="flex flex-wrap gap-[2px]">
            {data.pm.map((n) => <Pill key={n} name={n} size="xs" />)}
          </div>
        </div>
      </div>

      {/* NT bar — always same height */}
      <div className="shrink-0 mt-auto">
        <div style={{ height: 1, backgroundColor: "rgba(255,255,255,0.06)" }} />
        {data.nt ? (
          <div className="flex items-center justify-between px-2 py-[4px]" style={{ backgroundColor: ntColor!.bar }}>
            <span style={{ fontSize: 8, color: "rgba(255,255,255,0.6)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>NT</span>
            <span style={{ fontSize: 10, color: "#fff", fontWeight: 600 }}>{data.nt}</span>
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

// ─── Mobile list card ─────────────────────────────────────────────────────────

function MobileCard({ day, data, isToday }: { day: number; data: ShiftData; isToday: boolean }) {
  const ntColor = data.nt ? getColor(data.nt) : null;
  const date = new Date(2026, 3, day);
  const dowLabel = DOW_SHORT[date.getDay()];

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        backgroundColor: "#131c31",
        border: isToday ? "1.5px solid #4080e8" : "1px solid rgba(255,255,255,0.08)",
        boxShadow: isToday ? "0 0 0 3px rgba(64,128,232,0.14)" : "0 2px 10px rgba(0,0,0,0.28)",
      }}
    >
      <div className="flex">
        {/* Date column */}
        <div
          className="flex flex-col items-center justify-center shrink-0"
          style={{
            width: 60,
            padding: "12px 0",
            backgroundColor: isToday ? "rgba(64,128,232,0.12)" : "rgba(255,255,255,0.025)",
            borderRight: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <span style={{ fontSize: 26, lineHeight: 1, color: isToday ? "#4080e8" : "#c8d4e8", fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
            {day}
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
              style={{ fontSize: 9, color: "#5c7a9e", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", paddingTop: 3, width: 16 }}
            >
              AM
            </span>
            <div className="flex flex-wrap gap-1.5 flex-1">
              {data.am.map((n) => <Pill key={n} name={n} size="md" />)}
            </div>
          </div>
          {/* PM row */}
          <div className="flex items-start gap-2 px-3 py-2">
            <span
              className="shrink-0"
              style={{ fontSize: 9, color: "#5c7a9e", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", paddingTop: 3, width: 16 }}
            >
              PM
            </span>
            <div className="flex flex-wrap gap-1.5 flex-1">
              {data.pm.map((n) => <Pill key={n} name={n} size="md" />)}
            </div>
          </div>
        </div>
      </div>

      {/* NT strip */}
      {data.nt ? (
        <div
          className="flex items-center gap-2 px-4 py-2"
          style={{ backgroundColor: ntColor!.bar, borderTop: "1px solid rgba(0,0,0,0.15)" }}
        >
          <span style={{ fontSize: 9, color: "rgba(255,255,255,0.6)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.14em" }}>Night</span>
          <span style={{ fontSize: 13, color: "#fff", fontWeight: 600 }}>{data.nt}</span>
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

// ─── Legend ───────────────────────────────────────────────────────────────────

function Legend() {
  return (
    <div className="flex flex-wrap gap-x-3 gap-y-1.5">
      {Object.entries(COLORS).map(([name, c]) => (
        <div key={name} className="flex items-center gap-1.5">
          <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: c.bg, flexShrink: 0 }} />
          <span style={{ fontSize: 11, color: "#8faac8", fontWeight: 500 }}>{name}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Shift key ────────────────────────────────────────────────────────────────

function ShiftKey() {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
      {[
        { label: "AM", time: "07:00–15:00", color: "#3d7ee6" },
        { label: "PM", time: "15:00–23:00", color: "#28a87c" },
        { label: "NT", time: "23:00–07:00", color: "#7a56d4" },
      ].map((s) => (
        <div key={s.label} className="flex items-center gap-1.5">
          <div style={{ width: 3, height: 12, borderRadius: 99, backgroundColor: s.color, flexShrink: 0 }} />
          <span style={{ fontSize: 10, color: "#8faac8", fontWeight: 600 }}>{s.label}</span>
          <span style={{ fontSize: 9, color: "#3d5070" }}>{s.time}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function PersonnelCalendar() {
  const [desktopView, setDesktopView] = useState<"grid" | "list">("grid");

  const cells: (number | null)[] = [
    ...Array(START_DOW).fill(null),
    ...Array.from({ length: TOTAL_DAYS }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const days = Array.from({ length: TOTAL_DAYS }, (_, i) => i + 1);

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: "#0c1220", fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      {/* ── Top bar ── */}
      <div
        className="flex items-center justify-between px-4 py-3 shrink-0"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.07)", backgroundColor: "#0a101e" }}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="rounded-lg flex items-center justify-center shrink-0" style={{ width: 28, height: 28, backgroundColor: "#4080e8" }}>
            <svg width="15" height="15" viewBox="0 0 14 14" fill="none">
              <rect x="1" y="3" width="12" height="10" rx="1.5" stroke="white" strokeWidth="1.2" />
              <path d="M1 6h12" stroke="white" strokeWidth="1.2" />
              <path d="M4 1v2M10 1v2" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 11, color: "#8faac8", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", lineHeight: 1 }}>Personnel</div>
            <div style={{ fontSize: 9, color: "#4d6080", fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", lineHeight: 1.4 }}>Assignment View</div>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <span style={{ fontSize: 13, color: "#c8d4e8", fontWeight: 600 }}>April 2026</span>

          {/* Grid/List toggle — only visible on md+ where grid actually shows */}
          <div
            className="hidden md:flex rounded-lg overflow-hidden"
            style={{ border: "1px solid rgba(255,255,255,0.1)" }}
          >
            {(["grid", "list"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setDesktopView(v)}
                style={{
                  fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
                  padding: "4px 12px",
                  color: desktopView === v ? "#fff" : "#5c7a9e",
                  backgroundColor: desktopView === v ? "#4080e8" : "transparent",
                  cursor: "pointer", border: "none",
                }}
              >
                {v === "grid" ? "Grid" : "List"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Info strips ── */}
      <div
        className="px-4 py-2 shrink-0"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", backgroundColor: "#0c1220" }}
      >
        <Legend />
      </div>
      <div
        className="px-4 py-2 shrink-0"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", backgroundColor: "#0a101e" }}
      >
        <ShiftKey />
      </div>

      {/* ── Content ── */}
      <div className="flex-1 overflow-y-auto">

        {/* ════════════════════════════════════════════════
            MOBILE: always list view, hidden on md+
            ════════════════════════════════════════════════ */}
        <div className="md:hidden px-3 pt-3 pb-6 flex flex-col gap-2.5">
          {days.map((day) => (
            <MobileCard key={day} day={day} data={SCHEDULE[day]} isToday={day === TODAY} />
          ))}
        </div>

        {/* ════════════════════════════════════════════════
            DESKTOP: grid or list, hidden on mobile
            ════════════════════════════════════════════════ */}
        <div className="hidden md:block">

          {/* Grid view */}
          {desktopView === "grid" && (
            <div className="p-3 lg:p-4">
              {/* Day-of-week headers */}
              <div className="grid grid-cols-7 gap-2 mb-2">
                {DOW_SHORT.map((d, i) => (
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

              {/* Single unified grid — gridAutoRows: 1fr ensures every row is equal height */}
              <div className="grid grid-cols-7 gap-2" style={{ gridAutoRows: "1fr" }}>
                {cells.map((day, idx) =>
                  !day ? (
                    <div
                      key={`e-${idx}`}
                      className="rounded-xl"
                      style={{ backgroundColor: "rgba(255,255,255,0.012)", border: "1px solid rgba(255,255,255,0.03)" }}
                    />
                  ) : (
                    <GridCard key={day} day={day} data={SCHEDULE[day]} isToday={day === TODAY} />
                  )
                )}
              </div>
            </div>
          )}

          {/* List view (desktop) */}
          {desktopView === "list" && (
            <div className="px-6 py-4 flex flex-col gap-2.5 max-w-3xl mx-auto w-full">
              {days.map((day) => (
                <MobileCard key={day} day={day} data={SCHEDULE[day]} isToday={day === TODAY} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
