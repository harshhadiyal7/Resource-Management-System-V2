const jwt = require('jsonwebtoken');
const db = require('../db'); // Import your database connection
require('dotenv').config();

const SECRET_KEY = process.env.JWT_SECRET || "supersecretkey123";

// 1. Verify Token AND Check Live DB Status
const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(403).json({ message: "No token provided. Access denied." });
    }

    // Remove "Bearer " prefix
    const tokenPart = token.split(' ')[1] || token;

    jwt.verify(tokenPart, SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: "Invalid or expired token." });
        }

        // --- CRITICAL STEP: CHECK LIVE STATUS IN DATABASE ---
        const sql = "SELECT status FROM users WHERE id = ?";
        db.query(sql, [decoded.id], (dbErr, results) => {
            if (dbErr) {
                return res.status(500).json({ message: "Database error checking status." });
            }

            // If user doesn't exist anymore (hard deleted)
            if (results.length === 0) {
                return res.status(403).json({ message: "User account not found. Auto-logout." });
            }

            const currentStatus = results[0].status; // e.g., 'active', 'inactive', 'deleted'

            // Check if Deactivated or Deleted
            if (currentStatus === 'inactive' || currentStatus === 'deleted') {
                // Return a specific 403 error that the Frontend will watch for
                return res.status(403).json({ 
                    message: "ACCOUNT_DEACTIVATED", // Special keyword for frontend
                    error: "Your account has been deactivated or deleted by Admin." 
                });
            }

            // If Active, proceed
            req.user = decoded; 
            next();
        });
    });
};

// 2. Check Role (Authorization)
const checkRole = (allowedRoles) => {
    return (req, res, next) => {
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ message: "You do not have permission." });
        }
        next();
    };
};

module.exports = { verifyToken, checkRole };