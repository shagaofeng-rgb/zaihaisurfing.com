export default function GoogleMapCard({
  apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED_API_KEY,
  address = "Quzhou, Zhejiang, China",
  companyName = "ZAIHAI SURFING",
  logoSrc = "/assets/logo.jpg",
}) {
  const query = encodeURIComponent(address);
  const src = `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${query}&zoom=12&maptype=roadmap`;
  const navUrl = `https://www.google.com/maps/search/?api=1&query=${query}`;

  return (
    <section className="map-section" aria-labelledby="map-title">
      <div className="map-copy">
        <p className="eyebrow">Company location</p>
        <h2 id="map-title">{address}</h2>
        <p>Open the map to view the company region and navigate with Google Maps.</p>
      </div>

      <div className="map-card">
        <div className="map-card-header">
          <div>
            <span>Interactive map</span>
            <strong>{companyName}</strong>
          </div>
          <img src={logoSrc} alt={`${companyName} logo`} />
        </div>
        <div className="map-frame-wrap">
          <iframe
            title={`${companyName} location`}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
            src={src}
          />
        </div>
        <div className="map-actions">
          <a className="button primary" href={navUrl} target="_blank" rel="noopener noreferrer">
            View on Google Maps
          </a>
        </div>
      </div>
    </section>
  );
}
