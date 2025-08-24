const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const { adminAuth } = require('../middleware/auth');

const Cities = require('../models/citiesModel');

// @route   GET api/cities
// @desc    Get all cities
// @access  Public
router.get('/', async (req, res) => {
  try {
    const cities = await Cities.find();
    res.json(cities);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/cities
// @desc    Add a city
// @access  Private (Admin)
router.post('/', [adminAuth], [
  check('cityName', 'City name is required').not().isEmpty(),
  check('stateName', 'State name is required').not().isEmpty(),
  check('countryName', 'Country name is required').not().isEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { cityName, stateName, countryName } = req.body;

    const newCity = new Cities({
      cityName,
      stateName,
      countryName
    });

    const city = await newCity.save();
    res.json(city);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/cities/:id
// @desc    Delete a city
// @access  Private (Admin)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const city = await Cities.findById(req.params.id);
    if (!city) {
      return res.status(404).json({ msg: 'City not found' });
    }

    await city.remove();
    res.json({ msg: 'City removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'City not found' });
    }
    res.status(500).send('Server Error');
  }
});

module.exports = router;
