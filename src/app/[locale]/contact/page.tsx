import type {Metadata} from 'next';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import type {Locale} from '@/i18n/routing';
import {localizedMetadata} from '@/lib/metadata';
import {uiCopy} from '@/lib/uiCopy';
import ContactInquiryForm from '@/components/ContactInquiryForm';

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
  const mapSrc = 'https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d738.4079128143358!2d118.8398291714169!3d28.96554554896867!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e1!3m2!1sen!2sus!4v1780549851421!5m2!1sen!2sus';
  const mapUrl = 'https://www.google.com/maps/search/?api=1&query=28.96554554896867,118.8398291714169';
  const trustBlocks = [
    'Reply within 24 hours on business days',
    'Product videos available on request',
    'Distributor pricing available',
    'OEM/ODM support available',
    'Shipping and battery document support'
  ];

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
          <h2>ZAIHAI SURFING</h2>
          <div className="contact-info-card">
            <p><strong>Operated by</strong><span>{company}</span></p>
            <p><strong>{copy.addressLabel}</strong><span>{address}</span></p>
            <p><strong>{copy.emailLabel}</strong><a href="mailto:davidsha@zaihaisurfing.com">davidsha@zaihaisurfing.com</a></p>
            <p><strong>{copy.whatsappLabel}</strong><a className="contact-whatsapp-link" href="https://api.whatsapp.com/send/?phone=8617621485205&text&type=phone_number&app_absent=0" target="_blank" rel="noopener noreferrer">+86 17621485205</a></p>
          </div>
          <div className="contact-trust-grid">
            {trustBlocks.map((item) => <span key={item}>{item}</span>)}
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
            <a className="button primary" href={mapUrl} target="_blank" rel="noopener noreferrer">
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
        <ContactInquiryForm copy={copy} />
      </section>
    </main>
  );
}
