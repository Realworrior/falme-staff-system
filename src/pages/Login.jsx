import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  const PIN_LENGTH = 5;

  // Auto focus input on mount and keep focused
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const verifyPin = (candidatePin) => {
    setLoading(true);
    setTimeout(() => {
      const result = login(candidatePin);
      if (!result.success) {
        setShake(true);
        setError(result.error);
        setPin('');
        setLoading(false);
        setTimeout(() => setShake(false), 500);
      }
    }, 200);
  };

  const handleInputChange = (e) => {
    if (loading) return;
    const value = e.target.value.replace(/\D/g, '').slice(0, PIN_LENGTH);
    setError('');
    setPin(value);
    if (value.length === PIN_LENGTH) {
      verifyPin(value);
    }
  };

  return (
    <div 
      className="min-h-screen w-full bg-[#0a0b10] flex items-center justify-center p-4 relative overflow-hidden select-none"
      onClick={() => inputRef.current?.focus()}
    >
      {/* Dynamic Background Glows */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] bg-[#baff55]/10 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/3 w-[300px] h-[300px] bg-[#3b82f6]/10 rounded-full blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 15, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35, ease: [0.2, 0, 0, 1] }}
        className="w-full max-w-sm relative z-10"
      >
        {/* Main Minimal Glass Card */}
        <div className="bg-[#12141c]/90 backdrop-blur-2xl rounded-[32px] p-8 md:p-10 shadow-[0_25px_60px_rgba(0,0,0,0.8)] border border-white/[0.06] flex flex-col items-center text-center relative overflow-hidden">
          
          {/* Subtle Icon */}
          <div className="w-12 h-12 rounded-2xl bg-white/[0.04] text-gray-400 flex items-center justify-center mb-5 border border-white/[0.06]">
            <Lock size={20} className="text-gray-300" />
          </div>

          <h1 className="text-xl font-bold text-white tracking-tight">Enter PIN</h1>
          <p className="text-xs text-gray-500 mt-1">
            Type your 5-digit access code
          </p>

          {/* Hidden real input for physical keyboard and mobile keyboard support */}
          <input
            ref={inputRef}
            type="password"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={PIN_LENGTH}
            value={pin}
            onChange={handleInputChange}
            disabled={loading}
            className="opacity-0 absolute pointer-events-auto inset-0 cursor-default"
            autoFocus
          />

          {/* Visual PIN Dots */}
          <motion.div 
            animate={shake ? { x: [-12, 12, -8, 8, -4, 4, 0] } : {}}
            transition={{ duration: 0.4 }}
            className="flex items-center justify-center gap-3.5 my-8 cursor-pointer"
            onClick={() => inputRef.current?.focus()}
          >
            {Array.from({ length: PIN_LENGTH }).map((_, index) => {
              const isFilled = index < pin.length;
              return (
                <div
                  key={index}
                  className={`w-4 h-4 rounded-full transition-all duration-200 ${
                    isFilled
                      ? 'bg-[#baff55] shadow-[0_0_15px_rgba(186,255,85,0.7)] scale-110'
                      : 'bg-white/10 border border-white/10'
                  }`}
                />
              );
            })}
          </motion.div>

          {/* Error Message Alert */}
          <div className="min-h-[24px] flex items-center justify-center">
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="flex items-center gap-1.5 text-xs text-red-400 font-semibold bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20"
                >
                  <AlertCircle size={13} />
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </motion.div>
    </div>
  );
}
