const { slugify, cleanText, autoScroll } = require('../utils');

const scrapeRecipes = async (page) => {
    console.log('Navigating to Recipes page...');
    await page.goto('https://diablo2.io/recipes/', { waitUntil: 'networkidle' });

    await page.waitForSelector('article.element-item', { timeout: 60000 });

    // Auto-scroll to load images
    console.log('Scrolling to load images...');
    await autoScroll(page);

    const validItems = await page.$$eval('article.element-item', (elements) => {
        return elements.map(el => {
            const nameEl = el.querySelector('h3.z-sort-name a');
            const name = nameEl ? nameEl.innerText.trim() : 'Unknown';

            // Inputs
            const inputContainer = el.querySelector('.z-recipe-input');
            const inputs = [];
            if (inputContainer) {
                inputs.push(inputContainer.innerText.trim());
            }

            // Outputs
            const outputContainer = el.querySelector('.z-recipe-outcome');
            const outputs = [];
            if (outputContainer) {
                outputs.push(outputContainer.innerText.trim());
            }

            return {
                name,
                inputs,
                outputs,
                fullText: el.innerText
            };
        });
    });

    return validItems.map(item => {
        const id = slugify(item.name);

        return {
            id,
            name: item.name,
            type: 'Recipe',
            inputs: item.inputs,
            outputs: item.outputs
        };
    });
};

module.exports = { scrapeRecipes };
