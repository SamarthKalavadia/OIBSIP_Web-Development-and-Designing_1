import { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { createPaymentOrder, verifyPayment } from '../../services/api';
import { toast } from 'react-toastify';
import './Checkout.css';

const Checkout = () => {
  const { state } = useLocation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [placedOrderDetails, setPlacedOrderDetails] = useState(null);

  if (!state?.pizza) {
    return (
      <div className="page container">
        <div className="empty-checkout animate-fade-in-up">
          <h2 style={{fontSize: '1.5rem', marginBottom: '16px'}}>No pizza selected</h2>
          <p style={{color: 'var(--text-secondary)', marginBottom: '24px'}}>You haven't built a pizza to checkout yet.</p>
          <Link to="/build-pizza" className="btn btn-primary">Go to Pizza Studio</Link>
        </div>
      </div>
    );
  }

  const { pizza, totalPrice } = state;
  const tax = Math.round(totalPrice - (totalPrice / 1.18)); // Reverse calculate tax assuming totalPrice includes it
  const subtotal = totalPrice - tax;
  const deliveryCharge = 40;
  const grandTotal = totalPrice + deliveryCharge;

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (document.getElementById('razorpay-script')) return resolve(true);
      const script = document.createElement('script');
      script.id = 'razorpay-script';
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    setLoading(true);
    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) { 
        toast.error('Razorpay SDK failed to load'); 
        setLoading(false); 
        return; 
      }

      const { data: order } = await createPaymentOrder(grandTotal);

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_SwhiY2DhuazFqu',
        amount: order.amount,
        currency: order.currency,
        name: 'PizzaGo',
        description: 'Premium Custom Pizza Order',
        order_id: order.id,
        handler: async (response) => {
          try {
            const { data } = await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              pizza,
              totalPrice: grandTotal,
            });
            setPlacedOrderDetails(data.order);
            setOrderPlaced(true);
            toast.success('Order placed successfully! 🍕');
          } catch (err) {
            toast.error('Payment verification failed');
          }
        },
        prefill: { name: user?.name, email: user?.email, contact: '9999999999' },
        theme: { color: '#E53935' }, // Using brand red
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', () => toast.error('Payment failed. Please try again.'));
      rzp.open();
    } catch (err) {
      toast.error('Error initiating payment');
    } finally {
      setLoading(false);
    }
  };

  if (orderPlaced) {
    return (
      <div className="checkout-success-wrapper">
        <div className="checkout-success-card">
          <div className="success-icon-wrapper">
            ✓
          </div>
          <h2>Order Confirmed!</h2>
          {placedOrderDetails && (
            <div className="success-order-details" style={{ margin: '20px 0', padding: '15px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', textAlign: 'left', border: '1px solid var(--border)' }}>
              <p style={{ margin: '5px 0', fontSize: '0.95rem' }}><strong>Order ID:</strong> #{placedOrderDetails._id}</p>
              <p style={{ margin: '5px 0', fontSize: '0.95rem' }}><strong>Amount Paid:</strong> ₹{placedOrderDetails.totalPrice}</p>
              <p style={{ margin: '5px 0', fontSize: '0.95rem' }}><strong>Status:</strong> {placedOrderDetails.status}</p>
            </div>
          )}
          <p>Your masterpiece is being prepared by our chefs. It will be hot, fresh, and at your door in under 30 minutes.</p>
          <Link to="/my-orders" className="btn btn-primary btn-lg" style={{width: '100%', marginTop: '10px'}}>
            Track My Order 🚚
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page checkout-page container">
      <div className="checkout-header animate-fade-in-up">
        <h1>🔒 Secure Checkout</h1>
      </div>

      <div className="checkout-layout">
        {/* LEFT COL: INFO */}
        <div className="checkout-info-col animate-fade-in-up" style={{animationDelay: '0.1s'}}>
          <div className="info-card">
            <div className="info-card-header">
              <div className="info-icon">👤</div>
              <h2>Contact Information</h2>
            </div>
            <div className="user-detail-row">
              <span className="detail-label">Name</span>
              <span className="detail-val">{user?.name}</span>
            </div>
            <div className="user-detail-row">
              <span className="detail-label">Email</span>
              <span className="detail-val">{user?.email}</span>
            </div>
            <div className="user-detail-row">
              <span className="detail-label">Phone</span>
              <span className="detail-val">+91 99999 99999</span>
            </div>
          </div>

          <div className="info-card">
            <div className="info-card-header">
              <div className="info-icon">📍</div>
              <h2>Delivery Address</h2>
            </div>
            <div className="delivery-placeholder">
              <strong>Home</strong><br />
              123 Pizza Street, Tech Park Area<br />
              Bangalore, Karnataka 560001
            </div>
            <button className="btn btn-ghost mt-3" style={{padding: '8px 0', color: 'var(--primary)', marginTop: '12px'}}>
              + Add New Address
            </button>
          </div>
        </div>

        {/* RIGHT COL: SUMMARY */}
        <div className="checkout-summary-col animate-fade-in-up" style={{animationDelay: '0.2s'}}>
          <div className="receipt-card">
            <div className="receipt-header">
              <h3>Order Receipt</h3>
            </div>

            <div className="receipt-items">
              <div className="receipt-item">
                <span className="item-name">🫓 {pizza.base}</span>
              </div>
              <div className="receipt-item">
                <span className="item-name">🍅 {pizza.sauce}</span>
              </div>
              <div className="receipt-item">
                <span className="item-name">🧀 {pizza.cheese}</span>
              </div>
              {(pizza.veggies?.length > 0 || pizza.meats?.length > 0) && (
                <div className="receipt-item">
                  <div style={{display: 'flex', flexDirection: 'column', gap: '4px', width: '100%'}}>
                    <span className="item-name">🥬 Toppings</span>
                    <span className="item-desc">
                      {[...(pizza.veggies || []), ...(pizza.meats || [])].join(', ')}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="receipt-totals">
              <div className="total-line">
                <span>Subtotal</span>
                <span>₹{subtotal}</span>
              </div>
              <div className="total-line">
                <span>Taxes (18% GST)</span>
                <span>₹{tax}</span>
              </div>
              <div className="total-line">
                <span>Delivery Charge</span>
                <span>₹{deliveryCharge}</span>
              </div>
              
              <div className="grand-total">
                <span className="label">Total</span>
                <span className="value">₹{grandTotal}</span>
              </div>
            </div>

            <button 
              className="btn btn-primary btn-lg checkout-pay-btn" 
              onClick={handlePayment} 
              disabled={loading}
            >
              {loading ? 'Processing Securely...' : `Pay ₹${grandTotal} with Razorpay`}
            </button>
            <div className="secure-badge">
              🔒 100% Secure Encrypted Payment
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
