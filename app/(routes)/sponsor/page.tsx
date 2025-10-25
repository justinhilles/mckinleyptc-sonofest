import Hero from '@/app/components/Hero';
import SponsorStrip from '@/app/components/SponsorStrip';
import SponsorSpotlight from '@/app/components/SponsorSpotlight';
import { siteContent } from '@/app/lib/content';
import { createPageMetadata } from '@/app/lib/metadata';
import Image from 'next/image';

const audienceHighlights = [
  '20,000+ attendees travel from across San Diego County and Southern California for the one-day festival.',
  '35+ acclaimed restaurants compete in the legendary Chili Cook-Off for the chance to be crowned Best Chili in San Diego.',
  'Two live-music stages, 30 vendors, food trucks, and kids zone keep guests on-site all afternoon.',
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
      label: 'Become A Sponsor',
      href: siteContent.links.sponsorApplicationForm,
      variant: 'primary' as const,
    },
    {
      label: 'View Sponsor Benefits',
      href: siteContent.docs.sponsorPacket,
      variant: 'secondary' as const,
    },
    {
      label: 'Sponsorship Opportunities',
      href: siteContent.docs.sponsorProspectusPdf,
      variant: 'light' as const,
    },
  ];

  const spotlightSponsors =
    siteContent.sponsors
      ?.filter((sponsor) => sponsor.active !== false && sponsor.name?.trim())
      .map((sponsor) => sponsor.name!.trim()) ?? [];

  return (
    <>
      <Hero
        variant="short"
        title="Sponsor A Party That Gives Back"
        subhead="Support San Diego&apos;s favorite neighborhood chili festival and help fund essential arts education at McKinley Elementary."
        ctas={ctas}
      />

      <section className="content-block">
        <Image src="/images/featured/group.jpg" alt="Collage of bands performing at SoNo Fest" width={1200} height={800} style={{ width: '100%', height: 'auto', borderRadius: '8px' }} />
      </section>
      <section className="impact-strip">
        <p>100% of proceeds power McKinley Elementary&apos;s art, music, dance, language, and garden programs.</p>
      </section>
      <section className="content-block">
        <h2 className="section__title">Reach a Passionate Audience</h2>
        <ul className="content-block__list">
          {audienceHighlights.map((highlight) => (
            <li key={highlight}>{highlight}</li>
          ))}
        </ul>
        <p>
          Since debuting in 2010, SoNo Fest has become a must-attend San Diego tradition. Even after a virtual pivot in 2020,
          the festival returned to the streets in 2021 with record-breaking attendance and continues to grow each year with
          expansive media coverage and community buzz.
        </p>
      </section>
      {/* <SponsorSpotlight items={spotlightSponsors} /> */}
      <SponsorStrip title="Thank You Sponsors" sponsors={siteContent.sponsors} category={["sponsor","partner"]} />

      <section className="content-block">
        <h2 className="section__title">What Sponsors Can Receive</h2>
        <ul className="content-block__list">
          {sponsorBenefits.map((benefit) => (
            <li key={benefit}>{benefit}</li>
          ))}
        </ul>
        <p className="content-block__note">
          Download the Sponsor Benefits Deck for tier-by-tier deliverables and activation details.
        </p>
      </section>
      <section className="content-block">
        <h2 className="section__title">Ready to Join the SoNo Family?</h2>
        <p>
          Submit the application and our sponsorship team will follow up with availability, deadlines, and next steps. You can
          also email <a href="mailto:info@sonofestchilicookoff.com">info@sonofestchilicookoff.com</a> to start the conversation or request a
          custom activation.
        </p>
        <br />
        <p>
          <b>Join us in making a difference for kids!</b> Together we can showcase your business to thousands of engaged festival-goers while ensuring every McKinley Elementary
          student keeps access to a vibrant education.
        </p>
      </section>
    </>
  );
}
