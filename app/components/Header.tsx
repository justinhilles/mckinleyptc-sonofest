"use client";

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const TICKET_ON_SALE_DATE = new Date('2025-11-07T00:00:00-08:00');

const NAV_ITEMS = [
  { href: '/sponsor/', label: 'Sponsors' },
  { href: '/chili/', label: 'Chili' },
  { href: '/music/', label: 'Music' },
  { href: '/booze/', label: 'Booze' },
  { href: '/merch/', label: 'Merch' },
  { href: '/vendors/', label: 'Vendors' },
  { href: '/information/', label: 'Info' },
  { href: '/volunteers/', label: 'Volunteers' },
];

export default function Header() {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [ticketsAvailable, setTicketsAvailable] = useState(false);

  useEffect(() => {
    const closeOnResize = () => {
      if (window.innerWidth > 768) {
        setIsNavOpen(false);
      }
    };

    window.addEventListener('resize', closeOnResize);
    return () => window.removeEventListener('resize', closeOnResize);
  }, []);

  useEffect(() => {
    setTicketsAvailable(new Date() >= TICKET_ON_SALE_DATE);
  }, []);

  const toggleNav = () => setIsNavOpen((prev) => !prev);
  const closeNav = () => setIsNavOpen(false);

  const navListClasses = ['site-header__list'];
  if (isNavOpen) {
    navListClasses.push('site-header__list--open');
  }

  return (
    <header className="site-header footer-nav" role="banner">
      <div className="nav-container">
        <Link href="/" className="site-header__brand">
          <Image
            src="/images/red-flag.png"
            alt="SoNo Fest"
            width={400}
            height={109}
            priority
            className="site-header__brand-image"
          />
          <span className="site-header__brand-text">SoNo Fest</span>
        </Link>
        <button
          type="button"
          className="site-header__toggle"
          aria-expanded={isNavOpen}
          aria-controls="primary-navigation"
          onClick={toggleNav}
        >
          <span className="visually-hidden">Toggle navigation</span>
          <span className="site-header__toggle-line" aria-hidden="true" />
          <span className="site-header__toggle-line" aria-hidden="true" />
          <span className="site-header__toggle-line" aria-hidden="true" />
        </button>
        <nav
          aria-label="Primary"
          id="primary-navigation"
          className={`site-header__nav${isNavOpen ? ' site-header__nav--open' : ''}`}
        >
          <ul className={navListClasses.join(' ')}>
            {NAV_ITEMS.map((item) => (
              <li key={item.href} className="site-header__item">
                <Link href={item.href} className="nav-link" onClick={closeNav}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <a
          className="btn btn--ticket"
          href="/tickets/"
          target="_blank"
          rel="noopener noreferrer"
        >
          {ticketsAvailable ? 'Buy Tasting Passes' : 'Tasting Passes Available Nov 7'}
        </a>
      </div>
    </header>
  );
}
