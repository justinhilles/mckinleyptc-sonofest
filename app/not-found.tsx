import Image from 'next/image';
import Link from 'next/link';

export default function NotFound() {
  return (
    <section className="content-block" style={{ textAlign: 'center' }}>
      <div className="content-block__inner" style={{ maxWidth: '640px', margin: '0 auto' }}>
        <Image
          src="/images/magpie.png"
          alt="Illustration of the SoNo Fest magpie mascot"
          width={320}
          height={88}
          priority
        />
        <h1 className="section__title" style={{ marginTop: '1.5rem' }}>
          Lost Your Way?
        </h1>
        <p>
          Looks like this page has already headed home from SoNo Fest. Use the navigation above or head back to the
          homepage to keep the good times rolling.
        </p>
        <div className="action-buttons" style={{ justifyContent: 'center', marginTop: '2rem' }}>
          <Link className="btn" href="/">
            Return Home
          </Link>
          <Link className="btn btn--secondary" href="/information/">
            Event Info
          </Link>
        </div>
      </div>
    </section>
  );
}
