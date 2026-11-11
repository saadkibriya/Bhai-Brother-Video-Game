import { Link } from 'react-router-dom';
import { SHOP } from '../data/shop';
import { HOURS, hoursSummary } from '../lib/hours';

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="wrap">
        <div className="footer-grid">
          <div>
            <p className="eyebrow">Find us</p>
            <p className="footer-line">{SHOP.address}</p>
            <p className="footer-line muted">{SHOP.landmark}</p>
            <a href={`tel:${SHOP.tel}`}>{SHOP.phone}</a>
            <a href={SHOP.map} target="_blank" rel="noreferrer">
              Google Maps ↗
            </a>
          </div>

          <div>
            <p className="eyebrow">Hours</p>
            {HOURS.map((day) => (
              <p className="footer-line" key={day.weekday}>
                {day.short} <span className="muted">{hoursSummary(day)}</span>
              </p>
            ))}
          </div>

          <div>
            <p className="eyebrow">The site</p>
            <Link to="/games">Games</Link>
            <Link to="/pricing">Rates &amp; passes</Link>
            <Link to="/book">Book a station</Link>
            <Link to="/visit">Visit</Link>
          </div>
        </div>

        <p className="footer-mark" aria-hidden="true">
          Bhai Brother
        </p>

        <div className="footer-bottom">
          <span>
            © {new Date().getFullYear()} {SHOP.fullName}. <span className="bn">{SHOP.banglaName}</span>
          </span>
          <span>Green City, Block C · Mohammadpur, Dhaka</span>
        </div>
      </div>
    </footer>
  );
}
