import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  Activity, 
  Ticket,
  CalendarDays,
  BookOpen,
  Calculator,
  ArrowLeft
} from 'lucide-react';
import { motion } from 'framer-motion';

const navItems = [
  { path: '/', label: 'Overview', icon: LayoutDashboard },
  { path: '/templates', label: 'Templates', icon: FileText },
  { path: '/slots', label: 'Aviator', icon: Activity },
  // { path: '/tickets', label: 'Tickets', icon: Ticket },
  { path: '/tools', label: 'Cashback', icon: Calculator, isNew: true },
  { path: '/rota', label: 'Rota', icon: CalendarDays },
  { path: '/resources', label: 'Resources', icon: BookOpen },
];

const BottomNav = ({ className }) => {
  return (
    <>
      {/* ── MOBILE BOTTOM DOCK ── */}
      <div className="fixed bottom-0 left-0 right-0 z-[60] md:hidden px-4 pb-4">
        <div
          className="flex items-center justify-around bg-[#2a2b2f] rounded-[28px] px-2 py-3 border border-[#3a3b3f]"
          style={{ boxShadow: '0 -4px 40px rgba(0,0,0,0.5)' }}
        >
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className="no-underline"
            >
              {({ isActive }) => (
                <div className={`relative flex flex-col items-center gap-1 px-3 py-1.5 rounded-2xl transition-all ${isActive ? 'bg-[#baff55]' : 'bg-transparent'}`}>
                  <item.icon 
                    size={20} 
                    className={isActive ? 'text-black' : 'text-[#8e8e93]'} 
                  />
                  <span className={`text-[9px] font-semibold ${isActive ? 'text-black' : 'text-[#8e8e93]'}`}>
                    {item.label}
                  </span>
                  {item.isNew && (
                    <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-[#baff55] rounded-full border-2 border-[#2a2b2f]" />
                  )}
                </div>
              )}
            </NavLink>
          ))}
        </div>
      </div>

      {/* ── DESKTOP VERTICAL SIDEBAR ── */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className={`hidden md:flex flex-col items-center w-[88px] h-screen bg-[#1e1f22] border-r border-[#2a2b2f] py-8 sticky top-0 shrink-0 ${className || ''}`}
      >
        {/* Logo */}
        <NavLink to="/" className="no-underline mb-10 flex flex-col items-center gap-1 group">
          <div className="w-11 h-11 bg-[#2a2b2f] rounded-2xl flex items-center justify-center border border-[#3a3b3f] group-hover:border-[#baff55]/40 transition-all overflow-hidden">
            <img src="/favicon.svg" alt="Falme" className="w-7 h-7 object-contain" />
          </div>
        </NavLink>

        {/* Nav Links */}
        <div className="flex flex-col gap-1 flex-1 w-full px-3">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className="no-underline"
            >
              {({ isActive }) => (
                <div className="relative group">
                  <div className={`flex flex-col items-center gap-1.5 py-3 rounded-2xl transition-all cursor-pointer
                    ${isActive
                      ? 'bg-[#baff55]'
                      : 'bg-transparent hover:bg-[#2a2b2f]'
                    }`}
                  >
                    <item.icon
                      size={20}
                      className={isActive ? 'text-black' : 'text-[#8e8e93] group-hover:text-white transition-colors'}
                    />
                    <span className={`text-[9px] font-semibold leading-none ${isActive ? 'text-black' : 'text-[#8e8e93] group-hover:text-white transition-colors'}`}>
                      {item.label}
                    </span>
                  </div>
                  {item.isNew && (
                    <div className="absolute top-2 right-2 w-2 h-2 bg-[#baff55] rounded-full border-2 border-[#1e1f22]" />
                  )}
                </div>
              )}
            </NavLink>
          ))}
        </div>

        {/* Back button */}
        <div className="w-full px-3 mt-4">
          <button
            onClick={() => window.history.back()}
            className="w-full flex flex-col items-center gap-1.5 py-3 rounded-2xl bg-transparent hover:bg-[#2a2b2f] transition-all group"
          >
            <ArrowLeft size={18} className="text-[#8e8e93] group-hover:text-white transition-colors" />
            <span className="text-[9px] font-semibold text-[#8e8e93] group-hover:text-white transition-colors">Back</span>
          </button>
        </div>
      </motion.div>
    </>
  );
};

export default BottomNav;
