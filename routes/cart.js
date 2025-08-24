const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');

const Cart = require('../models/cartModel');
const Service = require('../models/servicesModel');

// @route   GET api/cart
// @desc    Get user's cart
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id })
      .populate('items.serviceId');

    if (!cart) {
      cart = new Cart({
        user: req.user.id,
        items: []
      });
      await cart.save();
    }

    res.json(cart);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/cart/add
// @desc    Add item to cart
// @access  Private
router.post('/add', auth, async (req, res) => {
  try {
    const { serviceId } = req.body;

    // Check if service exists
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ msg: 'Service not found' });
    }

    let cart = await Cart.findOne({ user: req.user.id });
    
    if (!cart) {
      cart = new Cart({
        user: req.user.id,
        items: []
      });
    }

    // Check if service already in cart
    const existingItem = cart.items.find(item => 
      item.serviceId.toString() === serviceId
    );

    if (existingItem) {
      return res.status(400).json({ msg: 'Service already in cart' });
    }

    cart.items.push({ serviceId });
    await cart.save();

    await cart.populate('items.serviceId');
    res.json(cart);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/cart/remove/:serviceId
// @desc    Remove item from cart
// @access  Private
router.delete('/remove/:serviceId', auth, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    
    if (!cart) {
      return res.status(404).json({ msg: 'Cart not found' });
    }

    cart.items = cart.items.filter(item => 
      item.serviceId.toString() !== req.params.serviceId
    );

    await cart.save();
    await cart.populate('items.serviceId');
    res.json(cart);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/cart/clear
// @desc    Clear cart
// @access  Private
router.delete('/clear', auth, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    
    if (!cart) {
      return res.status(404).json({ msg: 'Cart not found' });
    }

    cart.items = [];
    await cart.save();
    res.json(cart);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/cart/checkout
// @desc    Checkout cart items
// @access  Private
router.post('/checkout', auth, async (req, res) => {
  try {
    const { bookings } = req.body; // Array of { serviceId, date, timeSlot }

    if (!bookings || bookings.length === 0) {
      return res.status(400).json({ msg: 'No bookings provided' });
    }

    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ msg: 'Cart is empty' });
    }

    // Process each booking
    const createdBookings = [];
    const errors = [];

    for (const bookingData of bookings) {
      try {
        // Check if service is in cart
        const cartItem = cart.items.find(item => 
          item.serviceId.toString() === bookingData.serviceId
        );

        if (!cartItem) {
          errors.push(`Service ${bookingData.serviceId} not in cart`);
          continue;
        }

        // Create booking (this will be handled by the booking route)
        // For now, we'll just remove the item from cart
        cart.items = cart.items.filter(item => 
          item.serviceId.toString() !== bookingData.serviceId
        );
      } catch (err) {
        errors.push(`Error processing booking for service ${bookingData.serviceId}`);
      }
    }

    await cart.save();

    res.json({
      msg: 'Checkout completed',
      createdBookings,
      errors: errors.length > 0 ? errors : null
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
