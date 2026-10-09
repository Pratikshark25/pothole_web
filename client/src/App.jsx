import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/Layout';
import HomePage from './components/HomePage';
import ProtectedRoute from './components/ProtectedRoute';
const Dashboard = lazy(() => import('./components/Dashboard'));
const AdminDashboard = lazy(() => import('./components/admin/AdminDashboard'));
const MunicipalDashboard = lazy(() => import('./components/municipal/MunicipalDashboard'));
const ReportPothole = lazy(() => import('./components/ReportPothole'));
const PotholeMap = lazy(() => import('./components/PotholeMap'));
const Profile = lazy(() => import('./components/Profile'));
const OTPInput = lazy(() => import('./components/auth/OTPInput'));
const Reset = lazy(() => import('./components/auth/Reset'));
const PageLoader = () => <div className="min-h-[40vh] bg-stone-50" aria-label="Loading page" />;

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Suspense fallback={<PageLoader />}>
            <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<HomePage />} />

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
          </Suspense>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;