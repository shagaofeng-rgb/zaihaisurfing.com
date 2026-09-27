import {createRequire} from 'node:module';
const {chromium} = createRequire(import.meta.url)('playwright');
const browser = await chromium.launch({headless:true});
for (const url of process.argv.slice(2)) {
  for (let run=1;run<=3;run++) {
    const context = await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true});
    const page=await context.newPage();
    const cdp=await context.newCDPSession(page);
    await cdp.send('Network.enable');
    await cdp.send('Network.emulateNetworkConditions',{offline:false,latency:150,downloadThroughput:200000,uploadThroughput:93750});
    await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});
    await page.addInitScript(()=>{window.__lcp=0;new PerformanceObserver(list=>{window.__lcp=list.getEntries().at(-1).startTime;}).observe({type:'largest-contentful-paint',buffered:true});});
    await page.goto(url,{waitUntil:'load',timeout:60000});
    await page.waitForTimeout(4000);
    console.log(JSON.stringify({url,run,...await page.evaluate(()=>({lcp:Math.round(window.__lcp),imageBytes:performance.getEntriesByType('resource').filter(r=>/\.(avif|webp|png|jpg)/.test(r.name)).reduce((n,r)=>n+r.encodedBodySize,0),hero:document.querySelector('.resort-hero-picture img').currentSrc}))}));
    await context.close();
  }
}
await browser.close();
