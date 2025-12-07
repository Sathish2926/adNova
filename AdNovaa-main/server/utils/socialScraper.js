import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';

let browser = null;

export const scrapeSocials = async (instaHandle, youtubeHandle) => {
    // Return '0' immediately if no handles provided
    if (!instaHandle && !youtubeHandle) return '0';

    try {
        // Singleton pattern: Launch browser only if not already open or disconnected
        if (!browser || !browser.isConnected()) {
            browser = await puppeteer.launch({
                args: chromium.args,
                defaultViewport: chromium.defaultViewport,
                executablePath: await chromium.executablePath(),
                headless: chromium.headless,
                ignoreHTTPSErrors: true,
            });
        }

        const page = await browser.newPage();

        // OPTIMIZATION: Block images, fonts, and stylesheets to save memory/cpu
        await page.setRequestInterception(true);
        page.on('request', (req) => {
            if (['image', 'stylesheet', 'font', 'media'].includes(req.resourceType())) {
                req.abort();
            } else {
                req.continue();
            }
        });

        // Set User Agent to avoid bot detection
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36');

        let count = '0';

        // --- SCRAPE INSTAGRAM ---
        if (instaHandle) {
            try {
                await page.goto(`https://www.instagram.com/${instaHandle}/`, { waitUntil: 'domcontentloaded', timeout: 10000 });
                const content = await page.content();
                
                // Regex to find follower count in source code
                let m = content.match(/"edge_followed_by":\{"count":(\d+)\}/);
                if (!m) m = content.match(/meta\s+name="description"\s+content="([0-9.,KMB]+)\s+Followers/i);
                
                if (m) {
                    count = m[1];
                }
            } catch (e) {
                console.error(`IG Scrape failed for ${instaHandle}: ${e.message}`);
            }
        }

        // --- SCRAPE YOUTUBE (Only if IG didn't return a count, or logic depends on preference) ---
        // Current logic: If IG fails or is empty, try YT. You can adjust to sum them if needed.
        if (youtubeHandle && count === '0') {
            try {
                await page.goto(`https://www.youtube.com/@${youtubeHandle}`, { waitUntil: 'domcontentloaded', timeout: 10000 });
                const content = await page.content();

                let m = content.match(/"subscriberCountText":\{"accessibility":\{"accessibilityData":\{"label":"([\d.,KMB]+)\s+subscribers"/);
                if (!m) m = content.match(/([0-9.,KMB]+)\s+subscribers/i);
                
                if (m) {
                    count = m[1];
                }
            } catch (e) {
                console.error(`YT Scrape failed for ${youtubeHandle}: ${e.message}`);
            }
        }

        await page.close();
        return count;

    } catch (e) {
        console.error('Critical Scraper Error:', e.message);
        // If the browser crashes, reset the variable so it re-launches next time
        if (browser) {
            try { await browser.close(); } catch (err) {}
            browser = null;
        }
        return '0';
    }
};