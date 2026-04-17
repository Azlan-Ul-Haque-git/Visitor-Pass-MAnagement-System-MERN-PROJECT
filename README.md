# 🛡️ Visitor Pass Management System

A full-stack **MERN** (MongoDB, Express, React, Node.js) application to digitize and streamline visitor management for organizations. Features role-based access, QR-code passes, appointment scheduling, real-time check-in/out, and analytics dashboards.

---

## 📋 Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Running the App](#running-the-app)
- [Demo Credentials](#demo-credentials)
- [User Roles & Permissions](#user-roles--permissions)
- [API Endpoints](#api-endpoints)
- [Screenshots](#screenshots)

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔐 JWT Auth | Secure login with role-based access control |
| 👥 Visitor Registration | Register visitors with photo, ID, contact details |
| 📅 Appointments | Schedule and approve/reject pre-registration requests |
| 🪪 QR Pass Issuance | Generate unique passes with embedded QR codes |
| 📷 QR Scan & Verify | Security desk verifies and logs check-in/out via QR |
| 📋 Check Logs | Full audit trail of all visitor movements |
| 📊 Dashboard | Live stats, charts, recent activity feed |
| ⚙️ User Management | Admin creates/manages staff accounts |
| 📥 CSV Export | Export check logs to CSV |
| 🚫 Blacklist | Flag/unflag visitors from future entry |
| 📱 Responsive UI | Works on desktop and mobile |

---

## 🛠️ Tech Stack

**Backend**
- Node.js + Express.js
- MongoDB + Mongoose ODM
- JWT (JSON Web Tokens) for auth
- `qrcode` library for QR generation
- `multer` for file uploads
- `bcryptjs` for password hashing
- `helmet`, `cors`, `morgan`

**Frontend**
- React 18 + React Router v6
- `axios` for HTTP requests
- `recharts` for charts
- `react-hot-toast` for notifications
- Custom CSS (Catppuccin dark theme)
- Google Fonts (Space Grotesk + JetBrains Mono)

---

## 📁 Project Structure

```
visitor-pass-system/
├── backend/
│   ├── models/
│   │   ├── User.js
│   │   ├── Visitor.js
│   │   ├── Appointment.js
│   │   ├── Pass.js
│   │   └── CheckLog.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── visitors.js
│   │   ├── appointments.js
│   │   ├── passes.js
│   │   ├── checklogs.js
│   │   └── dashboard.js
│   ├── middleware/
│   │   ├── auth.js        # JWT protect + authorize
│   │   └── upload.js      # Multer config
│   ├── utils/
│   │   └── seed.js        # Demo data seeder
│   ├── uploads/           # Photo storage (auto-created)
│   ├── .env.example
│   ├── package.json
│   └── server.js
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/
    │   │   └── shared/
    │   │       └── Layout.js   # Sidebar + nav
    │   ├── context/
    │   │   └── AuthContext.js
    │   ├── pages/
    │   │   ├── Login.js
    │   │   ├── Dashboard.js
    │   │   ├── Visitors.js
    │   │   ├── VisitorDetail.js
    │   │   ├── Appointments.js
    │   │   ├── Passes.js
    │   │   ├── ScanPass.js
    │   │   ├── CheckLogs.js
    │   │   ├── Users.js
    │   │   ├── Profile.js
    │   │   └── NotFound.js
    │   ├── utils/
    │   │   └── api.js          # Axios instance
    │   ├── App.js
    │   ├── index.js
    │   └── index.css           # Global styles + theme
    └── package.json
```

---

## ✅ Prerequisites

Install these before starting:

| Tool | Version | Download |
|---|---|---|
| **Node.js** | 18+ | https://nodejs.org |
| **npm** | 9+ | (comes with Node) |
| **MongoDB** | 6+ | https://www.mongodb.com/try/download/community |
| **Git** | any | https://git-scm.com |

> **MongoDB** must be running locally on `mongodb://localhost:27017`  
> Or use a free cloud instance at [MongoDB Atlas](https://www.mongodb.com/atlas)

---

## 🚀 Installation & Setup

### Step 1 — Clone / Extract the project
```bash
# If using git:
git clone <your-repo-url>
cd visitor-pass-system

# Or extract the ZIP and navigate into the folder
```

### Step 2 — Set up the Backend
```bash
cd backend
npm install
```

Create your `.env` file:
```bash
cp .env.example .env
```

Edit `.env` with your values:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/visitor_pass_db
JWT_SECRET=your_super_secret_key_change_this
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:3000
```

### Step 3 — Seed Demo Data
```bash
# Still inside /backend
npm run seed
```

You'll see:
```
✅ SEED COMPLETE! Login credentials:
-----------------------------------
Admin:    admin@company.com    / admin123
Security: security@company.com / security123
Employee: john@company.com     / john123
-----------------------------------
```

### Step 4 — Set up the Frontend
```bash
cd ../frontend
npm install
```

---

## ▶️ Running the App

### Terminal 1 — Start Backend
```bash
cd backend
npm run dev
# Server running on http://localhost:5000
```

### Terminal 2 — Start Frontend
```bash
cd frontend
npm start
# App opens at http://localhost:3000
```

Open **http://localhost:3000** in your browser. 🎉

---

## 🔑 Demo Credentials

| Role | Email | Password | Access |
|---|---|---|---|
| **Admin** | admin@company.com | admin123 | Full access — all features |
| **Security** | security@company.com | security123 | Scan QR, issue passes, check logs |
| **Employee** | john@company.com | john123 | Schedule appointments, view visitors |

---

## 👤 User Roles & Permissions

| Feature | Admin | Security | Employee |
|---|---|---|---|
| Dashboard | ✅ | ✅ | ✅ |
| View Visitors | ✅ | ✅ | ✅ |
| Register Visitors | ✅ | ✅ | ✅ |
| Delete Visitors | ✅ | ❌ | ❌ |
| Blacklist Visitors | ✅ | ✅ | ❌ |
| Schedule Appointments | ✅ | ✅ | ✅ |
| Approve Appointments | ✅ | ✅ | ✅ (own only) |
| Issue Passes | ✅ | ✅ | ❌ |
| Scan / Verify QR | ✅ | ✅ | ❌ |
| View Check Logs | ✅ | ✅ | ✅ |
| Export CSV | ✅ | ✅ | ✅ |
| User Management | ✅ | ❌ | ❌ |

---

## 🌐 API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | /api/auth/login | Login |
| POST | /api/auth/register | Register user |
| GET | /api/auth/me | Get current user |
| PUT | /api/auth/change-password | Change password |

### Visitors
| Method | Endpoint | Description |
|---|---|---|
| GET | /api/visitors | List all visitors (paginated, filterable) |
| GET | /api/visitors/:id | Get visitor by ID |
| POST | /api/visitors | Register new visitor |
| PUT | /api/visitors/:id | Update visitor |
| DELETE | /api/visitors/:id | Delete visitor (admin) |
| PUT | /api/visitors/:id/blacklist | Blacklist/unblacklist |

### Appointments
| Method | Endpoint | Description |
|---|---|---|
| GET | /api/appointments | List appointments |
| GET | /api/appointments/today | Today's appointments |
| POST | /api/appointments | Create appointment |
| PUT | /api/appointments/:id/status | Approve/reject |

### Passes
| Method | Endpoint | Description |
|---|---|---|
| GET | /api/passes | List passes |
| GET | /api/passes/verify/:passNumber | Verify a pass |
| POST | /api/passes | Issue new pass |
| PUT | /api/passes/:id/revoke | Revoke pass |

### Check Logs
| Method | Endpoint | Description |
|---|---|---|
| GET | /api/checklogs | List logs |
| POST | /api/checklogs/scan | Scan QR / toggle check-in/out |
| POST | /api/checklogs/checkout/:passId | Manual check-out |

### Dashboard
| Method | Endpoint | Description |
|---|---|---|
| GET | /api/dashboard/stats | Analytics + stats |

---

## 📦 Dependencies Summary

### Backend `npm install`
```
express, mongoose, bcryptjs, jsonwebtoken, cors, helmet, morgan,
multer, qrcode, pdfkit, nodemailer, uuid, express-validator, dotenv
```

### Frontend `npm install`
```
react, react-dom, react-router-dom, axios,
recharts, react-hot-toast, date-fns, html5-qrcode
```

---

## 🎯 Bonus Features Implemented
- ✅ Blacklist system for visitors
- ✅ CSV export of check logs
- ✅ QR code embedded in pass
- ✅ Pagination on all list views
- ✅ Weekly check-in bar chart
- ✅ Recent activity feed
- ✅ Role-based route guards
- ✅ Responsive mobile layout
- ✅ Photo upload support

---

## 📝 Notes
- Photos are stored in `backend/uploads/photos/` — ensure this folder has write permissions
- QR codes are stored as base64 data URLs in MongoDB
- JWT tokens expire in 7 days by default
- The seed script clears ALL existing data before inserting demo data

---

*Built with ❤️ using MERN Stack*
