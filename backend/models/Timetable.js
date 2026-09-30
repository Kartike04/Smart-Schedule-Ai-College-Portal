const mongoose = require('mongoose');

const batchDetailSchema = new mongoose.Schema({
  batch: { type: String, required: true }, // 'X' or 'Y'
  subject: { type: String, required: true },
  lab: { type: String },
  facultyName: { type: String },
  facultyAbbr: { type: String },
  facultyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty' }
}, { _id: false });

const slotSchema = new mongoose.Schema({
  day: { 
    type: String, 
    required: true,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] 
  },
  startTime: { type: String, required: true }, // e.g. '08:00 AM'
  endTime: { type: String, required: true },   // e.g. '09:00 AM'
  slotType: { 
    type: String, 
    enum: ['Lecture', 'Practical', 'Break', 'Activities'], 
    default: 'Lecture' 
  },
  isBreak: { type: Boolean, default: false },
  breakTitle: { type: String }, // 'SHORT BREAK', 'LUNCH BREAK'
  subject: { type: String },
  facultyName: { type: String },
  facultyAbbr: { type: String },
  facultyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty' },
  room: { type: String },
  batchDetails: [batchDetailSchema],
  note: { type: String }
});

const timetableSchema = new mongoose.Schema({
  department: { type: String, required: true }, // e.g. 'B.Sc. IT'
  academicYear: { type: String, required: true }, // '2026-27'
  class: { type: String, required: true },        // 'T.Y. B.Sc. (IT)'
  division: { type: String, required: true },     // 'C'
  roomNo: { type: String, default: '620' },
  effectiveFrom: { type: String, default: '01/07/2026' },
  classInCharge: { type: String, default: 'Mr. Jasar Shaikh' },
  slots: [slotSchema]
}, { timestamps: true });

module.exports = mongoose.model('Timetable', timetableSchema);
