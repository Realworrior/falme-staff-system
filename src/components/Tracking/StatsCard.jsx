import React from 'react';

export function StatsCard({ label, value, color }) {
  return (
    <div className="glass rounded-[28px] p-6 border border-white/5 relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-white/5 to-transparent rounded-full -mr-8 -mt-8" />
      <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-4 italic italic underline decoration-red-500/10">
        {label}
      </p>
      <div className="flex items-end justify-between relative z-10">
        <h3 className={`text-4xl font-black font-heading transition-transform group-hover:scale-105 duration-500 ${color}`}>
          {value}
        </h3>
        <div className="w-8 h-1 bg-white/10 rounded-full" />
      </div>
    </div>
  );
}
