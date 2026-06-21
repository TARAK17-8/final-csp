import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.goto('https://samaramai.web.app', { waitUntil: 'networkidle' });
  
  const hasMain = await page.evaluate(() => !!document.querySelector('main'));
  const hasHero = await page.evaluate(() => !!document.getElementById('hero'));
  const mainHTML = await page.evaluate(() => document.querySelector('main')?.innerHTML.substring(0, 200));
  
  console.log('hasMain:', hasMain);
  console.log('hasHero:', hasHero);
  console.log('mainHTML:', mainHTML);

  await browser.close();
})();
