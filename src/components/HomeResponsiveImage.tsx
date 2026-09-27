export default function HomeResponsiveImage({name, alt, sizes, widths = [480, 800], width = 1448, height = 1086}: {name: string; alt: string; sizes: string; widths?: number[]; width?: number; height?: number}) {
  const srcSet = (format: string) => widths.map((size) => `/assets/home-fast-v1/${name}-${size}.${format} ${size}w`).join(', ');
  return <picture>
    <source type="image/avif" srcSet={srcSet('avif')} sizes={sizes} />
    <img src={`/assets/home-fast-v1/${name}-${widths[0]}.webp`} srcSet={srcSet('webp')} sizes={sizes} alt={alt} width={width} height={height} loading="lazy" decoding="async" />
  </picture>;
}
