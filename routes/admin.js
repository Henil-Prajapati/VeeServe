const express = require('express');
const router = express.Router();
const { adminAuth } = require('../middleware/auth');
const moment = require('moment');

const User = require('../models/userModel');
const Booking = require('../models/bookingModel');
const Service = require('../models/servicesModel');
const Cities = require('../models/citiesModel');

// @route   GET api/admin/dashboard
// @desc    Get admin dashboard stats
// @access  Private (Admin)
router.get('/dashboard', adminAuth, async (req, res) => {
  try {
    const lastMonth = moment().subtract(1, 'month');
    const currentDate = moment();

    // Get booking statistics
    const bookingStats = await Booking.aggregate([
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

    // Get customer count for last month
    const customerCount = await User.countDocuments({
      userType: '63fa32a9d782b1c67dbfa2c5',
      createdAt: { $gte: lastMonth.toDate(), $lt: currentDate.toDate() }
    });

    // Get city count
    const cityCount = await Cities.countDocuments();

    // Get recent users
    const recentUsers = await User.find({ userType: '63fa32a9d782b1c67dbfa2c5' })
      .sort({ createdAt: -1 })
      .limit(4)
      .select('fullName emailAddress createdAt');

    // Get top services
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
        $limit: 3
      }
    ]);

    // Populate service names for top services
    const topServicesWithNames = await Promise.all(
      topServices.map(async (service) => {
        const serviceData = await Service.findById(service._id).select('name');
        return {
          serviceName: serviceData ? serviceData.name : 'Unknown Service',
          totalBookings: service.totalBookings,
          totalRevenue: service.totalRevenue
        };
      })
    );

    res.json({
      totalBookings: bookingStats[0]?.totalBookings || 0,
      totalRevenue: bookingStats[0]?.totalRevenue || 0,
      customerCount,
      cityCount,
      recentUsers,
      topServices: topServicesWithNames
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/admin/users
// @desc    Get all users (Admin)
// @access  Private (Admin)
router.get('/users', adminAuth, async (req, res) => {
  try {
    const users = await User.find({ userType: '63fa32a9d782b1c67dbfa2c5' })
      .select('-password')
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
