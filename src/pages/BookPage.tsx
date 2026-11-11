import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { SHOP } from '../data/shop';
import { ChatIcon, CheckIcon, PhoneIcon } from '../components/icons';
import {
  buildBookingMessage,
  dayLabel,
  durationChoices,
  endLabel,
  fits,
  labelForMinutes,
  normalizePhone,
  slotsFor,
  upcomingDays,
  whatsappUrl,
} from '../lib/booking';
import { DURATIONS, quote, durationLabel, formatTaka, RATES, type Platform } from '../lib/pricing';

const PLAYER_OPTIONS = [1, 2, 3, 4];

export function BookPage() {
  const days = useMemo(() => upcomingDays(10), []);
  // Start on the first day that still has a bookable slot, so late-night
  // visitors land on tomorrow instead of an empty "no slots left" form.
  const firstOpenDay = useMemo(
    () => days.find((day) => slotsFor(day.iso).length > 0) ?? days[0],
    [days]
  );
  const [platform, setPlatform] = useState<Platform>('ps5');
  const [dateIso, setDateIso] = useState(firstOpenDay.iso);
  const [slots, setSlots] = useState<number[]>(() => slotsFor(firstOpenDay.iso));
  const [start, setStart] = useState<number>(() => slotsFor(firstOpenDay.iso)[0] ?? 0);
  const [duration, setDuration] = useState(120);
  const [players, setPlayers] = useState(2);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState<{ url: string } | null>(null);

  useEffect(() => {
    const next = slotsFor(dateIso);
    setSlots(next);
    setStart(next[0] ?? 0);
    setError('');
    setSent(null);
  }, [dateIso]);

  useEffect(() => {
    if (slots.length === 0) return;
    if (!fits(dateIso, start, duration)) {
      const allowed = durationChoices(dateIso, start);
      setDuration(allowed[allowed.length - 1] ?? 60);
    }
  }, [dateIso, start, duration, slots.length]);

  const estimate = quote(platform, duration);
  const chosenDay = days.find((day) => day.iso === dateIso);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!chosenDay || slots.length === 0) {
      setError('There are no start times left on this day. Pick another date.');
      return;
    }
    if (name.trim().length < 2) {
      setError('Add a name so we know who to ask for at the counter.');
      return;
    }
    if (!normalizePhone(phone)) {
      setError('That number does not look right. Use 01XXXXXXXXX.');
      return;
    }

    const message = buildBookingMessage({
      platform,
      dateIso,
      start,
      duration,
      players,
      name: name.trim(),
      phone: phone.trim(),
      note,
    });
    const url = whatsappUrl(message);
    setError('');
    window.open(url, '_blank', 'noopener,noreferrer');
    setSent({ url });
  }

  function reset() {
    setSent(null);
    setError('');
  }

  return (
    <>
      <section className="band band--ink page-head">
        <div className="wrap">
          <p className="eyebrow">Book</p>
          <h1>
            Hold a station
          </h1>
          <p className="lede">
            Tell us when you are coming and we will keep the station free. Requests go straight to
            the counter on WhatsApp — no prepayment, no account.
          </p>
        </div>
      </section>

      <section className="band band--ink-2">
        <div className="wrap book-grid">
          <div>
            {sent ? (
              <div className="success">
                <p className="eyebrow">
                  <CheckIcon /> Request ready
                </p>
                <h2>Send it to the counter.</h2>
                <p>
                  WhatsApp should have opened with your request written out. Tap send there and we
                  will confirm your station.
                </p>
                <p className="success__actions">
                  <a className="btn btn--flame" href={sent.url} target="_blank" rel="noreferrer">
                    <ChatIcon /> Open WhatsApp again
                  </a>
                  <button className="btn btn--ghost" type="button" onClick={reset}>
                    Change booking
                  </button>
                </p>
                <p className="summary__note">
                  Nothing has been charged. If WhatsApp does not open, call{' '}
                  <a className="link-underline" href={`tel:${SHOP.tel}`}>
                    {SHOP.phone}
                  </a>
                  .
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate>
                <fieldset className="field">
                  <legend>Station</legend>
                  <div className="choice-row">
                    {(['ps5', 'ps4'] as Platform[]).map((option) => (
                      <button
                        key={option}
                        type="button"
                        className="choice"
                        aria-pressed={platform === option}
                        onClick={() => setPlatform(option)}
                      >
                        {option.toUpperCase()} · {formatTaka(RATES[option])}/hr
                      </button>
                    ))}
                  </div>
                </fieldset>

                <fieldset className="field">
                  <legend>Day</legend>
                  <div className="day-strip">
                    {days.map((day) => (
                      <button
                        key={day.iso}
                        type="button"
                        className="day"
                        aria-pressed={dateIso === day.iso}
                        aria-label={`${day.isToday ? 'Today, ' : ''}${dayLabel(day.iso)}`}
                        onClick={() => setDateIso(day.iso)}
                      >
                        <span>{day.isToday ? 'Today' : day.weekdayShort}</span>
                        <strong>{day.day}</strong>
                        <span>{day.month}</span>
                      </button>
                    ))}
                  </div>
                </fieldset>

                <fieldset className="field">
                  <legend>Start time</legend>
                  {slots.length > 0 ? (
                    <div className="slot-grid">
                      {slots.map((slot) => (
                        <button
                          key={slot}
                          type="button"
                          className="slot"
                          aria-pressed={start === slot}
                          onClick={() => setStart(slot)}
                        >
                          {labelForMinutes(slot)}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="error">
                      No start times left {chosenDay?.isToday ? 'today' : 'on this day'}. Try
                      tomorrow, or call the counter.
                    </p>
                  )}
                </fieldset>

                <div className="two-up">
                  <fieldset className="field">
                    <legend>How long?</legend>
                    <div className="choice-row">
                      {DURATIONS.map((option) => (
                        <button
                          key={option}
                          type="button"
                          className="choice"
                          aria-pressed={duration === option}
                          disabled={slots.length > 0 && !fits(dateIso, start, option)}
                          onClick={() => setDuration(option)}
                        >
                          {durationLabel(option)}
                        </button>
                      ))}
                    </div>
                    <p className="field__hint">
                      30 minutes counts as a full session — ৳35 on PS5, ৳25 on PS4.
                    </p>
                  </fieldset>

                  <fieldset className="field">
                    <legend>Players</legend>
                    <div className="choice-row">
                      {PLAYER_OPTIONS.map((option) => (
                        <button
                          key={option}
                          type="button"
                          className="choice"
                          aria-pressed={players === option}
                          onClick={() => setPlayers(option)}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </fieldset>
                </div>

                <div className="two-up">
                  <div className="field">
                    <label htmlFor="booking-name">Your name</label>
                    <input
                      id="booking-name"
                      className="input"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      autoComplete="name"
                      placeholder="Rafi"
                      required
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="booking-phone">Phone (WhatsApp)</label>
                    <input
                      id="booking-phone"
                      className="input"
                      value={phone}
                      onChange={(event) => setPhone(event.target.value)}
                      autoComplete="tel"
                      inputMode="tel"
                      placeholder="01712 345678"
                      required
                    />
                  </div>
                </div>

                <div className="field">
                  <label htmlFor="booking-note">Anything we should know? (optional)</label>
                  <input
                    id="booking-note"
                    className="input"
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                    placeholder="FC 26, four of us"
                  />
                </div>

                {error && (
                  <p className="error" role="alert">
                    {error}
                  </p>
                )}

                <button className="btn btn--flame btn--block" type="submit" disabled={slots.length === 0}>
                  <ChatIcon /> Send request on WhatsApp
                </button>
                <p className="summary__note">
                  This opens a WhatsApp chat with the counter (@{SHOP.whatsappHandle}) and your
                  request written out. They reply there to confirm. Prefer to talk?{' '}
                  <a className="link-underline" href={`tel:${SHOP.tel}`}>
                    <PhoneIcon /> Call {SHOP.phone}
                  </a>
                </p>
              </form>
            )}
          </div>

          <aside className="summary" aria-label="Booking summary">
            <p className="eyebrow">Your session</p>
            <p className="summary__total">{formatTaka(estimate.total)}</p>
            <p className="mono muted">{durationLabel(estimate.minutes)} · up to 4 players</p>

            <div className="summary__lines">
              <p className="summary__line">
                <span>Station</span> <strong>{platform.toUpperCase()}</strong>
              </p>
              <p className="summary__line">
                <span>Day</span> <strong>{chosenDay ? dayLabel(chosenDay.iso) : '—'}</strong>
              </p>
              <p className="summary__line">
                <span>Time</span>{' '}
                <strong>
                  {slots.length > 0 ? `${labelForMinutes(start)} – ${endLabel(start, duration)}` : '—'}
                </strong>
              </p>
              <p className="summary__line">
                <span>Squad</span> <strong>{players} {players === 1 ? 'player' : 'players'}</strong>
              </p>
              {estimate.pass && (
                <p className="summary__line">
                  <span>{estimate.pass}</span> <strong>−{formatTaka(estimate.saved)}</strong>
                </p>
              )}
            </div>

            <p className="summary__note">
              Rates are per station, not per person. Pay at the counter after your session — cash,
              bKash or Nagad.
            </p>
            <Link className="summary__link" to="/pricing">
              See all rates &amp; passes
            </Link>
          </aside>
        </div>
      </section>
    </>
  );
}
