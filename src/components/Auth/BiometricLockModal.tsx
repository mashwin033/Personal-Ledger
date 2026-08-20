import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Lock, Fingerprint, KeyRound, Check, ShieldCheck, X } from 'lucide-react';

export const BiometricLockModal: React.FC = () => {
  const { isBiometricLocked, unlockApp, user, showToast } = useApp();
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  if (!isBiometricLocked) return null;

  const handleDigit = (digit: string) => {
    if (pin.length < 4) {
      const nextPin = pin + digit;
      setPin(nextPin);
      setError(false);
      if (nextPin.length === 4) {
        setTimeout(() => {
          const success = unlockApp(nextPin);
          if (!success) {
            setError(true);
            setPin('');
          }
        }, 150);
      }
    }
  };

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1));
    setError(false);
  };

  const handleBiometricSim = () => {
    // WebAuthn or simulated biometric device authentication
    if (window.PublicKeyCredential) {
      showToast('Biometric sensor verified', 'success');
      unlockApp(user.pinCode || '1234');
    } else {
      unlockApp('1234');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/95 backdrop-blur-xl flex items-center justify-center p-4">
      <div className="w-full max-w-xs text-center space-y-6 text-white">
        {/* Shield Icon */}
        <div className="w-16 h-16 rounded-3xl bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/10">
          <Lock size={28} />
        </div>

        <div>
          <h2 className="text-2xl font-black tracking-tight text-white">Personal Ledger</h2>
          <p className="text-xs text-slate-400 mt-1">
            Enter your 4-digit PIN or use Biometrics
          </p>
        </div>

        {/* PIN Indicators */}
        <div className="flex justify-center space-x-3 py-2">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`w-3.5 h-3.5 rounded-full border-2 transition-all ${
                error
                  ? 'border-rose-500 bg-rose-500 animate-shake'
                  : pin.length > i
                  ? 'border-emerald-400 bg-emerald-400 scale-110'
                  : 'border-slate-600 bg-transparent'
              }`}
            />
          ))}
        </div>

        {error && (
          <p className="text-xs text-rose-400 font-semibold animate-pulse">
            Incorrect PIN. Try 1234 for demo.
          </p>
        )}

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-3 max-w-[240px] mx-auto pt-2">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              onClick={() => handleDigit(String(num))}
              className="w-16 h-16 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 active:bg-emerald-600 text-lg font-bold transition-all flex items-center justify-center cursor-pointer"
            >
              {num}
            </button>
          ))}

          {/* Biometric quick action */}
          <button
            onClick={handleBiometricSim}
            className="w-16 h-16 rounded-2xl bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-800/40 text-emerald-400 transition-all flex items-center justify-center cursor-pointer"
            title="Biometric Fingerprint Unlock"
          >
            <Fingerprint size={24} />
          </button>

          <button
            onClick={() => handleDigit('0')}
            className="w-16 h-16 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 active:bg-emerald-600 text-lg font-bold transition-all flex items-center justify-center cursor-pointer"
          >
            0
          </button>

          <button
            onClick={handleDelete}
            className="w-16 h-16 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 text-xs font-semibold text-slate-400 transition-all flex items-center justify-center cursor-pointer"
          >
            Del
          </button>
        </div>

        <p className="text-[11px] text-slate-500">
          Default Master PIN: <strong className="text-slate-300">1234</strong>
        </p>
      </div>
    </div>
  );
};
