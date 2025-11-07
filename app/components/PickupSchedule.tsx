import type { PickupStop } from '@/app/lib/types';

type PickupScheduleProps = {
  items: PickupStop[];
};

export default function PickupSchedule({ items }: PickupScheduleProps) {
  if (!items.length) {
    return null;
  }

  return (
    <section className="pickup" id="pickup">
      <h2 className="section__title">Tasting Passes Pickup Schedule</h2>
      <h3>Save the hassle! Pick up your tasting passes and commemorative mugs at one of the following times and locations before the big day!</h3>
      <p>Commemorative mugs must be picked up no later than December 7, 2025 at 1 PM or they will be released for sale.</p>
      <br />
      <ul className="pickup__list">
        {items.map((item) => (
          <li key={`${item.when}-${item.where}`} className="pickup__item">
            <span className="pickup__when">{item.when}</span>
            <span className="pickup__where">{item.where}</span>
            {item.description && <p className="pickup__description">{item.description}</p>}
          </li>
        ))}
      </ul>
    </section>
  );
}
