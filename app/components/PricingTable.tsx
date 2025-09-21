import type { TicketOption } from '@/app/lib/types';

type PricingTableProps = {
  options: TicketOption[];
  ticketUrl: string;
};

const channelCopy: Record<TicketOption['channel'], string> = {
  booth: 'Event Booth',
  'in-person': 'In-Person Pickup',
  online: 'Online',
  'ceramic-connection': 'Ceramic Connection',
};

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

export default function PricingTable({ options, ticketUrl }: PricingTableProps) {
  if (!options.length) {
    return null;
  }

  return (
    <section className="pricing-table" id="pricing">
      <h2 className="section__title">Tasting Passes</h2>
      <table className="pricing-table__grid">
        <thead>
          <tr>
            <th scope="col">Pass</th>
            <th scope="col">Price</th>
            <th scope="col">Tastings</th>
            <th scope="col">Where to Buy</th>
          </tr>
        </thead>
        <tbody>
          {options.map((option) => (
            <tr key={option.name}>
              <th scope="row">{option.name}</th>
              <td>{currency.format(option.price)}</td>
              <td>{option.tastings}</td>
              <td>{channelCopy[option.channel]}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {new Date() >= new Date('2025-11-07') && (
        <div className="pricing-table__cta">
          <a className="btn btn--ticket" href={ticketUrl} target="_blank" rel="noopener noreferrer">
        Buy Tasting Passes on TicketTailor
          </a>
        </div>
      )}
      {new Date() < new Date('2025-11-07') && (
        <div className="pricing-table__cta">
          Tasting Passes Not Yet Available. Check Back Here November 7th!
        </div>
      )}
    </section>
  );
}
