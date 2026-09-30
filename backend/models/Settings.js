const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  key: { type: String, default: 'college_info', unique: true },
  collegeName: { type: String, default: 'Thakur Shyamnarayan Degree College' },
  collegeCode: { type: String, default: 'TSDC' },
  subtitle: { type: String, default: 'Updated Daily Timetable' },
  address: { type: String, default: 'Kandivali East, Mumbai' },
  logoUrl: { type: String, default: '/logo.png' }
}, { timestamps: true });

module.exports = mongoose.model('Settings', settingsSchema);
