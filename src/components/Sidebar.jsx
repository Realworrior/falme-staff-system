import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  Activity, 
  Ticket, 
  ChevronRight,
  LogOut,
  Zap
} from 'lucide-react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useNavigation } from '../context/NavigationContext';

const cn = (...inputs) => twMerge(clsx(inputs));

const Sidebar = ({ className }) => {
  const { closeMobileSidebar } = useNavigation();
  const navItems = [
    { path: '/', label: 'Overview', icon: LayoutDashboard },
    { path: '/templates', label: 'Templates', icon: FileText },
    { path: '/slots', label: 'Aviator', icon: Activity },
    { path: '/tickets', label: 'Tickets', icon: Ticket },
  ];

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className={cn(
        "w-80 bg-sidebar border-r border-white/5 flex flex-col h-full z-40 transition-all duration-500",
        className
      )}
    >
      {/* Brand Logo */}
      <div className="p-8 border-b border-white/5">
        <div className="flex items-center gap-4 group cursor-pointer">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-600 via-orange-500 to-amber-400 flex items-center justify-center shadow-2xl shadow-red-500/20 group-hover:scale-110 transition-transform duration-500">
            <Zap className="text-white w-6 h-6 fill-current" />
          </div>
          <div>
            <h1 className="font-heading font-black text-white text-xl tracking-tighter leading-none group-hover:tracking-normal transition-all">BETMFALME</h1>
            <p className="text-[9px] uppercase tracking-[0.3em] text-gray-500 font-black mt-1">v4.0.0 Enterprise</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-6 space-y-3 overflow-y-auto custom-scrollbar">
        <p className="px-4 text-[9px] font-black text-gray-600 uppercase tracking-[0.2em] mb-4">Core Workspace</p>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={closeMobileSidebar}
            end={item.path === '/'}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-500 group relative overflow-hidden",
                isActive
                  ? "bg-white/[0.03] text-white border border-white/5 shadow-2xl"
                  : "text-gray-500 hover:text-white hover:bg-white/[0.02]"
              )
            }
          >
            {({ isActive }) => (
              <>
                <item.icon className={cn(
                  "w-5 h-5 transition-all duration-500",
                  isActive ? "text-red-500 scale-110" : "group-hover:text-gray-300"
                )} />
                <span className={cn(
                  "flex-1 font-bold text-sm tracking-tight transition-all duration-500",
                  isActive ? "translate-x-1" : "group-hover:translate-x-1"
                )}>{item.label}</span>
                <ChevronRight className={cn(
                  "w-4 h-4 transition-all duration-500",
                  isActive ? "text-red-500 opacity-100 rotate-90" : "opacity-0 group-hover:opacity-100 translate-x-1"
                )} />
                
                {isActive && (
                  <motion.div 
                    layoutId="activeNavIndicator"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-red-600 rounded-r-full shadow-[0_0_15px_rgba(220,38,38,0.5)]"
                  />
                )}
                
                {/* Hover Glow */}
                {!isActive && (
                  <div className="absolute inset-0 bg-gradient-to-r from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User Session */}
      <div className="p-6 border-t border-white/5 bg-black/10">
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5 group hover:border-white/10 transition-all duration-500 cursor-pointer shadow-sm">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-gray-800 to-gray-700 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <span className="text-white text-xs font-black uppercase">AD</span>
            </div>
            <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 border-2 border-[#0a0a0f] rounded-full shadow-sm" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-black text-white truncate uppercase tracking-wider">Super Admin</p>
            <p className="text-[9px] text-gray-600 truncate font-bold">session_active_0x7f</p>
          </div>
          <button className="p-2 text-gray-600 hover:text-red-500 transition-colors group/logout">
            <LogOut className="w-4 h-4 group-hover/logout:-translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
