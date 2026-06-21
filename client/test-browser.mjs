import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => {
    console.log(`[Browser Console] ${msg.type()}: ${msg.text()}`);
  });
  
  page.on('pageerror', error => {
    console.log(`[Browser Error] ${error.message}`);
  });

  page.on('response', response => {
    if (response.status() >= 400) {
      console.log(`[Network Error] ${response.status()} ${response.url()}`);
    }
  });

  console.log('Navigating to https://samaramai.web.app ...');
  await page.goto('https://samaramai.web.app', { waitUntil: 'networkidle' });
  
  await browser.close();
})();
