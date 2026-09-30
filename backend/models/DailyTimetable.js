const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema({
  day: { type: String, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  slotType: { 
    type: String, 
    enum: ['Lecture', 'Practical', 'Break', 'Activities'], 
    default: 'Lecture' 
  },
  isBreak: { type: Boolean, default: false },
  breakTitle: { type: String },
  subject: { type: String },
  facultyName: { type: String },
  facultyAbbr: { type: String },
  facultyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty' },
  room: { type: String },
  batchDetails: Array,
  note: { type: String }
});

const dailyTimetableSchema = new mongoose.Schema({
  department: { type: String, required: true },
  date: { type: String, required: true }, // Format: YYYY-MM-DD
  academicYear: { type: String, default: '2026-27' },
  class: { type: String, default: 'T.Y. B.Sc. (IT)' },
  division: { type: String, default: 'C' },
  roomNo: { type: String, default: '620' },
  slots: [slotSchema]
}, { timestamps: true });

dailyTimetableSchema.index({ department: 1, date: 1, class: 1, division: 1 }, { unique: true });

module.exports = mongoose.model('DailyTimetable', dailyTimetableSchema);
