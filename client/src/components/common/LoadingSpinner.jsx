import React from 'react';

const LoadingSpinner = ({ size = 'md', message = '' }) => {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4 p-8">
      <div className={`${sizes[size]} relative`}>
        <div className="absolute inset-0 rounded-full border-4 border-orange-500/20"></div>
        <div className="absolute inset-0 rounded-full border-4 border-t-orange-500 animate-spin"></div>
      </div>
      {message && (
        <p className="text-gray-400 text-sm animate-pulse">{message}</p>
      )}
    </div>
  );
};

export default LoadingSpinner;
