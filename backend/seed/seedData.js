const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Department = require('../models/Department');
const Faculty = require('../models/Faculty');
const Subject = require('../models/Subject');
const Timetable = require('../models/Timetable');

const seedDatabase = async () => {
  try {
    console.log('Seeding initial database content...');

    // 1. Departments
    const deptList = [
      {
        code: 'IT',
        name: 'B.Sc. IT',
        academicYears: ['2026-27'],
        classes: ['T.Y. B.Sc. (IT)'],
        divisions: ['A', 'B', 'C'],
        rooms: ['620', '619', 'Lab 08', 'Lab 09', 'Lab 10', 'Lab 11', 'Lab 12', 'Lab 13', 'Lab CC', 'Lab LL', 'Lab EL']
      },
      {
        code: 'CS',
        name: 'B.Sc. CS',
        academicYears: ['2026-27'],
        classes: ['F.Y. B.Sc. (CS)', 'S.Y. B.Sc. (CS)', 'T.Y. B.Sc. (CS)'],
        divisions: ['A', 'B'],
        rooms: ['501', '502', 'Lab CS1', 'Lab CS2']
      },
      {
        code: 'DS',
        name: 'B.Sc. DS',
        academicYears: ['2026-27'],
        classes: ['F.Y. B.Sc. (DS)', 'S.Y. B.Sc. (DS)', 'T.Y. B.Sc. (DS)'],
        divisions: ['A'],
        rooms: ['401', '402', 'Lab DS1', 'Lab DS2']
      }
    ];

    for (const d of deptList) {
      await Department.findOneAndUpdate({ code: d.code }, d, { upsert: true, new: true });
    }

    // 2. Admin User
    const adminPassword = await bcrypt.hash('admin123', 10);
    await User.findOneAndUpdate(
      { email: 'admin@tsdc.edu.in' },
      {
        name: 'TSDC Admin',
        email: 'admin@tsdc.edu.in',
        password: adminPassword,
        role: 'ADMIN'
      },
      { upsert: true, new: true }
    );

    // 3. Faculty Members
    const defaultFacultyPassword = await bcrypt.hash('faculty123', 10);
    const facultyMaster = [
      // IT Faculty
      { name: 'Mr. Aman Singh', abbreviation: 'ARS', email: 'aman.singh@tsdc.edu.in', employeeId: 'TSDC-IT-001', department: 'B.Sc. IT', subjects: ['DNET'], skills: ['DNET', 'C#'], status: 'Active' },
      { name: 'Mr. Jasar Shaikh', abbreviation: 'JS', email: 'jasar.shaikh@tsdc.edu.in', employeeId: 'TSDC-IT-002', department: 'B.Sc. IT', subjects: ['AIA', 'AIADJ'], skills: ['AIA', 'ML'], status: 'Active' },
      { name: 'Mr. Pratharv Surve', abbreviation: 'PPS', email: 'pratharv.surve@tsdc.edu.in', employeeId: 'TSDC-IT-003', department: 'B.Sc. IT', subjects: ['FSDM'], skills: ['MERN'], status: 'Active' },
      { name: 'Ms. Stephy Thomas', abbreviation: 'SET', email: 'stephy.thomas@tsdc.edu.in', employeeId: 'TSDC-IT-004', department: 'B.Sc. IT', subjects: ['IoT'], skills: ['IoT'], status: 'Active' },
      { name: 'Mrs. Minal Shete', abbreviation: 'MVS', email: 'minal.shete@tsdc.edu.in', employeeId: 'TSDC-IT-005', department: 'B.Sc. IT', subjects: ['EJ', 'IKS'], skills: ['Enterprise Java'], status: 'Active' },
      { name: 'Mr. Sudhakar Vishwakarma', abbreviation: 'SCV', email: 'sudhakar.v@tsdc.edu.in', employeeId: 'TSDC-IT-006', department: 'B.Sc. IT', subjects: ['RARP'], skills: ['R Programming'], status: 'Active' },
      
      // CS Faculty
      { name: 'Dr. Rahul Sharma', abbreviation: 'RHS', email: 'rahul.sharma@tsdc.edu.in', employeeId: 'TSDC-CS-001', department: 'B.Sc. CS', subjects: ['Python', 'Cyber Security'], skills: ['Python', 'Security'], status: 'Active' },
      { name: 'Ms. Neha Gupta', abbreviation: 'NHG', email: 'neha.gupta@tsdc.edu.in', employeeId: 'TSDC-CS-002', department: 'B.Sc. CS', subjects: ['Data Structures', 'Web Tech'], skills: ['DSA', 'Web'], status: 'Active' },

      // DS Faculty
      { name: 'Dr. Vikas Verma', abbreviation: 'VKV', email: 'vikas.verma@tsdc.edu.in', employeeId: 'TSDC-DS-001', department: 'B.Sc. DS', subjects: ['Big Data', 'Deep Learning'], skills: ['Data Science', 'PyTorch'], status: 'Active' },
      { name: 'Mrs. Pooja Patil', abbreviation: 'PJP', email: 'pooja.patil@tsdc.edu.in', employeeId: 'TSDC-DS-002', department: 'B.Sc. DS', subjects: ['Statistics', 'PowerBI'], skills: ['Statistics', 'BI'], status: 'Active' }
    ];

    const facultyDocs = {};
    for (const f of facultyMaster) {
      let fUser = await User.findOne({ email: f.email });
      if (!fUser) {
        fUser = await User.create({
          name: f.name,
          email: f.email,
          password: defaultFacultyPassword,
          role: 'FACULTY'
        });
      }

      const fDoc = await Faculty.findOneAndUpdate(
        { employeeId: f.employeeId },
        { ...f, userId: fUser._id },
        { upsert: true, new: true }
      );

      fUser.facultyId = fDoc._id;
      await fUser.save();

      facultyDocs[f.abbreviation] = fDoc;
    }

    // 4. IT Timetable Slots
    const itTimetableSlots = [
      { day: 'Monday', startTime: '08:00 AM', endTime: '09:00 AM', slotType: 'Practical', subject: 'RARP', room: 'Lab LL / Lab EL', batchDetails: [{ batch: 'X', subject: 'RARP', lab: 'Lab LL', facultyName: 'Mr. Sudhakar Vishwakarma', facultyAbbr: 'SCV', facultyId: facultyDocs['SCV']?._id }, { batch: 'Y', subject: 'RARP', lab: 'Lab EL', facultyName: 'Mr. Sudhakar Vishwakarma', facultyAbbr: 'SCV', facultyId: facultyDocs['SCV']?._id }] },
      { day: 'Monday', startTime: '09:00 AM', endTime: '10:00 AM', slotType: 'Practical', subject: 'RARP', room: 'Lab LL / Lab EL', batchDetails: [{ batch: 'X', subject: 'RARP', lab: 'Lab LL', facultyName: 'Mr. Sudhakar Vishwakarma', facultyAbbr: 'SCV', facultyId: facultyDocs['SCV']?._id }, { batch: 'Y', subject: 'RARP', lab: 'Lab EL', facultyName: 'Mr. Sudhakar Vishwakarma', facultyAbbr: 'SCV', facultyId: facultyDocs['SCV']?._id }] },
      { day: 'Monday', startTime: '10:00 AM', endTime: '10:15 AM', slotType: 'Break', isBreak: true, breakTitle: 'SHORT BREAK' },
      { day: 'Monday', startTime: '10:15 AM', endTime: '11:15 AM', slotType: 'Practical', batchDetails: [{ batch: 'X', subject: 'EJ', lab: 'Lab 08', facultyName: 'Mrs. Minal Shete', facultyAbbr: 'MVS', facultyId: facultyDocs['MVS']?._id }, { batch: 'Y', subject: 'IoT', lab: 'Lab 09', facultyName: 'Ms. Stephy Thomas', facultyAbbr: 'SET', facultyId: facultyDocs['SET']?._id }] },
      { day: 'Monday', startTime: '11:15 AM', endTime: '12:15 PM', slotType: 'Lecture', note: 'No lecture specified' },
      { day: 'Monday', startTime: '12:15 PM', endTime: '12:45 PM', slotType: 'Break', isBreak: true, breakTitle: 'LUNCH BREAK' },
      { day: 'Monday', startTime: '12:45 PM', endTime: '01:45 PM', slotType: 'Lecture', note: 'No lecture' },
      { day: 'Monday', startTime: '01:45 PM', endTime: '02:45 PM', slotType: 'Lecture', note: 'No lecture' },

      { day: 'Tuesday', startTime: '08:00 AM', endTime: '09:00 AM', slotType: 'Lecture', subject: 'DNET', facultyName: 'Mr. Aman Singh', facultyAbbr: 'ARS', facultyId: facultyDocs['ARS']?._id, room: '620' },
      { day: 'Tuesday', startTime: '09:00 AM', endTime: '10:00 AM', slotType: 'Lecture', subject: 'AIADJ / AIA', facultyName: 'Mr. Jasar Shaikh', facultyAbbr: 'JS', facultyId: facultyDocs['JS']?._id, room: '620' },
      { day: 'Tuesday', startTime: '10:00 AM', endTime: '10:15 AM', slotType: 'Break', isBreak: true, breakTitle: 'SHORT BREAK' },
      { day: 'Tuesday', startTime: '10:15 AM', endTime: '11:15 AM', slotType: 'Practical', batchDetails: [{ batch: 'X', subject: 'DNET', lab: 'Lab 09', facultyName: 'Mr. Aman Singh', facultyAbbr: 'ARS', facultyId: facultyDocs['ARS']?._id }, { batch: 'Y', subject: 'AIADJ', lab: 'Lab 08', facultyName: 'Mr. Jasar Shaikh', facultyAbbr: 'JS', facultyId: facultyDocs['JS']?._id }] },
      { day: 'Tuesday', startTime: '11:15 AM', endTime: '12:15 PM', slotType: 'Lecture', note: 'No lecture specified' },
      { day: 'Tuesday', startTime: '12:15 PM', endTime: '12:45 PM', slotType: 'Break', isBreak: true, breakTitle: 'LUNCH BREAK' },
      { day: 'Tuesday', startTime: '12:45 PM', endTime: '01:45 PM', slotType: 'Lecture', note: 'No lecture' },
      { day: 'Tuesday', startTime: '01:45 PM', endTime: '02:45 PM', slotType: 'Lecture', note: 'No lecture' },

      { day: 'Wednesday', startTime: '08:00 AM', endTime: '09:00 AM', slotType: 'Lecture', subject: 'RARP', facultyName: 'Mr. Sudhakar Vishwakarma', facultyAbbr: 'SCV', facultyId: facultyDocs['SCV']?._id, room: '620' },
      { day: 'Wednesday', startTime: '09:00 AM', endTime: '10:00 AM', slotType: 'Lecture', subject: 'RARP', facultyName: 'Mr. Sudhakar Vishwakarma', facultyAbbr: 'SCV', facultyId: facultyDocs['SCV']?._id, room: '620' },
      { day: 'Wednesday', startTime: '10:00 AM', endTime: '10:15 AM', slotType: 'Break', isBreak: true, breakTitle: 'SHORT BREAK' },
      { day: 'Wednesday', startTime: '10:15 AM', endTime: '11:15 AM', slotType: 'Practical', batchDetails: [{ batch: 'X', subject: 'FSDM', lab: 'Lab CC', facultyName: 'Mr. Pratharv Surve', facultyAbbr: 'PPS', facultyId: facultyDocs['PPS']?._id }, { batch: 'Y', subject: 'FSDM', lab: 'Lab CC', facultyName: 'Mr. Pratharv Surve', facultyAbbr: 'PPS', facultyId: facultyDocs['PPS']?._id }] },
      { day: 'Wednesday', startTime: '11:15 AM', endTime: '12:15 PM', slotType: 'Lecture', note: 'No lecture specified' },
      { day: 'Wednesday', startTime: '12:15 PM', endTime: '12:45 PM', slotType: 'Break', isBreak: true, breakTitle: 'LUNCH BREAK' },
      { day: 'Wednesday', startTime: '12:45 PM', endTime: '01:45 PM', slotType: 'Lecture', note: 'No lecture' },
      { day: 'Wednesday', startTime: '01:45 PM', endTime: '02:45 PM', slotType: 'Lecture', note: 'No lecture' },

      { day: 'Thursday', startTime: '08:00 AM', endTime: '09:00 AM', slotType: 'Lecture', note: 'No lecture' },
      { day: 'Thursday', startTime: '09:00 AM', endTime: '10:00 AM', slotType: 'Lecture', note: 'No lecture' },
      { day: 'Thursday', startTime: '10:00 AM', endTime: '10:15 AM', slotType: 'Break', isBreak: true, breakTitle: 'SHORT BREAK' },
      { day: 'Thursday', startTime: '10:15 AM', endTime: '11:15 AM', slotType: 'Practical', batchDetails: [{ batch: 'X', subject: 'AIADJ', lab: 'Lab 11', facultyName: 'Mr. Jasar Shaikh', facultyAbbr: 'JS', facultyId: facultyDocs['JS']?._id }, { batch: 'Y', subject: 'DNET', lab: 'Lab 10', facultyName: 'Mr. Aman Singh', facultyAbbr: 'ARS', facultyId: facultyDocs['ARS']?._id }] },
      { day: 'Thursday', startTime: '11:15 AM', endTime: '12:15 PM', slotType: 'Lecture', note: 'No lecture' },
      { day: 'Thursday', startTime: '12:15 PM', endTime: '12:45 PM', slotType: 'Break', isBreak: true, breakTitle: 'LUNCH BREAK' },
      { day: 'Thursday', startTime: '12:45 PM', endTime: '01:45 PM', slotType: 'Lecture', subject: 'IKS', facultyName: 'Mrs. Minal Shete', facultyAbbr: 'MVS', facultyId: facultyDocs['MVS']?._id, room: '620' },
      { day: 'Thursday', startTime: '01:45 PM', endTime: '02:45 PM', slotType: 'Lecture', note: 'No lecture' },

      { day: 'Friday', startTime: '08:00 AM', endTime: '09:00 AM', slotType: 'Lecture', subject: 'AIADJ / AIA', facultyName: 'Mr. Jasar Shaikh', facultyAbbr: 'JS', facultyId: facultyDocs['JS']?._id, room: '620' },
      { day: 'Friday', startTime: '09:00 AM', endTime: '10:00 AM', slotType: 'Lecture', subject: 'DNET', facultyName: 'Mr. Aman Singh', facultyAbbr: 'ARS', facultyId: facultyDocs['ARS']?._id, room: '620' },
      { day: 'Friday', startTime: '10:00 AM', endTime: '10:15 AM', slotType: 'Break', isBreak: true, breakTitle: 'SHORT BREAK' },
      { day: 'Friday', startTime: '10:15 AM', endTime: '11:15 AM', slotType: 'Practical', batchDetails: [{ batch: 'X', subject: 'IoT', lab: 'Lab 12', facultyName: 'Ms. Stephy Thomas', facultyAbbr: 'SET', facultyId: facultyDocs['SET']?._id }, { batch: 'Y', subject: 'EJ', lab: 'Lab 13', facultyName: 'Mrs. Minal Shete', facultyAbbr: 'MVS', facultyId: facultyDocs['MVS']?._id }] },
      { day: 'Friday', startTime: '11:15 AM', endTime: '12:15 PM', slotType: 'Lecture', note: 'No lecture' },
      { day: 'Friday', startTime: '12:15 PM', endTime: '12:45 PM', slotType: 'Break', isBreak: true, breakTitle: 'LUNCH BREAK' },
      { day: 'Friday', startTime: '12:45 PM', endTime: '01:45 PM', slotType: 'Lecture', subject: 'IKS', facultyName: 'Mrs. Minal Shete', facultyAbbr: 'MVS', facultyId: facultyDocs['MVS']?._id, room: '619' },
      { day: 'Friday', startTime: '01:45 PM', endTime: '02:45 PM', slotType: 'Lecture', subject: 'MVS', facultyName: 'Mrs. Minal Shete', facultyAbbr: 'MVS', facultyId: facultyDocs['MVS']?._id, room: '620' },

      { day: 'Saturday', startTime: '08:00 AM', endTime: '02:45 PM', slotType: 'Activities', subject: 'Academic, Co-curricular & Extra-curricular Activities', note: 'Except 2nd and 4th Saturday' }
    ];

    // Seed B.Sc. IT Timetable
    await Timetable.findOneAndUpdate(
      { department: 'B.Sc. IT', academicYear: '2026-27', class: 'T.Y. B.Sc. (IT)', division: 'C' },
      { department: 'B.Sc. IT', academicYear: '2026-27', class: 'T.Y. B.Sc. (IT)', division: 'C', roomNo: '620', effectiveFrom: '01/07/2026', classInCharge: 'Mr. Jasar Shaikh', slots: itTimetableSlots },
      { upsert: true, new: true }
    );

    // 5. CS Timetable Slots
    const csTimetableSlots = [
      { day: 'Monday', startTime: '08:00 AM', endTime: '09:00 AM', slotType: 'Lecture', subject: 'Python', facultyName: 'Dr. Rahul Sharma', facultyAbbr: 'RHS', room: '501' },
      { day: 'Monday', startTime: '09:00 AM', endTime: '10:00 AM', slotType: 'Lecture', subject: 'Data Structures', facultyName: 'Ms. Neha Gupta', facultyAbbr: 'NHG', room: '501' },
      { day: 'Monday', startTime: '10:00 AM', endTime: '10:15 AM', slotType: 'Break', isBreak: true, breakTitle: 'SHORT BREAK' },
      { day: 'Monday', startTime: '10:15 AM', endTime: '11:15 AM', slotType: 'Practical', batchDetails: [{ batch: 'A1', subject: 'Python', lab: 'Lab CS1', facultyName: 'Dr. Rahul Sharma', facultyAbbr: 'RHS' }, { batch: 'A2', subject: 'Data Structures', lab: 'Lab CS2', facultyName: 'Ms. Neha Gupta', facultyAbbr: 'NHG' }] },
      { day: 'Monday', startTime: '11:15 AM', endTime: '12:15 PM', slotType: 'Lecture', subject: 'Cyber Security', facultyName: 'Dr. Rahul Sharma', facultyAbbr: 'RHS', room: '501' },
      { day: 'Monday', startTime: '12:15 PM', endTime: '12:45 PM', slotType: 'Break', isBreak: true, breakTitle: 'LUNCH BREAK' },
      { day: 'Monday', startTime: '12:45 PM', endTime: '01:45 PM', slotType: 'Lecture', subject: 'Web Tech', facultyName: 'Ms. Neha Gupta', facultyAbbr: 'NHG', room: '501' },

      { day: 'Tuesday', startTime: '08:00 AM', endTime: '09:00 AM', slotType: 'Lecture', subject: 'Cyber Security', facultyName: 'Dr. Rahul Sharma', facultyAbbr: 'RHS', room: '501' },
      { day: 'Tuesday', startTime: '09:00 AM', endTime: '10:00 AM', slotType: 'Lecture', subject: 'Web Tech', facultyName: 'Ms. Neha Gupta', facultyAbbr: 'NHG', room: '501' },
      { day: 'Tuesday', startTime: '10:00 AM', endTime: '10:15 AM', slotType: 'Break', isBreak: true, breakTitle: 'SHORT BREAK' },
      { day: 'Tuesday', startTime: '10:15 AM', endTime: '11:15 AM', slotType: 'Practical', batchDetails: [{ batch: 'A1', subject: 'Web Tech', lab: 'Lab CS2', facultyName: 'Ms. Neha Gupta', facultyAbbr: 'NHG' }, { batch: 'A2', subject: 'Cyber Security', lab: 'Lab CS1', facultyName: 'Dr. Rahul Sharma', facultyAbbr: 'RHS' }] },

      { day: 'Wednesday', startTime: '08:00 AM', endTime: '09:00 AM', slotType: 'Lecture', subject: 'Data Structures', facultyName: 'Ms. Neha Gupta', facultyAbbr: 'NHG', room: '501' },
      { day: 'Wednesday', startTime: '09:00 AM', endTime: '10:00 AM', slotType: 'Lecture', subject: 'Python', facultyName: 'Dr. Rahul Sharma', facultyAbbr: 'RHS', room: '501' },
      { day: 'Wednesday', startTime: '10:00 AM', endTime: '10:15 AM', slotType: 'Break', isBreak: true, breakTitle: 'SHORT BREAK' },

      { day: 'Thursday', startTime: '08:00 AM', endTime: '09:00 AM', slotType: 'Lecture', subject: 'Python', facultyName: 'Dr. Rahul Sharma', facultyAbbr: 'RHS', room: '501' },
      { day: 'Thursday', startTime: '09:00 AM', endTime: '10:00 AM', slotType: 'Lecture', subject: 'Web Tech', facultyName: 'Ms. Neha Gupta', facultyAbbr: 'NHG', room: '501' },

      { day: 'Friday', startTime: '08:00 AM', endTime: '09:00 AM', slotType: 'Lecture', subject: 'Data Structures', facultyName: 'Ms. Neha Gupta', facultyAbbr: 'NHG', room: '501' },
      { day: 'Friday', startTime: '09:00 AM', endTime: '10:00 AM', slotType: 'Lecture', subject: 'Cyber Security', facultyName: 'Dr. Rahul Sharma', facultyAbbr: 'RHS', room: '501' },

      { day: 'Saturday', startTime: '08:00 AM', endTime: '02:45 PM', slotType: 'Activities', subject: 'Academic & Co-curricular Activities', note: 'Except 2nd and 4th Saturday' }
    ];

    await Timetable.findOneAndUpdate(
      { department: 'B.Sc. CS', academicYear: '2026-27', class: 'T.Y. B.Sc. (CS)', division: 'A' },
      { department: 'B.Sc. CS', academicYear: '2026-27', class: 'T.Y. B.Sc. (CS)', division: 'A', roomNo: '501', effectiveFrom: '01/07/2026', classInCharge: 'Dr. Rahul Sharma', slots: csTimetableSlots },
      { upsert: true, new: true }
    );

    // 6. DS Timetable Slots
    const dsTimetableSlots = [
      { day: 'Monday', startTime: '08:00 AM', endTime: '09:00 AM', slotType: 'Lecture', subject: 'Big Data', facultyName: 'Dr. Vikas Verma', facultyAbbr: 'VKV', room: '401' },
      { day: 'Monday', startTime: '09:00 AM', endTime: '10:00 AM', slotType: 'Lecture', subject: 'Statistics', facultyName: 'Mrs. Pooja Patil', facultyAbbr: 'PJP', room: '401' },
      { day: 'Monday', startTime: '10:00 AM', endTime: '10:15 AM', slotType: 'Break', isBreak: true, breakTitle: 'SHORT BREAK' },
      { day: 'Monday', startTime: '10:15 AM', endTime: '11:15 AM', slotType: 'Practical', batchDetails: [{ batch: 'D1', subject: 'Big Data', lab: 'Lab DS1', facultyName: 'Dr. Vikas Verma', facultyAbbr: 'VKV' }, { batch: 'D2', subject: 'PowerBI', lab: 'Lab DS2', facultyName: 'Mrs. Pooja Patil', facultyAbbr: 'PJP' }] },
      { day: 'Monday', startTime: '11:15 AM', endTime: '12:15 PM', slotType: 'Lecture', subject: 'Deep Learning', facultyName: 'Dr. Vikas Verma', facultyAbbr: 'VKV', room: '401' },

      { day: 'Tuesday', startTime: '08:00 AM', endTime: '09:00 AM', slotType: 'Lecture', subject: 'Deep Learning', facultyName: 'Dr. Vikas Verma', facultyAbbr: 'VKV', room: '401' },
      { day: 'Tuesday', startTime: '09:00 AM', endTime: '10:00 AM', slotType: 'Lecture', subject: 'Statistics', facultyName: 'Mrs. Pooja Patil', facultyAbbr: 'PJP', room: '401' },

      { day: 'Wednesday', startTime: '08:00 AM', endTime: '09:00 AM', slotType: 'Lecture', subject: 'Big Data', facultyName: 'Dr. Vikas Verma', facultyAbbr: 'VKV', room: '401' },
      { day: 'Wednesday', startTime: '09:00 AM', endTime: '10:00 AM', slotType: 'Lecture', subject: 'PowerBI', facultyName: 'Mrs. Pooja Patil', facultyAbbr: 'PJP', room: '401' },

      { day: 'Thursday', startTime: '08:00 AM', endTime: '09:00 AM', slotType: 'Lecture', subject: 'Deep Learning', facultyName: 'Dr. Vikas Verma', facultyAbbr: 'VKV', room: '401' },
      { day: 'Thursday', startTime: '09:00 AM', endTime: '10:00 AM', slotType: 'Lecture', subject: 'Big Data', facultyName: 'Dr. Vikas Verma', facultyAbbr: 'VKV', room: '401' },

      { day: 'Friday', startTime: '08:00 AM', endTime: '09:00 AM', slotType: 'Lecture', subject: 'Statistics', facultyName: 'Mrs. Pooja Patil', facultyAbbr: 'PJP', room: '401' },
      { day: 'Friday', startTime: '09:00 AM', endTime: '10:00 AM', slotType: 'Lecture', subject: 'PowerBI', facultyName: 'Mrs. Pooja Patil', facultyAbbr: 'PJP', room: '401' },

      { day: 'Saturday', startTime: '08:00 AM', endTime: '02:45 PM', slotType: 'Activities', subject: 'Academic & Co-curricular Activities', note: 'Except 2nd and 4th Saturday' }
    ];

    await Timetable.findOneAndUpdate(
      { department: 'B.Sc. DS', academicYear: '2026-27', class: 'T.Y. B.Sc. (DS)', division: 'A' },
      { department: 'B.Sc. DS', academicYear: '2026-27', class: 'T.Y. B.Sc. (DS)', division: 'A', roomNo: '401', effectiveFrom: '01/07/2026', classInCharge: 'Dr. Vikas Verma', slots: dsTimetableSlots },
      { upsert: true, new: true }
    );

    console.log('Database seeded successfully with exact B.Sc. IT, CS, and DS master timetables!');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
};

module.exports = seedDatabase;
