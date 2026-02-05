// frontend/src/components/LoginPage.jsx
import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const LoginPage = () => {
  const { role } = useParams(); // Gets 'student', 'canteen', etc.
  const navigate = useNavigate();

  // Capitalize first letter for Title (e.g., "Student Login")
  const displayRole = role ? role.charAt(0).toUpperCase() + role.slice(1) : 'User';

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('http://https://harsh-rms.vercel.app/login', formData);
      
      // Check if role matches (Security)
      if (response.data.user.role !== role) {
        setError(`Access Denied. You are not a ${displayRole}.`);
        setLoading(false);
        return;
      }

      // Success
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('role', role);
      alert("Login Successful!");
      navigate(`/${role}/dashboard`); // Redirect to dashboard

    } catch (err) {
      setError(err.response?.data?.message || 'Invalid Email or Password');
    } finally {
      setLoading(false);
    }
  };

  // Shared Styles
  const inputStyle = "w-full bg-[#111827] border border-slate-700 text-white p-3 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors placeholder-gray-500";

  return (
    // Dark Blue Background
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4">
      
      {/* Dark Card */}
      <div className="bg-[#1e293b] w-full max-w-sm p-8 rounded-2xl shadow-2xl border border-slate-700">
        
        <h2 className="text-2xl font-serif font-bold text-white text-center mb-8 tracking-wide">
          {displayRole} Login
        </h2>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-400 p-2 rounded mb-4 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          
          <div>
            <input
              type="email"
              name="email"
              placeholder="Enter Email Address"
              value={formData.email}
              onChange={handleChange}
              className={inputStyle}
              required
            />
          </div>

          <div>
            <input
              type="password"
              name="password"
              placeholder="Enter Password..."
              value={formData.password}
              onChange={handleChange}
              className={inputStyle}
              required
            />
          </div>

          {/* Links */}
          <div className="text-sm text-gray-400 mt-2">
             Don't have an account?{' '}
             <Link to={`/register/${role}`} className="text-[#2563EB] hover:text-blue-400 hover:underline transition">
               Register
             </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-[#2563EB] hover:bg-blue-600 text-white font-semibold py-3 rounded-lg transition-all duration-200 shadow-lg shadow-blue-500/20 mt-4 ${loading ? 'opacity-50' : ''}`}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>

        </form>
      </div>
    </div>
  );
};

export default LoginPage;