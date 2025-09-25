import type { Metadata } from 'next';
import { Anton, Oswald } from 'next/font/google';

import './globals.css';

import Footer from '@/app/components/Footer';
import Header from '@/app/components/Header';
import { getTicketTailorOrigin, siteContent } from '@/app/lib/content';

const oswald = Oswald({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-body',
});

const anton = Anton({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-display',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://sonofestchilicookoff.com/'),
  title: {
    default: `SoNo Fest & Chili Cook-Off ${siteContent.year}`,
    template: `%s | SoNo Fest & Chili Cook-Off ${siteContent.year}`,
  },
  description:
    "San Diego's SoNo Fest & Chili Cook-Off is back December 7, 2025 with chili, live music, family fun, and a makers market benefiting McKinley Elementary Foundation.",
};

const ticketTailorOrigin = getTicketTailorOrigin();

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${oswald.variable} ${anton.variable}`}>
      <head>
        <link rel="icon" href="/favicon/favicon.ico" />
      </head>
      <body>
        <a href="#main" className="skip-link">
          Skip to main content
        </a>
        <Header />
        <main id="main" className="festival-poster" role="main">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
