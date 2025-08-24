const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const { auth } = require('../middleware/auth');
const bcrypt = require('bcryptjs');

const User = require('../models/userModel');
const Cities = require('../models/citiesModel');

// @route   GET api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', [auth], [
  check('fullName', 'Name is required').not().isEmpty(),
  check('emailAddress', 'Please include a valid email').isEmail(),
  check('contact', 'Contact number is required').not().isEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { fullName, emailAddress, contact, address } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    user.fullName = fullName;
    user.emailAddress = emailAddress;
    user.contact = contact;
    user.address = address;

    await user.save();

    const userResponse = await User.findById(req.user.id).select('-password');
    res.json(userResponse);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/users/cities
// @desc    Get all cities
// @access  Public
router.get('/cities', async (req, res) => {
  try {
    const cities = await Cities.find().select('cityName');
    res.json(cities);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
