import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const StudentDashboard = () => {
  const navigate = useNavigate();
  
  // --- STATE ---
  const [activeTab, setActiveTab] = useState('canteen'); // 'canteen', 'stationery', 'hostel'
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userName, setUserName] = useState('Student');

  // --- FETCH DATA BASED ON TAB ---
  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Get User Name from token or local storage if you saved it
      // For now, we just assume token is valid.
      if (!token) {
          navigate('/login/student');
          return;
      }

      try {
        let url = '';
        // Select URL based on active tab (using routes we made in Phase 1)
        if (activeTab === 'canteen') url = 'http://localhost:5000/api/student/canteen-menu';
        if (activeTab === 'stationery') url = 'http://localhost:5000/api/student/stationery-list';
        if (activeTab === 'hostel') url = 'http://localhost:5000/api/student/hostel-status';

        const response = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setItems(response.data);

      } catch (err) {
        console.error("Error loading items:", err);
        if (err.response && err.response.status === 403) {
            alert("Session expired or access denied.");
            navigate('/login/student');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [activeTab, navigate]);

  // --- HANDLERS ---
  const handleLogout = () => {
    localStorage.clear();
    navigate('/login/student');
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white font-sans">
      
      {/* --- NAVBAR --- */}
      <nav className="bg-[#1e293b] border-b border-slate-700 px-6 py-4 flex justify-between items-center sticky top-0 z-50">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Student <span className="text-blue-500">Portal</span>
          </h1>
        </div>
        <div className="flex gap-4 items-center">
          <div className="text-right hidden sm:block">
            <p className="text-xs text-slate-400">Welcome back,</p>
            <p className="text-sm font-bold">{userName}</p>
          </div>
          <button 
            onClick={handleLogout}
            className="bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/30 px-4 py-2 rounded-lg text-xs font-bold transition"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* --- MAIN CONTENT --- */}
      <main className="max-w-7xl mx-auto p-6">
        
        {/* --- TABS --- */}
        <div className="flex justify-center mb-8 gap-4">
          <TabButton label="🍔 Canteen" isActive={activeTab === 'canteen'} onClick={() => setActiveTab('canteen')} />
          <TabButton label="✏️ Stationery" isActive={activeTab === 'stationery'} onClick={() => setActiveTab('stationery')} />
          <TabButton label="🛏️ Hostel" isActive={activeTab === 'hostel'} onClick={() => setActiveTab('hostel')} />
        </div>

        {/* --- GRID DISPLAY --- */}
        {loading ? (
          <div className="text-center py-20 text-slate-500 animate-pulse">Loading items...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {items.length > 0 ? (
              items.map((item) => (
                <div key={item.id} className="bg-[#1e293b] rounded-xl border border-slate-700 overflow-hidden hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10 transition group">
                  
                  {/* Card Header (Image Placeholder or Icon) */}
                  <div className="h-32 bg-slate-800 flex items-center justify-center text-4xl">
                    {activeTab === 'canteen' ? '🍟' : activeTab === 'stationery' ? '📚' : '🏨'}
                  </div>

                  {/* Card Body */}
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-lg text-white group-hover:text-blue-400 transition">
                        {item.item_name || item.room_number}
                      </h3>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
                        item.status === 'Available' || item.availability_status === 'Available' 
                        ? 'bg-emerald-900/30 text-emerald-400 border-emerald-900' 
                        : 'bg-red-900/30 text-red-400 border-red-900'
                      }`}>
                        {item.status || item.availability_status || 'Stock: ' + item.stock_level}
                      </span>
                    </div>

                    <p className="text-sm text-slate-400 mb-4 line-clamp-2">
                      {activeTab === 'hostel' ? `Type: ${item.type}` : 'Fresh and available now.'}
                    </p>

                    <div className="flex justify-between items-center mt-auto">
                      <span className="text-xl font-bold text-white">
                        ₹{item.price || item.fees}
                      </span>
                      
                      <button 
                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition shadow-lg shadow-blue-900/20"
                        onClick={() => alert(`Clicked on ${item.item_name || item.room_number}`)}
                      >
                        {activeTab === 'hostel' ? 'View Details' : 'Add to Cart'}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-4 text-center py-20 text-slate-500">
                No items found in this category.
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

// Internal Component for Tab Styling
const TabButton = ({ label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`px-6 py-3 rounded-full font-bold text-sm transition-all duration-300 transform hover:-translate-y-1 ${
      isActive 
      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 scale-105' 
      : 'bg-[#1e293b] text-slate-400 border border-slate-700 hover:border-slate-500 hover:text-white'
    }`}
  >
    {label}
  </button>
);

export default StudentDashboard;