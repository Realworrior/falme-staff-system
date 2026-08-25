import React from 'react';
import { STAFF_COLORS } from '../utils/scheduleGenerator';

export function AnalyticsDashboard({ analytics }) {
  if (!analytics || !analytics.staffStats) return null;

  return (
    <div className="space-y-6 text-[#F4F5F1] select-none">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {analytics.staffStats.map((stat) => (
          <div
            key={stat.name}
            className="rounded-3xl p-5 text-white border border-white/[0.07] bg-[#131520] shadow-lg relative overflow-hidden group/stat"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs font-semibold uppercase tracking-wider text-[#8B8E97]">
                {stat.name}
              </div>
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: STAFF_COLORS[stat.name] || '#3d7ee6' }} />
            </div>

            <div className="text-3xl font-['Space_Grotesk'] font-bold mb-3 tracking-tight">
              {stat.totalShifts} <span className="text-xs font-medium uppercase tracking-widest text-[#54565F]">Shifts</span>
            </div>

            <div className="flex flex-wrap gap-2 text-xs">
              <div className="px-2.5 py-1 rounded-xl bg-[#0E0E12] border border-white/[0.04] flex items-center gap-1.5 font-mono">
                <div className="w-1.5 h-1.5 rounded-full bg-[#3d7ee6]" />
                <span className="text-[#8B8E97]">{stat.amShifts} AM</span>
              </div>
              <div className="px-2.5 py-1 rounded-xl bg-[#0E0E12] border border-white/[0.04] flex items-center gap-1.5 font-mono">
                <div className="w-1.5 h-1.5 rounded-full bg-[#28a87c]" />
                <span className="text-[#8B8E97]">{stat.pmShifts} PM</span>
              </div>
              <div className="px-2.5 py-1 rounded-xl bg-[#0E0E12] border border-white/[0.04] flex items-center gap-1.5 font-mono">
                <div className="w-1.5 h-1.5 rounded-full bg-[#7a56d4]" />
                <span className="text-[#8B8E97]">{stat.ntShifts} NT</span>
              </div>
            </div>
            
            <div 
              className="absolute -bottom-4 -right-4 w-20 h-20 rounded-full opacity-10 pointer-events-none" 
              style={{ backgroundColor: STAFF_COLORS[stat.name] || '#3d7ee6' }} 
            />
          </div>
        ))}
      </div>
    </div>
  );
}
