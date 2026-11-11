import { Link } from 'react-router-dom';
import { BAYS, FAQS, GAMES, PASSES, SHOP, TOURNAMENT, photos } from '../data/shop';
import { GameCard } from '../components/GameCard';
import { OpenStatus } from '../components/OpenStatus';
import { ArrowIcon, ChatIcon, PinIcon } from '../components/icons';
import { whatsappUrl } from '../lib/booking';
import { HOURS, dhakaNow, hoursSummary } from '../lib/hours';
import { formatTaka } from '../lib/pricing';

const featuredGames = GAMES.filter((game) => game.cover);

function Ticker() {
  const items = ['PS5 ৳70/hr', 'PS4 ৳50/hr', 'Arcade 3 tokens ৳10', 'Up to 4 players', 'Green City · Block C', 'Open till late'];
  return (
    <div className="ticker" aria-hidden="true">
      <div className="ticker__track">
        {[0, 1].map((copy) => (
          <div className="ticker__group" key={copy}>
            {items.map((item) => (
              <span key={`${copy}-${item}`}>
                {item} <span aria-hidden="true">✦</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function HomePage() {
  const today = dhakaNow().weekday;

  return (
    <>
      <section className="band band--ink hero grain">
        <div className="wrap hero__grid">
          <div>
            <div className="hero__meta">
              <span className="eyebrow">Green City · Mohammadpur · Dhaka</span>
              <OpenStatus />
            </div>

            <h1 className="hero__title">
              Play loud
              <br />
              Stay late
            </h1>

            <p className="lede">
              PS5, PS4 and a coin-op corner in Green City, Mohammadpur. Bring the squad, take the
              couch, and play until the shutters come down.
            </p>

            <div className="hero__actions">
              <Link className="btn btn--flame btn--xl btn--cta" to="/book">
                Book a slot <ArrowIcon className="btn__arrow" />
              </Link>
              <a className="btn btn--ghost" href={SHOP.map} target="_blank" rel="noreferrer">
                <PinIcon /> Get directions
              </a>
            </div>

            <dl className="hero__rates">
              {BAYS.map((bay) => (
                <div key={bay.id}>
                  <dt>{bay.id.toUpperCase()}</dt>
                  <dd>
                    ৳{bay.rate}
                    <span>/hr each</span>
                  </dd>
                </div>
              ))}
              <div>
                <dt>Arcade</dt>
                <dd>
                  ৳10<span>/3 tokens</span>
                </dd>
              </div>
              <div>
                <dt>Half hour</dt>
                <dd>
                  ৳40<span>PS5 · ৳30 PS4</span>
                </dd>
              </div>
            </dl>

            <p className="hero__half">
              <span aria-hidden="true">✱</span> In a hurry? 30 minutes is a real session — ৳40 on
              PS5, ৳30 on PS4, per person.
            </p>
          </div>

          <figure className="hero__shot">
            <img
              src={photos.lounge}
              alt="The Bhai Brother gaming floor in Green City, Mohammadpur"
              width={1200}
              height={670}
              fetchPriority="high"
              decoding="async"
            />
            <figcaption>
              <span>01 / The floor</span>
              Four pads on every station, so nobody gets stuck watching.
            </figcaption>
          </figure>
        </div>
      </section>

      <Ticker />

      <section className="band band--paper" id="rates">
        <div className="wrap">
          <div className="section-head">
            <div>
              <p className="eyebrow">02 / The rates</p>
              <h2>No packages to decode.</h2>
            </div>
            <p>
              Pay by the hour, per person. Bring three friends and each pays their own share. We
              round to the nearest half hour.
            </p>
          </div>

          <div className="rate-list">
            {BAYS.map((bay) => (
              <div className="rate-row" key={bay.id}>
                <p className="rate-row__name">
                  {bay.title}
                  <small>{bay.specs.join(' · ')}</small>
                </p>
                <p className="rate-row__copy">{bay.copy}</p>
                <p className="rate-row__price">
                  ৳{bay.rate}
                  <small>per person / hour</small>
                </p>
              </div>
            ))}
            <div className="rate-row">
              <p className="rate-row__name">
                Arcade cabinet
                <small>Tokens from the counter</small>
              </p>
              <p className="rate-row__copy">Quick rounds between matches. Cheaper in packs of ten.</p>
              <p className="rate-row__price">
                ৳10
                <small>3 tokens</small>
              </p>
            </div>

            <div className="rate-row">
              <p className="rate-row__name">
                Half hour
                <small>30 minutes on either station</small>
              </p>
              <p className="rate-row__copy">
                Short visit between classes or before dinner? Half an hour, same four controllers,
                no strings.
              </p>
              <p className="rate-row__price">
                ৳40<small>30 min per person · PS4 ৳30</small>
              </p>
            </div>
          </div>

          <p className="note">
            <span aria-hidden="true">✱</span> Half hours are fine — 30 minutes is ৳40 per person on
            PS5 or ৳30 on PS4. Passes bring the hourly rate down too; see the{' '}
            <Link to="/pricing">rate card</Link>. Sessions are billed at the counter after you play.
          </p>
        </div>
      </section>

      <section className="band band--ink games-band">
        <div className="wrap">
          <div className="section-head">
            <div>
              <p className="eyebrow">03 / On the shelf</p>
              <h2>What everybody plays.</h2>
            </div>
            <Link className="btn btn--ghost" to="/games">
              All games <ArrowIcon />
            </Link>
          </div>

          <div className="game-grid">
            {featuredGames.map((game) => (
              <GameCard game={game} key={game.title} />
            ))}
          </div>

          <p className="note note--dark">
            <span aria-hidden="true">✱</span> Ten titles on the floor. If your squad is arguing
            about something else, ask at the counter — chances are it is already installed.
          </p>
        </div>
      </section>

      <section className="band band--paper">
        <div className="wrap">
          <div className="section-head">
            <div>
              <p className="eyebrow">04 / Passes</p>
              <h2>For the regulars.</h2>
            </div>
            <p>
              Buy hours up front and use them whenever. Passes are per person and run from the day
              you buy them — ask at the counter to start one.
            </p>
          </div>

          <table className="pass-table">
            <caption className="sr-only">Pass prices for PS5 and PS4</caption>
            <thead>
              <tr>
                <th scope="col">Pass</th>
                <th scope="col">PS5</th>
                <th scope="col">PS4</th>
              </tr>
            </thead>
            <tbody>
              {PASSES.map((pass) => (
                <tr key={pass.name}>
                  <td>
                    {pass.name}
                    <small>{pass.detail}</small>
                  </td>
                  <td>
                    {pass.wasPs5 && <s>৳{pass.wasPs5}</s>}৳{pass.ps5}
                  </td>
                  <td>
                    {pass.wasPs4 && <s>৳{pass.wasPs4}</s>}৳{pass.ps4}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="band band--flame tournament">
        <div className="wrap tournament__grid">
          <div>
            <p className="eyebrow">05 / Every Friday</p>
            <h2>{TOURNAMENT.title}</h2>
            <p className="tournament__lede">
              {TOURNAMENT.game}, 1v1, on the big screen. Sixteen players, one trophy, a lot of noise.
              Sign up at the counter or send us a message.
            </p>
            <div className="hero__actions">
              <a
                className="btn"
                href={whatsappUrl(`Hi! I want to join the ${TOURNAMENT.title} (${TOURNAMENT.game}).`)}
                target="_blank"
                rel="noreferrer"
              >
                <ChatIcon /> Ask to join
              </a>
            </div>
          </div>

          <dl className="tournament__facts">
            <div>
              <dt>When</dt>
              <dd>{TOURNAMENT.when}</dd>
            </div>
            <div>
              <dt>Format</dt>
              <dd>{TOURNAMENT.format}</dd>
            </div>
            <div>
              <dt>Entry</dt>
              <dd>{formatTaka(TOURNAMENT.entry)}</dd>
            </div>
            <div>
              <dt>Prize</dt>
              <dd>{TOURNAMENT.prize}</dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="band band--ink" id="visit">
        <div className="wrap visit__grid">
          <div>
            <p className="eyebrow">06 / Find the floor</p>
            <h2>Green City, Block C.</h2>
            <p className="visit__address">
              {SHOP.address}
              <br />
              <span className="muted">{SHOP.landmark}</span>
            </p>

            <div className="hero__actions">
              <a className="btn btn--flame" href={SHOP.map} target="_blank" rel="noreferrer">
                Open in Maps <ArrowIcon />
              </a>
              <a className="btn btn--ghost" href={`tel:${SHOP.tel}`}>
                {SHOP.phone}
              </a>
            </div>

            <p className="note note--dark">
              Look for the orange sign above the stairwell. If you are lost, call — we will walk you in.
            </p>
          </div>

          <div>
            <p className="eyebrow">This week</p>
            <table className="hours-table">
              <caption className="sr-only">Opening hours in Dhaka</caption>
              <tbody>
                {HOURS.map((day) => (
                  <tr key={day.weekday} data-today={day.weekday === today}>
                    <th scope="row">{day.label}</th>
                    <td>{hoursSummary(day)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="note note--dark">
              Last session starts an hour before closing. Thursday runs past midnight into Friday.
            </p>
          </div>
        </div>
      </section>

      <section className="band band--paper faq" id="faq">
        <div className="wrap">
          <div className="section-head">
            <div>
              <p className="eyebrow">07 / Before you come</p>
              <h2>The short answers.</h2>
            </div>
            <p>
              Still unsure about something? Message the counter on{' '}
              <a className="link-underline" href={whatsappUrl('Hi! I have a question about the shop.')} target="_blank" rel="noreferrer">
                WhatsApp
              </a>
              .
            </p>
          </div>

          {FAQS.map((item) => (
            <details key={item.q}>
              <summary>{item.q}</summary>
              <p>{item.a}</p>
            </details>
          ))}
        </div>
      </section>
    </>
  );
}
