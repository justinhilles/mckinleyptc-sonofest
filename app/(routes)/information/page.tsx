import FAQAccordion from '@/app/components/FAQAccordion';
import Hero from '@/app/components/Hero';
// import MapBlock from '@/app/components/MapBlock';
import { faqItems, siteContent } from '@/app/lib/content';
import { createPageMetadata } from '@/app/lib/metadata';
import Image from 'next/image';

// const roleContacts = [
//   { role: 'Sponsorships', email: 'sponsors@sonofest.org' },
//   { role: 'Press', email: 'press@sonofest.org' },
//   { role: 'Vendors', email: 'vendors@sonofest.org' },
//   { role: 'Volunteers', email: 'volunteers@sonofest.org' },
// ];

// const mapLegend = [
//   { label: 'Entrances & Info' },
//   { label: 'Restaurant Chili Rows' },
//   { label: 'Live Music Stages' },
//   { label: 'Booze Garden' },
//   { label: 'Makers Market' },
//   { label: 'Kids Zone' },
//   { label: 'Restrooms & Handwashing' },
//   { label: 'ADA Access' },
//   { label: 'Bike Valet' },
//   { label: 'First Aid & Lost and Found' },
// ];

const serviceNotes = [
  'Festival grounds are centered at 32nd & Thorn St - rideshare drop-off is on Thorn.',
  'Plan for limited street parking; biking and transit are highly encouraged. Plan your route at sdmts.com.',
  'If driving, consider parking North of Thorn St to avoid event street closures starting at 9 AM.',
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
        title="Information"
        subhead={`All the details you need for the ${siteContent.year} SoNo Fest - contact the team, find the map, and browse FAQs.`}
        ctas={[
          {
            label: 'Buy Tasting Passes',
            href: '/tickets/',
            variant: 'primary',
          },
          {
            label: 'Volunteer Sign-Up',
            href: siteContent.links.volunteerSignup || '/information/#volunteer',
            variant: 'secondary',
          },
          {
            label: 'FAQs',
            href: "#faq",
            variant: 'light',
          },          
        ]}
      />
      <section className="content-block">
        <Image src="/images/featured/info.jpg" alt="Collage of bands performing at SoNo Fest" width={1200} height={800} style={{ width: '100%', height: 'auto', borderRadius: '8px' }} />
      </section>
      <section className="content-block" id="details">
        <h2 className="section__title">Festival Basics</h2>
        <ul className="content-block__list">
          {serviceNotes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
         <p className="content-block__note">
          Questions? Email <a href="mailto:{siteContent.contactEmail}">{siteContent.contactEmail}</a> and our team will follow up.
        </p>
      </section>
      <section className="content-block" id="volunteer">
        <h2 className="section__title">Volunteer & Support</h2>
        <p>
          SoNo Fest is 100% volunteer powered. If you would like to lend a hand before or during the event, sign up and our
          crew leads will follow up with available shifts.
        </p>
        <br/>
        <br />
        <a className="btn btn--ticket" href={volunteerUrl}>
          Volunteer Registration
        </a>  
         </section>                  
      {/* <section className="content-block"  id="map">
        <MapBlock
          image={{
            src: '/images/map.png',
            width: 1200,
            height: 800,
            alt: 'Festival map showing entrances, stages, booze garden, kids zone, and restrooms',
          }}
          legend={mapLegend}
          downloadUrl="/docs/map.pdf"
          googleMapUrl="https://maps.app.goo.gl/6ZWpkAWJfG86tQcR8"
        />
      </section> */}

      <section className="content-block" id="faq">
        <FAQAccordion items={faqItems} />
      </section>
    </>
  );
}

