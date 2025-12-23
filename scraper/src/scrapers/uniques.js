const { slugify, cleanText, extractImageUrl, parseStats, autoScroll } = require('../utils');

const scrapeUniques = async (page) => {
    console.log('Navigating to Uniques page...');
    await page.goto('https://diablo2.io/uniques/', { waitUntil: 'networkidle' });

    // Wait for the grid to load
    await page.waitForSelector('article.element-item', { timeout: 60000 });

    // Auto-scroll to load images
    console.log('Scrolling to load images...');
    await autoScroll(page);

    // Get all item elements
    const items = await page.$$eval('article.element-item', (elements) => {
        return elements.map(el => {
            // Helper to safely get text
            const getText = (selector) => {
                const node = el.querySelector(selector);
                return node ? node.innerText : '';
            };

            // Extract Name
            const nameEl = el.querySelector('h3.z-sort-name a.z-uniques-title');
            const name = nameEl ? nameEl.innerText : 'Unknown Name';
            const url = nameEl ? nameEl.href : null;

            // Extract Quality/Type (e.g., "Elite Unique Wrapper")
            const qualityEl = el.querySelector('h4');
            const qualityText = qualityEl ? qualityEl.innerText : '';

            // Extract Base Item
            const baseItemEl = el.querySelector('h4 a.z-white');
            const baseItem = baseItemEl ? baseItemEl.innerText : null;

            // Extract Image
            const imgDiv = el.querySelector('a > div');
            // We need to get the computed style for background-image
            // Since we are in $$eval, we can use window.getComputedStyle
            let stats = el.innerText; // We'll parse this later in Node context or return raw

            return {
                name,
                url,
                qualityText,
                baseItem,
                rawHtml: el.outerHTML, // We might need this if parsing fails
                rawText: el.innerText
            };
        });
    });

    console.log(`Found ${items.length} unique items.`);

    // Post-process items in Node.js context (better for complex logic and keeping browser context light)
    const processedItems = [];

    for (let i = 0; i < items.length; i++) {
        const item = items[i];

        // We need to get the image URL. The $$eval above didn't get computed style easily for all 
        // without passing a function. Let's do it individually or improve the $$eval.
        // Actually, let's improve the $$eval to get the style there.
    }

    // Refined scraping for correct styles
    const validItems = await page.$$eval('article.element-item', (elements) => {
        return elements.map(el => {
            const nameEl = el.querySelector('h3.z-sort-name a.z-uniques-title');
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
        const distinctQuality = item.qualityText.replace(item.baseItem || '', '').trim(); // Remove base item from quality string if present

        const parsedStats = parseStats(item.fullText, [item.name, item.qualityText, item.baseItem, 'Patch 1.09 or later']); // Also filter patch info if noisy

        // Clean up parsed stats to remove name and quality if they appear in text
        // The fullText usually includes "The Grandfather\nColossus Blade\n..."
        // We already have Name and Base Item, so we can trust `parseStats` to handle the rest roughly, 
        // but might need filtering if the parser isn't strict.

        return {
            id,
            name: item.name,
            image: imageUrl,
            type: distinctQuality,
            base_item: item.baseItem,
            properties: parsedStats
        };
    });
};

module.exports = { scrapeUniques };
