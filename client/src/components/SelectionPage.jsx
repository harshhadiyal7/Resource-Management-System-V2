// frontend/src/components/SelectionPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

const SelectionPage = () => {
  const navigate = useNavigate();

  // Helper function to handle navigation cleanly
  const handleRoleSelect = (role) => {
    // Navigate to the login page, passing the selected role in the URL
    navigate(`/login/${role}`);
  };

  return (
    // 1. Outer Container: Full height, Seafoam Green background, flex centered
    <div className="min-h-screen flex items-center justify-center bg-[#7FFFD4] p-4">
      
      {/* 2. The Card: Beige background, rounded corners, shadow */}
      <div className="bg-[#FAEBD7] w-full max-w-sm p-8 rounded-2xl shadow-2xl text-center border-t-4 border-[#2E8B57]">
        
        {/* Title */}
        <h1 className="text-3xl font-serif font-extrabold text-gray-800 mb-10 tracking-wide">
          Resource Management
        </h1>

        {/* Button Container: Vertically stacked with gaps */}
        <div className="flex flex-col space-y-5">
          
          {/* Student Button */}
          <SelectionButton 
            label="Student Login" 
            onClick={() => handleRoleSelect('student')} 
          />

          {/* Hostel Button */}
          <SelectionButton 
            label="Hostel Login" 
            onClick={() => handleRoleSelect('hostel')} 
          />

          {/* Canteen Button */}
          <SelectionButton 
            label="Canteen Login" 
            onClick={() => handleRoleSelect('canteen')} 
          />

          {/* Stationery Button */}
          <SelectionButton 
            label="Stationery Login" 
            onClick={() => handleRoleSelect('stationery')} 
          />

          {/* Hidden Admin Link (Optional convenience for you) */}
          <div className="mt-6 pt-4 border-t border-gray-300">
            <p 
              onClick={() => handleRoleSelect('admin')}
              className="text-xs text-gray-500 cursor-pointer hover:underline hover:text-black transition"
            >
              Admin Access
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

// Internal component to keep buttons consistent and code clean
const SelectionButton = ({ label, onClick }) => {
  return (
    <button
      onClick={onClick}
      // Tailwind classes for the green button style matching your design
      className="w-full bg-[#2E8B57] hover:bg-green-900 text-white text-lg font-bold py-3 px-6 rounded-xl shadow-md transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg"
    >
      {label}
    </button>
  );
};

export default SelectionPage;