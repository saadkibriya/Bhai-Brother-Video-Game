import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, MessageCircle, Clock, Gamepad2, Shield } from 'lucide-react';
import { useStore } from '../lib/store';
import { translations } from '../i18n/translations';

export const Footer: React.FC = () => {
  const { settings, lang } = useStore();
  const t = translations[lang];

  const primaryPhone = settings.phones[0] || '01700-000000';

  return (
    <footer className="border-t border-slate-200 dark:border-[#23273A] bg-white dark:bg-[#07080D] pt-12 pb-16 text-slate-600 dark:text-slate-400 transition-colors">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4 lg:gap-12">
          {/* Brand info */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#4F7CFF] to-[#8B6CFF] text-white">
                <Gamepad2 className="h-5 w-5" />
              </div>
              <span className="font-display text-base font-bold text-slate-900 dark:text-white">
                {lang === 'bn' ? settings.nameBn : settings.nameEn}
              </span>
            </div>
            <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
              {lang === 'bn' ? settings.taglineBn : settings.taglineEn}
            </p>
            <div className="flex items-center gap-3 pt-1">
              <a
                href={settings.mapLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#4F7CFF] hover:underline"
              >
                <MapPin className="h-3.5 w-3.5" />
                <span>{t.getDirections}</span>
              </a>
            </div>
          </div>

          {/* Location & Directions */}
          <div className="space-y-3">
            <h4 className="font-display text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              {lang === 'bn' ? 'ঠিকানা ও লোকেশন' : 'Location & Landmark'}
            </h4>
            <div className="space-y-2 text-xs leading-relaxed">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 shrink-0 text-[#4F7CFF] mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-900 dark:text-slate-200">
                    {lang === 'bn' ? 'স্পর্শ বিউটি বাজ এর ঠিক পাশে' : 'Beside Sporsho Beauty Buzz'}
                  </p>
                  <p className="text-slate-600 dark:text-slate-400">{lang === 'bn' ? settings.addressBn : settings.addressEn}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Opening Hours */}
          <div className="space-y-3">
            <h4 className="font-display text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              {lang === 'bn' ? 'খোলার সময়সূচি' : 'Standard Hours'}
            </h4>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <Clock className="h-3.5 w-3.5 text-[#2BD98A]" />
                <span>{lang === 'bn' ? 'শনি – বুধ: দুপুর ২:০০ – রাত ১১:০০' : 'Sat – Wed: 2:00 PM – 11:00 PM'}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <Clock className="h-3.5 w-3.5 text-[#3DA9FC]" />
                <span>{lang === 'bn' ? 'বৃহস্পতিবার: দুপুর ২:০০ – রাত ১:০০' : 'Thursday: 2:00 PM – 1:00 AM (Late)'}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <Clock className="h-3.5 w-3.5 text-[#FFB224]" />
                <span>{lang === 'bn' ? 'শুক্রবার: বিকাল ৩:০০ – রাত ১২:০০' : 'Friday: 3:00 PM – 12:00 AM'}</span>
              </div>
            </div>
          </div>

          {/* Quick Links & Contact */}
          <div className="space-y-3">
            <h4 className="font-display text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              {lang === 'bn' ? 'যোগাযোগ ও পেজ' : 'Quick Links & Contact'}
            </h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <Link to="/pricing" className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition">
                  {t.navPricing}
                </Link>
              </li>
              <li>
                <Link to="/games" className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition">
                  {t.navGames}
                </Link>
              </li>
              <li>
                <Link to="/book" className="text-[#4F7CFF] font-medium hover:underline">
                  {t.navBook}
                </Link>
              </li>
              <li>
                <Link to="/leaderboard" className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition">
                  {t.navLeaderboard}
                </Link>
              </li>
              <li>
                <a href={`tel:${primaryPhone.replace(/\D/g, '')}`} className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition">
                  <Phone className="h-3.5 w-3.5 text-[#2BD98A]" />
                  <span>{primaryPhone}</span>
                </a>
              </li>
              <li>
                <a
                  href={`https://wa.me/${settings.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-[#25D366] hover:underline"
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                  <span>WhatsApp: {settings.whatsapp}</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Agency Credits & Copyright Row */}
        <div className="mt-10 border-t border-slate-200 dark:border-white/10 pt-6 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-4">
          <div className="space-y-1 text-center md:text-left">
            <p>© {new Date().getFullYear()} {settings.nameEn}. All rights reserved.</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {lang === 'bn' ? 'ওয়েবসাইট ডিজাইন ও ডেভেলপমেন্ট করেছে ' : 'Designed & Developed with ❤️ by '}
              <span className="font-bold text-[#4F7CFF] hover:underline cursor-pointer">
                TechSomaj (টেকসমাজ)
              </span>
              {' '}— Building premier digital experiences for Bangladesh businesses.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/contact" className="hover:text-slate-900 dark:hover:text-slate-300">
              {t.navContact}
            </Link>
            <Link to="/admin" className="flex items-center gap-1 text-slate-500 hover:text-[#8B6CFF] dark:text-slate-400">
              <Shield className="h-3.5 w-3.5" />
              <span>{t.navAdmin}</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
