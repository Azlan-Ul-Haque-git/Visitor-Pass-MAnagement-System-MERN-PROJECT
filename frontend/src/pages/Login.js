import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return toast.error('Please fill all fields');
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  const quickLogin = (role) => {
    const creds = {
      admin: { email: 'admin@company.com', password: 'admin123' },
      security: { email: 'security@company.com', password: 'security123' },
      employee: { email: 'john@company.com', password: 'john123' },
    };
    setEmail(creds[role].email);
    setPassword(creds[role].password);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--base)', padding: '1.5rem' }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ width: 64, height: 64, background: 'var(--blue)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', margin: '0 auto 1rem' }}>🛡️</div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.4rem' }}>VisitorPass</h1>
          <p style={{ color: 'var(--subtext0)', fontSize: '0.9rem' }}>Visitor Management System</p>
        </div>

        {/* Card */}
        <div className="card" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '1.5rem', color: 'var(--text)' }}>Sign in to your account</h2>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Email address</label>
              <input className="form-input" type="email" placeholder="you@company.com" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input className="form-input" type={showPass ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" style={{ paddingRight: '3rem' }} />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--subtext0)', fontSize: '1rem' }}>{showPass ? '🙈' : '👁️'}</button>
              </div>
            </div>
            <button className="btn btn-primary btn-lg" type="submit" disabled={loading} style={{ marginTop: '0.5rem', justifyContent: 'center' }}>
              {loading ? <span className="spinner" /> : '🔐 Sign In'}
            </button>
          </form>

          <div className="divider" />

          <p style={{ fontSize: '0.8rem', color: 'var(--subtext0)', marginBottom: '0.75rem', textAlign: 'center' }}>Quick demo login:</p>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {[['admin','🔑 Admin','var(--mauve)'],['security','🛡️ Security','var(--blue)'],['employee','👤 Employee','var(--green)']].map(([role, label, color]) => (
              <button key={role} onClick={() => quickLogin(role)} className="btn btn-ghost btn-sm" style={{ flex: 1, justifyContent: 'center', borderColor: color, color }}>
                {label}
              </button>
            ))}
          </div>
        </div>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.8rem', color: 'var(--overlay0)' }}>
          Visitor Pass Management System v1.0
        </p>
      </div>
    </div>
  );
}
