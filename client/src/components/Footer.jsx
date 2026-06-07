import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Footer.css';

const Footer = () => {
  const { user } = useAuth();
  const isAuthenticated = Boolean(user);
  const isAdmin = user?.role === 'admin';

  return (
    <footer className="footer">
      <div className="container footer-container">
        <div className="footer-top">
          {/* Brand & Description */}
          <div className="footer-brand-section">
            <Link to={isAuthenticated ? (isAdmin ? '/admin' : '/menu') : '/'} className="footer-logo">
              <img src="/images/phero.png" alt="PizzaGo" className="footer-logo-img" />
            </Link>
            <p className="footer-desc">
              Experience the art of authentic pizza crafting. Fresh, premium ingredients, custom builders, and lightning-fast delivery straight to your doorstep.
            </p>
            <div className="footer-socials">
              <a href="#" className="social-icon" aria-label="Facebook">🌐</a>
              <a href="#" className="social-icon" aria-label="Twitter">🐦</a>
              <a href="#" className="social-icon" aria-label="Instagram">📸</a>
              <a href="#" className="social-icon" aria-label="YouTube">🎥</a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-links-grid">
            <div className="footer-links-column">
              <h3>Our Menu</h3>
              <ul>
                <li><Link to="/">Home</Link></li>
                {isAuthenticated ? (
                  <>
                    {!isAdmin && <li><Link to="/menu">Explore Menu</Link></li>}
                    {!isAdmin && <li><Link to="/build-pizza">Build Pizza</Link></li>}
                  </>
                ) : (
                  <>
                    <li><Link to="/login">Login</Link></li>
                    <li><Link to="/register">Register</Link></li>
                  </>
                )}
              </ul>
            </div>

            <div className="footer-links-column">
              <h3>My Account</h3>
              <ul>
                {isAuthenticated ? (
                  <>
                    <li><Link to="/profile">My Profile</Link></li>
                    <li><Link to="/my-orders">Order History</Link></li>
                  </>
                ) : (
                  <>
                    <li><Link to="/login">Login</Link></li>
                    <li><Link to="/register">Register</Link></li>
                  </>
                )}
              </ul>
            </div>

            <div className="footer-links-column">
              <h3>Contact Info</h3>
              <ul className="footer-contact-info">
                <li>
                  <span className="contact-icon">📞</span>
                  <span>+1 (555) 123-4567</span>
                </li>
                <li>
                  <span className="contact-icon">✉️</span>
                  <span>support@pizzago.com</span>
                </li>
                <li>
                  <span className="contact-icon">📍</span>
                  <span>123 Pizza Street, Tech Park, Bangalore</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-meta-info">
            <span>© {new Date().getFullYear()} PizzaGo. All rights reserved.</span>
            <span className="footer-subtext">Made with ❤️ for pizza lovers everywhere.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
