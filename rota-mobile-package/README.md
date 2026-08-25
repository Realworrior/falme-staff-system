# Falme Mobile Rota System 📅🚀

A **100% self-contained, portable, zero-crash Shift & Rota Management module** designed specifically for mobile and web applications (React Native Web, Capacitor, Next.js, Vite React).

---

## 🌟 What is Included in this Package?

1. **Deterministic 18-Day Rotation Engine**:
   - Generates perfectly balanced AM (07:30–15:30), PM (15:30–22:30), and Night (22:30–07:30) shifts with zero unfair overlap.
   - Built-in staff roster for **Betfalme** and **SofaSafi** branches.
2. **Responsive Mobile-First UI**:
   - `RotaScreen`: Master responsive screen with month navigation, branch switching, staff filter pills, and quick exports.
   - `ScheduleCalendar`: Mobile vertical card feed + desktop 7-column calendar view.
   - `ShiftMates`: Tap any day to see who's on shift with live override controls.
   - `TransportDashboard`: Shift allowance calculator for night and afternoon shifts with custom date filtering and rate editors.
   - `AnalyticsDashboard`: Shift distribution breakdown per staff member.
3. **Data Portability & Offline Persistence**:
   - LocalStorage fallback included out of the box — **works immediately without needing Supabase or any backend server**.
   - Optional Supabase sync adapter built into `RotaProvider`.
4. **Phone Calendar & CSV Export**:
   - Generates cross-platform `.ics` calendar files with automatic 1-hour alarm notifications and Apple/Google calendar color highlights.
   - 1-click Matrix CSV download.

---

## 📦 Staff Roster & Branch Configuration

### 🏢 Betfalme Branch
| Staff Member | Cycle Offset | Role / Shift Rotation | Transport Rate (KSh) | Color |
| :--- | :---: | :--- | :---: | :--- |
| **Ascar** | 0 | NT Rotation | 350 | Blue (`#3d7ee6`) |
| **Chris** | 2 | NT Rotation | 400 | Amber (`#c88428`) |
| **Faye** | 4 | NT Rotation | 300 | Pink (`#c84a76`) |
| **Joyce** | 6 | NT Rotation | 450 | Green (`#28a87c`) |
| **Linda** | 8 | AM Rotation | 350 | Gold (`#c8a020`) |
| **Nickson** | 10 | AM Rotation | 400 | Purple (`#7a56d4`) |
| **Pauline** | 12 | NT Rotation | 300 | Red (`#cc4040`) |
| **Sylvia** | 14 | NT Rotation | 450 | Cyan (`#1ea8cc`) |
| **Terry** | 16 | NT Rotation | 400 | Orange (`#cc6424`) |

### 🛋️ SofaSafi Branch
| Staff Member | Cycle Offset | Role / Shift Rotation | Transport Rate (KSh) | Color |
| :--- | :---: | :--- | :---: | :--- |
| **Mary** | 0 | NT Rotation | 350 | Blue (`#3d7ee6`) |
| **Joan** | 2 | NT Rotation | 400 | Amber (`#c88428`) |
| **Ian K** | 4 | NT Rotation | 300 | Pink (`#c84a76`) |
| **Jonathan** | 6 | NT Rotation | 450 | Green (`#28a87c`) |
| **Fabrice** | 8 | AM Rotation | 350 | Gold (`#c8a020`) |
| **Ian R** | 10 | AM Rotation | 400 | Purple (`#7a56d4`) |
| **Kelvin** | 12 | NT Rotation | 300 | Red (`#cc4040`) |
| **Shellah** | 14 | NT Rotation | 450 | Cyan (`#1ea8cc`) |
| **Colins** | 16 | NT Rotation | 400 | Orange (`#cc6424`) |

---

## 🚀 Quick Integration Guide

### 1. Install Dependencies in your Mobile App Project
```bash
npm install date-fns lucide-react papaparse framer-motion
```

### 2. Render RotaScreen in your App
```jsx
import React from 'react';
import { RotaProvider, ToastProvider, RotaScreen } from './rota-mobile-package/src';

export default function MobileApp() {
  return (
    <ToastProvider>
      {/* If using Supabase, pass supabaseClient={supabase}, or omit to use local storage */}
      <RotaProvider>
        <RotaScreen />
      </RotaProvider>
    </ToastProvider>
  );
}
```

### 3. Or use individual components / hooks
```jsx
import { useRota, generateMonthSchedule } from './rota-mobile-package/src';

function MyCustomShiftView() {
  const { schedule, activeBranch, selectedStaff, setSelectedStaff } = useRota();

  return (
    <div>
      <h2>Active Schedule for {activeBranch}</h2>
      {schedule.map(day => (
        <div key={day.date}>
          <span>{day.date.toDateString()}</span>
          <span>AM: {day.shifts.AM.join(', ')}</span>
        </div>
      ))}
    </div>
  );
}
```

---

## 🛡️ Passcodes for Manager Mode
- `admin`
- `manager123`
- `1234`
