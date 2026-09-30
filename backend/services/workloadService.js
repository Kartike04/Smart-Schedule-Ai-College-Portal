const Faculty = require('../models/Faculty');
const Absence = require('../models/Absence');
const Timetable = require('../models/Timetable');
const Substitution = require('../models/Substitution');
const { sendSubstituteNotificationEmail } = require('../utils/emailService');

/**
 * Calculates the exact daily workload (number of lectures/practicals) for a faculty member on a specific date & day
 * @param {string} date - YYYY-MM-DD
 * @param {string} day - Day name (e.g. 'Tuesday')
 * @param {string} facultyId - Faculty ObjectId string
 */
const getFacultyDailyWorkload = async (date, day, facultyId) => {
  const fIdStr = facultyId.toString();

  // 1. Count regular scheduled lectures/practicals on this day of week
  const timetables = await Timetable.find({});
  let scheduledCount = 0;

  for (const tt of timetables) {
    const daySlots = tt.slots.filter(s => s.day === day && !s.isBreak);
    for (const slot of daySlots) {
      // Check regular lecture
      if (slot.facultyId && slot.facultyId.toString() === fIdStr) {
        scheduledCount++;
      } else if (slot.batchDetails && slot.batchDetails.length > 0) {
        // Check practical batch assignment
        for (const b of slot.batchDetails) {
          if (b.facultyId && b.facultyId.toString() === fIdStr) {
            scheduledCount++;
            break; // count once per slot
          }
        }
      }
    }
  }

  // 2. Count existing substitutions assigned to this faculty on this date
  const substitutions = await Substitution.find({
    date,
    substituteFacultyId: facultyId
  });

  const substitutionCount = substitutions.length;

  // 3. Subtract original lectures if the faculty is marked absent on this date
  const absence = await Absence.findOne({ date, facultyId });
  const isAbsent = !!absence;

  const netScheduledCount = isAbsent ? 0 : scheduledCount;
  const totalWorkload = netScheduledCount + substitutionCount;

  return {
    scheduledCount,
    substitutionCount,
    isAbsent,
    totalWorkload,
    maxLimit: 4,
    hasCapacity: totalWorkload < 4,
    isAtCap: totalWorkload === 4,
    isOverloaded: totalWorkload > 4
  };
};

/**
 * Calculates smart candidate recommendations for a given slot
 */
const getSubstituteRecommendations = async ({
  department,
  date,
  day,
  startTime,
  endTime,
  subject,
  originalFacultyId
}) => {
  const allFaculty = await Faculty.find({});

  // Get absent faculty on this date
  const absences = await Absence.find({ date });
  const absentFacultyIds = new Set(absences.map(a => a.facultyId ? a.facultyId.toString() : ''));

  // Get busy faculty during startTime-endTime on this day (both regular timetable and substitutions)
  const timetables = await Timetable.find({});
  const busyFacultyIds = new Set();

  for (const tt of timetables) {
    const activeSlots = tt.slots.filter(s => s.day === day && s.startTime === startTime && !s.isBreak);
    for (const slot of activeSlots) {
      if (slot.facultyId) busyFacultyIds.add(slot.facultyId.toString());
      if (slot.batchDetails && slot.batchDetails.length > 0) {
        for (const b of slot.batchDetails) {
          if (b.facultyId) busyFacultyIds.add(b.facultyId.toString());
        }
      }
    }
  }

  // Also check existing substitutions on this date at the same time slot
  const timeSlotSubstitutions = await Substitution.find({ date, startTime, day });
  for (const sub of timeSlotSubstitutions) {
    if (sub.substituteFacultyId) {
      busyFacultyIds.add(sub.substituteFacultyId.toString());
    }
  }

  const candidates = [];

  for (const faculty of allFaculty) {
    const fIdStr = faculty._id.toString();

    // Do not recommend the original faculty member being substituted
    if (originalFacultyId && fIdStr === originalFacultyId.toString()) {
      continue;
    }

    const isAbsent = absentFacultyIds.has(fIdStr) || faculty.status !== 'Active';
    const isBusy = busyFacultyIds.has(fIdStr);
    const isAvailable = !isAbsent && !isBusy;

    // Calculate daily workload for candidate
    const workloadInfo = await getFacultyDailyWorkload(date, day, faculty._id);

    // Scoring Breakdown (Total Max 100)
    let availableScore = 0;
    if (isAvailable) {
      availableScore = 40;
    }

    let sameDeptScore = 0;
    if (faculty.department === department) {
      sameDeptScore = 25;
    } else {
      sameDeptScore = 10;
    }

    let subjectSkillScore = 0;
    const targetSubjLower = (subject || '').toLowerCase();
    const hasSubjectMatch = (faculty.subjects || []).some(s =>
      s.toLowerCase().includes(targetSubjLower) || targetSubjLower.includes(s.toLowerCase())
    );
    const hasSkillMatch = (faculty.skills || []).some(sk =>
      targetSubjLower.includes(sk.toLowerCase()) || sk.toLowerCase().includes(targetSubjLower)
    );

    if (hasSubjectMatch || hasSkillMatch) {
      subjectSkillScore = 20;
    }

    // Workload Balancing Score (Target <= 4 lectures/day)
    let workloadScore = 0;
    if (workloadInfo.totalWorkload === 0) {
      workloadScore = 15; // Top priority to faculty with 0 lectures today
    } else if (workloadInfo.totalWorkload === 1) {
      workloadScore = 12;
    } else if (workloadInfo.totalWorkload === 2) {
      workloadScore = 9;
    } else if (workloadInfo.totalWorkload === 3) {
      workloadScore = 6;
    } else if (workloadInfo.totalWorkload === 4) {
      workloadScore = 2; // At ideal max limit
    } else {
      workloadScore = -15; // Penalty for exceeding 4 lectures/day when others are available
    }

    const totalScore = Math.max(0, availableScore + sameDeptScore + subjectSkillScore + workloadScore);

    const matchedCriteria = [];
    if (isAvailable) {
      matchedCriteria.push('Available at this time slot');
    } else if (isAbsent) {
      matchedCriteria.push('Unavailable: Absent / On Leave');
    } else {
      matchedCriteria.push('Unavailable: Already Teaching in this slot');
    }

    if (faculty.department === department) {
      matchedCriteria.push('Same Department');
    } else {
      matchedCriteria.push('Cross-Department');
    }

    if (hasSubjectMatch || hasSkillMatch) {
      matchedCriteria.push(`Subject/Skill Match (${subject})`);
    } else {
      matchedCriteria.push('General Skill');
    }

    if (workloadInfo.totalWorkload < 4) {
      matchedCriteria.push(`Balanced Workload (${workloadInfo.totalWorkload}/4 lectures today)`);
    } else if (workloadInfo.totalWorkload === 4) {
      matchedCriteria.push(`At Ideal Workload Limit (4/4 lectures today)`);
    } else {
      matchedCriteria.push(`Overload Alert (${workloadInfo.totalWorkload}/4 lectures today)`);
    }

    candidates.push({
      faculty: {
        _id: faculty._id,
        name: faculty.name,
        abbreviation: faculty.abbreviation,
        email: faculty.email,
        department: faculty.department,
        subjects: faculty.subjects,
        skills: faculty.skills,
        status: faculty.status
      },
      isAvailable,
      isAbsent,
      isBusy,
      workloadInfo,
      matchScore: isAvailable ? totalScore : 0,
      breakdown: {
        available: availableScore,
        sameDept: sameDeptScore,
        subjectSkillMatch: subjectSkillScore,
        lowWorkload: workloadScore
      },
      matchedCriteria
    });
  }

  // Sort candidates: Available first, then by capacity (< 4 lectures), then by matchScore descending
  candidates.sort((a, b) => {
    if (a.isAvailable !== b.isAvailable) {
      return a.isAvailable ? -1 : 1;
    }
    // Prefer faculty with daily workload < 4 over those with >= 4
    const aHasCap = a.workloadInfo.totalWorkload < 4;
    const bHasCap = b.workloadInfo.totalWorkload < 4;
    if (aHasCap !== bHasCap && a.isAvailable) {
      return aHasCap ? -1 : 1;
    }
    return b.matchScore - a.matchScore;
  });

  return candidates;
};

/**
 * Auto-assign substitutes for all affected slots of an absence
 */
const autoAssignSubstitutesForAbsence = async (absenceId, userId = null) => {
  const absence = await Absence.findById(absenceId).populate('facultyId');
  if (!absence) return [];

  const dateObj = new Date(absence.date);
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayName = daysOfWeek[dateObj.getDay()];

  const timetables = await Timetable.find({ department: absence.department });
  const createdSubstitutions = [];

  for (const tt of timetables) {
    const slots = tt.slots.filter(s => s.day === dayName && !s.isBreak);

    for (const slot of slots) {
      let isMatch = false;
      let slotSubject = slot.subject;
      let slotRoom = slot.room || tt.roomNo;

      if (slot.facultyId && slot.facultyId.toString() === absence.facultyId._id.toString()) {
        isMatch = true;
      } else if (slot.facultyAbbr && slot.facultyAbbr.toUpperCase() === absence.facultyAbbr.toUpperCase()) {
        isMatch = true;
      }

      if (!isMatch && slot.batchDetails && slot.batchDetails.length > 0) {
        for (const b of slot.batchDetails) {
          if (
            (b.facultyId && b.facultyId.toString() === absence.facultyId._id.toString()) ||
            (b.facultyAbbr && b.facultyAbbr.toUpperCase() === absence.facultyAbbr.toUpperCase())
          ) {
            isMatch = true;
            slotSubject = b.subject;
            slotRoom = b.lab || slotRoom;
            break;
          }
        }
      }

      if (isMatch) {
        // Check if substitution already exists for this slot & absence
        const existingSub = await Substitution.findOne({
          absenceId: absence._id,
          startTime: slot.startTime,
          day: dayName
        });

        if (!existingSub) {
          // Find best candidate
          const candidates = await getSubstituteRecommendations({
            department: absence.department,
            date: absence.date,
            day: dayName,
            startTime: slot.startTime,
            endTime: slot.endTime,
            subject: slotSubject,
            originalFacultyId: absence.facultyId._id
          });

          const topCandidate = candidates.find(c => c.isAvailable && c.matchScore > 0);

          if (topCandidate) {
            const newSub = await Substitution.create({
              absenceId: absence._id,
              department: absence.department,
              date: absence.date,
              day: dayName,
              startTime: slot.startTime,
              endTime: slot.endTime,
              originalFacultyId: absence.facultyId._id,
              originalFacultyName: absence.facultyName,
              originalFacultyAbbr: absence.facultyAbbr,
              substituteFacultyId: topCandidate.faculty._id,
              substituteFacultyName: topCandidate.faculty.name,
              substituteFacultyAbbr: topCandidate.faculty.abbreviation,
              subject: slotSubject,
              class: tt.class,
              division: tt.division,
              room: slotRoom,
              matchScore: topCandidate.matchScore,
              scoreBreakdown: topCandidate.breakdown,
              assignedBy: userId
            });

            createdSubstitutions.push(newSub);

            // Send notification email to assigned substitute
            await sendSubstituteNotificationEmail({
              toEmail: topCandidate.faculty.email,
              facultyName: topCandidate.faculty.name,
              date: absence.date,
              day: dayName,
              startTime: slot.startTime,
              endTime: slot.endTime,
              subject: slotSubject,
              department: absence.department,
              className: tt.class,
              division: tt.division,
              room: slotRoom,
              originalFacultyName: absence.facultyName
            });
          }
        }
      }
    }
  }

  if (createdSubstitutions.length > 0) {
    absence.status = 'Substituted';
    await absence.save();
  }

  return createdSubstitutions;
};

module.exports = {
  getFacultyDailyWorkload,
  getSubstituteRecommendations,
  autoAssignSubstitutesForAbsence
};
