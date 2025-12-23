const express = require('express');
const cors = require('cors');
const path = require('path');
const routes = require('./routes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve static images
// Mounts /images to the scraped images directory
app.use('/images', express.static(path.join(__dirname, '../../scraper/data/images')));

// API Routes
app.use('/items', routes);

// Root route
app.get('/', (req, res) => {
    res.json({
        message: 'Welcome to Diablo 2 Resurrected API',
        endpoints: [
            '/items',
            '/items/uniques',
            '/items/sets',
            '/items/runewords',
            '/items/:id'
        ]
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
