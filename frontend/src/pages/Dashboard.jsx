import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SweetCard from '../components/SweetCard.jsx';
import AdminForm from '../components/AdminForm.jsx';
import { sweetsAPI } from '../api/api.js';
import { Search, Plus, LogOut, X, ShieldCheck } from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const [sweets, setSweets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAdminForm, setShowAdminForm] = useState(false);
  const [editingSweet, setEditingSweet] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      navigate('/login');
      return;
    }
    
    setUser(JSON.parse(storedUser));
    fetchSweets();
  }, [navigate]);

  const fetchSweets = async (query = '') => {
    setLoading(true);
    try {
      const data = query ? await sweetsAPI.search(query) : await sweetsAPI.getAll();
      setSweets(data);
    } catch (error) {
      console.error('Error fetching sweets:', error);
      alert('Failed to load sweets');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchSweets(searchQuery);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleCreateSweet = async (sweetData) => {
    try {
      await sweetsAPI.create(sweetData);
      fetchSweets();
      setShowAdminForm(false);
      alert('Sweet created successfully!');
    } catch (error) {
      alert(error.error || 'Failed to create sweet');
    }
  };

  const handleUpdateSweet = async (sweetData) => {
    try {
      await sweetsAPI.update(editingSweet._id, sweetData);
      fetchSweets();
      setEditingSweet(null);
      alert('Sweet updated successfully!');
    } catch (error) {
      alert(error.error || 'Failed to update sweet');
    }
  };

  const handleDeleteSweet = async (id) => {
    if (!window.confirm('Are you sure you want to delete this sweet?')) return;
    
    try {
      await sweetsAPI.delete(id);
      fetchSweets();
      alert('Sweet deleted successfully!');
    } catch (error) {
      alert(error.error || 'Failed to delete sweet');
    }
  };

  const handlePurchase = () => {
    fetchSweets();
  };

  const isAdmin = user?.isAdmin;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl shadow-lg">
                <span className="text-xl">🍰</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Sweet Shop</h1>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-sm text-gray-600">
                    Welcome back, <span className="font-semibold text-gray-900">{user?.name}</span>
                  </p>
                  {isAdmin && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-pink-100 to-rose-100 text-pink-700 text-xs font-medium rounded-full">
                      <ShieldCheck className="w-3 h-3" />
                      Admin
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-400 transition-all shadow-sm"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Controls */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              {/* Search */}
              <form onSubmit={handleSearch} className="flex-1 flex gap-2">
                <div className="relative flex-1 max-w-md">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search sweets..."
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                  />
                </div>
                <button 
                  type="submit" 
                  className="px-5 py-2.5 bg-gradient-to-r from-pink-500 to-rose-600 text-white font-medium rounded-xl hover:from-pink-600 hover:to-rose-700 transition-all shadow-md hover:shadow-lg"
                >
                  Search
                </button>
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      fetchSweets();
                    }}
                    className="px-4 py-2.5 bg-white border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </form>
              
              {/* Add Button */}
              {isAdmin && (
                <button
                  onClick={() => setShowAdminForm(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg whitespace-nowrap"
                >
                  <Plus className="w-5 h-5" />
                  Add New Sweet
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Sweet List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-pink-200 border-t-pink-600 rounded-full animate-spin"></div>
            </div>
            <p className="mt-6 text-gray-600 font-medium">Loading delicious sweets...</p>
          </div>
        ) : sweets.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">🍬</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No sweets found</h3>
            <p className="text-gray-600 mb-6">
              {searchQuery 
                ? "Try adjusting your search terms" 
                : "There are no sweets available at the moment"}
            </p>
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  fetchSweets();
                }}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-600 text-white font-medium rounded-xl hover:from-pink-600 hover:to-rose-700 transition-all shadow-md hover:shadow-lg"
              >
                View All Sweets
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sweets.map((sweet) => (
              <SweetCard
                key={sweet._id}
                sweet={sweet}
                isAdmin={isAdmin}
                onUpdate={() => setEditingSweet(sweet)}
                onDelete={handleDeleteSweet}
                onPurchase={handlePurchase}
              />
            ))}
          </div>
        )}
      </main>

      {/* Admin Forms */}
      {showAdminForm && (
        <AdminForm
          onSubmit={handleCreateSweet}
          onCancel={() => setShowAdminForm(false)}
        />
      )}

      {editingSweet && (
        <AdminForm
          sweet={editingSweet}
          onSubmit={handleUpdateSweet}
          onCancel={() => setEditingSweet(null)}
        />
      )}
    </div>
  );
};

export default Dashboard;