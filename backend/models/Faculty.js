const mongoose = require('mongoose');

const facultySchema = new mongoose.Schema({
  name: { type: String, required: true },
  abbreviation: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  employeeId: { type: String, required: true, unique: true },
  department: { type: String, required: true }, // e.g. 'B.Sc. IT'
  subjects: [{ type: String }],
  skills: [{ type: String }],
  phone: { type: String, default: '' },
  status: { type: String, enum: ['Active', 'On Leave', 'Inactive'], default: 'Active' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Faculty', facultySchema);
