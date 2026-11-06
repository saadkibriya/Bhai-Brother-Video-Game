import React, { useState } from 'react';
import { Shield, Tv, Gamepad2, Users, Download, Plus, X, Play } from 'lucide-react';
import { useStore } from '../lib/store';
import { formatBdt } from '../lib/format';
import { translations } from '../i18n/translations';

export const AdminPage: React.FC = () => {
  const {
    currentUser,
    setCurrentUser,
    allMembers,
    bookings,
    updateBookingStatus,
    createBooking,
    stations,
    updateStationStatus,
    games,
    addGame,
    toggleBanMember,
    lang,
  } = useStore();

  const t = translations[lang];

  const [activeTab, setActiveTab] = useState<'inbox' | 'walkin' | 'stations' | 'games' | 'members'>('inbox');
  const [bookingFilter, setBookingFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Walk-in form state
  const [walkinName, setWalkinName] = useState('');
  const [walkinPhone, setWalkinPhone] = useState('');
  const [walkinPlatform, setWalkinPlatform] = useState<'ps5' | 'ps4'>('ps5');
  const [walkinDuration, setWalkinDuration] = useState(60);
  const [walkinPlayers, setWalkinPlayers] = useState(2);
  const [walkinSuccess, setWalkinSuccess] = useState('');

  // Add game modal state
  const [showAddGame, setShowAddGame] = useState(false);
  const [newGameTitle, setNewGameTitle] = useState('');
  const [newGamePlatforms, setNewGamePlatforms] = useState<('ps5' | 'ps4')[]>(['ps5', 'ps4']);
  const [newGameGenres, setNewGameGenres] = useState('Sports, Football');
  const [newGameMaxPlayers, setNewGameMaxPlayers] = useState(4);

  // Auto-switch to admin mode if visitor wants to test admin
  const isAuthorized = currentUser?.role === 'admin' || currentUser?.role === 'staff';

  const handleGrantAdminDemo = () => {
    const adminUser = allMembers.find((m) => m.role === 'admin') || {
      id: 'user-admin',
      fullName: 'Owner Bhai',
      nickname: 'OwnerBhai',
      phone: '8801700000000',
      role: 'admin' as const,
      isBanned: false,
      createdAt: '2026-01-01T00:00:00Z',
      sessionsCompleted: 140,
      totalHours: 195,
    };
    setCurrentUser(adminUser);
  };

  const filteredBookings = bookings.filter((b) => {
    const matchesStatus = bookingFilter === 'all' || b.status === bookingFilter;
    const matchesSearch =
      !searchQuery ||
      b.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.guestName && b.guestName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (b.guestPhone && b.guestPhone.includes(searchQuery));
    return matchesStatus && matchesSearch;
  });

  const handleCreateWalkin = (e: React.FormEvent) => {
    e.preventDefault();
    setWalkinSuccess('');

    const startIso = new Date().toISOString();
    const res = createBooking({
      platform: walkinPlatform,
      startAt: startIso,
      durationMinutes: walkinDuration,
      players: walkinPlayers,
      guestName: walkinName.trim() || 'Walk-in Guest',
      guestPhone: walkinPhone.trim() || undefined,
    });

    if (res.success && res.booking) {
      // Immediately confirm and assign first free station of that platform
      const freeStation = stations.find((s) => s.platform === walkinPlatform && s.status === 'free');
      updateBookingStatus(res.booking.id, 'confirmed', freeStation?.id);
      if (freeStation) {
        updateStationStatus(freeStation.id, 'busy');
      }

      setWalkinSuccess(`Walk-in booked! Code: ${res.booking.code}. Session active.`);
      setWalkinName('');
      setWalkinPhone('');
    }
  };

  const handleAddGameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGameTitle.trim()) return;

    addGame({
      title: newGameTitle.trim(),
      slug: newGameTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      platforms: newGamePlatforms,
      genres: newGameGenres.split(',').map((s) => s.trim()).filter(Boolean),
      maxPlayers: newGameMaxPlayers,
      tags: ['New', 'Popular'],
      isFeatured: true,
      descriptionEn: `${newGameTitle} now available on ${newGamePlatforms.join('/')}.`,
    });

    setNewGameTitle('');
    setShowAddGame(false);
  };

  // CSV Export per FR-ADM-05
  const handleExportCSV = () => {
    const headers = ['Code', 'Platform', 'Status', 'StartAt', 'EndAt', 'Players', 'EstimatedBDT', 'GuestName', 'GuestPhone'];
    const rows = bookings.map((b) => [
      b.code,
      b.platform,
      b.status,
      b.startAt,
      b.endAt,
      b.players,
      b.estimatedBdt,
      `"${b.guestName || ''}"`,
      b.guestPhone || '',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `bhai_brother_bookings_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isAuthorized) {
    return (
      <div className="min-h-screen py-16 bg-slate-50 dark:bg-[#07080D] flex items-center justify-center px-4 transition-colors duration-200">
        <div className="max-w-md w-full rounded-2xl border border-slate-200 dark:border-[#23273A] bg-white dark:bg-[#0E1018] p-8 text-center space-y-4 shadow-xl">
          <Shield className="mx-auto h-12 w-12 text-[#8B6CFF]" />
          <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">
            Staff & Admin Portal
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            This area is restricted to shop managers and cashiers for handling station bookings, walk-ins, and console statuses.
          </p>
          <div className="pt-2">
            <button
              onClick={handleGrantAdminDemo}
              className="w-full rounded-xl bg-[#8B6CFF] py-3 text-xs font-bold text-white hover:bg-[#7a58f0] transition shadow-lg shadow-[#8B6CFF]/20"
            >
              Sign In as Owner Bhai (Demo Admin)
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 bg-slate-50 dark:bg-[#07080D] transition-colors duration-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#8B6CFF]">
              <Shield className="h-4 w-4" />
              <span>{t.adminPortal}</span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-1">
              Shop Manager Desk
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Welcome back, <strong>{currentUser?.fullName}</strong> ({currentUser?.role})
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#151826] px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 transition shadow-sm dark:shadow-none"
              title="Download Bookings as CSV"
            >
              <Download className="h-4 w-4" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-slate-200 dark:border-[#23273A]">
          <button
            onClick={() => setActiveTab('inbox')}
            className={`rounded-xl px-4 py-2.5 text-xs font-bold whitespace-nowrap transition ${
              activeTab === 'inbox'
                ? 'bg-[#4F7CFF] text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {t.inboxTab} ({bookings.length})
          </button>
          <button
            onClick={() => setActiveTab('walkin')}
            className={`rounded-xl px-4 py-2.5 text-xs font-bold whitespace-nowrap transition ${
              activeTab === 'walkin'
                ? 'bg-[#2BD98A] text-slate-950 font-extrabold shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            + {t.walkInBtn}
          </button>
          <button
            onClick={() => setActiveTab('stations')}
            className={`rounded-xl px-4 py-2.5 text-xs font-bold whitespace-nowrap transition ${
              activeTab === 'stations'
                ? 'bg-[#4F7CFF] text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {t.stationsTab}
          </button>
          <button
            onClick={() => setActiveTab('games')}
            className={`rounded-xl px-4 py-2.5 text-xs font-bold whitespace-nowrap transition ${
              activeTab === 'games'
                ? 'bg-[#4F7CFF] text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {t.gamesTab}
          </button>
          <button
            onClick={() => setActiveTab('members')}
            className={`rounded-xl px-4 py-2.5 text-xs font-bold whitespace-nowrap transition ${
              activeTab === 'members'
                ? 'bg-[#4F7CFF] text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {t.membersTab} ({allMembers.length})
          </button>
        </div>

        {/* TAB 1: INBOX */}
        {activeTab === 'inbox' && (
          <div className="rounded-2xl border border-slate-200 dark:border-[#23273A] bg-white dark:bg-[#0E1018] p-6 space-y-4 shadow-sm dark:shadow-none">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {/* Status filter buttons */}
              <div className="flex gap-1.5 bg-slate-100 dark:bg-[#151826] p-1 rounded-xl w-fit">
                {(['all', 'pending', 'confirmed', 'completed'] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setBookingFilter(s)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-bold capitalize transition ${
                      bookingFilter === s
                        ? 'bg-[#4F7CFF] text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>

              {/* Search input */}
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search code, guest name, phone..."
                className="rounded-xl border border-slate-300 dark:border-white/10 bg-white dark:bg-[#151826] px-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:border-[#4F7CFF] focus:outline-none"
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-200 dark:border-[#23273A] bg-slate-100 dark:bg-[#151826] text-slate-600 dark:text-slate-400 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-3">Code</th>
                    <th className="py-3 px-3">Customer</th>
                    <th className="py-3 px-3">Console</th>
                    <th className="py-3 px-3">Slot</th>
                    <th className="py-3 px-3">Est. Bill</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-[#23273A] text-slate-700 dark:text-slate-200">
                  {filteredBookings.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition">
                      <td className="py-3 px-3 font-bold text-slate-900 dark:text-white tabular-nums">
                        {b.code}
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-semibold block text-slate-900 dark:text-white">
                          {b.guestName || 'Member'}
                        </span>
                        {b.guestPhone && (
                          <span className="text-[10px] text-slate-500 dark:text-slate-400">{b.guestPhone}</span>
                        )}
                      </td>
                      <td className="py-3 px-3 uppercase font-bold text-slate-600 dark:text-slate-300">
                        {b.platform}
                      </td>
                      <td className="py-3 px-3">
                        <span className="block">
                          {new Date(b.startAt).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400">
                          {new Date(b.startAt).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-bold text-emerald-600 dark:text-[#2BD98A] tabular-nums">
                        {formatBdt(b.estimatedBdt, lang)}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
                          b.status === 'confirmed'
                            ? 'bg-emerald-100 dark:bg-[#2BD98A]/20 text-emerald-700 dark:text-[#2BD98A]'
                            : b.status === 'pending'
                            ? 'bg-amber-100 dark:bg-amber-400/20 text-amber-800 dark:text-amber-400'
                            : b.status === 'completed'
                            ? 'bg-sky-100 dark:bg-blue-400/20 text-sky-700 dark:text-blue-400'
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-400'
                        }`}>
                          {b.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {b.status === 'pending' && (
                            <button
                              onClick={() => {
                                const freeSt = stations.find((s) => s.platform === b.platform && s.status === 'free');
                                updateBookingStatus(b.id, 'confirmed', freeSt?.id);
                              }}
                              className="rounded bg-[#2BD98A] px-2 py-1 text-[11px] font-bold text-slate-950 hover:bg-[#45e89d]"
                              title="Confirm booking"
                            >
                              Confirm
                            </button>
                          )}
                          {b.status === 'confirmed' && (
                            <button
                              onClick={() => updateBookingStatus(b.id, 'completed')}
                              className="rounded bg-[#4F7CFF] px-2 py-1 text-[11px] font-bold text-white hover:bg-[#3b68ee]"
                              title="Mark session done"
                            >
                              Done
                            </button>
                          )}
                          {(b.status === 'pending' || b.status === 'confirmed') && (
                            <button
                              onClick={() => updateBookingStatus(b.id, 'no_show')}
                              className="rounded bg-slate-200 dark:bg-white/10 px-2 py-1 text-[11px] font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-white/20"
                            >
                              No-Show
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: CREATE WALK-IN */}
        {activeTab === 'walkin' && (
          <div className="max-w-xl rounded-2xl border border-slate-200 dark:border-[#23273A] bg-white dark:bg-[#0E1018] p-6 space-y-4 shadow-sm dark:shadow-none">
            <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Play className="h-5 w-5 text-emerald-600 dark:text-[#2BD98A]" />
              <span>Start Walk-in Counter Session</span>
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Immediately books and marks station as busy for customers arriving directly at the shop counter.
            </p>

            {walkinSuccess && (
              <div className="rounded-xl bg-emerald-100 dark:bg-[#2BD98A]/15 border border-emerald-300 dark:border-[#2BD98A]/30 p-3 text-xs text-emerald-800 dark:text-[#2BD98A] font-semibold">
                ✓ {walkinSuccess}
              </div>
            )}

            <form onSubmit={handleCreateWalkin} className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-400 mb-1">
                    Customer Name
                  </label>
                  <input
                    type="text"
                    value={walkinName}
                    onChange={(e) => setWalkinName(e.target.value)}
                    placeholder="Guest name"
                    className="w-full rounded-xl border border-slate-300 dark:border-white/10 bg-white dark:bg-[#151826] p-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#4F7CFF]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-400 mb-1">
                    Customer Mobile
                  </label>
                  <input
                    type="tel"
                    value={walkinPhone}
                    onChange={(e) => setWalkinPhone(e.target.value)}
                    placeholder="01XXXXXXXXX"
                    className="w-full rounded-xl border border-slate-300 dark:border-white/10 bg-white dark:bg-[#151826] p-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#4F7CFF]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-400 mb-1">
                    Platform
                  </label>
                  <select
                    value={walkinPlatform}
                    onChange={(e) => setWalkinPlatform(e.target.value as 'ps5' | 'ps4')}
                    className="w-full rounded-xl border border-slate-300 dark:border-white/10 bg-white dark:bg-[#151826] p-2.5 text-xs text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="ps5">PS5 (৳70 1P · ৳140 2P /hr)</option>
                    <option value="ps4">PS4 (৳50 1P · ৳100 2P /hr)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-400 mb-1">
                    Duration
                  </label>
                  <select
                    value={walkinDuration}
                    onChange={(e) => setWalkinDuration(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-300 dark:border-white/10 bg-white dark:bg-[#151826] p-2.5 text-xs text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value={30}>30 mins</option>
                    <option value={60}>60 mins (1 hr)</option>
                    <option value={90}>90 mins</option>
                    <option value={120}>120 mins (2 hrs)</option>
                    <option value={180}>180 mins (3 hrs)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-400 mb-1">
                  Players Count
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setWalkinPlayers(n)}
                      className={`flex-1 rounded-lg py-2 text-xs font-bold transition ${
                        walkinPlayers === n ? 'bg-[#4F7CFF] text-white shadow-sm' : 'bg-slate-100 dark:bg-[#151826] text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {n}P
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-[#2BD98A] py-3 text-xs font-bold text-slate-950 hover:bg-[#43e69b] transition shadow-md shadow-[#2BD98A]/20"
              >
                Start Session Now
              </button>
            </form>
          </div>
        )}

        {/* TAB 3: STATIONS MANAGEMENT */}
        {activeTab === 'stations' && (
          <div className="rounded-2xl border border-slate-200 dark:border-[#23273A] bg-white dark:bg-[#0E1018] p-6 space-y-4 shadow-sm dark:shadow-none">
            <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Tv className="h-5 w-5 text-[#4F7CFF]" />
              <span>Console Station Status Switchboard</span>
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Change station statuses in real-time. Public live board updates instantly.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
              {stations.map((station) => (
                <div
                  key={station.id}
                  className="rounded-xl border border-slate-200 dark:border-[#23273A] bg-slate-50 dark:bg-[#151826] p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-white text-xs">{station.name}</span>
                    <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">{station.platform}</span>
                  </div>

                  <div className="flex gap-1">
                    {(['free', 'busy', 'maintenance'] as const).map((st) => (
                      <button
                        key={st}
                        onClick={() => updateStationStatus(station.id, st)}
                        className={`flex-1 rounded-lg py-1.5 text-[10px] font-bold uppercase transition ${
                          station.status === st
                            ? st === 'free'
                              ? 'bg-[#2BD98A] text-slate-950'
                              : st === 'busy'
                              ? 'bg-[#FF5C6C] text-white'
                              : 'bg-amber-400 text-slate-950'
                            : 'bg-slate-200 dark:bg-black/30 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: GAMES MANAGEMENT */}
        {activeTab === 'games' && (
          <div className="rounded-2xl border border-slate-200 dark:border-[#23273A] bg-white dark:bg-[#0E1018] p-6 space-y-4 shadow-sm dark:shadow-none">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Gamepad2 className="h-5 w-5 text-[#4F7CFF]" />
                <span>Games Catalog ({games.length} Titles)</span>
              </h3>
              <button
                onClick={() => setShowAddGame(true)}
                className="flex items-center gap-1.5 rounded-xl bg-[#4F7CFF] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#3b68ee] shadow-sm"
              >
                <Plus className="h-4 w-4" />
                <span>Add Game</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {games.map((g) => (
                <div key={g.id} className="rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-[#151826] p-3 text-xs space-y-1">
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-slate-900 dark:text-white line-clamp-1">{g.title}</span>
                    <span className="text-[10px] font-bold text-[#4F7CFF] uppercase">
                      {g.platforms.join('/')}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                    {g.genres.join(', ')} · 1–{g.maxPlayers}P
                  </span>
                </div>
              ))}
            </div>

            {/* Add Game Modal */}
            {showAddGame && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
                <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0E1018] p-6 text-slate-900 dark:text-white space-y-4 shadow-2xl">
                  <div className="flex justify-between items-center">
                    <h4 className="font-bold text-base text-slate-900 dark:text-white">Add New Game</h4>
                    <button onClick={() => setShowAddGame(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white">
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  <form onSubmit={handleAddGameSubmit} className="space-y-3 text-xs">
                    <div>
                      <label className="block text-slate-700 dark:text-slate-400 mb-1">Game Title *</label>
                      <input
                        type="text"
                        value={newGameTitle}
                        onChange={(e) => setNewGameTitle(e.target.value)}
                        placeholder="e.g. God of War Ragnarök"
                        required
                        className="w-full rounded-lg border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-[#151826] p-2 text-slate-900 dark:text-white focus:outline-none focus:border-[#4F7CFF]"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 dark:text-slate-400 mb-1">Genres (comma separated)</label>
                      <input
                        type="text"
                        value={newGameGenres}
                        onChange={(e) => setNewGameGenres(e.target.value)}
                        placeholder="Action, Adventure"
                        className="w-full rounded-lg border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-[#151826] p-2 text-slate-900 dark:text-white focus:outline-none focus:border-[#4F7CFF]"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 dark:text-slate-400 mb-1">Max Players</label>
                      <input
                        type="number"
                        min={1}
                        max={4}
                        value={newGameMaxPlayers}
                        onChange={(e) => setNewGameMaxPlayers(Number(e.target.value))}
                        className="w-full rounded-lg border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-[#151826] p-2 text-slate-900 dark:text-white focus:outline-none focus:border-[#4F7CFF]"
                      />
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowAddGame(false)}
                        className="px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-white/5 text-slate-700 dark:text-slate-300 font-semibold"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 rounded-lg bg-[#4F7CFF] font-bold text-white shadow-sm"
                      >
                        Save Game
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: MEMBERS DIRECTORY */}
        {activeTab === 'members' && (
          <div className="rounded-2xl border border-slate-200 dark:border-[#23273A] bg-white dark:bg-[#0E1018] p-6 space-y-4 shadow-sm dark:shadow-none">
            <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="h-5 w-5 text-[#4F7CFF]" />
              <span>Registered Members Directory</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-200 dark:border-[#23273A] bg-slate-100 dark:bg-[#151826] text-slate-600 dark:text-slate-400 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-3">Full Name</th>
                    <th className="py-3 px-3">Phone</th>
                    <th className="py-3 px-3">Tag</th>
                    <th className="py-3 px-3">Role</th>
                    <th className="py-3 px-3 text-right">Sessions</th>
                    <th className="py-3 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-[#23273A] text-slate-700 dark:text-slate-200">
                  {allMembers.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02]">
                      <td className="py-3 px-3 font-semibold text-slate-900 dark:text-white">
                        {m.fullName}
                      </td>
                      <td className="py-3 px-3 tabular-nums font-mono text-slate-600 dark:text-slate-300">
                        {m.phone}
                      </td>
                      <td className="py-3 px-3 text-slate-500 dark:text-slate-400">
                        {m.nickname ? `@${m.nickname}` : '—'}
                      </td>
                      <td className="py-3 px-3 uppercase text-[10px] font-bold text-[#8B6CFF]">
                        {m.role}
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-slate-900 dark:text-white tabular-nums">
                        {m.sessionsCompleted}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => toggleBanMember(m.id)}
                          className={`rounded px-2.5 py-1 text-[10px] font-bold transition ${
                            m.isBanned
                              ? 'bg-red-500/20 text-red-500'
                              : 'bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-white/20'
                          }`}
                        >
                          {m.isBanned ? 'Unban' : 'Ban'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
