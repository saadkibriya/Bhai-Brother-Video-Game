import { SHOP } from '../data/shop';

export function QrPage() {
  return (
    <section className="band band--paper qr-page">
      <div className="wrap qr-page__inner">
        <div className="qr-card">
          <p className="eyebrow">Scan to play</p>
          <h1>Bhai Brother</h1>
          <img
            className="qr-card__code"
            src="/qr-site.svg"
            alt="QR code that opens the Bhai Brother site"
            width={1024}
            height={1024}
          />
          <p className="qr-card__lead">
            Point your camera here to see which station is free, check the rates and book a slot.
          </p>
          <p className="qr-card__foot">
            {SHOP.address}
            <br />
            {SHOP.phone} · is.gd/bhaibrother
          </p>
          <p className="qr-card__credit">Site by Techsomaj · All rights reserved</p>
        </div>

        <div className="qr-tools no-print">
          <p className="eyebrow">Counter printout</p>
          <h2>Put this where people wait.</h2>
          <p>
            Print it once and tape it to the counter, the door and the controller shelf. The code
            opens the site, so walk-ins can check the live board before they sit down — and the
            browser can save it to their home screen.
          </p>
          <p>
            Use <strong>Print this page</strong> (or Ctrl/Cmd + P). The site header, footer and this
            panel are hidden automatically; only the card prints, on A4 portrait.
          </p>
          <button className="btn btn--flame" type="button" onClick={() => window.print()}>
            Print this page
          </button>
          <p className="summary__note">
            The code is generated from the production address and shipped as a static image, so it
            prints sharp and works without a network at the counter. If the address ever changes,
            the code needs to be regenerated and the sheet reprinted.
          </p>
        </div>
      </div>
    </section>
  );
}
