import React, { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { Check, Calendar, Clock, ArrowRight, ArrowLeft, MessageCircle, AlertCircle, AlertTriangle } from 'lucide-react';
import { useStore, Booking } from '../lib/store';
import { estimatePrice } from '../lib/pricing';
import { formatBdt, formatDurationMinutes } from '../lib/format';
import { translations } from '../i18n/translations';
import { normalizePhone } from '../lib/phone';

function getArrivalWindow(timeSlotStr: string): string {
  if (!timeSlotStr || !timeSlotStr.includes(':')) return '10–20 mins before slot';
  const [h, m] = timeSlotStr.split(':').map(Number);
  const totalMins = h * 60 + m;
  const early20 = totalMins - 20;
  const early10 = totalMins - 10;

  const formatTime = (mins: number) => {
    const normalized = (mins + 1440) % 1440;
    const hour24 = Math.floor(normalized / 60);
    const minute = normalized % 60;
    const period = hour24 >= 12 ? 'PM' : 'AM';
    const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
    return `${hour12}:${minute.toString().padStart(2, '0')} ${period}`;
  };

  return `${formatTime(early20)} – ${formatTime(early10)}`;
}

export const BookPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { games, settings, currentUser, createBooking, pricingRules, pricingPackages, lang } = useStore();
  const t = translations[lang];

  // Pre-fill from query params if available
  const initialPlatform = (searchParams.get('platform') as 'ps5' | 'ps4') || 'ps5';
  const initialGameId = searchParams.get('game') || '';
  const initialDuration = Number(searchParams.get('duration')) || 60;
  const initialPlayers = Number(searchParams.get('players')) || 2;

  const [step, setStep] = useState<number>(1);
  const [platform, setPlatform] = useState<'ps5' | 'ps4'>(initialPlatform);
  const [selectedGameId, setSelectedGameId] = useState<string>(initialGameId);
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1); // Default to tomorrow
    return d.toISOString().split('T')[0];
  });
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('16:00'); // 4:00 PM
  const [durationMinutes, setDurationMinutes] = useState<number>(initialDuration);
  const [players, setPlayers] = useState<number>(initialPlayers);
  const [notes, setNotes] = useState<string>('');

  // Guest fields if not logged in
  const [guestName, setGuestName] = useState<string>('');
  const [guestPhone, setGuestPhone] = useState<string>('');
  const [formError, setFormError] = useState<string>('');

  // Successful submission result
  const [createdBooking, setCreatedBooking] = useState<Booking | null>(null);

  // Generate 14-day date strip
  const dateOptions = Array.from({ length: 14 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + (i === 0 ? 0 : i)); // Today to +13 days
    const dateStr = d.toISOString().split('T')[0];
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
    const dayNum = d.getDate();
    const monthName = d.toLocaleDateString('en-US', { month: 'short' });
    return { dateStr, dayName, dayNum, monthName, isToday: i === 0 };
  });

  // Common slots (14:00 to 22:30 in 30-min increments)
  const timeSlots = [
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
    '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
    '20:00', '20:30', '21:00', '21:30', '22:00', '22:30'
  ];

  // Price estimate calculation
  const estimate = estimatePrice({
    platform,
    durationMinutes,
    players,
    rule: pricingRules[platform],
    packages: pricingPackages,
    priceRounding: settings.priceRounding,
  });

  const selectedGame = games.find((g) => g.id === selectedGameId);
  const arrivalWindow = getArrivalWindow(selectedTimeSlot);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!currentUser) {
      if (!guestName.trim()) {
        setFormError('Please enter your name.');
        return;
      }
      const phoneValidation = normalizePhone(guestPhone);
      if (!phoneValidation.isValid) {
        setFormError(phoneValidation.error || 'Please enter a valid Bangladeshi phone number.');
        return;
      }
    }

    // Construct start date
    const startIso = `${selectedDate}T${selectedTimeSlot}:00`;

    const res = createBooking({
      platform,
      startAt: startIso,
      durationMinutes,
      players,
      gameId: selectedGameId || undefined,
      note: notes.trim() || undefined,
      guestName: !currentUser ? guestName.trim() : undefined,
      guestPhone: !currentUser ? normalizePhone(guestPhone).normalized : undefined,
    });

    if (!res.success || !res.booking) {
      setFormError(res.error || 'Failed to create booking.');
      return;
    }

    setCreatedBooking(res.booking);
    // Fire celebration confetti
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {
      // Ignore if confetti not supported
    }
  };

  // WhatsApp click handler with arrival buffer commitment
  const getWhatsAppBookingUrl = () => {
    if (!createdBooking) return '';
    const phone = settings.whatsapp;
    const msg =
      lang === 'bn'
        ? `হ্যালো ভাই ব্রাদার ভিডিও গেম, আমি একটি বুকিং রিকোয়েস্ট করেছি!\n\nরেফারেন্স কোড: ${createdBooking.code}\nকনসোল: ${createdBooking.platform.toUpperCase()}\nতারিখ ও সময়: ${selectedDate} ${selectedTimeSlot}\nসময়সীমা: ${durationMinutes} মিনিট (${players} জন প্লেয়ার)\nআনুমানিক বিল: ৳${createdBooking.estimatedBdt}\nউপস্থিতির সময়: ${arrivalWindow} (১০-২০ মিনিট আগে শপে উপস্থিত থাকবো)\n\nদয়া করে কনফার্ম করবেন। ধন্যবাদ!`
        : `Hello Bhai Brother Video Game, I have submitted a booking request!\n\nBooking Code: ${createdBooking.code}\nConsole: ${createdBooking.platform.toUpperCase()}\nDate & Time: ${selectedDate} at ${selectedTimeSlot}\nDuration: ${durationMinutes} mins (${players} Players)\nEst. Total: ৳${createdBooking.estimatedBdt}\nArrival Window: ${arrivalWindow} (Will arrive 10-20 mins early)\n\nPlease confirm my slot. Thank you!`;

    return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
  };

  // Success view
  if (createdBooking) {
    return (
      <div className="min-h-screen py-16 bg-slate-50 dark:bg-[#07080D] transition-colors">
        <div className="mx-auto max-w-lg px-4 text-center space-y-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#2BD98A]/20 text-[#2BD98A] border border-[#2BD98A]/40 shadow-lg shadow-[#2BD98A]/20">
            <Check className="h-8 w-8 stroke-[3]" />
          </div>

          <div className="space-y-2">
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {t.bookingSuccessTitle}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              {t.bookingSuccessNote}
            </p>
          </div>

          {/* Reference Code Card */}
          <div className="rounded-2xl border border-[#4F7CFF]/40 bg-white dark:bg-[#0E1018] p-6 shadow-2xl relative overflow-hidden transition-colors">
            <div className="text-xs uppercase font-bold tracking-wider text-[#4F7CFF] mb-1">
              {t.bookingCodeLabel}
            </div>
            <div className="font-display text-4xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-widest tabular-nums select-all py-1">
              {createdBooking.code}
            </div>

            {/* Crucial Arrival Buffer Banner */}
            <div className="mt-4 rounded-xl border border-amber-300 dark:border-amber-500/40 bg-amber-50 dark:bg-amber-500/10 p-3.5 text-left text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-amber-900 dark:text-amber-400">
                <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                <span>
                  {lang === 'bn' ? 'উপস্থিতির বাধ্যতামূলক সময়সূচি' : 'Mandatory Early Arrival Window'}
                </span>
              </div>
              <p className="text-slate-800 dark:text-slate-200">
                {lang === 'bn' ? 'আপনাকে শপে উপস্থিত হতে হবে:' : 'You must arrive at the shop between:'}{' '}
                <strong className="text-amber-800 dark:text-amber-300 font-extrabold">{arrivalWindow}</strong>{' '}
                {lang === 'bn' ? '(স্লটের ১০–২০ মিনিট পূর্বে)' : '(10–20 mins before slot time)'}
              </p>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">
                {lang === 'bn'
                  ? '১০ মিনিট পূর্বে উপস্থিত না হলে অপেক্ষমান ওয়াক-ইন প্লেয়ারকে স্লটটি ছেড়ে দেওয়া হতে পারে।'
                  : 'If you do not arrive at least 10 minutes prior, the station may be released to waiting walk-in players.'}
              </p>
            </div>

            <div className="mt-4 border-t border-slate-100 dark:border-white/5 pt-4 text-xs text-slate-600 dark:text-slate-300 space-y-1 text-left">
              <p>Console: <strong className="text-slate-900 dark:text-white uppercase">{createdBooking.platform}</strong></p>
              <p>Slot Time: <strong className="text-slate-900 dark:text-white">{selectedDate} at {selectedTimeSlot}</strong> ({durationMinutes} mins)</p>
              <p>Players: <strong className="text-slate-900 dark:text-white">{createdBooking.players} Players</strong></p>
              <p>Estimated Bill: <strong className="text-[#119A5F] dark:text-[#2BD98A]">৳{createdBooking.estimatedBdt}</strong></p>
            </div>
          </div>

          {/* WhatsApp Direct Action Button */}
          <div className="space-y-3 pt-2">
            <a
              href={getWhatsAppBookingUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] py-3.5 text-sm font-bold text-white shadow-lg shadow-[#25D366]/30 hover:bg-[#20ba5a] transition active:scale-95"
            >
              <MessageCircle className="h-5 w-5 fill-white text-transparent" />
              <span>{t.sendWhatsAppBtn}</span>
            </a>

            <div className="flex gap-3 justify-center text-xs">
              <Link to="/profile" className="text-[#4F7CFF] font-semibold hover:underline">
                View in My Profile →
              </Link>
              <span className="text-slate-400">·</span>
              <button
                onClick={() => {
                  setCreatedBooking(null);
                  setStep(1);
                }}
                className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
              >
                Book Another Slot
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 bg-slate-50 dark:bg-[#07080D] transition-colors">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#4F7CFF]">
            {lang === 'bn' ? 'অনলাইন স্লট রিজার্ভেশন' : 'Online Booking Wizard'}
          </span>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
            {t.bookTitle}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            {lang === 'bn'
              ? '৩০ মিনিট বা ১ ঘণ্টার স্লট বুক করুন। স্লট নিশ্চিত করতে ১০–২০ মিনিট আগে শপে উপস্থিত থাকুন।'
              : 'Book 30 mins or hourly sessions on PS5 & PS4. Please arrive 10–20 mins early to secure your station.'}
          </p>
        </div>

        {/* Wizard Steps Navigation Bar */}
        <div className="flex items-center justify-between rounded-xl bg-white dark:bg-[#0E1018] p-3 border border-slate-200 dark:border-[#23273A] text-xs font-bold shadow-sm transition-colors">
          <button
            onClick={() => setStep(1)}
            className={`flex items-center gap-1.5 transition ${step === 1 ? 'text-[#4F7CFF]' : 'text-slate-500 dark:text-slate-400'}`}
          >
            <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] ${step === 1 ? 'bg-[#4F7CFF] text-white' : 'bg-slate-100 dark:bg-[#151826]'}`}>1</span>
            <span className="hidden sm:inline">{t.step1}</span>
          </button>
          <span className="text-slate-400 dark:text-slate-600">→</span>
          <button
            onClick={() => setStep(2)}
            className={`flex items-center gap-1.5 transition ${step === 2 ? 'text-[#4F7CFF]' : 'text-slate-500 dark:text-slate-400'}`}
          >
            <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] ${step === 2 ? 'bg-[#4F7CFF] text-white' : 'bg-slate-100 dark:bg-[#151826]'}`}>2</span>
            <span className="hidden sm:inline">{t.step2}</span>
          </button>
          <span className="text-slate-400 dark:text-slate-600">→</span>
          <button
            onClick={() => setStep(3)}
            className={`flex items-center gap-1.5 transition ${step === 3 ? 'text-[#4F7CFF]' : 'text-slate-500 dark:text-slate-400'}`}
          >
            <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] ${step === 3 ? 'bg-[#4F7CFF] text-white' : 'bg-slate-100 dark:bg-[#151826]'}`}>3</span>
            <span className="hidden sm:inline">{t.step3}</span>
          </button>
          <span className="text-slate-400 dark:text-slate-600">→</span>
          <button
            onClick={() => setStep(4)}
            className={`flex items-center gap-1.5 transition ${step === 4 ? 'text-[#4F7CFF]' : 'text-slate-500 dark:text-slate-400'}`}
          >
            <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] ${step === 4 ? 'bg-[#4F7CFF] text-white' : 'bg-slate-100 dark:bg-[#151826]'}`}>4</span>
            <span className="hidden sm:inline">{t.step4}</span>
          </button>
        </div>

        {formError && (
          <div className="flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/30 p-3 text-xs text-red-500 dark:text-red-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* STEP 1: Platform & Console */}
          {step === 1 && (
            <div className="rounded-2xl border border-slate-200 dark:border-[#23273A] bg-white dark:bg-[#0E1018] p-6 space-y-6 transition-colors shadow-sm">
              <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Check className="h-5 w-5 text-[#4F7CFF]" />
                <span>Select Your Gaming Platform</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* PS5 Choice */}
                <button
                  type="button"
                  onClick={() => setPlatform('ps5')}
                  className={`flex flex-col items-start rounded-2xl border p-5 text-left transition ${
                    platform === 'ps5'
                      ? 'border-[#3DA9FC] bg-[#3DA9FC]/10 ps5-glow'
                      : 'border-slate-200 dark:border-[#23273A] bg-slate-50 dark:bg-[#151826] hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <span className="rounded bg-[#3DA9FC]/20 px-2 py-0.5 text-[10px] font-bold text-[#1C7FD0] dark:text-[#3DA9FC] uppercase">
                    4K Ultra HD · DualSense
                  </span>
                  <span className="mt-2 font-display text-lg font-bold text-slate-900 dark:text-white">
                    PlayStation 5
                  </span>
                  <div className="mt-1 space-y-0.5 text-xs text-slate-600 dark:text-slate-300">
                    <p className="font-semibold text-emerald-600 dark:text-[#2BD98A]">
                      30 Mins: ৳35 (1P) · ৳70 (2P)
                    </p>
                    <p className="text-slate-500 dark:text-slate-400">
                      1 Hour: ৳70 (1P) · ৳140 (2P)
                    </p>
                  </div>
                </button>

                {/* PS4 Choice */}
                <button
                  type="button"
                  onClick={() => setPlatform('ps4')}
                  className={`flex flex-col items-start rounded-2xl border p-5 text-left transition ${
                    platform === 'ps4'
                      ? 'border-[#8B6CFF] bg-[#8B6CFF]/10 ps4-glow'
                      : 'border-slate-200 dark:border-[#23273A] bg-slate-50 dark:bg-[#151826] hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <span className="rounded bg-[#8B6CFF]/20 px-2 py-0.5 text-[10px] font-bold text-[#6A4BE0] dark:text-[#8B6CFF] uppercase">
                    Pro Console · DualShock
                  </span>
                  <span className="mt-2 font-display text-lg font-bold text-slate-900 dark:text-white">
                    PlayStation 4
                  </span>
                  <div className="mt-1 space-y-0.5 text-xs text-slate-600 dark:text-slate-300">
                    <p className="font-semibold text-emerald-600 dark:text-[#2BD98A]">
                      30 Mins: ৳25 (1P) · ৳50 (2P)
                    </p>
                    <p className="text-slate-500 dark:text-slate-400">
                      1 Hour: ৳50 (1P) · ৳100 (2P)
                    </p>
                  </div>
                </button>
              </div>

              {/* Optional Game Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">
                  Select Game (Optional)
                </label>
                <select
                  value={selectedGameId}
                  onChange={(e) => setSelectedGameId(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-[#151826] p-3 text-xs text-slate-800 dark:text-white focus:border-[#4F7CFF] focus:outline-none"
                >
                  <option value="">No specific game preference (Choose on arrival)</option>
                  {games
                    .filter((g) => g.platforms.includes(platform))
                    .map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.title} (1–{g.maxPlayers}P)
                      </option>
                    ))}
                </select>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex items-center gap-2 rounded-xl bg-[#4F7CFF] px-6 py-2.5 text-xs font-bold text-white hover:bg-[#3b68ee] transition shadow-md shadow-[#4F7CFF]/20"
                >
                  <span>Next: Choose Date & Slot</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Date & Slot Picker */}
          {step === 2 && (
            <div className="rounded-2xl border border-slate-200 dark:border-[#23273A] bg-white dark:bg-[#0E1018] p-6 space-y-6 transition-colors shadow-sm">
              <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Calendar className="h-5 w-5 text-[#4F7CFF]" />
                <span>Select Date & Time Slot</span>
              </h3>

              {/* Crucial Arrival Buffer Policy Reminder */}
              <div className="rounded-xl border border-amber-300 dark:border-amber-500/40 bg-amber-50 dark:bg-amber-500/10 p-3.5 flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <p className="font-bold text-amber-900 dark:text-amber-300">
                    {lang === 'bn' ? '১০ থেকে ২০ মিনিট আগে উপস্থিতি বাধ্যতামূলক' : '10 to 20 Minutes Early Arrival Policy'}
                  </p>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                    {lang === 'bn'
                      ? `আপনার নির্বাচিত স্লটের (${selectedTimeSlot}) অন্তত ১০ থেকে ২০ মিনিট আগে (${arrivalWindow}) শপে উপস্থিত থাকতে হবে। ১০ মিনিট আগে উপস্থিত না হলে স্লটটি অন্য খেলোয়াড়কে দিয়ে দেওয়া হতে পারে।`
                      : `You must arrive at the shop 10 to 20 minutes before your slot time (${arrivalWindow} for ${selectedTimeSlot} slot). Failure to arrive at least 10 mins prior may release your station to waiting walk-in players.`}
                  </p>
                </div>
              </div>

              {/* 14-day horizontal date strip */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">
                  Choose Booking Date
                </label>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                  {dateOptions.map((d) => (
                    <button
                      key={d.dateStr}
                      type="button"
                      onClick={() => setSelectedDate(d.dateStr)}
                      className={`flex flex-col items-center justify-center rounded-xl p-3 min-w-[72px] border transition ${
                        selectedDate === d.dateStr
                          ? 'border-[#4F7CFF] bg-[#4F7CFF] text-white shadow-md'
                          : 'border-slate-200 dark:border-[#23273A] bg-slate-50 dark:bg-[#151826] text-slate-700 dark:text-slate-300 hover:border-slate-400 dark:hover:border-slate-600'
                      }`}
                    >
                      <span className="text-[10px] font-bold uppercase">{d.dayName}</span>
                      <span className="text-lg font-bold">{d.dayNum}</span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-300">{d.monthName}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 30-min time slot buttons */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                    Select Starting Slot (Dhaka Time)
                  </label>
                  <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400">
                    Arrival window: {arrivalWindow}
                  </span>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {timeSlots.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setSelectedTimeSlot(slot)}
                      className={`rounded-xl py-2.5 text-xs font-bold transition ${
                        selectedTimeSlot === slot
                          ? 'bg-[#4F7CFF] text-white shadow-md'
                          : 'bg-slate-100 dark:bg-[#151826] text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-[#1f2337]'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="flex items-center gap-2 rounded-xl bg-[#4F7CFF] px-6 py-2.5 text-xs font-bold text-white hover:bg-[#3b68ee] transition shadow-md shadow-[#4F7CFF]/20"
                >
                  <span>Next: Duration & Players</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Duration, Players & Notes */}
          {step === 3 && (
            <div className="rounded-2xl border border-slate-200 dark:border-[#23273A] bg-white dark:bg-[#0E1018] p-6 space-y-6 transition-colors shadow-sm">
              <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="h-5 w-5 text-[#4F7CFF]" />
                <span>Session Duration & Squad Size</span>
              </h3>

              {/* Duration Stepper with 30 Mins Prominently Featured */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                    Choose Duration (Now 30 Minutes Available!)
                  </label>
                  <span className="text-[11px] font-bold text-emerald-600 dark:text-[#2BD98A]">
                    {durationMinutes === 30 ? '30 Mins Quick Session Selected' : `${durationMinutes / 60} Hour(s)`}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {[
                    { mins: 30, label: '30 Mins', sub: platform === 'ps5' ? '৳35 (1P) / ৳70 (2P)' : '৳25 (1P) / ৳50 (2P)', tag: 'Quick Match ⚡' },
                    { mins: 60, label: '1 Hour (60m)', sub: platform === 'ps5' ? '৳70 (1P) / ৳140 (2P)' : '৳50 (1P) / ৳100 (2P)', tag: 'Standard' },
                    { mins: 90, label: '1.5 Hours (90m)', sub: 'Extended Match', tag: '' },
                    { mins: 120, label: '2 Hours (120m)', sub: 'Tournament Prep', tag: '' },
                    { mins: 180, label: '3 Hours (180m)', sub: 'Squad Pass Discount', tag: 'Discount ⭐' },
                    { mins: 240, label: '4 Hours (240m)', sub: 'Marathon Session', tag: '' },
                  ].map((item) => (
                    <button
                      key={item.mins}
                      type="button"
                      onClick={() => setDurationMinutes(item.mins)}
                      className={`flex flex-col items-start rounded-xl p-3 border text-left transition ${
                        durationMinutes === item.mins
                          ? 'border-[#4F7CFF] bg-[#4F7CFF] text-white shadow-md'
                          : 'border-slate-200 dark:border-[#23273A] bg-slate-50 dark:bg-[#151826] text-slate-700 dark:text-slate-300 hover:border-slate-400 dark:hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="font-bold text-xs">{item.label}</span>
                        {item.tag && (
                          <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase ${
                            durationMinutes === item.mins
                              ? 'bg-white/20 text-white'
                              : 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                          }`}>
                            {item.tag}
                          </span>
                        )}
                      </div>
                      <span className={`text-[10px] mt-1 ${
                        durationMinutes === item.mins ? 'text-white/80' : 'text-slate-500 dark:text-slate-400'
                      }`}>
                        {item.sub}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Players Stepper */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">
                  Number of Players (Max 4 per station)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[1, 2, 3, 4].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setPlayers(num)}
                      className={`flex flex-col items-center justify-center rounded-xl py-3 border transition ${
                        players === num
                          ? 'border-[#4F7CFF] bg-[#4F7CFF] text-white shadow-md'
                          : 'border-slate-200 dark:border-[#23273A] bg-slate-50 dark:bg-[#151826] text-slate-700 dark:text-slate-300 hover:border-slate-400 dark:hover:border-slate-600'
                      }`}
                    >
                      <span className="font-extrabold text-sm">{num} {num === 1 ? 'Player' : 'Players'}</span>
                      <span className={`text-[10px] ${players === num ? 'text-white/80' : 'text-slate-500 dark:text-slate-400'}`}>
                        {num === 1 ? 'Solo' : num === 2 ? '1v1 Match' : 'Squad Match'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Special Note */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">
                  Special Request or Note (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Need 4 controllers for FC 26, tournament practice..."
                  maxLength={200}
                  rows={2}
                  className="w-full rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-[#151826] p-3 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:border-[#4F7CFF] focus:outline-none"
                />
              </div>

              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStep(4)}
                  className="flex items-center gap-2 rounded-xl bg-[#4F7CFF] px-6 py-2.5 text-xs font-bold text-white hover:bg-[#3b68ee] transition shadow-md shadow-[#4F7CFF]/20"
                >
                  <span>Next: Review & Submit</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Review, Guest info & Submit */}
          {step === 4 && (
            <div className="rounded-2xl border border-slate-200 dark:border-[#23273A] bg-white dark:bg-[#0E1018] p-6 space-y-6 transition-colors shadow-sm">
              <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Check className="h-5 w-5 text-[#2BD98A]" />
                <span>Review & Confirm Request</span>
              </h3>

              {/* Summary Card with Arrival Window */}
              <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#151826] p-4 space-y-3 text-xs">
                <div className="flex justify-between border-b border-slate-200 dark:border-white/5 pb-2">
                  <span className="text-slate-500 dark:text-slate-400">Platform:</span>
                  <span className="font-bold text-slate-900 dark:text-white uppercase">{platform}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 dark:border-white/5 pb-2">
                  <span className="text-slate-500 dark:text-slate-400">Date & Slot:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{selectedDate} at {selectedTimeSlot}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 dark:border-white/5 pb-2">
                  <span className="text-slate-500 dark:text-slate-400">Duration & Players:</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {formatDurationMinutes(durationMinutes, lang)} · {players} Players
                  </span>
                </div>
                <div className="flex justify-between border-b border-amber-200 dark:border-amber-500/20 bg-amber-50/70 dark:bg-amber-500/10 p-2 rounded-lg">
                  <span className="font-semibold text-amber-900 dark:text-amber-400">Mandatory Arrival Window:</span>
                  <span className="font-extrabold text-amber-900 dark:text-amber-300">
                    {arrivalWindow} (10–20 mins early)
                  </span>
                </div>
                {selectedGame && (
                  <div className="flex justify-between border-b border-slate-200 dark:border-white/5 pb-2">
                    <span className="text-slate-500 dark:text-slate-400">Preferred Game:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{selectedGame.title}</span>
                  </div>
                )}
                <div className="flex justify-between pt-1 text-sm font-bold">
                  <span className="text-slate-700 dark:text-slate-300">Estimated Total:</span>
                  <span className="font-display text-lg text-[#119A5F] dark:text-[#2BD98A] tabular-nums">
                    {formatBdt(estimate.finalBdt, lang)}
                  </span>
                </div>
              </div>

              {/* Guest Phone and Name if not logged in */}
              {!currentUser && (
                <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#151826] p-4 space-y-4">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      Contact Information for Confirmation
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Already registered?{' '}
                      <Link to="/login" className="text-[#4F7CFF] underline">
                        Log in here
                      </Link>
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                        Your Full Name *
                      </label>
                      <input
                        type="text"
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        placeholder="e.g. Rafi Ahmed"
                        className="w-full rounded-lg border border-slate-300 dark:border-white/10 bg-white dark:bg-[#0E1018] px-3 py-2 text-xs text-slate-900 dark:text-white focus:border-[#4F7CFF] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                        Mobile Number * (e.g. 01712-345678)
                      </label>
                      <input
                        type="tel"
                        value={guestPhone}
                        onChange={(e) => setGuestPhone(e.target.value)}
                        placeholder="01XXXXXXXXX"
                        className="w-full rounded-lg border border-slate-300 dark:border-white/10 bg-white dark:bg-[#0E1018] px-3 py-2 text-xs text-slate-900 dark:text-white focus:border-[#4F7CFF] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back</span>
                </button>

                <button
                  type="submit"
                  className="flex items-center gap-2 rounded-xl bg-[#2BD98A] px-6 py-3 text-xs font-extrabold text-slate-950 hover:bg-[#43e69b] transition shadow-lg shadow-[#2BD98A]/20 active:scale-95"
                >
                  <span>Submit Booking Request</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
