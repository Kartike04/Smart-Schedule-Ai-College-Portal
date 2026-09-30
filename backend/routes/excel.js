const express = require('express');
const router = express.Router();
const multer = require('multer');
const XLSX = require('xlsx');
const Timetable = require('../models/Timetable');
const DailyTimetable = require('../models/DailyTimetable');
const Department = require('../models/Department');
const Faculty = require('../models/Faculty');
const Subject = require('../models/Subject');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const upload = multer({ storage: multer.memoryStorage() });

// Helper to normalize day names
const normalizeDay = (dayStr) => {
  if (!dayStr) return '';
  const str = dayStr.toString().trim();
  const lower = str.toLowerCase();
  if (lower.startsWith('mon')) return 'Monday';
  if (lower.startsWith('tue')) return 'Tuesday';
  if (lower.startsWith('wed')) return 'Wednesday';
  if (lower.startsWith('thu')) return 'Thursday';
  if (lower.startsWith('fri')) return 'Friday';
  if (lower.startsWith('sat')) return 'Saturday';
  if (lower.startsWith('sun')) return 'Sunday';
  return '';
};

// Flexible case-insensitive field value getter from row object
const getFieldValue = (row, fieldKeys) => {
  if (!row) return '';
  const keys = Object.keys(row);
  for (const fieldKey of fieldKeys) {
    if (row[fieldKey] !== undefined && row[fieldKey] !== null && String(row[fieldKey]).trim() !== '') {
      return String(row[fieldKey]).trim();
    }
    const normFieldKey = fieldKey.toLowerCase().replace(/[^a-z0-9]/g, '');
    const foundKey = keys.find(k => k.toLowerCase().replace(/[^a-z0-9]/g, '') === normFieldKey);
    if (foundKey && row[foundKey] !== undefined && row[foundKey] !== null && String(row[foundKey]).trim() !== '') {
      return String(row[foundKey]).trim();
    }
  }
  return '';
};

// Helper to format single time into 12-hour format "hh:mm AM/PM"
const formatSingleTime = (tStr) => {
  if (!tStr) return null;
  tStr = tStr.toString().trim();
  const match = tStr.match(/(\d{1,2})(?::(\d{2}))?\s*(AM|PM|am|pm)?/i);
  if (!match) return tStr;
  let [_, h, m = '00', p] = match;
  let hrs = parseInt(h, 10);
  if (p) {
    p = p.toUpperCase();
    if (p === 'PM' && hrs < 12) hrs += 12;
    if (p === 'AM' && hrs === 12) hrs = 0;
  } else {
    if (hrs >= 1 && hrs <= 7) hrs += 12;
  }
  let ampm = hrs >= 12 ? 'PM' : 'AM';
  hrs = hrs % 12;
  if (hrs === 0) hrs = 12;
  const hStr = hrs < 10 ? `0${hrs}` : `${hrs}`;
  const mStr = m.padStart(2, '0');
  return `${hStr}:${mStr} ${ampm}`;
};

// Helper to parse time range string into { startTime, endTime }
const parseTimeRange = (timeStr, endStr, defaultStart = '08:00 AM', defaultEnd = '09:00 AM') => {
  let s = timeStr ? timeStr.toString().trim() : '';
  let e = endStr ? endStr.toString().trim() : '';

  if (s) {
    const splitParts = s.split(/[-–—|to]/i);
    if (splitParts.length >= 2) {
      const rawStart = splitParts[0].trim();
      const rawEnd = splitParts[1].trim();
      return {
        startTime: formatSingleTime(rawStart) || defaultStart,
        endTime: formatSingleTime(rawEnd) || defaultEnd
      };
    }
  }

  const startTime = formatSingleTime(s) || defaultStart;
  let endTime = formatSingleTime(e);
  if (!endTime) {
    const match = startTime.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (match) {
      let hrs = parseInt(match[1], 10);
      const min = match[2];
      const ampm = match[3];
      if (ampm === 'PM' && hrs < 12) hrs += 12;
      if (ampm === 'AM' && hrs === 12) hrs = 0;
      hrs = (hrs + 1) % 24;
      let newAmPm = hrs >= 12 ? 'PM' : 'AM';
      hrs = hrs % 12;
      if (hrs === 0) hrs = 12;
      endTime = `${hrs < 10 ? `0${hrs}` : hrs}:${min} ${newAmPm}`;
    } else {
      endTime = defaultEnd;
    }
  }

  return { startTime, endTime };
};

// Helper to parse cell text into subject, faculty, batch
const parseCellText = (cellText) => {
  if (!cellText || cellText.toString().trim() === '' || cellText.toString().trim() === '-' || cellText.toString().trim() === '—') {
    return { isEmpty: true };
  }

  const str = cellText.toString().trim();
  const lower = str.toLowerCase();

  if (lower.includes('break') || lower.includes('lunch') || lower.includes('recess')) {
    return { isBreak: true, breakTitle: str.toUpperCase() };
  }

  if (lower.includes('batch') || lower.includes('lab') || (str.includes(':') && (str.includes('X') || str.includes('Y') || str.includes('A') || str.includes('B')))) {
    const batchParts = str.split(/[,;\/\n]/);
    const batchDetails = [];
    batchParts.forEach(part => {
      const p = part.trim();
      if (!p) return;
      const match = p.match(/(?:Batch\s*)?([A-Za-z0-9]+)\s*[:\-]?\s*([^(]+)(?:\(([^)]+)\))?/i);
      if (match) {
        const bName = match[1].trim();
        const bSubj = match[2].trim();
        const bFac = match[3] ? match[3].trim() : '';
        batchDetails.push({
          batch: bName,
          subject: bSubj,
          facultyAbbr: bFac.length <= 5 ? bFac.toUpperCase() : '',
          facultyName: bFac.length > 5 ? bFac : ''
        });
      }
    });

    if (batchDetails.length > 0) {
      return { slotType: 'Practical', batchDetails };
    }
  }

  let subject = str;
  let facultyAbbr = '';
  let facultyName = '';

  const parenMatch = str.match(/^([^(]+)\s*\(([^)]+)\)/);
  if (parenMatch) {
    subject = parenMatch[1].trim();
    const insideParen = parenMatch[2].trim();
    if (insideParen.length <= 5) {
      facultyAbbr = insideParen.toUpperCase();
    } else {
      facultyName = insideParen;
    }
  } else if (str.includes('-')) {
    const dashParts = str.split('-');
    subject = dashParts[0].trim();
    facultyName = dashParts[1].trim();
    if (facultyName.length <= 5) {
      facultyAbbr = facultyName.toUpperCase();
    }
  }

  return {
    slotType: 'Lecture',
    subject,
    facultyName,
    facultyAbbr
  };
};

// @route   POST /api/excel/upload-timetable
// @desc    Upload & Parse Excel Timetable file (.xlsx / .xls) for Master or Daily Timetable
router.post('/upload-timetable', protect, adminOnly, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload an Excel file (.xlsx or .xls)' });
    }

    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(sheet);

    if (!rows || rows.length === 0) {
      return res.status(400).json({ message: 'The uploaded Excel file contains no data rows.' });
    }

    // Auto-detect department from Excel sheet rows if available
    let detectedDept = '';
    for (const row of rows.slice(0, 10)) {
      const val = JSON.stringify(row);
      if (val.includes('CS') || val.includes('Computer Science')) {
        detectedDept = 'B.Sc. CS';
        break;
      } else if (val.includes('DS') || val.includes('Data Science')) {
        detectedDept = 'B.Sc. DS';
        break;
      } else if (val.includes('IT') || val.includes('Information Technology')) {
        detectedDept = 'B.Sc. IT';
        break;
      }
    }

    let departmentName = req.body.department || detectedDept || getFieldValue(rows[0], ['Department', 'department', 'Branch']) || 'B.Sc. IT';
    let academicYear = req.body.academicYear || getFieldValue(rows[0], ['Academic Year', 'academicYear']) || '2026-27';
    
    let defaultClass = 'T.Y. B.Sc. (IT)';
    if (departmentName.includes('CS')) defaultClass = 'T.Y. B.Sc. (CS)';
    else if (departmentName.includes('DS')) defaultClass = 'T.Y. B.Sc. (DS)';

    let className = req.body.class || getFieldValue(rows[0], ['Class', 'class']) || defaultClass;
    let division = req.body.division || getFieldValue(rows[0], ['Division', 'division']) || 'A';
    let roomNo = getFieldValue(rows[0], ['Room', 'room', 'Room No']) || (departmentName.includes('CS') ? '501' : (departmentName.includes('DS') ? '401' : '620'));
    let targetDate = req.body.date || getFieldValue(rows[0], ['Date', 'date']) || '';

    // Format targetDate if present
    if (targetDate && targetDate.includes('/')) {
      const parts = targetDate.split('/');
      if (parts.length === 3) {
        if (parts[2].length === 4) targetDate = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
      }
    }

    const defaultDay = targetDate ? normalizeDay(new Date(targetDate).toLocaleDateString('en-US', { weekday: 'long' })) : 'Monday';

    // Auto-detect Matrix / Grid Layout in Excel vs Row-Based Layout
    const firstRowKeys = Object.keys(rows[0]);
    const dayKeysFound = firstRowKeys.filter(k => normalizeDay(k) !== '');
    const timeKeysFound = firstRowKeys.filter(k => k.match(/\d{1,2}[:\-]/));
    
    const isMatrixDaysAsCols = dayKeysFound.length >= 3;
    const isMatrixTimesAsCols = timeKeysFound.length >= 2;

    const slotsByKey = {};
    const facultySet = new Set();
    let lectureCount = 0;
    let practicalCount = 0;
    let breakCount = 0;

    if (isMatrixTimesAsCols) {
      // Format: Columns are Time Slots (e.g. Day | 08:00 AM - 09:00 AM | 09:00 AM - 10:00 AM | ...)
      for (const row of rows) {
        const rawDay = getFieldValue(row, ['Day', 'day', 'Days', 'DayName', 'Day of Week', 'DAY']) || defaultDay;
        const day = normalizeDay(rawDay);
        if (!day) continue;

        for (const colKey of Object.keys(row)) {
          if (!colKey.match(/\d{1,2}[:\-]/)) continue;
          const cellVal = row[colKey];
          if (!cellVal) continue;

          const { startTime, endTime } = parseTimeRange(colKey);
          const cellInfo = parseCellText(cellVal);
          if (cellInfo.isEmpty) continue;

          const key = `${day}_${startTime}_${endTime}`;
          slotsByKey[key] = {
            day,
            startTime,
            endTime,
            slotType: cellInfo.slotType || 'Lecture',
            isBreak: cellInfo.isBreak || false,
            breakTitle: cellInfo.breakTitle,
            subject: cellInfo.subject || '',
            facultyName: cellInfo.facultyName || '',
            facultyAbbr: cellInfo.facultyAbbr || '',
            room: roomNo,
            batchDetails: cellInfo.batchDetails || []
          };

          if (cellInfo.isBreak) breakCount++;
          else if (cellInfo.slotType === 'Practical') practicalCount++;
          else lectureCount++;

          if (cellInfo.facultyName) facultySet.add(cellInfo.facultyName);
          if (cellInfo.facultyAbbr) facultySet.add(cellInfo.facultyAbbr);
        }
      }
    } else if (isMatrixDaysAsCols) {
      // Format: Columns are Days (e.g. Time | Monday | Tuesday | Wednesday | ...)
      for (const row of rows) {
        const rawTime = getFieldValue(row, ['Time', 'time', 'Slot', 'Period', 'Timing', 'Start Time']);
        if (!rawTime) continue;
        const { startTime, endTime } = parseTimeRange(rawTime);

        for (const colKey of Object.keys(row)) {
          const day = normalizeDay(colKey);
          if (!day) continue;

          const cellVal = row[colKey];
          if (!cellVal) continue;

          const cellInfo = parseCellText(cellVal);
          if (cellInfo.isEmpty) continue;

          const key = `${day}_${startTime}_${endTime}`;
          slotsByKey[key] = {
            day,
            startTime,
            endTime,
            slotType: cellInfo.slotType || 'Lecture',
            isBreak: cellInfo.isBreak || false,
            breakTitle: cellInfo.breakTitle,
            subject: cellInfo.subject || '',
            facultyName: cellInfo.facultyName || '',
            facultyAbbr: cellInfo.facultyAbbr || '',
            room: roomNo,
            batchDetails: cellInfo.batchDetails || []
          };

          if (cellInfo.isBreak) breakCount++;
          else if (cellInfo.slotType === 'Practical') practicalCount++;
          else lectureCount++;

          if (cellInfo.facultyName) facultySet.add(cellInfo.facultyName);
          if (cellInfo.facultyAbbr) facultySet.add(cellInfo.facultyAbbr);
        }
      }
    } else {
      // Standard Row-Based Format (Day | Start Time | End Time | Subject | Faculty ...)
      for (const row of rows) {
        const rawDay = getFieldValue(row, ['Day', 'day', 'Days', 'DayName', 'Day of Week', 'DAY']) || defaultDay;
        const day = normalizeDay(rawDay);

        const rawStart = getFieldValue(row, ['Start Time', 'startTime', 'Start', 'Time', 'Time Slot', 'Slot', 'Period', 'Timing', 'START TIME']);
        const rawEnd = getFieldValue(row, ['End Time', 'endTime', 'End', 'END TIME']);
        
        const { startTime, endTime } = parseTimeRange(rawStart, rawEnd);

        let subject = getFieldValue(row, ['Subject', 'subject', 'Sub', 'Course', 'Subject Name', 'SUBJECT']);
        let facultyName = getFieldValue(row, ['Faculty', 'faculty', 'Faculty Name', 'Teacher', 'Prof', 'Professor', 'FACULTY']);
        let facultyAbbr = getFieldValue(row, ['Faculty Abbreviation', 'facultyAbbr', 'Abbreviation', 'Abbr', 'Faculty Initials', 'FACULTY ABBR']);
        const room = getFieldValue(row, ['Room', 'room', 'Room No', 'Classroom', 'ROOM']) || roomNo;
        const lab = getFieldValue(row, ['Lab', 'lab', 'Lab Name', 'LAB']);
        const batch = getFieldValue(row, ['Batch', 'batch', 'Group', 'BATCH']);
        const isBreakStr = getFieldValue(row, ['Status', 'status', 'Type', 'type', 'Slot Type', 'TYPE']).toLowerCase();
        const note = getFieldValue(row, ['Note', 'note', 'Remarks', 'Comment']);

        if (!day) continue;

        // If subject string has faculty inside e.g. DNET (ARS)
        if (subject && (!facultyAbbr || !facultyName)) {
          const parsedCell = parseCellText(subject);
          if (parsedCell.subject) subject = parsedCell.subject;
          if (parsedCell.facultyAbbr && !facultyAbbr) facultyAbbr = parsedCell.facultyAbbr;
          if (parsedCell.facultyName && !facultyName) facultyName = parsedCell.facultyName;
        }

        const isBreak = isBreakStr.includes('break') || subject.toLowerCase().includes('break');
        const slotType = isBreakStr.includes('practical') || lab || batch ? 'Practical' : (isBreak ? 'Break' : 'Lecture');

        if (isBreak) breakCount++;
        else if (slotType === 'Practical') practicalCount++;
        else lectureCount++;

        if (facultyName) facultySet.add(facultyName);
        if (facultyAbbr) facultySet.add(facultyAbbr);

        // Auto-upsert Faculty if present
        let facultyId = null;
        if (facultyName && !isBreak) {
          let fDoc = await Faculty.findOne({ name: facultyName, department: departmentName });
          if (!fDoc && facultyAbbr) {
            fDoc = await Faculty.findOne({ abbreviation: facultyAbbr, department: departmentName });
          }
          if (!fDoc) {
            const empId = `${departmentName.replace(/[^a-zA-Z]/g, '')}-${Date.now().toString().slice(-4)}`;
            fDoc = await Faculty.create({
              name: facultyName,
              abbreviation: facultyAbbr || facultyName.slice(0, 3).toUpperCase(),
              email: `${facultyName.toLowerCase().replace(/\s+/g, '.')}@tsdc.edu.in`,
              employeeId: empId,
              department: departmentName,
              subjects: [subject],
              skills: [subject],
              status: 'Active'
            });
          }
          facultyId = fDoc._id;
        }

        // Auto-upsert Subject if present
        if (subject && !isBreak) {
          await Subject.findOneAndUpdate(
            { code: subject, department: departmentName },
            { code: subject, name: subject, department: departmentName, type: slotType },
            { upsert: true }
          );
        }

        const key = `${day}_${startTime}_${endTime}`;

        if (!slotsByKey[key]) {
          slotsByKey[key] = {
            day,
            startTime,
            endTime,
            slotType,
            isBreak,
            breakTitle: isBreak ? subject || 'BREAK' : undefined,
            subject: isBreak ? '' : (batch ? '' : subject),
            facultyName: isBreak ? '' : (batch ? '' : facultyName),
            facultyAbbr: isBreak ? '' : (batch ? '' : facultyAbbr),
            facultyId: isBreak ? null : (batch ? null : facultyId),
            room: lab || room,
            note,
            batchDetails: []
          };
        }

        if (batch) {
          slotsByKey[key].batchDetails.push({
            batch,
            subject,
            lab: lab || room,
            facultyName,
            facultyAbbr,
            facultyId
          });
          slotsByKey[key].slotType = 'Practical';
        } else if (!isBreak && subject && !slotsByKey[key].subject) {
          slotsByKey[key].subject = subject;
          slotsByKey[key].facultyName = facultyName;
          slotsByKey[key].facultyAbbr = facultyAbbr;
          slotsByKey[key].facultyId = facultyId;
          slotsByKey[key].room = lab || room;
        }
      }
    }

    const allSlots = Object.values(slotsByKey);

    if (allSlots.length === 0) {
      return res.status(400).json({
        message: 'Could not extract any valid timetable slots from the uploaded file. Please ensure your Excel sheet has columns for Day, Start Time, Subject, and Faculty, or download our sample template.'
      });
    }

    // Update or create department entry if missing
    let deptDoc = await Department.findOne({ name: departmentName });
    if (!deptDoc) {
      const code = departmentName.replace('B.Sc. ', '').trim();
      deptDoc = await Department.create({
        code,
        name: departmentName,
        academicYears: [academicYear],
        classes: [className],
        divisions: [division],
        rooms: [roomNo]
      });
    }

    let resultTimetable = null;
    let uploadType = 'Master Timetable';

    if (targetDate) {
      uploadType = `Daily Timetable for Date ${targetDate}`;
      resultTimetable = await DailyTimetable.findOneAndUpdate(
        { department: departmentName, date: targetDate, class: className, division },
        {
          department: departmentName,
          date: targetDate,
          academicYear,
          class: className,
          division,
          roomNo,
          slots: allSlots
        },
        { upsert: true, new: true }
      );
    }

    let masterTimetable = await Timetable.findOne({
      department: departmentName,
      academicYear,
      class: className,
      division
    });

    if (masterTimetable) {
      if (!targetDate) {
        masterTimetable.slots = allSlots;
        masterTimetable.roomNo = roomNo;
        await masterTimetable.save();
      }
    } else {
      masterTimetable = await Timetable.create({
        department: departmentName,
        academicYear,
        class: className,
        division,
        roomNo,
        effectiveFrom: new Date().toLocaleDateString('en-GB'),
        classInCharge: 'Department Admin',
        slots: allSlots
      });
    }

    if (!resultTimetable) resultTimetable = masterTimetable;

    const summary = {
      department: departmentName,
      class: className,
      division,
      targetDate: targetDate || 'Original Master Schedule',
      uploadType,
      totalRows: rows.length,
      totalSlots: allSlots.length,
      lectureCount,
      practicalCount,
      breakCount,
      facultyCount: facultySet.size,
      facultyList: Array.from(facultySet)
    };

    res.json({
      message: `Successfully uploaded & parsed Excel ${uploadType} for ${departmentName} (${className} Div ${division})!`,
      summary,
      timetable: resultTimetable,
      redirectUrl: `/timetable?department=${encodeURIComponent(departmentName)}&class=${encodeURIComponent(className)}&division=${encodeURIComponent(division)}${targetDate ? `&date=${targetDate}` : ''}`
    });
  } catch (error) {
    console.error('Excel Upload Error:', error);
    res.status(500).json({ message: `Failed to parse Excel file: ${error.message}` });
  }
});

module.exports = router;
