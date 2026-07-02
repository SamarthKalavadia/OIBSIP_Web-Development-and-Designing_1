import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { verifyEmail } from '../../services/api';
import './Auth.css';

const VerifyEmail = () => {
  const { token } = useParams();
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const verify = async () => {
      try {
        const { data } = await verifyEmail(token);
        setMessage(data.message);
        setStatus('success');
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } catch (err) {
        setMessage(err.response?.data?.message || 'Verification failed');
        setStatus('error');
      }
    };
    verify();
  }, [token, navigate]);

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon">
            {status === 'loading' ? '⏳' : status === 'success' ? '✅' : '❌'}
          </div>
          <h1>{status === 'loading' ? 'Verifying...' : status === 'success' ? 'Email Verified!' : 'Verification Failed'}</h1>
        </div>
        {status !== 'loading' && (
          <>
            <div className={`auth-message ${status}`}>{message}</div>
            {status === 'success' && (
              <p style={{ fontSize: '14px', color: '#888', marginTop: '10px', textAlign: 'center' }}>
                Redirecting to login in 3 seconds...
              </p>
            )}
            <div className="auth-links">
              <Link to="/login">Go to Login</Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;

