/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { BrowserRouter, HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import { StoreProvider } from './lib/store';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { FloatingActions } from './components/FloatingActions';
import { HomePage } from './pages/HomePage';
import { GamesPage } from './pages/GamesPage';
import { PricingPage } from './pages/PricingPage';
import { BookPage } from './pages/BookPage';
import { LeaderboardPage } from './pages/LeaderboardPage';
import { ContactPage } from './pages/ContactPage';
import { ProfilePage } from './pages/ProfilePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { AdminPage } from './pages/AdminPage';
import { NotFoundPage } from './pages/NotFoundPage';

// Scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  // Use HashRouter for GitHub Pages (default) to avoid static server 404s,
  // or BrowserRouter if deployed on Cloudflare Pages or custom domain
  const isCloudflare = import.meta.env.VITE_DEPLOY_TARGET === 'cloudflare';
  const Router = isCloudflare ? BrowserRouter : HashRouter;

  return (
    <StoreProvider>
      <Router>
        <ScrollToTop />
        <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 dark:bg-[#07080D] dark:text-[#EEF0F7] selection:bg-[#4F7CFF]/30 selection:text-white">
          <Header />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/games" element={<GamesPage />} />
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/book" element={<BookPage />} />
              <Route path="/leaderboard" element={<LeaderboardPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
          <FloatingActions />
          <Footer />
        </div>
      </Router>
    </StoreProvider>
  );
}
