import Image from 'next/image';
import Link from 'next/link';

import type { CtaButton } from '@/app/lib/types';

type HeroVariant = 'full' | 'short';

type HeroProps = {
  title: string;
  subhead: string;
  kicker?: string;
  variant?: HeroVariant;
  ctas?: CtaButton[];
  media?: {
    src: string;
    alt: string;
    width: number;
    height: number;
  };
};

export default function Hero({
  title,
  subhead,
  kicker,
  variant = 'full',
  ctas = [],
  media,
}: HeroProps) {
  const heroClasses = ['hero'];
  heroClasses.push(variant === 'full' ? 'hero--full' : 'hero--short');

  return (
    <section className={heroClasses.join(' ')}>
      <div className="hero__container">
        {variant === 'full' && media ? (
          <div className="hero__logo" aria-hidden="true">
            <Image
              src={media.src}
              alt={media.alt}
              width={media.width}
              height={media.height}
              priority
            />
          </div>
        ) : null}
        {kicker ? <p className="hero__kicker">{kicker}</p> : null}
        {title ? <h1 className="hero__title">{title}</h1> : null}
        {subhead ? <p className="hero__subhead">{subhead}</p> : null}
        {ctas.length > 0 ? (
          <div className="action-buttons hero__actions">
            {ctas.map((cta) => (
              <HeroCta key={cta.href} {...cta} />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

function HeroCta({ label, href, variant = 'primary' }: CtaButton) {
  const classes = ['btn', 'hero__cta'];
  if (variant === 'secondary') {
    classes.push('btn--secondary');
  }
  if (variant === 'light') {
    classes.push('btn--light');
  }
  const isExternal = href.startsWith('http');

  if (isExternal) {
    return (
      <a className={classes.join(' ')} href={href} target="_blank" rel="noopener noreferrer">
        {label}
      </a>
    );
  }

  return (
    <Link className={classes.join(' ')} href={href} prefetch>
      {label}
    </Link>
  );
}
