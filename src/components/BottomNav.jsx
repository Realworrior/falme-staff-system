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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn(
        // Mobile layout (bottom nav)
        "fixed bottom-0 left-0 right-0 h-20 bg-sidebar/80 backdrop-blur-2xl border-t border-white/5 z-[60] px-2 flex items-center justify-around",
        // Desktop layout (vertical sidebar)
        "md:relative md:w-24 md:h-screen md:flex-col md:justify-start md:px-0 md:py-8 md:border-t-0 md:border-r md:bg-[#0a0a0f] md:backdrop-blur-none",
        "tour-nav-bar",
        className
      )}
    >
      <div className="hidden md:flex items-center justify-center mb-12 relative group">
         <div className="w-12 h-12 rounded-2xl bg-accent flex items-center justify-center border border-white/10 group-hover:scale-105 transition-transform">
           <Activity className="text-white w-6 h-6" />
         </div>
         <div className="absolute -bottom-6 text-[9px] font-black tracking-[0.3em] uppercase text-gray-400">Falme</div>
      </div>

      <div className="flex flex-row md:flex-col w-full items-center justify-around md:justify-start md:gap-8 flex-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center justify-center gap-1.5 transition-all duration-300 group relative min-w-[50px] md:w-full",
                isActive ? "text-accent" : "text-gray-500 hover:text-gray-300"
              )
            }
          >
            {({ isActive }) => (
              <>
                <div className={cn(
                  "w-10 h-10 flex items-center justify-center rounded-xl transition-all relative",
                  isActive ? "bg-accent/10 border border-accent/20" : "bg-transparent group-hover:bg-white/5"
                )}>
                  <item.icon className={cn(
                    "w-5 h-5 transition-transform",
                    isActive ? "" : "group-hover:scale-110"
                  )} />
                  {item.isNew && (
                    <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-600 rounded-full border border-[#0a0a0f]" />
                  )}
                </div>
                <span className={cn(
                  "text-[9px] font-black uppercase tracking-wider transition-all",
                  isActive ? "opacity-100" : "opacity-40 group-hover:opacity-80"
                )}>
                  {item.label}
                </span>
                
                {isActive && (
                  <motion.div 
                     layoutId="activeBottomNav"
                     className="absolute -bottom-2 md:-right-0 md:left-auto md:top-1/2 md:-translate-y-1/2 md:w-1 md:h-8 left-1/2 -translate-x-1/2 w-8 h-1 bg-accent rounded-full"
                  />
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>

      {/* Quick Exit Action (Desktop only) */}
      <div className="hidden md:flex flex-col items-center gap-4 mt-auto pb-4">
        <div className="h-px w-8 bg-white/5" />
        <button 
          onClick={() => window.history.back()}
          className="flex flex-col items-center justify-center w-10 h-10 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 hover:border-red-500/30 transition-all group"
        >
          <ExternalLink size={16} className="text-gray-500 group-hover:text-red-500 transition-colors" />
        </button>
      </div>
    </motion.div>
  );
};

export default BottomNav;
