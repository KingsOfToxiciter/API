const express = require('express');
const puppeteer = require('puppeteer');
const { BING_COOKIE } = require('./config');

const app = express();
app.use(express.json());

app.get('/bing', async (req, res) => {
    const { prompt } = req.query;
    if (!prompt) return res.status(400).json({ error: "Prompt is required" });

    const browser = await puppeteer.launch({
    executablePath: '/usr/bin/chromium-browser',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
});
    const page = await browser.newPage();

    try {
        
        await page.setCookie({
            name: "_U",
            value: BING_COOKIE,
            domain: ".bing.com",
            path: "/"
        });

        await page.goto('https://www.bing.com/create');
        await page.waitForSelector("input[placeholder=\"Describe the image you want created or select 'Surprise Me' to get inspired!\"]");

        
        await page.type("input[placeholder=\"Describe the image you want created or select 'Surprise Me' to get inspired!\"]", prompt);
        await page.click('button[type="Creat"]');

        
        await page.waitForSelector('img.generated-image', { timeout: 60000 });

        
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


app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});