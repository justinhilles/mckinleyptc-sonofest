import Hero from '@/app/components/Hero';
import Countdown from '@/app/components/Countdown';
import FeatureTiles from '@/app/components/FeatureTiles';
import SponsorStrip from '@/app/components/SponsorStrip';
import InstagramFeed from '@/app/components/InstagramFeed';
import { BeerIcon, KidsIcon, MusicIcon, PepperIcon } from '@/app/components/icons';
import { instagramPosts, siteContent } from '@/app/lib/content';
import { createPageMetadata, getEventJsonLd } from '@/app/lib/metadata';

export const metadata = createPageMetadata({
  title: `SoNo Fest & Chili Cook-Off ${siteContent.year}`,
  description:
    "SoNo Fest & Chili Cook-Off 2025 returns to North Park with award-winning chili, live music, a handmade market, and family fun all benefitting McKinley Elementary.",
  path: '/',
});

export default function HomePage() {
  const ctaButtons = [
    {
      label: 'Get Tasting Passes',
      href: '/tickets/',
      variant: 'primary' as const,
    },
    {
      label: 'Enter Chili Cook-Off',
      href: '/chili/',
      variant: 'secondary' as const,
    },
    {
      label: 'Volunteer',
      href: '/volunteers/',
      variant: 'light' as const,
    },
  ];

  const featureItems = [
    {
      title: 'Chili Cook-Off',
      description: 'Taste from 40+ local chefs and vote for your favorite.',
      href: '/chili/',
      icon: <PepperIcon />,
    },
    {
      title: 'Live Music',
      description: 'Two stages featuring San Diego bands all afternoon.',
      href: '/music/',
      icon: <MusicIcon />,
    },
    {
      title: 'Kids Zone',
      description: 'Crafts, games, and family activities on 32nd Street.',
      href: '/kids/',
      icon: <KidsIcon />,
    },
    {
      title: 'Booze Garden',
      description: 'Local beer, wine, and craft cocktails for 21+ guests.',
      href: '/booze/',
      icon: <BeerIcon />,
    },
  ];

  const instagramUrl = siteContent.social.instagram ?? null;
  let instagramHandle: string | null = null;

  if (instagramUrl) {
    try {
      const parsed = new URL(instagramUrl);
      const segments = parsed.pathname.split('/').filter(Boolean);
      instagramHandle = segments[0] ?? null;
    } catch {
      instagramHandle = instagramUrl
        .replace(/^https?:\/\/(www\.)?instagram\.com\//, '')
        .replace(/\?.*$/, '')
        .replace(/#.*/, '')
        .replace(/\/.*/, '') || null;
    }

    if (instagramHandle) {
      instagramHandle = instagramHandle.replace(/^@/, '');
    }
  }

  const eventJsonLd = getEventJsonLd({ path: '/' });

  return (
    <>
      <Hero
        title=""
        subhead={`Sunday, December 7, 2025 · 11 AM – 5 PM · ${siteContent.location}`}
        ctas={ctaButtons}
        media={{
          src: '/images/hero.png',
          alt: 'SoNo Fest & Chili Cook-Off logo',
          width: 1024,
          height: 580,
        }}
      />
      <Countdown eventDate={siteContent.eventDate} />
      <section className="impact-strip">
        <p>100% of proceeds benefit the McKinley Elementary Foundation.</p>
      </section>
      <FeatureTiles items={featureItems} />
      <InstagramFeed posts={instagramPosts} profileUrl={instagramUrl ?? undefined} handle={instagramHandle} />
      <SponsorStrip title="Sponsors & Partners" sponsors={siteContent.sponsors} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventJsonLd) }}
      />
    </>
  );
}
