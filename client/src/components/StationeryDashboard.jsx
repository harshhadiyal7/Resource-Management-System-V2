import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const StationeryDashboard = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    stock: '',
    status: 'Available' // Though stationery is usually just stock, we keep status for consistency
  });

  const handleAuthError = (err) => {
    if (err.response && (err.response.status === 401 || err.response.status === 403)) {
        alert("Session expired. Please login again.");
        localStorage.clear();
        navigate('/login/stationery');
    }
  };

  const fetchItems = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/stationery/items', { headers: { Authorization: `Bearer ${token}` } });
      setItems(response.data);
    } catch (err) { handleAuthError(err); } finally { setLoading(false); }
  };

  useEffect(() => {
    if (!token) navigate('/login/stationery');
    else fetchItems();
  }, [navigate, token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { 
        item_name: formData.name, 
        price: formData.price, 
        stock_level: formData.stock, 
        category: 'General' 
    };

    try {
      if (editingId) {
        await axios.put(`http://localhost:5000/api/stationery/update/${editingId}`, payload, { headers: { Authorization: `Bearer ${token}` } });
        alert("Item Updated!");
      } else {
        await axios.post('http://localhost:5000/api/stationery/add', payload, { headers: { Authorization: `Bearer ${token}` } });
        alert("Item Added!");
      }
      setEditingId(null);
      setFormData({ name: '', price: '', stock: '', status: 'Available' });
      fetchItems();
    } catch (err) { handleAuthError(err); }
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Delete this item?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/stationery/delete/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setItems(items.filter(i => i.id !== id));
    } catch (err) { handleAuthError(err); }
  };

  const handleEditClick = (item) => {
    setEditingId(item.id);
    setFormData({ name: item.item_name, price: item.price, stock: item.stock_level, status: 'Available' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-6 font-sans">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-10 border-b border-slate-800 pb-6">
          <h1 className="text-3xl font-bold">✏️ Stationery <span className="text-purple-500">Dashboard</span></h1>
          <button onClick={() => { localStorage.clear(); navigate('/login/stationery'); }} className="border border-red-500 text-red-500 px-4 py-2 rounded hover:bg-red-500/10">Logout</button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* FORM */}
          <div className="lg:col-span-1">
            <div className={`bg-[#1e293b] p-6 rounded-2xl border ${editingId ? 'border-purple-500' : 'border-slate-700'} sticky top-10`}>
              <h2 className="text-xl font-bold mb-6 text-purple-500">{editingId ? 'Edit Item' : 'Add Item'}</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input type="text" placeholder="Item Name (e.g. Pen)" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-[#0f172a] border border-slate-600 rounded p-3" required />
                <input type="number" placeholder="Price (₹)" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} className="w-full bg-[#0f172a] border border-slate-600 rounded p-3" required />
                <input type="text" placeholder="Stock Level (e.g. 50)" value={formData.stock} onChange={(e) => setFormData({...formData, stock: e.target.value})} className="w-full bg-[#0f172a] border border-slate-600 rounded p-3" required />
                <button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 py-3 rounded font-bold">{editingId ? 'Update' : 'Add'}</button>
                {editingId && <button type="button" onClick={() => {setEditingId(null); setFormData({name:'', price:'', stock:'', status:'Available'})}} className="w-full mt-2 text-slate-400">Cancel</button>}
              </form>
            </div>
          </div>

          {/* LIST */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map(item => (
              <div key={item.id} className="bg-[#1e293b] rounded-2xl border border-slate-700 overflow-hidden hover:border-purple-500/50 hover:shadow-[0_0_20px_rgba(168,85,247,0.1)] transition group flex flex-col h-full">
                
                {/* 1. Card Header (Icon Area) */}
                <div className="h-24 bg-slate-800/50 flex items-center justify-center text-4xl group-hover:bg-purple-900/10 transition">
                    ✏️
                </div>

                {/* 2. Card Content */}
                <div className="p-5 flex flex-col flex-1">
                    <div className="flex-1">
                        <h3 className="font-bold text-lg text-white mb-2 group-hover:text-purple-400 transition">
                            {item.item_name}
                        </h3>
                        
                        <div className="flex items-center gap-2 mb-4">
                            <span className="text-[10px] bg-purple-900/30 text-purple-300 px-2 py-0.5 rounded border border-purple-900/50 font-bold uppercase">
                                Stock: {item.stock_level || 'Out of Stock'}
                            </span>
                        </div>
                    </div>

                    {/* 3. Footer (Price + Actions) */}
                    <div className="flex justify-between items-center border-t border-slate-700 pt-4 mt-auto">
                        <span className="text-xl font-bold text-white">₹{item.price}</span>
                        
                        <div className="flex gap-4">
                            <button 
                                onClick={() => handleEditClick(item)} 
                                className="text-blue-400 hover:text-white text-xs font-bold transition hover:underline decoration-blue-500 decoration-2 underline-offset-4"
                            >
                                Edit
                            </button>
                            <button 
                                onClick={() => handleDelete(item.id)} 
                                className="text-red-400 hover:text-white text-xs font-bold transition hover:underline decoration-red-500 decoration-2 underline-offset-4"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
export default StationeryDashboard;