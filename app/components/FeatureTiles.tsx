import Link from 'next/link';
import type { ReactNode } from 'react';

type FeatureTile = {
  title: string;
  description?: string;
  href: string;
  icon: ReactNode;
};

type FeatureTilesProps = {
  items: FeatureTile[];
};

export default function FeatureTiles({ items }: FeatureTilesProps) {
  if (!items.length) {
    return null;
  }

  return (
    <section className="features">
      <div className="feature-grid" role="list">
        {items.map((item) => {
          return (
            <article key={item.href} className="feature-card" role="listitem">
              <Link href={item.href} className="feature-card__link">
                <i className={`fas ${item.icon} feature-icon`}></i>
                <h3 className="feature-card__title">{item.title}</h3>
              </Link>
            </article>
          );
        })}
      </div>
    </section>
  );
}
