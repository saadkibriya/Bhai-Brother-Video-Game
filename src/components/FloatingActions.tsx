import React from 'react';
import { Phone, MessageCircle } from 'lucide-react';
import { useStore } from '../lib/store';

export const FloatingActions: React.FC = () => {
  const { settings, lang } = useStore();

  const primaryPhone = settings.phones[0] || '01700000000';
  const cleanPhone = primaryPhone.replace(/[\s\-()]/g, '');
  const cleanWhatsApp = settings.whatsapp.replace(/[\s\-()]/g, '');

  const prefilledText =
    lang === 'bn'
      ? 'হ্যালো ভাই ব্রাদার ভিডিও গেম, আমি গেমিং স্লট বা স্টেশন বুকিং সম্পর্কে জানতে চাচ্ছি।'
      : 'Hello Bhai Brother Video Game, I would like to inquire about booking a PS5/PS4 station.';

  const waUrl = `https://wa.me/${cleanWhatsApp}?text=${encodeURIComponent(prefilledText)}`;

  return (
    <aside
      aria-label="Quick contact actions"
      className="fixed bottom-6 right-5 z-40 flex flex-col gap-3 md:hidden"
    >
      {/* Call Button */}
      <a
        href={`tel:${cleanPhone}`}
        className="flex h-13 w-13 items-center justify-center rounded-full bg-[#151826] text-white shadow-xl shadow-black/50 border border-white/15 transition-transform active:scale-95 hover:bg-[#1f2337]"
        aria-label="Call Bhai Brother Video Game"
      >
        <Phone className="h-5 w-5 text-[#4F7CFF]" />
      </a>

      {/* WhatsApp Button */}
      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex h-13 w-13 items-center justify-center rounded-full bg-[#25D366] text-white shadow-xl shadow-[#25D366]/40 transition-transform active:scale-95 hover:scale-105"
        aria-label="Chat on WhatsApp"
      >
        <MessageCircle className="h-6 w-6 fill-white text-transparent" />
      </a>
    </aside>
  );
};
