import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const STATUS_BADGE = {
  'pre-registered': 'badge-blue',
  'checked-in': 'badge-green',
  'checked-out': 'badge-yellow',
  'cancelled': 'badge-red',
};

function VisitorModal({ visitor, employees, onClose, onSave }) {
  const [form, setForm] = useState(visitor || { name:'', email:'', phone:'', company:'', idType:'Aadhar', idNumber:'', purpose:'', address:'', hostEmployee:'' });
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.phone) return toast.error('Name, email, phone required');
    setLoading(true);
    try {
      let res;
      if (visitor?._id) res = await api.put(`/visitors/${visitor._id}`, form);
      else res = await api.post('/visitors', form);
      onSave(res.data.visitor);
      toast.success(visitor ? 'Visitor updated!' : 'Visitor registered!');
      onClose();
    } catch (e) { toast.error(e.response?.data?.message || 'Error'); }
    finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay">
      <div className="modal modal-lg">
        <div className="modal-header">
          <h2>{visitor ? '✏️ Edit Visitor' : '➕ Register Visitor'}</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="grid-2">
            <div className="form-group"><label className="form-label">Full Name *</label><input className="form-input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="John Doe" /></div>
            <div className="form-group"><label className="form-label">Email *</label><input className="form-input" type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="visitor@example.com" /></div>
            <div className="form-group"><label className="form-label">Phone *</label><input className="form-input" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+91 9876543210" /></div>
            <div className="form-group"><label className="form-label">Company</label><input className="form-input" value={form.company} onChange={e => set('company', e.target.value)} placeholder="Acme Corp" /></div>
            <div className="form-group"><label className="form-label">ID Type</label><select className="form-select" value={form.idType} onChange={e => set('idType', e.target.value)}>{['Aadhar','PAN','Passport','DrivingLicense','Other'].map(t => <option key={t}>{t}</option>)}</select></div>
            <div className="form-group"><label className="form-label">ID Number</label><input className="form-input" value={form.idNumber} onChange={e => set('idNumber', e.target.value)} placeholder="XXXX-XXXX-1234" /></div>
            <div className="form-group"><label className="form-label">Purpose of Visit</label><input className="form-input" value={form.purpose} onChange={e => set('purpose', e.target.value)} placeholder="Business Meeting" /></div>
            <div className="form-group"><label className="form-label">Host Employee</label>
              <select className="form-select" value={form.hostEmployee} onChange={e => set('hostEmployee', e.target.value)}>
                <option value="">Select host...</option>
                {employees.map(emp => <option key={emp._id} value={emp._id}>{emp.name} — {emp.department}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group" style={{ marginTop: '0.75rem' }}><label className="form-label">Address</label><textarea className="form-textarea" value={form.address} onChange={e => set('address', e.target.value)} placeholder="Street, City, State" rows={2} /></div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>{loading ? <span className="spinner" /> : (visitor ? 'Save Changes' : 'Register Visitor')}</button>
        </div>
      </div>
    </div>
  );
}

export default function Visitors() {
  const [visitors, setVisitors] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchVisitors = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 15 });
      if (search) params.set('search', search);
      if (statusFilter) params.set('status', statusFilter);
      const res = await api.get(`/visitors?${params}`);
      setVisitors(res.data.visitors);
      setTotal(res.data.total);
    } catch (e) { toast.error('Failed to load visitors'); }
    finally { setLoading(false); }
  }, [search, statusFilter, page]);

  useEffect(() => { fetchVisitors(); }, [fetchVisitors]);
  useEffect(() => {
    api.get('/users/employees').then(r => setEmployees(r.data.employees)).catch(() => {});
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this visitor?')) return;
    try { await api.delete(`/visitors/${id}`); toast.success('Visitor deleted'); fetchVisitors(); }
    catch (e) { toast.error(e.response?.data?.message || 'Error'); }
  };

  const handleSave = () => fetchVisitors();

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Visitors</h1>
          <p className="page-subtitle">{total} total visitors registered</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditing(null); setShowModal(true); }}>
          ➕ Register Visitor
        </button>
      </div>

      <div className="search-bar">
        <div className="search-input-wrap" style={{ flex: 2 }}>
          <span className="search-icon">🔍</span>
          <input className="form-input" placeholder="Search by name, email, phone, company..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <select className="form-select" style={{ width: 180 }} value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
          <option value="">All Statuses</option>
          {['pre-registered','checked-in','checked-out','cancelled'].map(s => <option key={s} value={s}>{s.replace('-', ' ')}</option>)}
        </select>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Visitor</th>
                <th>Contact</th>
                <th>Company</th>
                <th>Host</th>
                <th>Status</th>
                <th>Visits</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '3rem' }}><span className="spinner" style={{ margin: '0 auto' }} /></td></tr>
              ) : visitors.length === 0 ? (
                <tr><td colSpan={7}><div className="empty-state"><div style={{ fontSize: '2.5rem' }}>👥</div><h3>No visitors found</h3></div></td></tr>
              ) : visitors.map(v => (
                <tr key={v._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div className="avatar" style={{ background: v.blacklisted ? 'var(--red)' : 'var(--surface1)' }}>
                        {v.photo ? <img src={`http://localhost:5000${v.photo}`} alt="" /> : v.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--text)', cursor: 'pointer' }} onClick={() => navigate(`/visitors/${v._id}`)}>{v.name}</div>
                        {v.blacklisted && <span className="badge badge-red" style={{ marginTop: 2 }}>Blacklisted</span>}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.85rem' }}>{v.email}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--subtext0)' }}>{v.phone}</div>
                  </td>
                  <td>{v.company || '—'}</td>
                  <td style={{ fontSize: '0.85rem' }}>{v.hostEmployee?.name || '—'}</td>
                  <td><span className={`badge ${STATUS_BADGE[v.status] || 'badge-blue'}`}>{v.status?.replace('-', ' ')}</span></td>
                  <td><span className="mono" style={{ color: 'var(--blue)' }}>{v.visitCount}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/visitors/${v._id}`)}>👁️</button>
                      <button className="btn btn-ghost btn-sm" onClick={() => { setEditing(v); setShowModal(true); }}>✏️</button>
                      {user?.role === 'admin' && <button className="btn btn-ghost btn-sm" style={{ color: 'var(--red)' }} onClick={() => handleDelete(v._id)}>🗑️</button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        {total > 15 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.75rem', padding: '1rem', borderTop: '1px solid var(--surface0)' }}>
            <button className="btn btn-ghost btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
            <span style={{ color: 'var(--subtext0)', fontSize: '0.85rem' }}>Page {page} of {Math.ceil(total / 15)}</span>
            <button className="btn btn-ghost btn-sm" disabled={page >= Math.ceil(total / 15)} onClick={() => setPage(p => p + 1)}>Next →</button>
          </div>
        )}
      </div>

      {showModal && <VisitorModal visitor={editing} employees={employees} onClose={() => setShowModal(false)} onSave={handleSave} />}
    </div>
  );
}
