const puppeteer = require('puppeteer');

(async () => {
  console.log("Launching browser...");
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => {
    // ignore warnings
    if (msg.type() === 'error' || msg.text().includes('Error') || msg.text().includes('Exception')) {
      console.log('BROWSER CONSOLE:', msg.type(), msg.text());
    }
  });

  page.on('pageerror', error => {
    console.log('BROWSER PAGE ERROR:', error.message);
  });

  page.on('requestfailed', request => {
    console.log('BROWSER NETWORK ERROR:', request.url(), request.failure().errorText);
  });

  try {
    console.log("Navigating to frontend...");
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle0', timeout: 10000 });
    console.log("Page loaded. Waiting 3 seconds for React to render...");
    await new Promise(resolve => setTimeout(resolve, 3000));
  } catch (err) {
    console.error("Navigation failed:", err.message);
  } finally {
    await browser.close();
    console.log("Done checking.");
  }
})();
