const mongoose = require('mongoose');
const Pizza = require('./models/Pizza');
require('dotenv').config();

const addPizza = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/PizzaGoDB', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('Connected to DB');
    
    const newPizza = new Pizza({
      name: 'Veggie Paradise',
      description: 'A delightful combination of fresh vegetables including sweet corn, bell peppers, onions, tomatoes, and black olives on a golden crust.',
      ingredients: ['Pizza Dough', 'Tomato Sauce', 'Mozzarella Cheese', 'Sweet Corn', 'Bell Peppers', 'Onions', 'Tomatoes', 'Black Olives'],
      price: 379,
      category: 'veg',
      image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?q=80&w=2069&auto=format&fit=crop',
      rating: 4.6,
      available: true
    });
    
    await newPizza.save();
    console.log('Successfully added Veggie Paradise!');
    process.exit(0);
  } catch (error) {
    console.error('Error adding pizza:', error);
    process.exit(1);
  }
};

addPizza();
