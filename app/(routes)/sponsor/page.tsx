import Hero from '@/app/components/Hero';
import SponsorStrip from '@/app/components/SponsorStrip';
import { siteContent } from '@/app/lib/content';
import { createPageMetadata } from '@/app/lib/metadata';

const sponsorApplicationUrl =
  'https://docs.google.com/forms/d/e/1FAIpQLSfrfx-Nzn7BUCzxKk4RiUB01QcMj-0gzs-pU-SCoDMpxvrbjg/viewform';
const sponsorBenefitsPdf =
  'https://sonofestchilicookoff.com/wp-content/uploads/2025/09/2025-6-sono-sponsorship-levels.pdf';
const sponsorProspectusPdf =
  'https://sonofestchilicookoff.com/wp-content/uploads/2025/09/2025-26-sono-sponsorletter.pdf';

const audienceHighlights = [
  '20,000+ attendees travel from across San Diego County and Southern California for the one-day festival.',
  '35+ acclaimed restaurants compete in the legendary Chili Cook-Off alongside local breweries, cideries, and distilleries.',
  'Two live-music stages, 30 handmade vendors, food trucks, and family programming keep guests on-site all afternoon.',
];

const sponsorBenefits = [
  'Tiered recognition across event signage, website, email marketing, and social media campaigns.',
  'Opportunities for on-site activation, sampling, or dedicated booths at select sponsorship levels.',
  'Inclusion in media outreach, community newsletters, and collaborations with neighborhood partners.',
  'Complimentary tasting tickets, mugs, and hospitality perks to share with staff or clients.',
];

export const metadata = createPageMetadata({
  title: 'Sponsors',
  description:
    'Partner with SoNo Fest & Chili Cook-Off to reach 20,000+ attendees while funding arts education for every student at McKinley Elementary.',
  path: '/sponsor/',
});

export default function SponsorPage() {
  const ctas = [
    {
      label: 'Apply to Sponsor',
      href: sponsorApplicationUrl,
      variant: 'primary' as const,
    },
    {
      label: 'View Sponsor Benefits',
      href: sponsorBenefitsPdf,
      variant: 'secondary' as const,
    },
    {
      label: 'Download Prospectus',
      href: sponsorProspectusPdf,
      variant: 'light' as const,
    },
  ];

  return (
    <>
      <Hero
        variant="short"
        kicker={`Support the ${siteContent.year} festival`}
        title="Sponsor SoNo Fest & Chili Cook-Off"
        subhead="Align your brand with San Diego&apos;s favorite neighborhood festival and help fund essential arts education for 600+ students."
        ctas={ctas}
      />
      <section className="impact-strip">
        <p>100% of sponsorship dollars power McKinley Elementary&apos;s art, music, dance, language, and garden programs.</p>
      </section>
      <section className="content-block">
        <h2 className="section__title">Reach a Passionate Audience</h2>
        <ul className="content-block__list">
          {audienceHighlights.map((highlight) => (
            <li key={highlight}>{highlight}</li>
          ))}
        </ul>
        <p>
          Since debuting in 2010, SoNo Fest has become a must-attend SoCal tradition. Even after a virtual pivot in 2020,
          the festival returned to the streets in 2021 with record-breaking attendance and continues to grow each year with
          expansive media coverage and community buzz.
        </p>
      </section>
      <section className="content-block">
        <h2 className="section__title">What Sponsors Receive</h2>
        <ul className="content-block__list">
          {sponsorBenefits.map((benefit) => (
            <li key={benefit}>{benefit}</li>
          ))}
        </ul>
        <p className="content-block__note">
          Download the benefits deck for tier-by-tier deliverables and activation details, or reach out for a custom package.
        </p>
      </section>
      <SponsorStrip title="Recent Sponsors & Partners" sponsors={siteContent.sponsors} />
      <section className="content-block">
        <h2 className="section__title">Ready to Join the SoNo Family?</h2>
        <p>
          Submit the application and our sponsorship team will follow up with availability, deadlines, and next steps. You can
          also email <a href="mailto:sponsors@sonofest.org">sponsors@sonofest.org</a> to start the conversation or request a
          custom activation.
        </p>
        <p>
          Together we can showcase your brand to thousands of engaged festival-goers while ensuring every McKinley Elementary
          student keeps access to vibrant arts education.
        </p>
      </section>
    </>
  );
}

