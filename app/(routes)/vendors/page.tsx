import Image from 'next/image';

import Hero from '@/app/components/Hero';
import { siteContent } from '@/app/lib/content';
import { createPageMetadata } from '@/app/lib/metadata';
import SponsorStrip from '@/app/components/SponsorStrip';

export const metadata = createPageMetadata({
  title: 'Vendors',
  description: 'Grab commemorative SoNo Fest mugs, tees, and gear to support the McKinley Elementary Foundation.',
  path: '/vendors/',
});

export default function VendorsPage() {

  return (
    <>
      <Hero
        variant="short"
        title="Vendors & Food Trucks"
        subhead="Community businesses and food trucks are invited to join the SoNo Fest celebration."
        ctas={[
          {
            label: 'Vendor Application',
            href: siteContent.links.vendorApplicationForm,
            variant: 'primary' as const,
          },
          {
            label: 'Food Truck Application',
            href: siteContent.links.foodTruckApplicationForm  ,
            variant: 'secondary' as const,
          }
        ]}
      />
      <section className="content-block">
        <Image src="/images/featured/vendors.jpg" alt="Collage of bands performing at SoNo Fest" width={1200} height={800} style={{ width: '100%', height: 'auto', borderRadius: '8px' }} />
      </section>
      <section className="impact-strip">
        <p>Teamwork makes the dream work! Join us in supporting our amazing vendors & food trucks that support McKinley Elementary!</p>
      </section>

      <SponsorStrip title="Recent Sponsors & Partners" sponsors={siteContent.sponsors} category={["vendor"]} />

    </>
  );
}
