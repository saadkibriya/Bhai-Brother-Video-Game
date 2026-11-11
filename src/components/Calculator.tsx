import { useState } from 'react';
import { DURATIONS, RATES, formatTaka, quote, type Platform } from '../lib/pricing';

export function Calculator() {
  const [platform, setPlatform] = useState<Platform>('ps5');
  const [duration, setDuration] = useState<number>(120);
  const result = quote(platform, duration);

  return (
    <div className="calc">
      <div>
        <p className="field__label">Which station?</p>
        <div className="choice-row" role="group" aria-label="Station">
          {(['ps5', 'ps4'] as Platform[]).map((option) => (
            <button
              key={option}
              type="button"
              className="choice"
              aria-pressed={platform === option}
              onClick={() => setPlatform(option)}
            >
              {option.toUpperCase()} · ৳{RATES[option]}/hr
            </button>
          ))}
        </div>

        <p className="field__label" style={{ marginTop: '1.6rem' }}>
          How long?
        </p>
        <div className="choice-row" role="group" aria-label="Duration">
          {DURATIONS.map((option) => (
            <button
              key={option}
              type="button"
              className="choice"
              aria-pressed={duration === option}
              onClick={() => setDuration(option)}
            >
              {option / 60} hr
            </button>
          ))}
        </div>
      </div>

      <div className="calc__out">
        <div>
          <p className="field__label">Your session</p>
          <p className="calc__price">{formatTaka(result.total)}</p>
          <p className="muted calc__line">
            {result.minutes / 60} hr on {platform.toUpperCase()} · up to 4 players
          </p>
        </div>
        <p className="note">
          {result.pass ? (
            <>
              Squad pass applied — you save {formatTaka(result.saved)}.
            </>
          ) : (
            <>
              Billed by the half hour. Extra players cost nothing — the station is the station.
            </>
          )}
        </p>
      </div>
    </div>
  );
}
