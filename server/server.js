const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken'); // Import JWT
require('dotenv').config();

// 1. Import Database Connection
const db = require('./db');

// 2. Import Route Files
const canteenRoutes = require('./routes/canteen');
const stationeryRoutes = require('./routes/stationery');
const hostelRoutes = require('./routes/hostel');
const adminRoutes = require('./routes/admin');
const studentRoutes = require('./routes/student');

const app = express();

// Secret Key for Security (In real apps, put this in .env file)
const SECRET_KEY = process.env.JWT_SECRET;

// Middleware
app.use(cors({
    origin: ["https://harsh-rms.netlify.app", "http://localhost:5173"],
    credentials: true
}));
app.use(express.json());

// ==========================================
// AUTHENTICATION API (Login & Register)
// ==========================================

// 1. LOGIN ROUTE
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    // DELETE THIS LINE -> res.json({ message: "Login works!" }); 

    console.log("Login attempted for:", email);

    // A. Check Admin Table
    const adminSql = "SELECT * FROM admin_info WHERE email = ? AND password = ?";
    db.query(adminSql, [email, password], (err, adminData) => {
        if (err) return res.status(500).json({ error: "Database error" });

        // Helper function to send response with Token
        const sendToken = (user) => {
            const token = jwt.sign(
                { id: user.id, role: user.role },
                process.env.JWT_SECRET || 'your_secret_key', // Ensure secret exists
                { expiresIn: '2h' }
            );

            res.json({
                message: "Login successful",
                token: token,
                user: {
                    id: user.id,
                    email: user.email,
                    role: user.role,
                    name: user.full_name || "Admin"
                }
            });
        };

        if (adminData.length > 0) {
            // Found Admin -> Send Admin Token
            return sendToken({ id: adminData[0].id, role: 'admin', email: adminData[0].email });
        }

        // B. If not Admin, check Users Table
        // B. Check Users Table
        const userSql = "SELECT * FROM users WHERE email = ?";
        db.query(userSql, [email], async (err, userData) => {
            if (err) return res.status(500).json({ error: "Database error" });

            if (userData.length === 0) {
                return res.status(401).json({ message: "User does not exist." });
            }

            const user = userData[0];

            // 1. CHECK IF DELETED
            if (user.status === 'deleted') {
                return res.status(401).json({ message: "User does not exist." });
            }

            // 2. CHECK IF DEACTIVATED
            // Note: handling case-sensitivity by converting to lowercase
            if (user.status && user.status.toLowerCase() === 'inactive') {
                return res.status(403).json({ message: "Your account is deactivated. Contact Admin." });
            }

            // 3. CHECK PASSWORD (Simple string comparison based on your previous code)
            if (user.password !== password) {
                return res.status(401).json({ message: "Invalid Password" });
            }

            // If all pass, generate token
            const token = jwt.sign(
                { id: user.id, role: user.role, status: user.status }, // Add status to token
                SECRET_KEY,
                { expiresIn: '2h' }
            );

            res.json({
                message: "Login successful",
                token: token,
                user: user
            });
        });
    });
});

// 2. REGISTER ROUTE
app.post('/register', (req, res) => {
    const { full_name, email, password, role, contact_number, gender } = req.body;

    // Security: Prevent Admin Registration
    if (role === 'admin') {
        return res.status(403).json({ message: "Admin registration is restricted." });
    }

    const sql = "INSERT INTO users (full_name, email, password, role, contact_number, gender) VALUES (?, ?, ?, ?, ?, ?)";
    db.query(sql, [full_name, email, password, role, contact_number, gender], (err, result) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ message: "Email already exists" });
            }
            return res.status(500).json({ error: err.message });
        }
        res.status(200).json({ message: "User registered successfully!" });
    });
});

// ==========================================
// MOUNT ROUTES
// ==========================================

app.use('/api/canteen', canteenRoutes);
app.use('/api/stationery', stationeryRoutes);
app.use('/api/hostel', hostelRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/student', studentRoutes);

// Start Server
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));