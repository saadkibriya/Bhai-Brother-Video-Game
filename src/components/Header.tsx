import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { SHOP } from '../data/shop';
import { OpenStatus } from './OpenStatus';
import { ThemeToggle } from './ThemeToggle';
import { PhoneIcon } from './icons';
import { PANEL_URL, PUBLIC_ONLY } from '../lib/siteMode';

const LINKS = [
  { to: '/', label: 'Home' },
  { to: '/games', label: 'Games' },
  { to: '/pricing', label: 'Rates' },
  { to: '/book', label: 'Book' },
  { to: '/visit', label: 'Visit' },
];

function StaffLink() {
  return PUBLIC_ONLY ? (
    <a href={PANEL_URL}>Staff</a>
  ) : (
    <NavLink to="/admin">Staff</NavLink>
  );
}

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => setMenuOpen(false), [pathname]);

  return (
    <header className="site-header">
      <div className="wrap header-inner">
        <Link className="brand" to="/" aria-label={`${SHOP.fullName} — home`}>
          <span className="brand-mark" aria-hidden="true" />
          <span className="brand-name">Bhai Brother</span>
        </Link>

        <nav className="nav" aria-label="Main">
          {LINKS.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.to === '/'}>
              {link.label}
            </NavLink>
          ))}
          <StaffLink />
        </nav>

        <a className="header-phone" href={`tel:${SHOP.tel}`}>
          <PhoneIcon />
          {SHOP.phone}
        </a>
        <ThemeToggle />
        <Link className="btn btn--flame header-cta" to="/book">
          Book a slot
        </Link>

        <button
          className="menu-btn"
          type="button"
          aria-expanded={menuOpen}
          aria-controls="mobile-nav"
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? 'Close' : 'Menu'}
        </button>
      </div>

      <div id="mobile-nav" className={`mobile-nav${menuOpen ? ' is-open' : ''}`} hidden={!menuOpen}>
        <div className="wrap">
          <div className="mobile-nav__row">
            <OpenStatus />
            <ThemeToggle />
          </div>
          <nav aria-label="Mobile">
            {LINKS.map((link) => (
              <NavLink key={link.to} to={link.to} end={link.to === '/'}>
                {link.label}
              </NavLink>
            ))}
            <StaffLink />
          </nav>
          <a className="btn btn--flame btn--block" href={`tel:${SHOP.tel}`}>
            <PhoneIcon /> Call {SHOP.phone}
          </a>
        </div>
      </div>
    </header>
  );
}
