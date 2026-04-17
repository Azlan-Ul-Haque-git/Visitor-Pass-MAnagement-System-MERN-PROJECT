const mongoose = require('mongoose');

const visitorSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  phone: { type: String, required: true, trim: true },
  photo: { type: String },
  company: { type: String, trim: true },
  idType: { type: String, enum: ['Aadhar', 'PAN', 'Passport', 'DrivingLicense', 'Other'], default: 'Other' },
  idNumber: { type: String, trim: true },
  address: { type: String, trim: true },
  purpose: { type: String, trim: true },
  hostEmployee: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['pre-registered', 'checked-in', 'checked-out', 'cancelled'], default: 'pre-registered' },
  blacklisted: { type: Boolean, default: false },
  blacklistReason: { type: String },
  visitCount: { type: Number, default: 0 },
  lastVisit: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Visitor', visitorSchema);
