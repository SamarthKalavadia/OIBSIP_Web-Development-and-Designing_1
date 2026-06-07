import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect, useRef } from 'react';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMenuOpen(false);
    setDropdownOpen(false);
  };

  const isAdmin = user?.role === 'admin';
  const isAuthenticated = Boolean(user);

  const publicLinks = [
    { label: 'Home', to: '/', icon: '🏠' },
    { label: 'Login', to: '/login', icon: '👤' },
    { label: 'Register', to: '/register', icon: '✨', isButton: true },
  ];

  const userLinks = isAdmin
    ? [
        { label: 'Dashboard', to: '/admin', icon: '📊' },
        { label: 'Inventory', to: '/admin/inventory', icon: '📦' },
        { label: 'Orders', to: '/admin/orders', icon: '📋' },
      ]
    : [
        { label: 'Home', to: '/', icon: '🏠' },
        { label: 'Explore Menu', to: '/menu', icon: '🍕' },
        { label: 'Build Pizza', to: '/build-pizza', icon: '🛠' },
        { label: 'My Orders', to: '/my-orders', icon: '📦' },
      ];

  const links = isAuthenticated ? userLinks : publicLinks;

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="container nav-container">
        
        {/* BRAND */}
        <Link to={isAuthenticated ? (isAdmin ? '/admin' : '/menu') : '/'} className="nav-brand">
          <img
            src="/images/phero.png"
            alt="PizzaGo"
            className="nav-logo-img"
          />
        </Link>

        {/* MOBILE TOGGLE */}
        <button className="nav-hamburger" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? '✕' : '☰'}
        </button>

        {/* NAVIGATION LINKS */}
        <ul className={`nav-menu ${menuOpen ? 'open' : ''}`}>
          {links.map((item) => (
            <li key={item.to}>
              <Link
                to={item.to}
                className={`nav-link ${location.pathname === item.to ? 'active' : ''} ${item.isButton ? 'btn-primary' : ''}`}
                onClick={() => setMenuOpen(false)}
              >
                <span className="nav-link-icon">{item.icon}</span>
                {item.label}
              </Link>
            </li>
          ))}

          {/* MOBILE PROFILE (Only shows on mobile) */}
          {isAuthenticated && (
            <li className="mobile-profile-section">
              <Link to="/profile" className="nav-link" onClick={() => setMenuOpen(false)}>
                <span className="nav-link-icon">👤</span> Profile Settings
              </Link>
              <button className="nav-link" onClick={handleLogout} style={{color: 'var(--danger)', width: '100%', textAlign: 'left'}}>
                <span className="nav-link-icon">🚪</span> Logout
              </button>
            </li>
          )}
        </ul>

        {/* DESKTOP PROFILE DROPDOWN */}
        {isAuthenticated && (
          <div className="nav-profile" ref={dropdownRef}>
            <button 
              className={`nav-avatar-btn ${dropdownOpen ? 'active' : ''}`}
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              {user.name.charAt(0).toUpperCase()}
            </button>
            
            <div className={`profile-dropdown ${dropdownOpen ? 'show' : ''}`}>
              <div className="dropdown-header">
                <div className="dropdown-name">{user.name}</div>
                <div className="dropdown-email">{user.email}</div>
              </div>
              <Link to="/profile" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                👤 My Profile
              </Link>
              <Link to="/my-orders" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                📦 Order History
              </Link>
              <button className="dropdown-item logout" onClick={handleLogout}>
                🚪 Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
