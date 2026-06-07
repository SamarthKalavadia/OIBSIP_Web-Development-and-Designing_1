import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import { getMenuPizzas } from '../services/api';
import './LandingPage.css';

const LandingPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [pizzas, setPizzas] = useState([]);
  const [loading, setLoading] = useState(true);

  // Where "Order Now" or "Explore Menu" buttons should go
  const primaryPath = user ? (user.role === 'admin' ? '/admin' : '/menu') : '/login';

  useEffect(() => {
    const fetchPizzas = async () => {
      try {
        const { data } = await getMenuPizzas();
        // Show only top 6 pizzas on homepage
        setPizzas(data.slice(0, 6));
      } catch (err) {
        console.error('Failed to fetch pizzas:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPizzas();
  }, []);

  const handleOrderClick = () => {
    if (user) {
      navigate('/build-pizza');
    } else {
      navigate('/login');
    }
  };

  return (
    <main className="landing-page">
      {/* ━━━ SECTION 1: HERO ━━━ */}
      <section className="hero-section">
        {/* Background decoration layers — z-index 0, never touch content */}
        <div className="hero-glow"></div>
        <div className="hero-bottom-fade"></div>
        <div className="container hero-grid">
          <div className="hero-content">
            <div className="hero-badge animate-fade-in">
              <span>★</span> Premium Quality Pizza
            </div>
            <h1 className="hero-title animate-fade-in-up">
              Freshly Crafted.<br />
              <span>Delivered Fast.</span>
            </h1>
            <p className="hero-subtitle animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              Build your perfect pizza from scratch or choose from our chef-curated favorites. Made with 100% real mozzarella and hand-tossed dough.
            </p>
            <div className="hero-actions animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <button className="btn btn-primary btn-lg" onClick={handleOrderClick}>
                🍕 Order Now
              </button>
              <Link to={primaryPath} className="btn btn-outline btn-lg">
                Explore Menu
              </Link>
            </div>
            
            <div className="hero-trust-row animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <div className="trust-item">
                <span>⭐</span> <strong>4.8</strong> Customer Rating
              </div>
              <div className="trust-item">
                <span>🚀</span> <strong>30-Min</strong> Delivery
              </div>
              <div className="trust-item">
                <span>🔥</span> <strong>Freshly</strong> Baked Daily
              </div>
            </div>
          </div>
          
          <div className="hero-image-wrapper animate-scale-in">
            <img 
              src="/images/hero-pizza.png" 
              alt="Delicious hot pizza" 
              className="hero-pizza-img"
              loading="lazy"
            />
          </div>
        </div>
      </section>

      {/* ━━━ SECTION 2: FEATURES ━━━ */}
      <section className="features-section">
        <div className="container">
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🍅</div>
              <h3 className="feature-title">Fresh Ingredients</h3>
              <p className="feature-desc">Locally sourced vegetables and premium meats for the best taste.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🚀</div>
              <h3 className="feature-title">Fast Delivery</h3>
              <p className="feature-desc">Hot and fresh to your door in under 30 minutes, guaranteed.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🛠</div>
              <h3 className="feature-title">Custom Builder</h3>
              <p className="feature-desc">Design your exact masterpiece with our interactive pizza studio.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⭐</div>
              <h3 className="feature-title">Top Rated Recipes</h3>
              <p className="feature-desc">Chef-curated classic and premium combinations you'll love.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ━━━ SECTION 3: MENU SHOWCASE ━━━ */}
      <section className="menu-section">
        <div className="container">
          <div className="section-header">
            <span className="section-label">Our Menu</span>
            <h2>Customer Favourites</h2>
            <p>Our most loved pizzas, crafted with passion and ordered again and again.</p>
          </div>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
              <div className="skeleton" style={{ width: '100%', height: '400px' }}></div>
            </div>
          ) : (
            <div className="pizzas-grid">
              {pizzas.map((pizza) => (
                <div className="premium-pizza-card" key={pizza._id}>
                  {/* Badge */}
                  <div className={`pizza-badge ${pizza.category === 'veg' ? 'veg' : 'non-veg'}`}>
                    <div className="badge-dot"></div>
                    {pizza.category === 'veg' ? 'VEG' : 'NON-VEG'}
                  </div>

                  {/* Image */}
                  <div className="pizza-card-image">
                    <img src={pizza.image} alt={pizza.name} loading="lazy" />
                  </div>

                  {/* Content */}
                  <div className="pizza-card-content">
                    <div className="pizza-meta">
                      <div className="pizza-rating">
                        <span className="star-icon">★</span>
                        <span>{pizza.rating || '4.8'}</span>
                      </div>
                      <span className="pizza-prep">20-25 min</span>
                    </div>
                    
                    <h3 className="pizza-card-title">{pizza.name}</h3>
                    <p className="pizza-card-desc">{pizza.description}</p>
                    
                    <div className="pizza-card-footer">
                      <span className="pizza-price">₹{pizza.price}</span>
                      <button className="btn btn-primary" onClick={handleOrderClick}>
                        Order Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div style={{ textAlign: 'center', marginTop: '64px' }}>
            <Link to={primaryPath} className="btn btn-secondary btn-lg">
              View Full Menu →
            </Link>
          </div>
        </div>
      </section>

      {/* ━━━ SECTION 4: CTA BANNER ━━━ */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-banner">
            <h2>Ready to build your masterpiece?</h2>
            <p>Step into the PizzaGo Craft Studio and design your perfect pizza from crust to toppings. Your imagination is the only limit.</p>
            <button className="btn btn-primary btn-lg" onClick={handleOrderClick} style={{ background: 'var(--white)', color: 'var(--primary)' }}>
              Start Building Now
            </button>
          </div>
        </div>
      </section>
    </main>
  );
};

export default LandingPage;
