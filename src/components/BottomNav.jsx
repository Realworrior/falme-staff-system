import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  Activity, 
  Ticket,
  CalendarDays,
  ExternalLink,
  BookOpen,
  Calculator
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
    { path: '/tools', label: 'Cashback', icon: Calculator, isNew: true },
    { path: '/rota', label: 'Rota', icon: CalendarDays },
    { path: '/resources', label: 'Resources', icon: BookOpen },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={cn(
        // Mobile layout (bottom nav dock)
        "fixed bottom-0 left-0 right-0 h-16 bg-sidebar backdrop-blur-2xl border-t border-white/5 z-[60] px-4 flex items-center justify-around",
        // Desktop layout (vertical floating panel)
        "md:relative md:w-24 md:h-screen md:flex-col md:justify-start md:px-0 md:py-8 md:border-t-0 md:border-r md:border-white/[0.05] md:bg-[#060810]/70 md:backdrop-blur-3xl",
        "tour-nav-bar",
        className
      )}
    >
      {/* Brand Logo (Desktop only) */}
      <NavLink to="/" className="hidden md:flex flex-col items-center justify-center mb-12 relative group no-underline">
         <div className="w-12 h-12 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 overflow-hidden relative">
           {/* Glow background behind logo */}
           <div className="absolute inset-0 bg-accent/20 blur-lg rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
           <img src="/favicon.svg" alt="Falme" className="w-12 h-12 object-contain animate-logo-pulse relative z-10" />
         </div>
         <div className="absolute -bottom-6 text-[9px] font-black tracking-[0.25em] uppercase text-gray-500 group-hover:text-accent transition-colors duration-300">
           Falme
         </div>
      </NavLink>

      {/* Nav List */}
      <div className="flex flex-row md:flex-col w-full items-center justify-around md:justify-start md:gap-8 flex-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center justify-center gap-1.5 transition-all duration-300 group relative min-w-[50px] md:w-full no-underline",
                isActive ? "text-accent" : "text-gray-500 hover:text-white"
              )
            }
          >
            {({ isActive }) => (
              <>
                {/* Icon wrapper with glow on active */}
                <div className={cn(
                  "w-9 h-9 flex items-center justify-center rounded-xl transition-all duration-300 relative",
                  isActive 
                    ? "bg-accent/15 border border-accent/30 shadow-[0_0_12px_rgba(59,130,246,0.25)]" 
                    : "bg-transparent group-hover:bg-white/5 border border-transparent"
                )}>
                  <item.icon className={cn(
                    "w-5 h-5 transition-transform duration-300",
                    isActive ? "scale-105 text-accent" : "group-hover:scale-110 text-gray-400 group-hover:text-white"
                  )} />
                  {item.isNew && (
                    <motion.div 
                      animate={{ scale: [1, 1.25, 1], opacity: [1, 0.6, 1] }}
                      transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                      className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-accent rounded-full border border-[#060810] z-10 shadow-[0_0_8px_rgba(59,130,246,0.6)]" 
                    />
                  )}
                </div>

                {/* Text Label (Desktop only) */}
                <span className={cn(
                  "text-[9px] font-black uppercase tracking-wider transition-all duration-300 hidden md:block",
                  isActive ? "opacity-100 text-accent font-bold" : "opacity-60 group-hover:opacity-100 text-gray-400"
                )}>
                  {item.label}
                </span>
                
                {/* Active indicator bar */}
                {isActive && (
                  <motion.div 
                     layoutId="activeBottomNav"
                     className={cn(
                       "absolute bg-accent rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]",
                       // Desktop right bar indicator
                       "md:-right-px md:left-auto md:top-1/2 md:-translate-y-1/2 md:w-1 md:h-8",
                       // Mobile bottom bar indicator
                       "bottom-[-8px] left-1/2 -translate-x-1/2 w-8 h-1"
                     )}
                  />
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>

      {/* Quick Exit Action (Desktop only) */}
      <div className="hidden md:flex flex-col items-center gap-4 mt-auto pb-4">
        <div className="h-[1px] w-8 bg-white/5" />
        <button 
          onClick={() => window.history.back()}
          className="flex flex-col items-center justify-center w-10 h-10 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 hover:border-red-500/30 hover:text-red-500 transition-all group cursor-pointer"
          title="Go Back"
        >
          <ExternalLink size={16} className="text-gray-500 group-hover:text-red-500 transition-colors" />
        </button>
      </div>
    </motion.div>
  );
};

export default BottomNav;
