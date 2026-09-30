const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const Faculty = require('../models/Faculty');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// @route   POST /api/attendance/mark
// @desc    Faculty marks attendance for today
router.post('/mark', protect, async (req, res) => {
  try {
    let facultyId = req.user.facultyId;
    let faculty = null;

    if (req.user.role === 'ADMIN' && req.body.facultyId) {
      facultyId = req.body.facultyId;
    }

    if (!facultyId) {
      return res.status(400).json({ message: 'No associated faculty account found for user' });
    }

    faculty = await Faculty.findById(facultyId);
    if (!faculty) {
      return res.status(404).json({ message: 'Faculty record not found' });
    }

    // Format current date YYYY-MM-DD
    const now = new Date();
    const dateStr = req.body.date || now.toISOString().split('T')[0];
    
    // Format current time e.g. 09:02 AM
    const timeOptions = { hour: '2-digit', minute: '2-digit', hour12: true };
    const timeStr = req.body.time || now.toLocaleTimeString('en-US', timeOptions);

    // Check if attendance already marked for today
    const existing = await Attendance.findOne({ facultyId: faculty._id, date: dateStr });
    if (existing) {
      return res.status(400).json({
        message: `Attendance already marked for today (${dateStr}) at ${existing.time}`,
        attendance: existing
      });
    }

    const attendance = await Attendance.create({
      facultyId: faculty._id,
      facultyName: faculty.name,
      department: faculty.department,
      date: dateStr,
      time: timeStr,
      status: req.body.status || 'Present'
    });

    res.status(201).json({
      message: 'Attendance marked successfully',
      attendance
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Attendance already marked for today' });
    }
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/attendance
// @desc    Get attendance records (filter by department, facultyId, date)
router.get('/', protect, async (req, res) => {
  try {
    const { department, facultyId, date } = req.query;
    let query = {};

    // If faculty role, restrict to their own records unless admin
    if (req.user.role === 'FACULTY') {
      if (req.user.facultyId) {
        query.facultyId = req.user.facultyId;
      }
    } else {
      if (facultyId) query.facultyId = facultyId;
      if (department) query.department = department;
    }

    if (date) query.date = date;

    const records = await Attendance.find(query).sort({ date: -1, createdAt: -1 });
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
