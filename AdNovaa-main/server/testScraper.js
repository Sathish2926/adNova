import { scrapeSocials } from "./utils/socialScraper.js";

const runTest = async () => {
    console.log("--- STARTING MANUAL TEST ---");
    
    // Test with official accounts that are definitely public
    const instaHandle = "cristiano"; // Should have 600M+ followers
    const ytHandle = "Google";       // Should have 11M+ subscribers

    console.log(`Testing Handles -> Insta: @${instaHandle}, YT: @${ytHandle}`);

    try {
        const total = await scrapeSocials(instaHandle, ytHandle);
        console.log("--------------------------------");
        console.log(`FINAL RESULT: ${total} Total Followers`);
        console.log("--------------------------------");
        
        if (total > 0) {
            console.log("✅ SUCCESS: Puppeteer is working!");
        } else {
            console.log("❌ FAILURE: Returned 0 (Blocked or Selector Mismatch)");
        }

    } catch (error) {
        console.error("❌ CRASH:", error);
    }
};

runTest();