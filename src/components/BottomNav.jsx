import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  Activity, 
  Ticket,
  CalendarDays,
  ExternalLink,
  BookOpen
} from 'lucide-react';

import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs) => twMerge(clsx(inputs));

const BottomNav = ({ className }) => {
  const navItems = [
    { path: '/', label: 'Overview', icon: LayoutDashboard },
    { path: '/templates', label: 'Templates', icon: FileText },
    { path: '/slots', label: 'Aviator', icon: Activity },
    { path: '/tickets', label: 'Tickets', icon: Ticket },
    { path: '/rota', label: 'Rota', icon: CalendarDays, isNew: true },
    { path: '/resources', label: 'Resources', icon: BookOpen, isNew: true },
  ];



  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      exit={{ y: 100 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className={cn(
        "fixed bottom-0 left-0 right-0 h-20 bg-sidebar/80 backdrop-blur-2xl border-t border-white/5 z-[60] px-2 md:px-6 flex items-center justify-around md:justify-center md:gap-16",
        className
      )}

    >
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          end={item.path === '/'}
          className={({ isActive }) =>
            cn(
              "flex flex-col items-center justify-center gap-1 transition-all duration-500 group relative min-w-[50px] md:min-w-[80px]",
              isActive ? "text-red-500 scale-105" : "text-gray-500 hover:text-gray-300"
            )
          }
        >
          {({ isActive }) => (
            <>
              <div className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/0 group-hover:bg-white/5 transition-colors relative">
                <item.icon className={cn(
                  "w-5 h-5 transition-transform",
                  isActive ? "drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]" : ""
                )} />
                {item.isNew && (
                  <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-600 rounded-full border border-[#0a0a0f] shadow-sm animate-pulse" />
                )}
              </div>
              <span className={cn(
                "text-[8px] font-black uppercase tracking-wider transition-all",
                isActive ? "opacity-100" : "opacity-40 group-hover:opacity-80"
              )}>
                {item.label}
              </span>
              
              {isActive && (
                <motion.div 
                   layoutId="activeBottomNav"
                   className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-red-600 rounded-full shadow-[0_0_15px_rgba(220,38,38,0.5)]"
                />
              )}
            </>
          )}
        </NavLink>
      ))}


      {/* Quick Exit Action */}
      <div className="hidden md:block h-8 w-px bg-white/5 mx-4" />
      <button 
        onClick={() => window.history.back()}
        className="hidden md:flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all group"
      >
        <ExternalLink size={14} className="text-gray-500 group-hover:text-red-500 transition-colors" />
        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Back</span>
      </button>
    </motion.div>
  );
};

export default BottomNav;
