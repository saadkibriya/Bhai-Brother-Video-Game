import { useEffect, useState, type FormEvent } from 'react';
import {
  adminAction,
  adminVerify,
  elapsedLabel,
  fetchState,
  statusLabel,
  type ShopState,
  type StationAction,
} from '../lib/stations';

const KEY_STORAGE = 'bb-admin-key';

export function AdminPage() {
  const [key, setKey] = useState(() => sessionStorage.getItem(KEY_STORAGE) ?? '');
  const [draft, setDraft] = useState('');
  const [unlocked, setUnlocked] = useState(false);
  const [checking, setChecking] = useState(false);
  const [state, setState] = useState<ShopState | null>(null);
  const [error, setError] = useState('');
  const [working, setWorking] = useState('');
  const [, setTick] = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        setState(await fetchState());
      } catch {
        /* the board simply shows the last known state */
      }
    };

    load();
    const poll = window.setInterval(load, 15_000);
    const clock = window.setInterval(() => setTick((tick) => tick + 1), 1000);

    return () => {
      window.clearInterval(poll);
      window.clearInterval(clock);
    };
  }, []);

  useEffect(() => {
    if (!key) return;
    setChecking(true);
    adminVerify(key)
      .then(() => setUnlocked(true))
      .catch(() => setUnlocked(false))
      .finally(() => setChecking(false));
    // Only re-check when the stored key changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  async function unlock(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    try {
      await adminVerify(draft.trim());
      sessionStorage.setItem(KEY_STORAGE, draft.trim());
      setKey(draft.trim());
      setUnlocked(true);
      setDraft('');
    } catch (problem) {
      setError(problem instanceof Error ? problem.message : 'That key did not work.');
    }
  }

  async function run(id: string, action: StationAction) {
    setWorking(`${id}:${action}`);
    setError('');
    try {
      setState(await adminAction(key, id, action));
    } catch (problem) {
      setError(problem instanceof Error ? problem.message : 'Could not update the station.');
    } finally {
      setWorking('');
    }
  }

  function lock() {
    sessionStorage.removeItem(KEY_STORAGE);
    setKey('');
    setUnlocked(false);
  }

  return (
    <>
      <section className="band band--ink page-head">
        <div className="wrap">
          <p className="eyebrow">Staff</p>
          <h1>Counter panel</h1>
          <p className="lede">
            Start a timer when a session begins, end it to save the duration, and block a station
            when it is out of service. Customers see this state live.
          </p>
        </div>
      </section>

      <section className="band band--ink-2">
        <div className="wrap">
          {!unlocked ? (
            <form className="admin-lock" onSubmit={unlock}>
              <p className="field__label">Admin key</p>
              <div className="admin-lock__row">
                <input
                  className="input"
                  type="password"
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  placeholder="Enter the shop key"
                  autoComplete="current-password"
                  aria-label="Admin key"
                />
                <button className="btn btn--flame" type="submit" disabled={draft.trim().length < 4}>
                  Unlock
                </button>
              </div>
              {error && (
                <p className="error" role="alert">
                  {error}
                </p>
              )}
              <p className="summary__note">
                {checking
                  ? 'Checking the saved key…'
                  : state && !state.adminConfigured
                    ? 'No admin key is set on the server yet. Add ADMIN_KEY in Sites → Secrets, then reload.'
                    : 'The key is kept in this browser tab only. Ask the site owner if you do not have it.'}
              </p>
            </form>
          ) : (
            <>
              <div className="admin-bar">
                <div>
                  <p className="eyebrow">Today</p>
                  <p className="admin-bar__stat">
                    {state?.sessionsToday ?? 0} sessions · {state?.minutesToday ?? 0} min
                  </p>
                </div>
                <button className="btn btn--ghost" type="button" onClick={lock}>
                  Lock panel
                </button>
              </div>

              {error && (
                <p className="error" role="alert">
                  {error}
                </p>
              )}

              <div className="board board--admin">
                {(state?.stations ?? []).map((station) => {
                  const running = station.status === 'busy' && station.startedAt;
                  return (
                    <article className="station station--admin" data-status={station.status} key={station.id}>
                      <div>
                        <p className="station__platform">{station.platform}</p>
                        <h3>{station.name}</h3>
                        <p className="station__status">
                          <span className="station__dot" aria-hidden="true" />
                          {statusLabel(station.status)}
                        </p>
                      </div>

                      <p className="station__timer">
                        {running && station.startedAt
                          ? elapsedLabel(station.startedAt, Date.now())
                          : '--:--'}
                      </p>

                      <div className="station__actions">
                        {station.status === 'busy' ? (
                          <button
                            className="btn btn--flame"
                            type="button"
                            disabled={working === `${station.id}:stop`}
                            onClick={() => run(station.id, 'stop')}
                          >
                            End session
                          </button>
                        ) : (
                          <button
                            className="btn btn--flame"
                            type="button"
                            disabled={
                              station.status === 'blocked' ||
                              working === `${station.id}:start`
                            }
                            onClick={() => run(station.id, 'start')}
                          >
                            Start timer
                          </button>
                        )}

                        {station.status === 'blocked' ? (
                          <button
                            className="btn btn--ghost"
                            type="button"
                            disabled={working === `${station.id}:unblock`}
                            onClick={() => run(station.id, 'unblock')}
                          >
                            Unblock
                          </button>
                        ) : (
                          <button
                            className="btn btn--ghost"
                            type="button"
                            disabled={working === `${station.id}:block`}
                            onClick={() => run(station.id, 'block')}
                          >
                            Block
                          </button>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>

              <div className="admin-log">
                <p className="eyebrow">Recent sessions</p>
                {(state?.recentSessions.length ?? 0) === 0 ? (
                  <p className="summary__note">No sessions saved yet. End a timer to record one.</p>
                ) : (
                  <table className="pass-table pass-table--dark">
                    <thead>
                      <tr>
                        <th scope="col">Station</th>
                        <th scope="col">Ended</th>
                        <th scope="col">Length</th>
                      </tr>
                    </thead>
                    <tbody>
                      {state?.recentSessions.map((session) => (
                        <tr key={`${session.stationId}-${session.endedAt}`}>
                          <td>
                            {state.stations.find((station) => station.id === session.stationId)?.name ??
                              session.stationId}
                          </td>
                          <td>
                            {new Date(session.endedAt).toLocaleTimeString('en-GB', {
                              hour: 'numeric',
                              minute: '2-digit',
                              timeZone: 'Asia/Dhaka',
                            })}
                          </td>
                          <td>{session.minutes} min</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
}
