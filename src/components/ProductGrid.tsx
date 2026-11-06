import Image from 'next/image';
import {getTranslations} from 'next-intl/server';
import {Link} from '@/i18n/navigation';
import CatalogFilters from '@/components/CatalogFilters';
import {fastCatalogImage} from '@/lib/catalogImages';
import type {Locale} from '@/i18n/routing';
import {productDetailedSpecs, productSlugs, type ProductSlug} from '@/lib/site';
import {listRuntimeCatalogProducts} from '@/lib/catalogRuntime';
import {productPresentation, seriesFields} from '@/lib/productPresentation';

export default async function ProductGrid({locale}: {locale: Locale}) {
  const [names, alt, products] = await Promise.all([
    getTranslations({locale, namespace: 'productNames'}),
    getTranslations({locale, namespace: 'alt'}),
    listRuntimeCatalogProducts(productSlugs)
  ]);

  const title = (slug: ProductSlug) => locale === 'en' ? productPresentation[slug].short : names(slug);
  const comparison = (series: 'electric' | 'fuel') => {
    const models = productSlugs.filter((slug) => productPresentation[slug].category === series && products.some((product) => product.slug === slug));
    if (models.length < 2) return null;
    return <div className="catalog-pair">{models.map((slug) => <article key={slug}>
      <h3>{title(slug)}</h3>
      <dl>{seriesFields[series].map(([label, key]) => <div key={key}>
        <dt>{label}</dt><dd>{productDetailedSpecs[slug].find((row) => row.label === key)?.value || '—'}</dd>
      </div>)}</dl>
      <Link href={`/products/${slug}`}>View model →</Link>
    </article>)}</div>;
  };

  return (
    <>
    <h2 className="catalog-model-heading">{products.length === 5 ? 'Explore all five models' : 'Explore available models'}</h2>
    <CatalogFilters electric={comparison('electric')} fuel={comparison('fuel')}>
      <div className="catalog-product-grid">
        {products.map((product) => {
          const slug = product.slug as ProductSlug;
          const model = productPresentation[slug];
          const fastImage = fastCatalogImage(product.image);
          const sizes = '(max-width: 760px) 44vw, (max-width: 1100px) 46vw, 32vw';
          return <article className="catalog-product-card" id={`quick-${slug}`} data-product-type={model.category} key={slug}>
            <Link className="catalog-image-wrap" href={`/products/${slug}`} aria-label={title(slug)}>
              {fastImage ? <img {...fastImage} alt={alt(slug)} sizes={sizes} className="catalog-fast-photo" loading="lazy" />
                : <Image src={product.image} unoptimized={!product.image.startsWith('/') || product.image.startsWith('//')} alt={alt(slug)} fill sizes={sizes} />}
            </Link>
            <div>
              <p className="eyebrow">{model.type}</p>
              <h3><Link href={`/products/${slug}`}>{title(slug)}</Link></h3>
              <p className="catalog-use">{model.use.slice(0, 2).join(' · ')}</p>
              <ul className="catalog-model-specs">{model.key.slice(0, 3).map(([, label, value]) => <li key={label} title={label}>{value}</li>)}</ul>
              <div className="catalog-model-footer"><strong>{product.price}</strong><Link href={`/products/${slug}`}>View model →</Link></div>
            </div>
          </article>;
        })}
        {!products.length ? <p className="catalog-no-models">No models are currently available. Contact us to discuss your project.</p> : null}
      </div>
    </CatalogFilters>
    </>
  );
}
