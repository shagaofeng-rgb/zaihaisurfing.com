import type {Metadata} from 'next';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import type {Locale} from '@/i18n/routing';
import {localizedMetadata} from '@/lib/metadata';

export async function generateMetadata({params}: {params: Promise<{locale: Locale}>}): Promise<Metadata> {
  const {locale} = await params;
  const seo = await getTranslations({locale, namespace: 'seo'});
  return localizedMetadata(locale, '/contact', seo('contactTitle'), seo('contactDescription'));
}

export default async function ContactPage({params}: {params: Promise<{locale: Locale}>}) {
  const {locale} = await params;
  setRequestLocale(locale);
  const t = await getTranslations({locale, namespace: 'contact'});
  const common = await getTranslations({locale, namespace: 'common'});
  const address =
    'Room 110, 1st Floor, Building 1, Qushidai Future Building, Kecheng District, Quzhou, Zhejiang Province, China';
  const query = encodeURIComponent(address);
  const mapSrc =
    'https://www.google.com/maps/embed?pb=!1m16!1m12!1m3!1d1037.8381299189082!2d118.84405914474489!3d28.96195222141102!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!2m1!1sRoom%20110%2C%201st%20Floor%2C%20Building%201%2C%20Qushidai%20Future%20Building%2C%20Kecheng%20District%2C%20Quzhou%2C%20Zhejiang%20Province%2C%20China!5e0!3m2!1sen!2sus!4v1780204792478!5m2!1sen!2sus';

  return (
    <main>
      <section className="contact-hero">
        <div>
          <p className="eyebrow">{common('requestQuote')}</p>
          <h1>{t('h1')}</h1>
          <p>{t('intro')}</p>
        </div>
      </section>
      <section className="map-section">
        <div className="map-copy">
          <p className="eyebrow">{common('address')}</p>
          <h2>{t('mapTitle')}</h2>
          <p>
            {common('email')} · {common('whatsapp')}
          </p>
        </div>
        <div className="map-card">
          <div className="map-frame-wrap">
            <iframe
              title="ZAIHAI SURFING location"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
              src={mapSrc}
            />
          </div>
          <div className="map-actions">
            <a className="button primary" href={`https://www.google.com/maps/search/?api=1&query=${query}`} target="_blank" rel="noopener noreferrer">
              {t('viewMap')}
            </a>
          </div>
        </div>
      </section>
      <section className="inquiry-section">
        <div className="section-heading">
          <p className="eyebrow">{common('requestQuote')}</p>
          <h2>Send your product requirements</h2>
          <p>Tell us your project type, target market and preferred product line. We will reply with model suggestions and quotation details.</p>
        </div>
        <form className="inquiry-form" action={`mailto:davidsha@zaihaisurfing.com`} method="post" encType="text/plain">
          <label>
            <span>Name *</span>
            <input name="name" required placeholder="Your name" autoComplete="name" />
          </label>
          <label>
            <span>Email *</span>
            <input name="email" required type="email" placeholder="name@company.com" autoComplete="email" />
          </label>
          <label>
            <span>Phone / WhatsApp *</span>
            <input name="phone" required type="tel" placeholder="+1 555 000 0000" autoComplete="tel" />
          </label>
          <label>
            <span>Company</span>
            <input name="company" placeholder="Company name" autoComplete="organization" />
          </label>
          <label>
            <span>Country / Region</span>
            <input name="country" placeholder="UAE, United States, Spain..." autoComplete="country-name" />
          </label>
          <label>
            <span>Product Requirement</span>
            <input name="product" placeholder="Electric surfboard, water kart, OEM/ODM..." />
          </label>
          <label className="full">
            <span>Message</span>
            <textarea name="message" rows={5} placeholder="Quantity, application scenario, shipment plan, branding needs..." />
          </label>
          <button className="button primary" type="submit">
            Send Inquiry
          </button>
        </form>
      </section>
    </main>
  );
}
