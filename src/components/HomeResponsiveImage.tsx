type HomeResponsiveImageProps = {
  name: string;
  widths: number[];
  sizes: string;
  width: number;
  height: number;
  alt?: string;
  priority?: boolean;
  avif?: boolean;
};

export default function HomeResponsiveImage({name, widths, sizes, width, height, alt = '', priority = false, avif = false}: HomeResponsiveImageProps) {
  const path = (size: number, format: 'webp' | 'avif' = 'webp') => `/assets/home-operations/${name}-${size}.${format}`;
  const srcSet = (format: 'webp' | 'avif') => widths.map((size) => `${path(size, format)} ${size}w`).join(', ');

  const img = (
    <img
      src={path(widths[0])}
      srcSet={srcSet('webp')}
      sizes={sizes}
      width={width}
      height={height}
      alt={alt}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : undefined}
      decoding="async"
    />
  );

  return avif ? (
    <picture>
      <source type="image/avif" srcSet={srcSet('avif')} sizes={sizes} />
      {img}
    </picture>
  ) : img;
}
