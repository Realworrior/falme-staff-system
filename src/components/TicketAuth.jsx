import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, User, Lock, ArrowRight, Zap, Briefcase } from 'lucide-react';

const TicketAuth = ({ onLogin }) => {
  const [role, setRole] = useState('Staff'); // Staff or Dept
  const [credentials, setCredentials] = useState({ id: '', password: '' });
  const [isError, setIsError] = useState(false);

  const STAFF_PWD = "staff";
  const DEPT_PWD = "tech";

  const handleLogin = (e) => {
    e.preventDefault();
    const isStaffValid = role === 'Staff' && credentials.password === STAFF_PWD;
    const isDeptValid = role === 'Dept' && credentials.password === DEPT_PWD;

    if (isStaffValid || isDeptValid) {
      onLogin(role);
    } else {
      setIsError(true);
      setTimeout(() => setIsError(false), 2000);
    }
  };

  return (
    <div className="min-h-[calc(100vh-160px)] flex items-center justify-center p-4">
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-md bg-[#0f0f17] rounded-[32px] border border-white/5 shadow-2xl overflow-hidden relative"
      >
        {/* Decorative Background */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-red-600/10 to-transparent pointer-events-none" />
        
        <div className="p-8 relative z-10">
          <div className="flex flex-col items-center mb-10">
            <div className="w-16 h-16 rounded-2xl bg-red-600 flex items-center justify-center shadow-2xl shadow-red-500/20 mb-4">
              <Shield className="text-white w-8 h-8" />
            </div>
            <h1 className="text-2xl font-black text-white font-heading tracking-tighter uppercase">Support Login</h1>
            <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.3em] mt-1">Sign in to manage tickets</p>
          </div>

          {/* Module Switcher */}
          <div className="flex bg-black/40 p-1.5 rounded-2xl border border-white/5 mb-8">
            <button 
              onClick={() => setRole('Staff')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                role === 'Staff' ? "bg-red-600 text-white shadow-lg shadow-red-500/20" : "text-gray-500 hover:text-gray-300"
              }`}
            >
              <User size={14} />
              Staff
            </button>
            <button 
              onClick={() => setRole('Dept')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                role === 'Dept' ? "bg-red-600 text-white shadow-lg shadow-red-500/20" : "text-gray-500 hover:text-gray-300"
              }`}
            >
              <Briefcase size={14} />
              Dept (Ops)
            </button>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest ml-4 italic">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                <input 
                  type="password" 
                  placeholder="••••••••"
                  required
                  value={credentials.password}
                  onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                  className={`w-full bg-black/40 border ${isError ? 'border-red-500' : 'border-white/5'} rounded-2xl py-4 pl-12 pr-4 text-white text-sm font-bold focus:outline-none focus:border-red-500/50 transition-all placeholder:text-gray-700`}
                />
              </div>
            </div>

            <button 
              type="submit"
              className="w-full py-5 accent-gradient text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.3em] shadow-xl shadow-red-500/20 hover:shadow-red-500/40 transition-all active:scale-95 flex items-center justify-center gap-2 mt-8"
            >
              Log In
              <ArrowRight size={16} strokeWidth={3} />
            </button>
          </form>

          <p className="text-center mt-12 text-gray-700 text-[8px] font-black uppercase tracking-widest italic decoration-red-500/20 underline">
            Unauthorized access will be logged and synced with global security protocols.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default TicketAuth;
