import React from 'react';

export function StatsCard({ label, value, color }) {
  return (
    <div className="bg-[#2a2b2f] rounded-[28px] p-6 flex flex-col gap-3">
      <p className="text-sm font-medium text-[#8e8e93]">{label}</p>
      <h3 className={`text-4xl font-bold tracking-tight ${color}`}>{value}</h3>
      <div className="w-10 h-1 bg-[#3a3b3f] rounded-full" />
    </div>
  );
}
