const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  visitor: { type: mongoose.Schema.Types.ObjectId, ref: 'Visitor', required: true },
  host: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  scheduledDate: { type: Date, required: true },
  scheduledTime: { type: String, required: true },
  purpose: { type: String, required: true, trim: true },
  department: { type: String, trim: true },
  location: { type: String, trim: true },
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected', 'completed', 'cancelled'], 
    default: 'pending' 
  },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvedAt: { type: Date },
  rejectionReason: { type: String },
  notes: { type: String },
  notificationSent: { type: Boolean, default: false },
  inviteToken: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Appointment', appointmentSchema);
