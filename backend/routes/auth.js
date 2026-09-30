const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Faculty = require('../models/Faculty');
const { protect } = require('../middleware/authMiddleware');

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    let facultyData = null;
    if (user.role === 'FACULTY' && user.facultyId) {
      facultyData = await Faculty.findById(user.facultyId);
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'tsdc_smart_schedule_secret_key_2026_998877',
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        facultyId: user.facultyId,
        faculty: facultyData
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user profile
router.get('/me', protect, async (req, res) => {
  try {
    let facultyData = null;
    if (req.user.role === 'FACULTY' && req.user.facultyId) {
      facultyData = await Faculty.findById(req.user.facultyId);
    }
    res.json({
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      facultyId: req.user.facultyId,
      faculty: facultyData
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
