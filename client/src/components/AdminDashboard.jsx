import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// --- HELPERS ---
const getRoleBadgeStyle = (role) => {
    switch (role) {
        case 'STUDENT': return 'bg-blue-900/30 text-blue-400 border border-blue-800';
        case 'HOSTEL': return 'bg-emerald-900/30 text-emerald-400 border border-emerald-800';
        case 'CANTEEN': return 'bg-amber-900/30 text-amber-400 border border-amber-800';
        case 'STATIONERY': return 'bg-purple-900/30 text-purple-400 border border-purple-800';
        case 'ADMIN': return 'bg-red-900/30 text-red-400 border border-red-800';
        default: return 'bg-slate-800 text-slate-300 border border-slate-700';
    }
};

// Generate Initials for Avatar (e.g. "Harsh Hadiyal" -> "HH")
const getInitials = (name) => {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

// Generate consistent avatar color based on name length
const getAvatarColor = (name) => {
    const colors = ['bg-red-500', 'bg-orange-500', 'bg-amber-500', 'bg-green-500', 'bg-emerald-500', 'bg-teal-500', 'bg-cyan-500', 'bg-blue-500', 'bg-indigo-500', 'bg-violet-500', 'bg-purple-500', 'bg-fuchsia-500', 'bg-pink-500', 'bg-rose-500'];
    const index = name ? name.length % colors.length : 0;
    return colors[index];
};

const AdminDashboard = () => {
    const navigate = useNavigate();

    // --- STATE ---
    const [users, setUsers] = useState([]);
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('ALL');
    const [searchTerm, setSearchTerm] = useState(''); // 🔍 New Search State

    // --- FETCH DATA ---
    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            if (!token) return navigate('/login/admin');

            const userRes = await axios.get('http://https://harsh-rms.vercel.app/api/admin/users', { headers: { Authorization: `Bearer ${token}` } });
            const formattedUsers = userRes.data.map(user => ({
                id: user.id,
                name: user.full_name,
                role: user.role.toUpperCase(),
                status: user.status ? user.status.toLowerCase() : 'active'
            }));
            setUsers(formattedUsers);

            const invRes = await axios.get('http://https://harsh-rms.vercel.app/api/admin/inventory', { headers: { Authorization: `Bearer ${token}` } });
            setInventory(invRes.data);

        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    // --- SILENT SYNC ---
    const fetchInventorySilent = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            const invRes = await axios.get(`http://https://harsh-rms.vercel.app/api/admin/inventory?t=${Date.now()}`, { headers: { Authorization: `Bearer ${token}` } });
            setInventory(invRes.data);
        } catch (error) { console.error("Sync failed"); }
    }, []);

    useEffect(() => {
        fetchData();
        const intervalId = setInterval(fetchInventorySilent, 3000);
        return () => clearInterval(intervalId);
    }, [fetchData, fetchInventorySilent]);

    // --- HANDLERS ---
    const handleToggleStatus = async (userId, currentStatus) => {
        // 1. Calculate the new status
        let newStatus;

        if (currentStatus === 'deleted') {
            newStatus = 'active'; // RESTORE: Deleted -> Active
        } else {
            // TOGGLE: Active <-> Inactive
            newStatus = (currentStatus === 'active') ? 'inactive' : 'active';
        }

        const token = localStorage.getItem('token');

        try {
            // 2. Send update to backend
            await axios.put(`http://https://harsh-rms.vercel.app/api/admin/users/${userId}/status`, { status: newStatus }, { headers: { Authorization: `Bearer ${token}` } });

            // 3. Update UI immediately
            setUsers(users.map(u => u.id === userId ? { ...u, status: newStatus } : u));
        } catch (err) {
            alert("Failed to update status.");
        }
    };

    const handleDeleteUser = async (userId, currentStatus) => {
        if (currentStatus === 'deleted') return;
        if (window.confirm(`Delete User ID: ${userId}?`)) {
            const token = localStorage.getItem('token');
            try {
                await axios.delete(`http://https://harsh-rms.vercel.app/api/admin/users/${userId}`, { headers: { Authorization: `Bearer ${token}` } });
                setUsers(users.map(u => u.id === userId ? { ...u, status: 'deleted' } : u));
            } catch (err) { alert("Failed to delete user."); }
        }
    };

    const handleDeleteItem = async (itemId, category) => {
        if (!window.confirm("Admin Action: Permanently delete this item?")) return;
        const token = localStorage.getItem('token');
        try {
            const endpoint = category.toLowerCase();
            await axios.delete(`http://https://harsh-rms.vercel.app/api/${endpoint}/delete/${itemId}`, { headers: { Authorization: `Bearer ${token}` } });
            setInventory(inventory.filter(item => item.id !== itemId));
        } catch (err) { alert("Delete failed."); }
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login/admin');
    };

    // --- FILTERING LOGIC ---
    const filteredInventory = activeTab === 'ALL' ? inventory : inventory.filter(item => item.category === activeTab);

    // 🔍 Search Users Logic.-
    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.role.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-[#0B1120] text-white p-6 font-sans">
            <div className="max-w-7xl mx-auto">
                <header className="flex justify-between items-center mb-8">
                    <h1 className="text-2xl font-bold">System <span className="text-blue-500">Administration</span></h1>
                    <button onClick={fetchData} className="bg-blue-600 px-6 py-2 rounded-full text-sm font-bold shadow-lg shadow-blue-900/20 hover:bg-blue-700 transition flex items-center gap-2">
                        <span>↻</span> Refresh System
                    </button>
                </header>

                {/* --- ✨ UPDATED USERS SECTION ✨ --- */}
                <section className="bg-[#151f32] rounded-2xl border border-slate-800 p-6 mb-8 shadow-xl shadow-black/20">
                    <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            User Access Control
                            <span className="bg-slate-800 text-slate-400 text-xs px-2 py-1 rounded-full border border-slate-700">{users.length}</span>
                        </h2>

                        {/* 🔍 Search Bar */}
                        <div className="relative w-full sm:w-64">
                            <span className="absolute left-3 top-2.5 text-slate-500">🔍</span>
                            <input
                                type="text"
                                placeholder="Search users..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-[#0B1120] border border-slate-700 rounded-full pl-10 pr-4 py-2 text-sm text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
                            />
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-xl border border-slate-800">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-[#0B1120] text-xs uppercase text-slate-500 font-bold tracking-wider">
                                    <th className="p-4">User Identity</th>
                                    <th className="p-4">Role</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800 text-sm bg-[#151f32]">
                                {filteredUsers.length > 0 ? (
                                    filteredUsers.slice(0, 8).map((user) => {
                                        const isActive = user.status === 'active';
                                        const isDeleted = user.status === 'deleted';

                                        return (
                                            <tr key={user.id} className="group hover:bg-[#1e293b] transition duration-200">
                                                {/* User Info with Avatar */}
                                                <td className="p-4 flex items-center gap-3">
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-lg ${getAvatarColor(user.name)}`}>
                                                        {getInitials(user.name)}
                                                    </div>
                                                    <div>
                                                        <div className={`font-bold text-base ${isDeleted ? 'text-slate-500 line-through' : 'text-white'}`}>
                                                            {user.name}
                                                        </div>
                                                        <div className="text-[10px] text-slate-500 font-mono">ID: #{user.id}</div>
                                                    </div>
                                                </td>

                                                {/* Role Badge */}
                                                <td className="p-4">
                                                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wide border ${getRoleBadgeStyle(user.role)}`}>
                                                        {user.role}
                                                    </span>
                                                </td>

                                                {/* Active Status with Pulse */}
                                                <td className="p-4">
                                                    {isDeleted ? (
                                                        <div className="flex items-center gap-2 text-slate-500 font-bold text-xs">
                                                            <span className="w-2 h-2 rounded-full bg-slate-600"></span> DELETED
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-2">
                                                            <span className="relative flex h-2.5 w-2.5">
                                                                {isActive && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>}
                                                                <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isActive ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                                                            </span>
                                                            <span className={`font-bold text-xs ${isActive ? 'text-emerald-400' : 'text-red-400'}`}>
                                                                {isActive ? 'ACTIVE' : 'INACTIVE'}
                                                            </span>
                                                        </div>
                                                    )}
                                                </td>

                                                {/* Actions */}
                                                <td className="p-4 text-right">
                                                    {!isDeleted ? (
                                                        <div className="flex justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                                            <button
                                                                onClick={() => handleToggleStatus(user.id, user.status)}
                                                                className={`px-3 py-1.5 rounded text-xs font-semibold border transition ${isActive ? 'border-amber-900/50 text-amber-500 hover:bg-amber-900/20' : 'border-emerald-900/50 text-emerald-500 hover:bg-emerald-900/20'}`}
                                                            >
                                                                {isActive ? 'Deactivate' : 'Activate'}
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteUser(user.id, user.status)}
                                                                className="px-3 py-1.5 rounded text-xs font-semibold border border-slate-700 text-slate-400 hover:bg-red-900/20 hover:text-red-400 hover:border-red-900/50 transition"
                                                            >
                                                                Delete
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <button onClick={() => handleToggleStatus(user.id, user.status)} className="text-xs font-bold text-blue-400 hover:underline">Restore User</button>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="p-8 text-center text-slate-500 italic">
                                            No users found matching "{searchTerm}"
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* --- INVENTORY SECTION (New Cards UI) --- */}
                <section className="bg-[#151f32] rounded-2xl border border-slate-800 p-6 shadow-xl shadow-black/20">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                        <div className="flex items-center gap-4">
                            <h2 className="text-xl font-bold text-white">Inventory Monitor</h2>
                            <div className="flex items-center gap-2 text-[10px] text-emerald-400 bg-emerald-900/20 px-2 py-1 rounded-full animate-pulse border border-emerald-900/50 font-bold tracking-wider">
                                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span> LIVE
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="flex gap-1 bg-[#0B1120] p-1 rounded-xl border border-slate-800">
                            {['ALL', 'CANTEEN', 'STATIONERY', 'HOSTEL'].map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === tab
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50'
                                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                                        }`}
                                >
                                    {tab === 'ALL' ? 'ALL' : tab.charAt(0) + tab.slice(1).toLowerCase()}
                                </button>
                            ))}
                        </div>
                    </div>
                    
                    {/* Cards Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredInventory.length > 0 ? (
                            filteredInventory.map((item) => {
                                // ⚠️ FIX: Create a unique key by combining category and ID
                                const uniqueKey = `${item.category}-${item.id}`;

                                if (item.category === 'CANTEEN')
                                    return <AdminCanteenCard key={uniqueKey} item={item} onDelete={handleDeleteItem} />;
                                if (item.category === 'STATIONERY')
                                    return <AdminStationeryCard key={uniqueKey} item={item} onDelete={handleDeleteItem} />;
                                if (item.category === 'HOSTEL')
                                    return <AdminHostelCard key={uniqueKey} item={item} onDelete={handleDeleteItem} />;
                                return null;
                            })
                        ) : (
                            <div className="col-span-full text-center py-16 text-slate-500 border border-dashed border-slate-800 rounded-xl bg-[#0B1120]/50">
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

// --- CARD COMPONENTS (Unchanged Layout, Just Rendering) ---
const AdminCanteenCard = ({ item }) => {

    return (
        <div className="bg-[#1e293b] rounded-2xl border border-slate-700 overflow-hidden hover:border-amber-500/50 hover:shadow-[0_0_20px_rgba(245,158,11,0.1)] transition group flex flex-col h-full">
            <div className="h-28 bg-slate-800/50 flex items-center justify-center text-5xl relative overflow-hidden group-hover:bg-amber-900/10 transition">
                🍽️🥤

            </div>
            <div className="p-5 flex flex-col flex-1">
                <h3 className="font-bold text-lg text-white mb-1 group-hover:text-amber-400 transition">{item.name}</h3>
                <p className="text-xs text-slate-400 mb-4 font-mono">Qty: <span className="text-slate-300">{item.quantity}</span></p>
                <div className="flex justify-between items-center border-t border-slate-700 pt-4 mt-auto">
                    <span className="text-xl font-bold text-white">₹{item.price}</span>

                </div>
            </div>
        </div>
    );
};

const AdminStationeryCard = ({ item, onDelete }) => {
    return (
        <div className="bg-[#1e293b] rounded-2xl border border-slate-700 overflow-hidden hover:border-purple-500/50 hover:shadow-[0_0_20px_rgba(168,85,247,0.1)] transition group flex flex-col h-full">
            <div className="h-24 bg-slate-800/50 flex items-center justify-center text-4xl group-hover:bg-purple-900/10 transition">✏️</div>
            <div className="p-5 flex flex-col flex-1">
                <h3 className="font-bold text-lg text-white mb-2 group-hover:text-purple-400 transition">{item.name}</h3>
                <div className="flex items-center gap-2 mb-4">
                    <div className="flex items-center gap-2 mb-4">
                        <span className="text-[10px] bg-purple-900/30 text-purple-300 px-2 py-0.5 rounded border border-purple-900/50 font-bold uppercase">
                            Stock: {item.stock_level || 'Out of Stock'}
                        </span>
                    </div>
                </div>
                <div className="flex justify-between items-center border-t border-slate-700 pt-4 mt-auto">
                    <span className="text-xl font-bold text-white">₹{item.price}</span>

                </div>
            </div>
        </div>
    );
};

const AdminHostelCard = ({ item, onDelete }) => {
    // State to toggle details view
    const [showDetails, setShowDetails] = useState(false);

    // 1. Robust Data Handling
    const displayName = item.room_number || item.item_name || 'Room';
    const rawStatus = item.status || item.availability_status || 'Available';
    const isAvailable = rawStatus.toLowerCase() === 'available';

    // 2. Check if extra details exist (so we know if we should show the button)
    const hasExtraDetails = (item.hostel_name && item.hostel_name.trim() !== "") || 
                            (item.address && item.address.trim() !== "") || 
                            (item.contact_number && item.contact_number.trim() !== "");

    // 3. Dynamic Styling
    const badgeClass = isAvailable 
        ? 'text-emerald-400 border-emerald-900 bg-emerald-900/20' 
        : 'text-red-400 border-red-900 bg-red-900/20';

    return (
        <div className="bg-[#1e293b] rounded-2xl border border-slate-700 p-5 hover:border-emerald-500/50 hover:shadow-[0_0_20px_rgba(16,185,129,0.1)] transition group flex flex-col h-full relative overflow-hidden">
            
            {/* Header: Icon & Status */}
            <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="bg-slate-800 p-3 rounded-lg text-2xl shadow-inner group-hover:scale-110 transition">🛏️</div>
                <span className={`text-[10px] font-bold px-2 py-1 rounded border uppercase ${badgeClass}`}>
                    {rawStatus}
                </span>
            </div>

            {/* Main Room Info */}
            <div className="mb-4 flex-1 relative z-10">
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Room No.</div>
                <h3 className="text-3xl font-bold text-white mb-2 group-hover:text-emerald-400 transition">{displayName}</h3>
                
                <div className="inline-flex items-center gap-1.5 bg-slate-800/50 px-2 py-1 rounded text-xs text-slate-300 border border-slate-700">
                    <span>{item.type === 'AC' ? '❄️' : '💨'}</span> {item.type || 'Standard'}
                </div>
            </div>

            {/* Collapsible Details Section (Only shows when button is clicked) */}
            {showDetails && (
                <div className="mb-4 p-3 bg-slate-800/50 rounded-lg border border-slate-700 text-sm animate-fadeIn">
                    {item.hostel_name && (
                        <div className="mb-2">
                            <span className="text-slate-500 text-xs block uppercase font-semibold">Hostel</span>
                            <span className="text-slate-200">{item.hostel_name}</span>
                        </div>
                    )}
                    {item.address && (
                        <div className="mb-2">
                            <span className="text-slate-500 text-xs block uppercase font-semibold">Address</span>
                            <span className="text-slate-300 text-xs">{item.address}</span>
                        </div>
                    )}
                    {item.contact_number && (
                        <div>
                            <span className="text-slate-500 text-xs block uppercase font-semibold">Contact</span>
                            <span className="text-emerald-400 font-mono text-xs">{item.contact_number}</span>
                        </div>
                    )}
                </div>
            )}

            {/* Footer Actions */}
            <div className="border-t border-slate-700 pt-4 flex justify-between items-center relative z-10">
                
                {/* Left Side: Toggle Details Button */}
                {hasExtraDetails ? (
                    <button 
                        onClick={() => setShowDetails(!showDetails)}
                        className="text-[11px] font-bold text-slate-400 hover:text-emerald-400 transition flex items-center gap-1 uppercase tracking-wide"
                    >
                        {showDetails ? 'Hide Info' : 'More Details'}
                        <span className="text-[9px]">{showDetails ? '▲' : '▼'}</span>
                    </button>
                ) : (
                    <span className="text-[10px] text-slate-600 font-medium select-none">SIMPLE VIEW</span>
                )}

                {/* Right Side: Delete Action  */}
                {onDelete && (
                    <button 
                        onClick={() => onDelete(item.id)} 
                        className="text-red-400 text-xs font-bold hover:text-white transition bg-red-500/10 hover:bg-red-600 px-3 py-1.5 rounded-lg border border-red-500/20"
                    >
                        Delete
                    </button>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;