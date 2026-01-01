import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// --- HELPERS ---
const getCategoryIcon = (category) => {
    switch (category) {
        case 'CANTEEN': return '🍚';
        case 'STATIONERY': return '✏️';
        case 'HOSTEL': return '🛏️';
        default: return '📦';
    }
};

const getRoleBadgeStyle = (role) => {
    switch (role) {
        case 'STUDENT': return 'bg-[#1e293b] text-blue-400 border border-blue-900';
        case 'HOSTEL': return 'bg-[#1e293b] text-emerald-400 border border-emerald-900';
        case 'CANTEEN': return 'bg-[#1e293b] text-amber-400 border border-amber-900';
        case 'STATIONERY': return 'bg-[#1e293b] text-purple-400 border border-purple-900';
        case 'ADMIN': return 'bg-[#1e293b] text-red-400 border border-red-900';
        default: return 'bg-slate-700 text-slate-300';
    }
};

const AdminDashboard = () => {
    const navigate = useNavigate();

    // --- STATE ---
    const [users, setUsers] = useState([]);
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // ✅ NEW: Tab State for Filtering
    const [activeTab, setActiveTab] = useState('ALL'); // 'ALL', 'CANTEEN', 'STATIONERY', 'HOSTEL'

    // --- FETCH DATA (Initial Load) ---
    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            
            // 1. Fetch Users
            const userRes = await axios.get('http://localhost:5000/api/admin/users');
            const formattedUsers = userRes.data.map(user => ({
                id: user.id,
                name: user.full_name,
                role: user.role.toUpperCase(),
                status: user.status ? user.status.toLowerCase() : 'active' 
            }));
            setUsers(formattedUsers);

            // 2. Fetch Inventory
            const invRes = await axios.get('http://localhost:5000/api/admin/inventory');
            const formattedInventory = invRes.data.map(item => ({
                ...item,
                icon: getCategoryIcon(item.category)
            }));
            setInventory(formattedInventory);

        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    // --- BACKGROUND SYNC (Polls for updates) ---
    const fetchInventorySilent = useCallback(async () => {
        try {
            // Cache-busting with timestamp
            const invRes = await axios.get(`http://localhost:5000/api/admin/inventory?t=${Date.now()}`);
            const formattedInventory = invRes.data.map(item => ({
                ...item,
                icon: getCategoryIcon(item.category)
            }));
            setInventory(formattedInventory);
        } catch (error) {
             console.error("Background sync failed");
        }
    }, []);

    useEffect(() => {
        fetchData();
        const intervalId = setInterval(fetchInventorySilent, 3000); 
        return () => clearInterval(intervalId);
    }, [fetchData, fetchInventorySilent]);


    // --- HANDLERS ---
    const handleToggleStatus = async (userId, currentStatus) => {
        if (currentStatus === 'deleted') return;
        const isCurrentlyActive = currentStatus === 'active';
        const newStatus = isCurrentlyActive ? 'inactive' : 'active';
        const token = localStorage.getItem('token');

        try {
            await axios.put(`http://localhost:5000/api/admin/users/${userId}/status`, { status: newStatus }, { headers: { Authorization: `Bearer ${token}` } });
            setUsers(users.map(u => u.id === userId ? { ...u, status: newStatus } : u));
        } catch (err) { alert("Failed to update status."); }
    };

    const handleDelete = async (userId, currentStatus) => {
        if (currentStatus === 'deleted') return; 
        if (window.confirm(`Delete User ID: ${userId}?`)) {
            const token = localStorage.getItem('token');
            try {
                await axios.delete(`http://localhost:5000/api/admin/users/${userId}`, { headers: { Authorization: `Bearer ${token}` } });
                setUsers(users.map(u => u.id === userId ? { ...u, status: 'deleted' } : u));
            } catch (err) { alert("Failed to delete user."); }
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login/admin');
    };

    // --- FILTER LOGIC ---
    const filteredInventory = activeTab === 'ALL' 
        ? inventory 
        : inventory.filter(item => item.category === activeTab);

    return (
        <div className="min-h-screen bg-[#0B1120] text-white p-6 font-sans">
            <div className="max-w-7xl mx-auto">
                <header className="flex justify-between items-center mb-8">
                    <h1 className="text-2xl font-bold">System <span className="text-blue-500">Administration</span></h1>
                    <button onClick={fetchData} className="bg-blue-600 px-6 py-2 rounded-full text-sm font-bold shadow-lg shadow-blue-900/20 hover:bg-blue-700 transition">
                        Refresh System
                    </button>
                </header>

                {/* USERS SECTION */}
                <section className="bg-[#151f32] rounded-xl border border-slate-800 p-6 mb-8">
                    <h2 className="text-lg font-semibold mb-4 text-white">User Access Control</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-xs uppercase text-slate-500 border-b border-slate-800"><th className="pb-4 pl-4">User</th><th className="pb-4">Role</th><th className="pb-4">Status</th><th className="pb-4 text-right pr-4">Action</th></tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/50 text-sm">
                                {users.map((user) => {
                                    const isActive = user.status === 'active';
                                    const isDeleted = user.status === 'deleted';
                                    return (
                                        <tr key={user.id} className="hover:bg-slate-800/30 transition">
                                            <td className="py-4 pl-4 font-bold">{user.name}</td>
                                            <td className="py-4"><span className={`px-2 py-1 rounded text-[10px] font-bold ${getRoleBadgeStyle(user.role)}`}>{user.role}</span></td>
                                            <td className="py-4"><span className={`text-xs font-bold ${isDeleted ? 'text-slate-500' : isActive ? 'text-emerald-500' : 'text-red-500'}`}>{isDeleted ? 'DELETED' : user.status.toUpperCase()}</span></td>
                                            <td className="py-4 text-right pr-4">
                                                {!isDeleted ? (
                                                    <><button onClick={() => handleToggleStatus(user.id, user.status)} className="text-xs font-bold mr-3 text-blue-400 hover:text-white transition">{isActive ? 'Deactivate' : 'Activate'}</button>
                                                    <button onClick={() => handleDelete(user.id, user.status)} className="text-xs font-bold text-red-400 hover:text-white transition">Delete</button></>
                                                ) : <button onClick={() => handleToggleStatus(user.id, user.status)} className="text-xs font-bold text-blue-400 hover:text-white transition">RESTORE</button>}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* INVENTORY SECTION */}
                <section className="bg-[#151f32] rounded-xl border border-slate-800 p-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                        <div className="flex items-center gap-4">
                            <h2 className="text-lg font-semibold text-white">Live Inventory Monitor</h2>
                            <div className="flex items-center gap-2 text-[10px] text-emerald-400 bg-emerald-900/20 px-2 py-1 rounded-full animate-pulse border border-emerald-900/50">
                                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span>
                                LIVE SYNC
                            </div>
                        </div>

                        {/* ✅ NEW: TABS UI */}
                        <div className="flex gap-2 bg-[#0B1120] p-1 rounded-lg border border-slate-800">
                            {['ALL', 'CANTEEN', 'STATIONERY', 'HOSTEL'].map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
                                        activeTab === tab 
                                        ? 'bg-blue-600 text-white shadow-lg' 
                                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                                    }`}
                                >
                                    {tab === 'ALL' ? 'ALL' : tab.charAt(0) + tab.slice(1).toLowerCase()}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {filteredInventory.length > 0 ? (
                            filteredInventory.map((item, index) => {
                                // Status Logic (Case Insensitive)
                                const statusText = item.status || item.availability_status || 'available';
                                const isAvailable = statusText.toLowerCase() === 'available'; 
                                const statusBg = isAvailable 
                                    ? 'bg-emerald-900/30 text-emerald-500 border-emerald-900/50' 
                                    : 'bg-red-900/30 text-red-500 border-red-900/50';

                                return (
                                    <div key={index} className="bg-[#0B1120] rounded-xl p-5 border border-slate-800 hover:border-slate-600 transition group relative">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="w-10 h-10 rounded-lg bg-[#1e293b] flex items-center justify-center text-xl">{item.icon}</div>
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${statusBg}`}>
                                                {statusText}
                                            </span>
                                        </div>
                                        <h3 className="text-white font-bold text-lg mb-6 truncate">{item.name}</h3>
                                        <div className="flex justify-between items-center pt-4 border-t border-slate-800/50">
                                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{item.category}</span>
                                            <span className="bg-[#1e293b] text-blue-400 text-xs font-bold px-2 py-1 rounded border border-slate-700">₹{item.price}</span>
                                        </div>
                                    </div>
                                )
                            })
                        ) : (
                            <div className="col-span-4 text-center py-12 text-slate-500">
                                No items found in {activeTab.toLowerCase()}.
                            </div>
                        )}
                    </div>
                </section>
                
                <div className="mt-8 text-center">
                    <button onClick={handleLogout} className="text-red-500 text-sm font-bold hover:text-red-400 transition">Log Out of Admin System</button>
                </div>
                
            </div>
        </div>
    );
};

export default AdminDashboard;