import React, { useState } from 'react';
import './Notifications.css';

const Notifications = () => {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'Low Inventory Alert',
      message: 'Cheese stock is running below the threshold limit (2 kg left).',
      type: 'warning',
      timestamp: '10 mins ago',
      read: false
    },
    {
      id: 2,
      title: 'New Large Order',
      message: 'Order #ORD-8493 includes 15 pizzas. Please verify preparation time.',
      type: 'info',
      timestamp: '1 hour ago',
      read: false
    },
    {
      id: 3,
      title: 'System Update',
      message: 'Admin dashboard maintenance scheduled for tonight at 2:00 AM.',
      type: 'system',
      timestamp: '3 hours ago',
      read: true
    },
    {
      id: 4,
      title: 'Monthly Report Ready',
      message: 'Your sales and inventory report for May is now available to download.',
      type: 'success',
      timestamp: '1 day ago',
      read: true
    }
  ]);

  const markAsRead = (id) => {
    setNotifications(notifications.map(notif => 
      notif.id === id ? { ...notif, read: true } : notif
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(notif => ({ ...notif, read: true })));
  };

  const deleteNotification = (id) => {
    setNotifications(notifications.filter(notif => notif.id !== id));
  };

  const getIcon = (type) => {
    switch (type) {
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      case 'success': return '✅';
      case 'system': return '⚙️';
      default: return '🔔';
    }
  };

  return (
    <div className="notifications-container">
      <div className="notifications-header">
        <h2>Notifications Center</h2>
        <div className="notifications-actions">
          <button className="mark-all-btn" onClick={markAllAsRead}>
            Mark all as read
          </button>
        </div>
      </div>

      <div className="notifications-list">
        {notifications.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">📭</span>
            <p>No new notifications</p>
          </div>
        ) : (
          notifications.map(notif => (
            <div key={notif.id} className={`notification-card ${notif.read ? 'read' : 'unread'} ${notif.type}`}>
              <div className="notif-icon">{getIcon(notif.type)}</div>
              
              <div className="notif-content">
                <div className="notif-title-row">
                  <h4>{notif.title}</h4>
                  <span className="notif-time">{notif.timestamp}</span>
                </div>
                <p>{notif.message}</p>
              </div>

              <div className="notif-actions">
                {!notif.read && (
                  <button 
                    className="action-btn text-btn" 
                    onClick={() => markAsRead(notif.id)}
                    title="Mark as read"
                  >
                    ✓
                  </button>
                )}
                <button 
                  className="action-btn text-btn delete" 
                  onClick={() => deleteNotification(notif.id)}
                  title="Delete"
                >
                  ✕
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Notifications;
