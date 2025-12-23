const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const { scrapeUniques } = require('./scrapers/uniques');
const { scrapeSets } = require('./scrapers/sets');
const { scrapeRunewords } = require('./scrapers/runewords');
const { scrapeRecipes } = require('./scrapers/recipes');
const { scrapeBase } = require('./scrapers/base');
const { scrapeMisc } = require('./scrapers/misc');
const { downloadImage } = require('./downloader');

(async () => {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    });
    const page = await context.newPage();

    try {
        // Determine which categories to scrape based on args or default to all (starting with Uniques)
        const allData = {};

        // 1. Uniques
        console.log('Starting Uniques scrape...');
        const uniques = await scrapeUniques(page);

        // Ensure data directory exists
        const dataDir = path.join(__dirname, '../data');
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }

        console.log('Downloading Unique images...');
        for (const item of uniques) {
            if (item.image) {
                const ext = path.extname(item.image) || '.png';
                const localPath = `images/uniques/${item.id}${ext}`;
                const fullPath = path.join(dataDir, localPath);
                await downloadImage(item.image, fullPath);
                item.local_image = localPath;
            }
        }
        allData.uniques = uniques;

        // Save individual file
        fs.writeFileSync(
            path.join(dataDir, 'uniques.json'),
            JSON.stringify(uniques, null, 2)
        );
        console.log(`Saved ${uniques.length} uniques to data/uniques.json`);

        // 2. Sets
        console.log('Starting Sets scrape...');
        const sets = await scrapeSets(page);

        console.log('Downloading Set images...');
        for (const item of sets) {
            if (item.image) {
                const ext = path.extname(item.image) || '.png';
                const localPath = `images/sets/${item.id}${ext}`;
                const fullPath = path.join(dataDir, localPath);
                await downloadImage(item.image, fullPath);
                item.local_image = localPath;
            }
        }
        allData.sets = sets;
        fs.writeFileSync(path.join(dataDir, 'sets.json'), JSON.stringify(sets, null, 2));
        console.log(`Saved ${sets.length} items to data/sets.json`);

        // 3. Runewords
        console.log('Starting Runewords scrape...');
        const runewords = await scrapeRunewords(page);

        console.log('Downloading Runeword images...');
        for (const item of runewords) {
            if (item.image) {
                const ext = path.extname(item.image) || '.png';
                const localPath = `images/runewords/${item.id}${ext}`;
                const fullPath = path.join(dataDir, localPath);
                await downloadImage(item.image, fullPath);
                item.local_image = localPath;
            }
        }
        allData.runewords = runewords;
        fs.writeFileSync(path.join(dataDir, 'runewords.json'), JSON.stringify(runewords, null, 2));
        console.log(`Saved ${runewords.length} runewords to data/runewords.json`);

        // 4. Recipes
        console.log('Starting Recipes scrape...');
        const recipes = await scrapeRecipes(page);
        allData.recipes = recipes;
        fs.writeFileSync(path.join(dataDir, 'recipes.json'), JSON.stringify(recipes, null, 2));
        console.log(`Saved ${recipes.length} recipes to data/recipes.json`);

        // 5. Base Items
        console.log('Starting Base Items scrape...');
        const baseItems = await scrapeBase(page);

        console.log('Downloading Base Item images...');
        for (const item of baseItems) {
            if (item.image) {
                const ext = path.extname(item.image) || '.png';
                const localPath = `images/base/${item.id}${ext}`;
                const fullPath = path.join(dataDir, localPath);
                await downloadImage(item.image, fullPath);
                item.local_image = localPath;
            }
        }
        allData.base = baseItems;
        fs.writeFileSync(path.join(dataDir, 'base.json'), JSON.stringify(baseItems, null, 2));
        console.log(`Saved ${baseItems.length} base items to data/base.json`);

        // 6. Misc Items
        console.log('Starting Misc Items scrape...');
        const miscItems = await scrapeMisc(page);

        console.log('Downloading Misc Item images...');
        for (const item of miscItems) {
            if (item.image) {
                const ext = path.extname(item.image) || '.png';
                const localPath = `images/misc/${item.id}${ext}`;
                const fullPath = path.join(dataDir, localPath);
                await downloadImage(item.image, fullPath);
                item.local_image = localPath;
            }
        }
        allData.misc = miscItems;
        fs.writeFileSync(path.join(dataDir, 'misc.json'), JSON.stringify(miscItems, null, 2));
        console.log(`Saved ${miscItems.length} misc items to data/misc.json`);

    } catch (error) {
        console.error('Scraping failed:', error);
    } finally {
        await browser.close();
    }
})();
