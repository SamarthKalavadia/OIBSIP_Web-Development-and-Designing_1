import { useEffect, useState } from 'react';
import { getAllOrders, updateOrderStatus } from '../../services/api';
import { toast } from 'react-toastify';
import './Orders.css';

const statusOptions = ['Order Received', 'In the Kitchen', 'Sent to Delivery', 'Delivered'];
const statusFilters = ['All', ...statusOptions];

const getStatusBadgeClass = (status) => {
  const map = { 
    'Order Received': 'badge-received', 
    'In the Kitchen': 'badge-kitchen', 
    'Sent to Delivery': 'badge-delivery', 
    'Delivered': 'badge-delivered' 
  };
  return map[status] || 'badge-received';
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage] = useState(10);
  const [selectedOrder, setSelectedOrder] = useState(null); // for detail modal

  const fetchOrders = async () => {
    try {
      const { data } = await getAllOrders();
      setOrders(data);
    } catch (err) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      toast.success(`Status updated to "${newStatus}"`);
      fetchOrders();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  // Filter & Search Logic
  const getProcessedOrders = () => {
    let result = [...orders];

    // Filter by status
    if (filter !== 'All') {
      result = result.filter(o => o.status === filter);
    }

    // Search by customer name, email, or order ID
    if (search.trim() !== '') {
      const query = search.toLowerCase();
      result = result.filter(o => 
        (o.user?.name && o.user.name.toLowerCase().includes(query)) ||
        (o.user?.email && o.user.email.toLowerCase().includes(query)) ||
        o._id.toLowerCase().includes(query)
      );
    }

    // Sort by newest first
    result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return result;
  };

  const processedOrders = getProcessedOrders();

  // Pagination Logic
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = processedOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(processedOrders.length / ordersPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  if (loading) {
    return (
      <div className="orders-loading">
        <div className="loading-spinner">🍕</div>
        <p>Loading Live Orders Panel...</p>
      </div>
    );
  }

  return (
    <div className="orders-console">
      {/* ━━━ CONTROLS BAR ━━━ */}
      <section className="orders-action-bar">
        {/* Status Filters */}
        <div className="status-tabs-container">
          {statusFilters.map(s => (
            <button 
              key={s} 
              className={`status-tab-btn ${filter === s ? 'active' : ''}`} 
              onClick={() => { setFilter(s); setCurrentPage(1); }}
            >
              {s === 'All' ? '🌐 All Orders' : s}
              <span className="status-count">
                {s === 'All' ? orders.length : orders.filter(o => o.status === s).length}
              </span>
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="orders-controls-row">
          <div className="orders-search">
            <span className="search-icon">🔍</span>
            <input 
              type="text" 
              placeholder="Search by customer name, email, or Order ID..." 
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            />
          </div>
        </div>
      </section>

      {/* ━━━ LIVE ORDERS TABLE ━━━ */}
      <section className="orders-table-container">
        {processedOrders.length === 0 ? (
          <div className="orders-empty-state">
            <span>🛒</span>
            <h3>No orders found</h3>
            <p>No active orders match your selection.</p>
          </div>
        ) : (
          <>
            <div className="orders-table-wrapper">
              <table className="saas-orders-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer Name</th>
                    <th>Pizza Customization</th>
                    <th>Total Price</th>
                    <th>Payment Status</th>
                    <th>Order Date</th>
                    <th>Status Action</th>
                    <th className="text-right">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {currentOrders.map(order => (
                    <tr key={order._id}>
                      <td>
                        <span className="order-id-badge" title={order._id}>
                          #{order._id.substring(order._id.length - 8)}
                        </span>
                      </td>
                      <td>
                        <div className="order-customer-cell">
                          <strong>{order.user?.name || 'Guest User'}</strong>
                          <span>{order.user?.email || 'N/A'}</span>
                        </div>
                      </td>
                      <td>
                        <div className="order-pizza-cell">
                          <strong>🫓 {order.pizza.base}</strong>
                          <span>🍅 {order.pizza.sauce} | 🧀 {order.pizza.cheese}</span>
                          <span className="order-toppings-sub">
                            🥬 Toppings: {order.pizza.veggies?.join(', ') || 'None'}
                          </span>
                        </div>
                      </td>
                      <td>
                        <strong className="order-price-val">₹{order.totalPrice}</strong>
                      </td>
                      <td>
                        <span className={`payment-status-badge ${order.razorpayPaymentId ? 'paid' : 'cod'}`}>
                          {order.razorpayPaymentId ? 'Paid (Razorpay) 🟢' : 'Unpaid (COD) 🟡'}
                        </span>
                      </td>
                      <td>
                        <div className="order-date-cell">
                          <span>{new Date(order.createdAt).toLocaleDateString('en-IN')}</span>
                          <small>{new Date(order.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</small>
                        </div>
                      </td>
                      <td>
                        <div className="status-select-wrapper">
                          <span className={`status-pill ${getStatusBadgeClass(order.status)}`}>
                            {order.status}
                          </span>
                          <select
                            className="status-dropdown-select"
                            value={order.status}
                            onChange={(e) => handleStatusChange(order._id, e.target.value)}
                          >
                            {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </div>
                      </td>
                      <td className="text-right">
                        <button 
                          className="view-order-details-btn"
                          onClick={() => setSelectedOrder(order)}
                        >
                          👁️ View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="orders-pagination">
                <span className="pagination-info">
                  Showing {indexOfFirstOrder + 1} to {Math.min(indexOfLastOrder, processedOrders.length)} of {processedOrders.length} orders
                </span>
                <div className="pagination-pages">
                  <button 
                    className="page-nav-btn" 
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    ◀ Prev
                  </button>
                  {Array.from({ length: totalPages }, (_, index) => (
                    <button 
                      key={index + 1} 
                      className={`page-num-btn ${currentPage === index + 1 ? 'active' : ''}`}
                      onClick={() => handlePageChange(index + 1)}
                    >
                      {index + 1}
                    </button>
                  ))}
                  <button 
                    className="page-nav-btn" 
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next ▶
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </section>

      {/* ━━━ ORDER DETAILS MODAL ━━━ */}
      {selectedOrder && (
        <div className="order-modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="order-detail-card" onClick={e => e.stopPropagation()}>
            <div className="detail-card-header">
              <h3>Receipt details for #{selectedOrder._id}</h3>
              <button className="detail-close-btn" onClick={() => setSelectedOrder(null)}>✕</button>
            </div>
            
            <div className="detail-card-body">
              <div className="detail-customer-box">
                <h4>Customer Info</h4>
                <p><strong>Name:</strong> {selectedOrder.user?.name || 'Guest'}</p>
                <p><strong>Email:</strong> {selectedOrder.user?.email || 'N/A'}</p>
                <p><strong>Ordered Date:</strong> {new Date(selectedOrder.createdAt).toLocaleString('en-IN')}</p>
              </div>

              <div className="detail-pizza-box">
                <h4>Pizza Customization</h4>
                <ul>
                  <li><strong>Crust:</strong> {selectedOrder.pizza.base}</li>
                  <li><strong>Sauce:</strong> {selectedOrder.pizza.sauce}</li>
                  <li><strong>Cheese:</strong> {selectedOrder.pizza.cheese}</li>
                  <li><strong>Toppings:</strong> {selectedOrder.pizza.veggies?.join(', ') || 'None'}</li>
                </ul>
              </div>

              <div className="detail-summary-box">
                <div className="detail-summary-row">
                  <span>Subtotal:</span>
                  <strong>₹{selectedOrder.totalPrice}</strong>
                </div>
                <div className="detail-summary-row">
                  <span>Payment status:</span>
                  <span className={selectedOrder.razorpayPaymentId ? 'text-success' : 'text-warn'}>
                    {selectedOrder.razorpayPaymentId ? 'Paid' : 'Unpaid (COD)'}
                  </span>
                </div>
                <div className="detail-summary-row">
                  <span>Live order status:</span>
                  <strong className={getStatusBadgeClass(selectedOrder.status)}>
                    {selectedOrder.status}
                  </strong>
                </div>
              </div>
            </div>

            <div className="detail-card-footer">
              <button className="btn btn-secondary" onClick={() => setSelectedOrder(null)}>
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
