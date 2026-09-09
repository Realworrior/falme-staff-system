import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  Activity, 
  CalendarDays,
  BookOpen,
  Calculator,
  ClipboardList,
  Clock,
  Receipt,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Sparkles,
  Shield,
  HelpCircle,
  TrendingDown,
  Layers,
  ArrowUpRight,
  LogOut
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { 
    path: '/', 
    label: 'Overview', 
    icon: LayoutDashboard,
    badge: null
  },
  {
    path: '/ai-agent',
    label: 'AI Agent',
    icon: Sparkles,
    badge: 'AI',
    badgeColor: 'bg-gradient-to-r from-[#00D66B] to-[#3ED3F2] text-[#04170D] font-black'
  },
  { 
    path: '/mpesa', 
    label: 'MPesa', 
    icon: ClipboardList,
    badge: 'Live',
    badgeColor: 'bg-[#00D66B] text-[#04170D]',
    subItems: [
      { label: 'Hourly Counter', path: '/counter' },
      { label: 'SMS Ledger', path: '/sms-ledger' }
    ]
  },
  { 
    path: '/slots', 
    label: 'Aviator Logs', 
    icon: Activity,
    badge: null
  },
  { 
    path: '/tools', 
    label: 'Cashback & Tools', 
    icon: Calculator,
    badge: null,
    subItems: [
      { label: 'Cashback Calc', path: '/tools' },
      { label: 'Odds Converter', path: '/tools?tab=odds' },
      { label: 'Cashback Rules', path: '/tools?tab=rules' }
    ]
  },
  { 
    path: '/templates', 
    label: 'Templates', 
    icon: FileText, 
    badge: '3',
    badgeColor: 'bg-emerald-500/20 text-emerald-400',
    subItems: [
      { label: 'BetFalme', path: '/templates?branch=betfalme' },
      { label: 'SofaBets', path: '/templates?branch=sofabets' },
      { label: 'SafiBets', path: '/templates?branch=safibets' },
    ]
  },
  { 
    path: '/rota', 
    label: 'Shift Rota', 
    icon: CalendarDays,
    badge: null,
    subItems: [
      { label: 'Betfalme', path: '/rota?branch=betfalme' },
      { label: 'SofaSafi', path: '/rota?branch=sofasafi' }
    ]
  },
  { 
    path: '/resources', 
    label: 'Resources', 
    icon: BookOpen,
    badge: null,
    subItems: [
      { label: 'Market Guide', path: '/resources?section=guide' },
      { label: 'Agent Manual', path: '/resources?section=manual' }
    ]
  },
];

const BottomNav = ({ className }) => {
  const { logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  // Navbars are collapsed by default unless explicitly opened
  const [openSubMenus, setOpenSubMenus] = useState({});
  const [hoveredItem, setHoveredItem] = useState(null);
  const [mobileActiveDropdown, setMobileActiveDropdown] = useState(null);

  const toggleSubMenu = (path, e) => {
    e.preventDefault();
    e.stopPropagation();
    setOpenSubMenus(prev => ({
      ...prev,
      [path]: !prev[path]
    }));
  };

  // Close mobile dropdown when location changes
  useEffect(() => {
    setMobileActiveDropdown(null);
  }, [location.pathname, location.search]);

  return (
    <>
      {/* ── MOBILE SUBMENU POPUP (Bottom-up above dock) ── */}
      <AnimatePresence>
        {mobileActiveDropdown && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileActiveDropdown(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[59] md:hidden"
            />

            {/* Popup Card */}
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="fixed bottom-[74px] left-4 right-4 z-[61] md:hidden bg-[#161822]/95 backdrop-blur-2xl border border-white/10 rounded-2xl p-3.5 shadow-[0_-12px_40px_rgba(0,0,0,0.8)]"
            >
              <div className="flex items-center justify-between pb-2.5 mb-2 border-b border-white/[0.08]">
                <div className="flex items-center gap-2">
                  {React.createElement(mobileActiveDropdown.icon, { size: 16, className: 'text-[#00D66B]' })}
                  <span className="text-xs font-bold text-white tracking-wide">
                    {mobileActiveDropdown.label}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileActiveDropdown(null)}
                  className="text-xs text-gray-400 hover:text-white px-2 py-0.5 rounded-full bg-white/5"
                >
                  Close
                </button>
              </div>

              <div className="grid grid-cols-1 gap-1.5">
                {mobileActiveDropdown.subItems.map((sub, sIdx) => {
                  const isSubActive = location.search 
                    ? (mobileActiveDropdown.path + location.search) === sub.path 
                    : (location.pathname === sub.path || 
                       (location.pathname === '/rota' && sub.path.includes('branch=betfalme')) ||
                       (location.pathname === '/templates' && sub.path.includes('branch=betfalme')));

                  return (
                    <button
                      key={sIdx}
                      type="button"
                      onClick={() => {
                        navigate(sub.path);
                        setMobileActiveDropdown(null);
                      }}
                      className={`flex items-center justify-between w-full px-3.5 py-2.5 rounded-xl text-left text-xs font-medium transition-all ${
                        isSubActive
                          ? 'bg-[#00D66B] text-[#04170D] font-bold shadow-md'
                          : 'text-gray-300 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <span>{sub.label}</span>
                      <ChevronRight size={13} className={isSubActive ? 'text-[#04170D]' : 'text-gray-500'} />
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── MOBILE BOTTOM DOCK ── */}
      <div className="fixed bottom-0 left-0 right-0 z-[60] md:hidden px-3 pb-3">
        <div
          className="flex items-center justify-around bg-[#121318]/95 backdrop-blur-xl rounded-[26px] px-2 py-2 border border-white/[0.06] shadow-[0_-10px_35px_rgba(0,0,0,0.6)] w-full"
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const hasSub = item.subItems && item.subItems.length > 0;
            const isActive = item.path === '/' 
              ? location.pathname === '/' 
              : (item.path === '/mpesa' 
                  ? (location.pathname === '/mpesa' || location.pathname === '/counter' || location.pathname === '/sms-ledger')
                  : location.pathname.startsWith(item.path));
            const isPopupOpen = mobileActiveDropdown?.path === item.path;

            return (
              <div
                key={item.path}
                onClick={(e) => {
                  if (hasSub) {
                    e.preventDefault();
                    setMobileActiveDropdown(prev => prev?.path === item.path ? null : item);
                  } else {
                    setMobileActiveDropdown(null);
                    navigate(item.path);
                  }
                }}
                className="flex-1 min-w-0 flex justify-center cursor-pointer"
              >
                <div className={`relative flex flex-col items-center justify-center gap-1 px-1.5 py-2 rounded-2xl transition-all w-full max-w-[54px] ${
                  isActive || isPopupOpen ? 'bg-[#00D66B] shadow-lg scale-105' : 'bg-transparent text-gray-400 hover:text-white'
                }`}>
                  <Icon 
                    size={17} 
                    className={isActive || isPopupOpen ? 'text-[#04170D]' : 'text-gray-400'} 
                  />
                  <span className={`text-[8px] font-semibold truncate w-full text-center leading-tight ${
                    isActive || isPopupOpen ? 'text-[#04170D] font-bold' : 'text-gray-400'
                  }`}>
                    {item.label.split(' ')[0]}
                  </span>
                  {hasSub && (
                    <div className={`absolute top-1 right-1.5 w-1.5 h-1.5 rounded-full ${
                      isActive || isPopupOpen ? 'bg-[#04170D]' : 'bg-[#00D66B]'
                    }`} />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── DESKTOP COLLAPSIBLE SIDEBAR (Exact Inspo Design) ── */}
      <motion.div
        initial={false}
        animate={{ width: isCollapsed ? 76 : 240 }}
        transition={{ duration: 0.25, ease: [0.2, 0, 0, 1] }}
        className={`hidden md:flex flex-col h-screen bg-[#111216] border-r border-white/[0.04] py-5 sticky top-0 shrink-0 z-50 select-none relative ${className || ''}`}
      >
        {/* Toggle Collapse Button (Floating Circular Pill on Border) */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-8 w-6 h-6 rounded-full bg-[#1b1d24] hover:bg-[#252832] border border-white/10 text-gray-300 hover:text-white flex items-center justify-center shadow-xl transition-all z-50 cursor-pointer"
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
        </button>

        {/* Top Window Header + Brand Squircle */}
        <div className={`px-5 mb-6 flex flex-col gap-4 ${isCollapsed ? 'items-center px-2' : ''}`}>
          {/* Squircle Brand Badge */}
          <NavLink to="/" className="no-underline flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-[14px] bg-[#00D66B] text-[#04170D] flex items-center justify-center shadow-lg font-black text-xl tracking-tighter shrink-0 transition-transform group-hover:scale-105">
              <span className="w-4 h-4 rounded-full border-[3.5px] border-[#04170D] inline-block" />
            </div>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="overflow-hidden whitespace-nowrap"
              >
                <span className="text-sm font-bold text-white tracking-tight block">Falme Staff</span>
                <span className="text-[10px] text-gray-400 block font-medium">Ops & Resources</span>
              </motion.div>
            )}
          </NavLink>
        </div>

        {/* Navigation Items */}
        <div className="flex flex-col gap-1 flex-1 overflow-y-auto px-3 no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const hasSub = item.subItems && item.subItems.length > 0;
            const isActive = item.path === '/' 
              ? location.pathname === '/' 
              : (item.path === '/mpesa' 
                  ? (location.pathname === '/mpesa' || location.pathname === '/counter' || location.pathname === '/sms-ledger')
                  : location.pathname.startsWith(item.path));
            const isSubOpen = openSubMenus[item.path] ?? false;

            return (
              <div 
                key={item.path} 
                className="relative"
                onMouseEnter={() => isCollapsed && setHoveredItem(item)}
                onMouseLeave={() => isCollapsed && setHoveredItem(null)}
              >
                <div
                  onClick={(e) => {
                    if (hasSub && !isCollapsed) {
                      toggleSubMenu(item.path, e);
                    } else {
                      navigate(item.path);
                    }
                  }}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-all ${
                    isActive && !isCollapsed
                      ? 'bg-[#1a1c24] text-white font-bold'
                      : isActive && isCollapsed
                      ? 'bg-[#00D66B] text-[#04170D] shadow-md'
                      : 'text-gray-400 hover:text-white hover:bg-white/[0.03]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon 
                      size={18} 
                      className={`shrink-0 ${isActive && isCollapsed ? 'text-[#04170D]' : isActive ? 'text-[#00D66B]' : 'text-gray-400'}`} 
                    />
                    {!isCollapsed && (
                      <span className="text-xs tracking-tight truncate">
                        {item.label}
                      </span>
                    )}
                  </div>

                  {!isCollapsed && (
                    <div className="flex items-center gap-1.5">
                      {item.badge && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${item.badgeColor || 'bg-white/10 text-white'}`}>
                          {item.badge}
                        </span>
                      )}
                      {hasSub && (
                        <ChevronDown 
                          size={14} 
                          className={`text-gray-500 transition-transform duration-200 ${isSubOpen ? 'rotate-180 text-white' : ''}`}
                        />
                      )}
                    </div>
                  )}
                </div>

                {/* Expanded Tree Submenu (When Sidebar is Expanded) */}
                {!isCollapsed && hasSub && isSubOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="relative pl-6 pr-2 py-1 flex flex-col gap-1 overflow-hidden"
                  >
                    {/* Vertical Connecting Tree Line */}
                    <div className="absolute left-[21px] top-0 bottom-3 w-[1px] bg-white/10" />

                    {item.subItems.map((sub, sIdx) => {
                      const isSubActive = location.search 
                        ? (item.path + location.search) === sub.path 
                        : (location.pathname === sub.path || 
                           (location.pathname === '/rota' && sub.path.includes('branch=betfalme')) ||
                           (location.pathname === '/templates' && sub.path.includes('branch=betfalme')));

                      return (
                        <NavLink
                          key={sIdx}
                          to={sub.path}
                          className="no-underline relative"
                        >
                          {/* Horizontal connecting tick line */}
                          <div className="absolute -left-[14px] top-1/2 w-2.5 h-[1px] bg-white/10" />
                          <div className={`text-xs py-1.5 px-3 rounded-lg transition-all ${
                            isSubActive
                              ? 'text-[#baff55] font-semibold bg-white/[0.04]'
                              : 'text-gray-400 hover:text-white hover:bg-white/[0.02]'
                          }`}>
                            {sub.label}
                          </div>
                        </NavLink>
                      );
                    })}
                  </motion.div>
                )}

                {/* Hover Flyout Popover (When Sidebar is Collapsed - Exact Image Look) */}
                {isCollapsed && hoveredItem?.path === item.path && (
                  <div className="absolute left-[70px] top-0 z-[100] bg-[#161820] border border-white/[0.08] rounded-2xl p-3 shadow-2xl min-w-[170px] animate-in fade-in zoom-in-95 duration-150">
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/[0.06]">
                      <span className="text-xs font-bold text-white">{item.label}</span>
                      {item.badge && (
                        <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${item.badgeColor || 'bg-white/10 text-white'}`}>
                          {item.badge}
                        </span>
                      )}
                    </div>
                    {hasSub ? (
                      <div className="space-y-1">
                        {item.subItems.map((sub, sIdx) => (
                          <button
                            key={sIdx}
                            onClick={() => navigate(sub.path)}
                            className="w-full text-left text-xs py-1.5 px-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/[0.06] transition-all flex items-center justify-between"
                          >
                            <span>{sub.label}</span>
                            <ChevronRight size={11} className="text-gray-500" />
                          </button>
                        ))}
                      </div>
                    ) : (
                      <button
                        onClick={() => navigate(item.path)}
                        className="w-full text-left text-xs py-1 px-1 text-gray-400 hover:text-white flex items-center gap-1.5"
                      >
                        <span>Open {item.label}</span>
                        <ArrowUpRight size={12} />
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer: Lock / Logout button */}
        <div className={`px-3 pt-3 mt-auto border-t border-white/[0.04] w-full ${isCollapsed ? 'flex justify-center' : ''}`}>
          <button
            onClick={() => {
              if (window.confirm("Lock terminal and log out?")) {
                logout();
              }
            }}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer w-full ${
              isCollapsed ? 'justify-center !px-0' : ''
            }`}
            title="Lock terminal"
          >
            <LogOut size={16} className="shrink-0" />
            {!isCollapsed && <span>Lock Session</span>}
          </button>
        </div>
      </motion.div>
    </>
  );
};

export default BottomNav;
