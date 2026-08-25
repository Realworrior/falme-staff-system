import React, { useState } from 'react';
import { Shield, X, Key } from 'lucide-react';

export function ManagerLoginModal({ isOpen, onClose, onLogin }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password === 'admin' || password === 'manager123' || password === '1234') {
      onLogin();
      onClose();
      setPassword('');
      setError('');
    } else {
      setError('Invalid passcode');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className="bg-[#131520] border border-white/10 rounded-[28px] p-6 w-full max-w-sm space-y-4 shadow-2xl text-[#F4F5F1]">
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#00D66B]" />
            <h3 className="text-base font-['Space_Grotesk'] font-bold text-white">Manager Mode</h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-white/5 text-[#8B8E97] hover:text-white transition-colors cursor-pointer">
            <X size={16} />
          </button>
        </div>

        <p className="text-xs text-[#8B8E97] leading-relaxed">
          Enter passcode to enable manual shift override and transport allowance editing.
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <input
              type="password"
              value={password}
              onChange={e => { setPassword(e.target.value); setError(''); }}
              placeholder="Enter passcode..."
              className="w-full bg-[#0E0E12] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-[#54565F] focus:outline-none focus:border-[#00D66B] font-mono"
              autoFocus
            />
            {error && <p className="text-[11px] text-red-400 mt-1">{error}</p>}
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-full text-xs font-semibold text-[#8B8E97] hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-full text-xs font-bold bg-[#00D66B] text-[#04170D] hover:brightness-105 transition-all cursor-pointer shadow-md"
            >
              Unlock
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
