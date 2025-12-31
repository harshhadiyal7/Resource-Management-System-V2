import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AdminDashboard = () => {
    const navigate = useNavigate();

    // --- STATE ---
    const [users, setUsers] = useState([]);
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);

    // --- FETCH DATA ---
    const fetchData = async () => {
        try {
            setLoading(true);

            // 1. Fetch Users
            const userRes = await axios.get('http://localhost:5000/api/admin/users');
            
            const formattedUsers = userRes.data.map(user => ({
                id: user.id,
                name: user.full_name,
                role: user.role.toUpperCase(),
                // Normalize status
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
    };

    useEffect(() => {
        fetchData();
    }, []);

    // --- HELPERS ---
    const getCategoryIcon = (category) => {
        switch (category) {
            case 'CANTEEN': return '🍟';
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

    // --- HANDLERS ---
    
    // 1. Activate / Deactivate / Restore
    const handleToggleStatus = async (userId, currentStatus) => {
        // LOGIC UPDATE: If 'deleted' or 'inactive', we want to make it 'active'.
        // If 'active', we want to make it 'inactive'.
        
        const isCurrentlyActive = currentStatus === 'active';
        
        // If status is 'deleted', new status will become 'active' automatically here
        const newStatus = isCurrentlyActive ? 'inactive' : 'active';
        
        const token = localStorage.getItem('token');

        try {
            await axios.put(
                `http://localhost:5000/api/admin/users/${userId}/status`,
                { status: newStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // Update UI locally without refresh
            setUsers(users.map(user =>
                user.id === userId ? { ...user, status: newStatus } : user
            ));

        } catch (err) {
            console.error(err);
            alert("Failed to update status.");
        }
    };

    // 2. Delete (Soft Delete)
    const handleDelete = async (userId, currentStatus) => {
        if (currentStatus === 'deleted') return; // Prevent double delete

        if (window.confirm(`Are you sure you want to delete User ID: ${userId}? They can be restored later.`)) {
            const token = localStorage.getItem('token');
            try {
                await axios.delete(`http://localhost:5000/api/admin/users/${userId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                // Update status to 'deleted' in UI
                setUsers(users.map(user => 
                    user.id === userId ? { ...user, status: 'deleted' } : user
                ));
                
            } catch (err) {
                console.error(err);
                alert("Failed to delete user.");
            }
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        navigate('/login/admin');
    };

    return (
        <div className="min-h-screen bg-[#0B1120] text-white p-6 font-sans selection:bg-blue-500 selection:text-white">
            <div className="max-w-7xl mx-auto">

                {/* --- HEADER --- */}
                <header className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-600/20 p-2 rounded-lg text-blue-500">
                             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-white">System <span className="text-blue-500">Administration</span></h1>
                            <p className="text-xs text-slate-400">Manage users and monitor cross-department inventory</p>
                        </div>
                    </div>
                    
                    <button
                        onClick={fetchData}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full text-sm font-semibold transition shadow-lg shadow-blue-900/30 flex items-center gap-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                        </svg>
                        Refresh System
                    </button>
                </header>

                {/* --- USER TABLE SECTION --- */}
                <section className="bg-[#151f32] rounded-xl border border-slate-800 p-6 mb-8 relative overflow-hidden">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-semibold flex items-center gap-2 text-white">
                            User Access Control
                        </h2>
                        <span className="bg-[#1e293b] text-blue-400 text-[10px] font-bold px-3 py-1 rounded-full border border-slate-700">
                            {users.length} REGISTERED USERS
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="text-xs uppercase text-slate-500 font-bold tracking-wider border-b border-slate-800">
                                    <th className="pb-4 pl-4">User Details</th>
                                    <th className="pb-4">Security Role</th>
                                    <th className="pb-4">Status</th>
                                    <th className="pb-4 text-right pr-4">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/50 text-sm">
                                {users.length > 0 ? (
                                    users.map((user) => {
                                        const isActive = user.status === 'active';
                                        const isDeleted = user.status === 'deleted';
                                        
                                        return (
                                            <tr key={user.id} className="group hover:bg-slate-800/30 transition duration-200">
                                                {/* NAME & ID */}
                                                <td className="py-5 pl-4">
                                                    <div className={`font-bold text-white text-base ${isDeleted ? 'text-slate-500 line-through' : ''}`}>
                                                        {user.name}
                                                    </div>
                                                    <div className="text-xs text-slate-500 font-mono mt-0.5">ID: {user.id}</div>
                                                </td>
                                                
                                                {/* ROLE */}
                                                <td className="py-5">
                                                    <span className={`px-2 py-1 rounded text-[10px] font-bold tracking-wide ${getRoleBadgeStyle(user.role)}`}>
                                                        {user.role}
                                                    </span>
                                                </td>

                                                {/* STATUS */}
                                                <td className="py-5">
                                                    {isDeleted ? (
                                                        <div className="flex items-center gap-2">
                                                            <span className="w-2 h-2 rounded-full bg-slate-600"></span>
                                                            <span className="font-bold text-slate-500 text-xs">DELETED</span>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-2">
                                                            <span className={`w-2 h-2 rounded-full shadow-[0_0_10px] ${isActive ? 'bg-emerald-500 shadow-emerald-500/50' : 'bg-red-500 shadow-red-500/50'}`}></span>
                                                            <span className={`font-bold text-xs ${isActive ? 'text-emerald-500' : 'text-red-500'}`}>
                                                                {isActive ? 'ACTIVE' : 'INACTIVE'}
                                                            </span>
                                                        </div>
                                                    )}
                                                </td>

                                                {/* ACTIONS */}
                                                <td className="py-5 text-right pr-4">
                                                    {!isDeleted ? (
                                                        /* --- ACTIVE/INACTIVE USER ACTIONS --- */
                                                        <div className="flex justify-end items-center gap-3">
                                                            <button 
                                                                onClick={() => handleToggleStatus(user.id, user.status)}
                                                                className={`px-3 py-1.5 rounded border text-xs font-semibold transition
                                                                    ${isActive 
                                                                        ? 'border-red-900/30 text-red-400 bg-red-900/10 hover:bg-red-900/20' 
                                                                        : 'border-emerald-900/30 text-emerald-400 bg-emerald-900/10 hover:bg-emerald-900/20'
                                                                    }`}
                                                            >
                                                                {isActive ? 'Deactivate' : 'Activate'}
                                                            </button>
                                                            
                                                            <button 
                                                                onClick={() => handleDelete(user.id, user.status)}
                                                                className="px-3 py-1.5 rounded border border-slate-700 text-slate-400 text-xs font-semibold hover:bg-slate-800 hover:text-white transition"
                                                            >
                                                                Delete
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        /* --- DELETED USER ACTIONS (RESTORE) --- */
                                                        <div className="flex justify-end items-center gap-3">
                                                            <button 
                                                                onClick={() => handleToggleStatus(user.id, user.status)}
                                                                className="px-4 py-1.5 rounded border border-blue-900/50 text-blue-400 bg-blue-900/10 hover:bg-blue-900/20 text-xs font-bold transition flex items-center gap-1"
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                                                                </svg>
                                                                RESTORE USER
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="py-10 text-center text-slate-500">
                                            No users found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* --- INVENTORY SECTION --- */}
                <section className="bg-[#151f32] rounded-xl border border-slate-800 p-6">
                    <div className="flex items-center gap-2 mb-6">
                        <h2 className="text-lg font-semibold text-white">Live Inventory Monitor</h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {inventory.length > 0 ? (
                            inventory.map((item, index) => (
                                <div key={index} className="bg-[#0B1120] rounded-xl p-5 border border-slate-800 hover:border-slate-600 transition group relative">
                                    
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="w-10 h-10 rounded-lg bg-[#1e293b] flex items-center justify-center text-xl">
                                            {item.icon}
                                        </div>
                                        <span className="text-[10px] font-bold bg-emerald-900/30 text-emerald-500 px-2 py-0.5 rounded border border-emerald-900/50 uppercase">
                                            {item.status || 'AVAILABLE'}
                                        </span>
                                    </div>

                                    <h3 className="text-white font-bold text-lg mb-6 group-hover:text-blue-400 transition">
                                        {item.name}
                                    </h3>

                                    <div className="flex justify-between items-center pt-4 border-t border-slate-800/50">
                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                            {item.category}
                                        </span>
                                        <span className="bg-[#1e293b] text-blue-400 text-xs font-bold px-2 py-1 rounded border border-slate-700">
                                            ₹{item.price}
                                        </span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-4 text-center py-10 text-slate-500">
                                No inventory items to display.
                            </div>
                        )}
                    </div>
                </section>

                <div className="mt-8 text-center">
                     <button
                        onClick={handleLogout}
                        className="text-red-500 text-sm font-semibold hover:text-red-400 hover:underline transition"
                    >
                        Log Out of Admin System
                    </button>
                    <div className="text-[10px] text-slate-600 mt-2 font-bold tracking-widest uppercase">
                        Real-time Database Sync Active
                    </div>
                </div>

            </div>
        </div>
    );
};

export default AdminDashboard;