export type CtaButton = {
  label: string;
  href: string;
  variant?: 'primary' | 'secondary' | 'light';
};

export type Sponsor = {
  name: string;
  href?: string;
  logo?: string;
  active?: boolean;
  category?: Array<'sponsor' | 'partner'>[number];
};

export type SiteContent = {
  year: number;
  eventDate: string;
  location: string;
  ticketTailorUrl: string;
  contactEmail?: string;
  organizer?: {
    name: string;
    url?: string;
  };
  social: {
    facebook?: string;
    instagram?: string;
  };
  links: {
    chiliEntryForm?: string;
    volunteerSignup?: string;
    merchShop?: string;
  };
  sponsors?: Sponsor[];
};

export type TicketOption = {
  name: string;
  price: number;
  tastings: number;
  channel: 'in-person' | 'online' | 'booth' | 'ceramic-connection';
};

export type PickupStop = {
  when: string;
  where: string;
};

export type TicketsContent = {
  options: TicketOption[];
  pickup: PickupStop[];
};

export type FaqItem = {
  id?: string;
  q: string;
  a: string;
};
