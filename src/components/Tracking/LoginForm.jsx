import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, Lock, Users, Wrench, Shield, ArrowRight, Zap, AlertCircle } from 'lucide-react';

export function LoginForm({ onLogin }) {
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [role, setRole] = useState('staff');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (phone.replace(/\D/g, '').length < 10) {
      setError('Invalid phone number');
      return;
    }

    if (pin.length < 4) {
      setError('PIN must be at least 4 digits');
      return;
    }

    setLoading(true);
    try {
      const success = await onLogin(phone, pin, role);
      if (!success) {
        setError('Invalid credentials or role mismatch');
      }
    } catch (err) {
      setError(err.message || 'Authentication error');
    } finally {
      setLoading(false);
    }
  };

  const formatPhone = (value) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 6) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 6)}-${numbers.slice(6, 12)}`;
  };

  return (
    <div className="min-h-[calc(100vh-160px)] flex items-center justify-center p-4">
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-md bg-[#0f0f17] rounded-[32px] border border-white/10 overflow-hidden relative"
      >

        
        <div className="p-8 relative z-10">
          <div className="flex flex-col items-center mb-10">
            <div className="w-16 h-16 rounded-2xl bg-red-600 flex items-center justify-center mb-4">
              <Shield className="text-white w-8 h-8" />
            </div>
            <h1 className="text-2xl font-black text-white font-heading tracking-tighter uppercase">Support Login</h1>
            <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.3em] mt-1">BetWin Technical Portal</p>
          </div>

          <div className="flex bg-black/40 p-1.5 rounded-2xl border border-white/5 mb-8">
            <button 
              type="button"
              onClick={() => setRole('staff')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                role === 'staff' ? "bg-red-600 text-white" : "text-gray-500 hover:text-gray-300"
              }`}
            >
              <Users size={14} />
              Staff
            </button>
            <button 
              type="button"
              onClick={() => setRole('technician')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                role === 'technician' ? "bg-red-600 text-white" : "text-gray-500 hover:text-gray-300"
              }`}
            >
              <Wrench size={14} />
              Tech
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest ml-4 italic">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                <input 
                  type="tel" 
                  placeholder="123-456-7890"
                  required
                  value={phone}
                  onChange={(e) => setPhone(formatPhone(e.target.value))}
                  className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white text-sm font-bold focus:outline-none focus:border-red-500/50 transition-all placeholder:text-gray-700"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest ml-4 italic">Access PIN</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                <input 
                  type="password" 
                  placeholder="••••"
                  required
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white text-2xl tracking-[0.5em] font-bold focus:outline-none focus:border-red-500/50 transition-all placeholder:text-gray-700"
                />
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-bold uppercase"
                >
                  <AlertCircle size={14} />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-5 bg-red-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.3em] transition-all active:scale-95 flex items-center justify-center gap-2 mt-8 disabled:opacity-50"
            >
              {loading ? 'Validating...' : 'Establish Connection'}
              <ArrowRight size={16} strokeWidth={3} />
            </button>
          </form>

          <div className="mt-8 p-4 bg-white/5 rounded-2xl border border-white/5">
             <p className="text-[8px] text-gray-500 font-bold uppercase tracking-widest mb-2">Debug Access:</p>
             <p className="text-[9px] text-gray-400 font-medium">Use your registered mobile & PIN</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
