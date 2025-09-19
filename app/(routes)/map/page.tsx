import Hero from '@/app/components/Hero';
import MapBlock from '@/app/components/MapBlock';
import { siteContent } from '@/app/lib/content';
import { createPageMetadata } from '@/app/lib/metadata';

export const metadata = createPageMetadata({
  title: 'Map',
  description: 'Find entrances, stages, restrooms, and more on the SoNo Fest & Chili Cook-Off festival map.',
  path: '/map/',
});

const legend = [
  { label: 'Entrances & Info' },
  { label: 'Restaurant Chili Rows' },
  { label: 'Live Music Stages' },
  { label: 'Booze Garden' },
  { label: 'Makers Market' },
  { label: 'Kids Zone' },
  { label: 'Restrooms & Handwashing' },
  { label: 'ADA Access' },
  { label: 'Bike Valet' },
  { label: 'First Aid & Lost and Found' },
];

export default function MapPage() {
  return (
    <>
      <Hero
        variant="short"
        title="Festival Map"
        subhead={`${siteContent.location} · Sunday, December 7, ${siteContent.year}`}
      />
      <MapBlock
        image={{
          src: '/images/map.png',
          width: 1200,
          height: 800,
          alt: 'Map of SoNo Fest & Chili Cook-Off with key areas labeled',
        }}
        legend={legend}
        downloadUrl="/docs/map.pdf"
        googleMapUrl="https://maps.app.goo.gl/3dXjQuQ7Vw3zSonofest"
      />
    </>
  );
}
