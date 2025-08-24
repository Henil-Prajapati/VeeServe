const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const { auth, adminAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');

const Service = require('../models/servicesModel');
const ServiceCategory = require('../models/serviceCategoryModel');
const SubCategory = require('../models/subCategoryModel');

// @route   GET api/services
// @desc    Get all services
// @access  Public
router.get('/', async (req, res) => {
  try {
    const services = await Service.find()
      .populate('type', 'categoryName')
      .populate('subCategory', 'title');
    res.json(services);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/services/category/:categoryId
// @desc    Get services by category
// @access  Public
router.get('/category/:categoryId', async (req, res) => {
  try {
    const services = await Service.find({ type: req.params.categoryId })
      .populate('subCategory', 'title');
    res.json(services);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/services/:id
// @desc    Get service by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const service = await Service.findById(req.params.id)
      .populate('type', 'categoryName')
      .populate('subCategory', 'title');
    
    if (!service) {
      return res.status(404).json({ msg: 'Service not found' });
    }
    
    res.json(service);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Service not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   POST api/services
// @desc    Create a service
// @access  Private (Admin)
router.post('/', [adminAuth, upload.single('image')], [
  check('name', 'Name is required').not().isEmpty(),
  check('price', 'Price is required').isNumeric(),
  check('type', 'Category is required').not().isEmpty(),
  check('description', 'Description is required').not().isEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { name, price, type, subCategory, description } = req.body;
    
    const newService = new Service({
      name,
      price,
      type,
      subCategory,
      description,
      image: req.file ? `/uploads/services/${req.file.filename}` : null
    });

    const service = await newService.save();
    res.json(service);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/services/:id
// @desc    Update a service
// @access  Private (Admin)
router.put('/:id', [adminAuth, upload.single('image')], async (req, res) => {
  try {
    const { name, price, type, subCategory, description } = req.body;
    
    let service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ msg: 'Service not found' });
    }

    // Update fields
    service.name = name || service.name;
    service.price = price || service.price;
    service.type = type || service.type;
    service.subCategory = subCategory || service.subCategory;
    service.description = description || service.description;
    
    if (req.file) {
      service.image = `/uploads/services/${req.file.filename}`;
    }

    await service.save();
    res.json(service);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Service not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/services/:id
// @desc    Delete a service
// @access  Private (Admin)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ msg: 'Service not found' });
    }

    await service.remove();
    res.json({ msg: 'Service removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Service not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   GET api/services/categories
// @desc    Get all service categories
// @access  Public
router.get('/categories/all', async (req, res) => {
  try {
    const categories = await ServiceCategory.find({ isActive: true });
    res.json(categories);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/services/categories
// @desc    Create a service category
// @access  Private (Admin)
router.post('/categories', [adminAuth], [
  check('categoryName', 'Category name is required').not().isEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { categoryName, description } = req.body;
    
    const newCategory = new ServiceCategory({
      categoryName,
      description,
      isActive: true
    });

    const category = await newCategory.save();
    res.json(category);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/services/subcategories/:categoryId
// @desc    Get subcategories by category
// @access  Public
router.get('/subcategories/:categoryId', async (req, res) => {
  try {
    const subcategories = await SubCategory.find({ categoryId: req.params.categoryId });
    res.json(subcategories);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/services/subcategories
// @desc    Create a subcategory
// @access  Private (Admin)
router.post('/subcategories', [adminAuth], [
  check('title', 'Subcategory title is required').not().isEmpty(),
  check('categoryId', 'Category ID is required').not().isEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { title, categoryId } = req.body;
    
    const newSubCategory = new SubCategory({
      title,
      categoryId
    });

    const subcategory = await newSubCategory.save();
    res.json(subcategory);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
