import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { API_BASE } from '../../config/api';

const Login = ({ onSwitchToSignup, onSuccess,onNavigateToForgotPassword }) => {
  const { login, loading, error, clearError } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [OTP, setOTP] = useState(null);

  useEffect(() => {
    clearError();
  }, []);
 async function navigateToOtp() {
  if (!formData.email) {
    alert("Please enter your email");
    return;
  }

  const OTP = Math.floor(Math.random() * 9000 + 1000);
  console.log("Generated OTP:", OTP);
  setOTP(OTP);

  try {
    const response = await fetch(`${API_BASE}/auth/send_recovery_email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        OTP,
        recipient_email: formData.email,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to send recovery email");
    }

    // You can await response.json() if backend returns data
    await response.json();

    navigate("/otp", {
      state: { email: formData.email, otp: OTP },
    });
  } catch (error) {
    console.error("Error sending recovery email:", error);
    alert("Failed to send recovery email. Please try again.");
  }
}


  // Validate email format
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Validate password (minimum 6 characters for login)
  const validatePassword = (password) => {
    return password.length >= 6;
  };

  // Real-time validation
  const validateForm = () => {
    const errors = {};

    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (!validatePassword(formData.password)) {
      errors.password = 'Password must be at least 6 characters';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form before submission
    if (!validateForm()) {
      return;
    }

    if (isSubmitting) return; // Prevent double submission

    setIsSubmitting(true);
    try {
      const result = await login(formData);
      if (result.success && onSuccess) {
        // Reset failed attempts on successful login
        setFailedAttempts(0);
        setShowForgotPassword(false);
        onSuccess();
      } else {
        // Increment failed attempts
        const newFailedAttempts = failedAttempts + 1;
        setFailedAttempts(newFailedAttempts);
        
        // Show forgot password link after 3 failed attempts
        if (newFailedAttempts >= 3) {
          setShowForgotPassword(true);
        }
      }
    } catch (error) {
      // Error is handled by AuthContext
      const newFailedAttempts = failedAttempts + 1;
      setFailedAttempts(newFailedAttempts);
      
      if (newFailedAttempts >= 3) {
        setShowForgotPassword(true);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData({
      ...formData,
      [name]: value
    });

    // Clear field-specific validation error on change
    if (validationErrors[name]) {
      setValidationErrors({
        ...validationErrors,
        [name]: ''
      });
    }

    // Check email validity for conditional rendering
    if (name === 'email') {
      setIsEmailValid(validateEmail(value));
    }
  };

  const isLoading = loading || isSubmitting;

  return (
    <div className="max-w-md mx-auto bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-orange-400 bg-clip-text text-transparent">
          Welcome Back
        </h2>
        <p className="text-gray-300 mt-2">Sign in to your Pothole Mapper account</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg mb-6 backdrop-blur-sm">
          <div className="flex items-start">
            <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div>
              <p>{error}</p>
              {failedAttempts >= 3 && (
                <p className="text-sm mt-2">
                  Too many failed attempts. Try resetting your password below.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {failedAttempts > 0 && failedAttempts < 3 && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 px-4 py-3 rounded-lg mb-6 backdrop-blur-sm">
          <p className="text-sm">
            ⚠️ Failed login attempt {failedAttempts} of 3. 
            {failedAttempts === 2 && " One more failed attempt will show password reset option."}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email Field */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Email Address <span className="text-red-400">*</span>
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            disabled={isLoading}
            className={`w-full px-4 py-3 bg-white/5 border ${
              validationErrors.email 
                ? 'border-red-500/50' 
                : 'border-white/10'
            } rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all duration-300 backdrop-blur-sm disabled:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50`}
            placeholder="your.email@example.com"
            autoComplete="email"
          />
          {validationErrors.email && (
            <p className="text-red-400 text-sm mt-1 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {validationErrors.email}
            </p>
          )}
        </div>

        {/* Password Field */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Password <span className="text-red-400">*</span>
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            disabled={isLoading}
            className={`w-full px-4 py-3 bg-white/5 border ${
              validationErrors.password 
                ? 'border-red-500/50' 
                : 'border-white/10'
            } rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all duration-300 backdrop-blur-sm disabled:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50`}
            placeholder="Enter your password"
            autoComplete="current-password"
          />
          {validationErrors.password && (
            <p className="text-red-400 text-sm mt-1 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {validationErrors.password}
            </p>
          )}
        </div>

        {/* Forgot Password Link - Always show but emphasize after 3 attempts */}
        <div className="flex items-center justify-between">
          <div className="text-sm">
            <span className="text-gray-400">New user? </span>
            <button
              type="button"
              onClick={onSwitchToSignup}
              disabled={isLoading}
              className="text-orange-400 hover:text-orange-300 font-medium disabled:text-orange-500 disabled:cursor-not-allowed transition-colors duration-300"
            >
              Create account
            </button>
          </div>
         <button
  type="button"
  className="text-orange-400 hover:text-orange-300 font-medium disabled:text-orange-500 disabled:cursor-not-allowed transition-colors duration-300"
 onClick={() => navigateToOtp()}
>
  Forgot password
</button>

        </div>
        
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:from-orange-500/50 disabled:to-orange-600/50 text-white font-medium py-3 px-4 rounded-lg transition-all duration-300 disabled:cursor-not-allowed shadow-lg hover:shadow-orange-500/25 transform hover:-translate-y-0.5 disabled:transform-none flex items-center justify-center"
        >
          {isLoading && (
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          )}
          {isLoading ? 'Signing In...' : 'Sign In'}
        </button>
      </form>

      {/* Info Box for New Users */}
      <div className="mt-6 bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 backdrop-blur-sm">
        <div className="flex items-start">
          <svg className="w-5 h-5 text-blue-400 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div>
            <p className="text-sm text-blue-300 font-medium">New to Pothole Mapper?</p>
            <p className="text-xs text-blue-200 mt-1">
              Create a free account to report potholes, track repairs, and earn rewards for making roads safer!
            </p>
            <button
              onClick={onSwitchToSignup}
              disabled={isLoading}
              className="mt-3 text-sm text-orange-400 hover:text-orange-300 font-medium disabled:text-orange-500 disabled:cursor-not-allowed transition-colors duration-300 flex items-center"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
              Create Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;