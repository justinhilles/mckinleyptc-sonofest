import Image from 'next/image';

import type { Sponsor } from '@/app/lib/types';

type SponsorStripProps = {
  sponsors?: Sponsor[];
  title?: string;
  className?: string;
  category?: Array<'sponsor' | 'partner' | 'chili' | 'music' | 'booze' | 'foodtruck' | 'merch' | 'vendor' | 'kids'>;
};

export default function SponsorStrip({
  sponsors = [],
  title = 'Sponsors & Partners',
  className = '',
  category = ['sponsor']
}: SponsorStripProps) {
  const hasCategoryFilter = category.length > 0;

  const filtered = sponsors.filter((sponsor) => {
    if (!sponsor.name?.trim()) {
      return false;
    }

    if (sponsor.active === false) {
      return false;
    }

    if (!hasCategoryFilter) {
      return true;
    }

    if (!Array.isArray(sponsor.category)) {
      return false;
    }

    return sponsor.category.some((cat) => category.includes(cat));
  });
  if (filtered.length === 0) {
    return null;
  }

  const sorted = [...filtered].sort(
    (a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)),
  );

  const sectionClasses = ['sponsors-section'];
  if (className) {
    sectionClasses.push(className);
  }

  return (
    <section className={sectionClasses.join(' ')}>
      {title ? <h2 className="sponsors-title">{title}</h2> : null}
      <ul className="sponsors-grid">
        {sorted.map((sponsor) => {
          const itemClasses = ['sponsor-logo'];
          if (sponsor.featured) {
            itemClasses.push('sponsor-logo--featured');
          }
          if (sponsor.class?.trim()) {
            itemClasses.push(sponsor.class.trim());
          }

          return (
            <li
              key={sponsor.name}
              className={itemClasses.join(' ')}
            >
              <SponsorCard sponsor={sponsor} />
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function SponsorCard({ sponsor }: { sponsor: Sponsor }) {
  const instagramUrl = normalizeInstagramUrl(sponsor.instagram);
  const content = sponsor.logo ? (
    <Image
      alt={sponsor.name}
      src={sponsor.logo}
      width={160}
      height={160}
      loading="lazy"
    />
  ) : (
    <span>{sponsor.name}</span>
  );

  const media = (
    <div className="sponsor-card__media">
      {sponsor.href ? (
        <a href={sponsor.href} target="_blank" rel="noopener noreferrer" className="sponsor-card__primary-link">
          {content}
        </a>
      ) : (
        content
      )}
    </div>
  );

  const hasLinks = Boolean(sponsor.href || instagramUrl);

  return (
    <div className="sponsor-card">
      {media}
      {hasLinks ? (
        <div className="sponsor-card__footer">
          <div className="sponsor-card__links">
            {sponsor.href ? (
              <a href={sponsor.href} target="_blank" rel="noopener noreferrer" className="sponsor-card__link">
                Website
              </a>
            ) : null}
            {instagramUrl ? (
              <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="sponsor-card__link">
                Instagram
              </a>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function normalizeInstagramUrl(instagram?: string): string | null {
  if (!instagram?.trim()) {
    return null;
  }

  if (/^https?:\/\//i.test(instagram)) {
    return instagram;
  }

  const handle = instagram.replace(/^@/, '');
  return `https://www.instagram.com/${handle}/`;
}
