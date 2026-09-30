const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

// Import backend routes
const authRoutes = require('../backend/routes/auth');
const departmentRoutes = require('../backend/routes/departments');
const facultyRoutes = require('../backend/routes/faculty');
const subjectRoutes = require('../backend/routes/subjects');
const timetableRoutes = require('../backend/routes/timetable');
const absenceRoutes = require('../backend/routes/absence');
const substituteRoutes = require('../backend/routes/substitute');
const attendanceRoutes = require('../backend/routes/attendance');
const excelRoutes = require('../backend/routes/excel');
const settingsRoutes = require('../backend/routes/settings');
const seedDatabase = require('../backend/seed/seedData');

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.log('No MONGO_URI in process.env; running serverless API mode.');
    return;
  }
  try {
    const db = await mongoose.connect(mongoUri);
    isConnected = db.connections[0].readyState;
    console.log('MongoDB connected successfully on Vercel Serverless');
    await seedDatabase();
  } catch (err) {
    console.error('MongoDB connection error on Vercel Serverless:', err.message);
  }
};

app.use(async (req, res, next) => {
  await connectDB();
  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/faculty', facultyRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/timetable', timetableRoutes);
app.use('/api/absence', absenceRoutes);
app.use('/api/substitute', substituteRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/excel', excelRoutes);
app.use('/api/settings', settingsRoutes);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Smart Schedule AI Full-Stack Serverless Backend Engine is Running',
    timestamp: new Date().toISOString()
  });
});

module.exports = app;
