import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getBases, getSauces, getCheeses, getVeggies, getMeats } from '../../services/api';
import { toast } from 'react-toastify';
import './BuildPizza.css';

const STEPS = [
  { id: 1, title: 'Choose Base', key: 'base', icon: '🫓', desc: 'Select your crust type' },
  { id: 2, title: 'Select Sauce', key: 'sauce', icon: '🍅', desc: 'Pick a delicious base sauce' },
  { id: 3, title: 'Add Cheese', key: 'cheese', icon: '🧀', desc: 'Choose your cheese blend' },
  { id: 4, title: 'Fresh Toppings', key: 'toppings', icon: '🥬', desc: 'Add veggies and meats' }
];

// Preview layer mappings based on names (Cloudinary URL logic from original)
const cloudinaryBase = 'https://res.cloudinary.com/ddn1qjenm/image/upload/pizzonex/builder';

const getLayerUrl = (type, name) => {
  if (!name) return null;
  
  const formatName = (n) => {
    const lowercase = n.toLowerCase().trim();
    if (lowercase === 'bbq') return 'bbq-sauce';
    if (lowercase === 'hot sauce') return 'buffalo';
    if (lowercase === 'gouda') return 'cheddar';
    if (lowercase === 'vegan cheese') return 'mozzarella';
    return lowercase.replace(/\s+/g, '-');
  };

  const formatted = formatName(name);
  
  const folderMap = {
    base: 'bases',
    sauce: 'sauces',
    cheese: 'cheese',
    veggies: 'veggies',
    meats: 'meat'
  };
  
  const folder = folderMap[type] || type;
  return `${cloudinaryBase}/${folder}/${formatted}.png`;
};

const BuildPizza = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  
  // Data from API
  const [options, setOptions] = useState({
    bases: [], sauces: [], cheeses: [], veggies: [], meats: []
  });

  // User Selections
  const [currentStep, setCurrentStep] = useState(1);
  const [selection, setSelection] = useState({
    base: null, sauce: null, cheese: null, veggies: [], meats: []
  });

  // UI State
  const [toppingFilter, setToppingFilter] = useState('all'); // all, veg, meat

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [basesRes, saucesRes, cheesesRes, veggiesRes, meatsRes] = await Promise.all([
          getBases(), getSauces(), getCheeses(), getVeggies(), getMeats()
        ]);
        setOptions({
          bases: basesRes.data,
          sauces: saucesRes.data,
          cheeses: cheesesRes.data,
          veggies: veggiesRes.data,
          meats: meatsRes.data
        });
        
        // Auto-select first options if available to populate preview
        setSelection({
          base: basesRes.data[0] || null,
          sauce: saucesRes.data[0] || null,
          cheese: cheesesRes.data[0] || null,
          veggies: [],
          meats: []
        });

        // Preload all assets in the background to completely remove customization latency
        const preload = (type, name) => {
          const url = getLayerUrl(type, name);
          if (url) {
            const img = new Image();
            img.src = url;
          }
        };

        basesRes.data.forEach(item => preload('base', item.name));
        saucesRes.data.forEach(item => preload('sauce', item.name));
        cheesesRes.data.forEach(item => preload('cheese', item.name));
        veggiesRes.data.forEach(item => preload('veggies', item.name));
        meatsRes.data.forEach(item => preload('meats', item.name));

      } catch (err) {
        toast.error('Failed to load pizza options');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Handlers
  const handleSingleSelect = (type, item) => {
    setSelection(prev => ({ ...prev, [type]: item }));
  };

  const handleMultiSelect = (type, item) => {
    setSelection(prev => {
      const isSelected = prev[type].some(i => i._id === item._id);
      if (isSelected) {
        return { ...prev, [type]: prev[type].filter(i => i._id !== item._id) };
      } else {
        return { ...prev, [type]: [...prev[type], item] };
      }
    });
  };

  const nextStep = () => {
    if (currentStep < 4) setCurrentStep(prev => prev + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(prev => prev - 1);
  };

  // Calculations
  const calculateTotal = () => {
    let total = 0;
    if (selection.base) total += selection.base.price;
    if (selection.sauce) total += selection.sauce.price;
    if (selection.cheese) total += selection.cheese.price;
    selection.veggies.forEach(v => total += v.price);
    selection.meats.forEach(m => total += m.price);
    return total;
  };

  const subtotal = calculateTotal();
  const tax = subtotal * 0.18; // 18% GST
  const grandTotal = subtotal + tax;

  const handleProceed = () => {
    if (!selection.base || !selection.sauce || !selection.cheese) {
      toast.error('Please select base, sauce, and cheese!');
      return;
    }
    
    // Format for checkout/order API
    const pizzaOrder = {
      base: selection.base.name,
      sauce: selection.sauce.name,
      cheese: selection.cheese.name,
      veggies: [...selection.veggies.map(v => v.name), ...selection.meats.map(m => m.name)],
    };
    
    navigate('/checkout', { state: { pizza: pizzaOrder, totalPrice: Math.round(grandTotal) } });
  };

  if (loading) {
    return (
      <div className="loading-studio">
        <div className="pizza-spinner">🍕</div>
        <h2>Loading Pizza Studio...</h2>
      </div>
    );
  }

  const currentStepData = STEPS.find(s => s.id === currentStep);

  return (
    <div className="builder-page">
      <div className="container builder-layout">
        
        {/* ━━━ LEFT COL: LIVE PREVIEW ━━━ */}
        <div className="builder-preview-col">
          <div className="preview-card">
            <div className="studio-logo">
              <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
              Craft Studio
            </div>
            
            <div className="pizza-canvas-wrapper">
              <div className="pizza-canvas">
                {selection.base && (
                  <img 
                    src={getLayerUrl('base', selection.base.name)} 
                    className="pizza-layer pizza-layer-base" 
                    alt="base" 
                    key="pizza-layer-base" 
                  />
                )}
                {selection.sauce && (
                  <img 
                    src={getLayerUrl('sauce', selection.sauce.name)} 
                    className="pizza-layer pizza-layer-sauce" 
                    alt="sauce" 
                    key="pizza-layer-sauce" 
                  />
                )}
                {selection.cheese && (
                  <img 
                    src={getLayerUrl('cheese', selection.cheese.name)} 
                    className="pizza-layer pizza-layer-cheese" 
                    alt="cheese" 
                    key="pizza-layer-cheese" 
                  />
                )}
                
                {/* Toppings layers */}
                {selection.veggies.map(v => {
                  if (v.name.toLowerCase().trim() === 'corn') return null;
                  return (
                    <img 
                      src={getLayerUrl('veggies', v.name)} 
                      className="pizza-layer pizza-layer-topping" 
                      alt={v.name} 
                      key={`veg-${v._id}`} 
                    />
                  );
                })}
                {selection.meats.map(m => (
                  <img 
                    src={getLayerUrl('meats', m.name)} 
                    className="pizza-layer pizza-layer-topping" 
                    alt={m.name} 
                    key={`meat-${m._id}`} 
                  />
                ))}
              </div>
            </div>
            
            <div className="preview-status">
              Total: ₹{Math.round(grandTotal)}
            </div>
          </div>
        </div>

        {/* ━━━ RIGHT COL: CONTROLS ━━━ */}
        <div className="builder-controls-col">
          
          {/* Stepper */}
          <div className="builder-stepper">
            {STEPS.map(step => (
              <div 
                key={step.id} 
                className={`step-indicator ${currentStep === step.id ? 'active' : ''} ${currentStep > step.id ? 'done' : ''}`}
                onClick={() => setCurrentStep(step.id)}
              >
                {currentStep > step.id ? '✓' : step.id}
              </div>
            ))}
          </div>

          {/* Dynamic Step Content */}
          <div className="step-content-card animate-fade-in-up" key={currentStep}>
            <div className="step-header">
              <h2 className="step-title">{currentStepData.icon} {currentStepData.title}</h2>
              <p className="step-desc">{currentStepData.desc}</p>
            </div>

            {/* Step 1: Base */}
            {currentStep === 1 && (
              <div className="options-grid">
                {options.bases.map(item => (
                  <div 
                    key={item._id} 
                    className={`option-card ${selection.base?._id === item._id ? 'selected' : ''}`}
                    onClick={() => handleSingleSelect('base', item)}
                  >
                    {selection.base?._id === item._id && <div className="checkmark-badge">✓</div>}
                    <div className="option-icon">🫓</div>
                    <div className="option-name">{item.name}</div>
                    <div className="option-price">+₹{item.price}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Step 2: Sauce */}
            {currentStep === 2 && (
              <div className="options-grid">
                {options.sauces.map(item => (
                  <div 
                    key={item._id} 
                    className={`option-card ${selection.sauce?._id === item._id ? 'selected' : ''}`}
                    onClick={() => handleSingleSelect('sauce', item)}
                  >
                    {selection.sauce?._id === item._id && <div className="checkmark-badge">✓</div>}
                    <div className="option-icon">🍅</div>
                    <div className="option-name">{item.name}</div>
                    <div className="option-price">+₹{item.price}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Step 3: Cheese */}
            {currentStep === 3 && (
              <div className="options-grid">
                {options.cheeses.map(item => (
                  <div 
                    key={item._id} 
                    className={`option-card ${selection.cheese?._id === item._id ? 'selected' : ''}`}
                    onClick={() => handleSingleSelect('cheese', item)}
                  >
                    {selection.cheese?._id === item._id && <div className="checkmark-badge">✓</div>}
                    <div className="option-icon">🧀</div>
                    <div className="option-name">{item.name}</div>
                    <div className="option-price">+₹{item.price}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Step 4: Toppings (Multi-select) */}
            {currentStep === 4 && (
              <div>
                <div className="menu-categories" style={{marginBottom: '24px'}}>
                  <button className={`category-chip ${toppingFilter === 'all' ? 'active' : ''}`} onClick={() => setToppingFilter('all')}>All Toppings</button>
                  <button className={`category-chip ${toppingFilter === 'veg' ? 'active' : ''}`} onClick={() => setToppingFilter('veg')}>Veggies</button>
                  <button className={`category-chip ${toppingFilter === 'meat' ? 'active' : ''}`} onClick={() => setToppingFilter('meat')}>Meats</button>
                </div>
                
                <div className="toppings-flow">
                  {(toppingFilter === 'all' || toppingFilter === 'veg') && options.veggies.map(item => {
                    const isSelected = selection.veggies.some(i => i._id === item._id);
                    return (
                      <div 
                        key={item._id} 
                        className={`topping-pill ${isSelected ? 'selected' : ''}`}
                        onClick={() => handleMultiSelect('veggies', item)}
                      >
                        {isSelected && '✓'} 🥬 {item.name} (+₹{item.price})
                      </div>
                    );
                  })}
                  
                  {(toppingFilter === 'all' || toppingFilter === 'meat') && options.meats.map(item => {
                    const isSelected = selection.meats.some(i => i._id === item._id);
                    return (
                      <div 
                        key={item._id} 
                        className={`topping-pill ${isSelected ? 'selected' : ''}`}
                        onClick={() => handleMultiSelect('meats', item)}
                      >
                        {isSelected && '✓'} 🍗 {item.name} (+₹{item.price})
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="nav-buttons">
              <button 
                className="btn btn-secondary" 
                onClick={prevStep}
                disabled={currentStep === 1}
              >
                ← Back
              </button>
              {currentStep < 4 ? (
                <button className="btn btn-primary" onClick={nextStep}>
                  Next Step →
                </button>
              ) : (
                <button className="btn btn-primary" onClick={() => document.getElementById('summary-panel').scrollIntoView({behavior: 'smooth'})}>
                  Review Order ↓
                </button>
              )}
            </div>
          </div>

          {/* Order Summary Panel */}
          <div className="order-summary-panel" id="summary-panel">
            <h3 style={{marginBottom: '20px', fontSize: '1.25rem', fontWeight: '800'}}>🧾 Order Summary</h3>
            
            <div className="summary-rows">
              {selection.base && (
                <div className="summary-row">
                  <div className="summary-label"><strong>🫓 {selection.base.name}</strong><small>Crust</small></div>
                  <div className="summary-value">₹{selection.base.price}</div>
                </div>
              )}
              {selection.sauce && (
                <div className="summary-row">
                  <div className="summary-label"><strong>🍅 {selection.sauce.name}</strong><small>Sauce</small></div>
                  <div className="summary-value">₹{selection.sauce.price}</div>
                </div>
              )}
              {selection.cheese && (
                <div className="summary-row">
                  <div className="summary-label"><strong>🧀 {selection.cheese.name}</strong><small>Cheese</small></div>
                  <div className="summary-value">₹{selection.cheese.price}</div>
                </div>
              )}
              
              {(selection.veggies.length > 0 || selection.meats.length > 0) && (
                <div className="summary-row" style={{alignItems: 'flex-start'}}>
                  <div className="summary-label">
                    <strong>🥬 Toppings</strong>
                    <small>
                      {[...selection.veggies, ...selection.meats].map(t => t.name).join(', ')}
                    </small>
                  </div>
                  <div className="summary-value">
                    ₹{[...selection.veggies, ...selection.meats].reduce((sum, item) => sum + item.price, 0)}
                  </div>
                </div>
              )}

              <div className="summary-row" style={{marginTop: '16px'}}>
                <div className="summary-label"><strong>Subtotal</strong></div>
                <div className="summary-value">₹{subtotal}</div>
              </div>
              <div className="summary-row">
                <div className="summary-label"><strong>Taxes (18% GST)</strong></div>
                <div className="summary-value">₹{Math.round(tax)}</div>
              </div>
              <div className="summary-row total-row">
                <div className="summary-label"><strong>Grand Total</strong></div>
                <div className="summary-value">₹{Math.round(grandTotal)}</div>
              </div>
            </div>

            <button className="btn btn-primary btn-lg" style={{width: '100%'}} onClick={handleProceed}>
              🔒 Proceed to Checkout
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default BuildPizza;
