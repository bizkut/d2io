const { slugify, cleanText, extractImageUrl, parseStats, autoScroll } = require('../utils');

const scrapeSets = async (page) => {
    console.log('Navigating to Sets page...');
    await page.goto('https://diablo2.io/sets/', { waitUntil: 'networkidle' });

    await page.waitForSelector('article.element-item', { timeout: 60000 });

    // Auto-scroll to load images
    console.log('Scrolling to load images...');
    await autoScroll(page);

    const validItems = await page.$$eval('article.element-item', (elements) => {
        return elements.map(el => {
            // Sets have a different class for the title usually, or generic
            // Based on inspection: a.z-sets-title
            const nameEl = el.querySelector('h3.z-sort-name a.z-sets-title') || el.querySelector('h3.z-sort-name a');
            const name = nameEl ? nameEl.innerText.trim() : 'Unknown';

            const imgDiv = el.querySelector('a > div');
            const style = imgDiv ? window.getComputedStyle(imgDiv).backgroundImage : '';

            const qualityEl = el.querySelector('h4');
            const qualityText = qualityEl ? qualityEl.innerText.trim() : '';

            const baseItemEl = el.querySelector('h4 a.z-white');
            const baseItem = baseItemEl ? baseItemEl.innerText.trim() : '';

            return {
                name,
                qualityText,
                baseItem,
                backgroundImageStyle: style,
                fullText: el.innerText
            };
        });
    });

    return validItems.map(item => {
        const id = slugify(item.name);
        const imageUrl = extractImageUrl(item.backgroundImageStyle);
        // For sets, qualityText might be "Set Item" or similar
        const distinctQuality = item.qualityText.replace(item.baseItem || '', '').trim();

        const parsedStats = parseStats(item.fullText, [item.name, item.qualityText, item.baseItem]);

        return {
            id,
            name: item.name,
            image: imageUrl,
            type: 'Set Item', // Explicitly marking as Set Item
            base_item: item.baseItem,
            properties: parsedStats
        };
    });
};

module.exports = { scrapeSets };
