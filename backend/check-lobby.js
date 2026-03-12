const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => {
    if (msg.type() === 'error' || msg.text().includes('React') || msg.text().includes('TypeError')) {
      console.log('BROWSER CONSOLE:', msg.text());
    }
  });

  page.on('pageerror', error => {
    console.log('BROWSER PAGE ERROR:', error.message);
  });

  try {
    console.log("Navigating to student contests...");
    
    // We can't actually log in easily without auth state... 
    // Wait, the user already said "if I enter the contest or lobby".
    // I will write a simple test to fetch the contests API endpoint directly to see if data is missing.
    const res = await fetch("http://localhost:5000/contests", {
      headers: { "Authorization": "Bearer fake_token_wont_work_without_db" }
    }).catch(e => e.message);
    console.log("Fetch without auth:", res);
    
  } catch (err) {}
  
  await browser.close();
})();
