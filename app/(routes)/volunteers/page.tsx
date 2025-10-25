import Hero from '@/app/components/Hero';
import Image from 'next/image';

import { siteContent } from '@/app/lib/content';
import { createPageMetadata } from '@/app/lib/metadata';

const volunteerSignupUrl = siteContent.links.volunteerSignup?.trim();

const volunteerHighlights = [
  'Shift lengths range from 2-3 hours so you can still enjoy the festival.',
  'Roles include set-up, ticketing, merch, kids zone, chili support, and clean-up.',
  'Crew leads provide training and answer questions before your shift starts.',
  'Service hours available for high school and community groups.',
];

const prepSteps = [
  'Review the shift guide we email the week before the event to learn where to check in.',
  'Wear comfortable shoes, sun protection, and layers you do not mind getting a little chili on.',
  'Bring a reusable water bottle; we will keep hydration stations stocked for volunteers.',
  'Arrive 15 minutes before your shift so you have time to grab your badge and meet your crew lead.',
];

export const metadata = createPageMetadata({
  title: 'Volunteers',
  description:
    'Sign up to volunteer with SoNo Fest & Chili Cook-Off and support McKinley Elementary by powering the festival behind the scenes.',
  path: '/volunteers/',
});

export default function VolunteersPage() {
  return (
    <>
      <Hero
        variant="short"
        title="Volunteers"
        subhead="Hundreds of neighbors lend a hand every December to make SoNo Fest happen. Join the crew and help McKinley Elementary thrive."
        ctas={[
          {
            label: 'Sign Up Coming Soon',
            href: '',
            variant: 'primary' as const,
          },
          {
            label: 'Questions? Email Us',
            href: `mailto:${siteContent.contactEmail}`,
            variant: 'secondary' as const,
          },
        ]}
      />
      <section className="content-block">
        <Image
          src="/images/featured/volunteers.webp"
          alt="Volunteers smiling while pouring chili and greeting guests at SoNo Fest"
          width={1200}
          height={800}
          style={{ width: '100%', height: 'auto', borderRadius: '8px' }}
        />
      </section>
      <section className="impact-strip">
        <p>Every hour volunteered funds arts, music, and classroom programs for McKinley Elementary students.</p>
      </section>
      <section className="content-block">
        <h2 className="section__title">Why Volunteer?</h2>
        <p>
          SoNo Fest is entirely volunteer powered. From early-morning street closures to the final sweep after sunset, it takes
          a joyful crew of neighbors, parents, and friends to keep things running smoothly. We will pair you with a crew lead
          who makes sure you have everything you need to succeed.
        </p>
        <br />
        <ul className="content-block__list">
          {volunteerHighlights.map((highlight) => (
            <li key={highlight}>{highlight}</li>
          ))}
        </ul>
      </section>
      <section className="content-block">
        <h2 className="section__title">How to Get Ready</h2>
        <p>
          Once you sign up, we will follow up with shift assignments, meeting locations, and tips for the day. A little prep
          goes a long way toward a stress-free festival experience.
        </p>
        <br />
        <ul className="content-block__list">
          {prepSteps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ul>
      </section>
      <section className="content-block">
        <h2 className="section__title">Group Volunteering</h2>
        <p>Want to bring a team from your company, club, or community group? We love welcoming new partners. Reach out and we
          will reserve blocks of shifts so your crew can serve together.
        </p>
        <br />
        <br />
        <a className="btn btn--ticket" href={`mailto:${siteContent.contactEmail}`}>
          Coordinate a Group Shift
        </a>
      </section>
    </>
  );
}
