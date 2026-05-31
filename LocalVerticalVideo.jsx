export default function LocalVerticalVideo({
  src = "/assets/banners/zaihai-video-3.mp4",
  poster = "/assets/banners/surfing-rider-03.png",
}) {
  return (
    <section className="video-showcase" aria-labelledby="video-showcase-title">
      <div className="video-copy">
        <p className="eyebrow">Real riding footage</p>
        <h2 id="video-showcase-title">See ZAIHAI Surfboards on the Water</h2>
        <p>
          Watch the actual riding scene and feel how the product looks in open-water entertainment,
          resort demos and rental experiences.
        </p>
        <a className="button dark" href="/products">
          Explore Products
        </a>
      </div>
      <div className="vertical-video-card">
        <div className="video-frame">
          <video
            controls
            muted
            loop
            autoPlay
            playsInline
            preload="metadata"
            poster={poster}
            aria-label="ZAIHAI electric surfboard riding video"
          >
            <source src={src} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      </div>
    </section>
  );
}
