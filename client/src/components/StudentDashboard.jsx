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

  // --- FETCH DATA ---
  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
          navigate('/login/student');
          return;
      }

      try {
        let url = '';
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
            alert("Session expired.");
            navigate('/login/student');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [activeTab, navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login/student');
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white font-sans">
      
      {/* --- NAVBAR --- */}
      <nav className="bg-[#1e293b] border-b border-slate-700 px-6 py-4 flex justify-between items-center sticky top-0 z-50 shadow-md">
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
          <button onClick={handleLogout} className="bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/30 px-4 py-2 rounded-lg text-xs font-bold transition">
            Logout
          </button>
        </div>
      </nav>

      {/* --- MAIN CONTENT --- */}
      <main className="max-w-7xl mx-auto p-6">
        
        {/* --- TABS --- */}
        <div className="flex justify-center mb-10 gap-4">
          <TabButton label="🍔 Canteen" isActive={activeTab === 'canteen'} onClick={() => setActiveTab('canteen')} color="amber" />
          <TabButton label="✏️ Stationery" isActive={activeTab === 'stationery'} onClick={() => setActiveTab('stationery')} color="purple" />
          <TabButton label="🛏️ Hostel" isActive={activeTab === 'hostel'} onClick={() => setActiveTab('hostel')} color="emerald" />
        </div>

        {/* --- GRID DISPLAY --- */}
        {loading ? (
          <div className="text-center py-20 text-slate-500 animate-pulse">Loading items...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.length > 0 ? (
              items.map((item) => {
                // Render specific card based on tab
                if (activeTab === 'canteen') return <CanteenCard key={item.id} item={item} />;
                if (activeTab === 'stationery') return <StationeryCard key={item.id} item={item} />;
                if (activeTab === 'hostel') return <HostelCard key={item.id} item={item} />;
                return null;
              })
            ) : (
              <div className="col-span-full text-center py-20 bg-[#1e293b]/50 rounded-2xl border border-dashed border-slate-700 text-slate-500">
                No items found currently.
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

// --- 1. CANTEEN CARD (Food Menu Style) ---
const CanteenCard = ({ item }) => {
    const isAvailable = (item.status || 'Available').toLowerCase() === 'available';
    
    return (
        <div className="bg-[#1e293b] rounded-2xl border border-slate-700 overflow-hidden hover:border-amber-500/50 hover:shadow-[0_0_20px_rgba(245,158,11,0.1)] transition group flex flex-col h-full">
            <div className="h-32 bg-slate-800/50 flex items-center justify-center text-5xl relative overflow-hidden group-hover:bg-amber-900/10 transition">
                🍔
                <div className={`absolute top-3 right-3 text-[10px] font-bold px-2 py-1 rounded uppercase ${isAvailable ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
                    {item.status || 'Available'}
                </div>
            </div>
            <div className="p-5 flex flex-col flex-1">
                <div className="flex-1">
                    <h3 className="font-bold text-lg text-white mb-1 group-hover:text-amber-400 transition">{item.item_name}</h3>
                    <p className="text-xs text-slate-400 mb-3">Serving: {item.quantity || 'Standard Portion'}</p>
                </div>
                <div className="flex justify-between items-center mt-4">
                    <span className="text-xl font-bold text-white">₹{item.price}</span>
                    <button className="bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold px-4 py-2 rounded-full transition shadow-lg shadow-amber-900/20">
                        Add to Plate
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- 2. STATIONERY CARD (Shop Inventory Style) ---
const StationeryCard = ({ item }) => {
    return (
        <div className="bg-[#1e293b] rounded-2xl border border-slate-700 overflow-hidden hover:border-purple-500/50 hover:shadow-[0_0_20px_rgba(168,85,247,0.1)] transition group flex flex-col h-full">
            <div className="h-24 bg-slate-800/50 flex items-center justify-center text-4xl group-hover:bg-purple-900/10 transition">
                ✏️
            </div>
            <div className="p-5 flex flex-col flex-1">
                <div className="flex-1">
                    <h3 className="font-bold text-lg text-white mb-2 group-hover:text-purple-400 transition">{item.item_name}</h3>
                    <div className="flex items-center gap-2 mb-4">
                        <span className="text-[10px] bg-purple-900/30 text-purple-300 px-2 py-0.5 rounded border border-purple-900/50">
                            Stock: {item.stock_level || 'Out of Stock'}
                        </span>
                    </div>
                </div>
                <div className="flex justify-between items-center border-t border-slate-700 pt-4 mt-auto">
                    <span className="text-lg font-bold text-white">₹{item.price}</span>
                    <button className="text-purple-400 hover:text-white text-xs font-bold underline decoration-purple-500 decoration-2 underline-offset-4 hover:no-underline transition">
                        Purchase
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- 3. HOSTEL CARD (Room Booking Style) ---
const HostelCard = ({ item }) => {
    // Robust Status Check
    const statusText = item.availability_status || item.status || 'available';
    const isAvailable = statusText.toLowerCase() === 'available';
    const badgeClass = isAvailable 
        ? 'text-emerald-400 border-emerald-900 bg-emerald-900/20' 
        : 'text-red-400 border-red-900 bg-red-900/20';

    return (
        <div className="bg-[#1e293b] rounded-2xl border border-slate-700 p-5 hover:border-emerald-500/50 hover:shadow-[0_0_20px_rgba(16,185,129,0.1)] transition group relative h-full flex flex-col">
            <div className="flex justify-between items-start mb-4">
                <div className="bg-slate-800 p-3 rounded-lg text-2xl">🛏️</div>
                <span className={`text-[10px] font-bold px-2 py-1 rounded border uppercase ${badgeClass}`}>
                    {statusText}
                </span>
            </div>
            
            <div className="mb-6 flex-1">
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Room No.</div>
                <h3 className="text-3xl font-bold text-white mb-2">{item.room_number || item.item_name}</h3>
                <div className="inline-flex items-center gap-1.5 bg-slate-800/50 px-2 py-1 rounded text-xs text-slate-300">
                    <span>❄️</span> {item.type || 'Standard Room'}
                </div>
            </div>

            <button className={`w-full py-2 rounded-lg text-xs font-bold transition border ${isAvailable ? 'border-emerald-500 text-emerald-400 hover:bg-emerald-500 hover:text-white' : 'border-slate-700 text-slate-500 cursor-not-allowed'}`}>
                {isAvailable ? 'Request Booking' : 'Occupied'}
            </button>
        </div>
    );
};

// --- TAB BUTTON COMPONENT ---
const TabButton = ({ label, isActive, onClick, color }) => {
    // Dynamic color mapping
    const activeColors = {
        amber: 'bg-amber-500 shadow-amber-500/30',
        purple: 'bg-purple-600 shadow-purple-500/30',
        emerald: 'bg-emerald-600 shadow-emerald-500/30'
    };

    return (
        <button
            onClick={onClick}
            className={`px-6 py-3 rounded-full font-bold text-sm transition-all duration-300 transform hover:-translate-y-1 ${
                isActive 
                ? `${activeColors[color]} text-white shadow-lg scale-105` 
                : 'bg-[#1e293b] text-slate-400 border border-slate-700 hover:border-slate-500 hover:text-white'
            }`}
        >
            {label}
        </button>
    );
};

export default StudentDashboard;