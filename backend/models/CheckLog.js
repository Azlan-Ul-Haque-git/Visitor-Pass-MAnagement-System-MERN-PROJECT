const mongoose = require('mongoose');

const checkLogSchema = new mongoose.Schema({
  visitor: { type: mongoose.Schema.Types.ObjectId, ref: 'Visitor', required: true },
  pass: { type: mongoose.Schema.Types.ObjectId, ref: 'Pass', required: true },
  action: { type: String, enum: ['check-in', 'check-out'], required: true },
  timestamp: { type: Date, default: Date.now },
  gate: { type: String, default: 'Main Gate' },
  performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  scanMethod: { type: String, enum: ['qr', 'manual'], default: 'qr' },
  notes: { type: String },
  location: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('CheckLog', checkLogSchema);
