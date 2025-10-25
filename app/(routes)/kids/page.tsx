import Image from 'next/image';

import Hero from '@/app/components/Hero';
import SponsorStrip from '@/app/components/SponsorStrip';
import { siteContent } from '@/app/lib/content';
import { createPageMetadata } from '@/app/lib/metadata';
import type { Sponsor } from '@/app/lib/types';

const activities = [
  "Activities Coming Soon"
];

const participationTips = [
  'Bring reusable water bottles—refill stations and shade tents keep families cool.',
  'Plan a meet-up spot before exploring so older kids can roam between stations.',
];

const miniStageSchedule = [
  { time: '11:30 AM', title: 'TBD', description: 'TBD' },
  { time: '12:30 PM', title: 'TBD', description: 'TBD' },
  { time: '1:30 PM', title: 'TBD', description: 'TBD' },
  { time: '2:30 PM', title: 'TBD', description: 'TBD' },
  { time: '3:30 PM', title: 'TBD', description: 'TBD' },
];

const kidsZonePartners: Sponsor[] = [
  { name: 'FC Balboa Youth Soccer Club', active: true },
  { name: 'Friends of North Park Library', active: true },
  { name: 'Replay Toys', active: true },
  { name: 'UCSD Kid Science Labs (Aarthi Popat)', active: true },
  { name: 'Scienceing Time', active: true },
  { name: 'Play-Well TEKnologies', active: true },
  { name: 'North Park Flag Football', active: true },
];

export const metadata = createPageMetadata({
  title: 'Kids Zone',
  description: 'Discover the hands-on Kids Zone at SoNo Fest with crafts, games, performances, and family resources.',
  path: '/kids/',
});

export default function KidsZonePage() {
  const volunteerUrl = siteContent.links.volunteerSignup || '/volunteers/';

  return (
    <>
      <Hero
        variant="short"
        title="Kids Zone"
        subhead="Activities, games, and performances keep young festival-goers busy along 32nd Street."
        ctas={[
          {
            label: 'Get Tasting Passes',
            href: '/tickets/',
          },
          {
            label: 'Volunteer for Kids Zone',
            href: volunteerUrl,
            variant: 'secondary',
          },
          {
            label: 'Festival Info',
            href: '/information/',
            variant: 'light',
          },
        ]}
      />
      <section className="content-block">
        <Image
          src="/images/featured/kidszone.jpg"
          alt="Kids painting and playing at SoNo Fest"
          width={1200}
          height={800}
          style={{ width: '100%', height: 'auto', borderRadius: '8px' }}
        />
      </section>
      <section className="content-block" id="participate">
        <h2 className="section__title">How to Jump In</h2>
        <p>
          Programming rides the energy of the day—think chalk art challenges, parachute games, and quick STEM builds. These
          tips make it easy to plug into whatever is happening when you arrive.
        </p>
        <br />
        <ul className="content-block__list">
          {participationTips.map((tip) => (
            <li key={tip}>{tip}</li>
          ))}
        </ul>
        <p className="content-block__note">
          Questions? Email{' '}
          <a href={`mailto:${siteContent.contactEmail}`}>{siteContent.contactEmail}</a> and our team will help you plan ahead.
        </p>
      </section>
      <section className="content-block" id="schedule">
        <h2 className="section__title">Mini Stage Schedule</h2>
        <p>
          Quick performances and demos roll through the day. Final lineups post closer to the festival, but use the times
          below as a guide for planning breaks between chili tastings.
        </p>
        <br />
        <ul className="content-block__list">
          {miniStageSchedule.map(({ time, title, description }) => (
            <li key={`${time}-${title}`}>
              <strong>{time}</strong> &mdash; {title} ({description})
            </li>
          ))}
        </ul>
      </section>
      <section className="impact-strip">
        <p>Every Kids Zone activity fuels arts, music, and STEAM programs at McKinley Elementary.</p>
      </section>
      <section className="content-block" id="activities">
        <h2 className="section__title">Hands-On Fun All Day</h2>
        <p>
          The Kids Zone spans the 3200 block of Thorn Street with shaded tents, turf, and seating for families. Stations are
          run by teachers, parents, and neighborhood partners so there is always something new to try.
        </p>
        <br />
        <ul className="content-block__list">
          {activities.map((activity) => (
            <li key={activity}>{activity}</li>
          ))}
        </ul>
      </section>

      <SponsorStrip title="Kids Zone Partners" sponsors={siteContent.sponsors} category={["kids"]} />
    </>
  );
}
