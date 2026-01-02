import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const CanteenDashboard = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  // State
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // Specific Form State for Canteen
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    quantity: '',
    status: 'Available'
  });

  // Helper: Auth Error
  const handleAuthError = (err) => {
    if (err.response && (err.response.status === 401 || err.response.status === 403)) {
        alert("Session expired. Please login again.");
        localStorage.clear();
        navigate('/login/canteen');
    }
  };

  // Fetch Canteen Items
  const fetchItems = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/canteen/items', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setItems(response.data);
    } catch (err) {
      handleAuthError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) navigate('/login/canteen');
    else fetchItems();
  }, [navigate, token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { 
        item_name: formData.name, 
        price: formData.price, 
        quantity: formData.quantity, 
        status: formData.status 
    };

    try {
      if (editingId) {
        await axios.put(`http://localhost:5000/api/canteen/update/${editingId}`, payload, { headers: { Authorization: `Bearer ${token}` } });
        alert("Food Item Updated!");
      } else {
        await axios.post('http://localhost:5000/api/canteen/add', payload, { headers: { Authorization: `Bearer ${token}` } });
        alert("Food Item Added!");
      }
      setEditingId(null);
      setFormData({ name: '', price: '', quantity: '', status: 'Available' });
      fetchItems();
    } catch (err) { handleAuthError(err); }
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Delete this food item?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/canteen/delete/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setItems(items.filter(i => i.id !== id));
    } catch (err) { handleAuthError(err); }
  };

  const handleEditClick = (item) => {
    setEditingId(item.id);
    setFormData({
        name: item.item_name,
        price: item.price,
        quantity: item.quantity,
        status: item.status
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-6 font-sans">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-10 border-b border-slate-800 pb-6">
          <h1 className="text-3xl font-bold">🍔 Canteen <span className="text-amber-500">Dashboard</span></h1>
          <button onClick={() => { localStorage.clear(); navigate('/login/canteen'); }} className="border border-red-500 text-red-500 px-4 py-2 rounded hover:bg-red-500/10">Logout</button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* FORM */}
          <div className="lg:col-span-1">
            <div className={`bg-[#1e293b] p-6 rounded-2xl border ${editingId ? 'border-amber-500' : 'border-slate-700'} sticky top-10`}>
              <h2 className="text-xl font-bold mb-6 text-amber-500">{editingId ? 'Edit Food' : 'Add Food'}</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input type="text" placeholder="Item Name (e.g. Burger)" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-[#0f172a] border border-slate-600 rounded p-3" required />
                <input type="number" placeholder="Price (₹)" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} className="w-full bg-[#0f172a] border border-slate-600 rounded p-3" required />
                <input type="text" placeholder="Quantity (e.g. 1 Plate)" value={formData.quantity} onChange={(e) => setFormData({...formData, quantity: e.target.value})} className="w-full bg-[#0f172a] border border-slate-600 rounded p-3" required />
                
                <button type="submit" className="w-full bg-amber-600 hover:bg-amber-700 py-3 rounded font-bold">{editingId ? 'Update' : 'Add'}</button>
                {editingId && <button type="button" onClick={() => {setEditingId(null); setFormData({name:'', price:'', quantity:'', status:'Available'})}} className="w-full mt-2 text-slate-400">Cancel</button>}
              </form>
            </div>
          </div>

          {/* LIST */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map(item => {
              
              return (
                <div key={item.id} className="bg-[#1e293b] rounded-2xl border border-slate-700 overflow-hidden hover:border-amber-500/50 hover:shadow-[0_0_20px_rgba(245,158,11,0.1)] transition group flex flex-col h-full">
                  
                  {/* 1. Header with Icon & Status Badge */}
                  <div className="h-28 bg-slate-800/50 flex items-center justify-center text-5xl relative overflow-hidden group-hover:bg-amber-900/10 transition">
                      🍔
                      
                  </div>

                  {/* 2. Content */}
                  <div className="p-5 flex flex-col flex-1">
                      <div className="flex-1">
                          <h3 className="font-bold text-lg text-white mb-1 group-hover:text-amber-400 transition">
                              {item.item_name}
                          </h3>
                          <p className="text-xs text-slate-400 mb-4 font-mono">
                              Portion: <span className="text-slate-300">{item.quantity}</span>
                          </p>
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
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
export default CanteenDashboard;