import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const StaffDashboard = () => {
  const navigate = useNavigate();
  
  // 1. Get Role from Local Storage
  const role = localStorage.getItem('role') || 'canteen'; 
  const token = localStorage.getItem('token');

  // --- STATE ---
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Edit Mode State
  const [editingId, setEditingId] = useState(null); // Stores ID of item being edited

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    extraField: '', // Canteen=Quantity, Stationery=Stock, Hostel=Type
    status: 'Available'
  });

  // --- FETCH DATA ---
  const fetchItems = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:5000/api/${role}/items`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setItems(response.data);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 403) navigate(`/login/${role}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) navigate(`/login/${role}`);
    fetchItems();
  }, [role, navigate, token]);

  // --- HANDLERS ---
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 1. POPULATE FORM FOR EDITING
  const handleEditClick = (item) => {
    setEditingId(item.id);
    
    // Map backend data to form fields based on role
    setFormData({
      name: item.item_name || item.room_number,
      price: item.price || item.fees || '',
      extraField: role === 'canteen' ? item.quantity 
                : role === 'stationery' ? item.stock_level 
                : item.type,
      status: item.status || item.availability_status || 'Available'
    });

    // Scroll to top to see the form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 2. CANCEL EDITING
  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({ name: '', price: '', extraField: '', status: 'Available' });
  };

  // 3. SUBMIT (ADD OR UPDATE)
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Prepare Payload
    let payload = {};
    if (role === 'canteen') {
      payload = { 
        item_name: formData.name, 
        price: formData.price, 
        quantity: formData.extraField, 
        status: formData.status 
      };
    } else if (role === 'stationery') {
      payload = { 
        item_name: formData.name, 
        price: formData.price, 
        stock_level: formData.extraField, 
        category: 'General' 
      };
    } else if (role === 'hostel') {
      payload = { 
        item_name: formData.name, 
        type: formData.extraField, 
        availability_status: formData.status 
      };
    }

    try {
      if (editingId) {
        // --- UPDATE EXISTING ITEM (PUT) ---
        // Assuming your backend route is /api/${role}/update/${id}
        await axios.put(`http://localhost:5000/api/${role}/update/${editingId}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert("Item Updated Successfully!");
      } else {
        // --- ADD NEW ITEM (POST) ---
        await axios.post(`http://localhost:5000/api/${role}/add`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert("Item Added Successfully!");
      }

      // Reset & Refresh
      handleCancelEdit(); // Clears form and edit ID
      fetchItems(); 

    } catch (err) {
      console.error(err);
      alert(`Failed to ${editingId ? 'update' : 'add'} item.`);
    }
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Are you sure you want to delete this item?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/${role}/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setItems(items.filter(item => item.id !== id));
      
      // If we deleted the item currently being edited, reset the form
      if (id === editingId) handleCancelEdit();
      
    } catch (err) {
      alert("Failed to delete item.");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate(`/login/${role}`);
  };

  // --- UI HELPERS ---
  const getThemeColor = () => {
    if (role === 'canteen') return 'text-amber-500 border-amber-500 bg-amber-500';
    if (role === 'stationery') return 'text-purple-500 border-purple-500 bg-purple-500';
    if (role === 'hostel') return 'text-emerald-500 border-emerald-500 bg-emerald-500';
    return 'text-blue-500 border-blue-500 bg-blue-500';
  };

  const themeClass = getThemeColor().split(' ')[2]; // Extract bg class

  return (
    <div className="min-h-screen bg-[#0f172a] text-white font-sans p-6">
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER */}
        <header className="flex justify-between items-center mb-10 border-b border-slate-800 pb-6">
          <h1 className="text-3xl font-bold capitalize">
            {role} <span className={`text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400`}>Dashboard</span>
          </h1>
          <button onClick={handleLogout} className="text-red-400 hover:text-red-300 font-bold border border-red-900/50 px-4 py-2 rounded-lg hover:bg-red-900/20 transition">
            Logout
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN: ADD/EDIT FORM */}
          <div className="lg:col-span-1">
            <div className={`bg-[#1e293b] p-6 rounded-2xl border ${editingId ? 'border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.2)]' : 'border-slate-700'} sticky top-10 transition-all`}>
              
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <span className={`w-2 h-6 rounded ${editingId ? 'bg-blue-500' : themeClass}`}></span>
                {editingId ? 'Edit Item' : 'Add New Item'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* Field 1: Name */}
                <div>
                  <label className="text-xs text-slate-400 uppercase font-bold">
                    {role === 'hostel' ? 'Room Number' : 'Item Name'}
                  </label>
                  <input 
                    type="text" 
                    name="name" 
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full bg-[#0f172a] border border-slate-600 rounded-lg p-3 text-white focus:border-blue-500 outline-none mt-1"
                    placeholder={role === 'hostel' ? "e.g. Room 101" : "e.g. Burger, Notebook"}
                    required 
                  />
                </div>

                {/* Field 2: Price */}
                {role !== 'hostel' && (
                  <div>
                    <label className="text-xs text-slate-400 uppercase font-bold">Price (₹)</label>
                    <input 
                      type="number" 
                      name="price" 
                      value={formData.price}
                      onChange={handleChange}
                      className="w-full bg-[#0f172a] border border-slate-600 rounded-lg p-3 text-white focus:border-blue-500 outline-none mt-1"
                      placeholder="0.00"
                      required 
                    />
                  </div>
                )}

                {/* Field 3: Extra Field */}
                <div>
                  <label className="text-xs text-slate-400 uppercase font-bold">
                    {role === 'canteen' ? 'Quantity / Portion' : role === 'stationery' ? 'Stock Level' : 'Room Type'}
                  </label>
                  <input 
                    type="text" 
                    name="extraField" 
                    value={formData.extraField}
                    onChange={handleChange}
                    className="w-full bg-[#0f172a] border border-slate-600 rounded-lg p-3 text-white focus:border-blue-500 outline-none mt-1"
                    placeholder={role === 'canteen' ? "e.g. 1 Plate" : role === 'stationery' ? "e.g. 50" : "e.g. AC / Non-AC"}
                    required 
                  />
                </div>

                {/* Field 4: Status */}
                <div>
                  <label className="text-xs text-slate-400 uppercase font-bold">Status</label>
                  <select 
                    name="status" 
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full bg-[#0f172a] border border-slate-600 rounded-lg p-3 text-white focus:border-blue-500 outline-none mt-1"
                  >
                    <option value="Available">Available</option>
                    <option value="Unavailable">Unavailable</option>
                    <option value="Occupied">Occupied (Hostel)</option>
                  </select>
                </div>

                {/* ACTION BUTTONS */}
                <div className="flex gap-2 pt-2">
                  <button 
                    type="submit" 
                    className={`flex-1 py-3 rounded-lg font-bold text-white hover:brightness-110 transition ${editingId ? 'bg-blue-600' : themeClass}`}
                  >
                    {editingId ? 'Update Item' : '+ Add Item'}
                  </button>
                  
                  {editingId && (
                    <button 
                      type="button" 
                      onClick={handleCancelEdit}
                      className="px-4 py-3 rounded-lg font-bold text-slate-400 border border-slate-600 hover:text-white hover:bg-slate-700 transition"
                    >
                      Cancel
                    </button>
                  )}
                </div>

              </form>
            </div>
          </div>

          {/* RIGHT COLUMN: INVENTORY LIST */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold mb-6">Current Inventory</h2>
            
            {loading ? <p className="text-slate-500">Loading...</p> : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {items.map(item => (
                  <div key={item.id} className={`bg-[#1e293b] p-4 rounded-xl border flex justify-between items-start transition ${editingId === item.id ? 'border-blue-500 ring-1 ring-blue-500' : 'border-slate-700 hover:border-slate-500'}`}>
                    <div>
                      <h3 className="font-bold text-lg text-white">{item.item_name || item.room_number}</h3>
                      <div className="text-sm text-slate-400 mt-1">
                        {role === 'canteen' && `Qty: ${item.quantity}`}
                        {role === 'stationery' && `Stock: ${item.stock_level}`}
                        {role === 'hostel' && `Type: ${item.type}`}
                      </div>
                      <div className={`text-xs font-bold mt-2 uppercase px-2 py-0.5 rounded inline-block border ${item.status === 'Available' || item.availability_status === 'Available' ? 'bg-emerald-900/30 text-emerald-400 border-emerald-900' : 'bg-red-900/30 text-red-400 border-red-900'}`}>
                         {item.status || item.availability_status}
                      </div>
                    </div>
                    
                    <div className="text-right flex flex-col items-end">
                      <div className="font-bold text-xl mb-3">₹{item.price || item.fees || '0'}</div>
                      
                      <div className="flex gap-3 text-xs font-bold">
                        <button 
                          onClick={() => handleEditClick(item)}
                          className="text-blue-400 hover:text-white transition"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDelete(item.id)}
                          className="text-red-400 hover:text-white transition"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {items.length === 0 && !loading && (
              <div className="text-center py-20 bg-[#1e293b]/50 rounded-xl border border-dashed border-slate-700 text-slate-500">
                No items added yet. Use the form to add one.
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;