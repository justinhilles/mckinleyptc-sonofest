import FAQAccordion from '@/app/components/FAQAccordion';
import Hero from '@/app/components/Hero';
import PickupSchedule from '@/app/components/PickupSchedule';
import PricingTable from '@/app/components/PricingTable';
import { faqItems, siteContent, ticketsContent } from '@/app/lib/content';
import { createPageMetadata, getEventJsonLd } from '@/app/lib/metadata';

export const metadata = createPageMetadata({
  title: 'Tasting Passes',
  description: 'Secure your tasting pass, commemorative mugs, and pickup details for SoNo Fest & Chili Cook-Off 2025.',
  path: '/tickets/',
});

export default function TastingPassesPage() {
  const ticketFaq = faqItems.filter((item) => /ticket|tasting|pickup|veg/i.test(item.q));
  const eventJsonLd = getEventJsonLd({ path: '/tickets/' });

  return (
    <>
      <Hero
        variant="short"
        title="Tasting Passes"
        subhead="Choose your tasting pass and plan your pickup."
        ctas={[
          {
            label: 'Buy Tasting Passes',
            href: siteContent.ticketTailorUrl,
          },
        ]}
      />
      <PricingTable options={ticketsContent.options} ticketUrl={siteContent.ticketTailorUrl} />
      <PickupSchedule items={ticketsContent.pickup} />
      <FAQAccordion items={ticketFaq} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventJsonLd) }}
      />
    </>
  );
}

