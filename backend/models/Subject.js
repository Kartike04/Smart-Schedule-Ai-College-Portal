const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
  code: { type: String, required: true },
  name: { type: String, required: true },
  department: { type: String, required: true },
  type: { type: String, enum: ['Theory', 'Practical', 'Theory & Practical'], default: 'Theory' }
}, { timestamps: true });

module.exports = mongoose.model('Subject', subjectSchema);
