import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/Layout';
import HomePage from './components/HomePage';
import Dashboard from './components/Dashboard';
import AdminDashboard from './components/admin/AdminDashboard';
import MunicipalDashboard from './components/municipal/MunicipalDashboard';
import ReportPothole from './components/ReportPothole';
import PotholeMap from './components/PotholeMap';
import Profile from './components/Profile';
import TeamPage from './components/TeamPage';
import OTPInput from './components/auth/OTPInput';
import Reset from './components/auth/Reset';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<HomePage />} />
              <Route path="/team" element={<TeamPage />} />

              {/* User (commuter) routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute roles={['commuter']}>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/report"
                element={
                  <ProtectedRoute roles={['commuter']}>
                    <ReportPothole />
                  </ProtectedRoute>
                }
              />

              {/* Admin routes */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute roles={['admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Municipality routes */}
              <Route
                path="/municipal"
                element={
                  <ProtectedRoute roles={['municipality']}>
                    <MunicipalDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Shared route (map) */}
              <Route
                path="/map"
                element={
                  <ProtectedRoute roles={['commuter', 'admin', 'municipality']}>
                    <PotholeMap />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
            <Route
              path='/otp'
              element={<OTPInput />}
            />
            <Route
              path='/reset'
              element={<Reset />}
            /></Route>  
                      <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;