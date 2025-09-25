import Image from 'next/image';

import Hero from '@/app/components/Hero';
import { siteContent } from '@/app/lib/content';
import { createPageMetadata } from '@/app/lib/metadata';
import SponsorStrip from '@/app/components/SponsorStrip';

export const metadata = createPageMetadata({
  title: 'Merch',
  description: 'Grab commemorative SoNo Fest mugs, tees, and gear to support the McKinley Elementary Foundation.',
  path: '/merch/',
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
    title: 'SoNo Fest Baseball Tee',
    description: 'A soft unisex tee celebrating our 2025 lineup.',
    image: {
      src: '/images/merch/baseball-tee.png',
      width: 640,
      height: 640,
      alt: 'SoNo Fest t-shirt mockup',
    },
  },  
  {
    title: 'SoNo Fest Ringer Tee',
    description: 'A soft unisex tee celebrating our 2025 lineup.',
    image: {
      src: '/images/merch/ringer-tee.png',
      width: 640,
      height: 640,
      alt: 'SoNo Fest t-shirt mockup',
    },
  },   
  {
    title: 'SoNo Fest Tee',
    description: 'A soft unisex tee celebrating our 2025 lineup.',
    image: {
      src: '/images/merch/tee.png',
      width: 640,
      height: 640,
      alt: 'SoNo Fest t-shirt mockup',
    },
  },
  {
    title: 'SoNo Fest FlagTee',
    description: 'A soft unisex tee celebrating our 2025 lineup.',
    image: {
      src: '/images/merch/flag-tee-front.png',
      width: 640,
      height: 640,
      alt: 'SoNo Fest t-shirt mockup',
    },
  },  
  {
    title: 'SoNo Fest Zip Hoodie',
    description: 'A cozy zip hoodie to keep you warm during the festival.',
    image: {
      src: '/images/merch/hoodie-front.png',
      width: 640,
      height: 640,
      alt: 'SoNo Fest t-shirt mockup',
    },
  },
  {
    title: 'SoNo Fest Flag Zip Hoodie',
    description: 'A cozy zip hoodie to keep you warm during the festival.',
    image: {
      src: '/images/merch/flag-hoodie-front.png',
      width: 640,
      height: 640,
      alt: 'SoNo Fest t-shirt mockup',
    },
  },  
  {
    title: 'SoNo Fest Crew Sweatshirt',
    description: 'A cozy zip hoodie to keep you warm during the festival.',
    image: {
      src: '/images/merch/crew.png',
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
        title="Merch"
        subhead="Snag limited edition pieces and support public school arts."
        ctas={[
          {
            label: 'Shop this Years Collection',
            href: shopUrl,
            variant: 'primary' as const,
          },
          {
            label: 'Pickup Schedule',
            href: '#pickup',
            variant: 'secondary' as const,
          },
                    {
            label: 'McKinley PTC Shop',
            href: 'https://mckinleyptc.org/shop/',
            variant: 'light' as const,
          },
        ]}
      />
                        <section className="content-block">
                <Image src="/images/featured/merch.jpg" alt="Collage of bands performing at SoNo Fest" width={1200} height={800} style={{ width: '100%', height: 'auto', borderRadius: '8px' }} />
              </section>
      <section className="impact-strip">
        <p>All swag supports McKinley Elementary arts education. Wear your support for McKinley Elementary!</p>
      </section>

      <section className="merch">
        <h2 className="section__title">Featured Items</h2>
        <div className="merch__grid">
          {merchItems.map((item) => (
            <figure key={item.title} className="merch__item">
              <Image src={item.image.src} alt={item.image.alt} width={item.image.width} height={item.image.height} loading="lazy" />
              <figcaption>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>
      <section id="pickup"className="content-block">
        <h2 className="section__title">Pickup Schedule</h2>
        <p>
          All Merch is available for pickup before the event by following the schedule below. If you are unable to pick up during these times, you can pickup the day of the event or please email <a href="mailto:{siteContent.contactEmail}">{siteContent.contactEmail}</a> to make alternate arrangements.
        </p>
        <br />
        <ul className="content-block__list">
          <li><strong>Friday, October 4:</strong> 5 PM - 7 PM at McKinley Elementary (4340 Bancroft St, San Diego, CA 92104)</li>
          <li><strong>Sunday, October 6:</strong> 10 AM - 3 PM at SoNo Fest (Broadway Ave & Bancroft St, San Diego, CA 92104)</li>
        </ul>
      </section>
      <SponsorStrip title="Partners" sponsors={siteContent.sponsors} category={['merch']} />
      
    </>
  );
}
