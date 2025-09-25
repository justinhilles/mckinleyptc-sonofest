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
                <span className="feature-card__icon" aria-hidden="true">
                  {item.icon}
                </span>
                <h3 className="feature-card__title">{item.title}</h3>
                {item.description ? (
                  <p className="feature-card__description">{item.description}</p>
                ) : null}
              </Link>
            </article>
          );
        })}
      </div>
    </section>
  );
}
