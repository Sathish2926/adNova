import puppeteer from 'puppeteer';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const parseCount = (str) => {
    if(!str) return '0';
    let num = parseFloat(str.replace(/,/g, ''));
    if(str.toUpperCase().includes('K')) num *= 1000;
    else if(str.toUpperCase().includes('M')) num *= 1000000;
    else if(str.toUpperCase().includes('B')) num *= 1000000000;
    return Math.floor(num).toString();
};

// --- QUEUE VARIABLES ---
const queue = [];
let isProcessing = false;

// --- INTERNAL SCRAPER (Your Original Logic) ---
const performScrape = async (instaHandle, youtubeHandle) => {
    let browser = null;
    try {
        console.log(`--- PROCESSING QUEUE: ${instaHandle} ---`);
        
        browser = await puppeteer.launch({
            headless: "new",
            args: [
                "--disable-setuid-sandbox",
                "--no-sandbox",
                "--single-process",
                "--no-zygote",
            ],
            executablePath:
                process.env.NODE_ENV === "production"
                    ? process.env.PUPPETEER_EXECUTABLE_PATH
                    : puppeteer.executablePath(),
        });
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        await page.setExtraHTTPHeaders({'Accept-Language': 'en-US,en;q=0.9'});

        let rawCount = '0';

        if(instaHandle){
            try{
                await page.goto(`https://www.instagram.com/${instaHandle}/`, {waitUntil:'networkidle2', timeout:30000});

                const metaContent = await page.evaluate(() => {
                    const meta = document.querySelector('meta[name="description"]');
                    return meta ? meta.content : null;
                });

                if(metaContent){
                    const match = metaContent.match(/^([0-9.,KMB]+)\s+Followers/i);
                    if(match && match[1]) rawCount = match[1];
                }
                
                if(rawCount === '0'){
                     const pageText = await page.evaluate(() => document.body.innerText);
                     const textMatch = pageText.match(/([0-9.,KMB]+)\s+followers/i);
                     if(textMatch && textMatch[1]) rawCount = textMatch[1];
                }
            }catch(e){console.log(e.message);}
        }

        if(youtubeHandle && rawCount === '0'){
             try {
                await page.goto(`https://www.youtube.com/@${youtubeHandle}`, {waitUntil:'domcontentloaded'});
                const meta = await page.evaluate(() => document.querySelector('meta[name="description"]')?.content);
                const match = meta?.match(/([0-9.,KMB]+)\s+subscribers/i);
                if(match && match[1]) rawCount = match[1];
            } catch(e){console.log(e.message);}
        }

        await browser.close();
        
        const finalCount = parseCount(rawCount);
        console.log(`Raw: ${rawCount} | Parsed: ${finalCount}`);
        return finalCount;

    } catch (e) {
        if (browser) await browser.close();
        return '0';
    }
};

// --- QUEUE PROCESSOR ---
const processQueue = async () => {
    // If we are already working, or the line is empty, stop.
    if (isProcessing || queue.length === 0) return;

    isProcessing = true;
    const { instaHandle, youtubeHandle, resolve, reject } = queue.shift();

    try {
        const result = await performScrape(instaHandle, youtubeHandle);
        resolve(result);
    } catch (error) {
        reject(error);
    } finally {
        isProcessing = false;
        // Check if anyone else is waiting in line
        processQueue();
    }
};

// --- PUBLIC EXPORT (Wraps the request in the queue) ---
export const scrapeSocials = (instaHandle, youtubeHandle) => {
    return new Promise((resolve, reject) => {
        // Add the request to the array
        queue.push({ instaHandle, youtubeHandle, resolve, reject });
        console.log(`Request added to queue. Current length: ${queue.length}`);
        
        // Try to start processing
        processQueue();
    });
};