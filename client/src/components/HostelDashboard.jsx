import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// --- SUB-COMPONENT: Room Card ---
// This handles the individual card logic so each card opens/closes independently
const RoomCard = ({ item, onEdit, onDelete }) => {
    const [showDetails, setShowDetails] = useState(false);

    // 1. Robust Data Handling
    const displayName = item.room_number || item.item_name || 'Room';
    const rawStatus = item.status || item.availability_status || 'Available';
    const isAvailable = rawStatus.toLowerCase() === 'available';

    // 2. Check if extra details exist (Hostel Name, Address, or Contact)
    // If these are empty, we won't show the "More Details" button
    const hasExtraDetails = (item.hostel_name && item.hostel_name.trim() !== "") || 
                            (item.address && item.address.trim() !== "") || 
                            (item.contact_number && item.contact_number.trim() !== "");

    // 3. Styling Logic
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
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Room Number</div>
                <h3 className="text-3xl font-bold text-white mb-2 group-hover:text-emerald-400 transition">{displayName}</h3>

                <div className="inline-flex items-center gap-1.5 bg-slate-800/50 px-2 py-1 rounded text-xs text-slate-300 border border-slate-700">
                    {/* Dynamic Icon based on AC/Non-AC */}
                    <span>{item.type === 'AC' ? '❄️' : '💨'}</span> 
                    {item.type || 'Standard'}
                </div>
            </div>

            {/* Collapsible Details Section */}
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
                {/* Only show 'More Details' if there is actually data to show */}
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

                <div className="flex gap-2">
                    <button onClick={() => onEdit(item)} className="text-blue-400 text-xs font-bold hover:text-white transition bg-blue-500/10 hover:bg-blue-600 px-3 py-1.5 rounded-lg border border-blue-500/20">
                        Edit
                    </button>
                    <button onClick={() => onDelete(item.id)} className="text-red-400 text-xs font-bold hover:text-white transition bg-red-500/10 hover:bg-red-600 px-3 py-1.5 rounded-lg border border-red-500/20">
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};


// --- MAIN DASHBOARD COMPONENT ---
const HostelDashboard = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editingId, setEditingId] = useState(null);

    // Form Data State including new fields
    const [formData, setFormData] = useState({
        name: '',
        type: 'Non-AC', // Default value
        status: 'Available',
        hostelName: '',
        address: '',
        contact: ''
    });

    const handleAuthError = (err) => {
        if (err.response && (err.response.status === 401 || err.response.status === 403)) {
            alert("Session expired. Please login again.");
            localStorage.clear();
            navigate('/login/hostel');
        }
    };

    const fetchItems = async () => {
        setLoading(true);
        try {
            const response = await axios.get('http://localhost:5000/api/hostel/items', { headers: { Authorization: `Bearer ${token}` } });
            setItems(response.data);
        } catch (err) { handleAuthError(err); } finally { setLoading(false); }
    };

    useEffect(() => {
        if (!token) navigate('/login/hostel');
        else fetchItems();
    }, [navigate, token]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Construct payload to match Backend expectation
        const payload = {
            item_name: formData.name, // Used for Room Number
            room_number: formData.name, // Fallback
            type: formData.type,
            availability_status: formData.status,
            // New fields
            hostel_name: formData.hostelName,
            address: formData.address,
            contact_number: formData.contact
        };

        try {
            if (editingId) {
                await axios.put(`http://localhost:5000/api/hostel/update/${editingId}`, payload, { headers: { Authorization: `Bearer ${token}` } });
                alert("Room Updated Successfully!");
            } else {
                await axios.post('http://localhost:5000/api/hostel/add', payload, { headers: { Authorization: `Bearer ${token}` } });
                alert("Room Added Successfully!");
            }
            // Reset Form
            setEditingId(null);
            setFormData({ name: '', type: 'Non-AC', status: 'Available', hostelName: '', address: '', contact: '' });
            fetchItems();
        } catch (err) { handleAuthError(err); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this room?")) return;
        try {
            await axios.delete(`http://localhost:5000/api/hostel/delete/${id}`, { headers: { Authorization: `Bearer ${token}` } });
            setItems(items.filter(i => i.id !== id));
        } catch (err) { handleAuthError(err); }
    };

    const handleEditClick = (item) => {
        setEditingId(item.id);

        let currentStatus = item.status || item.availability_status || 'Available';
        // Capitalize status for dropdown match
        if (currentStatus) {
            currentStatus = currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1).toLowerCase();
        }

        setFormData({
            name: item.room_number || item.item_name || '',
            type: item.type || 'Non-AC',
            status: currentStatus,
            // Load existing extra details if they exist
            hostelName: item.hostel_name || '',
            address: item.address || '',
            contact: item.contact_number || ''
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="min-h-screen bg-[#0f172a] text-white p-6 font-sans">
            <div className="max-w-6xl mx-auto">
                <header className="flex justify-between items-center mb-10 border-b border-slate-800 pb-6">
                    <h1 className="text-3xl font-bold">🛏️ Hostel <span className="text-emerald-500">Dashboard</span></h1>
                    <button onClick={() => { localStorage.clear(); navigate('/login/hostel'); }} className="border border-red-500 text-red-500 px-4 py-2 rounded hover:bg-red-500/10">Logout</button>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* --- LEFT COLUMN: FORM --- */}
                    <form onSubmit={handleSubmit} className="space-y-4 h-fit sticky top-6">
                        <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 shadow-xl">
                            <h2 className="text-xl font-bold mb-4 text-emerald-400">
                                {editingId ? 'Edit Room' : 'Add New Room'}
                            </h2>
                            
                            <div className="space-y-3">
                                {/* Room Number */}
                                <div>
                                    <label className="text-xs text-slate-400 uppercase font-bold ml-1">Room No.</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. 101"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full mt-1 bg-[#0f172a] border border-slate-600 rounded p-3 text-white placeholder-slate-500 focus:border-emerald-500 outline-none transition"
                                        required
                                    />
                                </div>

                                {/* AC / Non-AC Dropdown */}
                                <div>
                                    <label className="text-xs text-slate-400 uppercase font-bold ml-1">Room Type</label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                        className="w-full mt-1 bg-[#0f172a] border border-slate-600 rounded p-3 text-white focus:border-emerald-500 outline-none transition"
                                    >
                                        <option value="Non-AC">Non-AC</option>
                                        <option value="AC">AC</option>
                                    </select>
                                </div>

                                {/* Status Dropdown */}
                                <div>
                                    <label className="text-xs text-slate-400 uppercase font-bold ml-1">Availability</label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                        className="w-full mt-1 bg-[#0f172a] border border-slate-600 rounded p-3 text-white focus:border-emerald-500 outline-none transition"
                                    >
                                        <option value="Available">Available</option>
                                        <option value="Occupied">Occupied</option>
                                    </select>
                                </div>

                                {/* Divider for Extra Info */}
                                <div className="border-t border-slate-700 my-4 pt-4">
                                    <p className="text-sm font-bold text-slate-300 mb-3 flex items-center gap-2">
                                        ℹ️ Optional Details
                                    </p>
                                    
                                    <input
                                        type="text"
                                        placeholder="Hostel Name"
                                        value={formData.hostelName}
                                        onChange={(e) => setFormData({ ...formData, hostelName: e.target.value })}
                                        className="w-full bg-[#0f172a] border border-slate-600 rounded p-3 mb-3 text-white placeholder-slate-500 focus:border-emerald-500 outline-none text-sm"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Full Address"
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                        className="w-full bg-[#0f172a] border border-slate-600 rounded p-3 mb-3 text-white placeholder-slate-500 focus:border-emerald-500 outline-none text-sm"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Contact Number"
                                        value={formData.contact}
                                        onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                                        className="w-full bg-[#0f172a] border border-slate-600 rounded p-3 text-white placeholder-slate-500 focus:border-emerald-500 outline-none text-sm"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700 py-3 rounded-lg font-bold transition text-white shadow-lg shadow-emerald-500/20 active:scale-95 transform"
                            >
                                {editingId ? 'Update Room' : 'Add Room'}
                            </button>

                            {editingId && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setEditingId(null);
                                        setFormData({ name: '', type: 'Non-AC', status: 'Available', hostelName: '', address: '', contact: '' });
                                    }}
                                    className="w-full mt-2 text-slate-400 hover:text-white transition text-sm py-2"
                                >
                                    Cancel
                                </button>
                            )}
                        </div>
                    </form>

                    {/* --- RIGHT COLUMN: LIST --- */}
                    <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 auto-rows-min">
                        {loading ? (
                            <div className="text-center col-span-full py-10 text-slate-400 animate-pulse">Loading rooms...</div>
                        ) : (
                            items.map(item => (
                                <RoomCard 
                                    key={item.id} 
                                    item={item} 
                                    onEdit={handleEditClick} 
                                    onDelete={handleDelete} 
                                />
                            ))
                        )}
                        {!loading && items.length === 0 && (
                            <div className="text-center col-span-full py-10 border-2 border-dashed border-slate-700 rounded-xl">
                                <p className="text-slate-500">No rooms found.</p>
                                <p className="text-slate-600 text-sm mt-1">Fill the form to add your first room!</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HostelDashboard;