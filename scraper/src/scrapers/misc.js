const { slugify, cleanText, extractImageUrl, parseStats, autoScroll } = require('../utils');

const scrapeMisc = async (page) => {
    console.log('Navigating to Misc Items page...');
    await page.goto('https://diablo2.io/misc/', { waitUntil: 'networkidle' });

    await page.waitForSelector('article.element-item', { timeout: 60000 });

    // Auto-scroll to load images
    console.log('Scrolling to load images...');
    await autoScroll(page);

    const validItems = await page.$$eval('article.element-item', (elements) => {
        return elements.map(el => {
            const nameEl = el.querySelector('h3.z-sort-name a');
            const name = nameEl ? nameEl.innerText.trim() : 'Unknown';

            const imgDiv = el.querySelector('a > div');
            const style = imgDiv ? window.getComputedStyle(imgDiv).backgroundImage : '';

            const typeEl = el.querySelector('h4');
            const type = typeEl ? typeEl.innerText.trim() : 'Misc Item';

            return {
                name,
                type,
                backgroundImageStyle: style,
                fullText: el.innerText
            };
        });
    });

    return validItems.map(item => {
        const id = slugify(item.name);
        const imageUrl = extractImageUrl(item.backgroundImageStyle);
        const parsedStats = parseStats(item.fullText, [item.name, item.type]);

        return {
            id,
            name: item.name,
            image: imageUrl,
            type: 'Misc Item',
            category: item.type,
            properties: parsedStats
        };
    });
};

module.exports = { scrapeMisc };
