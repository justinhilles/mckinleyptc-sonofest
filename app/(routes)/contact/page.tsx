import Hero from '@/app/components/Hero';
import ContactForm from '@/app/components/ContactForm';
import MapBlock from '@/app/components/MapBlock';
import { createPageMetadata } from '@/app/lib/metadata';

export const metadata = createPageMetadata({
  title: 'Contact',
  description:
    'Reach the SoNo Fest & Chili Cook-Off team for sponsorships, press, vendors, and volunteers, and explore the festival map and directions.',
  path: '/contact/',
});

const roleContacts = [
  { role: 'Sponsorships', email: 'sponsors@sonofest.org' },
  { role: 'Press', email: 'press@sonofest.org' },
  { role: 'Vendors', email: 'vendors@sonofest.org' },
  { role: 'Volunteers', email: 'volunteers@sonofest.org' },
];

const mapLegend = [
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

export default function ContactPage() {
  return (
    <>
      <Hero
        variant="short"
        title="Contact the SoNo Team"
        subhead="Send us a note, connect with the right committee, and plan your visit to the festival."
      />
      <section className="contact">
        <div className="contact__grid">
          <ContactForm />
          <aside className="contact__aside">
            <h2 className="section__title">Role-Based Contacts</h2>
            <ul>
              {roleContacts.map((entry) => (
                <li key={entry.role}>
                  <span>{entry.role}</span>
                  <a href={`mailto:${entry.email}`}>{entry.email}</a>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </section>
      <MapBlock
        image={{
          src: '/images/map.png',
          width: 1200,
          height: 800,
          alt: 'Map of SoNo Fest & Chili Cook-Off with entrances, stages, and vendor zones highlighted',
        }}
        legend={mapLegend}
        downloadUrl="/docs/map.pdf"
        googleMapUrl="https://maps.app.goo.gl/3dXjQuQ7Vw3zSonofest"
      />
      <section className="content-block">
        <h2 className="section__title">Helpful Details</h2>
        <p>
          Need a custom activation or have a question the form does not cover? Email the contacts above or reach out through
          the form and we will connect you with the right volunteer lead. For day-of updates follow @sonofest on social and
          check the map for entrances, restrooms, and emergency services.
        </p>
      </section>
    </>
  );
}

