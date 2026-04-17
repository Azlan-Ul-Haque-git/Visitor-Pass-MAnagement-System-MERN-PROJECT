const express = require('express');
const router = express.Router();
const QRCode = require('qrcode');
const Pass = require('../models/Pass');
const Visitor = require('../models/Visitor');
const CheckLog = require('../models/CheckLog');
const { protect, authorize } = require('../middleware/auth');

const generatePassNumber = () => {
  const d = new Date();
  return `VP-${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}-${Math.random().toString(36).substring(2,7).toUpperCase()}`;
};

// GET all passes
router.get('/', protect, async (req, res) => {
  try {
    const { status, visitor, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (visitor) filter.visitor = visitor;
    const skip = (page - 1) * limit;
    const [passes, total] = await Promise.all([
      Pass.find(filter)
        .populate('visitor', 'name email phone company photo')
        .populate('issuedBy', 'name')
        .populate('host', 'name department')
        .sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      Pass.countDocuments(filter)
    ]);
    res.json({ success: true, count: passes.length, total, passes });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET single pass
router.get('/:id', protect, async (req, res) => {
  try {
    const pass = await Pass.findById(req.params.id)
      .populate('visitor').populate('issuedBy', 'name').populate('host', 'name department');
    if (!pass) return res.status(404).json({ success: false, message: 'Pass not found.' });
    res.json({ success: true, pass });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET pass by passNumber (for QR scan verification)
router.get('/verify/:passNumber', protect, async (req, res) => {
  try {
    const pass = await Pass.findOne({ passNumber: req.params.passNumber })
      .populate('visitor').populate('issuedBy', 'name').populate('host', 'name department');
    if (!pass) return res.status(404).json({ success: false, message: 'Invalid pass.' });
    
    // Check expiry
    if (new Date() > new Date(pass.validUntil)) {
      await Pass.findByIdAndUpdate(pass._id, { status: 'expired' });
      return res.json({ success: true, valid: false, reason: 'Pass expired', pass });
    }
    if (pass.status === 'revoked') return res.json({ success: true, valid: false, reason: 'Pass revoked', pass });
    
    // Get latest check log
    const lastLog = await CheckLog.findOne({ pass: pass._id }).sort({ timestamp: -1 });
    res.json({ success: true, valid: true, pass, lastAction: lastLog?.action });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST issue pass
router.post('/', protect, authorize('admin', 'security'), async (req, res) => {
  try {
    const { visitorId, appointmentId, hostId, validHours = 8, purpose, accessAreas, vehicleNumber, remarks } = req.body;
    
    const visitor = await Visitor.findById(visitorId);
    if (!visitor) return res.status(404).json({ success: false, message: 'Visitor not found.' });
    if (visitor.blacklisted) return res.status(403).json({ success: false, message: 'Visitor is blacklisted.' });

    const passNumber = generatePassNumber();
    const validFrom = new Date();
    const validUntil = new Date(validFrom.getTime() + validHours * 60 * 60 * 1000);

    // Generate QR
    const qrData = JSON.stringify({ passNumber, visitorId, validUntil: validUntil.toISOString() });
    const qrCode = await QRCode.toDataURL(qrData, { width: 200, margin: 1 });

    const pass = await Pass.create({
      passNumber, visitor: visitorId, appointment: appointmentId,
      issuedBy: req.user._id, host: hostId,
      qrCode, validFrom, validUntil,
      status: 'active', purpose, accessAreas, vehicleNumber, remarks
    });

    // Update visitor
    await Visitor.findByIdAndUpdate(visitorId, { 
      status: 'checked-in',
      $inc: { visitCount: 1 },
      lastVisit: new Date()
    });

    // Auto check-in log
    await CheckLog.create({
      visitor: visitorId, pass: pass._id,
      action: 'check-in', performedBy: req.user._id,
      gate: 'Main Gate', scanMethod: 'manual'
    });

    const populated = await Pass.findById(pass._id)
      .populate('visitor').populate('issuedBy', 'name').populate('host', 'name department');
    
    res.status(201).json({ success: true, pass: populated });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT revoke pass
router.put('/:id/revoke', protect, authorize('admin', 'security'), async (req, res) => {
  try {
    const pass = await Pass.findByIdAndUpdate(req.params.id, { status: 'revoked' }, { new: true });
    if (!pass) return res.status(404).json({ success: false, message: 'Pass not found.' });
    res.json({ success: true, pass });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
