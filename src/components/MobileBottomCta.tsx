import {Link} from '@/i18n/navigation';
import type {Locale} from '@/i18n/routing';
import {uiCopy} from '@/lib/uiCopy';

export default function MobileBottomCta({locale}: {locale: Locale}) {
  const copy = uiCopy[locale].mobileCta;

  return (
    <nav className="mobile-bottom-cta" aria-label="Quick contact actions">
      <a data-whatsapp-placement="mobile_bottom_cta" href="https://api.whatsapp.com/send/?phone=8617621485205&text&type=phone_number&app_absent=0" target="_blank" rel="noopener noreferrer">
        {copy.whatsapp}
      </a>
      <Link href="/contact">{copy.quote}</Link>
    </nav>
  );
}
