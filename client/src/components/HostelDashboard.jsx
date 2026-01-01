import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const HostelDashboard = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editingId, setEditingId] = useState(null);

    // Hostel only needs Name, Type, and Status (No Price)
    const [formData, setFormData] = useState({
        name: '',
        type: '',
        status: 'Available'
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
        const payload = {
            item_name: formData.name,
            type: formData.type,
            availability_status: formData.status
        };

        try {
            if (editingId) {
                await axios.put(`http://localhost:5000/api/hostel/update/${editingId}`, payload, { headers: { Authorization: `Bearer ${token}` } });
                alert("Room Updated!");
            } else {
                await axios.post('http://localhost:5000/api/hostel/add', payload, { headers: { Authorization: `Bearer ${token}` } });
                alert("Room Added!");
            }
            setEditingId(null);
            setFormData({ name: '', type: '', status: 'Available' });
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
        setFormData({
            // Check ALL possible names for the room
            name: item.room_number || item.item_name || '',
            type: item.type || '',
            // Check ALL possible names for status
            status: item.availability_status || item.status || 'Available'
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
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Room Number Input */}
                        <input
                            type="text"
                            placeholder="Room Number (e.g. 101)"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full bg-[#0f172a] border border-slate-600 rounded p-3 text-white placeholder-slate-500 focus:border-emerald-500 outline-none"
                            required
                        />

                        {/* Type Input
                        <input
                            type="text"
                            placeholder="Type (e.g. AC / Non-AC)"
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                            className="w-full bg-[#0f172a] border border-slate-600 rounded p-3 text-white placeholder-slate-500 focus:border-emerald-500 outline-none"
                            required
                        /> */}

                        {/* Status Select */}
                        <select
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            className="w-full bg-[#0f172a] border border-slate-600 rounded p-3 text-white focus:border-emerald-500 outline-none"
                        >
                            <option value="Available">Available</option>
                            <option value="Occupied">Occupied</option>
                            
                        </select>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            className="w-full bg-emerald-600 hover:bg-emerald-700 py-3 rounded font-bold transition text-white"
                        >
                            {editingId ? 'Update Room' : 'Add Room'}
                        </button>

                        {/* Cancel Button (only shows when editing) */}
                        {editingId && (
                            <button
                                type="button"
                                onClick={() => {
                                    setEditingId(null);
                                    setFormData({ name: '', type: '', status: 'Available' });
                                }}
                                className="w-full mt-2 text-slate-400 hover:text-white transition"
                            >
                                Cancel
                            </button>
                        )}
                    </form>
                    {/* LIST */}
                    <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map(item => {
              // Robust Data Checking
              const displayName = item.room_number || item.item_name || 'Room';
              const rawStatus = item.status || item.availability_status || 'Available';
              const isAvailable = rawStatus.toLowerCase() === 'available';
              
              const badgeClass = isAvailable 
                  ? 'text-emerald-400 border-emerald-900 bg-emerald-900/20' 
                  : 'text-red-400 border-red-900 bg-red-900/20';

              return (
                <div key={item.id} className="bg-[#1e293b] rounded-2xl border border-slate-700 p-5 hover:border-emerald-500/50 hover:shadow-[0_0_20px_rgba(16,185,129,0.1)] transition group flex flex-col h-full relative overflow-hidden">
                  
                  {/* 1. Header: Icon & Status */}
                  <div className="flex justify-between items-start mb-4 relative z-10">
                      <div className="bg-slate-800 p-3 rounded-lg text-2xl shadow-inner group-hover:scale-110 transition">🛏️</div>
                      <span className={`text-[10px] font-bold px-2 py-1 rounded border uppercase ${badgeClass}`}>
                          {rawStatus}
                      </span>
                  </div>
                  
                  {/* 2. Room Details */}
                  <div className="mb-6 flex-1 relative z-10">
                      <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Room Number</div>
                      <h3 className="text-3xl font-bold text-white mb-2 group-hover:text-emerald-400 transition">{displayName}</h3>
                      
                      <div className="inline-flex items-center gap-1.5 bg-slate-800/50 px-2 py-1 rounded text-xs text-slate-300 border border-slate-700">
                          <span>❄️</span> {item.type || 'Standard'}
                      </div>
                  </div>

                  {/* 3. Footer Actions */}
                  <div className="border-t border-slate-700 pt-4 flex justify-between items-center relative z-10">
                      <div className="text-xs text-slate-500 font-bold">ACTIONS</div>
                      <div className="flex gap-3">
                          <button onClick={() => handleEditClick(item)} className="text-blue-400 text-xs font-bold hover:text-white transition bg-blue-500/10 hover:bg-blue-600 hover:shadow-lg hover:shadow-blue-500/30 px-3 py-1.5 rounded-lg border border-blue-500/20">
                              Edit
                          </button>
                          <button onClick={() => handleDelete(item.id)} className="text-red-400 text-xs font-bold hover:text-white transition bg-red-500/10 hover:bg-red-600 hover:shadow-lg hover:shadow-red-500/30 px-3 py-1.5 rounded-lg border border-red-500/20">
                              Delete
                          </button>
                      </div>
                  </div>
                </div>
              );
            })}
          </div>
                </div>
            </div>
        </div>
    );
};
export default HostelDashboard;