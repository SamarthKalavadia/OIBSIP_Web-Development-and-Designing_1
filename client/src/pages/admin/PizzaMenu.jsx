import { useEffect, useState } from 'react';
import { getMenuPizzas, addPizza, updatePizza, deletePizza } from '../../services/api';
import { toast } from 'react-toastify';
import './PizzaMenu.css';

const PizzaMenu = () => {
  const [pizzas, setPizzas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'veg', 'non-veg'
  
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: 249,
    category: 'veg',
    image: '/images/margherita.png',
    rating: 4.5,
    available: true
  });

  const fetchPizzas = async () => {
    try {
      const { data } = await getMenuPizzas();
      setPizzas(data);
    } catch (err) {
      toast.error('Failed to load menu pizzas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPizzas(); }, []);

  const handleToggleAvailable = async (pizza) => {
    try {
      const updated = !pizza.available;
      await updatePizza(pizza._id, { available: updated });
      toast.success(`"${pizza.name}" is now ${updated ? 'Available' : 'Unavailable'}`);
      fetchPizzas();
    } catch (err) {
      toast.error('Failed to toggle availability');
    }
  };

  const openAdd = () => {
    setEditItem(null);
    setForm({
      name: '',
      description: '',
      price: 249,
      category: 'veg',
      image: '/images/margherita.png',
      rating: 4.5,
      available: true
    });
    setShowModal(true);
  };

  const openEdit = (pizza) => {
    setEditItem(pizza);
    setForm({
      name: pizza.name,
      description: pizza.description || '',
      price: pizza.price,
      category: pizza.category || 'veg',
      image: pizza.image || '/images/margherita.png',
      rating: pizza.rating || 4.5,
      available: pizza.available !== false
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editItem) {
        await updatePizza(editItem._id, form);
        toast.success('Pizza updated successfully');
      } else {
        await addPizza(form);
        toast.success('Pizza added successfully');
      }
      setShowModal(false);
      fetchPizzas();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving pizza');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this pizza menu item?')) return;
    try {
      await deletePizza(id);
      toast.success('Pizza deleted successfully');
      fetchPizzas();
    } catch (err) {
      toast.error('Error deleting pizza');
    }
  };

  const filteredPizzas = filter === 'all' 
    ? pizzas 
    : pizzas.filter(p => p.category === filter);

  if (loading) {
    return (
      <div className="menu-loading">
        <div className="loading-spinner">🍕</div>
        <p>Loading Menu Catalog...</p>
      </div>
    );
  }

  return (
    <div className="pizza-menu-console">
      {/* ━━━ CONTROLS ━━━ */}
      <section className="menu-controls-bar">
        <div className="menu-category-filters">
          <button className={`filter-tab ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
            🌐 All Recipes ({pizzas.length})
          </button>
          <button className={`filter-tab ${filter === 'veg' ? 'active' : ''}`} onClick={() => setFilter('veg')}>
            🟢 Veg Only ({pizzas.filter(p => p.category === 'veg').length})
          </button>
          <button className={`filter-tab ${filter === 'non-veg' ? 'active' : ''}`} onClick={() => setFilter('non-veg')}>
            🔴 Non-Veg Only ({pizzas.filter(p => p.category === 'non-veg').length})
          </button>
        </div>

        <button className="add-pizza-btn" onClick={openAdd}>
          🍕 Add New Pizza Recipe
        </button>
      </section>

      {/* ━━━ RECIPE GRID ━━━ */}
      {filteredPizzas.length === 0 ? (
        <div className="menu-empty-state">
          <span>🍕</span>
          <h3>No pizzas in this section</h3>
          <p>Click the button above to seed a new pizza recipe.</p>
        </div>
      ) : (
        <section className="menu-recipes-grid">
          {filteredPizzas.map(pizza => (
            <div className={`pizza-card ${!pizza.available ? 'recipe-disabled' : ''}`} key={pizza._id} id={`pizza-${pizza._id}`}>
              {/* Category Badge */}
              <span className={`category-badge ${pizza.category === 'veg' ? 'badge-veg' : 'badge-nonveg'}`}>
                <span className="badge-dot"></span>
                {pizza.category === 'veg' ? 'Veg' : 'Non-Veg'}
              </span>

              {/* Image */}
              <div className="pizza-card-img-wrap">
                <img src={pizza.image} alt={pizza.name} className="pizza-card-img" loading="lazy" />
              </div>

              {/* Info */}
              <div className="pizza-card-body">
                {/* Rating */}
                <div className="pizza-card-rating">
                  <div className="stars-row">
                    {/* Simplified rating stars for admin view to avoid renderStars duplication, or just text */}
                    <span className="star star-full">★</span>
                  </div>
                  <span className="rating-value">{pizza.rating || 4.5}</span>
                </div>

                {/* Name */}
                <h3 className="pizza-card-name">{pizza.name}</h3>

                {/* Description */}
                <p className="pizza-card-desc">{pizza.description}</p>

                {/* Footer: Price + Availability */}
                <div className="pizza-card-footer">
                  <span className="pizza-card-price">₹{pizza.price}</span>
                  <div className="availability-toggle-wrapper">
                    <span className={`availability-tag ${pizza.available !== false ? 'available' : 'unavailable'}`}>
                      <span className="avail-dot"></span>
                      {pizza.available !== false ? 'Available' : 'Unavailable'}
                    </span>
                    <label className="saas-toggle-switch" style={{transform: 'scale(0.8)', marginLeft: '4px'}}>
                      <input 
                        type="checkbox" 
                        checked={pizza.available !== false}
                        onChange={() => handleToggleAvailable(pizza)}
                      />
                      <span className="saas-toggle-slider"></span>
                    </label>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="recipe-card-actions" style={{marginTop: '16px'}}>
                  <button className="recipe-action-btn edit" onClick={() => openEdit(pizza)}>
                    ✏️ Edit details
                  </button>
                  <button className="recipe-action-btn delete" onClick={() => handleDelete(pizza._id)}>
                    🗑️ Delete recipe
                  </button>
                </div>
              </div>
            </div>
          ))}
        </section>
      )}

      {/* ━━━ ADD/EDIT DRAWER MODAL ━━━ */}
      {showModal && (
        <div className="menu-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="menu-drawer" onClick={e => e.stopPropagation()}>
            <div className="menu-drawer-header">
              <h2>{editItem ? 'Edit Recipe Details' : 'Add Custom Recipe'}</h2>
              <button className="menu-drawer-close" onClick={() => setShowModal(false)}>✕</button>
            </div>

            <form onSubmit={handleSubmit} className="menu-drawer-form">
              <div className="menu-form-grid">
                <div className="menu-form-group">
                  <label>Pizza Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Spicy Chicken Alfredo" 
                    value={form.name}
                    onChange={e => setForm({...form, name: e.target.value})}
                    required
                  />
                </div>

                <div className="menu-form-group">
                  <label>Description</label>
                  <textarea 
                    rows="3" 
                    placeholder="Describe the toppings, sauce, and crust details..."
                    value={form.description}
                    onChange={e => setForm({...form, description: e.target.value})}
                    required
                  />
                </div>

                <div className="menu-form-group">
                  <label>Category</label>
                  <select 
                    value={form.category}
                    onChange={e => setForm({...form, category: e.target.value})}
                  >
                    <option value="veg">Vegetarian</option>
                    <option value="non-veg">Non-Vegetarian</option>
                  </select>
                </div>

                <div className="menu-form-group">
                  <label>Price (₹)</label>
                  <input 
                    type="number" 
                    min="0"
                    value={form.price}
                    onChange={e => setForm({...form, price: parseInt(e.target.value) || 0})}
                    required
                  />
                </div>

                <div className="menu-form-group">
                  <label>Image Asset Path</label>
                  <input 
                    type="text" 
                    value={form.image}
                    onChange={e => setForm({...form, image: e.target.value})}
                    required
                  />
                </div>

                <div className="menu-form-group">
                  <label>Rating (0.0 to 5.0)</label>
                  <input 
                    type="number" 
                    step="0.1" 
                    min="0" 
                    max="5"
                    value={form.rating}
                    onChange={e => setForm({...form, rating: parseFloat(e.target.value) || 0.0})}
                    required
                  />
                </div>
              </div>

              <div className="menu-drawer-actions">
                <button type="submit" className="menu-submit-btn">
                  {editItem ? '💾 Save Recipe' : '➕ Add Recipe'}
                </button>
                <button type="button" className="menu-cancel-btn" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PizzaMenu;
