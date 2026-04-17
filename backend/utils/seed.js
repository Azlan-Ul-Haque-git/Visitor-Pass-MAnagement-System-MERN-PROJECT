const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '../.env' });

const User = require('../models/User');
const Visitor = require('../models/Visitor');
const Appointment = require('../models/Appointment');
const Pass = require('../models/Pass');
const CheckLog = require('../models/CheckLog');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/college_entry_db';

const seed = async () => {
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected to MongoDB');

  await Promise.all([
    User.deleteMany(),
    Visitor.deleteMany(),
    Appointment.deleteMany(),
    Pass.deleteMany(),
    CheckLog.deleteMany()
  ]);

  console.log('🧹 Database cleaned');

  // ================= USERS =================
  const users = await User.insertMany([
    {
      name: 'Principal Sir',
      email: 'principal@college.com',
      password: await bcrypt.hash('principal123', 12),
      role: 'admin',
      department: 'Administration',
      phone: '9000000001',
      isActive: true
    },
    {
      name: 'Gate Guard',
      email: 'guard@college.com',
      password: await bcrypt.hash('guard123', 12),
      role: 'security',
      department: 'Security',
      phone: '9000000002',
      isActive: true
    },
    {
      name: 'HOD IT - Jyoti Gupta',
      email: 'hodit@college.com',
      password: await bcrypt.hash('hod123', 12),
      role: 'staff',
      department: 'IT',
      phone: '9000000003',
      isActive: true
    }
  ]);

  console.log('👨‍🏫 Users created');

  // ================= VISITORS =================
  const visitors = await Visitor.insertMany([
    {
      name: 'Rahul Sharma',
      type: 'student',
      studentId: 'IT2024001',
      department: 'IT',
      phone: '9111111111',
      purpose: 'Regular Entry'
    },
    {
      name: 'Priya Patel',
      type: 'parent',
      phone: '9222222222',
      purpose: 'Meet Faculty'
    },
    {
      name: 'External Guest',
      type: 'guest',
      phone: '9333333333',
      purpose: 'Seminar'
    }
  ]);

  console.log('🎓 Visitors created');

  // ================= APPOINTMENTS =================
  const today = new Date();

  const appointments = await Appointment.insertMany([
    {
      visitor: visitors[1]._id,
      host: users[2]._id,
      scheduledDate: today,
      purpose: 'Parent Meeting',
      status: 'approved',
      approvedBy: users[0]._id
    },
    {
      visitor: visitors[2]._id,
      host: users[2]._id,
      scheduledDate: today,
      purpose: 'Guest Lecture',
      status: 'approved',
      approvedBy: users[0]._id
    }
  ]);

  console.log('📅 Appointments created');

  // ================= PASSES =================
  const QRCode = require('qrcode');

  const passNumber = `COL-${Date.now()}`;

  const qr = await QRCode.toDataURL(JSON.stringify({
    passNumber,
    visitorId: visitors[0]._id
  }));

  const passes = await Pass.insertMany([
    {
      passNumber,
      visitor: visitors[0]._id,
      type: 'student-id',
      issuedBy: users[1]._id,
      validFrom: today,
      validUntil: new Date(today.getTime() + 8 * 3600000),
      qrCode: qr,
      status: 'active',
      accessAreas: ['Campus', 'Library']
    }
  ]);

  console.log('🎫 Passes created');

  // ================= CHECK LOG =================
  await CheckLog.insertMany([
    {
      visitor: visitors[0]._id,
      pass: passes[0]._id,
      action: 'check-in',
      gate: 'Main Gate',
      performedBy: users[1]._id,
      scanMethod: 'qr',
      timestamp: new Date()
    }
  ]);

  console.log('🚪 Entry logs created');

  console.log('\n🎉 SEED COMPLETE (COLLEGE SYSTEM READY)');
  console.log('-------------------------------------');
  console.log('Principal: principal@college.com / principal123');
  console.log('Guard:     guard@college.com / guard123');
  console.log('Staff:     hodit@college.com / hod123');
  console.log('-------------------------------------\n');

  await mongoose.disconnect();
};

seed().catch(err => {
  console.error('❌ Seed error:', err);
  process.exit(1);
});