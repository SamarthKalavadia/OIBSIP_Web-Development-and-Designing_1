const mongoose = require('mongoose');
const Pizza = require('./models/Pizza');
require('dotenv').config();

const addPizza = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error('Database configuration error: MONGO_URI environment variable is missing.');
    }
    await mongoose.connect(mongoUri);
    
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
