const mongoose = require('mongoose');

const pizzaSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Pizza name is required'],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  ingredients: {
    type: [String],
    default: [],
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: 0,
  },
  category: {
    type: String,
    trim: true,
    default: 'classic',
  },
  image: {
    type: String,
    default: '🍕',
  },
  rating: {
    type: Number,
    default: 4.5,
    min: 0,
    max: 5,
  },
  available: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Pizza', pizzaSchema);
