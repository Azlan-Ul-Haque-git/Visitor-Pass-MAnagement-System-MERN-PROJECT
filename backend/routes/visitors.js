const express = require('express');
const router = express.Router();
const Visitor = require('../models/Visitor');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

// GET all visitors
router.get('/', protect, async (req, res) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (search) filter.$or = [
      { name: new RegExp(search, 'i') },
      { email: new RegExp(search, 'i') },
      { phone: new RegExp(search, 'i') },
      { company: new RegExp(search, 'i') }
    ];
    const skip = (page - 1) * limit;
    const [visitors, total] = await Promise.all([
      Visitor.find(filter).populate('hostEmployee', 'name email department').sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      Visitor.countDocuments(filter)
    ]);
    res.json({ success: true, count: visitors.length, total, page: parseInt(page), visitors });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET single visitor
router.get('/:id', protect, async (req, res) => {
  try {
    const visitor = await Visitor.findById(req.params.id).populate('hostEmployee', 'name email department');
    if (!visitor) return res.status(404).json({ success: false, message: 'Visitor not found.' });
    res.json({ success: true, visitor });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST create visitor
router.post('/', protect, async (req, res) => {
  try {
    const visitor = await Visitor.create(req.body);
    res.status(201).json({ success: true, visitor });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT update visitor
router.put('/:id', protect, async (req, res) => {
  try {
    const visitor = await Visitor.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!visitor) return res.status(404).json({ success: false, message: 'Visitor not found.' });
    res.json({ success: true, visitor });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE visitor
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    await Visitor.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Visitor deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST upload photo
router.post('/:id/photo', protect, upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded.' });
    const photoUrl = `/uploads/photos/${req.file.filename}`;
    const visitor = await Visitor.findByIdAndUpdate(req.params.id, { photo: photoUrl }, { new: true });
    res.json({ success: true, visitor });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT blacklist
router.put('/:id/blacklist', protect, authorize('admin', 'security'), async (req, res) => {
  try {
    const { blacklisted, reason } = req.body;
    const visitor = await Visitor.findByIdAndUpdate(req.params.id, 
      { blacklisted, blacklistReason: reason }, { new: true });
    res.json({ success: true, visitor });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
