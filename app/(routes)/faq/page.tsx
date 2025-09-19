import Hero from '@/app/components/Hero';
import FAQAccordion from '@/app/components/FAQAccordion';
import { faqItems, siteContent } from '@/app/lib/content';
import { createPageMetadata } from '@/app/lib/metadata';

export const metadata = createPageMetadata({
  title: 'FAQ',
  description: 'Answers to common questions about tickets, kids, dogs, transit, and more for SoNo Fest & Chili Cook-Off 2025.',
  path: '/faq/',
});

export default function FAQPage() {
  return (
    <>
      <Hero
        variant="short"
        title="Frequently Asked Questions"
        subhead={`Everything you need to know before joining us on December 7, ${siteContent.year}.`}
      />
      <FAQAccordion items={faqItems} />
    </>
  );
}
