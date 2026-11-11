import { FAQS, SHOP } from '../data/shop';
import { ArrowIcon, ChatIcon, PinIcon } from '../components/icons';
import { OpenStatus } from '../components/OpenStatus';
import { whatsappUrl } from '../lib/booking';
import { HOURS, dhakaNow, hoursSummary } from '../lib/hours';

export function VisitPage() {
  const today = dhakaNow().weekday;
  const waLink = whatsappUrl('Hi! I have a question about the shop.');

  return (
    <>
      <section className="band band--ink page-head">
        <div className="wrap">
          <div className="page-head__meta">
            <p className="eyebrow">Visit</p>
            <OpenStatus />
          </div>
          <h1>
            Find the floor
          </h1>
          <p className="lede">
            Green City Residential, Block C — beside Sporsho Beauty Buzz. Take the stairs, follow
            the noise.
          </p>
        </div>
      </section>

      <section className="band band--ink-2">
        <div className="wrap visit__grid">
          <div>
            <p className="eyebrow">Address</p>
            <p className="visit__address">
              {SHOP.address}
              <br />
              <span className="muted">{SHOP.landmark}</span>
            </p>

            <div className="hero__actions" style={{ marginTop: '1.5rem' }}>
              <a className="btn btn--flame" href={SHOP.map} target="_blank" rel="noreferrer">
                <PinIcon /> Open in Maps <ArrowIcon />
              </a>
              <a
                className="btn btn--ghost"
                href={whatsappUrl('Hi! I am coming over — how do I find the shop?')}
                target="_blank"
                rel="noreferrer"
              >
                <ChatIcon /> Ask on WhatsApp
              </a>
            </div>

            <p className="note note--dark">
              <span aria-hidden="true">✱</span> Two ways to reach the counter:{' '}
              <a className="link-underline" href={`tel:${SHOP.tel}`}>
                call {SHOP.phone}
              </a>{' '}
              or message{' '}
              <a
                className="link-underline"
                href={waLink}
                target="_blank"
                rel="noreferrer"
              >
                WhatsApp @{SHOP.whatsappHandle}
              </a>
              .
            </p>

            <iframe
              className="map"
              title={`Map showing ${SHOP.fullName}`}
              src={SHOP.mapEmbed}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>

          <div>
            <p className="eyebrow">Opening hours</p>
            <table className="hours-table">
              <caption className="sr-only">Opening hours in Dhaka, Bangladesh</caption>
              <thead>
                <tr>
                  <th scope="col">Day</th>
                  <th scope="col">Open</th>
                </tr>
              </thead>
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
              <span aria-hidden="true">✱</span> Last session starts an hour before closing. Thursday
              runs past midnight, Friday closes at midnight.
            </p>

            <div className="visit__callout">
              <p className="eyebrow">Good to know</p>
              <ul className="visit__list">
                <li>Walk-ins welcome — book ahead for Friday and Saturday evenings.</li>
                <li>Four controllers per station; every player pays their own share.</li>
                <li>Arrive 10 minutes before a booked slot — after 10 minutes the booking is lost.</li>
                <li>Cash, bKash and Nagad accepted at the counter.</li>
                <li>No smoking or vaping inside.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="band band--paper faq">
        <div className="wrap">
          <div className="section-head">
            <div>
              <p className="eyebrow">Questions</p>
              <h2>Before you come.</h2>
            </div>
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
