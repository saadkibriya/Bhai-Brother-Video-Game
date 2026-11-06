import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Clock, Calendar, XCircle, LogOut, Shield, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useStore } from '../lib/store';
import { getTierProgress } from '../lib/tiers';
import { maskPhone } from '../lib/phone';
import { formatBdt } from '../lib/format';
import { translations } from '../i18n/translations';

export const ProfilePage: React.FC = () => {
  const { currentUser, bookings, cancelBooking, logout, lang } = useStore();
  const navigate = useNavigate();
  const t = translations[lang];

  const [activeTab, setActiveTab] = useState<'upcoming' | 'history'>('upcoming');
  const [cancelError, setCancelError] = useState<string>('');
  const [cancelSuccess, setCancelSuccess] = useState<string>('');

  if (!currentUser) {
    return (
      <div className="min-h-screen py-16 bg-slate-50 dark:bg-[#07080D] flex items-center justify-center px-4 transition-colors duration-200">
        <div className="max-w-md w-full rounded-2xl border border-slate-200 dark:border-[#23273A] bg-white dark:bg-[#0E1018] p-8 text-center space-y-4 shadow-xl">
          <User className="mx-auto h-12 w-12 text-slate-400" />
          <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">
            Please log in to view your profile
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Sign in with your mobile number to view tier stats, active bookings, and history.
          </p>
          <div className="pt-2 flex gap-3">
            <Link
              to="/login"
              className="flex-1 rounded-xl bg-[#4F7CFF] py-2.5 text-xs font-bold text-white hover:bg-[#3b68ee] transition shadow-md shadow-[#4F7CFF]/20"
            >
              Log In
            </Link>
            <Link
              to="/register"
              className="flex-1 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-[#151826] py-2.5 text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-white/10 transition"
            >
              Register
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const progress = getTierProgress(currentUser.sessionsCompleted);

  // Filter bookings for this user
  const userBookings = bookings.filter(
    (b) => b.memberId === currentUser.id || (b.guestPhone && b.guestPhone === currentUser.phone)
  );

  const upcomingBookings = userBookings.filter(
    (b) => b.status === 'pending' || b.status === 'confirmed'
  );

  const historyBookings = userBookings.filter(
    (b) => b.status === 'completed' || b.status === 'cancelled' || b.status === 'no_show'
  );

  const handleCancel = (bookingId: string) => {
    setCancelError('');
    setCancelSuccess('');
    const res = cancelBooking(bookingId);
    if (!res.success) {
      setCancelError(res.error || 'Failed to cancel');
    } else {
      setCancelSuccess('Booking cancelled successfully.');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen py-10 bg-slate-50 dark:bg-[#07080D] transition-colors duration-200">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header Profile Card */}
        <div className="rounded-2xl border border-slate-200 dark:border-[#23273A] bg-white dark:bg-[#0E1018] p-6 shadow-xl shadow-slate-200/50 dark:shadow-none">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div
                className="flex h-16 w-16 items-center justify-center rounded-2xl border text-xl font-black text-white shadow-md"
                style={{
                  backgroundColor: progress.currentTier.badgeBg,
                  borderColor: progress.currentTier.color,
                }}
              >
                {currentUser.fullName.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-display text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                    {currentUser.fullName}
                  </h1>
                  <span
                    className="rounded-full px-2.5 py-0.5 text-[10px] font-bold"
                    style={{
                      color: progress.currentTier.color,
                      backgroundColor: progress.currentTier.badgeBg,
                    }}
                  >
                    {lang === 'bn' ? progress.currentTier.nameBn : progress.currentTier.name} Tier
                  </span>
                  {currentUser.role === 'admin' && (
                    <span className="rounded bg-[#8B6CFF] px-2 py-0.5 text-[10px] font-bold text-white uppercase">
                      Admin
                    </span>
                  )}
                </div>
                <div className="mt-1 flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                  <span>Phone: {maskPhone(currentUser.phone)}</span>
                  {currentUser.nickname && (
                    <>
                      <span>·</span>
                      <span>@{currentUser.nickname}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {currentUser.role === 'admin' && (
                <Link
                  to="/admin"
                  className="flex items-center gap-1.5 rounded-xl border border-[#8B6CFF]/40 bg-purple-50 dark:bg-[#8B6CFF]/15 px-3 py-2 text-xs font-bold text-[#8B6CFF] hover:bg-purple-100 dark:hover:bg-[#8B6CFF]/25 transition"
                >
                  <Shield className="h-4 w-4" />
                  <span>Admin Inbox</span>
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-[#151826] px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10 transition"
              >
                <LogOut className="h-4 w-4" />
                <span>{t.logout}</span>
              </button>
            </div>
          </div>

          {/* Tier Progress Bar */}
          <div className="mt-6 border-t border-slate-100 dark:border-white/5 pt-6 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-300">{t.tierProgress}</span>
              <span className="text-slate-500 dark:text-slate-400">
                {progress.nextTier
                  ? `${progress.sessionsNeededForNext} more sessions to reach ${progress.nextTier.name}`
                  : 'Maximum Diamond rank achieved!'}
              </span>
            </div>
            <div className="h-2.5 w-full rounded-full bg-slate-100 dark:bg-[#151826] overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${progress.progressPercent}%`,
                  backgroundColor: progress.currentTier.color,
                }}
              />
            </div>
          </div>

          {/* Stats Bar */}
          <div className="mt-6 grid grid-cols-3 gap-3 border-t border-slate-100 dark:border-white/5 pt-6 text-center">
            <div className="rounded-xl bg-slate-50 dark:bg-[#151826] p-3 border border-slate-100 dark:border-transparent">
              <span className="text-slate-500 dark:text-slate-400 text-[11px] block">Completed</span>
              <span className="font-display text-xl font-bold text-slate-900 dark:text-white tabular-nums">
                {currentUser.sessionsCompleted}
              </span>
            </div>
            <div className="rounded-xl bg-slate-50 dark:bg-[#151826] p-3 border border-slate-100 dark:border-transparent">
              <span className="text-slate-500 dark:text-slate-400 text-[11px] block">Total Playtime</span>
              <span className="font-display text-xl font-bold text-slate-900 dark:text-white tabular-nums">
                {currentUser.totalHours} hrs
              </span>
            </div>
            <div className="rounded-xl bg-slate-50 dark:bg-[#151826] p-3 border border-slate-100 dark:border-transparent">
              <span className="text-slate-500 dark:text-slate-400 text-[11px] block">Status</span>
              <span className="font-display text-xl font-bold text-emerald-600 dark:text-[#2BD98A]">
                Active
              </span>
            </div>
          </div>
        </div>

        {/* Feedback banners */}
        {cancelError && (
          <div className="flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/30 p-3 text-xs text-red-500 dark:text-red-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{cancelError}</span>
          </div>
        )}
        {cancelSuccess && (
          <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-3 text-xs text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{cancelSuccess}</span>
          </div>
        )}

        {/* Bookings Section */}
        <div className="rounded-2xl border border-slate-200 dark:border-[#23273A] bg-white dark:bg-[#0E1018] p-6 space-y-6 shadow-sm dark:shadow-none">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#23273A] pb-4">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('upcoming')}
                className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                  activeTab === 'upcoming'
                    ? 'bg-[#4F7CFF] text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {t.upcomingBookings} ({upcomingBookings.length})
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                  activeTab === 'history'
                    ? 'bg-[#4F7CFF] text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {t.bookingHistory} ({historyBookings.length})
              </button>
            </div>
            <Link
              to="/book"
              className="rounded-xl bg-[#4F7CFF]/15 border border-[#4F7CFF]/40 px-3.5 py-1.5 text-xs font-bold text-[#4F7CFF] hover:bg-[#4F7CFF]/25 transition"
            >
              + Book New Slot
            </Link>
          </div>

          {activeTab === 'upcoming' ? (
            upcomingBookings.length > 0 ? (
              <div className="space-y-3">
                {upcomingBookings.map((b) => (
                  <div
                    key={b.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between rounded-xl border border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-[#151826] p-4 gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-display font-bold text-slate-900 dark:text-white text-sm">
                          Code: {b.code}
                        </span>
                        <span className="rounded bg-sky-100 dark:bg-[#3DA9FC]/20 px-2 py-0.5 text-[10px] font-bold text-sky-700 dark:text-[#3DA9FC] uppercase">
                          {b.platform}
                        </span>
                        <span className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
                          b.status === 'confirmed'
                            ? 'bg-emerald-100 dark:bg-[#2BD98A]/20 text-emerald-700 dark:text-[#2BD98A]'
                            : 'bg-amber-100 dark:bg-amber-400/20 text-amber-800 dark:text-amber-400'
                        }`}>
                          {b.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300">
                        {new Date(b.startAt).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                        })}{' '}
                        at{' '}
                        {new Date(b.startAt).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}{' '}
                        ({b.players} Players)
                      </p>
                      <p className="text-[11px] text-emerald-600 dark:text-[#2BD98A] font-semibold">
                        Estimated: {formatBdt(b.estimatedBdt, lang)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCancel(b.id)}
                        className="flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-50 dark:bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 transition"
                      >
                        <XCircle className="h-4 w-4" />
                        <span>{t.cancelBookingBtn}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-10 text-center text-xs text-slate-500 dark:text-slate-400 space-y-3">
                <Calendar className="mx-auto h-8 w-8 text-slate-400 dark:text-slate-600" />
                <p>{t.noUpcoming}</p>
                <Link
                  to="/book"
                  className="inline-block rounded-xl bg-[#4F7CFF] px-4 py-2 text-xs font-bold text-white hover:bg-[#3b68ee]"
                >
                  Book a Station Now
                </Link>
              </div>
            )
          ) : historyBookings.length > 0 ? (
            <div className="space-y-3">
              {historyBookings.map((b) => (
                <div
                  key={b.id}
                  className="flex items-center justify-between rounded-xl border border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-[#151826] p-4 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-white">Code: {b.code}</span>
                      <span className="uppercase text-slate-500 dark:text-slate-400 text-[10px] font-bold">
                        {b.platform}
                      </span>
                      <span className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
                        b.status === 'completed'
                          ? 'bg-emerald-100 dark:bg-[#2BD98A]/20 text-emerald-700 dark:text-[#2BD98A]'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                      }`}>
                        {b.status}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-1">
                      {new Date(b.startAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-slate-900 dark:text-white tabular-nums">
                      {formatBdt(b.estimatedBdt, lang)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-10 text-center text-xs text-slate-500 dark:text-slate-400 space-y-2">
              <Clock className="mx-auto h-8 w-8 text-slate-400 dark:text-slate-600" />
              <p>{t.noHistory}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
