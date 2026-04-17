const mongoose = require('mongoose');

const passSchema = new mongoose.Schema({
  passNumber: { type: String, unique: true, required: true },
  visitor: { type: mongoose.Schema.Types.ObjectId, ref: 'Visitor', required: true },
  appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
  issuedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  host: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  qrCode: { type: String },           // base64 QR data
  validFrom: { type: Date, required: true },
  validUntil: { type: Date, required: true },
  status: { 
    type: String, 
    enum: ['active', 'used', 'expired', 'revoked'], 
    default: 'active' 
  },
  accessAreas: [{ type: String }],
  purpose: { type: String },
  vehicleNumber: { type: String },
  remarks: { type: String },
  pdfPath: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Pass', passSchema);
