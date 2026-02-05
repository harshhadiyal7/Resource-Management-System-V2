// frontend/src/components/RegistrationPage.jsx
import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const RegistrationPage = () => {
  const { role } = useParams();
  const navigate = useNavigate();
  const displayRole = role ? role.charAt(0).toUpperCase() + role.slice(1) : 'User';

  const [formData, setFormData] = useState({
    full_name: '',
    contact_number: '',
    gender: '',
    email: '',
    password: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // --- Validation ---
    if (!formData.gender) {
      setError('Please select your gender.');
      setLoading(false);
      return;
    }
    // Check for exactly 10 digits
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(formData.contact_number)) {
      setError('Contact number must be exactly 10 digits.');
      setLoading(false);
      return;
    }

    try {
      // Add 'role' to the data before sending
      const payload = { ...formData, role: role };
      
      await axios.post('http://https://harsh-rms.vercel.app/register', payload);

      alert("Registration Successful! Please Login.");
      navigate(`/login/${role}`);

    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = "w-full bg-[#111827] border border-slate-700 text-white p-3 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors placeholder-gray-500";

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4">
      
      <div className="bg-[#1e293b] w-full max-w-md p-8 rounded-2xl shadow-2xl border border-slate-700">
        
        <h2 className="text-2xl font-serif font-bold text-white text-center mb-6 tracking-wide">
          {displayRole} Registration
        </h2>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-400 p-2 rounded mb-4 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Full Name */}
          <input
            type="text"
            name="full_name"
            placeholder="Enter Full Name"
            value={formData.full_name}
            onChange={handleChange}
            className={inputStyle}
            required
          />

          {/* Contact Number */}
          <input
            type="tel"
            name="contact_number"
            placeholder="Enter Contact Number"
            value={formData.contact_number}
            onChange={handleChange}
            className={inputStyle}
            maxLength="10" 
            required
          />

          {/* Gender Select */}
          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className={`${inputStyle} appearance-none cursor-pointer`}
            required
          >
            <option value="" disabled className="text-gray-500">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>

          {/* Email */}
          <input
            type="email"
            name="email"
            placeholder="Enter Email Address"
            value={formData.email}
            onChange={handleChange}
            className={inputStyle}
            required
          />

          {/* Password */}
          <input
            type="password"
            name="password"
            placeholder="Create Password"
            value={formData.password}
            onChange={handleChange}
            className={inputStyle}
            required
          />

          {/* Register Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-[#2563EB] hover:bg-blue-600 text-white font-semibold py-3 rounded-lg transition-all duration-200 shadow-lg shadow-blue-500/20 mt-2 ${loading ? 'opacity-50' : ''}`}
          >
            {loading ? 'Registering...' : 'Register'}
          </button>

        </form>

        <div className="mt-4 text-center text-sm text-gray-500">
          <Link to={`/login/${role}`} className="hover:text-white transition">
             ← Back to Login
          </Link>
        </div>

      </div>
    </div>
  );
};

export default RegistrationPage;