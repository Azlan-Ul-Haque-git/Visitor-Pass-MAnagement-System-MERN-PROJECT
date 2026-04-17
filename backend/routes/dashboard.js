const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Visitor = require('../models/Visitor');
const Appointment = require('../models/Appointment');
const Pass = require('../models/Pass');
const CheckLog = require('../models/CheckLog');
const { protect } = require('../middleware/auth');

router.get('/stats', protect, async (req, res) => {
  try {
    const today = new Date(); today.setHours(0,0,0,0);
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
    const weekAgo = new Date(today); weekAgo.setDate(weekAgo.getDate() - 7);

    const [
      totalVisitors, todayVisitors, checkedIn,
      totalPasses, activePasses,
      pendingAppointments, todayAppointments,
      totalUsers,
      weeklyCheckins
    ] = await Promise.all([
      Visitor.countDocuments(),
      Visitor.countDocuments({ createdAt: { $gte: today, $lt: tomorrow } }),
      Visitor.countDocuments({ status: 'checked-in' }),
      Pass.countDocuments(),
      Pass.countDocuments({ status: 'active' }),
      Appointment.countDocuments({ status: 'pending' }),
      Appointment.countDocuments({ scheduledDate: { $gte: today, $lt: tomorrow } }),
      User.countDocuments({ isActive: true }),
      CheckLog.aggregate([
        { $match: { timestamp: { $gte: weekAgo }, action: 'check-in' } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ])
    ]);

    // Recent activity
    const recentActivity = await CheckLog.find()
      .populate('visitor', 'name company photo').populate('pass', 'passNumber').populate('performedBy', 'name')
      .sort({ timestamp: -1 }).limit(10);

    // Monthly stats
    const monthlyStats = await CheckLog.aggregate([
      { $match: { timestamp: { $gte: new Date(new Date().getFullYear(), new Date().getMonth() - 5, 1) } } },
      { $group: { 
        _id: { month: { $month: '$timestamp' }, year: { $year: '$timestamp' }, action: '$action' },
        count: { $sum: 1 }
      }},
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.json({
      success: true,
      stats: { totalVisitors, todayVisitors, checkedIn, totalPasses, activePasses, pendingAppointments, todayAppointments, totalUsers },
      weeklyCheckins,
      recentActivity,
      monthlyStats
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
