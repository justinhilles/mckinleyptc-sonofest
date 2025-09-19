import Hero from '@/app/components/Hero';
import { siteContent } from '@/app/lib/content';
import { createPageMetadata } from '@/app/lib/metadata';

export const metadata = createPageMetadata({
  title: 'Chili Entry',
  description: 'Restaurants and chefs—submit your chili and join the SoNo Fest 2025 lineup.',
  path: '/chili-entry/',
});

const steps = [
  'Review the competition rules and confirm you can serve a minimum of 10 gallons.',
  'Submit your application with flavor description, dietary info, and power needs.',
  'Attend the Friday night pickup for bowls and signage, then load in Sunday by 9 AM.',
];

export default function ChiliEntryPage() {
  const entryUrl = siteContent.links.chiliEntryForm || '/contact/';

  return (
    <>
      <Hero
        variant="short"
        title="Enter the Chili Cook-Off"
        subhead="Restaurants, food trucks, and community chefs are invited to compete for the 2025 title."
        ctas={[
          {
            label: 'Apply Now',
            href: entryUrl,
          },
        ]}
      />
      <section className="content-block">
        <h2 className="section__title">How It Works</h2>
        <ol className="content-block__list">
          {steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
        <p className="content-block__note">
          Questions? Email <a href="mailto:vendors@sonofest.org">vendors@sonofest.org</a> and our team will follow up.
        </p>
      </section>
    </>
  );
}
