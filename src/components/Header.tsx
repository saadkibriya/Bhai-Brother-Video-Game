import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Gamepad2, User, Moon, Sun, Shield } from 'lucide-react';
import { useStore } from '../lib/store';
import { OpenBadge } from './OpenBadge';
import { PWAInstallButton } from './PWAInstallButton';
import { translations } from '../i18n/translations';

export const Header: React.FC = () => {
  const { lang, setLang, theme, setTheme, currentUser, settings } = useStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const t = translations[lang];

  const navLinks = [
    { to: '/', label: t.navHome },
    { to: '/games', label: t.navGames },
    { to: '/pricing', label: t.navPricing },
    { to: '/book', label: t.navBook, isHighlight: true },
    { to: '/leaderboard', label: t.navLeaderboard },
    { to: '/contact', label: t.navContact },
  ];

  const toggleLanguage = () => {
    setLang(lang === 'en' ? 'bn' : 'en');
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/90 dark:border-[#23273A]/80 bg-white/90 dark:bg-[#07080D]/90 text-slate-900 dark:text-[#EEF0F7] backdrop-blur-md transition-colors">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Wordmark (Zone 1) */}
        <Link to="/" className="group flex items-center gap-2.5 whitespace-nowrap shrink-0">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#4F7CFF] to-[#8B6CFF] text-white shadow-md shadow-[#4F7CFF]/20 group-hover:scale-105 transition-transform">
            <Gamepad2 className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-display text-base font-bold tracking-tight text-slate-900 dark:text-white group-hover:text-[#4F7CFF] transition-colors">
              {lang === 'bn' ? settings.nameBn : settings.nameEn}
            </span>
            <span className="text-[10px] tracking-wider text-slate-500 dark:text-slate-400 uppercase font-semibold">
              PS5 · PS4 · Arcade
            </span>
          </div>
        </Link>

        {/* Desktop Nav Links (Zone 2) */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`whitespace-nowrap transition-colors py-1 ${
                isActive(link.to)
                  ? 'text-[#4F7CFF] font-semibold border-b-2 border-[#4F7CFF]'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right Controls (Zone 3) */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Live Open Status Badge */}
          <div className="hidden sm:block">
            <OpenBadge />
          </div>

          {/* PWA Install Button */}
          <div className="hidden md:block">
            <PWAInstallButton />
          </div>

          {/* Language Toggle */}
          <button
            onClick={toggleLanguage}
            className="flex h-9 items-center justify-center rounded-lg border border-slate-300 dark:border-white/10 bg-slate-100 dark:bg-[#151826]/70 px-2.5 text-xs font-bold text-slate-800 dark:text-slate-200 transition hover:bg-slate-200 dark:hover:bg-white/10"
            title="Toggle English / বাংলা"
            aria-label="Toggle language"
          >
            {lang === 'en' ? 'বাংলা' : 'EN'}
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 dark:border-white/10 bg-slate-100 dark:bg-[#151826]/70 text-slate-700 dark:text-slate-300 transition hover:bg-slate-200 dark:hover:bg-white/10"
            title="Toggle Theme"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-700" />}
          </button>

          {/* User Auth or Profile Button */}
          {currentUser ? (
            <div className="flex items-center gap-2">
              <Link
                to="/profile"
                className="flex items-center gap-2 rounded-lg border border-[#4F7CFF]/40 bg-[#4F7CFF]/10 px-3 py-1.5 text-xs font-semibold text-[#4F7CFF] transition hover:bg-[#4F7CFF]/20"
              >
                <User className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{currentUser.nickname || currentUser.fullName.split(' ')[0]}</span>
              </Link>
              {currentUser.role === 'admin' || currentUser.role === 'staff' ? (
                <Link
                  to="/admin"
                  className="hidden md:flex items-center gap-1.5 rounded-lg bg-[#8B6CFF]/20 border border-[#8B6CFF]/40 px-2.5 py-1.5 text-xs font-bold text-[#8B6CFF] hover:bg-[#8B6CFF]/30 transition"
                  title="Staff Operations"
                >
                  <Shield className="h-3.5 w-3.5" />
                  <span>Admin</span>
                </Link>
              ) : null}
            </div>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-1.5 rounded-lg bg-[#4F7CFF] px-3.5 py-1.5 text-xs font-bold text-white shadow-sm shadow-[#4F7CFF]/30 transition hover:bg-[#3b68ee]"
            >
              <User className="h-3.5 w-3.5" />
              <span>{t.login}</span>
            </Link>
          )}

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 dark:border-white/10 bg-slate-100 dark:bg-[#151826] text-slate-700 dark:text-slate-300 lg:hidden"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-slate-200 dark:border-[#23273A] bg-white dark:bg-[#0E1018] px-4 py-4 space-y-3 shadow-lg">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-white/5">
            <OpenBadge compact />
            <PWAInstallButton />
          </div>
          <nav className="flex flex-col space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                  isActive(link.to)
                    ? 'bg-[#4F7CFF]/15 text-[#4F7CFF] font-semibold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-[#8B6CFF] hover:bg-[#8B6CFF]/10 transition"
            >
              <Shield className="h-4 w-4" />
              <span>{t.navAdmin}</span>
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};
