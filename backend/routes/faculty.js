const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const Faculty = require('../models/Faculty');
const User = require('../models/User');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// @route   GET /api/faculty
// @desc    Get all faculty (optional query params: department, search)
router.get('/', async (req, res) => {
  try {
    const { department, search } = req.query;
    let query = {};
    if (department) {
      query.department = department;
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { abbreviation: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    const list = await Faculty.find(query).sort({ name: 1 });
    res.json(list);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/faculty
// @desc    Add new faculty
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const { name, abbreviation, email, password, employeeId, department, subjects, skills, phone, status } = req.body;

    const existingEmail = await Faculty.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: 'Faculty email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password || 'faculty123', 10);
    const userDoc = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'FACULTY'
    });

    const facultyDoc = await Faculty.create({
      name,
      abbreviation,
      email,
      employeeId,
      department,
      subjects: Array.isArray(subjects) ? subjects : (subjects ? subjects.split(',').map(s => s.trim()) : []),
      skills: Array.isArray(skills) ? skills : (skills ? skills.split(',').map(s => s.trim()) : []),
      phone: phone || '',
      status: status || 'Active',
      userId: userDoc._id
    });

    userDoc.facultyId = facultyDoc._id;
    await userDoc.save();

    res.status(201).json(facultyDoc);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/faculty/:id
// @desc    Update faculty
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const { name, abbreviation, email, employeeId, department, subjects, skills, phone, status } = req.body;
    
    const formattedSubjects = Array.isArray(subjects) ? subjects : (subjects ? subjects.split(',').map(s => s.trim()) : []);
    const formattedSkills = Array.isArray(skills) ? skills : (skills ? skills.split(',').map(s => s.trim()) : []);

    const updated = await Faculty.findByIdAndUpdate(
      req.params.id,
      {
        name,
        abbreviation,
        email,
        employeeId,
        department,
        subjects: formattedSubjects,
        skills: formattedSkills,
        phone,
        status
      },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: 'Faculty not found' });

    // Update corresponding user email & name if changed
    if (updated.userId) {
      await User.findByIdAndUpdate(updated.userId, { name, email });
    }

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/faculty/:id
// @desc    Delete faculty
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const facultyDoc = await Faculty.findById(req.params.id);
    if (!facultyDoc) return res.status(404).json({ message: 'Faculty not found' });

    if (facultyDoc.userId) {
      await User.findByIdAndDelete(facultyDoc.userId);
    }
    await Faculty.findByIdAndDelete(req.params.id);

    res.json({ message: 'Faculty deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
