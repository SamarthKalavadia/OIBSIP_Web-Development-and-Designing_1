const express = require('express');
const cors = require('cors');
const session = require('express-session');
const { MongoStore } = require('connect-mongo');
const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const pizzaRoutes = require('./routes/pizza');
const orderRoutes = require('./routes/order');
const paymentRoutes = require('./routes/payment');
const inventoryRoutes = require('./routes/inventory');
const Pizza = require('./models/Pizza');
const Order = require('./models/Order');
const User = require('./models/User');
const Inventory = require('./models/Inventory');

const app = express();

// Trust proxy for secure cookies behind reverse proxies (like Render)
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// Middleware
const allowedOrigins = [
  'https://pizza-8raef2je6-samarths-projects-d716b84a.vercel.app',
  'http://localhost:5173',
  'http://127.0.0.1:5173'
];
if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

// Normalize all allowed origins by removing trailing slashes
const cleanOrigins = allowedOrigins.map(url => url.replace(/\/$/, ''));

app.use(cors({ 
  origin: (origin, callback) => {
    const incomingOrigin = origin ? origin.replace(/\/$/, '') : '';
    if (!origin || cleanOrigins.includes(incomingOrigin) || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      console.warn(`⚠️ CORS blocked origin: "${origin}". Allowed clean origins:`, cleanOrigins);
      callback(new Error('Not allowed by CORS'));
    }
  }, 
  credentials: true 
}));
app.use(express.json());

// Session config
if (!process.env.MONGO_URI) {
  throw new Error('Database configuration error: MONGO_URI environment variable is missing.');
}

app.use(session({
  secret: process.env.SESSION_SECRET || 'pizzago-secret-key-12345',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    collectionName: 'sessions'
  }),
  cookie: {
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // true if using HTTPS/production
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  }
}));


// Routes
app.use('/api/auth', authRoutes);
app.use('/api/pizza', pizzaRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/inventory', inventoryRoutes);

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 5000;

const start = async () => {
  await connectDB();

  // Ensure core collections exist
  const collections = await mongoose.connection.db.listCollections().toArray();
  const existingCollections = collections.map((col) => col.name);

  if (!existingCollections.includes('users')) await User.createCollection();
  if (!existingCollections.includes('inventory')) await Inventory.createCollection();
  if (!existingCollections.includes('pizzas')) await Pizza.createCollection();
  if (!existingCollections.includes('orders')) await Order.createCollection();

  // Auto-seed on first run
  const adminExists = await User.findOne({ email: 'admin@gmail.com' });
  if (!adminExists) {
    await User.create({ name: 'Admin', email: 'admin@gmail.com', password: 'admin@123', role: 'admin', isVerified: true });
    console.log('Admin seeded: admin@gmail.com / admin@123');
  }

  const invCount = await Inventory.countDocuments();
  if (invCount === 0) {
    const seed = require('./seed/seed');
    // seed already ran via require, but items need manual insert
    const items = [
      { category: 'base', name: 'Thin Crust', quantity: 100, price: 120, image: '🫓' },
      { category: 'base', name: 'Thick Crust', quantity: 100, price: 140, image: '🍞' },
      { category: 'base', name: 'Stuffed Crust', quantity: 100, price: 180, image: '🥐' },
      { category: 'base', name: 'Gluten-Free', quantity: 100, price: 200, image: '🌾' },
      { category: 'base', name: 'Whole Wheat', quantity: 100, price: 150, image: '🌿' },
      { category: 'sauce', name: 'Marinara', quantity: 100, price: 40, image: '🍅' },
      { category: 'sauce', name: 'BBQ', quantity: 100, price: 50, image: '🔥' },
      { category: 'sauce', name: 'Alfredo', quantity: 100, price: 60, image: '🥛' },
      { category: 'sauce', name: 'Pesto', quantity: 100, price: 55, image: '🌿' },
      { category: 'sauce', name: 'Hot Sauce', quantity: 100, price: 45, image: '🌶️' },
      { category: 'cheese', name: 'Mozzarella', quantity: 100, price: 80, image: '🧀' },
      { category: 'cheese', name: 'Cheddar', quantity: 100, price: 90, image: '🧀' },
      { category: 'cheese', name: 'Parmesan', quantity: 100, price: 100, image: '🧀' },
      { category: 'cheese', name: 'Gouda', quantity: 100, price: 110, image: '🧀' },
      { category: 'cheese', name: 'Vegan Cheese', quantity: 100, price: 120, image: '🌱' },
      { category: 'veggie', name: 'Mushrooms', quantity: 100, price: 30, image: '🍄' },
      { category: 'veggie', name: 'Bell Peppers', quantity: 100, price: 25, image: '🫑' },
      { category: 'veggie', name: 'Onions', quantity: 100, price: 20, image: '🧅' },
      { category: 'veggie', name: 'Olives', quantity: 100, price: 35, image: '🫒' },
      { category: 'veggie', name: 'Tomatoes', quantity: 100, price: 25, image: '🍅' },
      { category: 'veggie', name: 'Jalapeños', quantity: 100, price: 30, image: '🌶️' },
      { category: 'veggie', name: 'Spinach', quantity: 100, price: 25, image: '🥬' },
      { category: 'veggie', name: 'Corn', quantity: 100, price: 20, image: '🌽' },
      { category: 'meat', name: 'Pepperoni', quantity: 100, price: 60, image: '🥓' },
      { category: 'meat', name: 'Chicken', quantity: 100, price: 70, image: '🍗' },
      { category: 'meat', name: 'Sausage', quantity: 100, price: 65, image: '🌭' },
      { category: 'meat', name: 'Bacon', quantity: 100, price: 75, image: '🥓' },
    ];
    await Inventory.insertMany(items);
    console.log(`Seeded ${items.length} inventory items.`);
  }

  const pizzaCount = await Pizza.countDocuments();
  if (pizzaCount === 0) {
    const pizzaMenu = [
      { name: 'Margherita Delight', description: 'Classic cheese pizza with rich mozzarella, fresh basil, and tangy tomato sauce on a perfectly baked crust.', ingredients: ['Tomato', 'Mozzarella', 'Basil'], price: 249, category: 'veg', image: '/images/margherita.png', rating: 4.8, available: true },
      { name: 'Farmhouse Special', description: 'Loaded with onions, capsicum, tomatoes, and mushrooms on a rustic hand-tossed crust.', ingredients: ['Onions', 'Capsicum', 'Tomatoes', 'Mushrooms'], price: 349, category: 'veg', image: '/images/farmhouse.png', rating: 4.7, available: true },
      { name: 'Paneer Tikka Pizza', description: 'Indian-style paneer tikka with spicy seasoning, crunchy onions, and creamy mozzarella.', ingredients: ['Paneer', 'Tikka Sauce', 'Onions', 'Mozzarella'], price: 399, category: 'veg', image: '/images/paneer-tikka.png', rating: 4.9, available: true },
      { name: 'Chicken Supreme', description: 'Juicy chicken toppings with premium cheese blend, herbs, and a smoky barbecue drizzle.', ingredients: ['Chicken', 'Cheese Blend', 'Herbs', 'BBQ Sauce'], price: 449, category: 'non-veg', image: '/images/chicken.png', rating: 4.6, available: true },
      { name: 'Pepperoni Feast', description: 'Loaded with premium pepperoni, extra cheese, and a rich marinara base for the meat lover.', ingredients: ['Pepperoni', 'Mozzarella', 'Marinara'], price: 499, category: 'non-veg', image: '/images/pepperoni.png', rating: 4.8, available: true },
    ];
    await Pizza.insertMany(pizzaMenu);
    console.log(`Seeded ${pizzaMenu.length} pizza menu items.`);
  }

  app.listen(PORT, () => {
    console.log(`🍕 Server running on port ${PORT}`);
  });
};

start();
