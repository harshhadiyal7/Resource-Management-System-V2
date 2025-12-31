// frontend/src/components/LandingPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    // Dark Blue Background
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4">
      
      {/* Dark Card */}
      <div className="bg-[#1e293b] w-full max-w-sm p-10 rounded-2xl shadow-2xl border border-slate-700 text-center">
        
        {/* Title */}
        <h1 className="text-3xl font-serif font-bold text-white mb-10 tracking-wide leading-relaxed">
          Resource <br /> Management
        </h1>

        {/* Buttons */}
        <div className="flex flex-col space-y-5">
          
          {/* Admin Button -> Goes directly to Admin Login */}
          <button
            onClick={() => navigate('/login/admin')}
            className="w-full bg-[#2563EB] hover:bg-blue-700 text-white text-lg font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
          >
            Admin
          </button>

          {/* User Button -> Goes to the Green Page to pick Student/Hostel etc */}
          <button
            onClick={() => navigate('/user-selection')}
            className="w-full bg-[#2563EB] hover:bg-blue-700 text-white text-lg font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
          >
            User
          </button>

        </div>
      </div>
    </div>
  );
};

export default LandingPage;