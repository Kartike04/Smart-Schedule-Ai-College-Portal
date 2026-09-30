const express = require('express');
const router = express.Router();
const Absence = require('../models/Absence');
const Faculty = require('../models/Faculty');
const Timetable = require('../models/Timetable');
const { protect } = require('../middleware/authMiddleware');
const { autoAssignSubstitutesForAbsence } = require('../services/workloadService');

// @route   GET /api/absence
// @desc    Get list of absences
router.get('/', async (req, res) => {
  try {
    const { department, date, facultyId } = req.query;
    let query = {};
    if (department) query.department = department;
    if (date) query.date = date;
    if (facultyId) query.facultyId = facultyId;

    const list = await Absence.find(query).populate('facultyId').sort({ createdAt: -1 });
    res.json(list);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/absence
// @desc    Mark faculty absence (advance or current), auto-generate AI substitute allocations & update daily timetable
router.post('/', protect, async (req, res) => {
  try {
    let { department, facultyId, date, reason } = req.body;

    // If logged in as FACULTY and facultyId is not provided or user is FACULTY, default to user's faculty record
    if (req.user.role === 'FACULTY' && req.user.facultyId) {
      facultyId = req.user.facultyId;
    }

    const faculty = await Faculty.findById(facultyId);
    if (!faculty) {
      return res.status(404).json({ message: 'Faculty member not found' });
    }

    // Upsert absence
    let absence = await Absence.findOne({ facultyId: faculty._id, date });
    if (absence) {
      absence.reason = reason || absence.reason;
      absence.department = department || absence.department || faculty.department;
      await absence.save();
    } else {
      absence = await Absence.create({
        department: department || faculty.department,
        facultyId: faculty._id,
        facultyName: faculty.name,
        facultyAbbr: faculty.abbreviation,
        date,
        reason: reason || 'Absent / Advance Leave',
        status: 'Reported'
      });
    }

    // Automatically trigger AI substitute search and timetable update for all affected slots!
    const autoSubstitutions = await autoAssignSubstitutesForAbsence(absence._id, req.user._id);

    // Determine Day of Week for the given Date
    const dateObj = new Date(date);
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayName = daysOfWeek[dateObj.getDay()];

    // Find all affected lectures for this faculty on that day across timetables
    const timetables = await Timetable.find({ department: department || faculty.department });
    const affectedLectures = [];

    for (const tt of timetables) {
      const slots = tt.slots.filter(s => s.day === dayName && !s.isBreak);
      for (const slot of slots) {
        let isMatch = false;
        let details = {
          timetableId: tt._id,
          class: tt.class,
          division: tt.division,
          day: slot.day,
          startTime: slot.startTime,
          endTime: slot.endTime,
          room: slot.room || tt.roomNo,
          subject: slot.subject,
          facultyName: faculty.name,
          facultyAbbr: faculty.abbreviation,
          batch: null,
          substituteAssigned: null
        };

        if (slot.facultyId && slot.facultyId.toString() === faculty._id.toString()) {
          isMatch = true;
        } else if (slot.facultyAbbr && slot.facultyAbbr.toUpperCase() === faculty.abbreviation.toUpperCase()) {
          isMatch = true;
        }

        if (!isMatch && slot.batchDetails && slot.batchDetails.length > 0) {
          for (const batch of slot.batchDetails) {
            if (
              (batch.facultyId && batch.facultyId.toString() === faculty._id.toString()) ||
              (batch.facultyAbbr && batch.facultyAbbr.toUpperCase() === faculty.abbreviation.toUpperCase())
            ) {
              isMatch = true;
              details.subject = batch.subject;
              details.room = batch.lab || details.room;
              details.batch = batch.batch;
              break;
            }
          }
        }

        if (isMatch) {
          // Check if auto-assigned substitute exists
          const sub = autoSubstitutions.find(s => s.startTime === slot.startTime);
          if (sub) {
            details.substituteAssigned = {
              substituteFacultyName: sub.substituteFacultyName,
              substituteFacultyAbbr: sub.substituteFacultyAbbr,
              matchScore: sub.matchScore
            };
          }
          affectedLectures.push(details);
        }
      }
    }

    res.status(201).json({
      message: autoSubstitutions.length > 0
        ? `Absence recorded. AI automatically allocated ${autoSubstitutions.length} substitute(s) and updated the timetable!`
        : 'Absence recorded.',
      absence,
      dayName,
      affectedLecturesCount: affectedLectures.length,
      affectedLectures,
      autoSubstitutions
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/absence/:id
// @desc    Remove absence record
router.delete('/:id', protect, async (req, res) => {
  try {
    await Absence.findByIdAndDelete(req.params.id);
    res.json({ message: 'Absence record removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
