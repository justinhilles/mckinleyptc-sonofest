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

const merchItems = [
  {
    title: '2025 Commemorative Mug',
    description: 'Handcrafted locally and perfect for refills year after year and comes with 5 tastings',
    image: {
      src: '/images/merch-mug.png',
      width: 640,
      height: 640,
      alt: '2025 SoNo Fest commemorative mug',
    },
  },
  {
    title: 'SoNo Fest Tee',
    description: 'A soft unisex tee celebrating our 2025 lineup.',
    image: {
      src: '/images/merch-tee.png',
      width: 640,
      height: 640,
      alt: 'SoNo Fest t-shirt mockup',
    },
  },
    {
    title: 'SoNo Fest Zip Hoodie',
    description: 'A cozy zip hoodie to keep you warm during the festival.',
    image: {
      src: '/images/merch-tee.png',
      width: 640,
      height: 640,
      alt: 'SoNo Fest t-shirt mockup',
    },
  },
  {
    title: 'SoNo Fest Hat',
    description: 'A stylish hat to keep the sun out of your eyes while you enjoy the festival.',
    image: {
      src: '/images/merch-tee.png',
      width: 640,
      height: 640,
      alt: 'SoNo Fest t-shirt mockup',
    },
  }
];

export default function MerchPage() {
  const shopUrl = siteContent.links.merchShop || siteContent.ticketTailorUrl;

  return (
    <>
      <Hero
        variant="short"
        title="Vendors & Food Trucks"
        subhead="Community businesses and food trucks are invited to join the SoNo Fest celebration."
        ctas={[
          {
            label: 'Vendor Application',
            href: shopUrl,
            variant: 'primary' as const,
          },
          {
            label: 'Food Truck Application',
            href: '#pickup',
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
