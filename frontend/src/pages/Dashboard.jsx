import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SweetCard from '../components/SweetCard.jsx';
import AdminForm from '../components/AdminForm.jsx';
import { sweetsAPI } from '../api/api.js';

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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Sweet Shop</h1>
              <p className="text-gray-600">
                Welcome, {user?.name}
                {isAdmin && <span className="ml-2 px-2 py-1 bg-primary-100 text-primary-800 text-xs rounded-full">Admin</span>}
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={handleLogout}
                className="btn-secondary"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Controls */}
        <div className="mb-8 flex flex-col sm:flex-row justify-between gap-4">
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search sweets..."
              className="input-field max-w-xs"
            />
            <button type="submit" className="btn-primary">
              Search
            </button>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                fetchSweets();
              }}
              className="btn-secondary"
            >
              Clear
            </button>
          </form>
          
          {isAdmin && (
            <button
              onClick={() => setShowAdminForm(true)}
              className="btn-primary bg-green-600 hover:bg-green-700"
            >
              + Add New Sweet
            </button>
          )}
        </div>

        {/* Sweet List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-gray-600">Loading sweets...</p>
          </div>
        ) : sweets.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No sweets found</p>
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  fetchSweets();
                }}
                className="btn-primary mt-4"
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