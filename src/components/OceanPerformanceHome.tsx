import {ArrowRightIcon} from '@phosphor-icons/react/dist/ssr';
import {getTranslations} from 'next-intl/server';
import {Link} from '@/i18n/navigation';
import type {Locale} from '@/i18n/routing';
import HomeRidingVideo from './HomeRidingVideo';
import HomeResponsiveImage from './HomeResponsiveImage';

const operations = [
  {name: 'resorts', description: 'resortsText', href: '/applications#resorts-hotels'},
  {name: 'rentals', description: 'rentalsText', href: '/applications#rental-businesses'},
  {name: 'distributors', description: 'distributorsText', href: '/factory#oem-distributor'}
] as const;

const equipment = [
  {name: 'electric', label: 'electricTitle', description: 'electricText', href: '/products/x1-pro'},
  {name: 'kart', label: 'kartTitle', description: 'kartText', href: '/products/rage-shark-x'},
  {name: 'fuel', label: 'fuelTitle', description: 'fuelText', href: '/products/p1-pro'}
] as const;

export default async function OceanPerformanceHome({locale}: {locale: Locale}) {
  const t = await getTranslations({locale, namespace: 'homeOperations'});

  return (
    <main className="operations-home" id="top">
      <section className="operations-hero" aria-labelledby="operations-title">
        <div className="operations-hero-copy operations-container">
          <h1 id="operations-title">{t.rich('title', {line: (chunks) => <span>{chunks}</span>})}</h1>
          <p>{t('intro')}</p>
          <div className="operations-hero-actions">
            <Link className="operations-button" href="/contact">
              {t('projectButton')} <ArrowRightIcon size={18} aria-hidden="true" />
            </Link>
            <HomeRidingVideo labels={{
              watch: t('video.watch'),
              title: t('video.title'),
              close: t('video.close'),
              loading: t('video.loading'),
              error: t('video.error'),
              open: t('video.open')
            }} />
          </div>
        </div>
        <div className="operations-hero-photo">
          <HomeResponsiveImage
            name="marina"
            alt={t('heroAlt')}
            widths={[640, 1024, 1536]}
            sizes="(max-width: 760px) 100vw, 64vw"
            width={1536}
            height={1024}
            priority
            avif
          />
        </div>
      </section>

      <section className="operations-scenarios" aria-labelledby="operation-heading">
        <div className="operations-container">
          <h2 id="operation-heading">{t('operationHeading')}</h2>
        </div>
        <ul className="operations-scenario-grid">
          {operations.map((operation) => (
            <li key={operation.name}>
              <Link className="operations-scenario-card" href={operation.href} prefetch={false}>
                <div className="operations-scenario-photo">
                  <HomeResponsiveImage
                    name={operation.name}
                    widths={[480, 768]}
                    sizes="(max-width: 760px) 92vw, 32vw"
                    width={768}
                    height={512}
                  />
                </div>
                <div className="operations-scenario-copy">
                  <h3>{t(operation.name)} <ArrowRightIcon size={22} aria-hidden="true" /></h3>
                  <p>{t(operation.description)}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="operations-equipment" aria-labelledby="equipment-heading">
        <div className="operations-container">
          <h2 id="equipment-heading">{t('equipmentHeading')}</h2>
          <ul className="operations-equipment-grid">
            {equipment.map((item) => (
              <li key={item.name}>
                <Link className="operations-equipment-card" href={item.href} prefetch={false}>
                  <div className={`operations-equipment-photo operations-equipment-photo--${item.name}`}>
                    <HomeResponsiveImage
                      name={item.name}
                      widths={[360, 720]}
                      sizes="(max-width: 760px) 36vw, 31vw"
                      width={720}
                      height={item.name === 'electric' ? 1296 : 480}
                    />
                  </div>
                  <div className="operations-equipment-copy">
                    <h3>{t(item.label)} <ArrowRightIcon size={19} aria-hidden="true" /></h3>
                    <p>{t(item.description)}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="operations-quote" aria-labelledby="operations-quote-heading">
        <div className="operations-wave">
          <HomeResponsiveImage name="wave" widths={[768, 1536]} sizes="100vw" width={1536} height={1024} />
        </div>
        <div className="operations-container operations-quote-copy">
          <h2 id="operations-quote-heading">{t('quoteHeading')}</h2>
          <p>{t('quoteText')}</p>
          <Link className="operations-button" href="/contact">
            {t('quoteButton')} <ArrowRightIcon size={18} aria-hidden="true" />
          </Link>
        </div>
      </section>
    </main>
  );
}
