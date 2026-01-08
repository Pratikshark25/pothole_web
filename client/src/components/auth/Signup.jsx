import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Signup = ({ onSwitchToLogin }) => {
  const { signup, loading, error, clearError } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [validationErrors, setValidationErrors] = useState({});
  const navigate = useNavigate();

  // Clear error when component mounts
  useEffect(() => {
    clearError();
  }, []);

  const validate = () => {
    let errors = {};

    // Name validation (min 3 chars, letters + spaces only)
    if (!/^[A-Za-z\s]{3,}$/.test(formData.name.trim())) {
      errors.name = "Name must be at least 3 letters (letters only).";
    }

    // Email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Enter a valid email address.";
    }

    // Password validation (simplified)
    if (formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters.";
    }

    // Confirm password
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match.";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    const { confirmPassword, ...submitData } = formData;
    submitData.role = 'commuter';
    
    // Clear any previous errors
    clearError();
    
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData)
      });
      
      // Parse JSON response
      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        console.error('Failed to parse response as JSON');
        throw new Error('Server error. Please try again later.');
      }
      
      if (response.ok) {
        // User is now logged in immediately - store tokens
        if (data.accessToken) {
          localStorage.setItem('accessToken', data.accessToken);
          localStorage.setItem('refreshToken', data.refreshToken);
        }
        
        // Show success message briefly then redirect
        alert('Account created successfully! Redirecting to dashboard...');
        window.location.href = '/dashboard';
      } else {
        // Handle specific errors
        if (data.errors && Array.isArray(data.errors)) {
          // Backend validation errors from express-validator
          const fieldErrors = {};
          data.errors.forEach(err => {
            fieldErrors[err.path || err.param] = err.msg;
          });
          setValidationErrors(fieldErrors);
        } else if (data.error) {
          // Single error message
          alert(data.error);
        } else {
          alert('Signup failed. Please try again.');
        }
      }
    } catch (err) {
      console.error('Signup error:', err);
      alert(err.message || 'Network error. Please check your connection and try again.');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });

    // Clear field-specific error as user types
    setValidationErrors(prev => ({
      ...prev,
      [e.target.name]: ''
    }));
  };

  return (
    <div className="max-w-md mx-auto bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-orange-400 bg-clip-text text-transparent">
          Create Account
        </h2>
        <p className="text-gray-300 mt-2">Join Pothole Mapper as a Commuter</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg mb-6 backdrop-blur-sm">
          {error}
        </div>
      )}

      {/* Email verification removed - users are auto-logged in after signup */}
      <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              disabled={loading}
              className={`w-full px-4 py-3 bg-white/5 border ${validationErrors.name ? 'border-red-500/50' : 'border-white/10'} rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all duration-300 backdrop-blur-sm disabled:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50`}
              placeholder="Enter your full name"
            />
            {validationErrors.name && (
              <p className="text-red-400 text-sm mt-1">{validationErrors.name}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={loading}
              className={`w-full px-4 py-3 bg-white/5 border ${validationErrors.email ? 'border-red-500/50' : 'border-white/10'} rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all duration-300 backdrop-blur-sm disabled:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50`}
              placeholder="Enter your email"
            />
            {validationErrors.email && (
              <p className="text-red-400 text-sm mt-1">{validationErrors.email}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={loading}
              className={`w-full px-4 py-3 bg-white/5 border ${validationErrors.password ? 'border-red-500/50' : 'border-white/10'} rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all duration-300 backdrop-blur-sm disabled:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50`}
              placeholder="Create a strong password (min. 10 characters)"
            />
            {validationErrors.password && (
              <p className="text-red-400 text-sm mt-1">{validationErrors.password}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              disabled={loading}
              className={`w-full px-4 py-3 bg-white/5 border ${validationErrors.confirmPassword ? 'border-red-500/50' : 'border-white/10'} rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all duration-300 backdrop-blur-sm disabled:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50`}
              placeholder="Confirm your password"
            />
            {validationErrors.confirmPassword && (
              <p className="text-red-400 text-sm mt-1">{validationErrors.confirmPassword}</p>
            )}
          </div>

          <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-lg backdrop-blur-sm">
            <p className="text-sm text-blue-300">
              <strong>Note:</strong> You'll be registered as a Commuter. Only administrators can create Municipality accounts.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:from-orange-500/50 disabled:to-orange-600/50 text-white font-medium py-3 px-4 rounded-lg transition-all duration-300 disabled:cursor-not-allowed shadow-lg hover:shadow-orange-500/25 transform hover:-translate-y-0.5 disabled:transform-none"
          >
            {loading ? 'Creating Account...' : 'Create Commuter Account'}
          </button>
        </form>

      <div className="text-center mt-6">
          <p className="text-gray-400">
            Already have an account?{' '}
            <button
              onClick={onSwitchToLogin}
              disabled={loading}
              className="text-orange-400 hover:text-orange-300 font-medium disabled:text-orange-500 disabled:cursor-not-allowed transition-colors duration-300"
            >
              Sign in here
            </button>
          </p>
        </div>
    </div>
  );
};

export default Signup;