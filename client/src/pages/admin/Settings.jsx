import React, { useState } from 'react';
import './Settings.css';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('general');

  const handleSave = (e) => {
    e.preventDefault();
    // Simulate save
    alert('Settings saved successfully!');
  };

  return (
    <div className="settings-container">
      <div className="settings-header">
        <h2>Store Settings</h2>
        <button className="primary-btn" onClick={handleSave}>Save Changes</button>
      </div>

      <div className="settings-content">
        <div className="settings-sidebar">
          <button 
            className={`settings-tab ${activeTab === 'general' ? 'active' : ''}`}
            onClick={() => setActiveTab('general')}
          >
            General Details
          </button>
          <button 
            className={`settings-tab ${activeTab === 'store' ? 'active' : ''}`}
            onClick={() => setActiveTab('store')}
          >
            Store Operations
          </button>
          <button 
            className={`settings-tab ${activeTab === 'notifications' ? 'active' : ''}`}
            onClick={() => setActiveTab('notifications')}
          >
            Notification Preferences
          </button>
          <button 
            className={`settings-tab ${activeTab === 'security' ? 'active' : ''}`}
            onClick={() => setActiveTab('security')}
          >
            Security
          </button>
        </div>

        <div className="settings-panel">
          {activeTab === 'general' && (
            <form className="settings-form">
              <h3>General Information</h3>
              <div className="form-group">
                <label>Store Name</label>
                <input type="text" defaultValue="PizzaGo Downtown" />
              </div>
              <div className="form-group">
                <label>Contact Email</label>
                <input type="email" defaultValue="admin@pizzago.com" />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input type="tel" defaultValue="+1 234 567 890" />
              </div>
              <div className="form-group">
                <label>Store Address</label>
                <textarea defaultValue="123 Pizza Street, Food District, City, Country" rows="3"></textarea>
              </div>
            </form>
          )}

          {activeTab === 'store' && (
            <form className="settings-form">
              <h3>Store Operations</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>Opening Time</label>
                  <input type="time" defaultValue="10:00" />
                </div>
                <div className="form-group">
                  <label>Closing Time</label>
                  <input type="time" defaultValue="23:00" />
                </div>
              </div>
              <div className="form-group toggle-group">
                <label className="toggle-label">
                  Accepting Online Orders
                  <span className="toggle-desc">Temporarily pause new orders if the kitchen is overwhelmed</span>
                </label>
                <label className="switch">
                  <input type="checkbox" defaultChecked />
                  <span className="slider round"></span>
                </label>
              </div>
              <div className="form-group">
                <label>Average Preparation Time (minutes)</label>
                <input type="number" defaultValue="25" />
              </div>
            </form>
          )}

          {activeTab === 'notifications' && (
            <form className="settings-form">
              <h3>Notification Preferences</h3>
              
              <div className="form-group toggle-group">
                <label className="toggle-label">
                  Low Inventory Alerts
                  <span className="toggle-desc">Receive notifications when ingredients fall below threshold</span>
                </label>
                <label className="switch">
                  <input type="checkbox" defaultChecked />
                  <span className="slider round"></span>
                </label>
              </div>

              <div className="form-group toggle-group">
                <label className="toggle-label">
                  New Order Sounds
                  <span className="toggle-desc">Play an audio alert when a new order arrives</span>
                </label>
                <label className="switch">
                  <input type="checkbox" defaultChecked />
                  <span className="slider round"></span>
                </label>
              </div>

              <div className="form-group toggle-group">
                <label className="toggle-label">
                  Daily Summary Emails
                  <span className="toggle-desc">Receive an email summary of daily sales and inventory</span>
                </label>
                <label className="switch">
                  <input type="checkbox" />
                  <span className="slider round"></span>
                </label>
              </div>
            </form>
          )}

          {activeTab === 'security' && (
            <form className="settings-form">
              <h3>Security & Access</h3>
              <div className="form-group">
                <label>Current Password</label>
                <input type="password" placeholder="Enter current password" />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>New Password</label>
                  <input type="password" placeholder="Enter new password" />
                </div>
                <div className="form-group">
                  <label>Confirm Password</label>
                  <input type="password" placeholder="Confirm new password" />
                </div>
              </div>
              <button type="button" className="secondary-btn" style={{marginTop: '10px'}}>Update Password</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
