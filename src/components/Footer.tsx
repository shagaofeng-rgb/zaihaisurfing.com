import {getTranslations} from 'next-intl/server';
import {Link} from '@/i18n/navigation';
import type {Locale} from '@/i18n/routing';
import SocialLinks from './SocialLinks';

export default async function Footer({locale}: {locale: Locale}) {
  const common = await getTranslations({locale, namespace: 'common'});

  return (
    <footer className="site-footer footer-upgraded">
      <div className="footer-brand">
        <Link className="brand" href="/">
          <img src="/assets/logo.jpg" alt={common('brand')} />
          <span>{common('brand')}</span>
        </Link>
        <p>{common('footer')} Built for overseas B2B water sports buyers.</p>
        <Link className="footer-quote" href="/contact">
          Send Your Requirements
        </Link>
      </div>
      <div className="footer-column">
        <h3>Products</h3>
        <Link href="/products">Electric Surfboards</Link>
        <Link href="/products/rage-shark-x">Electric Water Karts</Link>
        <Link href="/products/p1-pro">Fuel-Powered Surfboards</Link>
        <Link href="/products">Full Catalog</Link>
      </div>
      <div className="footer-column">
        <h3>Business</h3>
        <Link href="/applications">Applications</Link>
        <Link href="/applications">Global Markets</Link>
        <Link href="/factory">OEM/ODM Support</Link>
        <Link href="/blog">News & Insights</Link>
        <Link href="/contact">Distributor Inquiry</Link>
      </div>
      <div className="footer-column footer-contact">
        <h3>Contact</h3>
        <a href="mailto:davidsha@zaihaisurfing.com">{common('email')}</a>
        <a href="https://api.whatsapp.com/send/?phone=8617621485205&text&type=phone_number&app_absent=0" target="_blank" rel="noopener noreferrer">
          {common('whatsapp')}
        </a>
        <span>{common('address')}</span>
        <SocialLinks />
      </div>
      <div className="footer-bottom">
        <span>© 2026 ZAIHAI SURFING. Premium water sports equipment supplier.</span>
        <Link href="/contact">Contact</Link>
      </div>
    </footer>
  );
}
