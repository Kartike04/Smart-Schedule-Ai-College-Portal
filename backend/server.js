const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const seedDatabase = require('./seed/seedData');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect DB & Seed initial data
connectDB().then(() => {
  seedDatabase();
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/departments', require('./routes/departments'));
app.use('/api/faculty', require('./routes/faculty'));
app.use('/api/subjects', require('./routes/subjects'));
app.use('/api/timetable', require('./routes/timetable'));
app.use('/api/absence', require('./routes/absence'));
app.use('/api/substitute', require('./routes/substitute'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/excel', require('./routes/excel'));
app.use('/api/settings', require('./routes/settings'));

// Basic health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Smart Schedule AI Backend Service is Running' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Smart Schedule AI Backend Server running on port ${PORT}`);
});
