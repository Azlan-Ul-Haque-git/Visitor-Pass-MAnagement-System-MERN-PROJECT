import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem', textAlign: 'center', background: 'var(--base)' }}>
      <div style={{ fontSize: '6rem' }}>🤷</div>
      <h1 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text)' }}>404 — Page Not Found</h1>
      <p style={{ color: 'var(--subtext0)' }}>The page you're looking for doesn't exist.</p>
      <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>Go to Dashboard</button>
    </div>
  );
}
