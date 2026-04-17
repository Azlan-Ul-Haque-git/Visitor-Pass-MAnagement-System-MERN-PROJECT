const express = require('express');
const router = express.Router();
const CheckLog = require('../models/CheckLog');
const Pass = require('../models/Pass');
const Visitor = require('../models/Visitor');
const { protect, authorize } = require('../middleware/auth');

// GET all logs
router.get('/', protect, async (req, res) => {
  try {
    const { action, gate, date, visitor, page = 1, limit = 30 } = req.query;
    const filter = {};
    if (action) filter.action = action;
    if (gate) filter.gate = gate;
    if (visitor) filter.visitor = visitor;
    if (date) {
      const d = new Date(date); d.setHours(0,0,0,0);
      const nd = new Date(d); nd.setDate(nd.getDate() + 1);
      filter.timestamp = { $gte: d, $lt: nd };
    }
    const skip = (page - 1) * limit;
    const [logs, total] = await Promise.all([
      CheckLog.find(filter)
        .populate('visitor', 'name email phone company photo')
        .populate('pass', 'passNumber validUntil')
        .populate('performedBy', 'name')
        .sort({ timestamp: -1 }).skip(skip).limit(parseInt(limit)),
      CheckLog.countDocuments(filter)
    ]);
    res.json({ success: true, count: logs.length, total, logs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST log check-in/out via QR scan
router.post('/scan', protect, authorize('admin', 'security'), async (req, res) => {
  try {
    const { passNumber, gate, notes } = req.body;
    const pass = await Pass.findOne({ passNumber }).populate('visitor');
    if (!pass) return res.status(404).json({ success: false, message: 'Invalid pass number.' });
    if (pass.status === 'revoked') return res.status(400).json({ success: false, message: 'Pass is revoked.' });
    if (new Date() > new Date(pass.validUntil)) {
      await Pass.findByIdAndUpdate(pass._id, { status: 'expired' });
      return res.status(400).json({ success: false, message: 'Pass has expired.' });
    }
    if (pass.visitor.blacklisted) return res.status(403).json({ success: false, message: 'Visitor is blacklisted.' });

    // Determine action (toggle)
    const lastLog = await CheckLog.findOne({ pass: pass._id }).sort({ timestamp: -1 });
    const action = (!lastLog || lastLog.action === 'check-out') ? 'check-in' : 'check-out';

    const log = await CheckLog.create({
      visitor: pass.visitor._id, pass: pass._id,
      action, gate: gate || 'Main Gate',
      performedBy: req.user._id, scanMethod: 'qr', notes
    });

    // Update visitor status
    await Visitor.findByIdAndUpdate(pass.visitor._id, {
      status: action === 'check-in' ? 'checked-in' : 'checked-out'
    });

    const populated = await CheckLog.findById(log._id)
      .populate('visitor', 'name email photo company').populate('pass', 'passNumber').populate('performedBy', 'name');
    res.status(201).json({ success: true, log: populated, action });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// POST manual check-out
router.post('/checkout/:passId', protect, authorize('admin', 'security'), async (req, res) => {
  try {
    const pass = await Pass.findById(req.params.passId).populate('visitor');
    if (!pass) return res.status(404).json({ success: false, message: 'Pass not found.' });
    
    const log = await CheckLog.create({
      visitor: pass.visitor._id, pass: pass._id,
      action: 'check-out', gate: req.body.gate || 'Main Gate',
      performedBy: req.user._id, scanMethod: 'manual', notes: req.body.notes
    });

    await Visitor.findByIdAndUpdate(pass.visitor._id, { status: 'checked-out' });
    await Pass.findByIdAndUpdate(pass._id, { status: 'used' });

    res.status(201).json({ success: true, log });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

module.exports = router;
