const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const { adminAuth, serviceAgentAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');

const ServiceAgent = require('../models/serviceAgentModel');
const ServiceCategory = require('../models/serviceCategoryModel');
const Booking = require('../models/bookingModel');

// @route   GET api/service-agents
// @desc    Get all service agents
// @access  Private (Admin)
router.get('/', adminAuth, async (req, res) => {
  try {
    const serviceAgents = await ServiceAgent.find()
      .populate('serviceCategory', 'categoryName');
    res.json(serviceAgents);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/service-agents/profile
// @desc    Get service agent profile
// @access  Private (Service Agent)
router.get('/profile', serviceAgentAuth, async (req, res) => {
  try {
    const serviceAgent = await ServiceAgent.findById(req.user.id)
      .populate('serviceCategory', 'categoryName');
    res.json(serviceAgent);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/service-agents
// @desc    Create a service agent
// @access  Private (Admin)
router.post('/', [adminAuth, upload.single('image')], [
  check('name', 'Name is required').not().isEmpty(),
  check('userName', 'Username is required').not().isEmpty(),
  check('password', 'Password is required').not().isEmpty(),
  check('serviceCategory', 'Service category is required').not().isEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { name, userName, password, serviceCategory } = req.body;

    // Check if username already exists
    const existingAgent = await ServiceAgent.findOne({ userName });
    if (existingAgent) {
      return res.status(400).json({ msg: 'Username already exists' });
    }

    const newServiceAgent = new ServiceAgent({
      name,
      userName,
      password,
      serviceCategory,
      imagePath: req.file ? `/uploads/service-agents/${req.file.filename}` : null
    });

    const serviceAgent = await newServiceAgent.save();
    await serviceAgent.populate('serviceCategory', 'categoryName');
    res.json(serviceAgent);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/service-agents/:id
// @desc    Delete a service agent
// @access  Private (Admin)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const serviceAgent = await ServiceAgent.findById(req.params.id);
    if (!serviceAgent) {
      return res.status(404).json({ msg: 'Service agent not found' });
    }

    // Check if service agent has any bookings
    const bookingsCount = await Booking.countDocuments({
      serviceProvider: req.params.id
    });

    if (bookingsCount > 0) {
      return res.status(400).json({ msg: 'Cannot delete service agent with existing bookings' });
    }

    await serviceAgent.remove();
    res.json({ msg: 'Service agent removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Service agent not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   GET api/service-agents/stats
// @desc    Get service agent statistics
// @access  Private (Service Agent)
router.get('/stats', serviceAgentAuth, async (req, res) => {
  try {
    const totalServices = await Booking.countDocuments({
      serviceProviderId: req.user.id
    });

    const totalServedServices = await Booking.countDocuments({
      serviceProviderId: req.user.id,
      status: 'Served'
    });

    res.json({
      totalServices,
      totalServedServices
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
