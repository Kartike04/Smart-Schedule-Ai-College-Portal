const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  facultyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty', required: true },
  facultyName: { type: String, required: true },
  department: { type: String, required: true },
  date: { type: String, required: true }, // YYYY-MM-DD
  time: { type: String, required: true }, // e.g. '09:02 AM'
  status: { type: String, enum: ['Present', 'Absent', 'On Leave'], default: 'Present' }
}, { timestamps: true });

// Prevent duplicate attendance records for the same faculty on the same day
attendanceSchema.index({ facultyId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
