const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const User = require('../models/User');
const Inventory = require('../models/Inventory');
const Pizza = require('../models/Pizza');
const Order = require('../models/Order');

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

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error('Database configuration error: MONGO_URI environment variable is missing.');
    }
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB for seeding...');
    const adminExists = await User.findOne({ email: 'admin@gmail.com' });
    if (!adminExists) {
      await User.create({ name: 'Admin', email: 'admin@gmail.com', password: 'admin@123', role: 'admin', isVerified: true });
      console.log('Admin created: admin@gmail.com / admin@123');
    }
    const count = await Inventory.countDocuments();
    if (count === 0) {
      await Inventory.insertMany(items);
      console.log(`Seeded ${items.length} inventory items.`);
    }

    // Clean existing pizzas to ensure fresh menu seed
    await Pizza.deleteMany({});
    const pizzaMenu = [
      { name: 'Margherita Delight', description: 'Classic cheese pizza with rich mozzarella, fresh basil, and tangy tomato sauce on a perfectly baked crust.', ingredients: ['Tomato', 'Mozzarella', 'Basil'], price: 249, category: 'veg', image: '/images/margherita.png', rating: 4.8, available: true },
      { name: 'Garden Veggie Supreme', description: 'Vibrant medley of sweet corn, crunchy onions, fresh bell peppers, mushrooms, and olives on a premium cheese blend.', ingredients: ['Corn', 'Onions', 'Bell Peppers', 'Mushrooms', 'Olives'], price: 299, category: 'veg', image: '/images/veggie.png', rating: 4.8, available: true },
      { name: 'Farmhouse Special', description: 'Loaded with onions, capsicum, tomatoes, and mushrooms on a rustic hand-tossed crust.', ingredients: ['Onions', 'Capsicum', 'Tomatoes', 'Mushrooms'], price: 349, category: 'veg', image: '/images/farmhouse.png', rating: 4.7, available: true },
      { name: 'Paneer Tikka Pizza', description: 'Indian-style paneer tikka with spicy seasoning, crunchy onions, and creamy mozzarella.', ingredients: ['Paneer', 'Tikka Sauce', 'Onions', 'Mozzarella'], price: 399, category: 'veg', image: '/images/paneer-tikka.png', rating: 4.9, available: true },
      { name: 'Chicken Supreme', description: 'Juicy chicken toppings with premium cheese blend, herbs, and a smoky barbecue drizzle.', ingredients: ['Chicken', 'Cheese Blend', 'Herbs', 'BBQ Sauce'], price: 449, category: 'non-veg', image: '/images/chicken.png', rating: 4.6, available: true },
      { name: 'Pepperoni Feast', description: 'Loaded with premium pepperoni, extra cheese, and a rich marinara base for the meat lover.', ingredients: ['Pepperoni', 'Mozzarella', 'Marinara'], price: 499, category: 'non-veg', image: '/images/pepperoni.png', rating: 4.8, available: true },
    ];
    await Pizza.insertMany(pizzaMenu);
    console.log(`Seeded ${pizzaMenu.length} pizza menu items.`);

    const sampleUserEmail = 'user@pizzago.com';
    let sampleUser = await User.findOne({ email: sampleUserEmail });
    if (!sampleUser) {
      sampleUser = await User.create({ name: 'Pizza Lover', email: sampleUserEmail, password: 'Pizza123', role: 'user', isVerified: true });
      console.log(`Sample user created: ${sampleUserEmail} / Pizza123`);
    }

    const orderCount = await Order.countDocuments();
    if (orderCount === 0) {
      await Order.create({
        user: sampleUser._id,
        pizza: {
          base: 'Thin Crust',
          sauce: 'Marinara',
          cheese: 'Mozzarella',
          veggies: ['Bell Peppers', 'Olives'],
        },
        totalPrice: 320,
        status: 'Order Placed',
      });
      console.log('Seeded sample order.');
    }

    console.log('Seed complete!');
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

module.exports = seedData;
if (require.main === module) seedData();
