import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const NAV = [
  { to: '/dashboard', icon: '📊', label: 'Dashboard', roles: ['admin','security','employee'] },
  { to: '/visitors', icon: '👥', label: 'Visitors', roles: ['admin','security','employee'] },
  { to: '/appointments', icon: '📅', label: 'Appointments', roles: ['admin','security','employee'] },
  { to: '/passes', icon: '🪪', label: 'Passes', roles: ['admin','security','employee'] },
  { to: '/scan', icon: '📷', label: 'Scan QR', roles: ['admin','security'] },
  { to: '/logs', icon: '📋', label: 'Check Logs', roles: ['admin','security','employee'] },
  { to: '/users', icon: '⚙️', label: 'Users', roles: ['admin'] },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const roleColor = { admin: 'var(--mauve)', security: 'var(--blue)', employee: 'var(--green)', visitor: 'var(--peach)' };

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div style={{ padding: '1.5rem 1.25rem', borderBottom: '1px solid var(--surface0)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: 36, height: 36, background: 'var(--blue)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0 }}>🛡️</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text)' }}>VisitorPass</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--subtext0)' }}>Management System</div>
          </div>
        </div>
      </div>

      {/* Nav links */}
      <nav style={{ padding: '1rem 0.75rem', flex: 1 }}>
        {NAV.filter(n => n.roles.includes(user?.role)).map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={() => setSidebarOpen(false)}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              padding: '0.65rem 0.85rem', borderRadius: '8px',
              marginBottom: '0.2rem', textDecoration: 'none',
              fontSize: '0.88rem', fontWeight: 500,
              background: isActive ? 'rgba(137,180,250,0.15)' : 'transparent',
              color: isActive ? 'var(--blue)' : 'var(--subtext1)',
              borderLeft: isActive ? '3px solid var(--blue)' : '3px solid transparent',
              transition: 'all 0.15s',
            })}
          >
            <span style={{ fontSize: '1rem' }}>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* User info */}
      <div style={{ padding: '1rem 0.75rem', borderTop: '1px solid var(--surface0)' }}>
        <NavLink to="/profile" onClick={() => setSidebarOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.65rem', borderRadius: 8, textDecoration: 'none', marginBottom: '0.5rem', background: 'var(--surface0)' }}>
          <div className="avatar" style={{ background: roleColor[user?.role] }}>
            {user?.photo ? <img src={`http://localhost:5000${user.photo}`} alt="" /> : user?.name?.charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--subtext0)', textTransform: 'capitalize' }}>{user?.role}</div>
          </div>
        </NavLink>
        <button onClick={handleLogout} className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center', fontSize: '0.82rem' }}>
          🚪 Logout
        </button>
      </div>
    </>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--base)' }}>
      {/* Desktop sidebar */}
      <aside style={{ width: 240, background: 'var(--mantle)', borderRight: '1px solid var(--surface0)', display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 100 }} className="hide-mobile">
        <SidebarContent />
      </aside>

      {/* Mobile hamburger */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        style={{ position: 'fixed', top: '1rem', left: '1rem', zIndex: 200, background: 'var(--mantle)', border: '1px solid var(--surface0)', borderRadius: 8, padding: '0.5rem', cursor: 'pointer', color: 'var(--text)', display: 'none' }}
        className="show-mobile"
      >☰</button>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 150, display: 'flex' }}>
          <div style={{ width: 240, background: 'var(--mantle)', display: 'flex', flexDirection: 'column', borderRight: '1px solid var(--surface0)' }}>
            <SidebarContent />
          </div>
          <div style={{ flex: 1, background: 'rgba(0,0,0,0.5)' }} onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Main content */}
      <main style={{ marginLeft: 240, flex: 1, padding: '2rem', minHeight: '100vh' }} className="main-content">
        <Outlet />
      </main>

      <style>{`
        @media (max-width: 768px) {
          .hide-mobile { display: none !important; }
          .show-mobile { display: flex !important; }
          .main-content { margin-left: 0 !important; padding: 1rem !important; padding-top: 4rem !important; }
        }
        @media (min-width: 769px) { .show-mobile { display: none !important; } }
      `}</style>
    </div>
  );
}
