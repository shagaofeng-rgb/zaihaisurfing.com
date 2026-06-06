import {Link} from '@/i18n/navigation';

export default function NotFound() {
  return (
    <main>
      <section className="page-hero">
        <div>
          <p className="eyebrow">Page not found</p>
          <h1>We could not find this page</h1>
          <p>The page may have moved, or the link may be incorrect. You can browse products or contact ZAIHAI for help.</p>
          <div className="hero-actions">
            <Link className="button primary" href="/products">Browse Products</Link>
            <Link className="button dark" href="/contact">Contact Us</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
