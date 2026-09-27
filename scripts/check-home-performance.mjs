import {createRequire} from 'node:module';
import {mkdir} from 'node:fs/promises';
const require = createRequire(import.meta.url);
const {chromium} = require('playwright');
const browser = await chromium.launch({headless: true});
await mkdir('/tmp/zaihai-home-qa', {recursive: true});
for (const width of [390, 1440]) {
  const page = await browser.newPage({viewport: {width, height: 900}, deviceScaleFactor: width === 390 ? 2 : 1});
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(process.env.QA_URL || 'http://localhost:3199/en', {waitUntil: 'networkidle'});
  await page.screenshot({path: `/tmp/zaihai-home-qa/${width}.png`, fullPage: true});
  const result = await page.evaluate(() => ({
    overflow: document.documentElement.scrollWidth > innerWidth,
    hero: document.querySelector('.resort-hero-picture img')?.currentSrc,
    images: [...document.images].filter(i => i.loading !== 'lazy').map(i => ({src: i.currentSrc, loaded: i.complete && i.naturalWidth > 0})),
    preloads: [...document.querySelectorAll('link[rel="preload"][as="image"]')].map(i => i.getAttribute('href') || i.getAttribute('imagesrcset'))
  }));
  await page.getByRole('button', {name:'Watch riding video'}).click();
  await page.getByRole('dialog').waitFor();
  await page.getByRole('button', {name:'Close', exact:true}).click();
  if(width === 1440) { await page.getByRole('button', {name:'Products',exact:true}).hover(); }
  console.log(JSON.stringify({width, ...result, errors}));
  if(result.overflow || errors.length || result.images.some(i=>!i.loaded)) process.exitCode = 1;
  await page.close();
}
await browser.close();
