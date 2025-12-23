const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

// Load data into memory at startup
const loadData = (filename) => {
    const filePath = path.join(__dirname, '../../scraper/data', filename);
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

// GET /items
router.get('/', (req, res) => {
    const filtered = filterItems(allItems, req.query);
    res.json(filtered);
});

// GET /items/uniques
router.get('/uniques', (req, res) => {
    const filtered = filterItems(uniques, req.query);
    res.json(filtered);
});

// GET /items/sets
router.get('/sets', (req, res) => {
    const filtered = filterItems(sets, req.query);
    res.json(filtered);
});

// GET /items/runewords
router.get('/runewords', (req, res) => {
    const filtered = filterItems(runewords, req.query);
    res.json(filtered);
});

// GET /items/recipes
router.get('/recipes', (req, res) => {
    const filtered = filterItems(recipes, req.query);
    res.json(filtered);
});

// GET /items/base
router.get('/base', (req, res) => {
    const filtered = filterItems(base, req.query);
    res.json(filtered);
});

// GET /items/misc
router.get('/misc', (req, res) => {
    const filtered = filterItems(misc, req.query);
    res.json(filtered);
});

// GET /items/:id
router.get('/:id', (req, res) => {
    const item = allItems.find(i => i.id === req.params.id);
    if (item) {
        res.json(item);
    } else {
        res.status(404).json({ error: 'Item not found' });
    }
});

module.exports = router;
