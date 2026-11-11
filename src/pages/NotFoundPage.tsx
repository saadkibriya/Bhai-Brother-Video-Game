import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <section className="band band--ink page-head not-found">
      <div className="wrap">
        <p className="eyebrow">404</p>
        <h1>
          Wrong station
        </h1>
        <p className="lede">That page is not on the floor. The good stuff is this way.</p>
        <div className="hero__actions">
          <Link className="btn btn--flame" to="/">
            Back home
          </Link>
          <Link className="btn btn--ghost" to="/book">
            Book a station
          </Link>
        </div>
      </div>
    </section>
  );
}
