const { slugify, cleanText, extractImageUrl, parseStats, autoScroll } = require('../utils');

const scrapeRunewords = async (page) => {
    console.log('Navigating to Runewords page...');
    await page.goto('https://diablo2.io/runewords/', { waitUntil: 'networkidle' });

    await page.waitForSelector('article.element-item', { timeout: 60000 });

    // Auto-scroll to load images
    console.log('Scrolling to load images...');
    await autoScroll(page);

    const validItems = await page.$$eval('article.element-item', (elements) => {
        return elements.map(el => {
            const nameEl = el.querySelector('h3.z-sort-name a.z-uniques-title') || el.querySelector('h3.z-sort-name a');
            const name = nameEl ? nameEl.innerText.trim() : 'Unknown';

            // Runewords might not have the same image structure (often just runes), but they might have a generic image
            const imgDiv = el.querySelector('a > div');
            const style = imgDiv ? window.getComputedStyle(imgDiv).backgroundImage : '';

            const qualityEl = el.querySelector('h4');
            const qualityText = qualityEl ? qualityEl.innerText.trim() : '';

            // Runes are often in links with class ajax_link
            const runeLinks = Array.from(el.querySelectorAll('a.ajax_link'));
            const runes = runeLinks.map(r => r.innerText.trim());

            return {
                name,
                qualityText,
                backgroundImageStyle: style,
                runes,
                fullText: el.innerText
            };
        });
    });

    return validItems.map(item => {
        const id = slugify(item.name);
        const imageUrl = extractImageUrl(item.backgroundImageStyle);

        // Filter runes from stats text to avoid duplication if they appear there
        const parsedStats = parseStats(item.fullText, [item.name, item.qualityText, ...item.runes]);

        return {
            id,
            name: item.name,
            image: imageUrl,
            type: 'Runeword',
            runes: item.runes,
            properties: parsedStats
        };
    });
};

module.exports = { scrapeRunewords };
