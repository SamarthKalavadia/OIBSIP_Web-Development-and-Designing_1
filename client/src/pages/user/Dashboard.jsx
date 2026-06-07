import { useState, useEffect } from 'react';
import { getMenuPizzas } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import './Dashboard.css';

const Dashboard = () => {
  const [pizzas, setPizzas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('all'); // all, veg, non-veg
  const [sortBy, setSortBy] = useState('popular'); // popular, price-asc, price-desc
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPizzas = async () => {
      try {
        const { data } = await getMenuPizzas();
        setPizzas(data);
      } catch (err) {
        toast.error('Failed to load menu');
      } finally {
        setLoading(false);
      }
    };
    fetchPizzas();
  }, []);

  // Filter and Sort Logic
  const filteredPizzas = pizzas
    .filter((pizza) => {
      // Category match
      if (category !== 'all' && pizza.category !== category) return false;
      
      // Search match
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          pizza.name.toLowerCase().includes(query) ||
          pizza.description.toLowerCase().includes(query)
        );
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      // Default 'popular' sort - in a real app this would use a 'popularity' score or rating
      return 0; 
    });

  const handleOrderClick = () => {
    navigate('/build-pizza');
  };

  return (
    <div className="menu-page">
      {/* ━━━ HEADER BANNER ━━━ */}
      <div className="menu-header-banner">
        <div className="container">
          <h1 className="animate-fade-in-up">Explore Our Menu</h1>
          <p className="animate-fade-in-up" style={{animationDelay: '0.1s'}}>
            Discover our chef's finest creations or use them as inspiration for your own custom build.
          </p>
        </div>
      </div>

      <div className="container">
        {/* ━━━ CONTROLS ━━━ */}
        <div className="menu-controls animate-fade-in-up" style={{animationDelay: '0.2s'}}>
          <div className="menu-search-bar">
            <span className="menu-search-icon">🔍</span>
            <input 
              type="text" 
              className="menu-search-input" 
              placeholder="Search for your favorite pizza..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="menu-filters-row">
            <div className="menu-categories">
              <button 
                className={`category-chip ${category === 'all' ? 'active' : ''}`}
                onClick={() => setCategory('all')}
              >
                All Pizzas
              </button>
              <button 
                className={`category-chip ${category === 'veg' ? 'active' : ''}`}
                onClick={() => setCategory('veg')}
              >
                Vegetarian
              </button>
              <button 
                className={`category-chip ${category === 'non-veg' ? 'active' : ''}`}
                onClick={() => setCategory('non-veg')}
              >
                Non-Vegetarian
              </button>
            </div>
            
            <div className="menu-sort">
              <label>Sort by:</label>
              <select 
                className="menu-sort-select" 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="popular">Most Popular</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* ━━━ RESULTS ━━━ */}
        <div className="menu-results-count">
          Showing {filteredPizzas.length} pizza{filteredPizzas.length !== 1 ? 's' : ''}
        </div>

        {loading ? (
          <div className="pizzas-grid">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="skeleton" style={{ height: '400px', borderRadius: 'var(--radius-xl)' }}></div>
            ))}
          </div>
        ) : filteredPizzas.length > 0 ? (
          <div className="pizzas-grid">
            {filteredPizzas.map((pizza) => (
              <div className="premium-pizza-card animate-scale-in" key={pizza._id}>
                <div className={`pizza-badge ${pizza.category === 'veg' ? 'veg' : 'non-veg'}`}>
                  <div className="badge-dot"></div>
                  {pizza.category === 'veg' ? 'VEG' : 'NON-VEG'}
                </div>

                <div className="pizza-card-image">
                  <img src={pizza.image} alt={pizza.name} loading="lazy" />
                </div>

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
                    <button className="btn btn-primary btn-sm" onClick={handleOrderClick}>
                      Customize & Order
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="menu-empty animate-fade-in">
            <div className="menu-empty-icon">🍕</div>
            <h3>No pizzas found</h3>
            <p>We couldn't find any pizzas matching your current filters. Try adjusting your search or category.</p>
            <button 
              className="btn btn-secondary mt-4" 
              style={{marginTop: '20px'}}
              onClick={() => { setSearchQuery(''); setCategory('all'); }}
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
