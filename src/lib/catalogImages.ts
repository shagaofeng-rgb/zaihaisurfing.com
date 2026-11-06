const fastDirectory = '/assets/catalog/fast-v1';

const originals: Record<string, string> = {
  '/assets/catalog/x1/hero-angle.png': 'x1',
  '/assets/catalog/x1-pro/hero-angle.png': 'x1-pro',
  '/assets/catalog/rage-shark-x/hero-angle.png': 'rage-shark-x',
  '/assets/catalog/p1/hero-angle.png': 'p1',
  '/assets/catalog/p1-pro/product.png': 'p1-pro'
};

export function fastCatalogImage(source: string) {
  if (!Object.hasOwn(originals, source)) return undefined;
  const slug = originals[source];
  return {
    src: `${fastDirectory}/${slug}-540.webp`,
    srcSet: `${fastDirectory}/${slug}-540.webp 540w, ${fastDirectory}/${slug}-960.webp 960w`
  };
}
