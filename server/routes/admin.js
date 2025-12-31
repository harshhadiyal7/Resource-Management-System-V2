const express = require('express');
const router = express.Router();
const db = require('../db'); // Ensure this path points to your db.js connection file

// 1. GET ALL USERS (Updated: Show ALL users including deleted ones)
router.get('/users', (req, res) => {
    // REMOVED "WHERE status != 'deleted'" so we can see everyone
    const sql = "SELECT id, full_name, email, role, status FROM users ORDER BY id DESC";
    db.query(sql, (err, data) => {
        if (err) return res.status(500).json({ error: "Error fetching users" });
        res.json(data);
    });
});

// 2. SOFT DELETE USER (Remains the same - sets status to 'deleted')
router.delete('/users/:id', (req, res) => {
    const id = req.params.id;
    const sql = "UPDATE users SET status = 'deleted' WHERE id = ?";
    db.query(sql, [id], (err, result) => {
        if (err) return res.status(500).json({ error: "Error deleting user" });
        res.json({ message: "User deleted successfully" });
    });
});
// 3. ACTIVATE / DEACTIVATE USER (FIXED)
router.put('/users/:id/status', (req, res) => {
    const id = req.params.id;
    const { status } = req.body; 

    // Convert input to lowercase just in case frontend sends "Active"
    const validStatus = status ? status.toLowerCase() : '';

    // STRICT VALIDATION: Must be 'active' or 'inactive' to match DB ENUM
    if (validStatus !== 'active' && validStatus !== 'inactive') {
        return res.status(400).json({ error: "Invalid status. Must be 'active' or 'inactive'." });
    }

    const sql = "UPDATE users SET status = ? WHERE id = ?";
    db.query(sql, [validStatus, id], (err, result) => {
        if (err) {
            console.error(err); // Log exact SQL error
            return res.status(500).json({ error: "Database error updating status" });
        }
        res.json({ message: `User status updated to ${validStatus}` });
    });
});

// 4. GET ALL INVENTORY (Aggregated from 3 tables)
router.get('/inventory', (req, res) => {
    const inventoryData = [];

    // Query 1: Canteen
    const sqlCanteen = "SELECT id, item_name as name, price, 'CANTEEN' as category, 'Available' as status FROM canteen_items"; 
    // Query 2: Stationery
    const sqlStationery = "SELECT id, item_name as name, price, 'STATIONERY' as category, 'Available' as status FROM stationery_items";
    // Query 3: Hostel
   const sqlHostel = "SELECT id, item_name as name, 0 as price, 'HOSTEL' as category, availability_status as status FROM hostel_items";
    // Execute sequentially
    db.query(sqlCanteen, (err, canteenItems) => {
        if (!err) inventoryData.push(...canteenItems);

        db.query(sqlStationery, (err, stationeryItems) => {
            if (!err) inventoryData.push(...stationeryItems);

            db.query(sqlHostel, (err, hostelItems) => {
                if (!err) inventoryData.push(...hostelItems);
                
                // Send combined list
                res.json(inventoryData);
            });
        });
    });
});

module.exports = router;