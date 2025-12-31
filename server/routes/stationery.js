// backend/routes/stationery.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const { verifyToken, checkRole } = require('../middleware/auth');

// GET all items (Any logged-in user)
router.get('/items', verifyToken, (req, res) => {
    const sql = "SELECT * FROM stationery_items ORDER BY created_at DESC";
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// POST Add new item (Only Stationery & Admin)
router.post('/add', verifyToken, checkRole(['stationery', 'admin']), (req, res) => {
    const { item_name, price, stock_level, category } = req.body;
    const sql = "INSERT INTO stationery_items (item_name, price, stock_level, category) VALUES (?, ?, ?, ?)";
    db.query(sql, [item_name, price, stock_level, category], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Stationery item added', id: result.insertId });
    });
});

// PUT Update item (Only Stationery & Admin)
router.put('/update/:id', verifyToken, checkRole(['stationery', 'admin']), (req, res) => {
    const { id } = req.params;
    const { item_name, price, stock_level, category } = req.body;
    const sql = "UPDATE stationery_items SET item_name=?, price=?, stock_level=?, category=? WHERE id=?";
    db.query(sql, [item_name, price, stock_level, category, id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Stationery item updated successfully' });
    });
});

// DELETE Remove item (Only Stationery & Admin)
router.delete('/delete/:id', verifyToken, checkRole(['stationery', 'admin']), (req, res) => {
    const { id } = req.params;
    const sql = "DELETE FROM stationery_items WHERE id=?";
    db.query(sql, [id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Stationery item deleted successfully' });
    });
});

module.exports = router;