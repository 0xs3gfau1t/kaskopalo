import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ headless: "new", args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
  page.on('pageerror', error => console.log('BROWSER ERROR:', error.message));
  page.on('requestfailed', request => console.log('BROWSER REQUEST FAILED:', request.url(), request.failure()?.errorText));

  try {
    console.log('Navigating to app...');
    await page.goto('http://localhost:5173');
    
    console.log('Waiting for load...');
    await page.waitForFunction(() => document.body.innerText.includes('Log In'));

    console.log('Clicking register...');
    const registerLink = await page.evaluateHandle(() => {
      return Array.from(document.querySelectorAll('a')).find(a => a.textContent.includes('Register'));
    });
    await registerLink.click();
    
    console.log('Registering user...');
    await page.waitForFunction(() => document.body.innerText.includes('Create an Account'));
    const randomEmail = `test${Date.now()}@example.com`;
    
    // Fill out form
    const inputs = await page.$$('input');
    await inputs[0].type('Alice Tester');
    await inputs[1].type(randomEmail);
    await inputs[2].type('password123');
    
    const submitBtn = await page.evaluateHandle(() => {
      return Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Register'));
    });
    await submitBtn.click();
    
    console.log('Waiting for household setup...');
    await page.waitForFunction(() => document.body.innerText.includes('Create Flat'), { timeout: 15000 });
    
    console.log('Creating household...');
    const flatInput = await page.$('input[type="text"]');
    await flatInput.type('Test Flat');
    const flatBtn = await page.evaluateHandle(() => {
      return Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Create Household'));
    });
    await flatBtn.click();
    
    console.log('Waiting for dashboard...');
    await page.waitForFunction(() => document.body.innerText.includes('Whose turn is it?'), { timeout: 15000 });
    
    console.log('Adding a chore...');
    const choresLink = await page.evaluateHandle(() => {
      return Array.from(document.querySelectorAll('a')).find(a => a.textContent.includes('Chores'));
    });
    await choresLink.click();
    
    await page.waitForFunction(() => document.body.innerText.includes('Save'), { timeout: 10000 });
    const choreInput = await page.$('input[type="text"]');
    await choreInput.type('Take out Trash');
    const addChoreBtn = await page.evaluateHandle(() => {
      return Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Save'));
    });
    await addChoreBtn.click();
    
    await page.waitForFunction(() => document.body.innerText.includes('Take out Trash'));
    
    console.log('Checking Turn Engine...');
    const turnsLink = await page.evaluateHandle(() => {
      return Array.from(document.querySelectorAll('a')).find(a => a.textContent.includes('Turns'));
    });
    await turnsLink.click();
    
    await page.waitForFunction(() => document.body.innerText.toUpperCase().includes('CURRENT TURN'), { timeout: 10000 });
    
    console.log('Integration test passed successfully!');
  } catch (error) {
    console.error('Test failed:', error);
    await page.screenshot({ path: 'screenshot.png' });
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
})();
