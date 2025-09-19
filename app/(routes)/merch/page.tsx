import Image from 'next/image';

import Hero from '@/app/components/Hero';
import { siteContent } from '@/app/lib/content';
import { createPageMetadata } from '@/app/lib/metadata';

export const metadata = createPageMetadata({
  title: 'Merch',
  description: 'Grab commemorative SoNo Fest mugs, tees, and gear to support the McKinley Elementary Foundation.',
  path: '/merch/',
});

const merchItems = [
  {
    title: '2025 Commemorative Mug',
    description: 'Handcrafted locally and perfect for refills year after year.',
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
    title: 'Festival Poster Print',
    description: 'Limited run poster supporting the McKinley Elementary Foundation.',
    image: {
      src: '/images/merch-poster.png',
      width: 640,
      height: 640,
      alt: 'SoNo Fest poster artwork',
    },
  },
];

export default function MerchPage() {
  const shopUrl = siteContent.links.merchShop || siteContent.ticketTailorUrl;

  return (
    <>
      <Hero
        variant="short"
        title="SoNo Fest Merch"
        subhead="Snag limited edition pieces and support public school arts."
        ctas={[
          {
            label: 'Shop the Collection',
            href: shopUrl,
          },
        ]}
      />
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
    </>
  );
}
