const express = require('express');
const puppeteer = require('puppeteer');

const PINMAKER_EMAIL = process.env.PINMAKER_EMAIL;
const PINMAKER_PASSWORD = process.env.PINMAKER_PASSWORD;

const app = express();
app.use(express.json());

const PINMAKER_URL = 'https://getpinmaker.com/';
const PINMAKER_EMAIL = process.env.PINMAKER_EMAIL;
const PINMAKER_PASSWORD = process.env.PINMAKER_PASSWORD;

app.post('/pinmaker', async (req, res) => {
    const { titulo } = req.body;
    
    if (!titulo) {
        return res.status(400).json({ error: 'Missing "titulo" in request body.' });
    }

    const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        headless: true,
    });

    try {
        const page = await browser.newPage();
        await page.goto(PINMAKER_URL, { waitUntil: 'networkidle2' });

        // Login
        await page.click('a[href="/login"]');
        await page.waitForSelector('input[name="email"]');
        await page.type('input[name="email"]', PINMAKER_EMAIL, { delay: 50 });
        await page.type('input[name="password"]', PINMAKER_PASSWORD, { delay: 50 });
        await page.click('button[type="submit"]');
        await page.waitForNavigation({ waitUntil: 'networkidle2' });

        // Generar artículo
        await page.waitForSelector('input[type="text"]');
        await page.type('input[type="text"]', titulo, { delay: 50 });
        await page.click('button[type="submit"]');
        await page.waitForTimeout(15000); // Espera a que se genere el artículo

        // Generar Pines
        await page.goto(PINMAKER_URL + 'pins', { waitUntil: 'networkidle2' });
        await page.waitForSelector('button.generate-pins');
        await page.click('button.generate-pins');
        await page.waitForTimeout(15000); // Espera a que se generen los pines

        // Obtener URLs de imágenes (esto depende del HTML real, ejemplo ficticio)
        const pines = await page.$$eval('img.pin-image', imgs => imgs.map(img => img.src));

        await browser.close();

        return res.json({ success: true, titulo: titulo, pines: pines });
    } catch (error) {
        await browser.close();
        console.error(error);
        return res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/', (req, res) => {
    res.send('Puppeteer PinMaker Automation API running.');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});
