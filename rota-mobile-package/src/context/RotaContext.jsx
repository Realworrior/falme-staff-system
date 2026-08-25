import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { generateMonthSchedule, calculateMonthlyAnalytics, STAFF_CONFIG, SOFASAFI_STAFF_CONFIG } from '../utils/scheduleGenerator';
import { exportScheduleToCSV, downloadCSV } from '../utils/RotaExportUtility';
import { generateICSContent, downloadICSFile } from '../utils/icsGenerator';

const RotaContext = createContext(null);

export function RotaProvider({ children, supabaseClient = null }) {
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [activeBranch, setActiveBranch] = useState('betfalme');
  const [isManagerMode, setIsManagerMode] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [activeTab, setActiveTab] = useState('matrix'); // 'matrix', 'calendar', 'transport', 'analytics'
  
  // Overrides storage (keyed by date e.g. "2026-08-25" or "sofasafi_2026-08-25")
  const [overrides, setOverrides] = useState(() => {
    try {
      const saved = localStorage.getItem('falme_rota_overrides');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Transport configs (rates & history)
  const [transportConfigs, setTransportConfigs] = useState(() => {
    try {
      const saved = localStorage.getItem('falme_rota_transport');
      return saved ? JSON.parse(saved) : {
        betfalme: { rates: {}, history: [] },
        sofasafi: { rates: {}, history: [] }
      };
    } catch {
      return {
        betfalme: { rates: {}, history: [] },
        sofasafi: { rates: {}, history: [] }
      };
    }
  });

  // Persist overrides locally
  useEffect(() => {
    try {
      localStorage.setItem('falme_rota_overrides', JSON.stringify(overrides));
    } catch {}
  }, [overrides]);

  // Persist transport configs locally
  useEffect(() => {
    try {
      localStorage.setItem('falme_rota_transport', JSON.stringify(transportConfigs));
    } catch {}
  }, [transportConfigs]);

  // Optional Supabase Hydration
  useEffect(() => {
    if (!supabaseClient) return;

    const fetchSupabaseOverrides = async () => {
      try {
        const { data, error } = await supabaseClient.from('rota_overrides').select('*');
        if (error || !data) return;

        const map = {};
        data.forEach(item => {
          map[item.date || item.id] = item.shifts || item;
        });
        setOverrides(prev => ({ ...prev, ...map }));
      } catch (err) {
        console.warn('[Rota] Supabase sync fallback to local storage:', err);
      }
    };

    fetchSupabaseOverrides();
  }, [supabaseClient]);

  // Active Overrides filtered by branch
  const branchOverrides = useMemo(() => {
    const mapped = {};
    Object.entries(overrides).forEach(([key, val]) => {
      if (activeBranch === 'sofasafi') {
        if (key.startsWith('sofasafi_') && key !== 'sofasafi_config_transport') {
          const dateKey = key.replace('sofasafi_', '');
          mapped[dateKey] = val.shifts || val;
        }
      } else {
        if (!key.startsWith('sofasafi_') && key !== 'config_transport') {
          mapped[key] = val.shifts || val;
        }
      }
    });
    return mapped;
  }, [overrides, activeBranch]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Generated schedules
  const schedule = useMemo(() => {
    return generateMonthSchedule(year, month, branchOverrides, activeBranch);
  }, [year, month, branchOverrides, activeBranch]);

  // Analytics
  const analytics = useMemo(() => {
    return calculateMonthlyAnalytics(year, month, branchOverrides, activeBranch);
  }, [year, month, branchOverrides, activeBranch]);

  // Actions
  const updateShiftOverride = useCallback(async (dateStr, staffName, shiftType) => {
    const recordKey = activeBranch === 'sofasafi' ? `sofasafi_${dateStr}` : dateStr;
    
    setOverrides(prev => {
      const existingDay = prev[recordKey]?.shifts || prev[recordKey] || {};
      const updatedDay = { ...existingDay, [staffName]: shiftType };
      return {
        ...prev,
        [recordKey]: { date: recordKey, shifts: updatedDay }
      };
    });

    if (supabaseClient) {
      try {
        await supabaseClient.from('rota_overrides').upsert([{
          id: recordKey,
          date: recordKey,
          shifts: { [staffName]: shiftType }
        }]);
      } catch (err) {
        console.warn('[Rota] Supabase override push failed:', err);
      }
    }
  }, [activeBranch, supabaseClient]);

  const bulkImportOverrides = useCallback(async (importData, replaceAll = false) => {
    setOverrides(prev => {
      const next = replaceAll ? {} : { ...prev };
      Object.entries(importData).forEach(([dateKey, shifts]) => {
        const recordKey = activeBranch === 'sofasafi' ? `sofasafi_${dateKey}` : dateKey;
        next[recordKey] = { date: recordKey, shifts };
      });
      return next;
    });

    if (supabaseClient) {
      try {
        const records = Object.entries(importData).map(([dateKey, shifts]) => {
          const recordKey = activeBranch === 'sofasafi' ? `sofasafi_${dateKey}` : dateKey;
          return { id: recordKey, date: recordKey, shifts };
        });
        await supabaseClient.from('rota_overrides').upsert(records);
      } catch (err) {
        console.warn('[Rota] Supabase bulk import push failed:', err);
      }
    }
  }, [activeBranch, supabaseClient]);

  const saveTransportRates = useCallback((branch, rates) => {
    setTransportConfigs(prev => ({
      ...prev,
      [branch]: {
        ...prev[branch],
        rates: { ...(prev[branch]?.rates || {}), ...rates }
      }
    }));
  }, []);

  const recordTransportPayment = useCallback((branch, paymentRecord) => {
    setTransportConfigs(prev => ({
      ...prev,
      [branch]: {
        ...prev[branch],
        history: [paymentRecord, ...(prev[branch]?.history || [])].slice(0, 50)
      }
    }));
  }, []);

  const exportCSV = useCallback((filename) => {
    const content = exportScheduleToCSV(schedule, activeBranch);
    const fname = filename || `Rota_${activeBranch}_${year}_${month + 1}.csv`;
    downloadCSV(content, fname);
  }, [schedule, activeBranch, year, month]);

  const exportStaffICS = useCallback((staffName) => {
    if (!staffName) return;
    const content = generateICSContent(staffName, currentDate, schedule);
    const fname = `${staffName}_Rota_${year}_${month + 1}.ics`;
    downloadICSFile(content, fname);
  }, [currentDate, schedule, year, month]);

  const value = {
    currentDate,
    setCurrentDate,
    activeBranch,
    setActiveBranch,
    isManagerMode,
    setIsManagerMode,
    selectedStaff,
    setSelectedStaff,
    selectedDate,
    setSelectedDate,
    activeTab,
    setActiveTab,
    schedule,
    analytics,
    overrides: branchOverrides,
    transportConfig: transportConfigs[activeBranch] || { rates: {}, history: [] },
    allTransportConfigs: transportConfigs,
    updateShiftOverride,
    bulkImportOverrides,
    saveTransportRates,
    recordTransportPayment,
    exportCSV,
    exportStaffICS,
    staffList: activeBranch === 'sofasafi' ? SOFASAFI_STAFF_CONFIG : STAFF_CONFIG
  };

  return (
    <RotaContext.Provider value={value}>
      {children}
    </RotaContext.Provider>
  );
}

export function useRota() {
  const ctx = useContext(RotaContext);
  if (!ctx) {
    throw new Error('useRota must be used within a RotaProvider');
  }
  return ctx;
}
