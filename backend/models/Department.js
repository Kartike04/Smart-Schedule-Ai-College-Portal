const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true }, // 'IT', 'CS', 'DS'
  name: { type: String, required: true }, // 'B.Sc. IT', 'B.Sc. CS', 'B.Sc. DS'
  academicYears: [{ type: String }],
  classes: [{ type: String }],
  divisions: [{ type: String }],
  rooms: [{ type: String }]
}, { timestamps: true });

module.exports = mongoose.model('Department', departmentSchema);
