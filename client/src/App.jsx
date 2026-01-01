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
import CanteenDashboard from './components/CanteenDashboard';
import StationeryDashboard from './components/StationeryDashboard';
import HostelDashboard from './components/HostelDashboard';



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

        {/* ✅ UPDATE ROUTES TO USE SPECIFIC COMPONENTS */}
        <Route path="/canteen/dashboard" element={<CanteenDashboard />} />
        <Route path="/stationery/dashboard" element={<StationeryDashboard />} />
        <Route path="/hostel/dashboard" element={<HostelDashboard />} />
        
      </Routes>
    </Router>
  
  )
}

export default App
