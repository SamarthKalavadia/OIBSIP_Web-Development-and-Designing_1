import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { loginUser, resendVerification } from '../../services/api';
import { toast } from 'react-toastify';
import './Auth.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState(null);
  const [resending, setResending] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUnverifiedEmail(null);
    setLoading(true);
    try {
      const { data } = await loginUser({ email, password });
      login(data.user);
      toast.success('Welcome back! 🍕');
      navigate(data.user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      const errData = err.response?.data;
      if (errData?.needsVerification) {
        // Show resend button for unverified accounts
        setUnverifiedEmail(errData.email || email);
        toast.error('Please verify your email before logging in.');
      } else {
        toast.error(errData?.message || 'Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setResending(true);
    try {
      const { data } = await resendVerification({ email: unverifiedEmail });
      toast.success(data.message || 'Verification email sent!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend email.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <img src="/images/phero.png" alt="PizzaGo" className="auth-logo-img" />
          <p>Sign in to your account</p>
        </div>

        {unverifiedEmail && (
          <div className="auth-message error" style={{ marginBottom: '16px' }}>
            <p style={{ margin: '0 0 10px 0' }}>
              📧 Your email <strong>{unverifiedEmail}</strong> is not verified yet.
            </p>
            <button
              id="resend-verification-btn"
              className="btn btn-secondary"
              style={{ width: '100%', fontSize: '14px', padding: '10px' }}
              onClick={handleResendVerification}
              disabled={resending}
            >
              {resending ? 'Sending...' : '🔁 Resend Verification Email'}
            </button>
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input id="email" type="email" className="form-input" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input id="password" type="password" className="form-input" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="auth-links">
          <Link to="/forgot-password">Forgot Password?</Link>
        </div>
        <div className="auth-divider">or</div>
        <div className="auth-links">
          Don't have an account? <Link to="/register"> Sign Up</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;

