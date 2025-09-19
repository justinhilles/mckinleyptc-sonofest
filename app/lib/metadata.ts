import type { Metadata } from 'next';

import { siteContent, ticketsContent } from './content';

const DEFAULT_DESCRIPTION = 'San Diego\'s SoNo Fest & Chili Cook-Off returns Sunday, December 7, 2025 with chili, music, makers, and more.';

export function createPageMetadata({
  title,
  description = DEFAULT_DESCRIPTION,
  path,
}: {
  title: string;
  description?: string;
  path: string;
}): Metadata {
  const canonical = path.startsWith('/') ? path : `/${path}`;

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      type: 'website',
      title,
      description,
      url: canonical,
      siteName: `SoNo Fest & Chili Cook-Off ${siteContent.year}`,
      locale: 'en_US',
      images: ['/images/hero.png'],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export function getEventJsonLd({ path }: { path: string }) {
  const canonical = path.startsWith('/') ? path : `/${path}`;
  const averagePrice = calculateAveragePrice();

  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: `SoNo Fest & Chili Cook-Off ${siteContent.year}`,
    description: DEFAULT_DESCRIPTION,
    startDate: siteContent.eventDate,
    endDate: deriveEndDate(siteContent.eventDate),
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: {
      '@type': 'Place',
      name: 'SoNo Fest & Chili Cook-Off',
      address: siteContent.location,
    },
    organizer: siteContent.organizer
      ? {
          '@type': 'Organization',
          name: siteContent.organizer.name,
          url: siteContent.organizer.url,
        }
      : undefined,
    url: canonical,
    image: ['https://sonofestchilicookoff.com/wp-content/uploads/2022/07/l1220656-1.jpg'],
    offers: {
      '@type': 'Offer',
      url: siteContent.ticketTailorUrl,
      price: averagePrice.toFixed(2),
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      validFrom: new Date().toISOString(),
    },
  };
}

function deriveEndDate(start: string) {
  try {
    const startDate = new Date(start);
    const end = new Date(startDate.getTime());
    end.setHours(startDate.getHours() + 6);
    return end.toISOString();
  } catch {
    return start;
  }
}

function calculateAveragePrice() {
  const prices = ticketsContent.options
    .map((option) => option.price)
    .filter((price) => typeof price === 'number');
  if (!prices.length) {
    return 0;
  }
  const total = prices.reduce((sum, price) => sum + price, 0);
  return total / prices.length;
}
