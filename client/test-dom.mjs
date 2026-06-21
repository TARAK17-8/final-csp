import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.goto('https://samaramai.web.app', { waitUntil: 'networkidle' });
  
  const rootHTML = await page.evaluate(() => document.getElementById('root')?.innerHTML);
  console.log('Root HTML length:', rootHTML?.length);
  console.log('Root HTML snippet:', rootHTML?.substring(0, 200));

  await browser.close();
})();
