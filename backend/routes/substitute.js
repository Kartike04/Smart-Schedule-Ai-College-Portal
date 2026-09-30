const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Faculty = require('../models/Faculty');
const Absence = require('../models/Absence');
const Timetable = require('../models/Timetable');
const Substitution = require('../models/Substitution');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const {
  getSubstituteRecommendations,
  getFacultyDailyWorkload
} = require('../services/workloadService');
const { sendSubstituteNotificationEmail } = require('../utils/emailService');

// @route   POST /api/substitute/recommend
// @desc    Calculate smart substitute candidates with max 4 lectures workload constraint
router.post('/recommend', protect, adminOnly, async (req, res) => {
  try {
    const { department, date, day, startTime, endTime, subject, originalFacultyId } = req.body;

    const candidates = await getSubstituteRecommendations({
      department,
      date,
      day,
      startTime,
      endTime,
      subject,
      originalFacultyId
    });

    res.json({
      department,
      date,
      day,
      startTime,
      endTime,
      subject,
      totalCandidates: candidates.length,
      candidates
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/substitute/assign
// @desc    Assign substitute faculty, update timetable & send notification email
router.post('/assign', protect, adminOnly, async (req, res) => {
  try {
    const {
      absenceId,
      department,
      date,
      day,
      startTime,
      endTime,
      originalFacultyId,
      originalFacultyName,
      originalFacultyAbbr,
      substituteFacultyId,
      substituteFacultyName,
      substituteFacultyAbbr,
      subject,
      class: className,
      division,
      room,
      matchScore,
      scoreBreakdown
    } = req.body;

    // Sanitize absenceId and originalFacultyId so invalid empty strings do not trigger Mongoose CastError
    let validAbsenceId = (absenceId && mongoose.Types.ObjectId.isValid(absenceId)) ? absenceId : null;
    let validOriginalFacultyId = (originalFacultyId && mongoose.Types.ObjectId.isValid(originalFacultyId)) ? originalFacultyId : null;

    // If originalFacultyId is missing, resolve from database using abbreviation
    if (!validOriginalFacultyId && originalFacultyAbbr) {
      const origFac = await Faculty.findOne({ abbreviation: originalFacultyAbbr });
      if (origFac) {
        validOriginalFacultyId = origFac._id;
      }
    }

    // Verify substitute faculty
    const substituteFaculty = await Faculty.findById(substituteFacultyId);
    if (!substituteFaculty) {
      return res.status(404).json({ message: 'Substitute faculty member not found' });
    }

    // Check if faculty is already assigned as substitute for this time slot
    const busySub = await Substitution.findOne({
      date,
      startTime,
      substituteFacultyId
    });

    if (busySub) {
      return res.status(400).json({
        message: `${substituteFacultyName} is already assigned as a substitute during this time slot!`
      });
    }

    // Auto-create or update Absence record if valid
    if (!validAbsenceId && validOriginalFacultyId) {
      let absence = await Absence.findOne({ facultyId: validOriginalFacultyId, date });
      if (!absence) {
        absence = await Absence.create({
          department,
          facultyId: validOriginalFacultyId,
          facultyName: originalFacultyName,
          facultyAbbr: originalFacultyAbbr,
          date,
          reason: 'Substitute Assigned',
          status: 'Substituted'
        });
      } else {
        absence.status = 'Substituted';
        await absence.save();
      }
      validAbsenceId = absence._id;
    } else if (validAbsenceId) {
      await Absence.findByIdAndUpdate(validAbsenceId, { status: 'Substituted' });
    }

    const sub = await Substitution.create({
      absenceId: validAbsenceId,
      department,
      date,
      day,
      startTime,
      endTime,
      originalFacultyId: validOriginalFacultyId,
      originalFacultyName,
      originalFacultyAbbr,
      substituteFacultyId,
      substituteFacultyName,
      substituteFacultyAbbr,
      subject,
      class: className || 'T.Y. B.Sc. (IT)',
      division: division || 'C',
      room: room || '620',
      matchScore: matchScore || 0,
      scoreBreakdown: scoreBreakdown || {},
      assignedBy: req.user?._id
    });

    // Send email notification to the assigned substitute faculty
    const emailResult = await sendSubstituteNotificationEmail({
      toEmail: substituteFaculty.email,
      facultyName: substituteFaculty.name,
      date,
      day,
      startTime,
      endTime,
      subject,
      department,
      className: className || 'T.Y. B.Sc. (IT)',
      division: division || 'C',
      room: room || '620',
      originalFacultyName
    });

    res.status(201).json({
      message: 'Substitute assigned successfully and notification sent.',
      substitution: sub,
      emailSent: emailResult.success
    });
  } catch (error) {
    console.error('Error in /api/substitute/assign:', error);
    res.status(500).json({ message: error.message || 'Failed to assign substitute' });
  }
});

// @route   GET /api/substitute/workload
// @desc    Get daily workload metrics for all faculty members on a specific date
router.get('/workload', async (req, res) => {
  try {
    const { department, date } = req.query;
    const targetDate = date || new Date().toISOString().split('T')[0];

    const dateObj = new Date(targetDate);
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayName = daysOfWeek[dateObj.getDay()];

    let query = {};
    if (department) query.department = department;

    const facultyList = await Faculty.find(query);
    const workloadReport = [];

    for (const fac of facultyList) {
      const wl = await getFacultyDailyWorkload(targetDate, dayName, fac._id);
      workloadReport.push({
        facultyId: fac._id,
        name: fac.name,
        abbreviation: fac.abbreviation,
        department: fac.department,
        email: fac.email,
        status: fac.status,
        date: targetDate,
        day: dayName,
        ...wl
      });
    }

    res.json({
      date: targetDate,
      day: dayName,
      department: department || 'All',
      workloadReport
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/substitute
// @desc    Get all substitutions
router.get('/', async (req, res) => {
  try {
    const { department, date, facultyId } = req.query;
    let query = {};
    if (department) query.department = department;
    if (date) query.date = date;
    if (facultyId) {
      query.$or = [
        { substituteFacultyId: facultyId },
        { originalFacultyId: facultyId }
      ];
    }

    const list = await Substitution.find(query).sort({ date: -1, createdAt: -1 });
    res.json(list);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
