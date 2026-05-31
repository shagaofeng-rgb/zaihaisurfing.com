import {getTranslations} from 'next-intl/server';
import type {Locale} from '@/i18n/routing';
import SocialLinks from './SocialLinks';

export default async function Footer({locale}: {locale: Locale}) {
  const common = await getTranslations({locale, namespace: 'common'});

  return (
    <footer className="site-footer">
      <div>
        <strong>{common('brand')}</strong>
        <p>{common('footer')}</p>
        <p>
          {common('email')} · {common('whatsapp')} · {common('address')}
        </p>
      </div>
      <div className="footer-actions">
        <SocialLinks />
        <a href="#top">Back to top</a>
      </div>
    </footer>
  );
}
