const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  let hasError = false;
  page.on('console', msg => {
    if (msg.type() === 'error' && msg.text().includes('React')) {
      console.log('REACT ERROR:', msg.text());
      hasError = true;
    }
  });
  page.on('pageerror', error => {
    console.log('PAGE ERROR:', error.message);
    hasError = true;
  });

  try {
    console.log("Navigating to login...");
    await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle0' });
    
    // Check if we can just bypass login using localStorage (fake token)
    // Or we just navigate to the pages and see if React crashes before redirect
    const routes = [
      '/trainer/rooms',
      '/trainer/rooms/new',
      '/trainer/leaderboard',
      '/student/rooms',
      '/student/leaderboard'
    ];
    
    for (const route of routes) {
      console.log(`Checking ${route}...`);
      await page.goto(`http://localhost:5173${route}`, { waitUntil: 'domcontentloaded' });
      await new Promise(r => setTimeout(r, 1000));
    }
    
  } catch (err) {
    console.error("Test failed:", err.message);
  } finally {
    await browser.close();
    console.log("Done checking.", hasError ? "FOUND ERRORS" : "NO ERRORS FOUND");
  }
})();
