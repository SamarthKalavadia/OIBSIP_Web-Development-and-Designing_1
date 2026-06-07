const express = require('express');
const router = express.Router();
const Inventory = require('../models/Inventory');
const Pizza = require('../models/Pizza');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// @route   GET /api/pizza/menu
// @desc    Get all menu pizzas for the dashboard
router.get('/menu', async (req, res) => {
  try {
    const pizzas = await Pizza.find().sort({ createdAt: -1 });
    res.json(pizzas);
  } catch (error) {
    console.error('Error fetching menu pizzas:', error);
    res.status(500).json({ message: 'Server error.' });
  }
});

// @route   GET /api/pizza/bases
// @desc    Get all pizza bases
router.get('/bases', auth, async (req, res) => {
  try {
    const bases = await Inventory.find({ category: 'base', quantity: { $gt: 0 } });
    res.json(bases);
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// @route   GET /api/pizza/sauces
// @desc    Get all sauces
router.get('/sauces', auth, async (req, res) => {
  try {
    const sauces = await Inventory.find({ category: 'sauce', quantity: { $gt: 0 } });
    res.json(sauces);
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// @route   GET /api/pizza/cheeses
// @desc    Get all cheeses
router.get('/cheeses', auth, async (req, res) => {
  try {
    const cheeses = await Inventory.find({ category: 'cheese', quantity: { $gt: 0 } });
    res.json(cheeses);
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// @route   GET /api/pizza/veggies
// @desc    Get all veggies
router.get('/veggies', auth, async (req, res) => {
  try {
    const veggies = await Inventory.find({ category: 'veggie', quantity: { $gt: 0 } });
    res.json(veggies);
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// @route   GET /api/pizza/meats
// @desc    Get all meats
router.get('/meats', auth, async (req, res) => {
  try {
    const meats = await Inventory.find({ category: 'meat', quantity: { $gt: 0 } });
    res.json(meats);
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// @route   POST /api/pizza
// @desc    Add a new menu pizza
router.post('/', [auth, admin], async (req, res) => {
  try {
    const { name, description, ingredients, price, category, image, available, rating } = req.body;
    const newPizza = new Pizza({ name, description, ingredients, price, category, image, available, rating });
    await newPizza.save();
    res.status(201).json(newPizza);
  } catch (error) {
    console.error('Error adding pizza:', error);
    res.status(500).json({ message: 'Server error.' });
  }
});

// @route   PUT /api/pizza/:id
// @desc    Update a menu pizza
router.put('/:id', [auth, admin], async (req, res) => {
  try {
    const { name, description, ingredients, price, category, image, available, rating } = req.body;
    const pizza = await Pizza.findById(req.params.id);
    if (!pizza) return res.status(404).json({ message: 'Pizza not found' });
    
    if (name !== undefined) pizza.name = name;
    if (description !== undefined) pizza.description = description;
    if (ingredients !== undefined) pizza.ingredients = ingredients;
    if (price !== undefined) pizza.price = price;
    if (category !== undefined) pizza.category = category;
    if (image !== undefined) pizza.image = image;
    if (available !== undefined) pizza.available = available;
    if (rating !== undefined) pizza.rating = rating;

    await pizza.save();
    res.json(pizza);
  } catch (error) {
    console.error('Error updating pizza:', error);
    res.status(500).json({ message: 'Server error.' });
  }
});

// @route   DELETE /api/pizza/:id
// @desc    Delete a menu pizza
router.delete('/:id', [auth, admin], async (req, res) => {
  try {
    const pizza = await Pizza.findByIdAndDelete(req.params.id);
    if (!pizza) return res.status(404).json({ message: 'Pizza not found' });
    res.json({ message: 'Pizza deleted successfully' });
  } catch (error) {
    console.error('Error deleting pizza:', error);
    res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;
