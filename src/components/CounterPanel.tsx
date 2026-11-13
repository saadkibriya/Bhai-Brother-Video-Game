import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import {
  SESSION_LENGTHS,
  adminAction,
  alertsFor,
  clockLabel,
  elapsedLabel,
  fetchState,
  remainingLabel,
  statusLabel,
  type AlertKind,
  type ShopState,
  type StationAction,
  type StationState,
} from '../lib/stations';
import { durationLabel } from '../lib/pricing';
import { adminApi, type Admin } from '../lib/adminApi';
import { AdminAnnouncements } from './AdminAnnouncements';
import { AdminTeam } from './AdminTeam';

interface Toast {
  id: string;
  kind: AlertKind;
  title: string;
  body: string;
}

const ALERT_TEXT: Record<AlertKind, string> = {
  ten: '10 minutes left',
  five: '5 minutes left',
  end: 'Time is up',
};

function browserNotify(title: string, body: string) {
  if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;
  try {
    new Notification(title, { body, tag: `${title}·${body}` });
  } catch {
    /* some browsers refuse notifications without a service worker registration */
  }
}

export function CounterPanel({ admin, onSignOut }: { admin: Admin; onSignOut: () => void }) {
  const [state, setState] = useState<ShopState | null>(null);
  const [error, setError] = useState('');
  const [working, setWorking] = useState('');
  const [now, setNow] = useState(() => Date.now());
  const [starting, setStarting] = useState<string | null>(null);
  const [startDraft, setStartDraft] = useState({ player: '', minutes: 60 });
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [ended, setEnded] = useState<StationState | null>(null);
  const [notifyState, setNotifyState] = useState<string>(() =>
    typeof Notification === 'undefined' ? 'unsupported' : Notification.permission
  );
  const fired = useRef<Record<string, AlertKind[]>>({});

  useEffect(() => {
    const load = async () => {
      try {
        setState(await fetchState());
      } catch {
        /* keep the last known state */
      }
    };

    load();
    const poll = window.setInterval(load, 15_000);
    const clock = window.setInterval(() => setNow(Date.now()), 1000);

    return () => {
      window.clearInterval(poll);
      window.clearInterval(clock);
    };
  }, []);

  useEffect(() => {
    if (!state) return;

    const fresh: Toast[] = [];
    for (const station of state.stations) {
      if (station.status !== 'busy' || !station.endsAt) continue;

      const sessionKey = `${station.id}:${station.startedAt}`;
      const already = fired.current[sessionKey] ?? [];
      const due = alertsFor(station.endsAt, now, already);
      if (due.length === 0) continue;

      fired.current[sessionKey] = [...already, ...due];

      for (const kind of due) {
        const who = station.player ?? 'Player';
        const title = `${station.name} · ${who}`;
        const body =
          kind === 'end'
            ? 'Session finished — collect payment and free the station.'
            : `${ALERT_TEXT[kind]} — ends at ${clockLabel(station.endsAt)}.`;

        fresh.push({ id: `${sessionKey}:${kind}`, kind, title, body });
        if (kind === 'end') setEnded(station);
        browserNotify(title, body);
      }
    }

    if (fresh.length === 0) return;
    setToasts((current) => [...fresh, ...current].slice(0, 4));
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => !fresh.some((item) => item.id === toast.id)));
    }, 15_000);
  }, [now, state]);

  async function enableAlerts() {
    if (typeof Notification === 'undefined') return;
    const permission = await Notification.requestPermission();
    setNotifyState(permission);
  }

  async function run(
    station: StationState,
    action: StationAction,
    details: { player?: string; minutes?: number } = {}
  ) {
    setWorking(`${station.id}:${action}`);
    setError('');
    try {
      const next = await adminAction(station.id, action, details);
      setState(next);
      if (action === 'stop' || action === 'cancel') {
        delete fired.current[`${station.id}:${station.startedAt}`];
        setEnded(null);
      }
      if (action === 'start') setStarting(null);
    } catch (problem) {
      setError(problem instanceof Error ? problem.message : 'Could not update the station.');
    } finally {
      setWorking('');
    }
  }

  function startSession(event: FormEvent<HTMLFormElement>, station: StationState) {
    event.preventDefault();
    const player = startDraft.player.trim();
    if (!player) {
      setError('Add the player name before starting.');
      return;
    }
    run(station, 'start', { player, minutes: startDraft.minutes });
    setStartDraft({ player: '', minutes: 60 });
  }

  async function signOut() {
    try {
      await adminApi.logout();
    } finally {
      onSignOut();
    }
  }

  const busy = state?.stations.filter((station) => station.status === 'busy') ?? [];

  return (
    <>
      <section className="band band--ink page-head">
        <div className="wrap">
          <p className="eyebrow">Staff</p>
          <h1>Counter panel</h1>
          <p className="lede">
            Signed in as {admin.displayName} (@{admin.username}). Start a session with the player
            name and length, and the panel warns you 10 and 5 minutes before the time is up.
          </p>
          <div className="hero__actions">
            <Link className="btn btn--ghost" to="/qr">
              Counter QR
            </Link>
            <Link className="btn btn--ghost" to="/admin/settings">
              Account settings
            </Link>
            <button className="btn btn--ghost" type="button" onClick={signOut}>
              Sign out
            </button>
          </div>
        </div>
      </section>

      <section className="band band--ink-2">
        <div className="wrap">
          {admin.mustChange && (
            <p className="banner banner--warn">
              You are using a temporary password.{' '}
              <Link className="link-underline" to="/admin/settings">
                Change it now
              </Link>
              .
            </p>
          )}

          <div className="admin-bar">
            <div>
              <p className="eyebrow">Today</p>
              <p className="admin-bar__stat">
                {state?.sessionsToday ?? 0} sessions · {state?.minutesToday ?? 0} min · {busy.length}{' '}
                playing
              </p>
            </div>
            <div className="admin-bar__actions">
              {notifyState === 'default' && (
                <button className="btn btn--ghost" type="button" onClick={enableAlerts}>
                  Enable alerts
                </button>
              )}
            </div>
          </div>

          <p className="admin-hint">
            Timers here are for the PS5 and PS4 only — the arcade cabinet is walk-up at ৳10 for
            three tokens, with no time limit. Keep this panel open on the counter phone or tablet:
            it warns you 10 minutes and 5 minutes before a session ends, then pops up when the time
            is up.
            {notifyState === 'denied' && ' Browser notifications are blocked, so alerts only show here.'}
            {notifyState === 'granted' && ' Browser notifications are on.'}
          </p>

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
                    {station.player && <p className="station__player">{station.player}</p>}
                    {running && station.startedAt && (
                      <p className="station__meta">
                        Started {clockLabel(station.startedAt)}
                        {station.endsAt ? ` · ends ${clockLabel(station.endsAt)}` : ''}
                      </p>
                    )}
                  </div>

                  {!station.timed && (
                    <p className="station__meta">
                      Walk-up · tokens at the counter. No timer — block it when it is out of order.
                    </p>
                  )}

                  {station.timed && (
                    <p className="station__timer">
                      {running && station.startedAt ? elapsedLabel(station.startedAt, now) : '--:--'}
                    </p>
                  )}

                  {station.timed && station.status === 'busy' && station.endsAt && (
                    <p className="station__remaining" data-late={station.endsAt - now <= 5 * 60_000}>
                      {remainingLabel(station.endsAt, now)}
                    </p>
                  )}

                  <div className="station__actions">
                    {station.timed &&
                      (station.status === 'busy' ? (
                        <button
                          className="btn btn--flame"
                          type="button"
                          disabled={working === `${station.id}:stop`}
                          onClick={() => run(station, 'stop')}
                        >
                          End session
                        </button>
                      ) : (
                        <button
                          className="btn btn--flame"
                          type="button"
                          disabled={station.status === 'blocked' || working === `${station.id}:start`}
                          onClick={() => {
                            setStarting(station.id);
                            setStartDraft({ player: '', minutes: 60 });
                            setError('');
                          }}
                        >
                          Start session
                        </button>
                      ))}

                    {station.timed && station.status === 'busy' && station.endsAt && station.endsAt < now && (
                      <button
                        className="btn btn--ghost"
                        type="button"
                        disabled={working === `${station.id}:cancel`}
                        onClick={() => run(station, 'cancel')}
                        title="Free the station without recording playing time"
                      >
                        Cancel
                      </button>
                    )}

                    {station.status === 'blocked' ? (
                      <button
                        className="btn btn--ghost"
                        type="button"
                        disabled={working === `${station.id}:unblock`}
                        onClick={() => run(station, 'unblock')}
                      >
                        Unblock
                      </button>
                    ) : (
                      <button
                        className="btn btn--ghost"
                        type="button"
                        disabled={working === `${station.id}:block`}
                        onClick={() => run(station, 'block')}
                      >
                        Block
                      </button>
                    )}
                  </div>

                  {starting === station.id && station.status !== 'busy' && (
                    <form className="start-form" onSubmit={(event) => startSession(event, station)}>
                      <label className="start-form__name">
                        <span className="field__label">Player</span>
                        <input
                          className="input"
                          value={startDraft.player}
                          onChange={(event) =>
                            setStartDraft((current) => ({ ...current, player: event.target.value }))
                          }
                          placeholder="Who is playing?"
                          maxLength={60}
                          aria-label={`Player name for ${station.name}`}
                        />
                      </label>

                      <div className="start-form__length">
                        <span className="field__label">Session length</span>
                        <div className="choice-row choice-row--tight">
                          {SESSION_LENGTHS.map((minutes) => (
                            <button
                              key={minutes}
                              type="button"
                              className="choice"
                              aria-pressed={startDraft.minutes === minutes}
                              onClick={() => setStartDraft((current) => ({ ...current, minutes }))}
                            >
                              {durationLabel(minutes)}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="start-form__actions">
                        <button
                          className="btn btn--flame"
                          type="submit"
                          disabled={!startDraft.player.trim() || working === `${station.id}:start`}
                        >
                          Start
                        </button>
                        <button className="btn btn--ghost" type="button" onClick={() => setStarting(null)}>
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}
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
                    <th scope="col">Player</th>
                    <th scope="col">Station</th>
                    <th scope="col">Ended</th>
                    <th scope="col">Played</th>
                  </tr>
                </thead>
                <tbody>
                  {state?.recentSessions.map((session) => (
                    <tr key={`${session.stationId}-${session.endedAt}`}>
                      <td>{session.player ?? '—'}</td>
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

          <AdminAnnouncements />

          {admin.role === 'owner' && <AdminTeam currentAdminId={admin.id} />}
        </div>
      </section>

      {toasts.length > 0 && (
        <div className="toasts" role="status" aria-live="polite">
          {toasts.map((toast) => (
            <div className="toast" data-kind={toast.kind} key={toast.id}>
              <strong>{toast.title}</strong>
              <span>{toast.body}</span>
            </div>
          ))}
        </div>
      )}

      {ended && (
        <div className="alert-overlay" role="dialog" aria-modal="true" aria-label="Session finished">
          <div className="alert-card">
            <p className="eyebrow">Time is up</p>
            <h2>
              {ended.player ?? 'Player'} on {ended.name}
            </h2>
            <p>
              The session has finished. Collect the payment, then end the timer to log how long they
              played.
            </p>
            <div className="alert-card__actions">
              <button
                className="btn btn--flame"
                type="button"
                disabled={working === `${ended.id}:stop`}
                onClick={() => run(ended, 'stop')}
              >
                End session
              </button>
              <button className="btn btn--ghost" type="button" onClick={() => setEnded(null)}>
                Still playing
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
