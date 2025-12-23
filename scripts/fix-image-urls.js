const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../api/data');

const categories = ['uniques', 'sets', 'runewords', 'base', 'misc'];

categories.forEach(category => {
    const filePath = path.join(DATA_DIR, `${category}.json`);
    if (!fs.existsSync(filePath)) {
        console.log(`Skipping ${category}.json (not found)`);
        return;
    }

    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    let updated = 0;
    data.forEach(item => {
        // Replace remote image URL with local path
        if (item.local_image) {
            item.image = `/${item.local_image.replace(/^images\//, `images/${category}/`).replace(/^images\/\w+\//, `images/${category}/`)}`;
            // Simplify: just use local_image directly
            item.image = `/${item.local_image}`;
            delete item.local_image;
            updated++;
        } else if (item.image && item.image.includes('diablo2.io')) {
            // Fallback: construct local path from ID
            item.image = `/images/${category}/${item.id}.png`;
            updated++;
        }
    });

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(`Updated ${updated} items in ${category}.json`);
});

console.log('Done!');
