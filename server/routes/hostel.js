const express = require('express');
const router = express.Router();
const db = require('../db');
const { verifyToken, checkRole } = require('../middleware/auth');

// GET all items (Any logged-in user)
router.get('/items', verifyToken, (req, res) => {
    const sql = "SELECT * FROM hostel_items";
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// POST Add new item (Only Hostel & Admin)
router.post('/add', verifyToken, checkRole(['hostel', 'admin']), (req, res) => {
    // 1. Destructure the NEW fields from req.body
    const { 
        item_name, 
        type, 
        availability_status, 
        hostel_name, 
        address, 
        contact_number 
    } = req.body;

    // 2. Update SQL to include new columns
    const sql = "INSERT INTO hostel_items (item_name, type, availability_status, hostel_name, address, contact_number) VALUES (?, ?, ?, ?, ?, ?)";
    
    // 3. Add the new values to the array
    db.query(sql, [item_name, type, availability_status, hostel_name, address, contact_number], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Hostel item added', id: result.insertId });
    });
});

// PUT Update item (Only Hostel & Admin)
router.put('/update/:id', verifyToken, checkRole(['hostel', 'admin']), (req, res) => {
    const { id } = req.params;
    // 1. Destructure the NEW fields
    const { 
        item_name, 
        type, 
        availability_status, 
        hostel_name, 
        address, 
        contact_number 
    } = req.body;

    // 2. Update SQL to update the new columns
    const sql = "UPDATE hostel_items SET item_name=?, type=?, availability_status=?, hostel_name=?, address=?, contact_number=? WHERE id=?";
    
    // 3. Add the new values to the array (Order must match the SQL ? marks)
    db.query(sql, [item_name, type, availability_status, hostel_name, address, contact_number, id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Hostel item updated successfully' });
    });
});

// DELETE Remove item (Only Hostel & Admin)
router.delete('/delete/:id', verifyToken, checkRole(['hostel', 'admin']), (req, res) => {
    const { id } = req.params;
    const sql = "DELETE FROM hostel_items WHERE id=?";
    db.query(sql, [id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Hostel item deleted successfully' });
    });
});

module.exports = router;