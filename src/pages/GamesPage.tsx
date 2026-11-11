import { useMemo, useState } from 'react';
import { GAMES } from '../data/shop';
import { GameCard } from '../components/GameCard';
import { ChatIcon } from '../components/icons';
import { whatsappUrl } from '../lib/booking';
import type { Platform } from '../lib/pricing';

type Filter = 'all' | Platform;

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'Everything' },
  { id: 'ps5', label: 'PS5' },
  { id: 'ps4', label: 'PS4' },
];

export function GamesPage() {
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    const term = query.trim().toLowerCase();
    return GAMES.filter((game) => {
      const matchesFilter = filter === 'all' || game.platforms.includes(filter);
      const matchesQuery =
        !term || `${game.title} ${game.genre}`.toLowerCase().includes(term);
      return matchesFilter && matchesQuery;
    });
  }, [filter, query]);

  return (
    <>
      <section className="band band--ink page-head">
        <div className="wrap">
          <p className="eyebrow">The shelf</p>
          <h1>
            Ten games
            <br />
            One couch
          </h1>
          <p className="lede">
            Everything below is installed and ready. Four controllers on every station, no
            downloads in the middle of a match.
          </p>
        </div>
      </section>

      <section className="band band--ink-2">
        <div className="wrap">
          <div className="filters">
            <div className="choice-row" role="group" aria-label="Filter by platform">
              {FILTERS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  className="choice"
                  aria-pressed={filter === option.id}
                  onClick={() => setFilter(option.id)}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <label className="search-label">
              <span className="sr-only">Search games</span>
              <input
                className="search"
                type="search"
                placeholder="Search a title or genre"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </label>
            <p className="mono muted games-count">
              {results.length} {results.length === 1 ? 'game' : 'games'}
            </p>
          </div>

          {results.length > 0 ? (
            <div className="game-grid">
              {results.map((game) => (
                <GameCard game={game} key={game.title} />
              ))}
            </div>
          ) : (
            <div className="empty">
              <p>Nothing under that name. Ask the counter — the shelf changes every few weeks.</p>
              <button className="btn btn--ghost" type="button" onClick={() => { setQuery(''); setFilter('all'); }}>
                Clear filters
              </button>
            </div>
          )}

          <div className="games-cta">
            <p>Looking for something specific? Message us before you come.</p>
            <a
              className="btn btn--flame"
              href={whatsappUrl('Hi! Do you have this game at the shop?')}
              target="_blank"
              rel="noreferrer"
            >
              <ChatIcon /> Ask on WhatsApp
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
