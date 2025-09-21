'use client';

import { useState } from 'react';

import type { FaqItem } from '@/app/lib/types';

type FAQAccordionProps = {
  items: FaqItem[];
};

export default function FAQAccordion({ items }: FAQAccordionProps) {
  const [openItems, setOpenItems] = useState<Set<number>>(new Set());

  if (!items.length) {
    return null;
  }

  const toggleItem = (index: number) => {
    setOpenItems((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  return (
    <section className="faq" id="faqs">
      <h2 className="section__title">FAQs</h2>
      <div className="faq__items">
        {items.map((item, index) => {
          const panelId = `faq-panel-${index}`;
          const headingId = `faq-heading-${index}`;
          const isOpen = openItems.has(index);

          return (
            <article key={item.q} className="faq__item" id={item.id}>
              <h3 className="faq__question" id={headingId}>
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  className="faq__toggle"
                  onClick={() => toggleItem(index)}
                >
                  <span>{item.q}</span>
                  <span aria-hidden="true">{isOpen ? '−' : '+'}</span>
                </button>
              </h3>
              <div
                id={panelId}
                role="region"
                aria-labelledby={headingId}
                className={`faq__panel${isOpen ? ' faq__panel--open' : ''}`}
                hidden={!isOpen}
              >
                <p>{item.a}</p>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
