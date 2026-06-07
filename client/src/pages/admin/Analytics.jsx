import { useEffect, useState } from 'react';
import { getAllOrders, getInventory } from '../../services/api';
import './Analytics.css';

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [orderCount, setOrderCount] = useState(0);
  const [revenue, setRevenue] = useState(0);
  const [topPizzas, setTopPizzas] = useState([]);
  const [inventoryStats, setInventoryStats] = useState([]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [ordersRes, invRes] = await Promise.all([getAllOrders(), getInventory()]);
        const orders = ordersRes.data;
        const inventory = invRes.data;

        setOrderCount(orders.length);
        setRevenue(orders.reduce((sum, o) => sum + o.totalPrice, 0));

        // Group popular pizzas (mock based on order history or static for seed)
        const pizzaCounts = {
          'Margherita Delight': 34,
          'Farmhouse Special': 28,
          'Paneer Tikka Pizza': 45,
          'Chicken Supreme': 19,
          'Pepperoni Feast': 40
        };
        const sortedPizzas = Object.entries(pizzaCounts)
          .map(([name, sales]) => ({ name, sales }))
          .sort((a, b) => b.sales - a.sales);
        setTopPizzas(sortedPizzas);

        // Group inventory consumption percentage
        const sortedInv = inventory
          .map(item => ({
            name: item.name,
            qty: item.quantity,
            percent: Math.round((item.quantity / 150) * 100),
            category: item.category
          }))
          .sort((a, b) => a.qty - b.qty)
          .slice(0, 5);
        setInventoryStats(sortedInv);

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="analytics-loading">
        <div className="loading-spinner">🍕</div>
        <p>Analyzing Platform Metrics...</p>
      </div>
    );
  }

  // SVG Line Chart coordinates for Orders (Mon-Sun)
  // [Mon: 12, Tue: 25, Wed: 18, Thu: 32, Fri: 45, Sat: 60, Sun: 52]
  const ordersData = [12, 25, 18, 32, 45, 60, 52];
  const maxVal = 70;
  const chartHeight = 160;
  const chartWidth = 500;
  
  const points = ordersData.map((val, idx) => {
    const x = (idx / (ordersData.length - 1)) * chartWidth;
    const y = chartHeight - (val / maxVal) * chartHeight;
    return `${x},${y}`;
  }).join(' ');

  // SVG Bar Chart coordinates for Revenue (Jan-Jun)
  // [Jan: 4.5k, Feb: 6.2k, Mar: 5.8k, Apr: 8.5k, May: 11k, Jun: 14.2k]
  const revenueData = [4500, 6200, 5800, 8500, 11000, 14200];
  const maxRev = 16000;
  const barChartHeight = 160;

  return (
    <div className="analytics-console">
      {/* ━━━ TOP OVERVIEW ━━━ */}
      <section className="analytics-overview-row">
        <div className="overview-card">
          <span>Weekly Growth</span>
          <h3>+24.5%</h3>
          <p>Higher than average partner stores</p>
        </div>
        <div className="overview-card">
          <span>Customer Retention</span>
          <h3>88.2%</h3>
          <p>Strong recurring pizza builders</p>
        </div>
        <div className="overview-card">
          <span>Avg. Basket Value</span>
          <h3>₹382.40</h3>
          <p>Driven by premium toppings selection</p>
        </div>
      </section>

      {/* ━━━ CHARTS GRID ━━━ */}
      <section className="charts-container-grid">
        {/* Orders Overview - Custom SVG Line Chart */}
        <div className="chart-card">
          <h3 className="chart-title">Orders Overview</h3>
          <p className="chart-subtitle">Weekly transaction volume trend</p>
          
          <div className="svg-chart-wrapper">
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} width="100%" height={chartHeight}>
              {/* Grid Lines */}
              <line x1="0" y1="40" x2={chartWidth} y2="40" stroke="#F1F5F9" strokeWidth="1" />
              <line x1="0" y1="80" x2={chartWidth} y2="80" stroke="#F1F5F9" strokeWidth="1" />
              <line x1="0" y1="120" x2={chartWidth} y2="120" stroke="#F1F5F9" strokeWidth="1" />
              
              {/* Gradient fill path */}
              <path 
                d={`M 0,${chartHeight} L ${points} L ${chartWidth},${chartHeight} Z`}
                fill="url(#orders-gradient)"
                opacity="0.15"
              />
              
              {/* Smooth trend line */}
              <polyline 
                fill="none" 
                stroke="var(--brand)" 
                strokeWidth="4" 
                points={points}
              />
              
              {/* Highlight Nodes */}
              {ordersData.map((val, idx) => {
                const x = (idx / (ordersData.length - 1)) * chartWidth;
                const y = chartHeight - (val / maxVal) * chartHeight;
                return (
                  <g key={idx}>
                    <circle cx={x} cy={y} r="5" fill="#ffffff" stroke="var(--brand)" strokeWidth="3" />
                    <text x={x} y={y - 10} fontSize="10" fontWeight="bold" fill="var(--text-primary)" textAnchor="middle">
                      {val}
                    </text>
                  </g>
                );
              })}

              {/* Gradient Definitions */}
              <defs>
                <linearGradient id="orders-gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--brand)" />
                  <stop offset="100%" stopColor="#ffffff" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div className="chart-x-axis">
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
            <span>Sun</span>
          </div>
        </div>

        {/* Revenue Overview - Custom SVG Bar Chart */}
        <div className="chart-card">
          <h3 className="chart-title">Revenue Overview</h3>
          <p className="chart-subtitle">Monthly financial collections trend</p>

          <div className="bar-chart-container">
            {revenueData.map((val, idx) => {
              const barHeight = (val / maxRev) * barChartHeight;
              const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
              return (
                <div className="bar-column" key={idx}>
                  <div className="bar-tooltip">₹{(val / 1000).toFixed(1)}k</div>
                  <div 
                    className="chart-bar" 
                    style={{ height: `${barHeight}px` }}
                  ></div>
                  <span className="bar-label">{months[idx]}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Popular Recipes */}
        <div className="chart-card">
          <h3 className="chart-title">Popular Pizzas</h3>
          <p className="chart-subtitle">Top selling menu selections</p>
          
          <div className="top-pizzas-analytics-list">
            {topPizzas.map((pizza, idx) => (
              <div key={pizza.name} className="analytics-pizza-row">
                <span className="pizza-rank">#{idx + 1}</span>
                <div className="pizza-rank-info">
                  <strong>{pizza.name}</strong>
                  <span>Customizations popular</span>
                </div>
                <div className="pizza-sales-score">
                  <strong>{pizza.sales}</strong>
                  <span>orders</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Inventory Consumption Alerts */}
        <div className="chart-card">
          <h3 className="chart-title">Inventory Consumption</h3>
          <p className="chart-subtitle">Stock levels percentage capacity</p>

          <div className="consumption-list">
            {inventoryStats.map(item => (
              <div key={item.name} className="consumption-row">
                <div className="consumption-labels">
                  <strong>{item.name}</strong>
                  <span className={item.percent < 20 ? 'text-danger' : 'text-muted'}>
                    {item.qty} units left
                  </span>
                </div>
                <div className="consumption-progress-bezel">
                  <div 
                    className={`consumption-progress-fill ${item.percent < 20 ? 'critical' : ''}`}
                    style={{ width: `${item.percent}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Analytics;
