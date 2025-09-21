import FAQAccordion from '@/app/components/FAQAccordion';
import Hero from '@/app/components/Hero';
import PickupSchedule from '@/app/components/PickupSchedule';
import PricingTable from '@/app/components/PricingTable';
import { faqItems, siteContent, ticketsContent } from '@/app/lib/content';
import { createPageMetadata, getEventJsonLd } from '@/app/lib/metadata';
import Image from 'next/image';

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
            label: 'Get Tasting Passes',
            href: "#pricing",
          },
          {
            label: 'Pickup Info',
            href: "#pickup",
            variant: 'secondary',
          },
          {
            label: 'FAQs',
            href: "#faqs",
            variant: 'light',
          },
        ]}
      />
      <section className="content-block">
        <Image src="/images/featured/tickets.jpg" alt="Collage of bands performing at SoNo Fest" width={1200} height={800} style={{ width: '100%', height: 'auto', borderRadius: '8px' }} />
      </section>
      <section className="impact-strip">
        <p>100% of proceeds power McKinley Elementary&apos;s art, music, dance, language, and garden programs.</p>
      </section>
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

