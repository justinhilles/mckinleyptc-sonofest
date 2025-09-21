import Hero from '@/app/components/Hero';
import SponsorStrip from '@/app/components/SponsorStrip';
import { siteContent } from '@/app/lib/content';
import { createPageMetadata } from '@/app/lib/metadata';
import Image from 'next/image';

const featuredArtists = [
  'The Creepy Creeps',
  'Whiskey & Burlap',
  'Ypsitucky',
  'Chloe Lou & The Liddells',
  'Scary Pierre',
  'Julia Sage & The Bad Hombres',
  'Night Carrots',
  'Le Chateau',
  'The Mothmen',
  'Shawn Rohlf & The Buskers',
  'Michael Draper',
  'Tamar Berk',
];

const stageSchedules = [
  {
    name: 'Main Stage (Bancroft)',
    sponsor: 'Sponsored by Casbah and Grand Ole BBQ',
    slots: [
      { time: '11:30 - 12:10', artist: 'Night Carrots' },
      { time: '12:30 - 1:10', artist: 'Le Chateau' },
      { time: '1:15', artist: 'Chili Winner - Judges' },
      { time: '1:30 - 2:15', artist: 'Scary Pierre' },
      { time: '2:30 - 3:10', artist: 'The Creepy Creeps' },
      { time: '3:25', artist: "Chili Winner - People's Choice" },
      { time: '3:30 - 4:10', artist: 'The Mothmen' },
      { time: '4:20 - 5:00', artist: 'Tamar Berk' },
    ],
  },
  {
    name: 'Beer Garden Stage',
    sponsor: 'Sponsored by Park & Rec',
    slots: [
      { time: '11:30 - 12:10', artist: 'Whiskey & Burlap' },
      { time: '12:30 - 1:10', artist: 'Chloe Lou & The Liddells' },
      { time: '1:15', artist: 'Chili Winner - Judges' },
      { time: '1:30 - 2:15', artist: 'Julia Sage & The Bad Hombres' },
      { time: '2:30 - 3:10', artist: 'Ypsitucky' },
      { time: '3:25', artist: "Chili Winner - People's Choice" },
      { time: '3:30 - 4:10', artist: 'Shawn Rohlf & The Buskers' },
      { time: '4:20 - 5:00', artist: 'Michael Draper' },
    ],
  },
];

export const metadata = createPageMetadata({
  title: 'Music',
  description:
    'Catch live music across two stages at SoNo Fest & Chili Cook-Off 2025 with sets from San Diego favorites all afternoon.',
  path: '/music/',
});

export default function MusicPage() {
  return (
    <>
      <Hero
        variant="short"
        title="Live Music All Day"
        subhead="Two stages. Twelve acts. Non-stop tunes powering the SoNo Fest street party from open to close."
        ctas={[
          {
            label: '2025 Stage Schedule',
            href: '#schedule',
            variant: 'primary',
          },
          {
            label: 'Want to Perform?',
            href: '#signup',
            variant: 'secondary',
          },          
        ]}
      />
      <section className="content-block">
          <Image src="/images/featured/music.jpg" alt="Collage of bands performing at SoNo Fest" width={1200} height={800} style={{ width: '100%', height: 'auto', borderRadius: '8px' }} />
        </section>
      <section className="impact-strip">
        <p>Every chord supports McKinley Elementary arts education. Thank you for dancing with us!</p>
      </section>

      <section className="content-block">
        <h2 className="section__title">Featured Artists</h2>
        <p>
          We love showcasing the bands, songwriters, and DJs who make San Diego sing. Here are just a few of the performers
          who joined us in the past.
        </p>
        <br />
        <ul className="content-block__list">
          {featuredArtists.map((artist) => (
            <li key={artist}>{artist}</li>
          ))}
        </ul>
      </section>
      <section className="content-block">
        <h2 className="section__title">Plan Your Groove</h2>
        <p>
          Bring sun protection, dancing shoes, and plenty of energy. The stages face into the festival so you can grab chili,
          check out the makers market, and still hear the show. Stop by the Info Booth if you need ear protection for the
          little ones or directions to family-friendly zones.
        </p>
        <br />

      </section>      
      <section id="schedule" className="content-block">
        <h2 className="section__title">2025 Stage Schedule</h2>
        <p>
          Music kicks off at 11:30 AM on both the Bancroft and Booze Garden stages and runs through the final set at 5 PM. We
          break twice to crown the Chili Cook-Off champions.
        </p>
        <br />
        {stageSchedules.map((stage) => (
          <div key={stage.name} className="content-block__schedule">
            <h3>{stage.name}</h3>
            <p>{stage.sponsor}</p>
            <ul className="content-block__list">
              {stage.slots.map((slot) => (
                <li key={`${stage.name}-${slot.time}-${slot.artist}`}>
                  <strong>{slot.time}:</strong> {slot.artist}
                </li>
              ))}
            </ul>
          </div>
        ))}
        <p className="content-block__note">Lineup subject to change as the festival approaches.</p>
      </section>
      <SponsorStrip title="Sponsors & Partners" sponsors={siteContent.sponsors} category={["music"]} />
            <section className="content-block" id="signup">
        <h2 className="section__title">Want to Perform at SoNo Fest?</h2>
        <p>
          Are you a band interested in playing SoNo Fest? Reach out to <a href="mailto:{siteContent.contactEmail}">{siteContent.contactEmail}</a>
          with links to recent live recordings and availability.
        </p>
      </section>
    </>
  );
}
