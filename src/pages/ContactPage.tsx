import React from 'react';
import { MapPin, Phone, MessageCircle, Clock, CheckCircle2 } from 'lucide-react';
import { useStore } from '../lib/store';
import { OpenBadge } from '../components/OpenBadge';
import { getDhakaTimeParts, format12Hour } from '../lib/hours';
import { translations } from '../i18n/translations';

export const ContactPage: React.FC = () => {
  const { settings, weeklyHours, lang } = useStore();
  const t = translations[lang];

  const currentDhaka = getDhakaTimeParts(new Date());
  const primaryPhone = settings.phones[0] || '01775-533852';
  const cleanPhone = primaryPhone.replace(/[\s\-()]/g, '');

  return (
    <div className="min-h-screen py-10 bg-slate-50 dark:bg-[#07080D] transition-colors duration-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Header */}
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#4F7CFF]">
            {lang === 'bn' ? 'ঠিকানা ও যোগাযোগের তথ্য' : 'Find Us & Hours'}
          </span>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
            {lang === 'bn' ? 'আমাদের গেমিং জোনে আসুন' : 'Hours & Location'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
            {lang === 'bn'
              ? 'গ্রিন সিটি ব্লক সি, ঢাকা উদ্যান, মোহাম্মদপুর। স্পর্শ বিউটি বাজ এর ঠিক পাশেই অবস্থিত।'
              : 'Located at Green City Residential, Block C, Dhaka Uddan, Mohammadpur, right beside Sporsho Beauty Buzz.'}
          </p>
        </div>

        {/* Live Badge and Call Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Status Card */}
          <div className="rounded-2xl border border-slate-200 dark:border-[#23273A] bg-white dark:bg-[#0E1018] p-6 space-y-3 shadow-sm dark:shadow-none">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {lang === 'bn' ? 'বর্তমান অবস্থা' : 'Current Status'}
            </span>
            <div>
              <OpenBadge />
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              {lang === 'bn'
                ? 'সপ্তাহের ৭ দিনই খেলা চলছে। উইকেন্ডে রাত ১টা পর্যন্ত খোলা থাকে।'
                : 'Open 7 days a week in Asia/Dhaka time. Late night on Thursdays till 1 AM.'}
            </p>
          </div>

          {/* Phone Call Card */}
          <div className="rounded-2xl border border-slate-200 dark:border-[#23273A] bg-white dark:bg-[#0E1018] p-6 space-y-3 shadow-sm dark:shadow-none">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {lang === 'bn' ? 'সরাসরি কল' : 'Call Counter'}
            </span>
            <div className="font-display text-xl font-bold text-slate-900 dark:text-white">
              {primaryPhone}
            </div>
            <a
              href={`tel:${cleanPhone}`}
              className="inline-flex items-center gap-2 rounded-xl bg-[#4F7CFF] px-4 py-2 text-xs font-bold text-white hover:bg-[#3b68ee] transition shadow-md shadow-[#4F7CFF]/20"
            >
              <Phone className="h-4 w-4" />
              <span>{t.callUs}</span>
            </a>
          </div>

          {/* WhatsApp Card */}
          <div className="rounded-2xl border border-slate-200 dark:border-[#23273A] bg-white dark:bg-[#0E1018] p-6 space-y-3 shadow-sm dark:shadow-none">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {lang === 'bn' ? 'হোয়াটসঅ্যাপ চ্যাট' : 'WhatsApp Desk'}
            </span>
            <div className="font-display text-xl font-bold text-[#25D366]">
              +{settings.whatsapp}
            </div>
            <a
              href={`https://wa.me/${settings.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-4 py-2 text-xs font-bold text-white hover:bg-[#20ba5a] transition shadow-md shadow-[#25D366]/20"
            >
              <MessageCircle className="h-4 w-4 fill-white text-transparent" />
              <span>{t.whatsAppUs}</span>
            </a>
          </div>
        </div>

        {/* Map and Weekly Hours Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Map Column */}
          <div className="lg:col-span-7 space-y-4">
            <div className="rounded-2xl border border-blue-200 dark:border-[#4F7CFF]/30 bg-blue-50/80 dark:bg-[#4F7CFF]/10 p-5 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-[#4F7CFF] uppercase">
                <MapPin className="h-4 w-4" />
                <span>Crucial Landmark & Walking Instructions</span>
              </div>
              <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                {lang === 'bn' ? 'স্পর্শ বিউটি বাজ এর ঠিক পাশে' : 'Located Right Beside Sporsho Beauty Buzz'}
              </h3>
              <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed">
                {lang === 'bn'
                  ? 'ঢাকা উদ্যান মেইন রোড ধরে গ্রিন সিটি আবাসিক ব্লক সি তে ঢুকলেই স্পর্শ বিউটি বাজ দেখতে পাবেন। এর ঠিক পাশেই ভাই ব্রাদার ভিডিও গেম।'
                  : 'Enter Green City Residential Block C from Dhaka Uddan main road. You will spot Sporsho Beauty Buzz on the road — Bhai Brother Video Game is directly beside it.'}
              </p>
              <div className="pt-1">
                <a
                  href={settings.mapLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#4F7CFF] hover:underline"
                >
                  <span>Open in Google Maps App →</span>
                </a>
              </div>
            </div>

            <div className="h-[380px] rounded-2xl overflow-hidden border border-slate-200 dark:border-[#23273A] shadow-lg dark:shadow-xl">
              <iframe
                title="Bhai Brother Video Game Map"
                src={settings.mapEmbedUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>

          {/* Weekly Hours Column */}
          <div className="lg:col-span-5 rounded-2xl border border-slate-200 dark:border-[#23273A] bg-white dark:bg-[#0E1018] p-6 space-y-4 shadow-sm dark:shadow-none">
            <div className="flex items-center gap-2 text-slate-900 dark:text-white">
              <Clock className="h-5 w-5 text-[#4F7CFF]" />
              <h3 className="font-display text-lg font-bold">
                {lang === 'bn' ? 'সাপ্তাহিক সময়সূচি' : 'Weekly Opening Schedule'}
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Times in Asia/Dhaka time zone. Today's hours are highlighted.
            </p>

            <div className="space-y-2 pt-2">
              {weeklyHours.map((wh) => {
                const isToday = wh.weekday === currentDhaka.weekday;
                const openFormatted = format12Hour(wh.open, lang);
                const closeFormatted = format12Hour(wh.close, lang);

                return (
                  <div
                    key={wh.weekday}
                    className={`flex items-center justify-between rounded-xl p-3 text-xs transition ${
                      isToday
                        ? 'border border-[#4F7CFF] bg-blue-50/70 dark:bg-[#4F7CFF]/15 text-[#4F7CFF] dark:text-white font-bold'
                        : 'border border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-[#151826] text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {isToday && <CheckCircle2 className="h-4 w-4 text-[#4F7CFF]" />}
                      <span>{lang === 'bn' ? wh.nameBn : wh.nameEn}</span>
                      {isToday && (
                        <span className="rounded bg-[#4F7CFF] px-1.5 py-0.2 text-[9px] uppercase text-white font-bold">
                          Today
                        </span>
                      )}
                    </div>
                    <span className="tabular-nums">
                      {wh.isClosed
                        ? lang === 'bn' ? 'বন্ধ' : 'Closed'
                        : `${openFormatted} – ${closeFormatted}`}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
