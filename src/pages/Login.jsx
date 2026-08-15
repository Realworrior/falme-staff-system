import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, KeyRound, ShieldCheck, ArrowRight, Delete, AlertCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  const PIN_LENGTH = 5;

  // Auto focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleKeyPress = (num) => {
    if (loading) return;
    setError('');
    if (pin.length < PIN_LENGTH) {
      const nextPin = pin + num;
      setPin(nextPin);
      if (nextPin.length === PIN_LENGTH) {
        verifyPin(nextPin);
      }
    }
  };

  const handleDelete = () => {
    if (loading) return;
    setError('');
    setPin(prev => prev.slice(0, -1));
  };

  const handleClear = () => {
    if (loading) return;
    setError('');
    setPin('');
  };

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
    }, 250);
  };

  const handleKeyDown = (e) => {
    if (e.key >= '0' && e.key <= '9') {
      handleKeyPress(e.key);
    } else if (e.key === 'Backspace') {
      handleDelete();
    } else if (e.key === 'Escape') {
      handleClear();
    } else if (e.key === 'Enter' && pin.length === PIN_LENGTH) {
      verifyPin(pin);
    }
  };

  return (
    <div 
      className="min-h-screen w-full bg-[#0a0b10] flex items-center justify-center p-4 relative overflow-hidden select-none outline-none"
      onKeyDown={handleKeyDown}
      tabIndex={0}
      ref={inputRef}
    >
      {/* Dynamic Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#baff55]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[350px] h-[350px] bg-[#3b82f6]/10 rounded-full blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.2, 0, 0, 1] }}
        className="w-full max-w-md relative z-10"
      >
        {/* Main Card */}
        <div className="bg-[#12141c]/90 backdrop-blur-2xl rounded-[32px] p-8 md:p-10 shadow-[0_25px_60px_rgba(0,0,0,0.8)] border border-white/[0.06] flex flex-col items-center text-center relative overflow-hidden">
          
          {/* Subtle Top Indicator Pill */}
          <div className="flex items-center gap-1.5 px-3 py-1 bg-white/[0.04] rounded-full border border-white/[0.06] mb-6">
            <span className="w-2 h-2 rounded-full bg-[#baff55] animate-pulse" />
            <span className="text-[10px] font-bold text-gray-300 tracking-wider uppercase">Staff Access Required</span>
          </div>

          {/* App Brand Squircle */}
          <div className="w-16 h-16 rounded-[22px] bg-white text-black flex items-center justify-center shadow-2xl mb-4 font-black text-2xl tracking-tighter shrink-0">
            <span className="w-7 h-7 rounded-full border-[5px] border-black inline-block" />
          </div>

          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">Falme Staff Portal</h1>
          <p className="text-xs text-gray-400 mt-1 max-w-[260px] leading-relaxed">
            Enter your 5-digit PIN to access operational tools and logs
          </p>

          {/* PIN Dots Display */}
          <motion.div 
            animate={shake ? { x: [-12, 12, -8, 8, -4, 4, 0] } : {}}
            transition={{ duration: 0.4 }}
            className="flex items-center justify-center gap-3.5 my-7"
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
          <div className="min-h-[24px] mb-4 flex items-center justify-center">
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="flex items-center gap-1.5 text-xs text-red-400 font-semibold bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20"
                >
                  <AlertCircle size={13} />
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Keypad Grid (3x4) */}
          <div className="grid grid-cols-3 gap-3 w-full max-w-[280px]">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
              <button
                key={digit}
                type="button"
                onClick={() => handleKeyPress(digit)}
                className="h-14 rounded-2xl bg-[#1a1d29] hover:bg-[#242838] active:bg-[#baff55] active:text-black text-white text-xl font-bold font-mono transition-all flex items-center justify-center shadow-md active:scale-95 cursor-pointer select-none"
              >
                {digit}
              </button>
            ))}

            {/* Clear Button */}
            <button
              type="button"
              onClick={handleClear}
              className="h-14 rounded-2xl bg-white/[0.02] hover:bg-white/[0.06] active:bg-white/[0.1] text-gray-400 text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center active:scale-95 cursor-pointer select-none"
            >
              Clear
            </button>

            {/* 0 Button */}
            <button
              type="button"
              onClick={() => handleKeyPress('0')}
              className="h-14 rounded-2xl bg-[#1a1d29] hover:bg-[#242838] active:bg-[#baff55] active:text-black text-white text-xl font-bold font-mono transition-all flex items-center justify-center shadow-md active:scale-95 cursor-pointer select-none"
            >
              0
            </button>

            {/* Backspace Button */}
            <button
              type="button"
              onClick={handleDelete}
              className="h-14 rounded-2xl bg-white/[0.02] hover:bg-white/[0.06] active:bg-white/[0.1] text-gray-300 hover:text-white transition-all flex items-center justify-center active:scale-95 cursor-pointer select-none"
              title="Delete last digit"
            >
              <Delete size={20} />
            </button>
          </div>

          {/* Footer Note */}
          <div className="mt-8 pt-6 border-t border-white/[0.04] w-full flex items-center justify-center gap-2 text-[11px] text-gray-500 font-medium">
            <Lock size={12} className="text-gray-500" />
            <span>Secure internal terminal</span>
          </div>

        </div>
      </motion.div>
    </div>
  );
}
