import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';

export const scrapeSocials = async (url) => {
    let browser = null;
    try {
        await new Promise(resolve => setTimeout(resolve, Math.random() * 5000));
        
        console.log(`[Scraper] Starting for: ${url}`);
        
        chromium.setGraphicsMode = false;
        
        browser = await puppeteer.launch({
            args: [
                ...chromium.args,
                '--hide-scrollbars',
                '--disable-web-security',
                '--no-sandbox',
                '--disable-setuid-sandbox'
            ],
            defaultViewport: chromium.defaultViewport,
            executablePath: await chromium.executablePath(),
            headless: chromium.headless,
            ignoreHTTPSErrors: true,
        });

        const page = await browser.newPage();
        
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36');
        
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });

        let result = '0';

        if (url.includes('instagram.com')) {
            try {
                const content = await page.content();
                const match = content.match(/"edge_followed_by":\{"count":(\d+)\}/);
                if (match && match[1]) {
                    result = match[1];
                } else {
                    const metaContent = await page.$eval('meta[property="og:description"]', el => el.content).catch(() => '');
                    const metaMatch = metaContent.match(/([0-9.,KMB]+)\s+Followers/i);
                    if (metaMatch) result = metaMatch[1];
                }
            } catch (e) {
                console.log(`[Scraper] IG Error: ${e.message}`);
            }
        } else if (url.includes('youtube.com')) {
            try {
                const content = await page.content();
                const match = content.match(/"subscriberCountText":\{"accessibility":\{"accessibilityData":\{"label":"([\d.,KMB]+)\s+subscribers"/);
                if (match && match[1]) {
                    result = match[1];
                } else {
                    const text = await page.evaluate(() => document.body.innerText);
                    const textMatch = text.match(/([0-9.,KMB]+)\s+subscribers/i);
                    if (textMatch) result = textMatch[1];
                }
            } catch (e) {
                console.log(`[Scraper] YT Error: ${e.message}`);
            }
        }

        console.log(`[Scraper] Found ${result} for ${url}`);
        return result;

    } catch (error) {
        console.error(`[Scraper] Fatal Error for ${url}:`, error);
        return '0';
    } finally {
        if (browser) {
            await browser.close();
        }
    }
};