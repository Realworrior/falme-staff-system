import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Mail, Lock, ArrowRight, Zap, Briefcase, AlertCircle } from 'lucide-react';
import { useSupabaseData } from '../context/SupabaseDataContext';

const TicketAuth = () => {
  const { actions } = useSupabaseData();
  const [credentials, setCredentials] = useState({ 
    email: 'staff@falme.ai', 
    password: 'staff_password_here' 
  });
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setIsError(false);
    
    try {
      await actions.login(credentials.email, credentials.password);
    } catch (err) {
      setIsError(true);
      setErrorMessage(err.message || 'Invalid credentials');
      setTimeout(() => setIsError(false), 3000);
    } finally {
      setIsSubmitting(false);
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

          {/* Info Banner */}
          <div className="bg-red-500/5 border border-red-500/10 rounded-2xl p-4 mb-8 flex items-start gap-3">
            <Zap size={16} className="text-red-500 mt-0.5 shrink-0" />
            <p className="text-[10px] text-gray-500 font-bold leading-relaxed uppercase tracking-tight">
              Cloud Authentication Active. Use your assigned operator credentials to access the ticket matrix.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest ml-4 italic">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                <input 
                  type="email" 
                  placeholder="operator@falme.ai"
                  required
                  value={credentials.email}
                  onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                  className={`w-full bg-black/40 border ${isError ? 'border-red-500' : 'border-white/5'} rounded-2xl py-4 pl-12 pr-4 text-white text-sm font-bold focus:outline-none focus:border-red-500/50 transition-all placeholder:text-gray-700`}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest ml-4 italic">Security Key</label>
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

            <AnimatePresence>
              {isError && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-bold uppercase"
                >
                  <AlertCircle size={14} />
                  {errorMessage}
                </motion.div>
              )}
            </AnimatePresence>

            <button 
              type="submit"
              disabled={isSubmitting}
              className="w-full py-5 accent-gradient text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.3em] shadow-xl shadow-red-500/20 hover:shadow-red-500/40 transition-all active:scale-95 flex items-center justify-center gap-2 mt-8 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Authenticating...' : 'Establish Connection'}
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
