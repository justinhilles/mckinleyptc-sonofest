import Link from 'next/link';

import { siteContent } from '@/app/lib/content';

const NAV_ITEMS = [
  { href: '/tickets/', label: 'Tickets' },
  { href: '/sponsor/', label: 'Sponsors' },
  { href: '/chili-entry/', label: 'Chili' },
  { href: '/merch/', label: 'Merch' },
  { href: '/faq/', label: 'FAQ' },
  { href: '/contact/', label: 'Contact' },
  { href: '/map/', label: 'Map' },
];

export default function Header() {
  return (
    <header className="site-header footer-nav" role="banner">
      <div className="nav-container">
        <Link href="/" className="site-header__brand">
          SoNo Fest
        </Link>
        <nav aria-label="Primary">
          <ul className="site-header__list">
            {NAV_ITEMS.map((item) => (
              <li key={item.href} className="site-header__item">
                <Link href={item.href} className="nav-link">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <a
          className="btn btn--ticket"
          href={siteContent.ticketTailorUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          Buy Tickets
        </a>
      </div>
    </header>
  );
}

