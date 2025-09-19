import Hero from '@/app/components/Hero';
import { siteContent } from '@/app/lib/content';
import { createPageMetadata } from '@/app/lib/metadata';

const donationFormUrl =
  'https://docs.google.com/forms/d/e/1FAIpQLScjJt2cmkmzpAjEjZXBjclMiRK2ENM56gKH4v0HM9P-MZsx-A/viewform';

const breweries = [
  'Original 40 Brewing',
  'Kairoa Brewing Company',
  'Coronado Brewing Co.',
  'North Park Beer Co.',
  'Belching Beaver Brewery',
  'Mike Hess Brewing',
  'Pizza Port Brewing',
  'Pure Project',
  'TapRoom Beer Co.',
  'Fall Brewing',
  'Blind Lady Ale House',
];

const ciderAndMore = [
  'Bivouac Ciderworks',
  'Juneshine Hard Kombucha',
  'Spindrift Spiked',
];

const serviceNotes = [
  'The Booze Garden is a 21+ space--IDs are checked at the entrance.',
  'Tasting tokens are available on site; additional pours can be purchased while supplies last.',
  'A dedicated water station and shaded seating keep you refreshed between samples.',
  'All proceeds go straight back to McKinley Elementary arts education.',
];

export const metadata = createPageMetadata({
  title: 'Booze Garden',
  description:
    'Explore the SoNo Fest Booze Garden with a curated lineup of San Diego breweries, cideries, and craft beverage partners.',
  path: '/booze/',
});

export default function BoozePage() {
  return (
    <>
      <Hero
        variant="short"
        title="Booze Garden"
        subhead="Sip your way through San Diego's top breweries, cideries, and craft beverage makers--all supporting SoNo Fest."
        ctas={[
          {
            label: 'Buy Tasting Passes',
            href: siteContent.ticketTailorUrl,
            variant: 'primary',
          },
          {
            label: 'Donate Booze',
            href: donationFormUrl,
            variant: 'secondary',
          },
        ]}
      />
      <section className="impact-strip">
        <p>Cheers! 100% of festival proceeds support McKinley Elementary&#39;s art, music, and enrichment programs.</p>
      </section>
      <section className="content-block">
        <h2 className="section__title">What&#39;s Pouring</h2>
        <p>
          Each year we invite our favorite neighborhood brewers, cider makers, and beverage friends to pour inside the Booze
          Garden. The 2025 lineup features local legends alongside fresh newcomers--here&#39;s a sample of who you&#39;ll find on tap.
        </p>
        <h3>Breweries</h3>
        <ul className="content-block__list">
          {breweries.map((name) => (
            <li key={name}>{name}</li>
          ))}
        </ul>
        <h3>Cider, Hard Tea &amp; More</h3>
        <ul className="content-block__list">
          {ciderAndMore.map((name) => (
            <li key={name}>{name}</li>
          ))}
        </ul>
        <p className="content-block__note">Lineup subject to change as additional beverage partners join the party.</p>
      </section>
      <section className="content-block">
        <h2 className="section__title">Plan Your Pour</h2>
        <ul className="content-block__list">
          {serviceNotes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
        <p>
          Interested in featuring your beverage brand? Fill out the donation form and our Booze Garden coordinators will follow
          up with availability, logistics, and pour details.
        </p>
      </section>
    </>
  );
}

