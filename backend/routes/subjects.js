const express = require('express');
const router = express.Router();
const Subject = require('../models/Subject');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// @route   GET /api/subjects
// @desc    Get subjects (filter by department)
router.get('/', async (req, res) => {
  try {
    const { department } = req.query;
    let query = {};
    if (department) {
      query.department = department;
    }
    const subjects = await Subject.find(query).sort({ code: 1 });
    res.json(subjects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/subjects
// @desc    Add subject
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const { code, name, department, type } = req.body;
    const subj = await Subject.create({ code, name, department, type });
    res.status(201).json(subj);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/subjects/:id
// @desc    Delete subject
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await Subject.findByIdAndDelete(req.params.id);
    res.json({ message: 'Subject deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
