const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const Visitor = require('../models/Visitor');
const { protect, authorize } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

// GET all appointments
router.get('/', protect, async (req, res) => {
  try {
    const { status, host, date, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (host) filter.host = host;
    else if (req.user.role === 'employee') filter.host = req.user._id;
    if (date) {
      const d = new Date(date);
      filter.scheduledDate = { $gte: d, $lt: new Date(d.getTime() + 86400000) };
    }
    const skip = (page - 1) * limit;
    const [appointments, total] = await Promise.all([
      Appointment.find(filter)
        .populate('visitor', 'name email phone company photo')
        .populate('host', 'name email department')
        .populate('approvedBy', 'name')
        .sort({ scheduledDate: -1 }).skip(skip).limit(parseInt(limit)),
      Appointment.countDocuments(filter)
    ]);
    res.json({ success: true, count: appointments.length, total, appointments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET today's appointments
router.get('/today', protect, async (req, res) => {
  try {
    const today = new Date(); today.setHours(0,0,0,0);
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
    const filter = { scheduledDate: { $gte: today, $lt: tomorrow } };
    if (req.user.role === 'employee') filter.host = req.user._id;
    const appointments = await Appointment.find(filter)
      .populate('visitor', 'name email phone company photo status')
      .populate('host', 'name email department');
    res.json({ success: true, appointments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET single appointment
router.get('/:id', protect, async (req, res) => {
  try {
    const appt = await Appointment.findById(req.params.id)
      .populate('visitor').populate('host', 'name email department').populate('approvedBy', 'name');
    if (!appt) return res.status(404).json({ success: false, message: 'Appointment not found.' });
    res.json({ success: true, appointment: appt });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST create appointment
router.post('/', protect, async (req, res) => {
  try {
    const { visitorData, ...appointmentData } = req.body;
    let visitor;
    if (visitorData) {
      visitor = await Visitor.findOne({ email: visitorData.email });
      if (!visitor) visitor = await Visitor.create(visitorData);
    } else {
      visitor = await Visitor.findById(appointmentData.visitor);
    }
    if (!visitor) return res.status(400).json({ success: false, message: 'Visitor info required.' });
    
    const appt = await Appointment.create({
      ...appointmentData,
      visitor: visitor._id,
      host: appointmentData.host || req.user._id,
      inviteToken: uuidv4()
    });
    const populated = await Appointment.findById(appt._id)
      .populate('visitor').populate('host', 'name email department');
    res.status(201).json({ success: true, appointment: populated });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT update appointment
router.put('/:id', protect, async (req, res) => {
  try {
    const appt = await Appointment.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('visitor').populate('host', 'name email department');
    if (!appt) return res.status(404).json({ success: false, message: 'Appointment not found.' });
    res.json({ success: true, appointment: appt });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT approve/reject appointment
router.put('/:id/status', protect, authorize('admin', 'security', 'employee'), async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;
    const update = { status, approvedBy: req.user._id, approvedAt: new Date() };
    if (rejectionReason) update.rejectionReason = rejectionReason;
    const appt = await Appointment.findByIdAndUpdate(req.params.id, update, { new: true })
      .populate('visitor').populate('host', 'name email department');
    if (!appt) return res.status(404).json({ success: false, message: 'Appointment not found.' });
    res.json({ success: true, appointment: appt });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE appointment
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    await Appointment.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Appointment deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
