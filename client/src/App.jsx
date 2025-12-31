import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';


// Import the new component
import LandingPage from './components/LandingPage';

import SelectionPage from './components/SelectionPage';
import LoginPage from './components/LoginPage';           // The Dark Theme Login
import RegistrationPage from './components/RegistrationPage';

import AdminLoginPage from './components/AdminLoginPage';
import AdminDashboard from './components/AdminDashboard';

import StudentDashboard from './components/StudentDashboard';
import StaffDashboard from './components/StaffDashboard'; // Single component for all staff dashboards


function App() {
  

  return (
      <Router>
      <Routes>
        {/* 1. First Screen: Dark Theme (Admin vs User) */}
        <Route path="/" element={<LandingPage />} />

        {/* 2. Second Screen: Green Theme (Student/Hostel/Canteen Selection) */}
        <Route path="/user-selection" element={<SelectionPage />} />

        {/* Dynamic User Routes */}
        <Route path="/login/:role" element={<LoginPage />} />
        <Route path="/register/:role" element={<RegistrationPage />} />

        {/* 3. SPECIFIC ROUTE FOR ADMIN LOGIN */}
        <Route path="/login/admin" element={<AdminLoginPage />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
      
        <Route path="/student/dashboard" element={<StudentDashboard />} />

        {/* ✅ STAFF DASHBOARDS (All use the same component) */}
        <Route path="/canteen/dashboard" element={<StaffDashboard />} />
        <Route path="/stationery/dashboard" element={<StaffDashboard />} />
        <Route path="/hostel/dashboard" element={<StaffDashboard />} />
      </Routes>
    </Router>
  
  )
}

export default App
