// ==============================
// FILE: server/utils/socialScraper.js
// ==============================
const puppeteer = require("puppeteer-core");
const chromium = require("@sparticuz/chromium");

const parseCount = (str) => {
    if (!str) return 0;
    const cleanStr = str.replace(/[^0-9.kKmM]/g, '').toLowerCase();
    let multiplier = 1;
    if (cleanStr.includes('k')) multiplier = 1000;
    if (cleanStr.includes('m')) multiplier = 1000000;
    
    const num = parseFloat(cleanStr.replace(/[km]/g, ''));
    return Math.floor(num * multiplier);
};

export const scrapeSocials = async (instaHandle, ytHandle) => {
    let totalFollowers = 0;
    let browser = null;

    try {
        console.log(`[Scraper] Starting for IG: ${instaHandle}, YT: ${ytHandle}`);
        
        // DEPLOYMENT CONFIGURATION
        const browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath(),
    headless: chromium.headless,
    ignoreHTTPSErrors: true,
});

        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

        // --- 1. INSTAGRAM ---
        if (instaHandle) {
            const cleanHandle = instaHandle.replace('@', '').trim();
            const url = `https://www.instagram.com/${cleanHandle}/`;
            
            try {
                await page.goto(url, { waitUntil: "networkidle2", timeout: 45000 });
                const description = await page.evaluate(() => {
                    const meta = document.querySelector("meta[name='description']");
                    return meta ? meta.getAttribute("content") : null;
                });
                if (description) {
                    const match = description.match(/([\d,.]+)([MK]?) Followers/i);
                    if (match) {
                        let followers = parseFloat(match[1].replace(/,/g, ""));
                        if (match[2] === "K") followers *= 1000;
                        if (match[2] === "M") followers *= 1000000;
                        
                        console.log(`[Scraper] IG Found: ${followers}`);
                        totalFollowers += Math.round(followers);
                    }
                }
            } catch (e) {
                console.error(`[Scraper] IG Error: ${e.message}`);
            }
        }

        // --- 2. YOUTUBE ---
        if (ytHandle) {
            const cleanHandle = ytHandle.replace('@', '').trim();
            const url = cleanHandle.startsWith('channel/') 
                ? `https://www.youtube.com/${cleanHandle}`
                : `https://www.youtube.com/@${cleanHandle}`;

            try {
                await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
                const subText = await page.evaluate(() => {
                    const metas = Array.from(document.querySelectorAll('meta'));
                    const desc = metas.find(m => m.name === 'description')?.content;
                    if(desc && desc.includes('subscribers')) return desc;
                    const els = Array.from(document.querySelectorAll('yt-formatted-string, span'));
                    const target = els.find(e => e.innerText && e.innerText.includes('subscribers'));
                    return target ? target.innerText : null;
                });

                if (subText) {
                    const match = subText.match(/([\d\.KM]+)\s*subscribers/i);
                    if (match && match[1]) {
                        totalFollowers += parseCount(match[1]);
                        console.log(`[Scraper] YT Found: ${match[1]}`);
                    }
                }
            } catch (e) {
                console.error(`[Scraper] YT Error: ${e.message}`);
            }
        }

    } catch (err) {
        console.error("[Scraper] Browser Crash:", err.message);
    } finally {
        if (browser) await browser.close();
    }

    return totalFollowers;
};