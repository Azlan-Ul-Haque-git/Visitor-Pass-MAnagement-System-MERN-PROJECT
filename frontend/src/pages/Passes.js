import React, { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const STATUS_BADGE = { active: 'badge-green', used: 'badge-blue', expired: 'badge-yellow', revoked: 'badge-red' };

function IssuePassModal({ visitors, employees, onClose, onSave }) {
  const [form, setForm] = useState({ visitorId:'', hostId:'', purpose:'', validHours:8, accessAreas:'Lobby,Reception', vehicleNumber:'', remarks:'' });
  const [loading, setLoading] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.visitorId) return toast.error('Please select a visitor');
    setLoading(true);
    try {
      const payload = { ...form, accessAreas: form.accessAreas.split(',').map(a => a.trim()).filter(Boolean) };
      const res = await api.post('/passes', payload);
      onSave(res.data.pass);
      toast.success('Pass issued successfully!');
      onClose();
    } catch (e) { toast.error(e.response?.data?.message || 'Error issuing pass'); }
    finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay">
      <div className="modal modal-lg">
        <div className="modal-header"><h2>🪪 Issue Visitor Pass</h2><button className="close-btn" onClick={onClose}>✕</button></div>
        <div className="modal-body">
          <div className="grid-2">
            <div className="form-group"><label className="form-label">Visitor *</label>
              <select className="form-select" value={form.visitorId} onChange={e => set('visitorId', e.target.value)}>
                <option value="">Select visitor...</option>
                {visitors.map(v => <option key={v._id} value={v._id}>{v.name} — {v.phone}</option>)}
              </select>
            </div>
            <div className="form-group"><label className="form-label">Host Employee</label>
              <select className="form-select" value={form.hostId} onChange={e => set('hostId', e.target.value)}>
                <option value="">Select host...</option>
                {employees.map(e => <option key={e._id} value={e._id}>{e.name} — {e.department}</option>)}
              </select>
            </div>
            <div className="form-group"><label className="form-label">Purpose</label><input className="form-input" value={form.purpose} onChange={e => set('purpose', e.target.value)} placeholder="Business Meeting" /></div>
            <div className="form-group"><label className="form-label">Valid for (hours)</label>
              <select className="form-select" value={form.validHours} onChange={e => set('validHours', parseInt(e.target.value))}>
                {[1,2,4,6,8,12,24].map(h => <option key={h} value={h}>{h} hour{h>1?'s':''}</option>)}
              </select>
            </div>
            <div className="form-group"><label className="form-label">Access Areas (comma separated)</label><input className="form-input" value={form.accessAreas} onChange={e => set('accessAreas', e.target.value)} placeholder="Lobby, Conference Room A" /></div>
            <div className="form-group"><label className="form-label">Vehicle Number</label><input className="form-input" value={form.vehicleNumber} onChange={e => set('vehicleNumber', e.target.value)} placeholder="MH-01-AB-1234" /></div>
          </div>
          <div className="form-group" style={{ marginTop: '0.75rem' }}><label className="form-label">Remarks</label><textarea className="form-textarea" value={form.remarks} onChange={e => set('remarks', e.target.value)} placeholder="Additional remarks..." rows={2} /></div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>{loading ? <span className="spinner" /> : '🪪 Issue Pass'}</button>
        </div>
      </div>
    </div>
  );
}

function PassDetail({ pass, onClose, onRevoke }) {
  return (
    <div className="modal-overlay">
      <div className="modal modal-lg">
        <div className="modal-header"><h2>🪪 Pass Details</h2><button className="close-btn" onClick={onClose}>✕</button></div>
        <div className="modal-body">
          <div className="pass-card" style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ flex: 1 }}>
                <div className="mono" style={{ color: 'var(--blue)', fontWeight: 700, fontSize: '1.2rem', marginBottom: '0.25rem' }}>{pass.passNumber}</div>
                <span className={`badge ${STATUS_BADGE[pass.status]}`}>{pass.status}</span>
                <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {[
                    ['👤', 'Visitor', pass.visitor?.name],
                    ['📧', 'Email', pass.visitor?.email],
                    ['📱', 'Phone', pass.visitor?.phone],
                    ['🏢', 'Company', pass.visitor?.company || '—'],
                    ['👔', 'Host', pass.host?.name || '—'],
                    ['🎯', 'Purpose', pass.purpose || '—'],
                    ['🚗', 'Vehicle', pass.vehicleNumber || '—'],
                    ['🏛️', 'Access', pass.accessAreas?.join(', ') || '—'],
                    ['📅', 'Valid From', new Date(pass.validFrom).toLocaleString()],
                    ['⏰', 'Valid Until', new Date(pass.validUntil).toLocaleString()],
                    ['👮', 'Issued By', pass.issuedBy?.name],
                  ].map(([icon, label, val]) => (
                    <div key={label} style={{ display: 'flex', gap: '0.5rem', fontSize: '0.85rem' }}>
                      <span style={{ minWidth: 20 }}>{icon}</span>
                      <span style={{ color: 'var(--subtext0)', minWidth: 80 }}>{label}:</span>
                      <span style={{ color: 'var(--text)' }}>{val}</span>
                    </div>
                  ))}
                </div>
              </div>
              {pass.qrCode && (
                <div style={{ textAlign: 'center' }}>
                  <div className="qr-display"><img src={pass.qrCode} alt="QR Code" style={{ width: 140, height: 140 }} /></div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--subtext0)', marginTop: '0.4rem' }}>Scan to verify</div>
                </div>
              )}
            </div>
          </div>
          {pass.remarks && <div className="card" style={{ padding: '0.75rem' }}><span style={{ color: 'var(--subtext0)', fontSize: '0.8rem' }}>Remarks:</span> {pass.remarks}</div>}
        </div>
        <div className="modal-footer">
          {pass.status === 'active' && <button className="btn btn-danger" onClick={() => onRevoke(pass._id)}>🚫 Revoke Pass</button>}
          <button className="btn btn-ghost" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

export default function Passes() {
  const [passes, setPasses] = useState([]);
  const [visitors, setVisitors] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [showIssue, setShowIssue] = useState(false);
  const [viewPass, setViewPass] = useState(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const { user } = useAuth();

  const fetchPasses = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 15 });
      if (statusFilter) params.set('status', statusFilter);
      const res = await api.get(`/passes?${params}`);
      setPasses(res.data.passes);
      setTotal(res.data.total);
    } catch (e) { toast.error('Failed to load passes'); }
    finally { setLoading(false); }
  }, [statusFilter, page]);

  useEffect(() => { fetchPasses(); }, [fetchPasses]);
  useEffect(() => {
    Promise.all([api.get('/visitors'), api.get('/users/employees')]).then(([v, e]) => {
      setVisitors(v.data.visitors); setEmployees(e.data.employees);
    }).catch(() => {});
  }, []);

  const handleRevoke = async (id) => {
    if (!window.confirm('Revoke this pass?')) return;
    try { await api.put(`/passes/${id}/revoke`); toast.success('Pass revoked'); setViewPass(null); fetchPasses(); }
    catch (e) { toast.error('Error'); }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Passes</h1>
          <p className="page-subtitle">{total} total passes issued</p>
        </div>
        {(user?.role === 'admin' || user?.role === 'security') && (
          <button className="btn btn-primary" onClick={() => setShowIssue(true)}>🪪 Issue Pass</button>
        )}
      </div>

      <div className="search-bar">
        <select className="form-select" style={{ width: 180 }} value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
          <option value="">All Statuses</option>
          {['active','used','expired','revoked'].map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr><th>Pass Number</th><th>Visitor</th><th>Host</th><th>Purpose</th><th>Valid Until</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '3rem' }}><span className="spinner" style={{ margin: '0 auto' }} /></td></tr>
              ) : passes.length === 0 ? (
                <tr><td colSpan={7}><div className="empty-state"><div style={{ fontSize: '2.5rem' }}>🪪</div><h3>No passes found</h3></div></td></tr>
              ) : passes.map(p => (
                <tr key={p._id}>
                  <td><span className="mono" style={{ color: 'var(--blue)', fontWeight: 600 }}>{p.passNumber}</span></td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <div className="avatar" style={{ width: 30, height: 30, fontSize: '0.8rem' }}>
                        {p.visitor?.photo ? <img src={`http://localhost:5000${p.visitor.photo}`} alt="" /> : p.visitor?.name?.charAt(0)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text)' }}>{p.visitor?.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--subtext0)' }}>{p.visitor?.company}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ fontSize: '0.85rem' }}>{p.host?.name || '—'}</td>
                  <td style={{ fontSize: '0.82rem' }}>{p.purpose || '—'}</td>
                  <td>
                    <div style={{ fontSize: '0.82rem', color: new Date(p.validUntil) < new Date() ? 'var(--red)' : 'var(--subtext1)' }}>
                      {new Date(p.validUntil).toLocaleString()}
                    </div>
                  </td>
                  <td><span className={`badge ${STATUS_BADGE[p.status]}`}>{p.status}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => setViewPass(p)}>👁️ View</button>
                      {p.status === 'active' && (user?.role === 'admin' || user?.role === 'security') && (
                        <button className="btn btn-danger btn-sm" onClick={() => handleRevoke(p._id)}>🚫</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {total > 15 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.75rem', padding: '1rem', borderTop: '1px solid var(--surface0)' }}>
            <button className="btn btn-ghost btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
            <span style={{ color: 'var(--subtext0)', fontSize: '0.85rem' }}>Page {page} of {Math.ceil(total / 15)}</span>
            <button className="btn btn-ghost btn-sm" disabled={page >= Math.ceil(total / 15)} onClick={() => setPage(p => p + 1)}>Next →</button>
          </div>
        )}
      </div>

      {showIssue && <IssuePassModal visitors={visitors} employees={employees} onClose={() => setShowIssue(false)} onSave={() => { fetchPasses(); setShowIssue(false); }} />}
      {viewPass && <PassDetail pass={viewPass} onClose={() => setViewPass(null)} onRevoke={handleRevoke} />}
    </div>
  );
}
