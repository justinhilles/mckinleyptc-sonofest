import Link from 'next/link';
import Image from 'next/image';

import { siteContent } from '@/app/lib/content';

const FOOTER_LINKS = [
  { href: '/tickets/', label: 'Tasting Passes' },
  { href: '/sponsor/', label: 'Sponsors' },
  { href: '/chili-entry/', label: 'Chili' },
  { href: '/music/', label: 'Music' },
  { href: '/booze/', label: 'Booze Garden' },
  { href: '/merch/', label: 'Merch' },
  { href: '/information/', label: 'Information' },
];

export default function Footer() {
  return (
    <footer className="site-footer" role="contentinfo">
      <div className="site-footer__primary">
        <div className="site-footer__about">
          <p className="site-footer__statement">100% of proceeds benefit the McKinley Elementary Foundation.</p>
                     <p className="site-footer__date">
            {new Date(siteContent.eventDate).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
            </p>
          <p className="site-footer__location">{siteContent.location}</p>
 
                  <span className="site-footer__social-label">Follow SoNo Fest</span>
          <ul>
            {siteContent.social.facebook ? (
              <li>
                <a href={siteContent.social.facebook} target="_blank" rel="noopener noreferrer">
                  Facebook
                </a>
              </li>
            ) : null}
            {siteContent.social.instagram ? (
              <li>
                <a href={siteContent.social.instagram} target="_blank" rel="noopener noreferrer">
                  Instagram
                </a>
              </li>
            ) : null}
          </ul>
        </div>
        <nav aria-label="Footer">
          <ul className="site-footer__links">
            {FOOTER_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href}>{link.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="site-footer__magpie">
          <Image src="/images/magpie.png" alt="SoNo Fest" width={200} height={55} />
          <p className="site-footer__copyright">&copy; {new Date().getFullYear()} SoNo Fest & Chili Cook-Off</p>
        </div>
      </div>
      <div className="bottom-footer" aria-hidden="true" />
    </footer>
  );
}

