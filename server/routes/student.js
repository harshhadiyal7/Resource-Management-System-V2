// backend/routes/student.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const { verifyToken, checkRole } = require('../middleware/auth');

// Apply verifyToken to all routes in this file automatically
// This is a shortcut so you don't have to type it on every line
router.use(verifyToken);

// 1. GET Canteen Menu
router.get('/canteen-menu', checkRole(['student', 'admin']), (req, res) => {
    const sql = "SELECT * FROM canteen_items ORDER BY status ASC, item_name ASC";
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// 2. GET Stationery List
router.get('/stationery-list', checkRole(['student', 'admin']), (req, res) => {
    const sql = "SELECT * FROM stationery_items ORDER BY category ASC";
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// 3. GET Hostel Status
router.get('/hostel-status', checkRole(['student', 'admin']), (req, res) => {
    const sql = "SELECT * FROM hostel_items ORDER BY availability_status ASC";
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

module.exports = router;