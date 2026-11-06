import {randomUUID} from 'node:crypto';
import type {Metadata} from 'next';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import type {Locale} from '@/i18n/routing';
import {inquiryReferencePattern, type InquiryFeedback} from '@/lib/contactInquiry';
import {localizedMetadata} from '@/lib/metadata';
import {productSlugs} from '@/lib/site';
import VisualIcon from '@/components/VisualIcon';
import {uiCopy} from '@/lib/uiCopy';
import ContactMap from '@/components/ContactMap';
import ContactInquiryForm from '@/components/ContactInquiryForm';

type ContactPageProps = {
  params: Promise<{locale: Locale}>;
  searchParams: Promise<{product?: string | string[]; inquiry?: string | string[]; ref?: string | string[]}>;
};

export async function generateMetadata({params, searchParams}: ContactPageProps): Promise<Metadata> {
  const [{locale}, {inquiry, ref}] = await Promise.all([params, searchParams]);
  const seo = await getTranslations({locale, namespace: 'seo'});
  const metadata = localizedMetadata(locale, '/contact', seo('contactTitle'), seo('contactDescription'));
  if (inquiry || ref) metadata.robots = {index: false, follow: true};
  return metadata;
}

export default async function ContactPage({params, searchParams}: ContactPageProps) {
  const [{locale}, {product, inquiry, ref}] = await Promise.all([params, searchParams]);
  setRequestLocale(locale);
  const t = await getTranslations({locale, namespace: 'contact'});
  const copy = uiCopy[locale].contactPage;
  const selected = productSlugs.findIndex((slug) => slug === product);
  const selectedProduct = selected >= 0 ? copy.productOptions[selected] : undefined;
  const status = (['received', 'invalid', 'rateLimited', 'retry'] as const).find((value) => value === inquiry);
  const reference = status === 'received' && typeof ref === 'string' && inquiryReferencePattern.test(ref) ? ref : undefined;
  const initialFeedback: {status: InquiryFeedback; reference?: string} | undefined = status ? {status, reference} : undefined;
  const company = copy.company;
  const address = 'Room 110, 1st Floor, Building 2, Qushidai Future Building, Kecheng District, Quzhou, Zhejiang Province, China';
  const mapSrc = `https://maps.google.com/maps?q=28.965204,118.839750&z=17&hl=${locale}&output=embed`;
  const mapUrl = 'https://maps.app.goo.gl/P1YyVHoCdGBd9ef37';

  return (
    <main className="interior-page design-contact">
      <section className="contact-hero design-mast">
        <div>
          <p className="eyebrow">{locale === 'en' ? 'Project inquiry' : copy.formTitle}</p>
          <h1>{locale === 'en' ? 'Let’s plan your project.' : t('h1')}</h1>
          <p>{locale === 'en' ? 'Tell us the models, use case and expected quantity so we can prepare a quote.' : t('intro')}</p>
        </div>
      </section>
      <div className="contact-review-grid">
      <section className="inquiry-section" id="inquiry-form">
        <div className="section-heading">
          <h2>{locale === 'en' ? 'Send your requirements' : copy.formTitle}</h2>
        </div>
        <ContactInquiryForm copy={copy} locale={locale} submissionKey={randomUUID()} productSlug={productSlugs[selected]} selectedProduct={selectedProduct} initialFeedback={initialFeedback} />
      </section>
      <section className="map-section">
        <div className="map-copy">
          <h2>{t('directContact')}</h2>
          <p>{t('deliveryPrompt')}</p>
          <div className="contact-info-card">
            <p><strong>{copy.emailLabel}</strong><a href="mailto:info@zaihaisurfing.com">info@zaihaisurfing.com</a></p>
            <p><strong><VisualIcon name="chat" size={15} /> {copy.whatsappLabel}</strong><a className="contact-whatsapp-link" data-whatsapp-placement="contact_page" href="https://api.whatsapp.com/send/?phone=8617621485205&text&type=phone_number&app_absent=0" target="_blank" rel="noopener noreferrer">+86 17621485205</a></p>
          </div>
        </div>
        <ContactMap src={mapSrc} url={mapUrl} label={t('viewMap')} address={address} company={company} />
      </section>
      </div>
    </main>
  );
}
