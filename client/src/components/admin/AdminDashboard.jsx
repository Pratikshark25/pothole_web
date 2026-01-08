import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { API_BASE, getAuthHeaders } from '../../config/api';

// =======================
// ADMIN DASHBOARD COMPONENT
// =======================
const AdminDashboard = () => {
  // Access logged-in user and authentication token from AuthContext
  const { user, token } = useAuth();

  // -------------------- STATE VARIABLES --------------------
  const [allUsers, setAllUsers] = useState([]);           // Stores all users fetched from backend
  const [filteredUsers, setFilteredUsers] = useState([]); // Stores users after applying filter
  const [showCreateForm, setShowCreateForm] = useState(false); // Toggles "Create User" form visibility
  const [loading, setLoading] = useState(false);          // Loading state for user creation
  const [activeFilter, setActiveFilter] = useState('all'); // Controls filter ('all', 'commuter', 'municipality')
  
  // Form data for creating a new municipality user
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    department: ''
  });

  // -------------------- USE EFFECTS --------------------

  // Fetch all users when admin logs in or component loads
  useEffect(() => {
    if (user?.role === 'admin') {
      fetchAllUsers();
    }
  }, [user]);

  // Re-filter users whenever the user list or filter type changes
  useEffect(() => {
    filterUsers();
  }, [allUsers, activeFilter]);

  // -------------------- API CALLS --------------------

  // Fetch all registered users (only accessible by admin)
  const fetchAllUsers = async () => {
    try {
      const response = await fetch(`${API_BASE}/auth/admin/all-users`, {
        headers: getAuthHeaders(token)
      });

      if (response.ok) {
        const data = await response.json();
        setAllUsers(data.users);
      }
    } catch (error) {
      // Silent fail
    }
  };

  // Create new municipality user
  const handleCreateUser = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/auth/admin/create-municipality-user`, {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        alert('Municipality user created successfully!');
        // Reset form fields
        setFormData({ name: '', email: '', password: '', phone: '', department: '' });
        setShowCreateForm(false);
        fetchAllUsers(); // Refresh user list
      } else {
        alert(data.error || 'Failed to create user');
      }
    } catch (error) {
      alert('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Toggle user active/inactive status
  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      const response = await fetch(`${API_BASE}/auth/admin/users/${userId}/status`, {
        method: 'PATCH',
        headers: getAuthHeaders(token),
        body: JSON.stringify({ isActive: !currentStatus })
      });

      if (response.ok) {
        fetchAllUsers();
      }
    } catch (error) {
      // Silent fail
    }
  };

  // -------------------- HELPER FUNCTIONS --------------------

  // Filter users by selected role type
  const filterUsers = () => {
    if (activeFilter === 'all') setFilteredUsers(allUsers);
    else setFilteredUsers(allUsers.filter(u => u.role === activeFilter));
  };

  // Handle form field changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Assign badge colors based on role
  const getRoleBadgeColor = (role) => {
    switch(role) {
      case 'admin': return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'municipality': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'commuter': return 'bg-green-500/20 text-green-300 border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  // Calculate basic user stats
  const getUserStats = () => {
    const commuters = allUsers.filter(u => u.role === 'commuter').length;
    const municipality = allUsers.filter(u => u.role === 'municipality').length;
    const total = allUsers.length;
    return { commuters, municipality, total };
  };

  const stats = getUserStats();

  // -------------------- ACCESS CONTROL --------------------
  // If non-admin tries to access, show "Access Denied"
  if (user?.role !== 'admin') {
    return (
      <div className="text-center py-8">
        <p className="text-red-400">Access denied. Admin privileges required.</p>
      </div>
    );
  }

  // -------------------- MAIN DASHBOARD UI --------------------
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-8">

        {/* HEADER SECTION */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-orange-400 bg-clip-text text-transparent">
            Admin Dashboard
          </h2>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-300 transform hover:-translate-y-0.5 shadow-lg hover:shadow-orange-500/25"
          >
            {showCreateForm ? 'Cancel' : 'Add Municipality User'}
          </button>
        </div>

        {/* USER STATISTICS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Commuters */}
          <div className="bg-green-900/20 border border-green-700/50 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-400 font-medium mb-1">Commuters</p>
                <p className="text-3xl font-bold text-white">{stats.commuters}</p>
              </div>
              <svg className="w-12 h-12 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
          {/* Municipality Staff */}
          <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-400 font-medium mb-1">Municipality Staff</p>
                <p className="text-3xl font-bold text-white">{stats.municipality}</p>
              </div>
              <svg className="w-12 h-12 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>
          {/* Total Users */}
          <div className="bg-purple-900/20 border border-purple-700/50 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-400 font-medium mb-1">Total Users</p>
                <p className="text-3xl font-bold text-white">{stats.total}</p>
              </div>
              <svg className="w-12 h-12 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
        </div>

        {/* CREATE NEW USER FORM */}
        {showCreateForm && (
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6 mb-8">
            <h3 className="text-xl font-semibold text-white mb-4">Create Municipality User</h3>
            
            {/* Form Layout */}
            <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all duration-300"
                  placeholder="Full name"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all duration-300"
                  placeholder="Email address"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all duration-300"
                  placeholder="Password (min 6 characters)"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all duration-300"
                  placeholder="Phone number"
                />
              </div>

              {/* Department */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">Department</label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all duration-300"
                  placeholder="e.g., Road Maintenance, Public Works"
                />
              </div>

              {/* Submit Button */}
              <div className="md:col-span-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-green-500/50 disabled:to-green-600/50 text-white px-6 py-2 rounded-lg font-medium transition-all duration-300"
                >
                  {loading ? 'Creating...' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* USER FILTER BUTTONS */}
        <div className="flex space-x-1 mb-6 bg-white/5 p-1 rounded-lg border border-white/10">
          {['all', 'commuter', 'municipality'].map((type) => (
            <button
              key={type}
              onClick={() => setActiveFilter(type)}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-all duration-300 ${
                activeFilter === type
                  ? 'bg-orange-500 text-white shadow-lg'
                  : 'text-gray-300 hover:text-white hover:bg-white/5'
              }`}
            >
              {type === 'all'
                ? `All Users (${stats.total})`
                : type === 'commuter'
                ? `Commuters (${stats.commuters})`
                : `Municipality (${stats.municipality})`}
            </button>
          ))}
        </div>

        {/* USERS TABLE */}
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white/5 border border-white/10 rounded-lg">
            <thead className="bg-slate-800">
              <tr>
                {['Name', 'Email', 'Role', 'Department', 'Phone', 'Status', 'Joined', 'Actions'].map((header) => (
                  <th key={header} className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider whitespace-nowrap">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white/5 divide-y divide-white/10">
              {filteredUsers.map((user) => (
                <tr key={user._id} className="hover:bg-slate-800/50 transition-colors duration-200">
                  <td className="px-4 py-4 text-sm font-medium text-white whitespace-nowrap">{user.name}</td>
                  <td className="px-4 py-4 text-sm text-gray-300">{user.email}</td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-md ${getRoleBadgeColor(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-300 whitespace-nowrap">{user.department || '-'}</td>
                  <td className="px-4 py-4 text-sm text-gray-300 whitespace-nowrap">{user.phone || '-'}</td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-md ${
                      user.isActive 
                        ? 'bg-green-600 text-white' 
                        : 'bg-red-600 text-white'
                    }`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-300 whitespace-nowrap">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-4 text-sm font-medium whitespace-nowrap">
                    {/* Only allow admin to toggle non-admin users */}
                    {user.role !== 'admin' && (
                      <button
                        onClick={() => toggleUserStatus(user._id, user.isActive)}
                        className={`px-3 py-1 rounded-md font-medium transition-colors ${
                          user.isActive 
                            ? 'bg-red-600 hover:bg-red-700 text-white' 
                            : 'bg-green-600 hover:bg-green-700 text-white'
                        }`}
                      >
                        {user.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* If no users in selected filter */}
          {filteredUsers.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              No users found for the selected filter.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
