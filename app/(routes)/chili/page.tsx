import Hero from '@/app/components/Hero';
import SponsorStrip from '@/app/components/SponsorStrip';
import { siteContent } from '@/app/lib/content';
import { createPageMetadata } from '@/app/lib/metadata';
import Image from 'next/image';

export const metadata = createPageMetadata({
  title: 'Chili Entry',
  description: 'Restaurants and chefs—submit your chili and join the SoNo Fest 2025 lineup.',
  path: '/chili/',
});

const steps = [
  'Review the competition rules and confirm you can serve a minimum of 20 gallons.',
  'Submit your application with flavor description, dietary info, and power needs.',
  'Attend the Friday night pickup for bowls and signage, then load in Sunday by 9 AM.',
];

export default function ChiliEntryPage() {
  const entryUrl = siteContent.links.chiliEntryForm || '/information/#contact';

  return (
    <>
      <Hero
        variant="short"
        title="Chili Cook-Off"
        subhead="Restaurants, food trucks, and community chefs are invited to compete for the 2025 title."
        ctas={[
          {
            label: 'Apply Now',
            href: entryUrl,
          },
            {
            label: 'How It Works',
            href: "#faq",
            variant: 'secondary',
          },
                    {
            label: 'Community Chili',
            href: "#community",
            variant: 'light',
          },
        ]}
      />
      <section className="content-block">
        <Image src="/images/featured/chili.jpg" alt="Collage of bands performing at SoNo Fest" width={1200} height={800} style={{ width: '100%', height: 'auto', borderRadius: '8px' }} />
      </section>
      <section className="impact-strip">
        <p>Every bowl served supports McKinley Elementary arts education. Thank you for cooking with us!</p>
      </section>
      <section id="faq" className="content-block">
        <h2 className="section__title">How It Works</h2>
        <p>
          Competing in the Chili Cook-Off is a chance to showcase your culinary skills and gain exposure to a large audience.
          Plus, the title of &quot;Best Chili in San Diego&quot; comes with bragging rights and a trophy!
        </p>
        <br />
        <ol className="content-block__list">
          {steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
        <p className="content-block__note">
          Questions? Email <a href="mailto:{siteContent.contactEmail}">{siteContent.contactEmail}</a> and our team will follow up.
        </p>
      </section>

      {/* <section id="community" className="content-block">
        <h2 className="section__title">Community Chili</h2>
        <p>Instructions Coming Soon!</p>
        <br />
        <p className="content-block__note">
          Questions? Email <a href="mailto:{siteContent.contactEmail}">{siteContent.contactEmail}</a> and our team will follow up.
        </p>
      </section> */}
      <SponsorStrip title="This Year's Competitors" sponsors={siteContent.sponsors} category={['chili']} />
    </>
  );
}
