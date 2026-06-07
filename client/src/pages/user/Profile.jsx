import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Profile.css';

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('personal');

  // Toggle states for settings (UI only as per plan)
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(false);
  const [promoEmails, setPromoEmails] = useState(true);

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="page profile-page container">
      <div className="profile-header animate-fade-in-up">
        <h1>👤 My Profile</h1>
      </div>

      <div className="profile-layout">
        
        {/* ━━━ SIDEBAR ━━━ */}
        <div className="profile-sidebar animate-fade-in-up" style={{animationDelay: '0.1s'}}>
          <div className="profile-avatar-large">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <h2 className="profile-name">{user.name}</h2>
          <p className="profile-email">{user.email}</p>
          <div className="profile-member-since">
            Member since {new Date().getFullYear()}
          </div>

          <div className="profile-nav">
            <button 
              className={`profile-nav-btn ${activeTab === 'personal' ? 'active' : ''}`}
              onClick={() => setActiveTab('personal')}
            >
              <span className="nav-icon">ℹ️</span> Personal Info
            </button>
            <button 
              className={`profile-nav-btn ${activeTab === 'addresses' ? 'active' : ''}`}
              onClick={() => setActiveTab('addresses')}
            >
              <span className="nav-icon">📍</span> Saved Addresses
            </button>
            <button 
              className="profile-nav-btn"
              onClick={() => navigate('/my-orders')}
            >
              <span className="nav-icon">📦</span> Order History
            </button>
            <button 
              className={`profile-nav-btn ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveTab('settings')}
            >
              <span className="nav-icon">⚙️</span> Settings
            </button>
            <button 
              className="profile-nav-btn"
              style={{color: 'var(--danger)', marginTop: '16px'}}
              onClick={handleLogout}
            >
              <span className="nav-icon">🚪</span> Logout
            </button>
          </div>
        </div>

        {/* ━━━ CONTENT ━━━ */}
        <div className="profile-content animate-fade-in-up" style={{animationDelay: '0.2s'}}>
          
          {/* TAB: Personal Info */}
          {activeTab === 'personal' && (
            <div className="animate-fade-in">
              <h2>Personal Information</h2>
              
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">Full Name</span>
                  <span className="info-value">{user.name}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Email Address</span>
                  <span className="info-value">{user.email}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Phone Number</span>
                  <span className="info-value">+91 99999 99999</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Account Role</span>
                  <span className="info-value" style={{textTransform: 'capitalize'}}>{user.role}</span>
                </div>
              </div>

              <button className="btn btn-secondary">✏️ Edit Information</button>
            </div>
          )}

          {/* TAB: Addresses */}
          {activeTab === 'addresses' && (
            <div className="animate-fade-in">
              <h2>Saved Addresses</h2>
              
              <div className="address-grid">
                <div className="address-card">
                  <span className="address-type">HOME</span>
                  <h4>{user.name}</h4>
                  <p>
                    123 Pizza Street, Tech Park Area<br />
                    Near Metro Station<br />
                    Bangalore, Karnataka 560001
                  </p>
                  <div className="address-actions">
                    <button className="btn-ghost" style={{padding: '0', color: 'var(--primary)'}}>Edit</button>
                    <button className="btn-ghost" style={{padding: '0', color: 'var(--danger)'}}>Delete</button>
                  </div>
                </div>

                <div className="address-card add-new">
                  <span style={{fontSize: '2rem'}}>+</span>
                  <span style={{fontWeight: '600'}}>Add New Address</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB: Settings */}
          {activeTab === 'settings' && (
            <div className="animate-fade-in">
              <h2>Account Settings</h2>
              
              <div className="settings-list">
                <div className="setting-item">
                  <div className="setting-info">
                    <h4>Order Emails</h4>
                    <p>Receive email updates about your order status</p>
                  </div>
                  <label className="toggle-switch">
                    <input type="checkbox" checked={emailAlerts} onChange={(e) => setEmailAlerts(e.target.checked)} />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="setting-item">
                  <div className="setting-info">
                    <h4>SMS Notifications</h4>
                    <p>Get text messages when your pizza is out for delivery</p>
                  </div>
                  <label className="toggle-switch">
                    <input type="checkbox" checked={smsAlerts} onChange={(e) => setSmsAlerts(e.target.checked)} />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="setting-item">
                  <div className="setting-info">
                    <h4>Promotional Offers</h4>
                    <p>Receive exclusive deals and weekend discounts</p>
                  </div>
                  <label className="toggle-switch">
                    <input type="checkbox" checked={promoEmails} onChange={(e) => setPromoEmails(e.target.checked)} />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Profile;
