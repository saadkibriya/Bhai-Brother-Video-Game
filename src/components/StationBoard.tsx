import React from 'react';
import { Tv, Sparkles, Wrench } from 'lucide-react';
import { useStore, Station } from '../lib/store';
import { translations } from '../i18n/translations';
import { Link } from 'react-router-dom';

export const StationBoard: React.FC<{ allowStaffToggle?: boolean }> = ({ allowStaffToggle = true }) => {
  const { stations, updateStationStatus, currentUser, lang } = useStore();
  const t = translations[lang];

  const ps5Stations = stations.filter((s) => s.platform === 'ps5');
  const ps4Stations = stations.filter((s) => s.platform === 'ps4');

  const ps5FreeCount = ps5Stations.filter((s) => s.status === 'free').length;
  const ps4FreeCount = ps4Stations.filter((s) => s.status === 'free').length;

  const isStaff = currentUser?.role === 'admin' || currentUser?.role === 'staff';

  const handleTileClick = (station: Station) => {
    if (!allowStaffToggle || !isStaff) return;
    // Cycle status: free -> busy -> maintenance -> free
    const nextStatus =
      station.status === 'free'
        ? 'busy'
        : station.status === 'busy'
        ? 'maintenance'
        : 'free';
    updateStationStatus(station.id, nextStatus);
  };

  const renderStationTile = (station: Station) => {
    const isPS5 = station.platform === 'ps5';
    const isFree = station.status === 'free';
    const isBusy = station.status === 'busy';
    const isMaint = station.status === 'maintenance';

    const borderColor = isFree
      ? isPS5
        ? 'border-[#3DA9FC]/60 hover:border-[#3DA9FC]'
        : 'border-[#8B6CFF]/60 hover:border-[#8B6CFF]'
      : isBusy
      ? 'border-[#FF5C6C]/40 opacity-75'
      : 'border-amber-500/30 opacity-50 bg-[repeating-linear-gradient(45deg,transparent,transparent_6px,rgba(255,255,255,0.03)_6px,rgba(255,255,255,0.03)_12px)]';

    return (
      <div
        key={station.id}
        onClick={() => handleTileClick(station)}
        className={`group relative flex flex-col items-center justify-between rounded-xl border bg-slate-50 dark:bg-[#0E1018] p-2.5 transition-all duration-150 ${borderColor} ${
          isStaff ? 'cursor-pointer hover:scale-105 active:scale-95' : ''
        }`}
        title={
          isStaff
            ? `${station.name} (${station.status}) — Tap to toggle status`
            : `${station.name}: ${station.status}`
        }
      >
        {/* Status Dot */}
        <div className="flex w-full items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {station.platform}
          </span>
          <span
            className={`h-2 w-2 rounded-full ${
              isFree
                ? 'bg-[#2BD98A] shadow-[0_0_8px_#2BD98A]'
                : isBusy
                ? 'bg-[#FF5C6C]'
                : 'bg-amber-400'
            }`}
          />
        </div>

        {/* Center Icon & Station Name */}
        <div className="my-1 flex flex-col items-center text-center">
          {isMaint ? (
            <Wrench className="h-4 w-4 text-amber-500 mb-0.5" />
          ) : (
            <Tv
              className={`h-4 w-4 mb-0.5 ${
                isFree ? (isPS5 ? 'text-[#3DA9FC]' : 'text-[#8B6CFF]') : 'text-slate-400'
              }`}
            />
          )}
          <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 line-clamp-1">
            {station.name.replace(/ \(.+\)/, '')}
          </span>
        </div>

        {/* Status Text Label */}
        <span
          className={`text-[10px] font-semibold ${
            isFree ? 'text-[#2BD98A]' : isBusy ? 'text-slate-500 dark:text-slate-400' : 'text-amber-500 dark:text-amber-400/80'
          }`}
        >
          {isFree ? t.statusFree : isBusy ? t.statusBusy : t.statusMaintenance}
        </span>

        {isStaff && (
          <span className="absolute -top-1.5 -right-1.5 hidden rounded-full bg-[#8B6CFF] px-1 text-[8px] font-bold text-white group-hover:block">
            Staff
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-[#23273A] bg-white dark:bg-[#0E1018] p-5 shadow-xl transition-colors">
      {/* Header with counter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-[#23273A] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
              {t.liveBoardTitle}
            </h3>
            <span className="inline-flex items-center gap-1 rounded-full bg-[#2BD98A]/10 border border-[#2BD98A]/30 px-2 py-0.5 text-[10px] font-bold text-[#2BD98A]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#2BD98A] animate-ping" />
              <span>LIVE</span>
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{t.liveBoardSub}</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-lg bg-slate-100 dark:bg-[#151826] px-3 py-1.5 text-xs">
            <span className="font-bold text-[#1C7FD0] dark:text-[#3DA9FC]">PS5:</span>
            <span className="font-semibold text-slate-900 dark:text-white">
              {ps5FreeCount}/{ps5Stations.length} {t.statusFree}
            </span>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-slate-100 dark:bg-[#151826] px-3 py-1.5 text-xs">
            <span className="font-bold text-[#6A4BE0] dark:text-[#8B6CFF]">PS4:</span>
            <span className="font-semibold text-slate-900 dark:text-white">
              {ps4FreeCount}/{ps4Stations.length} {t.statusFree}
            </span>
          </div>
        </div>
      </div>

      {/* Grid of Stations */}
      <div className="mt-5 space-y-4">
        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#1C7FD0] dark:text-[#3DA9FC]">
              PlayStation 5 ({ps5FreeCount}/{ps5Stations.length} Free)
            </span>
            <Link to="/book?platform=ps5" className="text-xs font-semibold text-[#4F7CFF] hover:underline">
              Book PS5 →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {ps5Stations.map(renderStationTile)}
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#6A4BE0] dark:text-[#8B6CFF]">
              PlayStation 4 ({ps4FreeCount}/{ps4Stations.length} Free)
            </span>
            <Link to="/book?platform=ps4" className="text-xs font-semibold text-[#8B6CFF] hover:underline">
              Book PS4 →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {ps4Stations.map(renderStationTile)}
          </div>
        </div>
      </div>

      {isStaff && (
        <div className="mt-4 rounded-lg bg-[#8B6CFF]/10 border border-[#8B6CFF]/30 p-2.5 text-xs text-[#8B6CFF] flex items-center justify-between">
          <span className="flex items-center gap-1.5 font-medium">
            <Sparkles className="h-4 w-4" />
            <span>Staff mode active: tap any station tile above to cycle status (Free ⇄ Busy ⇄ Maintenance).</span>
          </span>
          <Link to="/admin" className="font-bold underline ml-2 shrink-0">
            Admin Inbox →
          </Link>
        </div>
      )}
    </div>
  );
};
