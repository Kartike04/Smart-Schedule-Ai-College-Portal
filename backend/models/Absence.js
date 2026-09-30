const mongoose = require('mongoose');

const absenceSchema = new mongoose.Schema({
  department: { type: String, required: true },
  facultyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty', required: true },
  facultyName: { type: String, required: true },
  facultyAbbr: { type: String },
  date: { type: String, required: true }, // YYYY-MM-DD
  reason: { type: String, default: 'Absent / On Leave' },
  status: { type: String, enum: ['Reported', 'Substituted', 'Resolved'], default: 'Reported' }
}, { timestamps: true });

module.exports = mongoose.model('Absence', absenceSchema);
