import React from 'react';
import { Moon, Sunrise, Check, PersonStanding, Dumbbell, Sun, Snowflake, Utensils, MoreVertical } from 'lucide-react';

const timelineData = [
  {
    time: '22:10',
    icon: Moon,
    iconBg: '#3b82f6',
    title: 'Sleep',
  },
  {
    time: '05:05',
    icon: Sunrise,
    iconBg: '#f59e0b',
    title: 'Woke Up',
  },
  {
    time: '06:25',
    icon: Check,
    iconBg: '#22c55e',
    title: 'Checked in on Benji',
  },
  {
    time: '06:30',
    icon: PersonStanding,
    iconBg: '#10b981',
    title: 'Walk 7.5K',
    subtitle: '1 hr 20 mins',
    menu: true,
  },
  {
    time: '08:30',
    icon: Dumbbell,
    iconBg: '#64748b',
    title: 'Back etc.',
    subtitle: '30 mins',
    menu: true,
    list: [
      { label: '3 x Chin-Up', value: '19 total reps' },
      { label: '1 x Farmer walk 2 hands', value: '1 total reps' },
      { label: '4 x Dumbbell Row', value: '42 total reps' },
      { label: '2 x Pull-Up', value: '10 total reps' },
      { label: '3 x Plank and move kettlebell', value: '30 total reps' },
      { label: '2 x Ab roll thingie', value: '20 total reps' },
      { label: '2 x Push-Up', value: '20 total reps' },
    ]
  },
  {
    time: '09:05',
    icon: Sun,
    iconBg: '#ef4444',
    title: 'Infrared sauna',
    subtitle: '10 mins',
    menu: true,
  },
  {
    time: '09:10',
    icon: Snowflake,
    iconBg: '#06b6d4',
    title: 'Cold shower',
    subtitle: '5 mins',
    menu: true,
  },
  {
    time: '10:09',
    icon: Utensils,
    iconBg: '#84cc16',
    title: 'Athletic Greens + collagen + vitamin k + 5 mg creatine',
    menu: true,
    macros: { kcal: 140, P: '15g', C: '10g', F: '3g' }
  }
];

export function ActivityTimeline() {
  return (
    <div className="bg-[#1e1f22] p-6 rounded-[32px] w-full border border-[#2a2b2f]">
       <div className="flex items-center justify-between mb-8">
         <div>
           <h3 className="text-lg font-semibold text-white">Daily Activity Stream</h3>
           <p className="text-sm text-[#8e8e93] mt-1 font-medium">Logged interactions and events</p>
         </div>
       </div>

       <div className="relative">
         {/* Vertical line connecting nodes */}
         <div className="absolute left-[54px] top-4 bottom-4 w-px bg-[#2a2b2f]" />
         
         <div className="space-y-4">
           {timelineData.map((item, idx) => (
             <div key={idx} className="flex items-start gap-4 relative z-10">
               {/* Time */}
               <div className="w-[42px] pt-3 text-right shrink-0">
                 <span className="text-xs font-medium text-[#8e8e93]">{item.time}</span>
               </div>
               
               {/* Icon Bubble */}
               <div className="relative pt-1 shrink-0">
                 <div className="w-8 h-8 rounded-full flex items-center justify-center border-4 border-[#1e1f22]" style={{ backgroundColor: item.iconBg }}>
                   <item.icon size={14} className="text-white" />
                 </div>
               </div>
               
               {/* Card */}
               <div className="flex-1 bg-[#2a2b2f] rounded-[20px] p-4 mt-0.5 relative group hover:bg-[#303136] transition-colors cursor-pointer border border-[#3a3b3f]/50 hover:border-[#baff55]/30">
                 <div className="flex items-start justify-between gap-4">
                   <div>
                     <h4 className="text-sm font-semibold text-white leading-tight">{item.title}</h4>
                     {item.subtitle && <p className="text-xs text-[#8e8e93] mt-1">{item.subtitle}</p>}
                   </div>
                   {item.menu && (
                     <button className="text-[#8e8e93] hover:text-white transition-colors">
                       <MoreVertical size={16} />
                     </button>
                   )}
                 </div>
                 
                 {/* List for Exercises */}
                 {item.list && (
                   <div className="mt-4 space-y-2.5">
                     {item.list.map((listItem, i) => (
                       <div key={i} className="flex items-center justify-between text-xs">
                         <span className="text-[#c0c0c5]">{listItem.label}</span>
                         <span className="text-[#8e8e93] font-medium">{listItem.value}</span>
                       </div>
                     ))}
                   </div>
                 )}
                 
                 {/* Macros */}
                 {item.macros && (
                   <div className="mt-4 flex items-center gap-3">
                     <span className="text-xs font-semibold text-white">{item.macros.kcal} kcal</span>
                     <div className="flex items-center gap-2">
                       <span className="flex items-center gap-1 text-xs"><span className="w-4 h-4 rounded bg-[#3b82f6] text-white flex items-center justify-center font-bold text-[9px]">P</span> <span className="text-[#8e8e93]">{item.macros.P}</span></span>
                       <span className="flex items-center gap-1 text-xs"><span className="w-4 h-4 rounded bg-[#22c55e] text-white flex items-center justify-center font-bold text-[9px]">C</span> <span className="text-[#8e8e93]">{item.macros.C}</span></span>
                       <span className="flex items-center gap-1 text-xs"><span className="w-4 h-4 rounded bg-[#f59e0b] text-white flex items-center justify-center font-bold text-[9px]">F</span> <span className="text-[#8e8e93]">{item.macros.F}</span></span>
                     </div>
                   </div>
                 )}
               </div>
             </div>
           ))}
         </div>
       </div>
    </div>
  );
}
