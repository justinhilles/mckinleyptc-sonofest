import FAQAccordion from '@/app/components/FAQAccordion';
import ContactForm from '@/app/components/ContactForm';
import Hero from '@/app/components/Hero';
import MapBlock from '@/app/components/MapBlock';
import { faqItems, siteContent } from '@/app/lib/content';
import { createPageMetadata } from '@/app/lib/metadata';

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

const serviceNotes = [
  'Festival grounds are centered at 32nd & Thorn St - rideshare drop-off is on Thorn.',
  'Plan for limited street parking; biking and transit are highly encouraged.',
  'Need ADA accommodations? Check in at the Info Booth near 32nd & Thorn.',
  'Dogs are best left at home; certified service animals are welcome.',
];

const volunteerUrl = siteContent.links.volunteerSignup || '/information/#volunteer';

export const metadata = createPageMetadata({
  title: 'Information',
  description:
    'Plan your SoNo Fest & Chili Cook-Off visit with contact details, festival map, frequently asked questions, and volunteer info.',
  path: '/information/',
});

export default function InformationPage() {
  return (
    <>
      <Hero
        variant="short"
        title="Information Center"
        subhead={`All the details you need for the ${siteContent.year} SoNo Fest - contact the team, find the map, and browse FAQs.`}
        ctas={[
          {
            label: 'Buy Tasting Passes',
            href: siteContent.ticketTailorUrl,
            variant: 'primary',
          },
          {
            label: 'Volunteer Sign-Up',
            href: volunteerUrl,
            variant: 'secondary',
          },
        ]}
      />
      <section className="contact" id="contact">
        <h2 className="section__title">Get In Touch</h2>
        <div className="contact__grid">
          <ContactForm />
          <aside className="contact__aside">
            <h3 className="section__title">Role-Based Contacts</h3>
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
      <div id="map">
        <MapBlock
          image={{
            src: '/images/map.png',
            width: 1200,
            height: 800,
            alt: 'Festival map showing entrances, stages, booze garden, kids zone, and restrooms',
          }}
          legend={mapLegend}
          downloadUrl="/docs/map.pdf"
          googleMapUrl="https://maps.app.goo.gl/3dXjQuQ7Vw3zSonofest"
        />
      </div>
      <section className="content-block" id="details">
        <h2 className="section__title">Festival Basics</h2>
        <ul className="content-block__list">
          {serviceNotes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
        <p>
          Looking for accessibility support or have another question? Include details in the form above and our volunteers will
          reach out before the festival.
        </p>
      </section>
      <section className="content-block" id="volunteer">
        <h2 className="section__title">Volunteer & Support</h2>
        <p>
          SoNo Fest is 100% volunteer powered. If you would like to lend a hand before or during the event, sign up and our
          crew leads will follow up with available shifts.
        </p>
        <a className="btn btn--ticket" href={volunteerUrl}>
          Volunteer Registration
        </a>
      </section>
      <div id="faq">
        <FAQAccordion items={faqItems} />
      </div>
    </>
  );
}

