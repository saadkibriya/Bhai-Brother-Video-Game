import React, { useEffect, useState } from 'react';
import { useStore } from '../lib/store';
import { getOpenStatus } from '../lib/hours';

export const OpenBadge: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { weeklyHours, specialHours, lang } = useStore();
  const [statusInfo, setStatusInfo] = useState(() => getOpenStatus(new Date(), weeklyHours, specialHours));

  useEffect(() => {
    const update = () => setStatusInfo(getOpenStatus(new Date(), weeklyHours, specialHours));
    update();
    const interval = setInterval(update, 30000); // Check every 30s
    window.addEventListener('focus', update);
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', update);
    };
  }, [weeklyHours, specialHours]);

  const dotColor =
    statusInfo.status === 'open'
      ? 'bg-[#2BD98A] shadow-[0_0_10px_#2BD98A]'
      : statusInfo.status === 'closing_soon'
      ? 'bg-[#FFB224] shadow-[0_0_10px_#FFB224]'
      : 'bg-[#FF5C6C] shadow-[0_0_8px_#FF5C6C]';

  const label = lang === 'bn' ? statusInfo.labelBn : statusInfo.labelEn;

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full border border-slate-300 dark:border-white/10 bg-slate-100/90 dark:bg-[#0E1018]/80 px-3 py-1 text-xs font-medium backdrop-blur-md ${
        compact ? 'text-[11px] px-2 py-0.5' : ''
      }`}
      title={lang === 'bn' ? statusInfo.todayHoursBn : statusInfo.todayHoursEn}
    >
      <span className="relative flex h-2 w-2">
        {statusInfo.status !== 'closed' && (
          <span
            className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${
              statusInfo.status === 'open' ? 'bg-[#2BD98A]' : 'bg-[#FFB224]'
            }`}
          />
        )}
        <span className={`relative inline-flex h-2 w-2 rounded-full ${dotColor}`} />
      </span>
      <span className="tracking-tight text-slate-800 dark:text-slate-200 font-medium">
        {label}
      </span>
    </div>
  );
};
