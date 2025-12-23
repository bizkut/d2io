const slugify = (text) => {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-');
};

const cleanText = (text) => {
    return text ? text.replace(/\s+/g, ' ').trim() : '';
};

const extractImageUrl = (styleString) => {
    if (!styleString) return null;
    const match = styleString.match(/url\(["']?([^"']*)["']?\)/);
    return match ? match[1] : null;
};

// Helper to parse stats from the raw text of the item
const parseStats = (rawText, knownValues = []) => {
    // knownValues: array of strings to exclude (Name, Type, Base Item)
    // normalize known values for comparison
    const exclusionList = knownValues.map(v => v ? v.toLowerCase().trim() : '');

    const lines = rawText.split('\n').map(l => l.trim()).filter(l => l);
    const stats = {};
    const magicalProperties = [];

    lines.forEach(line => {
        const lowerLine = line.toLowerCase();

        // Skip if line is in exclusion list (exact match)
        if (exclusionList.includes(lowerLine)) return;

        // Also skip if it seems to be just the type quality alone (heuristic)
        if (['elite unique', 'exceptional unique', 'normal unique'].includes(lowerLine)) return;

        // Parse specific stats
        if (lowerLine.startsWith('req level:') || lowerLine.startsWith('required level:')) {
            stats.required_level = parseInt(line.split(':')[1], 10);
        } else if (lowerLine.startsWith('req strength:') || lowerLine.startsWith('required strength:')) {
            stats.required_strength = parseInt(line.split(':')[1], 10);
        } else if (lowerLine.startsWith('req dexterity:') || lowerLine.startsWith('required dexterity:')) {
            stats.required_dexterity = parseInt(line.split(':')[1], 10);
        } else if (lowerLine.startsWith('defense:')) {
            stats.defense = line.split(':')[1].trim();
        } else if (lowerLine.includes('damage:') && !lowerLine.includes('to') && !lowerLine.includes('adds')) {
            // e.g. "2H damage: 145-649" or "Damage: 10-20"
            // avoiding "Adds 1-2 damage" or "+10 to damage" which are magical props
            stats.damage = stats.damage || [];
            stats.damage.push(line);
        } else if (lowerLine.startsWith('durability:')) {
            stats.durability = parseInt(line.split(':')[1], 10);
        } else if (lowerLine.startsWith('base speed:')) {
            stats.base_speed = parseInt(line.split(':')[1], 10);
        } else if (lowerLine.startsWith('quantity:')) {
            stats.quantity = parseInt(line.split(':')[1], 10);
        } else if (lowerLine.startsWith('quality level:')) {
            stats.quality_level = parseInt(line.split(':')[1], 10);
        } else if (lowerLine.startsWith('treasure class:')) {
            stats.treasure_class = parseInt(line.split(':')[1], 10);
        } else {
            magicalProperties.push(line);
        }
    });

    return { ...stats, magical_properties: magicalProperties };
};

// Helper to auto-scroll the page to trigger lazy loading
const autoScroll = async (page) => {
    await page.evaluate(async () => {
        await new Promise((resolve) => {
            let totalHeight = 0;
            const distance = 100;
            const timer = setInterval(() => {
                const scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;

                // Stop if we've scrolled past the doc height or hit a reasonable limit
                if (totalHeight >= scrollHeight) {
                    clearInterval(timer);
                    resolve();
                }
            }, 50); // Fast scroll
        });
    });
    // Wait a bit for final images to render
    await page.waitForTimeout(2000);
};

module.exports = {
    slugify,
    cleanText,
    extractImageUrl,
    parseStats,
    autoScroll
};
