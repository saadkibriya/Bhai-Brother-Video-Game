import { useState } from 'react';
import { DURATIONS, RATES, durationLabel, formatTaka, quote, type Platform } from '../lib/pricing';

const PLAYERS = [1, 2, 3, 4];

export function Calculator() {
  const [platform, setPlatform] = useState<Platform>('ps5');
  const [duration, setDuration] = useState<number>(120);
  const [players, setPlayers] = useState(2);
  const result = quote(platform, duration, players);

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
              {durationLabel(option)}
            </button>
          ))}
        </div>

        <p className="field__label" style={{ marginTop: '1.6rem' }}>
          How many playing?
        </p>
        <div className="choice-row" role="group" aria-label="Players">
          {PLAYERS.map((option) => (
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
      </div>

      <div className="calc__out">
        <div>
          <p className="field__label">Your session</p>
          <p className="calc__price">{formatTaka(result.total)}</p>
          <p className="muted calc__line">
            {durationLabel(result.minutes)} on {platform.toUpperCase()} · {players}{' '}
            {players === 1 ? 'player' : 'players'} · {formatTaka(result.perPerson)} each
          </p>
        </div>
        <p className="note">
          {result.pass ? (
            <>Squad pass applied — you save {formatTaka(result.saved)}.</>
          ) : (
            <>Billed by the half hour, per person. Every player pays their share.</>
          )}
        </p>
      </div>
    </div>
  );
}
