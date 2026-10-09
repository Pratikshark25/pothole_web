import React, { useState } from 'react';
import Login from './Login';
import Signup from './Signup';

const AuthModal = ({ isOpen, onClose }) => {
  const [isLoginMode, setIsLoginMode] = useState(true);

  if (!isOpen) return null;

  const handleSuccess = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="relative max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-white/10 backdrop-blur-md border border-white/20 rounded-full p-2 shadow-lg hover:bg-white/20 text-white transition-all duration-300 transform hover:scale-110"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {isLoginMode ? (
          <Login
            onSwitchToSignup={() => setIsLoginMode(false)}
            onSuccess={handleSuccess}
          />
        ) : (
          <Signup
            onSwitchToLogin={() => setIsLoginMode(true)}
            onSuccess={handleSuccess}
          />
        )}
      </div>
    </div>
  );
};

export default AuthModal;