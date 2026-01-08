import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthModal from './auth/AuthModal';

const Layout = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-purple-500/20 text-purple-300 border border-purple-500/30';
      case 'municipality': return 'bg-blue-500/20 text-blue-300 border border-blue-500/30';
      case 'commuter': return 'bg-green-500/20 text-green-300 border border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border border-gray-500/30';
    }
  };

  const isActivePage = (path) => location.pathname === path;
    const hideLayoutRoutes = ['/otp', '/reset'];
  const isAuthPage = hideLayoutRoutes.includes(location.pathname);

  if (isAuthPage) {
    // Only render the outlet (no header/footer)
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f4f6f9' }}>
        <Outlet />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="bg-gradient-to-r from-gray-900/95 to-black/95 backdrop-blur-lg border-b border-white/10 text-white shadow-lg">
        <div className="max-w-8xl mx-auto px-5 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link to="/" className="flex items-center space-x-3 hover:opacity-90 transition-opacity">
              <span className="text-4xl">🕳</span>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-orange-400 bg-clip-text text-transparent">
                Pothole Mapper
              </h1>
            </Link>
            
            <nav className="flex space-x-2 items-center">
              {isAuthenticated ? (
                <>
                  <div className="flex items-center space-x-3">
                    <span className="text-white/90">👋🏻Hey {user?.name}</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm ${getRoleBadgeColor(user?.role)}`}>
                      {user?.role}
                    </span>
                    
                  </div>

                  {/* Role-based Navigation */}
                  {user?.role === 'commuter' && (
                    <>
                      <Link
                        to="/report"
                        className={`px-4 py-2 rounded-lg font-medium
                          ${isActivePage('/report') && 'bg-white/10 border border-white/20 hover:bg-white/20'}`}
                      >
                        Report Pothole
                      </Link>

                      <Link
                        to="/dashboard"
                        className={`px-4 py-2 rounded-lg font-medium 
                          ${isActivePage('/dashboard') && 'bg-white/10 border border-white/20 hover:bg-white/20'}`}
                      >
                        Dashboard
                      </Link>
                    </>
                  )}

                  {user?.role === 'admin' && (
                    <Link
                      to="/admin"
                      className={`px-4 py-2 rounded-lg font-medium 
                        ${isActivePage('/admin') && 'bg-white/10 border border-white/20 hover:bg-white/20'}`}
                    >
                      Admin Panel
                    </Link>
                  )}

                  {user?.role === 'municipality' && (
                    <Link
                      to="/municipal"
                      className={`px-4 py-2 rounded-lg font-medium
                        ${isActivePage('/municipal') && 'bg-white/10 border border-white/20 hover:bg-white/20'}`}
                    >
                      Municipal Dashboard
                    </Link>
                  )}

                  {/* Map (shared) */}
                  <Link
                    to="/map"
                    className={`px-4 py-2 rounded-lg font-medium 
                      ${isActivePage('/map') && 'bg-white/10 border border-white/20 hover:bg-white/20'}`}
                  >
                    Map View
                  </Link>

                  {/* Profile */}
                  <Link
                    to="/profile"
                    className={`px-4 py-2 rounded-lg font-medium  ${
                      isActivePage('/profile')
                      &&'bg-white/10 border border-white/20 hover:bg-white/20'
                    }`}
                  >
                    Profile
                  </Link>
                  
                  {/* Logout */}
                  <button 
                    onClick={handleLogout}
                    className=  " hover:bg-white/20 px-4 py-2 rounded-lg font-medium transition-all duration-300 backdrop-blur-sm"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <button 
                    onClick={() => setShowAuthModal(true)}
                    className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 px-4 py-2 rounded-lg font-medium transition-all duration-300 transform hover:-translate-y-0.5 shadow-lg hover:shadow-orange-500/25"
                  >
                    Report Pothole
                  </button>
                  <button 
                    onClick={() => setShowAuthModal(true)}
                    className="bg-white/10 border border-white/20 hover:bg-white/20 px-4 py-2 rounded-lg font-medium transition-all duration-300 backdrop-blur-sm"
                  >
                    Sign In
                  </button>
                </>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-gray-900/95 to-black/95 backdrop-blur-lg border-t border-white/10 text-white py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-300">&copy; 2025 Pothole Mapper. Making roads safer, one pothole at a time.</p>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </div>
  );
};

export default Layout;

