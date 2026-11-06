import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Phone, User, Mail, AlertCircle, Gamepad2, ArrowRight } from 'lucide-react';
import { useStore } from '../lib/store';
import { translations } from '../i18n/translations';

export const RegisterPage: React.FC = () => {
  const { registerUser, lang } = useStore();
  const navigate = useNavigate();
  const t = translations[lang];

  const [fullName, setFullName] = useState('');
  const [nickname, setNickname] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!fullName.trim()) {
      setError('Full name is required.');
      return;
    }

    if (password.length > 0 && password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    const res = registerUser({
      fullName,
      nickname: nickname.trim() || undefined,
      phone,
      contactEmail: email.trim() || undefined,
    });

    if (!res.success) {
      setError(res.error || 'Registration failed.');
    } else {
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
            {lang === 'bn' ? 'মেম্বারশিপ রেজিস্ট্রেশন' : 'Join Bhai Brother Club'}
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Earn completed sessions, climb tiers from Rookie to Diamond, and enjoy zone perks.
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/30 p-3 text-xs text-red-500 dark:text-red-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-400 mb-1.5">
              Full Name *
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Tanvir Hossain"
                required
                className="w-full rounded-xl border border-slate-300 dark:border-white/10 bg-white dark:bg-[#151826] pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:border-[#4F7CFF] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-400 mb-1.5">
              Mobile Number * (01XXXXXXXXX)
            </label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="01712-345678"
                required
                className="w-full rounded-xl border border-slate-300 dark:border-white/10 bg-white dark:bg-[#151826] pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:border-[#4F7CFF] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-400 mb-1.5">
                Gamer Tag / Nickname (Optional)
              </label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="e.g. ShadowSniper"
                className="w-full rounded-xl border border-slate-300 dark:border-white/10 bg-white dark:bg-[#151826] px-3 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:border-[#4F7CFF] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-400 mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-300 dark:border-white/10 bg-white dark:bg-[#151826] px-3 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:border-[#4F7CFF] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-400 mb-1.5">
              Email Address (Optional)
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. gamer@example.com"
                className="w-full rounded-xl border border-slate-300 dark:border-white/10 bg-white dark:bg-[#151826] pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:border-[#4F7CFF] focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#4F7CFF] py-3 text-xs font-bold text-white shadow-lg shadow-[#4F7CFF]/25 hover:bg-[#3b68ee] transition active:scale-95"
          >
            <span>Create Gamer Account</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <div className="text-center text-xs text-slate-600 dark:text-slate-400">
          Already a member?{' '}
          <Link to="/login" className="text-[#4F7CFF] font-semibold hover:underline">
            Log in here
          </Link>
        </div>
      </div>
    </div>
  );
};
