import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, Lock, Users, Wrench, Shield, ArrowRight, AlertCircle } from 'lucide-react';

export function LoginForm({ onLogin }) {
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [role, setRole] = useState('staff');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (phone.replace(/\D/g, '').length < 10) { setError('Invalid phone number'); return; }
    if (pin.length < 4) { setError('PIN must be at least 4 digits'); return; }
    setLoading(true);
    try {
      const success = await onLogin(phone, pin, role);
      if (!success) setError('Invalid credentials or role mismatch');
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
    <div className="min-h-[calc(100vh-160px)] flex items-center justify-center p-4 bg-[#161616]">
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-md bg-[#1e1f22] rounded-[32px] overflow-hidden"
      >
        <div className="p-8">
          {/* Brand Header */}
          <div className="flex flex-col items-center mb-10">
            <div className="w-16 h-16 rounded-2xl bg-[#baff55] flex items-center justify-center mb-4">
              <Shield className="text-black w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Support Login</h1>
            <p className="text-sm text-[#8e8e93] mt-1">Operations Portal</p>
          </div>

          {/* Role Toggle */}
          <div className="flex bg-[#161616] p-1.5 rounded-full border border-[#3a3b3f] mb-8 gap-1">
            <button 
              type="button"
              onClick={() => setRole('staff')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full text-sm font-semibold transition-all ${
                role === 'staff' ? 'bg-[#baff55] text-black' : 'text-[#8e8e93] hover:text-white'
              }`}
            >
              <Users size={14} /> Staff
            </button>
            <button 
              type="button"
              onClick={() => setRole('technician')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full text-sm font-semibold transition-all ${
                role === 'technician' ? 'bg-[#baff55] text-black' : 'text-[#8e8e93] hover:text-white'
              }`}
            >
              <Wrench size={14} /> Tech
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#8e8e93] ml-2">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8e8e93]" />
                <input 
                  type="tel" 
                  placeholder="123-456-7890"
                  required
                  value={phone}
                  onChange={(e) => setPhone(formatPhone(e.target.value))}
                  className="w-full bg-[#2a2b2f] border border-[#3a3b3f] rounded-full py-4 pl-12 pr-4 text-white text-sm focus:outline-none focus:border-[#baff55] transition-colors placeholder:text-[#4a4b50]"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#8e8e93] ml-2">Access PIN</label>
              <div className="relative">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8e8e93]" />
                <input 
                  type="password" 
                  placeholder="••••"
                  required
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  className="w-full bg-[#2a2b2f] border border-[#3a3b3f] rounded-full py-4 pl-12 pr-4 text-white text-2xl tracking-[0.5em] focus:outline-none focus:border-[#baff55] transition-colors placeholder:text-[#4a4b50]"
                />
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 p-3 rounded-2xl bg-[#ff4d4d]/10 border border-[#ff4d4d]/20 text-[#ff4d4d] text-sm"
                >
                  <AlertCircle size={14} />{error}
                </motion.div>
              )}
            </AnimatePresence>

            <button 
              type="submit"
              disabled={loading}
              className="w-full pill-lime flex items-center justify-center gap-2 py-4 mt-4 disabled:opacity-50"
            >
              {loading ? 'Validating...' : 'Establish Connection'}
              <ArrowRight size={16} />
            </button>
          </form>

          <div className="mt-6 p-4 bg-[#161616] rounded-2xl border border-[#3a3b3f]">
             <p className="text-xs text-[#8e8e93]">Use your registered mobile & PIN</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
