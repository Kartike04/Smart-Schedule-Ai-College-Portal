import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const API = axios.create({
  baseURL
});

// Add Authorization header token if available
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Standalone Full-Stack Fallback Engine for Live Deployed Web Preview
const defaultSettings = {
  collegeName: 'Thakur Shyamnarayan Degree College',
  collegeCode: 'TSDC',
  subtitle: 'Updated Daily Timetable',
  logoUrl: '/logo.png'
};

const defaultFacultyList = [
  { _id: 'f1', name: 'Mr. Aman Singh', abbreviation: 'ARS', email: 'aman.singh@tsdc.edu.in', employeeId: 'TSDC-IT-001', department: 'B.Sc. IT', subjects: ['DNET'], status: 'Active' },
  { _id: 'f2', name: 'Mr. Jasar Shaikh', abbreviation: 'JS', email: 'jasar.shaikh@tsdc.edu.in', employeeId: 'TSDC-IT-002', department: 'B.Sc. IT', subjects: ['AIA', 'AIADJ'], status: 'Active' },
  { _id: 'f3', name: 'Mr. Pratharv Surve', abbreviation: 'PPS', email: 'pratharv.surve@tsdc.edu.in', employeeId: 'TSDC-IT-003', department: 'B.Sc. IT', subjects: ['FSDM'], status: 'Active' },
  { _id: 'f4', name: 'Ms. Stephy Thomas', abbreviation: 'SET', email: 'stephy.thomas@tsdc.edu.in', employeeId: 'TSDC-IT-004', department: 'B.Sc. IT', subjects: ['IoT'], status: 'Active' },
  { _id: 'f5', name: 'Mrs. Minal Shete', abbreviation: 'MVS', email: 'minal.shete@tsdc.edu.in', employeeId: 'TSDC-IT-005', department: 'B.Sc. IT', subjects: ['EJ', 'IKS'], status: 'Active' },
  { _id: 'f6', name: 'Mr. Sudhakar Vishwakarma', abbreviation: 'SCV', email: 'sudhakar.v@tsdc.edu.in', employeeId: 'TSDC-IT-006', department: 'B.Sc. IT', subjects: ['RARP'], status: 'Active' },
  { _id: 'f7', name: 'Dr. Rahul Sharma', abbreviation: 'RHS', email: 'rahul.sharma@tsdc.edu.in', employeeId: 'TSDC-CS-001', department: 'B.Sc. CS', subjects: ['Python', 'Cyber Security'], status: 'Active' },
  { _id: 'f8', name: 'Ms. Neha Gupta', abbreviation: 'NHG', email: 'neha.gupta@tsdc.edu.in', employeeId: 'TSDC-CS-002', department: 'B.Sc. CS', subjects: ['Data Structures', 'Web Tech'], status: 'Active' },
  { _id: 'f9', name: 'Dr. Vikas Verma', abbreviation: 'VKV', email: 'vikas.verma@tsdc.edu.in', employeeId: 'TSDC-DS-001', department: 'B.Sc. DS', subjects: ['Big Data', 'Deep Learning'], status: 'Active' },
  { _id: 'f10', name: 'Mrs. Pooja Patil', abbreviation: 'PJP', email: 'pooja.patil@tsdc.edu.in', employeeId: 'TSDC-DS-002', department: 'B.Sc. DS', subjects: ['Statistics', 'PowerBI'], status: 'Active' }
];

const defaultItSlots = [
  { day: 'Monday', startTime: '08:00 AM', endTime: '09:00 AM', slotType: 'Practical', subject: 'RARP', room: 'Lab LL / Lab EL', batchDetails: [{ batch: 'X', subject: 'RARP', lab: 'Lab LL', facultyName: 'Mr. Sudhakar Vishwakarma', facultyAbbr: 'SCV' }, { batch: 'Y', subject: 'RARP', lab: 'Lab EL', facultyName: 'Mr. Sudhakar Vishwakarma', facultyAbbr: 'SCV' }] },
  { day: 'Monday', startTime: '09:00 AM', endTime: '10:00 AM', slotType: 'Practical', subject: 'RARP', room: 'Lab LL / Lab EL', batchDetails: [{ batch: 'X', subject: 'RARP', lab: 'Lab LL', facultyName: 'Mr. Sudhakar Vishwakarma', facultyAbbr: 'SCV' }, { batch: 'Y', subject: 'RARP', lab: 'Lab EL', facultyName: 'Mr. Sudhakar Vishwakarma', facultyAbbr: 'SCV' }] },
  { day: 'Monday', startTime: '10:00 AM', endTime: '10:15 AM', slotType: 'Break', isBreak: true, breakTitle: 'SHORT BREAK' },
  { day: 'Monday', startTime: '10:15 AM', endTime: '11:15 AM', slotType: 'Practical', batchDetails: [{ batch: 'X', subject: 'EJ', lab: 'Lab 08', facultyName: 'Mrs. Minal Shete', facultyAbbr: 'MVS' }, { batch: 'Y', subject: 'IoT', lab: 'Lab 09', facultyName: 'Ms. Stephy Thomas', facultyAbbr: 'SET' }] },
  { day: 'Monday', startTime: '11:15 AM', endTime: '12:15 PM', slotType: 'Lecture', note: 'No lecture specified' },
  { day: 'Monday', startTime: '12:15 PM', endTime: '12:45 PM', slotType: 'Break', isBreak: true, breakTitle: 'LUNCH BREAK' },

  { day: 'Tuesday', startTime: '08:00 AM', endTime: '09:00 AM', slotType: 'Lecture', subject: 'DNET', facultyName: 'Mr. Aman Singh', facultyAbbr: 'ARS', room: '620' },
  { day: 'Tuesday', startTime: '09:00 AM', endTime: '10:00 AM', slotType: 'Lecture', subject: 'AIADJ / AIA', facultyName: 'Mr. Jasar Shaikh', facultyAbbr: 'JS', room: '620' },
  { day: 'Tuesday', startTime: '10:00 AM', endTime: '10:15 AM', slotType: 'Break', isBreak: true, breakTitle: 'SHORT BREAK' },
  { day: 'Tuesday', startTime: '10:15 AM', endTime: '11:15 AM', slotType: 'Practical', batchDetails: [{ batch: 'X', subject: 'DNET', lab: 'Lab 09', facultyName: 'Mr. Aman Singh', facultyAbbr: 'ARS' }, { batch: 'Y', subject: 'AIADJ', lab: 'Lab 08', facultyName: 'Mr. Jasar Shaikh', facultyAbbr: 'JS' }] },

  { day: 'Wednesday', startTime: '08:00 AM', endTime: '09:00 AM', slotType: 'Lecture', subject: 'RARP', facultyName: 'Mr. Sudhakar Vishwakarma', facultyAbbr: 'SCV', room: '620' },
  { day: 'Wednesday', startTime: '09:00 AM', endTime: '10:00 AM', slotType: 'Lecture', subject: 'RARP', facultyName: 'Mr. Sudhakar Vishwakarma', facultyAbbr: 'SCV', room: '620' },
  { day: 'Wednesday', startTime: '10:00 AM', endTime: '10:15 AM', slotType: 'Break', isBreak: true, breakTitle: 'SHORT BREAK' },
  { day: 'Wednesday', startTime: '10:15 AM', endTime: '11:15 AM', slotType: 'Practical', batchDetails: [{ batch: 'X', subject: 'FSDM', lab: 'Lab CC', facultyName: 'Mr. Pratharv Surve', facultyAbbr: 'PPS' }, { batch: 'Y', subject: 'FSDM', lab: 'Lab CC', facultyName: 'Mr. Pratharv Surve', facultyAbbr: 'PPS' }] },

  { day: 'Thursday', startTime: '08:00 AM', endTime: '09:00 AM', slotType: 'Lecture', note: 'No lecture' },
  { day: 'Thursday', startTime: '09:00 AM', endTime: '10:00 AM', slotType: 'Lecture', note: 'No lecture' },
  { day: 'Thursday', startTime: '10:00 AM', endTime: '10:15 AM', slotType: 'Break', isBreak: true, breakTitle: 'SHORT BREAK' },
  { day: 'Thursday', startTime: '10:15 AM', endTime: '11:15 AM', slotType: 'Practical', batchDetails: [{ batch: 'X', subject: 'AIADJ', lab: 'Lab 11', facultyName: 'Mr. Jasar Shaikh', facultyAbbr: 'JS' }, { batch: 'Y', subject: 'DNET', lab: 'Lab 10', facultyName: 'Mr. Aman Singh', facultyAbbr: 'ARS' }] },
  { day: 'Thursday', startTime: '12:45 PM', endTime: '01:45 PM', slotType: 'Lecture', subject: 'IKS', facultyName: 'Mrs. Minal Shete', facultyAbbr: 'MVS', room: '620' },

  { day: 'Friday', startTime: '08:00 AM', endTime: '09:00 AM', slotType: 'Lecture', subject: 'AIADJ / AIA', facultyName: 'Mr. Jasar Shaikh', facultyAbbr: 'JS', room: '620' },
  { day: 'Friday', startTime: '09:00 AM', endTime: '10:00 AM', slotType: 'Lecture', subject: 'DNET', facultyName: 'Mr. Aman Singh', facultyAbbr: 'ARS', room: '620' },
  { day: 'Friday', startTime: '10:00 AM', endTime: '10:15 AM', slotType: 'Break', isBreak: true, breakTitle: 'SHORT BREAK' },
  { day: 'Friday', startTime: '10:15 AM', endTime: '11:15 AM', slotType: 'Practical', batchDetails: [{ batch: 'X', subject: 'IoT', lab: 'Lab 12', facultyName: 'Ms. Stephy Thomas', facultyAbbr: 'SET' }, { batch: 'Y', subject: 'EJ', lab: 'Lab 13', facultyName: 'Mrs. Minal Shete', facultyAbbr: 'MVS' }] },
  { day: 'Friday', startTime: '12:45 PM', endTime: '01:45 PM', slotType: 'Lecture', subject: 'IKS', facultyName: 'Mrs. Minal Shete', facultyAbbr: 'MVS', room: '619' },

  { day: 'Saturday', startTime: '08:00 AM', endTime: '02:45 PM', slotType: 'Activities', subject: 'Academic & Co-curricular Activities', note: 'Except 2nd and 4th Saturday' }
];

const defaultCsSlots = [
  { day: 'Monday', startTime: '08:00 AM', endTime: '09:00 AM', slotType: 'Lecture', subject: 'Python', facultyName: 'Dr. Rahul Sharma', facultyAbbr: 'RHS', room: '501' },
  { day: 'Monday', startTime: '09:00 AM', endTime: '10:00 AM', slotType: 'Lecture', subject: 'Data Structures', facultyName: 'Ms. Neha Gupta', facultyAbbr: 'NHG', room: '501' },
  { day: 'Monday', startTime: '10:00 AM', endTime: '10:15 AM', slotType: 'Break', isBreak: true, breakTitle: 'SHORT BREAK' },
  { day: 'Monday', startTime: '10:15 AM', endTime: '11:15 AM', slotType: 'Practical', batchDetails: [{ batch: 'A1', subject: 'Python', lab: 'Lab CS1', facultyName: 'Dr. Rahul Sharma', facultyAbbr: 'RHS' }, { batch: 'A2', subject: 'Data Structures', lab: 'Lab CS2', facultyName: 'Ms. Neha Gupta', facultyAbbr: 'NHG' }] },
  { day: 'Tuesday', startTime: '08:00 AM', endTime: '09:00 AM', slotType: 'Lecture', subject: 'Cyber Security', facultyName: 'Dr. Rahul Sharma', facultyAbbr: 'RHS', room: '501' },
  { day: 'Tuesday', startTime: '09:00 AM', endTime: '10:00 AM', slotType: 'Lecture', subject: 'Web Tech', facultyName: 'Ms. Neha Gupta', facultyAbbr: 'NHG', room: '501' },
  { day: 'Wednesday', startTime: '08:00 AM', endTime: '09:00 AM', slotType: 'Lecture', subject: 'Data Structures', facultyName: 'Ms. Neha Gupta', facultyAbbr: 'NHG', room: '501' },
  { day: 'Thursday', startTime: '08:00 AM', endTime: '09:00 AM', slotType: 'Lecture', subject: 'Python', facultyName: 'Dr. Rahul Sharma', facultyAbbr: 'RHS', room: '501' },
  { day: 'Friday', startTime: '08:00 AM', endTime: '09:00 AM', slotType: 'Lecture', subject: 'Cyber Security', facultyName: 'Dr. Rahul Sharma', facultyAbbr: 'RHS', room: '501' },
  { day: 'Saturday', startTime: '08:00 AM', endTime: '02:45 PM', slotType: 'Activities', subject: 'Academic & Co-curricular Activities', note: 'Except 2nd and 4th Saturday' }
];

const defaultDsSlots = [
  { day: 'Monday', startTime: '08:00 AM', endTime: '09:00 AM', slotType: 'Lecture', subject: 'Big Data', facultyName: 'Dr. Vikas Verma', facultyAbbr: 'VKV', room: '401' },
  { day: 'Monday', startTime: '09:00 AM', endTime: '10:00 AM', slotType: 'Lecture', subject: 'Statistics', facultyName: 'Mrs. Pooja Patil', facultyAbbr: 'PJP', room: '401' },
  { day: 'Monday', startTime: '10:00 AM', endTime: '10:15 AM', slotType: 'Break', isBreak: true, breakTitle: 'SHORT BREAK' },
  { day: 'Monday', startTime: '10:15 AM', endTime: '11:15 AM', slotType: 'Practical', batchDetails: [{ batch: 'D1', subject: 'Big Data', lab: 'Lab DS1', facultyName: 'Dr. Vikas Verma', facultyAbbr: 'VKV' }, { batch: 'D2', subject: 'PowerBI', lab: 'Lab DS2', facultyName: 'Mrs. Pooja Patil', facultyAbbr: 'PJP' }] },
  { day: 'Tuesday', startTime: '08:00 AM', endTime: '09:00 AM', slotType: 'Lecture', subject: 'Deep Learning', facultyName: 'Dr. Vikas Verma', facultyAbbr: 'VKV', room: '401' },
  { day: 'Wednesday', startTime: '08:00 AM', endTime: '09:00 AM', slotType: 'Lecture', subject: 'Big Data', facultyName: 'Dr. Vikas Verma', facultyAbbr: 'VKV', room: '401' },
  { day: 'Thursday', startTime: '08:00 AM', endTime: '09:00 AM', slotType: 'Lecture', subject: 'Deep Learning', facultyName: 'Dr. Vikas Verma', facultyAbbr: 'VKV', room: '401' },
  { day: 'Friday', startTime: '08:00 AM', endTime: '09:00 AM', slotType: 'Lecture', subject: 'Statistics', facultyName: 'Mrs. Pooja Patil', facultyAbbr: 'PJP', room: '401' },
  { day: 'Saturday', startTime: '08:00 AM', endTime: '02:45 PM', slotType: 'Activities', subject: 'Academic & Co-curricular Activities', note: 'Except 2nd and 4th Saturday' }
];

// Fallback Interceptor
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    // If backend connection fails or is offline (e.g. live preview without backend), handle gracefully
    if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error') || !error.response) {
      const config = error.config;
      const url = config.url || '';
      const method = (config.method || 'get').toLowerCase();

      // Handle /settings
      if (url.includes('/settings')) {
        if (method === 'get') {
          const stored = localStorage.getItem('tsdc_settings');
          return { status: 200, data: stored ? JSON.parse(stored) : defaultSettings };
        } else if (method === 'post') {
          const body = typeof config.data === 'string' ? JSON.parse(config.data) : config.data;
          const current = localStorage.getItem('tsdc_settings') ? JSON.parse(localStorage.getItem('tsdc_settings')) : defaultSettings;
          const updated = { ...current, ...body };
          localStorage.setItem('tsdc_settings', JSON.stringify(updated));
          return { status: 200, data: { message: 'Settings saved', settings: updated } };
        }
      }

      // Handle /auth/login
      if (url.includes('/auth/login')) {
        const body = typeof config.data === 'string' ? JSON.parse(config.data) : config.data;
        const email = body?.email || '';
        let role = 'FACULTY';
        let name = 'TSDC Faculty';
        if (email.includes('admin')) {
          role = 'ADMIN';
          name = 'TSDC Admin';
        } else if (email.includes('jasar')) {
          name = 'Mr. Jasar Shaikh';
        } else if (email.includes('aman')) {
          name = 'Mr. Aman Singh';
        }
        const user = { _id: 'u1', name, email, role, token: 'mock-jwt-token' };
        localStorage.setItem('token', user.token);
        localStorage.setItem('user', JSON.stringify(user));
        return { status: 200, data: user };
      }

      // Handle /timetable
      if (url.includes('/timetable')) {
        const params = new URLSearchParams(url.split('?')[1] || '');
        const dept = params.get('department') || 'B.Sc. IT';
        const date = params.get('date');

        let slots = defaultItSlots;
        let className = 'T.Y. B.Sc. (IT)';
        let div = 'C';
        let room = '620';

        if (dept.includes('CS')) {
          slots = defaultCsSlots;
          className = 'T.Y. B.Sc. (CS)';
          div = 'A';
          room = '501';
        } else if (dept.includes('DS')) {
          slots = defaultDsSlots;
          className = 'T.Y. B.Sc. (DS)';
          div = 'A';
          room = '401';
        }

        // Check for local stored timetable override
        const localKey = `tsdc_tt_${dept}_${date || 'master'}`;
        const customTT = localStorage.getItem(localKey);
        if (customTT) {
          return { status: 200, data: JSON.parse(customTT) };
        }

        const resData = {
          _id: `tt_${dept}`,
          department: dept,
          academicYear: '2026-27',
          class: className,
          division: div,
          roomNo: room,
          effectiveFrom: '01/07/2026',
          classInCharge: dept.includes('CS') ? 'Dr. Rahul Sharma' : (dept.includes('DS') ? 'Dr. Vikas Verma' : 'Mr. Jasar Shaikh'),
          slots,
          substitutions: [],
          workloadSummary: []
        };
        return { status: 200, data: resData };
      }

      // Handle /faculty
      if (url.includes('/faculty')) {
        return { status: 200, data: defaultFacultyList };
      }

      // Handle /departments
      if (url.includes('/departments')) {
        return {
          status: 200,
          data: [
            { code: 'IT', name: 'B.Sc. IT', academicYears: ['2026-27'], classes: ['T.Y. B.Sc. (IT)'], divisions: ['C'], rooms: ['620'] },
            { code: 'CS', name: 'B.Sc. CS', academicYears: ['2026-27'], classes: ['T.Y. B.Sc. (CS)'], divisions: ['A'], rooms: ['501'] },
            { code: 'DS', name: 'B.Sc. DS', academicYears: ['2026-27'], classes: ['T.Y. B.Sc. (DS)'], divisions: ['A'], rooms: ['401'] }
          ]
        };
      }

      // Default fallback empty array or object
      return { status: 200, data: [] };
    }

    return Promise.reject(error);
  }
);

export default API;
