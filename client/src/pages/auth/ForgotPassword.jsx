import { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../../services/api';
import { toast } from 'react-toastify';
import './Auth.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await forgotPassword({ email });
      setSent(true);
      toast.success('Reset link sent if account exists');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <img src="/images/phero.png" alt="PizzaGo" className="auth-logo-img" />
          <h1>Forgot Password</h1>
          <p>Enter your email to receive a reset link</p>
        </div>
        {sent ? (
          <>
            <div className="auth-message success">
              If an account exists with <strong>{email}</strong>, a password reset link has been sent.
            </div>
            <div className="auth-links"><Link to="/login">Back to Login</Link></div>
          </>
        ) : (
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="forgot-email">Email Address</label>
              <input id="forgot-email" type="email" className="form-input" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
            <div className="auth-links" style={{ marginTop: 16 }}><Link to="/login">Back to Login</Link></div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
