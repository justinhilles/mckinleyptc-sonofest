import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';

import { FacebookIcon, InstagramIcon } from '@/app/components/icons';
import { siteContent } from '@/app/lib/content';

const FOOTER_LINKS = [
  { href: '/tickets/', label: 'Tasting Passes' },
  { href: '/sponsor/', label: 'Sponsors' },
  { href: '/chili/', label: 'Chili' },
  { href: '/music/', label: 'Music' },
  { href: '/booze/', label: 'Booze Garden' },
  { href: '/kids/', label: 'Kids Zone' },
  { href: '/merch/', label: 'Merch' },
  { href: '/volunteers/', label: 'Volunteers' },
  { href: '/information/', label: 'Information' },
];

export default function Footer() {
  const socialLinks: Array<{ href: string; label: string; icon: ReactNode }> = [];

  if (siteContent.social.facebook) {
    socialLinks.push({
      href: siteContent.social.facebook,
      label: 'Facebook',
      icon: <FacebookIcon />,
    });
  }

  if (siteContent.social.instagram) {
    socialLinks.push({
      href: siteContent.social.instagram,
      label: 'Instagram',
      icon: <InstagramIcon />,
    });
  }

  return (
    <footer className="site-footer" role="contentinfo">
      <section className="cta-strip cta-strip--footer">
        <div className="cta-strip__inner">
          <h2>Ready To Help?</h2>
          <p>Sign up for a volunteer shift to help support McKinley Elementary programs.</p>
          <a className="btn btn--light" href={siteContent.links.volunteerSignup || '/volunteers/'}>
            Volunteer With Us
          </a>
        </div>
      </section>
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

          {socialLinks.length ? (
            <>
              <span className="site-footer__social-label">Follow SoNo Fest</span>
              <ul className="site-footer__social-list">
                {socialLinks.map((social) => (
                  <li key={social.label}>
                    <a
                      className="site-footer__social-link"
                      href={social.href}
                      aria-label={social.label}
                      title={social.label}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <span className="site-footer__social-icon" aria-hidden="true">
                        {social.icon}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </>
          ) : null}
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
