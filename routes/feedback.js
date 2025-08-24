const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const { auth } = require('../middleware/auth');

const Feedback = require('../models/feedbackModel');

// @route   GET api/feedback
// @desc    Get all feedback
// @access  Public
router.get('/', async (req, res) => {
  try {
    const feedbacks = await Feedback.find()
      .populate('userId', 'fullName')
      .sort({ createdAt: -1 });
    res.json(feedbacks);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/feedback
// @desc    Create feedback
// @access  Private
router.post('/', [auth], [
  check('rating', 'Rating is required').isInt({ min: 1, max: 5 }),
  check('comment', 'Comment is required').not().isEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { rating, comment } = req.body;

    const newFeedback = new Feedback({
      userId: req.user.id,
      rating,
      comment
    });

    const feedback = await newFeedback.save();
    await feedback.populate('userId', 'fullName');
    res.json(feedback);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
