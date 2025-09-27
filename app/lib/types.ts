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
  category?: Array<'sponsor' | 'partner' | 'chili' | 'music' | 'booze' | 'foodtruck' | 'merch' | 'vendor'>;
  type?: 'community' | 'best-friend' | 'neighbor' | 'benefactor';
};

export type Vendor = {
  name: string;
  href?: string;
  logo?: string;
  active?: boolean;
  contact?: string;
  email?: string;
  phone?: string;
  description?: string;
  instagram?: string;
  facebook?: string;
  twitter?: string;
  notes?: string;
};

export type Band = {
  name: string;
  href?: string;
  logo?: string;
  active?: boolean;
}

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
    vendorApplicationForm: string;
    foodTruckApplicationForm: string;
    sponsorPacket?: string;
    donate?: string;
  };
  sponsors?: Sponsor[];
  vendors?: Sponsor[];
  bands?: Band[];
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
