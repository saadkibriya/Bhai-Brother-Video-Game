import { useEffect, useState } from 'react';
import { elapsedLabel, fetchState, statusLabel, type ShopState } from '../lib/stations';

export function LiveBoard({ compact = false }: { compact?: boolean }) {
  const [state, setState] = useState<ShopState | null>(null);
  const [failed, setFailed] = useState(false);
  const [, setTick] = useState(0);

  useEffect(() => {
    let alive = true;

    const load = async () => {
      try {
        const next = await fetchState();
        if (alive) {
          setState(next);
          setFailed(false);
        }
      } catch {
        if (alive) setFailed(true);
      }
    };

    load();
    const poll = window.setInterval(load, 20_000);
    const clock = window.setInterval(() => setTick((tick) => tick + 1), 1000);

    return () => {
      alive = false;
      window.clearInterval(poll);
      window.clearInterval(clock);
    };
  }, []);

  if (!state) {
    return (
      <p className="board-note">
        {failed
          ? 'Live status is unavailable right now. Call the counter to check a station.'
          : 'Checking the floor…'}
      </p>
    );
  }

  return (
    <div className={`board${compact ? ' board--compact' : ''}`}>
      {state.stations.map((station) => {
        const running = station.status === 'busy' && station.startedAt;
        return (
          <article className="station" data-status={station.status} key={station.id}>
            <p className="station__platform">{station.platform}</p>
            <h3>{station.name}</h3>
            <p className="station__status">
              <span className="station__dot" aria-hidden="true" />
              {running && station.startedAt
                ? `${statusLabel(station.status)} · ${elapsedLabel(station.startedAt, Date.now())}`
                : statusLabel(station.status)}
            </p>
            {station.status === 'blocked' && (
              <p className="station__meta">Out of service right now.</p>
            )}
          </article>
        );
      })}
    </div>
  );
}
