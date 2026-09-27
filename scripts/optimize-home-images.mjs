import {createRequire} from 'node:module';
import {mkdir} from 'node:fs/promises';
const require = createRequire(import.meta.url);
const sharp = require(require.resolve('sharp', {paths: [require.resolve('next/package.json')]}));
const output = 'public/assets/home-fast-v1';
await mkdir(output, {recursive: true});
const images = [
  ['hero-mobile', 'resort-hero-mobile.webp', [480, 720, 941]],
  ['hero-desktop', 'resort-hero.webp', [1280, 1920]],
  ['electric', 'resort-electric.webp', [480, 800]],
  ['kart', 'resort-kart.webp', [480, 800]],
  ['fuel', 'resort-fuel.webp', [480, 800]],
  ['featured', 'hero-template-one-desktop.webp', [640, 1024]]
];
for (const [name, source, widths] of images) {
  for (const width of widths) {
    const input = sharp(`public/assets/home-ocean/${source}`).resize({width, withoutEnlargement: true});
    await input.clone().webp({quality: 82}).toFile(`${output}/${name}-${width}.webp`);
    await input.clone().avif({quality: 60, effort: 6}).toFile(`${output}/${name}-${width}.avif`);
  }
}
await sharp('public/assets/brand-logo.png').resize({width: 240}).webp({lossless: true}).toFile(`${output}/brand.webp`);
