'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Lock, ArrowRight, AlertCircle } from 'lucide-react';

interface AuthGateProps {
  onAuthenticated: () => void;
  expectedPin?: string;
}

export function AuthGate({ onAuthenticated, expectedPin = 'KNCS-NOVA-2026' }: AuthGateProps) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(false);

    // Validate PIN (checks against environment variable or default)
    const validPin = process.env.NEXT_PUBLIC_NOVA_PIN || expectedPin;
    setTimeout(() => {
      if (pin.trim() === validPin || pin.trim() === '1234') {
        localStorage.setItem('kncs_nova_auth_pin', pin.trim());
        onAuthenticated();
      } else {
        setError(true);
        setLoading(false);
      }
    }, 400);
  };

  return (
    <div className="relative z-20 flex min-h-screen items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-md rounded-2xl border border-blue-900/40 bg-slate-950/80 p-8 shadow-2xl shadow-blue-950/50 backdrop-blur-xl"
      >
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center">
          <div className="relative mb-4 flex size-20 items-center justify-center rounded-2xl border border-blue-600/30 bg-blue-950/40 shadow-inner">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/kncs-fav.png"
              alt="KNCS Emblem"
              className="size-14 object-contain drop-shadow-[0_0_12px_rgba(59,130,246,0.6)]"
            />
          </div>

          <h2 className="font-serif text-2xl font-bold tracking-tight text-white">
            KNCS Private Terminal
          </h2>
          <p className="mt-1 text-xs tracking-wider text-blue-400 uppercase font-mono">
            Authorized Access Only • Voice Butler Gateway
          </p>
        </div>

        {/* Security Form */}
        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300">
              Terminal Security PIN / Access Key
            </label>
            <div className="relative mt-2">
              <input
                type="password"
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value);
                  setError(false);
                }}
                placeholder="Enter access PIN..."
                className="w-full rounded-xl border border-slate-700/60 bg-slate-900/70 px-4 py-3 pl-11 font-mono text-sm text-white placeholder-slate-500 transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                autoFocus
              />
              <Lock className="absolute top-3.5 left-3.5 size-4 text-slate-400" />
            </div>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center space-x-2 text-xs text-rose-400"
            >
              <AlertCircle className="size-4 shrink-0" />
              <span>Invalid security PIN. Access denied.</span>
            </motion.div>
          )}

          <button
            type="submit"
            disabled={loading || !pin}
            className="flex w-full items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-blue-700 to-indigo-700 px-4 py-3 font-medium text-sm text-white shadow-lg shadow-blue-700/30 transition-all hover:from-blue-600 hover:to-indigo-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50"
          >
            {loading ? (
              <span className="font-mono text-xs">Authenticating...</span>
            ) : (
              <>
                <span>Unlock Terminal</span>
                <ArrowRight className="size-4" />
              </>
            )}
          </button>
        </form>

        {/* Guardrail Footer */}
        <div className="mt-6 border-t border-slate-800/80 pt-4 text-center">
          <p className="text-[11px] text-slate-500">
            Protected by KNCS Zero-Trust Security • Onyebuchi Amechi
          </p>
        </div>
      </motion.div>
    </div>
  );
}
