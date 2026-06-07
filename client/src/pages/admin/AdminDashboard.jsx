import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getAllOrders, getInventory } from '../../services/api';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    deliveredOrders: 0,
    lowStock: 0,
    revenue: 0,
    inventoryValue: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [ordersRes, invRes] = await Promise.all([getAllOrders(), getInventory()]);
        const orders = ordersRes.data;
        const inventory = invRes.data;

        // Statistics Calculations
        const pending = orders.filter(o => o.status !== 'Delivered').length;
        const delivered = orders.filter(o => o.status === 'Delivered').length;
        const low = inventory.filter(i => i.quantity < 20).length;
        const revenue = orders.reduce((sum, o) => sum + o.totalPrice, 0);
        const invValue = inventory.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        setStats({
          totalOrders: orders.length,
          pendingOrders: pending,
          deliveredOrders: delivered,
          lowStock: low,
          revenue,
          inventoryValue: invValue
        });

        // Set recent 5 orders
        const sortedOrders = [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setRecentOrders(sortedOrders.slice(0, 5));

        // Set low stock items
        const lowStock = inventory.filter(i => i.quantity < 20).sort((a, b) => a.quantity - b.quantity);
        setLowStockItems(lowStock.slice(0, 5));

      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="admin-dashboard-loading">
        <div className="loading-spinner">🍕</div>
        <p>Loading Executive Console...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-home">
      {/* ━━━ EXECUTIVE METRIC CARDS ━━━ */}
      <section className="metrics-grid">
        {/* Total Orders */}
        <div className="metric-card" onClick={() => navigate('/admin/orders')}>
          <div className="metric-header">
            <span className="metric-title">Total Orders</span>
            <span className="metric-badge-icon">🛒</span>
          </div>
          <div className="metric-value">{stats.totalOrders}</div>
          <div className="metric-trend trend-up">
            <span className="trend-arrow">↑</span> 12% this week
          </div>
        </div>

        {/* Pending Orders */}
        <div className="metric-card" onClick={() => navigate('/admin/orders')}>
          <div className="metric-header">
            <span className="metric-title">Pending Orders</span>
            <span className="metric-badge-icon warning">⏳</span>
          </div>
          <div className="metric-value text-warn">{stats.pendingOrders}</div>
          <div className="metric-trend trend-down">
            <span className="trend-arrow">↓</span> 5% today
          </div>
        </div>

        {/* Delivered Orders */}
        <div className="metric-card" onClick={() => navigate('/admin/orders')}>
          <div className="metric-header">
            <span className="metric-title">Delivered Orders</span>
            <span className="metric-badge-icon success">🟢</span>
          </div>
          <div className="metric-value text-success">{stats.deliveredOrders}</div>
          <div className="metric-trend trend-up">
            <span className="trend-arrow">↑</span> 18% this month
          </div>
        </div>

        {/* Total Revenue */}
        <div className="metric-card" onClick={() => navigate('/admin/analytics')}>
          <div className="metric-header">
            <span className="metric-title">Total Revenue</span>
            <span className="metric-badge-icon success">💰</span>
          </div>
          <div className="metric-value">₹{stats.revenue.toLocaleString('en-IN')}</div>
          <div className="metric-trend trend-up">
            <span className="trend-arrow">↑</span> 8.2% vs last week
          </div>
        </div>

        {/* Inventory Value */}
        <div className="metric-card" onClick={() => navigate('/admin/inventory')}>
          <div className="metric-header">
            <span className="metric-title">Inventory Value</span>
            <span className="metric-badge-icon info">📦</span>
          </div>
          <div className="metric-value">₹{stats.inventoryValue.toLocaleString('en-IN')}</div>
          <div className="metric-trend text-muted">
            Asset Value in Stock
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className={`metric-card alert-card ${stats.lowStock > 0 ? 'active-alert' : ''}`} onClick={() => navigate('/admin/inventory')}>
          <div className="metric-header">
            <span className="metric-title">Low Stock Items</span>
            <span className={`metric-badge-icon ${stats.lowStock > 0 ? 'danger animate-pulse' : 'success'}`}>⚠️</span>
          </div>
          <div className={`metric-value ${stats.lowStock > 0 ? 'text-danger' : 'text-success'}`}>{stats.lowStock}</div>
          <div className="metric-trend">
            {stats.lowStock > 0 ? `${stats.lowStock} ingredients need refilling` : 'All items well stocked'}
          </div>
        </div>
      </section>

      {/* ━━━ RECENT ORDERS & INVENTORY ALERTS ━━━ */}
      <section className="dashboard-widgets-grid">
        {/* Recent Orders Widget */}
        <div className="widget-card">
          <div className="widget-header">
            <h3 className="widget-title">Live Orders</h3>
            <Link to="/admin/orders" className="widget-action-link">View All Orders ➔</Link>
          </div>
          <div className="widget-content">
            {recentOrders.length === 0 ? (
              <div className="widget-empty">
                <span>🛒</span>
                <p>No orders recorded yet.</p>
              </div>
            ) : (
              <div className="widget-table-wrapper">
                <table className="widget-table">
                  <thead>
                    <tr>
                      <th>Customer</th>
                      <th>Custom Build</th>
                      <th>Total</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map(order => (
                      <tr key={order._id}>
                        <td>
                          <div className="customer-info-cell">
                            <strong>{order.user?.name || 'Guest'}</strong>
                            <span>{order.user?.email || 'N/A'}</span>
                          </div>
                        </td>
                        <td>
                          <div className="build-info-cell">
                            <span>{order.pizza.base} + {order.pizza.sauce}</span>
                          </div>
                        </td>
                        <td className="table-price-cell">₹{order.totalPrice}</td>
                        <td>
                          <span className={`status-dot-badge status-${order.status.toLowerCase().replace(/\s+/g, '-')}`}>
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Stock Alert Warning Widget */}
        <div className="widget-card">
          <div className="widget-header">
            <h3 className="widget-title">Critical Stock Warnings</h3>
            <Link to="/admin/inventory" className="widget-action-link">Refill Stock ➔</Link>
          </div>
          <div className="widget-content">
            {lowStockItems.length === 0 ? (
              <div className="widget-empty success-state">
                <span>✅</span>
                <p>All ingredients are healthy!</p>
              </div>
            ) : (
              <div className="alerts-list">
                {lowStockItems.map(item => (
                  <div key={item._id} className="stock-alert-item">
                    <span className="alert-emoji">{item.image}</span>
                    <div className="alert-details">
                      <strong>{item.name}</strong>
                      <span>Category: {item.category}</span>
                    </div>
                    <div className="alert-quantity-badge">
                      <strong className="text-danger">{item.quantity}</strong>
                      <span>units remaining</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default AdminDashboard;
