import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';

let browser = null;

export const scrapeSocials = async (instaHandle, youtubeHandle) => {
    if (!instaHandle && !youtubeHandle) return '0';

    try {
        if (!browser || !browser.isConnected()) {
            browser = await puppeteer.launch({
                args: [
                    ...chromium.args,
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-accelerated-2d-canvas',
                    '--disable-gpu'
                ],
                defaultViewport: chromium.defaultViewport,
                executablePath: await chromium.executablePath(),
                headless: chromium.headless,
                ignoreHTTPSErrors: true,
            });
        }

        const page = await browser.newPage();
        
        await page.setRequestInterception(true);
        page.on('request', (req) => {
            const resourceType = req.resourceType();
            if (['image', 'stylesheet', 'font', 'media', 'script'].includes(resourceType)) {
                req.abort();
            } else {
                req.continue();
            }
        });

        let count = '0';

        if (instaHandle) {
            try {
                await page.goto(`https://www.instagram.com/${instaHandle}/`, { waitUntil: 'domcontentloaded', timeout: 8000 });
                const content = await page.content();
                let m = content.match(/"edge_followed_by":\{"count":(\d+)\}/);
                if (!m) m = content.match(/meta\s+name="description"\s+content="([0-9.,KMB]+)\s+Followers/i);
                if (m) count = m[1];
            } catch (e) {
                console.error(`IG Fail: ${e.message}`);
            }
        }

        if (youtubeHandle && count === '0') {
            try {
                await page.goto(`https://www.youtube.com/@${youtubeHandle}`, { waitUntil: 'domcontentloaded', timeout: 8000 });
                const content = await page.content();
                let m = content.match(/"subscriberCountText":\{"accessibility":\{"accessibilityData":\{"label":"([\d.,KMB]+)\s+subscribers"/);
                if (!m) m = content.match(/([0-9.,KMB]+)\s+subscribers/i);
                if (m) count = m[1];
            } catch (e) {
                console.error(`YT Fail: ${e.message}`);
            }
        }

        await page.close();
        return count;

    } catch (error) {
        console.error('Scraper Error:', error.message);
        if (browser) {
            await browser.close();
            browser = null;
        }
        return '0';
    }
};