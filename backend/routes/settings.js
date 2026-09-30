const express = require('express');
const router = express.Router();
const Settings = require('../models/Settings');

// @route   GET /api/settings
// @desc    Get college settings (name, code, logo, subtitle)
router.get('/', async (req, res) => {
  try {
    let settings = await Settings.findOne({ key: 'college_info' });
    if (!settings) {
      settings = await Settings.create({
        key: 'college_info',
        collegeName: 'Thakur Shyamnarayan Degree College',
        collegeCode: 'TSDC',
        subtitle: 'Updated Daily Timetable',
        logoUrl: '/logo.png'
      });
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/settings
// @desc    Update college settings (name, code, logo, subtitle)
router.post('/', async (req, res) => {
  try {
    const { collegeName, collegeCode, subtitle, logoUrl, address } = req.body;

    let settings = await Settings.findOneAndUpdate(
      { key: 'college_info' },
      {
        collegeName: collegeName || 'Thakur Shyamnarayan Degree College',
        collegeCode: collegeCode || 'TSDC',
        subtitle: subtitle || 'Updated Daily Timetable',
        address: address || 'Kandivali East, Mumbai',
        logoUrl: logoUrl || '/logo.png'
      },
      { upsert: true, new: true }
    );

    res.json({ message: 'College settings updated successfully in MongoDB!', settings });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
