import Image from 'next/image';

import type { Sponsor } from '@/app/lib/types';

type SponsorStripProps = {
  sponsors?: Sponsor[];
  title?: string;
  className?: string;
  category?: Array<'sponsor' | 'partner' | 'chili' | 'music' | 'booze' | 'foodtruck' | 'merch' | 'vendor'>;
};

export default function SponsorStrip({
  sponsors = [],
  title = 'Sponsors & Partners',
  className = '',
  category = ['sponsor']
}: SponsorStripProps) {
  const filtered = sponsors.filter((sponsor) =>
    sponsor.name?.trim().length &&
    sponsor.active !== false &&
    (
      !category ||
      category === undefined ||
      (
        Array.isArray(sponsor.category) &&
        sponsor.category.some(cat => category.includes(cat))
      )
    )
  );
  if (filtered.length === 0) {
    return null;
  }

  const sectionClasses = ['sponsors-section'];
  if (className) {
    sectionClasses.push(className);
  }

  return (
    <section className={sectionClasses.join(' ')}>
      {title ? <h2 className="sponsors-title">{title}</h2> : null}
      <ul className="sponsors-grid">
        {filtered.map((sponsor) => (
          <li key={sponsor.name} className="sponsor-logo">
            <SponsorLink sponsor={sponsor} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function SponsorLink({ sponsor }: { sponsor: Sponsor }) {
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

  if (sponsor.href) {
    return (
      <a href={sponsor.href} target="_blank" rel="noopener noreferrer">
        {content}
      </a>
    );
  }

  return content;
}

