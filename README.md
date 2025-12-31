# 🎓 University Resource Management System

A comprehensive Full-Stack web application designed to streamline resource management across university departments. This system connects Students, Hostel Staff, Canteen Vendors, and Stationery Managers into a single unified platform.

> **Note:** This project has been architecturally migrated from **MongoDB to MySQL** to ensure strict data consistency and better relationship handling.

## 🚀 Features

### 🛡️ Admin Portal
* **User Access Control:** View all registered users with real-time status.
* **Soft Delete System:** Users are marked as "Deleted" instead of being removed, preserving history.
* **Live Status Toggles:** Instantly activate, deactivate, or restore user accounts.
* **Global Inventory Monitor:** View stock levels across all departments in one dashboard.

### 🏪 Vendor & Staff Dashboards
* **Role-Specific Views:** Customized dashboards for Hostel, Canteen, and Stationery staff.
* **Inventory Management:** Add, Edit, and Delete items dynamically.
* **Smart Forms:** Input fields change automatically based on the logged-in role (e.g., "Room Type" for Hostel vs. "Stock Level" for Stationery).

### 👨‍🎓 Student Portal
* **Digital Menu & Availability:** Students can check real-time availability of hostel rooms, canteen food, and stationery items.
* **Secure Login:** JWT-based authentication with auto-logout on account deactivation.

## 🛠️ Tech Stack

* **Frontend:** React.js, Tailwind CSS, Axios
* **Backend:** Node.js, Express.js
* **Database:** MySQL (Relational Data Model)
* **Authentication:** JSON Web Tokens (JWT) & Bcrypt

## ⚙️ Installation & Setup

1.  **Clone the repository**
    ```bash
    git clone [https://github.com/your-username/resource-management-system.git](https://github.com/your-username/resource-management-system.git)
    cd resource-management-system
    ```

2.  **Database Setup (MySQL)**
    * Create a database named `resource_db`.
    * Import the SQL schema (tables for `users`, `canteen_items`, `stationery_items`, `hostel_items`).

3.  **Backend Setup**
    ```bash
    cd backend
    npm install
    # Create a .env file with:
    # DB_HOST=localhost
    # DB_USER=root
    # DB_PASSWORD=your_password
    # DB_NAME=resource_db
    # JWT_SECRET=your_secret_key
    npm run dev
    ```

4.  **Frontend Setup**
    ```bash
    cd frontend
    npm install
    npm start
    ```

## 📸 Screenshots

*(You can upload your screenshots to the repo and link them here later)*

---

**Developed by [Your Name]**