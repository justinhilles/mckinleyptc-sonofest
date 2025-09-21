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
      <h2 className="section__title">Pickup Schedule</h2>
      <ul className="pickup__list">
        {items.map((item) => (
          <li key={`${item.when}-${item.where}`} className="pickup__item">
            <span className="pickup__when">{item.when}</span>
            <span className="pickup__where">{item.where}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
