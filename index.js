const express = require('express');
const puppeteer = require('puppeteer');
const { BING_COOKIE } = require('./config');

const app = express();
app.use(express.json());

app.post('/generate', async (req, res) => {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: "Prompt is required" });

    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    try {
        // Bing কুকি সেট করা
        await page.setCookie({
            name: "_U",
            value: BING_COOKIE,
            domain: ".bing.com",
            path: "/"
        });

        await page.goto('https://www.bing.com/create');
        await page.waitForSelector('input[placeholder="Enter a prompt"]');

        // Prompt ইনপুট করা
        await page.type('input[placeholder="Enter a prompt"]', prompt);
        await page.click('button[type="submit"]');

        // ইমেজ লোড হওয়ার জন্য অপেক্ষা করা
        await page.waitForSelector('img.generated-image', { timeout: 60000 });

        // Generated ইমেজ URL সংগ্রহ করা
        const images = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('img.generated-image')).map(img => img.src);
        });

        await browser.close();
        res.json({ prompt, images });

    } catch (error) {
        await browser.close();
        res.status(500).json({ error: "Failed to generate image", details: error.message });
    }
});

// সার্ভার চালু করা
app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});