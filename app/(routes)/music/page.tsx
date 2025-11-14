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

const musicInstagramHandles = new Map<string, string>(
  (siteContent.sponsors ?? [])
    .filter((sponsor) => sponsor.category?.includes('music') && sponsor.instagram)
    .map((sponsor) => [sponsor.name, sponsor.instagram as string]),
);

const getInstagramHandle = (name: string) => musicInstagramHandles.get(name);

const formatInstagramUrl = (handle: string) =>
  handle.startsWith('http') ? handle : `https://www.instagram.com/${handle.replace(/^@/, '')}`;

const stageSchedules = [
  {
    name: 'Main Stage (Bancroft)',
    sponsor: 'Sponsored by Casbah and GOBBQ',
    slots: [
      { time: '11:30 AM - 12:10 PM', artist: 'The Velvet Roses', instagram: getInstagramHandle('The Velvet Roses') },
      { time: '12:30 PM - 1:10 PM', artist: 'Vurv', instagram: getInstagramHandle('Vurv') },
      { time: '1:15 PM', artist: 'Chili Winner - Judges', isChiliWinner: true },
      { time: '1:30 PM - 2:15 PM', artist: 'Night Carrots', instagram: getInstagramHandle('Night Carrots') },
      { time: '2:30 PM - 3:10 PM', artist: 'The Creepy Creeps', instagram: getInstagramHandle('The Creepy Creeps') },
      { time: '3:20 PM', artist: "Chili Winner - People's Choice", isChiliWinner: true },
      { time: '3:25 PM - 4:05 PM', artist: 'TK and the Deadlist', instagram: getInstagramHandle('TK and the Deadlist') },
      { time: '4:20 PM - 5:00 PM', artist: 'Rey Wolf', instagram: getInstagramHandle('Rey Wolf') },
    ],
  },
  {
    name: 'Beer Garden Stage',
    sponsor: 'Sponsored by Park & Rec',
    slots: [
      { time: '11:30 AM - 12:10 PM', artist: 'TBD', isChiliWinner: false },
      { time: '12:30 PM - 1:10 PM', artist: 'TBD', isChiliWinner: false },
      { time: '1:15 PM', artist: 'TBD', isChiliWinner: false },
      { time: '1:30 PM - 2:15 PM', artist: 'TBD', isChiliWinner: false },
      { time: '2:30 PM - 3:10 PM', artist: 'TBD', isChiliWinner: false },
      { time: '3:25 PM', artist: 'TBD', isChiliWinner: false },
      { time: '3:30 PM - 4:10 PM', artist: 'TBD', isChiliWinner: false },
      { time: '4:20 PM - 5:00 PM', artist: 'TBD', isChiliWinner: false },
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

      {/* <section className="content-block">
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
      </section> */}
      <section className="content-block">
        <h2 className="section__title">Plan Your Groove</h2>
        <p>
          Bring sun protection, dancing shoes, and plenty of energy. <br />
          The stages face into the festival so you can grab chili,
          check out the makers market, and still hear the show.
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
            <div className="schedule-table__wrapper">
              <table className="schedule-table" aria-label={`${stage.name} schedule`}>
                <thead>
                  <tr>
                    <th scope="col">Time</th>
                    <th scope="col">Artist / Set</th>
                  </tr>
                </thead>
                <tbody>
                  {stage.slots.map((slot) => (
                    <tr
                      key={`${stage.name}-${slot.time}-${slot.artist}`}
                      className={slot.isChiliWinner ? 'chili-winner-row' : undefined}
                    >
                      <td data-label="Time">{slot.time}</td>
                      <td data-label="Artist / Set">
                        {slot.isChiliWinner ? '🏆 ' : ''}
                        {slot.instagram ? (
                          <a href={formatInstagramUrl(slot.instagram)} target="_blank" rel="noreferrer noopener">
                            {slot.artist}
                          </a>
                        ) : (
                          slot.artist
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
