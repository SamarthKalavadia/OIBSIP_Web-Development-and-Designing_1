import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AdminDashboard from '../pages/admin/AdminDashboard';
import Inventory from '../pages/admin/Inventory';
import PizzaMenu from '../pages/admin/PizzaMenu';
import Orders from '../pages/admin/Orders';
import Analytics from '../pages/admin/Analytics';
import Notifications from '../pages/admin/Notifications';
import Settings from '../pages/admin/Settings';
import './AdminLayout.css';

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const menuItems = [
    { label: 'Dashboard', path: '/admin', icon: '📊' },
    { label: 'Inventory', path: '/admin/inventory', icon: '📦' },
    { label: 'Pizza Menu', path: '/admin/pizza-menu', icon: '🍕' },
    { label: 'Orders', path: '/admin/orders', icon: '🛒' },
    { label: 'Analytics', path: '/admin/analytics', icon: '📈' },
    { label: 'Notifications', path: '/admin/notifications', icon: '🔔' },
    { label: 'Settings', path: '/admin/settings', icon: '⚙️' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getPageTitle = () => {
    const activeItem = menuItems.find(item => item.path === location.pathname);
    return activeItem ? activeItem.label : 'Admin Portal';
  };

  // Close dropdowns on click outside
  useEffect(() => {
    const closeDropdowns = () => {
      setShowProfileMenu(false);
      setShowQuickActions(false);
    };
    document.addEventListener('click', closeDropdowns);
    return () => document.removeEventListener('click', closeDropdowns);
  }, []);

  const handleQuickAction = (actionPath) => {
    navigate(actionPath);
  };

  return (
    <div className={`admin-layout ${collapsed ? 'sidebar-collapsed' : ''}`}>
      {/* LEFT SIDEBAR */}
      <aside className="admin-sidebar">
        <div className="sidebar-brand">
          <img
            src="/images/phero.png"
            alt="PizzaGo"
            className={`sidebar-logo-img ${collapsed ? 'collapsed' : ''}`}
          />
        </div>
        
        <button 
          className="sidebar-collapse-toggle" 
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {collapsed ? '➔' : '➔'}
        </button>

        <nav className="sidebar-nav">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link 
                key={item.path} 
                to={item.path} 
                className={`sidebar-link ${isActive ? 'active' : ''}`}
                title={item.label}
              >
                <span className="sidebar-icon">{item.icon}</span>
                {!collapsed && <span className="sidebar-label">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <button 
            className="sidebar-link logout-btn" 
            onClick={handleLogout}
            title="Logout"
          >
            <span className="sidebar-icon">🚪</span>
            {!collapsed && <span className="sidebar-label">Logout</span>}
          </button>
        </div>
      </aside>

      {/* RIGHT CONTENT WORKSPACE */}
      <div className="admin-workspace">
        {/* TOP HEADER */}
        <header className="admin-header">
          <div className="header-left">
            <h1 className="header-page-title">{getPageTitle()}</h1>
            <span className="header-date">
              📅 {new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          </div>

          <div className="header-right">
            {/* Search Bar */}
            <div className="header-search">
              <span className="search-icon">🔍</span>
              <input 
                type="text" 
                placeholder="Search orders, ingredients..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Quick Actions Dropdown */}
            <div className="quick-actions-wrapper" onClick={e => e.stopPropagation()}>
              <button 
                className="header-action-btn quick-actions-trigger"
                onClick={() => setShowQuickActions(!showQuickActions)}
              >
                ⚡ Quick Actions ▾
              </button>
              {showQuickActions && (
                <div className="quick-actions-dropdown">
                  <button onClick={() => handleQuickAction('/admin/inventory')}>➕ Add Inventory Item</button>
                  <button onClick={() => handleQuickAction('/admin/pizza-menu')}>🍕 Manage Pizza Menu</button>
                  <button onClick={() => handleQuickAction('/admin/orders')}>🛒 Process Live Orders</button>
                </div>
              )}
            </div>

            {/* Notifications Bell Icon */}
            <Link to="/admin/notifications" className="header-icon-btn notifications-bell" title="Notification Center">
              <span className="bell-icon">🔔</span>
              <span className="bell-badge">3</span>
            </Link>

            {/* Admin Profile */}
            <div className="admin-profile-wrapper" onClick={e => e.stopPropagation()}>
              <div 
                className="admin-profile-badge" 
                onClick={() => setShowProfileMenu(!showProfileMenu)}
              >
                <div className="admin-avatar">{user?.name ? user.name.charAt(0).toUpperCase() : 'A'}</div>
                <div className="admin-info">
                  <span className="admin-name">{user?.name || 'Administrator'}</span>
                  <span className="admin-role">Store Manager</span>
                </div>
              </div>
              {showProfileMenu && (
                <div className="profile-dropdown">
                  <div className="profile-dropdown-header">
                    <strong>{user?.name}</strong>
                    <span>{user?.email}</span>
                  </div>
                  <Link to="/admin/settings" className="dropdown-link">⚙️ Settings</Link>
                  <button onClick={handleLogout} className="dropdown-link logout-link">🚪 Logout</button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* PAGE CONTENT OUTLET */}
        <main className="admin-content">
          <Routes>
            <Route index element={<AdminDashboard />} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="pizza-menu" element={<PizzaMenu />} />
            <Route path="orders" element={<Orders />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
