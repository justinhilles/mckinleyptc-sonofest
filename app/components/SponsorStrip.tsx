import Image from 'next/image';

import type { Sponsor } from '@/app/lib/types';

type SponsorStripProps = {
  sponsors?: Sponsor[];
};

export default function SponsorStrip({ sponsors = [] }: SponsorStripProps) {
  const filtered = sponsors.filter((sponsor) => sponsor.name?.trim().length);
  if (filtered.length === 0) {
    return null;
  }

  return (
    <section className="sponsors-section">
      <h2 className="sponsors-title">Sponsors &amp; Partners</h2>
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
