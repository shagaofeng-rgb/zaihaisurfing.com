import type {Metadata} from 'next';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import type {Locale} from '@/i18n/routing';
import {localizedMetadata} from '@/lib/metadata';
import {uiCopy} from '@/lib/uiCopy';

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
  const copy = uiCopy[locale].contactPage;
  const company = copy.company;
  const address = 'Room 110, 1st Floor, Building 2, Qushidai Future Building, Kecheng District, Quzhou, Zhejiang Province, China';
  const query = encodeURIComponent(address);
  const mapSrc = `https://www.google.com/maps?q=${query}&output=embed`;

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
          <p className="eyebrow">{copy.region}</p>
          <h2>{company}</h2>
          <div className="contact-info-card">
            <p><strong>{copy.addressLabel}</strong><span>{address}</span></p>
            <p><strong>{copy.emailLabel}</strong><a href="mailto:davidsha@zaihaisurfing.com">davidsha@zaihaisurfing.com</a></p>
            <p><strong>{copy.whatsappLabel}</strong><a className="contact-whatsapp-link" href="https://api.whatsapp.com/send/?phone=8617621485205&text&type=phone_number&app_absent=0" target="_blank" rel="noopener noreferrer">+86 17621485205</a></p>
          </div>
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
          <h2>{copy.formTitle}</h2>
          <p>{copy.formText}</p>
        </div>
        <form className="inquiry-form" action="mailto:davidsha@zaihaisurfing.com" method="post" encType="text/plain">
          <label>
            <span>{copy.fields.name}</span>
            <input name="name" required placeholder="Your name" autoComplete="name" />
          </label>
          <label>
            <span>{copy.fields.email}</span>
            <input name="email" required type="email" placeholder="name@company.com" autoComplete="email" />
          </label>
          <label>
            <span>{copy.fields.phone}</span>
            <input name="phone" required type="tel" placeholder="+1 555 000 0000" autoComplete="tel" />
          </label>
          <label>
            <span>{copy.fields.company}</span>
            <input name="company" placeholder="Company name" autoComplete="organization" />
          </label>
          <label>
            <span>{copy.fields.country}</span>
            <input name="country" required placeholder="UAE, United States, Spain..." autoComplete="country-name" />
          </label>
          <label>
            <span>{copy.fields.buyerType}</span>
            <select name="buyerType" required defaultValue="">
              <option value="" disabled>Select buyer type</option>
              {copy.buyerTypes.map((item) => <option value={item} key={item}>{item}</option>)}
            </select>
          </label>
          <label>
            <span>{copy.fields.product}</span>
            <select name="product" required defaultValue="">
              <option value="" disabled>Select product</option>
              {copy.productOptions.map((item) => <option value={item} key={item}>{item}</option>)}
            </select>
          </label>
          <label>
            <span>{copy.fields.quantity}</span>
            <input name="quantity" placeholder="1 sample / 5 units / 20 units..." />
          </label>
          <label>
            <span>{copy.fields.market}</span>
            <input name="targetMarket" placeholder="GCC, USA, Europe, island resort..." />
          </label>
          <label className="full">
            <span>{copy.fields.message}</span>
            <textarea name="message" required rows={5} placeholder="Quantity, application scenario, shipment plan, branding needs..." />
          </label>
          <button className="button primary" type="submit">
            {copy.fields.submit}
          </button>
        </form>
      </section>
    </main>
  );
}
