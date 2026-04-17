import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/shared/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Visitors from './pages/Visitors';
import VisitorDetail from './pages/VisitorDetail';
import Appointments from './pages/Appointments';
import Passes from './pages/Passes';
import ScanPass from './pages/ScanPass';
import CheckLogs from './pages/CheckLogs';
import Users from './pages/Users';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';

const ProtectedRoute = ({ children, roles }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return children;
};

const AppRoutes = () => {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" replace />} />
      <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="visitors" element={<Visitors />} />
        <Route path="visitors/:id" element={<VisitorDetail />} />
        <Route path="appointments" element={<Appointments />} />
        <Route path="passes" element={<Passes />} />
        <Route path="scan" element={<ProtectedRoute roles={['admin','security']}><ScanPass /></ProtectedRoute>} />
        <Route path="logs" element={<CheckLogs />} />
        <Route path="users" element={<ProtectedRoute roles={['admin']}><Users /></ProtectedRoute>} />
        <Route path="profile" element={<Profile />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
        <Toaster position="top-right" toastOptions={{
          style: { background: '#1e1e2e', color: '#cdd6f4', border: '1px solid #313244' },
          success: { iconTheme: { primary: '#a6e3a1', secondary: '#1e1e2e' } },
          error: { iconTheme: { primary: '#f38ba8', secondary: '#1e1e2e' } },
        }} />
      </Router>
    </AuthProvider>
  );
}
