import { useState, useEffect } from 'react';
import { getMyOrders } from '../../services/api';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import './MyOrders.css';

const STATUS_STEPS = [
  { status: 'Order Received', label: 'Order Received', icon: '✅' },
  { status: 'In the Kitchen', label: 'In Kitchen', icon: '👨‍🍳' },
  { status: 'Sent to Delivery', label: 'Out for Delivery', icon: '🚚' },
  { status: 'Delivered', label: 'Delivered', icon: '🏠' }
];

const getStatusClass = (status) => {
  const map = {
    'Order Received': 'received',
    'In the Kitchen': 'kitchen',
    'Sent to Delivery': 'delivery',
    'Delivered': 'delivered'
  };
  return map[status] || 'received';
};

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await getMyOrders();
        setOrders(data);
      } catch (err) {
        toast.error('Failed to load orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
    const interval = setInterval(fetchOrders, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="page container" style={{ display: 'flex', justifyContent: 'center', paddingTop: '120px' }}>
        <div className="skeleton" style={{ width: '100%', height: '300px' }}></div>
      </div>
    );
  }

  return (
    <div className="page orders-page container">
      {orders.length > 0 ? (
        <>
          <div className="orders-header animate-fade-in-up">
            <h1>📦 My Orders <span className="orders-count">{orders.length}</span></h1>
          </div>

          <div className="orders-list">
            {orders.map((order, index) => {
              const currentStepIndex = STATUS_STEPS.findIndex(s => s.status === order.status);
              const progressPercentage = currentStepIndex === -1 ? 0 : (currentStepIndex / (STATUS_STEPS.length - 1)) * 100;

              return (
                <div className="order-card animate-fade-in-up" style={{ animationDelay: `${index * 0.1}s` }} key={order._id}>
                  
                  {/* Header */}
                  <div className="order-card-header">
                    <div className="order-meta">
                      <h3>#{order._id.slice(-8).toUpperCase()}</h3>
                      <p>{new Date(order.createdAt).toLocaleString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric',
                        hour: 'numeric', minute: '2-digit', hour12: true
                      })}</p>
                    </div>
                    <div className="order-amount">
                      <div className="order-amount-value">₹{order.totalPrice}</div>
                      <span className={`badge badge-${getStatusClass(order.status)}`}>
                        {STATUS_STEPS.find(s => s.status === order.status)?.label || order.status}
                      </span>
                    </div>
                  </div>

                  {/* Pizza Details */}
                  <div className="order-pizza-details">
                    <div className="detail-item">
                      <small>Base Crust</small>
                      <span>{order.pizza.base}</span>
                    </div>
                    <div className="detail-item">
                      <small>Sauce</small>
                      <span>{order.pizza.sauce}</span>
                    </div>
                    <div className="detail-item">
                      <small>Cheese Blend</small>
                      <span>{order.pizza.cheese}</span>
                    </div>
                    <div className="detail-item">
                      <small>Toppings</small>
                      <span>
                        {[...(order.pizza.veggies || []), ...(order.pizza.meats || [])].join(', ') || 'None'}
                      </span>
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="status-timeline">
                    <div 
                      className="timeline-progress" 
                      style={{ width: `${progressPercentage}%` }}
                    ></div>
                    
                    {STATUS_STEPS.map((step, idx) => {
                      const isCompleted = idx < currentStepIndex;
                      const isActive = idx === currentStepIndex;

                      return (
                        <div key={step.status} className={`timeline-step ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`}>
                          <div className="step-icon">
                            {isCompleted ? '✓' : step.icon}
                          </div>
                          <div className="step-label">{step.label}</div>
                        </div>
                      );
                    })}
                  </div>

                </div>
              );
            })}
          </div>
        </>
      ) : (
        <div className="empty-orders animate-fade-in-up">
          <div className="empty-orders-illustration">🛵</div>
          <h2>You haven't ordered yet</h2>
          <p>Your order history is empty. Build your first custom masterpiece today and we'll deliver it hot and fresh.</p>
          <Link to="/build-pizza" className="btn btn-primary btn-lg">
            Start Building
          </Link>
        </div>
      )}
    </div>
  );
};

export default MyOrders;
