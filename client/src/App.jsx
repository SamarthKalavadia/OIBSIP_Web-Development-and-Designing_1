import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import LandingPage from './pages/LandingPage';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import VerifyEmail from './pages/auth/VerifyEmail';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import Dashboard from './pages/user/Dashboard';
import BuildPizza from './pages/user/BuildPizza';
import Checkout from './pages/user/Checkout';
import MyOrders from './pages/user/MyOrders';
import Profile from './pages/user/Profile';
import AdminLayout from './components/AdminLayout';
import './index.css';

const AppRoutes = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '64px' }}>
        <span style={{ animation: 'spin 2s linear infinite', display: 'inline-block' }}>🍕</span>
      </div>
    );
  }

  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <>
      {!isAdminRoute && <Navbar />}
      <Routes>
        <Route path="/" element={<LandingPage />} />
        {/* Public */}
        <Route path="/login" element={user ? <Navigate to={user.role === 'admin' ? '/admin' : '/menu'} /> : <Login />} />
        <Route path="/register" element={user ? <Navigate to="/menu" /> : <Register />} />
        <Route path="/verify-email/:token" element={<VerifyEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* User */}
        <Route path="/dashboard" element={<Navigate to="/menu" replace />} />
        <Route path="/menu" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/build-pizza" element={<ProtectedRoute><BuildPizza /></ProtectedRoute>} />
        <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
        <Route path="/my-orders" element={<ProtectedRoute><MyOrders /></ProtectedRoute>} />

        {/* Admin Layout handles all nested admin paths */}
        <Route path="/admin/*" element={<AdminRoute><AdminLayout /></AdminRoute>} />

        {/* Default */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      {!isAdminRoute && <Footer />}
    </>
  );
};

const App = () => (
  <Router>
    <AuthProvider>
      <AppRoutes />
      <ToastContainer position="top-right" autoClose={3000} theme="dark" />
    </AuthProvider>
  </Router>
);

export default App;
