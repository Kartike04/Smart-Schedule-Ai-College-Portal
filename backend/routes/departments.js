const express = require('express');
const router = express.Router();
const Department = require('../models/Department');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// @route   GET /api/departments
// @desc    Get all departments
router.get('/', async (req, res) => {
  try {
    const depts = await Department.find({});
    res.json(depts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/departments
// @desc    Add a new department
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const { code, name, academicYears, classes, divisions, rooms } = req.body;
    const existing = await Department.findOne({ code });
    if (existing) {
      return res.status(400).json({ message: 'Department code already exists' });
    }
    const dept = await Department.create({
      code,
      name,
      academicYears: academicYears || ['2026-27'],
      classes: classes || [],
      divisions: divisions || ['A'],
      rooms: rooms || []
    });
    res.status(201).json(dept);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/departments/:id
// @desc    Update department
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const dept = await Department.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!dept) return res.status(404).json({ message: 'Department not found' });
    res.json(dept);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
