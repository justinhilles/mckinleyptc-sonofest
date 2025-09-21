import Image from 'next/image';

type LegendItem = {
  label: string;
  icon?: string;
};

type MapBlockProps = {
  image: {
    src: string;
    alt: string;
    width: number;
    height: number;
  };
  legend: LegendItem[];
  downloadUrl: string;
  googleMapUrl: string;
};

export default function MapBlock({ image, legend, downloadUrl, googleMapUrl }: MapBlockProps) {
  return (
    <section className="map-block">
      <div className="map-block__media">
        <Image
          src={image.src}
          alt={image.alt}
          width={image.width}
          height={image.height}
          className="map-block__image"
          loading="lazy"
        />
      </div>
      <div className="map-block__content">
        <h2 className="section__title">Festival Map</h2>
        {/* <ul className="map-block__legend">
          {legend.map((item) => (
            <li key={item.label}>
              {item.icon ? <span aria-hidden="true">{item.icon}</span> : null}
              <span>{item.label}</span>
            </li>
          ))}
        </ul> */}
        <div className="map-block__links">
          <a className="btn btn--secondary" href={downloadUrl} download>
            Download Map PDF
          </a>
          <a className="btn btn--light" href={googleMapUrl} target="_blank" rel="noopener noreferrer">
            Open in Google Maps
          </a>
        </div>
      </div>
    </section>
  );
}
