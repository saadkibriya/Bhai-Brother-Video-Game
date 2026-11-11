import { Link } from 'react-router-dom';
import { ARCADE, BAYS, PASSES, SHOP } from '../data/shop';
import { Calculator } from '../components/Calculator';
import { ArrowIcon } from '../components/icons';
import { formatTaka } from '../lib/pricing';

export function PricingPage() {
  return (
    <>
      <section className="band band--ink page-head">
        <div className="wrap">
          <p className="eyebrow">Rates</p>
          <h1>
            The price board
          </h1>
          <p className="lede">
            Simple hourly rates, cheaper passes, and a coin-op corner. No cover charge, no minimum
            spend, no per-person pricing.
          </p>
        </div>
      </section>

      <section className="band band--paper">
        <div className="wrap">
          <div className="bay-grid">
            {BAYS.map((bay) => (
              <article className="bay" key={bay.id}>
                <p className="eyebrow">{bay.platforms}</p>
                <p className="bay__price">
                  {formatTaka(bay.rate)}
                  <span> / station / hour</span>
                </p>
                <p className="bay__copy">{bay.copy}</p>
                <ul className="bay__specs">
                  {bay.specs.map((spec) => (
                    <li key={spec}>{spec}</li>
                  ))}
                </ul>
              </article>
            ))}

            <article className="bay">
              <p className="eyebrow">Arcade</p>
              <p className="bay__price">
                {ARCADE.rate}
                <span> / {ARCADE.rateNote.toLowerCase()}</span>
              </p>
              <p className="bay__copy">{ARCADE.copy}</p>
              <ul className="bay__specs">
                {ARCADE.packs.map((pack) => (
                  <li key={pack.tokens}>
                    {pack.tokens} tokens — {formatTaka(pack.price)}
                  </li>
                ))}
              </ul>
            </article>
          </div>
        </div>
      </section>

      <section className="band band--paper">
        <div className="wrap">
          <div className="section-head">
            <div>
              <p className="eyebrow">Work it out</p>
              <h2>What will it cost?</h2>
            </div>
            <p>Pick a station and a length. This is the same maths the counter uses.</p>
          </div>
          <Calculator />
        </div>
      </section>

      <section className="band band--ink">
        <div className="wrap">
          <div className="section-head">
            <div>
              <p className="eyebrow">Passes</p>
              <h2>Cheaper by the block.</h2>
            </div>
            <p>
              Buy hours up front for the month, or a squad pass for one long Friday. Start any pass
              at the counter.
            </p>
          </div>

          <table className="pass-table pass-table--dark">
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

          <div className="fine-print">
            <p>
              <strong>The small print.</strong> Rates are per station, up to four controllers.
              Time is billed in half-hour steps, minimum 30 minutes. Last session starts one hour
              before closing. Booked slots are held for 10 minutes. Pay at the counter by cash,
              bKash or Nagad.
            </p>
            <p>
              Questions about a big group or a full-day booking? Call{' '}
              <a className="link-underline" href={`tel:${SHOP.tel}`}>
                {SHOP.phone}
              </a>
              .
            </p>
          </div>

          <div className="hero__actions" style={{ marginTop: '2rem' }}>
            <Link className="btn btn--flame" to="/book">
              Book a station <ArrowIcon />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
