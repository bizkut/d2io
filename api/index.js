const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();

app.use(cors());
app.use(express.json());

// Load data into memory
const loadData = (filename) => {
    const filePath = path.join(__dirname, 'data', filename);
    if (fs.existsSync(filePath)) {
        return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    }
    return [];
};

const uniques = loadData('uniques.json');
const sets = loadData('sets.json');
const runewords = loadData('runewords.json');
const recipes = loadData('recipes.json');
const base = loadData('base.json');
const misc = loadData('misc.json');

const allItems = [...uniques, ...sets, ...runewords, ...recipes, ...base, ...misc];

// Helper to search/filter
const filterItems = (items, query) => {
    let result = items;
    if (query.name) {
        const term = query.name.toLowerCase();
        result = result.filter(i => i.name.toLowerCase().includes(term));
    }
    return result;
};

// Root
app.get('/api', (req, res) => {
    res.json({
        message: 'Diablo 2 Resurrected API',
        endpoints: [
            '/api/items',
            '/api/items/uniques',
            '/api/items/sets',
            '/api/items/runewords',
            '/api/items/recipes',
            '/api/items/base',
            '/api/items/misc',
            '/api/items/:id'
        ]
    });
});

// GET /api/items
app.get('/api/items', (req, res) => {
    const filtered = filterItems(allItems, req.query);
    res.json(filtered);
});

// GET /api/items/uniques
app.get('/api/items/uniques', (req, res) => {
    const filtered = filterItems(uniques, req.query);
    res.json(filtered);
});

// GET /api/items/sets
app.get('/api/items/sets', (req, res) => {
    const filtered = filterItems(sets, req.query);
    res.json(filtered);
});

// GET /api/items/runewords
app.get('/api/items/runewords', (req, res) => {
    const filtered = filterItems(runewords, req.query);
    res.json(filtered);
});

// GET /api/items/recipes
app.get('/api/items/recipes', (req, res) => {
    const filtered = filterItems(recipes, req.query);
    res.json(filtered);
});

// GET /api/items/base
app.get('/api/items/base', (req, res) => {
    const filtered = filterItems(base, req.query);
    res.json(filtered);
});

// GET /api/items/misc
app.get('/api/items/misc', (req, res) => {
    const filtered = filterItems(misc, req.query);
    res.json(filtered);
});

// GET /api/items/:id
app.get('/api/items/:id', (req, res) => {
    const item = allItems.find(i => i.id === req.params.id);
    if (item) {
        res.json(item);
    } else {
        res.status(404).json({ error: 'Item not found' });
    }
});

module.exports = app;
