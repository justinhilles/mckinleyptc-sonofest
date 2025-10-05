import site from '@/app/content/site.json';
import tickets from '@/app/content/tickets.json';
import faq from '@/app/content/faq.json';
import instagram from '@/app/content/instagram.json';

import type { FaqItem, InstagramPost, SiteContent, TicketsContent } from './types';

export const siteContent = site as SiteContent;
export const ticketsContent = tickets as TicketsContent;
export const faqItems = faq as FaqItem[];
export const instagramPosts = instagram as InstagramPost[];

export function getTicketTailorOrigin(): string | null {
  try {
    const url = new URL(siteContent.ticketTailorUrl);
    return `${url.protocol}//${url.host}`;
  } catch {
    return null;
  }
}
