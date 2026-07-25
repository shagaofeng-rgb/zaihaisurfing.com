import type {MetadataRoute} from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'ZAIHAI SURFING',
    short_name: 'ZAIHAI',
    description: 'Premium electric surfboards and water sports equipment for resorts, rentals and distributors.',
    start_url: '/en',
    display: 'standalone',
    background_color: '#f6f7f7',
    theme_color: '#0d1014',
    icons: [
      {
        src: '/assets/brand-mark.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: '/assets/brand-mark.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable'
      }
    ]
  };
}
