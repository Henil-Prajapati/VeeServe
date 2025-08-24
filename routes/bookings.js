const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const { auth, adminAuth, serviceAgentAuth } = require('../middleware/auth');
const moment = require('moment');

const Booking = require('../models/bookingModel');
const Service = require('../models/servicesModel');
const ServiceAgent = require('../models/serviceAgentModel');
const User = require('../models/userModel');

// @route   GET api/bookings
// @desc    Get all bookings (Admin)
// @access  Private (Admin)
router.get('/', adminAuth, async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('serviceId', 'name')
      .populate('serviceProviderId', 'name')
      .populate('customerId', 'fullName emailAddress contact')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/bookings/user
// @desc    Get user's bookings
// @access  Private
router.get('/user', auth, async (req, res) => {
  try {
    const bookings = await Booking.find({ customerId: req.user.id })
      .populate('serviceId', 'name')
      .populate('serviceProviderId', 'name')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/bookings/service-agent
// @desc    Get service agent's bookings
// @access  Private (Service Agent)
router.get('/service-agent', serviceAgentAuth, async (req, res) => {
  try {
    const bookings = await Booking.find({ serviceProviderId: req.user.id })
      .populate('serviceId', 'name')
      .populate('customerId', 'fullName emailAddress contact')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/bookings/today
// @desc    Get today's bookings for service agent
// @access  Private (Service Agent)
router.get('/today', serviceAgentAuth, async (req, res) => {
  try {
    const today = moment().startOf('day');
    const bookings = await Booking.find({
      serviceProviderId: req.user.id,
      date: {
        $gte: today.toDate(),
        $lt: moment(today).endOf('day').toDate()
      }
    })
    .populate('serviceId', 'name')
    .populate('customerId', 'fullName emailAddress contact')
    .sort({ timeSlot: 1 });
    res.json(bookings);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/bookings
// @desc    Create a booking
// @access  Private
router.post('/', [auth], [
  check('serviceId', 'Service is required').not().isEmpty(),
  check('date', 'Date is required').not().isEmpty(),
  check('timeSlot', 'Time slot is required').not().isEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { serviceId, date, timeSlot } = req.body;

    // Get service details
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ msg: 'Service not found' });
    }

    // Get user details
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Find available service agent
    const serviceAgents = await ServiceAgent.find({ serviceCategory: service.type });
    let assignedServiceAgent = null;

    for (const agent of serviceAgents) {
      const existingBooking = await Booking.findOne({
        serviceProviderId: agent._id,
        date: date,
        timeSlot: timeSlot,
        status: { $in: ['Yet To Serve', 'Serving'] }
      });

      if (!existingBooking) {
        assignedServiceAgent = agent;
        break;
      }
    }

    if (!assignedServiceAgent) {
      return res.status(400).json({ msg: 'No service agents available for the selected time slot' });
    }

    const newBooking = new Booking({
      serviceId,
      serviceCategoryId: service.type,
      serviceProviderId: assignedServiceAgent._id,
      customerId: req.user.id,
      date,
      timeSlot,
      price: service.price,
      customerName: user.fullName,
      customerEmail: user.emailAddress,
      customerPhone: user.contact,
      status: 'Yet To Serve'
    });

    const booking = await newBooking.save();
    
    // Populate the booking with service and agent details
    await booking.populate('serviceId', 'name');
    await booking.populate('serviceProviderId', 'name');
    
    res.json(booking);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/bookings/:id/status
// @desc    Update booking status
// @access  Private (Service Agent)
router.put('/:id/status', serviceAgentAuth, [
  check('status', 'Status is required').isIn(['Yet To Serve', 'Serving', 'Served', 'Cancelled'])
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { status } = req.body;
    
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ msg: 'Booking not found' });
    }

    // Check if service agent owns this booking
    if (booking.serviceProviderId.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Not authorized' });
    }

    booking.status = status;
    await booking.save();

    res.json(booking);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Booking not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/bookings/:id/cancel
// @desc    Cancel booking
// @access  Private
router.put('/:id/cancel', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ msg: 'Booking not found' });
    }

    // Check if user owns this booking
    if (booking.customerId.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Not authorized' });
    }

    booking.status = 'Cancelled';
    booking.serviceProviderId = null;
    await booking.save();

    res.json(booking);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Booking not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   GET api/bookings/stats
// @desc    Get booking statistics (Admin)
// @access  Private (Admin)
router.get('/stats', adminAuth, async (req, res) => {
  try {
    const lastMonth = moment().subtract(1, 'month');
    
    const stats = await Booking.aggregate([
      {
        $match: {
          createdAt: { $gte: lastMonth.toDate() }
        }
      },
      {
        $group: {
          _id: null,
          totalBookings: { $sum: 1 },
          totalRevenue: { $sum: '$price' }
        }
      }
    ]);

    const topServices = await Booking.aggregate([
      {
        $match: {
          createdAt: { $gte: lastMonth.toDate() }
        }
      },
      {
        $group: {
          _id: '$serviceId',
          totalBookings: { $sum: 1 },
          totalRevenue: { $sum: '$price' }
        }
      },
      {
        $sort: { totalBookings: -1 }
      },
      {
        $limit: 5
      }
    ]);

    res.json({
      totalBookings: stats[0]?.totalBookings || 0,
      totalRevenue: stats[0]?.totalRevenue || 0,
      topServices
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
