const mongoose = require('mongoose');

const substitutionSchema = new mongoose.Schema({
  absenceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Absence', required: false },
  department: { type: String, required: true },
  date: { type: String, required: true }, // YYYY-MM-DD
  day: { type: String, required: true },  // e.g. 'Tuesday'
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  originalFacultyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty', required: false },
  originalFacultyName: { type: String, required: true },
  originalFacultyAbbr: { type: String },
  substituteFacultyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty', required: true },
  substituteFacultyName: { type: String, required: true },
  substituteFacultyAbbr: { type: String, required: true },
  subject: { type: String, required: true },
  class: { type: String, default: 'T.Y. B.Sc. (IT)' },
  division: { type: String, default: 'C' },
  room: { type: String, default: '620' },
  matchScore: { type: Number, default: 0 },
  scoreBreakdown: {
    available: { type: Number, default: 0 },
    sameDept: { type: Number, default: 0 },
    subjectSkillMatch: { type: Number, default: 0 },
    lowWorkload: { type: Number, default: 0 }
  },
  assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Substitution', substitutionSchema);
