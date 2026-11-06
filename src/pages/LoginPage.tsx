import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Phone, Lock, AlertCircle, Gamepad2, ArrowRight } from 'lucide-react';
import { useStore } from '../lib/store';
import { translations } from '../i18n/translations';

export const LoginPage: React.FC = () => {
  const { loginWithPhone, lang } = useStore();
  const navigate = useNavigate();
  const t = translations[lang];

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const res = loginWithPhone(phone, password);
    if (!res.success) {
      setError(res.error || 'Failed to sign in.');
    } else {
      navigate('/profile');
    }
  };

  const handleQuickLogin = (quickPhone: string) => {
    setPhone(quickPhone);
    const res = loginWithPhone(quickPhone);
    if (res.success) {
      navigate('/profile');
    }
  };

  return (
    <div className="min-h-screen py-16 bg-slate-50 dark:bg-[#07080D] flex items-center justify-center px-4 transition-colors duration-200">
      <div className="max-w-md w-full rounded-2xl border border-slate-200 dark:border-[#23273A] bg-white dark:bg-[#0E1018] p-8 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#4F7CFF] to-[#8B6CFF] text-white shadow-lg shadow-[#4F7CFF]/20">
            <Gamepad2 className="h-6 w-6" />
          </div>
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
            {lang === 'bn' ? 'মেম্বার লগইন' : 'Member Sign In'}
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Enter your Bangladeshi mobile number to access your gamer profile and bookings.
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/30 p-3 text-xs text-red-500 dark:text-red-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-400 mb-1.5">
              Mobile Number (e.g. 01712-345678)
            </label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="01XXXXXXXXX"
                required
                className="w-full rounded-xl border border-slate-300 dark:border-white/10 bg-white dark:bg-[#151826] pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:border-[#4F7CFF] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-400">
                Password
              </label>
              <span className="text-[10px] text-slate-500">
                (Staff resets available at counter)
              </span>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-300 dark:border-white/10 bg-white dark:bg-[#151826] pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:border-[#4F7CFF] focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#4F7CFF] py-3 text-xs font-bold text-white shadow-lg shadow-[#4F7CFF]/25 hover:bg-[#3b68ee] transition active:scale-95"
          >
            <span>Sign In</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        {/* Quick Demo Logins for easy evaluation */}
        <div className="rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-[#151826] p-4 space-y-2.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
            Quick 1-Click Preview Logins:
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('01711223344')}
              className="rounded-lg bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 p-2 text-left hover:border-[#4F7CFF] transition shadow-sm dark:shadow-none"
            >
              <span className="block text-xs font-bold text-slate-900 dark:text-white">Rafi Ahmed</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">Regular Member</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('01700000000')}
              className="rounded-lg bg-purple-50 dark:bg-[#8B6CFF]/15 border border-purple-200 dark:border-[#8B6CFF]/30 p-2 text-left hover:border-[#8B6CFF] transition"
            >
              <span className="block text-xs font-bold text-purple-700 dark:text-[#8B6CFF]">Owner Bhai</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">Admin Account</span>
            </button>
          </div>
        </div>

        <div className="text-center text-xs text-slate-600 dark:text-slate-400">
          New to the zone?{' '}
          <Link to="/register" className="text-[#4F7CFF] font-semibold hover:underline">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
};
