// backend/routes/canteen.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const { verifyToken, checkRole } = require('../middleware/auth');

// GET all items (Accessible by any logged-in user)
router.get('/items', verifyToken, (req, res) => {
    const sql = "SELECT * FROM canteen_items ORDER BY created_at DESC";
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// POST Add new item (Only Canteen & Admin)
router.post('/add', verifyToken, checkRole(['canteen', 'admin']), (req, res) => {
    const { item_name, price, quantity, status } = req.body;
    const sql = "INSERT INTO canteen_items (item_name, price, quantity, status) VALUES (?, ?, ?, ?)";
    db.query(sql, [item_name, price, quantity, status], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Item added successfully', id: result.insertId });
    });
});

// PUT Update item (Only Canteen & Admin)
router.put('/update/:id', verifyToken, checkRole(['canteen', 'admin']), (req, res) => {
    const { id } = req.params;
    const { item_name, price, quantity, status } = req.body;
    const sql = "UPDATE canteen_items SET item_name=?, price=?, quantity=?, status=? WHERE id=?";
    db.query(sql, [item_name, price, quantity, status, id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Item updated successfully' });
    });
});

// DELETE Remove item (Only Canteen & Admin)
router.delete('/delete/:id', verifyToken, checkRole(['canteen', 'admin']), (req, res) => {
    const { id } = req.params;
    const sql = "DELETE FROM canteen_items WHERE id=?";
    db.query(sql, [id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Item deleted successfully' });
    });
});

module.exports = router;