const express = require('express');
const router = express.Router();
const { adminAuth } = require('../middleware/auth');

const ServiceCategory = require('../models/serviceCategoryModel');

// @route   GET api/categories
// @desc    Get all categories
// @access  Public
router.get('/', async (req, res) => {
  try {
    const categories = await ServiceCategory.find({ isActive: true });
    res.json(categories);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
