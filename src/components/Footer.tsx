import {Link} from '@/i18n/navigation';
import type {Locale} from '@/i18n/routing';
import {uiCopy} from '@/lib/uiCopy';
import PaymentBadges from './PaymentBadges';
import SocialLinks from './SocialLinks';

export default async function Footer({locale}: {locale: Locale}) {
  const copy = uiCopy[locale];

  return (
    <footer className="site-footer footer-upgraded">
      <div className="footer-brand">
        <Link className="brand" href="/" aria-label="ZAIHAI SURFING home">
          <img src="/assets/brand-logo.png" alt="" aria-hidden="true" width="960" height="450" loading="lazy" decoding="async" />
          <span>ZAIHAI SURFING</span>
        </Link>
        <p>{copy.footer.brandText}</p>
        <Link className="footer-quote" href="/contact">
          {copy.footer.quote}
        </Link>
      </div>
      <div className="footer-column">
        <h3>{copy.footer.products}</h3>
        <Link href="/products">{copy.mega.electricSurfboards}</Link>
        <Link href="/products/rage-shark-x">{copy.mega.electricWaterKarts}</Link>
        <Link href="/products/p1-pro">{copy.mega.fuelSurfboards}</Link>
        <Link href="/products">{copy.footer.accessories}</Link>
        <Link href="/products">{copy.footer.catalog}</Link>
      </div>
      <div className="footer-column">
        <h3>{copy.footer.buyerSupport}</h3>
        <Link href="/applications">{copy.footer.applications}</Link>
        <Link href="/factory">{copy.footer.oem}</Link>
        <Link href="/shipping">{copy.footer.shipping}</Link>
        <Link href="/warranty">Warranty</Link>
        <Link href="/returns">Returns & After-Sales</Link>
        <Link href="/faq">{copy.footer.faq}</Link>
        <Link href="/contact">{copy.footer.distributor}</Link>
        <Link href="/news">{copy.nav.news}</Link>
        <Link href="/blog">{copy.nav.blog}</Link>
      </div>
      <div className="footer-column footer-contact">
        <h3>{copy.footer.contact}</h3>
        <a href="mailto:davidsha@zaihaisurfing.com">davidsha@zaihaisurfing.com</a>
        <a data-whatsapp-placement="footer_contact" href="https://api.whatsapp.com/send/?phone=8617621485205&text&type=phone_number&app_absent=0" target="_blank" rel="noopener noreferrer">
          +86 17621485205
        </a>
        <span>Room 110, 1st Floor, Building 2, Qushidai Future Building, Kecheng District, Quzhou, Zhejiang, China</span>
        <Link href="/contact">{copy.footer.maps}</Link>
        <PaymentBadges />
        <SocialLinks />
      </div>
      <div className="footer-bottom">
        <span>&copy; {copy.footer.copyright}</span>
        <Link href="/privacy">Privacy</Link>
        <Link href="/terms">Terms</Link>
        <Link href="/contact">{copy.nav.contact}</Link>
      </div>
    </footer>
  );
}
