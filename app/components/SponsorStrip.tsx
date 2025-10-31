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

  const featuredSponsors = filtered.filter((sponsor) => Boolean(sponsor.featured));
  const regularSponsors = filtered.filter((sponsor) => !sponsor.featured);
  const orderedSponsors = [
    ...shuffleSponsors(featuredSponsors),
    ...shuffleSponsors(regularSponsors),
  ];

  const sectionClasses = ['sponsors-section'];
  if (className) {
    sectionClasses.push(className);
  }

  return (
    <section className={sectionClasses.join(' ')}>
      {title ? <h2 className="sponsors-title">{title}</h2> : null}
      <ul className="sponsors-grid">
        {orderedSponsors.map((sponsor) => {
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
  const websiteHref = appendTrackingParams(sponsor.href);
  const instagramUrl = appendTrackingParams(normalizeInstagramUrl(sponsor.instagram) ?? undefined);
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
      {websiteHref ? (
        <a href={websiteHref} target="_blank" rel="noopener noreferrer" className="sponsor-card__primary-link">
          {content}
        </a>
      ) : (
        content
      )}
    </div>
  );

  const hasLinks = Boolean(websiteHref || instagramUrl);

  return (
    <div className="sponsor-card">
      {media}
      {hasLinks ? (
        <div className="sponsor-card__footer">
          <div className="sponsor-card__links">
            {websiteHref ? (
              <a href={websiteHref} target="_blank" rel="noopener noreferrer" className="sponsor-card__link">
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

function appendTrackingParams(url?: string | null): string | undefined {
  if (!url?.trim()) {
    return undefined;
  }

  const trimmed = url.trim();
  if (/^(mailto|tel|sms|javascript):/i.test(trimmed)) {
    return trimmed;
  }

  const hasProtocol = /^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(trimmed);

  try {
    const parsed = hasProtocol
      ? new URL(trimmed)
      : new URL(trimmed, 'https://sonofest.org');
    parsed.searchParams.set('utm_campaign', 'sonofest');
    parsed.searchParams.set('utm_medium', 'referral');

    if (hasProtocol) {
      return parsed.toString();
    }

    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return trimmed;
  }
}

function shuffleSponsors<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
