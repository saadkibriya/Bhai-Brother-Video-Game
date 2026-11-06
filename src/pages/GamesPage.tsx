import React, { useState, useMemo } from 'react';
import { Search, SlidersHorizontal, Gamepad2 } from 'lucide-react';
import { useStore, Game } from '../lib/store';
import { GameCard } from '../components/GameCard';
import { translations } from '../i18n/translations';

export const GamesPage: React.FC = () => {
  const { games, lang } = useStore();
  const t = translations[lang];

  const [searchQuery, setSearchQuery] = useState('');
  const [platformFilter, setPlatformFilter] = useState<'all' | 'ps5' | 'ps4'>('all');
  const [playerFilter, setPlayerFilter] = useState<number | 'all'>('all');
  const [genreFilter, setGenreFilter] = useState<string>('all');

  // Extract all unique genres
  const allGenres = useMemo(() => {
    const set = new Set<string>();
    games.forEach((g) => g.genres.forEach((genre) => set.add(genre)));
    return Array.from(set);
  }, [games]);

  // Filtered games
  const filteredGames = useMemo(() => {
    return games.filter((game) => {
      // Search
      const matchesSearch =
        !searchQuery ||
        game.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        game.genres.some((g) => g.toLowerCase().includes(searchQuery.toLowerCase()));

      // Platform
      const matchesPlatform =
        platformFilter === 'all' || game.platforms.includes(platformFilter);

      // Players
      const matchesPlayers =
        playerFilter === 'all' || game.maxPlayers >= playerFilter;

      // Genre
      const matchesGenre =
        genreFilter === 'all' || game.genres.includes(genreFilter);

      return matchesSearch && matchesPlatform && matchesPlayers && matchesGenre;
    });
  }, [games, searchQuery, platformFilter, playerFilter, genreFilter]);

  return (
    <div className="min-h-screen py-10 bg-slate-50 dark:bg-[#07080D] transition-colors">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#4F7CFF]">
            <Gamepad2 className="h-4 w-4" />
            <span>{t.gamesTitle}</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
            {lang === 'bn' ? 'আমাদের গেমস সংগ্রহ' : 'All PS5 & PS4 Titles'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
            {t.gamesSubtitle}
          </p>
        </div>

        {/* Sticky Search and Filter Controls */}
        <div className="sticky top-16 z-20 mb-8 rounded-2xl border border-slate-200 dark:border-[#23273A] bg-white/95 dark:bg-[#0E1018]/95 p-4 shadow-xl backdrop-blur-md transition-colors">
          <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.searchPlaceholder}
                className="w-full rounded-xl border border-slate-300 dark:border-white/10 bg-slate-100 dark:bg-[#151826] pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:border-[#4F7CFF] focus:outline-none transition"
              />
            </div>

            {/* Filter Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 rounded-xl bg-slate-100 dark:bg-[#151826] p-1 border border-slate-200 dark:border-white/5">
                {(['all', 'ps5', 'ps4'] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPlatformFilter(p)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-bold uppercase transition ${
                      platformFilter === p
                        ? 'bg-[#4F7CFF] text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>

              {/* Genre Dropdown */}
              <select
                value={genreFilter}
                onChange={(e) => setGenreFilter(e.target.value)}
                className="rounded-xl border border-slate-300 dark:border-white/10 bg-slate-100 dark:bg-[#151826] px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:border-[#4F7CFF] focus:outline-none"
              >
                <option value="all">All Genres</option>
                {allGenres.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>

              {/* Players Filter */}
              <select
                value={playerFilter}
                onChange={(e) => setPlayerFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                className="rounded-xl border border-slate-300 dark:border-white/10 bg-slate-100 dark:bg-[#151826] px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:border-[#4F7CFF] focus:outline-none"
              >
                <option value="all">Any Players</option>
                <option value="2">2+ Players (Co-op/Versus)</option>
                <option value="4">4 Players (Squad)</option>
              </select>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200 dark:border-white/5">
            <span>
              Showing <strong className="text-slate-900 dark:text-white">{filteredGames.length}</strong> of{' '}
              {games.length} games
            </span>
            {(searchQuery || platformFilter !== 'all' || genreFilter !== 'all' || playerFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setPlatformFilter('all');
                  setGenreFilter('all');
                  setPlayerFilter('all');
                }}
                className="text-xs text-[#4F7CFF] hover:underline"
              >
                Clear all filters
              </button>
            )}
          </div>
        </div>

        {/* Games Grid */}
        {filteredGames.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {filteredGames.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 dark:border-[#23273A] p-12 text-center space-y-3 bg-white dark:bg-[#0E1018]">
            <SlidersHorizontal className="mx-auto h-8 w-8 text-slate-400" />
            <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
              No games matched your search
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Try adjusting your keyword or clearing platform filters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
