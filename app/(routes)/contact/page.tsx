import Hero from '@/app/components/Hero';
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
          <form
            name="contact"
            method="POST"
            data-netlify="true"
            netlify-honeypot="bot-field"
            className="contact__form"
          >
            <input type="hidden" name="form-name" value="contact" />
            <p className="visually-hidden">
              <label>
                Don’t fill this out if you’re human:
                <input name="bot-field" />
              </label>
            </p>
            <div className="form-field">
              <label htmlFor="name">Name</label>
              <input id="name" name="name" type="text" required autoComplete="name" />
            </div>
            <div className="form-field">
              <label htmlFor="email">Email</label>
              <input id="email" name="email" type="email" required autoComplete="email" />
            </div>
            <div className="form-field">
              <label htmlFor="message">Message</label>
              <textarea id="message" name="message" rows={6} required />
            </div>
            <button className="btn" type="submit">Send Message</button>
          </form>
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
