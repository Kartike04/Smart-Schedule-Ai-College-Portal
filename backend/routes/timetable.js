const express = require('express');
const router = express.Router();
const Timetable = require('../models/Timetable');
const DailyTimetable = require('../models/DailyTimetable');
const Substitution = require('../models/Substitution');
const Absence = require('../models/Absence');
const Faculty = require('../models/Faculty');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { getFacultyDailyWorkload } = require('../services/workloadService');

// @route   GET /api/timetable
// @desc    Get original timetable or daily updated timetable with substitutions/daily excel overrides
router.get('/', async (req, res) => {
  try {
    const { department, academicYear, class: className, division, date } = req.query;

    let query = {};
    if (department) query.department = department;
    if (academicYear) query.academicYear = academicYear;
    if (className) query.class = className;
    if (division) query.division = division;

    let masterTimetable = await Timetable.findOne(query);
    if (!masterTimetable && department) {
      // Fallback to any master timetable for this department
      masterTimetable = await Timetable.findOne({ department });
    }

    if (!masterTimetable) {
      return res.status(404).json({ message: 'No timetable has been uploaded for this department.' });
    }

    let result = masterTimetable.toObject();

    // If date is provided, check if a DailyTimetable was explicitly uploaded for this date
    if (date) {
      const dateObj = new Date(date);
      const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const dayName = daysOfWeek[dateObj.getDay()];

      let dailyUpload = await DailyTimetable.findOne({
        department: masterTimetable.department,
        class: masterTimetable.class,
        date
      });

      // Filter to ensure dailyUpload has actual valid populated slots
      const validDailySlots = dailyUpload && dailyUpload.slots ? dailyUpload.slots.filter(s => s.subject || s.breakTitle || (s.batchDetails && s.batchDetails.length > 0)) : [];

      if (validDailySlots.length > 0) {
        result.slots = dailyUpload.slots;
        result.isDailyExcelUploaded = true;
      }

      const substitutions = await Substitution.find({
        department: masterTimetable.department,
        date
      });

      const absences = await Absence.find({
        department: masterTimetable.department,
        date
      });

      // Calculate workload overview for department faculty on this date
      const deptFaculty = await Faculty.find({ department: masterTimetable.department });
      const workloadSummary = [];
      for (const fac of deptFaculty) {
        const wl = await getFacultyDailyWorkload(date, dayName, fac._id);
        workloadSummary.push({
          facultyId: fac._id,
          name: fac.name,
          abbreviation: fac.abbreviation,
          ...wl
        });
      }

      result.selectedDate = date;
      result.selectedDay = dayName;
      result.substitutions = substitutions;
      result.absences = absences;
      result.workloadSummary = workloadSummary;
      result.isUpdatedTimetable = substitutions.length > 0 || absences.length > 0 || !!result.isDailyExcelUploaded;
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/timetable
// @desc    Create or update full timetable
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const { department, academicYear, class: className, division, roomNo, effectiveFrom, classInCharge, slots } = req.body;

    let timetable = await Timetable.findOne({
      department,
      academicYear,
      class: className,
      division
    });

    if (timetable) {
      timetable.roomNo = roomNo || timetable.roomNo;
      timetable.effectiveFrom = effectiveFrom || timetable.effectiveFrom;
      timetable.classInCharge = classInCharge || timetable.classInCharge;
      if (slots) timetable.slots = slots;
      await timetable.save();
    } else {
      timetable = await Timetable.create({
        department,
        academicYear: academicYear || '2026-27',
        class: className || 'T.Y. B.Sc. (IT)',
        division: division || 'C',
        roomNo: roomNo || '620',
        effectiveFrom: effectiveFrom || '01/07/2026',
        classInCharge: classInCharge || 'Mr. Jasar Shaikh',
        slots: slots || []
      });
    }

    res.status(200).json(timetable);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/timetable/:id
// @desc    Update specific timetable by ID
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const updated = await Timetable.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: 'Timetable not found' });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
