// --- DYNAMIC ENVIRONMENT ROUTING ---
const isProduction = process.env.NODE_ENV === 'production';

let puppeteer;
let chromium;

if (isProduction) {
    // Load the Cloud-Ready Engine
    puppeteer = require('puppeteer-core');
    chromium = require('@sparticuz/chromium');
} else {
    // Load the Local Visual Engine
    puppeteer = require('puppeteer');
}

// --- AMAZON MULTI-SCRAPER ---
async function scrapeAmazon(browser, searchQuery) {
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    const url = `https://www.amazon.in/s?k=${searchQuery.split(' ').join('+')}`;
    
    console.log(`[Amazon] Searching for multiple deals...`);
    try {
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await page.waitForSelector('.s-result-item', { timeout: 5000 });

        const data = await page.evaluate((searchUrl) => {
            const elements = Array.from(document.querySelectorAll('.s-result-item[data-component-type="s-search-result"]'));
            let results = [];
            
            for (let el of elements) {
                if (results.length >= 15) break; 
                
                const titleEl = el.querySelector('h2');
                const priceEl = el.querySelector('.a-price-whole');
                const linkEl = el.querySelector('h2 a'); 
                
                if (titleEl && priceEl) {
                    results.push({
                        title: titleEl.innerText.trim(),
                        price: "₹" + priceEl.innerText.trim(),
                        store: "Amazon",
                        link: linkEl ? "https://www.amazon.in" + linkEl.getAttribute('href') : searchUrl
                    });
                }
            }
            return results;
        }, url);
        
        await page.close();
        return data || [];
    } catch (error) {
        console.log("[Amazon] Scraping failed or blocked.");
        await page.close();
        return [];
    }
}

// --- FLIPKART MULTI-SCRAPER ---
async function scrapeFlipkart(browser, searchQuery) {
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    const url = `https://www.flipkart.com/search?q=${searchQuery.split(' ').join('%20')}`;
    
    console.log(`[Flipkart] Searching for multiple deals...`);
    try {
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await page.waitForSelector('div[data-id]', { timeout: 5000 });

        const data = await page.evaluate((searchUrl) => {
            const elements = Array.from(document.querySelectorAll('div[data-id]'));
            let results = [];
            
            for (let el of elements) {
                if (results.length >= 15) break; 
                
                const titleEl = el.querySelector('div[class*="title"], img');
                const rawPriceEl = Array.from(el.querySelectorAll('div')).find(d => d.innerText.startsWith('₹'));
                const linkEl = el.querySelector('a'); 
                
                if (titleEl && rawPriceEl) {
                    const priceMatch = rawPriceEl.innerText.match(/₹[0-9,]+/);
                    if (priceMatch) {
                        results.push({
                            title: (titleEl.innerText || titleEl.alt).trim(),
                            price: priceMatch[0],
                            store: "Flipkart",
                            link: linkEl ? "https://www.flipkart.com" + linkEl.getAttribute('href') : searchUrl
                        });
                    }
                }
            }
            return results;
        }, url);
        
        await page.close();
        return data || [];
    } catch (error) {
        console.log("[Flipkart] Scraping failed or blocked.");
        await page.close();
        return [];
    }
}

// --- BLINKIT MULTI-SCRAPER  ---
async function scrapeBlinkit(browser, searchQuery, userPincode) {
    console.log(`[Blinkit] Hacking the location popup for Pincode: ${userPincode}...`);
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    try {
        await page.goto('https://blinkit.com/', { waitUntil: 'domcontentloaded', timeout: 20000 });
        try {
            console.log(`[Blinkit] Checking for 'App Download' ad...`);
            await page.waitForFunction(() => {
                const elements = Array.from(document.querySelectorAll('button, a, span, div'));
                const continueBtn = elements.find(el => el.innerText && el.innerText.toLowerCase().includes('continue on web'));
                if (continueBtn) {
                    continueBtn.click();
                    return true;
                }
                return false;
            }, { timeout: 3000 });
            console.log(`[Blinkit] 💥 Dismissed the 'App Download' ad!`);
            await new Promise(resolve => setTimeout(resolve, 1000)); // 
        } catch (err) {
        }
        const locationInputSelector = 'input[placeholder*="location"], input[placeholder*="area"], input[placeholder*="address"]';
        
        try {
            await page.waitForSelector(locationInputSelector, { timeout: 8000 });
            console.log(`[Blinkit] 🎯 Location box found! Injecting pincode: ${userPincode}`);
            await page.type(locationInputSelector, userPincode || '110001', { delay: 100 });
            await new Promise(resolve => setTimeout(resolve, 2000));
            await page.keyboard.press('ArrowDown');
            await page.keyboard.press('Enter');
            console.log(`[Blinkit] 🔓 Location successfully bypassed!`);
            await new Promise(resolve => setTimeout(resolve, 3000));
        } catch (err) {
            console.log(`[Blinkit] No location popup appeared. Proceeding to search...`);
        }
        const searchUrl = `https://blinkit.com/s/?q=${encodeURIComponent(searchQuery)}`;
        await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });
        await new Promise(resolve => setTimeout(resolve, 3000));
        const data = await page.evaluate(() => {
            const results = [];
            const productElements = document.querySelectorAll('a[data-test-id="plp-product"]'); 
            
            productElements.forEach(el => {
                if (results.length >= 15) return; 
                const titleEl = el.querySelector('div[class*="Product__ProductName"]');
                const priceEl = el.querySelector('div[class*="Product__Price"]');
                
                if (titleEl && priceEl) {
                    results.push({
                        title: titleEl.innerText.trim(),
                        price: priceEl.innerText.trim(),
                        store: "Blinkit",
                        link: "https://blinkit.com" + el.getAttribute('href')
                    });
                }
            });
            return results;
        });

        if (data.length === 0) console.log(`[Blinkit] ❌ No products found.`);
        else console.log(`[Blinkit] ✅ Found ${data.length} items!`);
        
        await page.close();
        return data || [];

    } catch (error) {
        console.log(`[Blinkit] Scraper failed or timed out.`);
        await page.close();
        return []; 
    }
}

// --- MASTER FUNCTION ---
async function scrapeRealData(searchQuery, userPincode) {
    console.log(`🚀 Starting Multi-Scraper for: ${searchQuery} in Pincode: ${userPincode}`);
    
    let browser;
    if (isProduction) {
        console.log("☁️ Launching Serverless Cloud Browser...");
        browser = await puppeteer.launch({
            args: chromium.args,
            defaultViewport: chromium.defaultViewport,
            executablePath: await chromium.executablePath(),
            headless: chromium.headless,
            ignoreHTTPSErrors: true,
        });
    } else {
        console.log("💻 Launching Local Visual Browser...");
        browser = await puppeteer.launch({ 
            headless: false,
            args: [
                '--no-sandbox', 
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage'
            ] 
        });
    }
    
    // 1. ALL ENGINES RUNNING IN PARALLEL
    const [amazonData, flipkartData, blinkitData] = await Promise.all([
        scrapeAmazon(browser, searchQuery),
        scrapeFlipkart(browser, searchQuery),
        scrapeBlinkit(browser, searchQuery, userPincode)
    ]);

    await new Promise(resolve => setTimeout(resolve, 2000));
    await browser.close();
    
    // 2. COMBINE DATA
    const rawData = [...amazonData, ...flipkartData, ...blinkitData]; 

    const junkWords = ['cable', 'controller', 'cooling', 'fan', 'cover', 'case', 'skin', 'godfall', 'stand'];
    const lowerSearchQuery = searchQuery.toLowerCase();

    const cleanData = rawData.filter(item => {
        const lowerTitle = item.title.toLowerCase();
        const isJunk = junkWords.some(junkWord => {
            return lowerTitle.includes(junkWord) && !lowerSearchQuery.includes(junkWord);
        });
        return !isJunk; 
    });

    return cleanData; 
}

module.exports = { scrapeRealData };