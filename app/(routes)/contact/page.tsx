import Hero from '@/app/components/Hero';
import ContactForm from '@/app/components/ContactForm';
import { createPageMetadata } from '@/app/lib/metadata';

export const metadata = createPageMetadata({
  title: 'Contact',
  description: 'Reach the SoNo Fest & Chili Cook-Off team for sponsorships, press, vendors, and volunteers.',
  path: '/contact/',
});

const roleContacts = [
  { role: 'Sponsorships', email: 'sponsors@sonofest.org' },
  { role: 'Press', email: 'press@sonofest.org' },
  { role: 'Vendors', email: 'vendors@sonofest.org' },
  { role: 'Volunteers', email: 'volunteers@sonofest.org' },
];

export default function ContactPage() {
  return (
    <>
      <Hero
        variant="short"
        title="Contact the SoNo Team"
        subhead="Send us a note and we will connect you with the right crew."
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
    </>
  );
}

