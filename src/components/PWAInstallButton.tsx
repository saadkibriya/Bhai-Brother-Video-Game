import React, { useEffect, useState } from 'react';
import { Download, Share2, X } from 'lucide-react';
import { useStore } from '../lib/store';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export const PWAInstallButton: React.FC = () => {
  const { lang } = useStore();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);

  useEffect(() => {
    // Check if already in standalone mode
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsInstalled(standalone);

    // iOS detection
    const ua = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(ua);
    setIsIOS(isIosDevice);

    const handlePrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handlePrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handlePrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  if (isInstalled) return null;

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsInstalled(true);
        setDeferredPrompt(null);
      }
    } else if (isIOS) {
      setShowIOSModal(true);
    }
  };

  if (!deferredPrompt && !isIOS) return null;

  return (
    <>
      <button
        onClick={handleInstallClick}
        className="inline-flex items-center gap-1.5 rounded-lg border border-[#4F7CFF]/40 bg-[#4F7CFF]/10 px-3 py-1.5 text-xs font-semibold text-[#4F7CFF] transition hover:bg-[#4F7CFF]/20"
        title="Install Web App"
      >
        <Download className="h-3.5 w-3.5" />
        <span>{lang === 'bn' ? 'অ্যাপ ইন্সটল' : 'Install App'}</span>
      </button>

      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-sm rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0E1018] p-6 text-slate-900 dark:text-slate-100 shadow-2xl">
            <button
              onClick={() => setShowIOSModal(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-700 dark:hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#4F7CFF]/20 text-[#4F7CFF]">
                <Share2 className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white font-display">
                {lang === 'bn' ? 'আইফোন / আইপ্যাডে ইন্সটল' : 'Install on iPhone / iPad'}
              </h3>
            </div>
            <ol className="space-y-3 text-sm text-slate-700 dark:text-slate-300">
              <li className="flex gap-2">
                <span className="font-bold text-[#4F7CFF]">1.</span>
                <span>
                  {lang === 'bn'
                    ? 'সাফারির নিচে থাকা Share আইকনে ট্যাপ করুন।'
                    : 'Tap the Share button in Safari browser toolbar.'}
                </span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-[#4F7CFF]">2.</span>
                <span>
                  {lang === 'bn'
                    ? 'নিচে স্ক্রোল করে "Add to Home Screen" নির্বাচন করুন।'
                    : 'Scroll down and select "Add to Home Screen".'}
                </span>
              </li>
            </ol>
            <button
              onClick={() => setShowIOSModal(false)}
              className="mt-6 w-full rounded-xl bg-[#4F7CFF] py-2.5 text-xs font-bold text-white transition hover:bg-[#3b68ee]"
            >
              {lang === 'bn' ? 'বুঝেছি' : 'Got it'}
            </button>
          </div>
        </div>
      )}
    </>
  );
};
