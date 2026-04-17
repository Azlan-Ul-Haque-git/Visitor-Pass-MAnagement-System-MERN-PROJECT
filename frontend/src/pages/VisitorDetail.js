import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function VisitorDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [visitor, setVisitor] = useState(null);
  const [passes, setPasses] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get(`/visitors/${id}`),
      api.get(`/passes?visitor=${id}`),
      api.get(`/checklogs?visitor=${id}&limit=10`),
    ]).then(([v, p, l]) => {
      setVisitor(v.data.visitor);
      setPasses(p.data.passes);
      setLogs(l.data.logs);
    }).catch(() => toast.error('Failed to load')).finally(() => setLoading(false));
  }, [id]);

  const toggleBlacklist = async () => {
    const confirmed = window.confirm(visitor.blacklisted ? 'Remove from blacklist?' : 'Add to blacklist?');
    if (!confirmed) return;
    const reason = !visitor.blacklisted ? prompt('Reason for blacklisting:') : '';
    try {
      const res = await api.put(`/visitors/${id}/blacklist`, { blacklisted: !visitor.blacklisted, reason });
      setVisitor(res.data.visitor);
      toast.success(visitor.blacklisted ? 'Removed from blacklist' : 'Added to blacklist');
    } catch (e) { toast.error('Error'); }
  };

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '50vh' }}><span className="spinner" style={{ width: 40, height: 40 }} /></div>;
  if (!visitor) return <div className="empty-state"><p>Visitor not found</p></div>;

  const statusColor = { 'pre-registered': 'var(--blue)', 'checked-in': 'var(--green)', 'checked-out': 'var(--yellow)', 'cancelled': 'var(--red)' };

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/visitors')}>← Back</button>
          <div>
            <h1 className="page-title">{visitor.name}</h1>
            <p className="page-subtitle">Visitor Profile</p>
          </div>
        </div>
        {(user?.role === 'admin' || user?.role === 'security') && (
          <button className={`btn ${visitor.blacklisted ? 'btn-success' : 'btn-danger'}`} onClick={toggleBlacklist}>
            {visitor.blacklisted ? '✅ Remove Blacklist' : '🚫 Blacklist'}
          </button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* Profile card */}
        <div className="card" style={{ textAlign: 'center' }}>
          <div className="avatar avatar-xl" style={{ margin: '0 auto 1rem', background: visitor.blacklisted ? 'var(--red)' : 'var(--surface1)' }}>
            {visitor.photo ? <img src={`http://localhost:5000${visitor.photo}`} alt="" /> : visitor.name.charAt(0).toUpperCase()}
          </div>
          <h2 style={{ fontWeight: 700, color: 'var(--text)', marginBottom: '0.25rem' }}>{visitor.name}</h2>
          <p style={{ color: 'var(--subtext0)', fontSize: '0.85rem', marginBottom: '0.75rem' }}>{visitor.company || 'No company'}</p>
          <span className="badge" style={{ background: `${statusColor[visitor.status]}22`, color: statusColor[visitor.status] }}>
            {visitor.status?.replace('-', ' ')}
          </span>
          {visitor.blacklisted && <div className="badge badge-red" style={{ marginTop: '0.5rem', display: 'flex', justifyContent: 'center' }}>🚫 Blacklisted</div>}
          <div className="divider" />
          <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[
              ['📧', 'Email', visitor.email],
              ['📱', 'Phone', visitor.phone],
              ['🆔', 'ID', `${visitor.idType}: ${visitor.idNumber || '—'}`],
              ['🎯', 'Purpose', visitor.purpose || '—'],
              ['🏢', 'Host', visitor.hostEmployee?.name || '—'],
              ['👁️', 'Total Visits', visitor.visitCount],
              ['📅', 'Last Visit', visitor.lastVisit ? new Date(visitor.lastVisit).toLocaleDateString() : 'Never'],
            ].map(([icon, label, val]) => (
              <div key={label}>
                <div style={{ fontSize: '0.72rem', color: 'var(--subtext0)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.15rem' }}>{icon} {label}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text)' }}>{val}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Passes */}
          <div className="card">
            <h3 style={{ fontWeight: 600, marginBottom: '1rem' }}>🪪 Passes ({passes.length})</h3>
            {passes.length === 0 ? <div className="empty-state" style={{ padding: '1.5rem' }}><p>No passes issued</p></div> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {passes.map(p => (
                  <div key={p._id} className="pass-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div className="mono" style={{ color: 'var(--blue)', fontWeight: 700, fontSize: '1rem' }}>{p.passNumber}</div>
                        <div style={{ color: 'var(--subtext0)', fontSize: '0.8rem', marginTop: '0.2rem' }}>
                          Valid: {new Date(p.validFrom).toLocaleString()} → {new Date(p.validUntil).toLocaleString()}
                        </div>
                        {p.purpose && <div style={{ color: 'var(--subtext1)', fontSize: '0.82rem', marginTop: '0.15rem' }}>{p.purpose}</div>}
                      </div>
                      <span className={`badge ${p.status === 'active' ? 'badge-green' : p.status === 'used' ? 'badge-blue' : p.status === 'expired' ? 'badge-yellow' : 'badge-red'}`}>{p.status}</span>
                    </div>
                    {p.qrCode && (
                      <div style={{ marginTop: '0.75rem' }}>
                        <div className="qr-display" style={{ padding: '0.5rem' }}>
                          <img src={p.qrCode} alt="QR" style={{ width: 80, height: 80 }} />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Check Logs */}
          <div className="card">
            <h3 style={{ fontWeight: 600, marginBottom: '1rem' }}>📋 Recent Check Logs</h3>
            {logs.length === 0 ? <div className="empty-state" style={{ padding: '1.5rem' }}><p>No logs yet</p></div> : (
              <div className="table-wrapper">
                <table>
                  <thead><tr><th>Action</th><th>Time</th><th>Gate</th><th>Method</th><th>By</th></tr></thead>
                  <tbody>
                    {logs.map(log => (
                      <tr key={log._id}>
                        <td><span className={`badge ${log.action === 'check-in' ? 'badge-green' : 'badge-blue'}`}>{log.action}</span></td>
                        <td>{new Date(log.timestamp).toLocaleString()}</td>
                        <td>{log.gate}</td>
                        <td><span className="badge badge-mauve">{log.scanMethod}</span></td>
                        <td>{log.performedBy?.name || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
