import React, { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const STATUS_BADGE = { pending: 'badge-yellow', approved: 'badge-green', rejected: 'badge-red', completed: 'badge-blue', cancelled: 'badge-mauve' };

function AppointmentModal({ appt, employees, onClose, onSave }) {
  const [form, setForm] = useState(appt ? {
    visitor: appt.visitor?._id || '', host: appt.host?._id || '',
    scheduledDate: appt.scheduledDate?.split('T')[0] || '',
    scheduledTime: appt.scheduledTime || '', purpose: appt.purpose || '',
    department: appt.department || '', location: appt.location || '', notes: appt.notes || '',
  } : {
    visitorName:'', visitorEmail:'', visitorPhone:'', visitorCompany:'',
    host:'', scheduledDate:'', scheduledTime:'', purpose:'', department:'', location:'', notes:''
  });
  const [loading, setLoading] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.scheduledDate || !form.purpose) return toast.error('Date and purpose required');
    setLoading(true);
    try {
      let payload;
      if (!appt) {
        payload = {
          visitorData: { name: form.visitorName, email: form.visitorEmail, phone: form.visitorPhone, company: form.visitorCompany },
          host: form.host, scheduledDate: form.scheduledDate, scheduledTime: form.scheduledTime,
          purpose: form.purpose, department: form.department, location: form.location, notes: form.notes
        };
      } else {
        payload = { host: form.host, scheduledDate: form.scheduledDate, scheduledTime: form.scheduledTime, purpose: form.purpose, department: form.department, location: form.location, notes: form.notes };
      }
      let res;
      if (appt?._id) res = await api.put(`/appointments/${appt._id}`, payload);
      else res = await api.post('/appointments', payload);
      onSave(res.data.appointment);
      toast.success(appt ? 'Appointment updated!' : 'Appointment scheduled!');
      onClose();
    } catch (e) { toast.error(e.response?.data?.message || 'Error'); }
    finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay">
      <div className="modal modal-lg">
        <div className="modal-header">
          <h2>{appt ? '✏️ Edit Appointment' : '📅 New Appointment'}</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          {!appt && (
            <>
              <p style={{ fontWeight: 600, color: 'var(--subtext0)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.75rem' }}>Visitor Information</p>
              <div className="grid-2" style={{ marginBottom: '1rem' }}>
                <div className="form-group"><label className="form-label">Visitor Name *</label><input className="form-input" value={form.visitorName} onChange={e => set('visitorName', e.target.value)} placeholder="John Doe" /></div>
                <div className="form-group"><label className="form-label">Visitor Email *</label><input className="form-input" type="email" value={form.visitorEmail} onChange={e => set('visitorEmail', e.target.value)} placeholder="visitor@example.com" /></div>
                <div className="form-group"><label className="form-label">Visitor Phone *</label><input className="form-input" value={form.visitorPhone} onChange={e => set('visitorPhone', e.target.value)} placeholder="+91 9876543210" /></div>
                <div className="form-group"><label className="form-label">Company</label><input className="form-input" value={form.visitorCompany} onChange={e => set('visitorCompany', e.target.value)} placeholder="Acme Corp" /></div>
              </div>
              <div className="divider" />
            </>
          )}
          <p style={{ fontWeight: 600, color: 'var(--subtext0)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.75rem' }}>Appointment Details</p>
          <div className="grid-2">
            <div className="form-group"><label className="form-label">Host Employee</label>
              <select className="form-select" value={form.host} onChange={e => set('host', e.target.value)}>
                <option value="">Select host...</option>
                {employees.map(e => <option key={e._id} value={e._id}>{e.name} — {e.department}</option>)}
              </select>
            </div>
            <div className="form-group"><label className="form-label">Purpose *</label><input className="form-input" value={form.purpose} onChange={e => set('purpose', e.target.value)} placeholder="Business Meeting" /></div>
            <div className="form-group"><label className="form-label">Date *</label><input className="form-input" type="date" value={form.scheduledDate} onChange={e => set('scheduledDate', e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Time</label><input className="form-input" type="time" value={form.scheduledTime} onChange={e => set('scheduledTime', e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Department</label><input className="form-input" value={form.department} onChange={e => set('department', e.target.value)} placeholder="Engineering" /></div>
            <div className="form-group"><label className="form-label">Location / Room</label><input className="form-input" value={form.location} onChange={e => set('location', e.target.value)} placeholder="Conference Room A" /></div>
          </div>
          <div className="form-group" style={{ marginTop: '0.75rem' }}><label className="form-label">Notes</label><textarea className="form-textarea" value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Additional notes..." rows={2} /></div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>{loading ? <span className="spinner" /> : (appt ? 'Update' : 'Schedule')}</button>
        </div>
      </div>
    </div>
  );
}

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const { user } = useAuth();

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set('status', statusFilter);
      if (dateFilter) params.set('date', dateFilter);
      const res = await api.get(`/appointments?${params}&limit=30`);
      setAppointments(res.data.appointments);
    } catch (e) { toast.error('Failed to load'); }
    finally { setLoading(false); }
  }, [statusFilter, dateFilter]);

  useEffect(() => { fetchAppointments(); }, [fetchAppointments]);
  useEffect(() => { api.get('/users/employees').then(r => setEmployees(r.data.employees)).catch(() => {}); }, []);

  const updateStatus = async (id, status) => {
    const reason = status === 'rejected' ? prompt('Reason for rejection:') : '';
    try {
      await api.put(`/appointments/${id}/status`, { status, rejectionReason: reason });
      toast.success(`Appointment ${status}`);
      fetchAppointments();
    } catch (e) { toast.error('Error'); }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Appointments</h1>
          <p className="page-subtitle">Schedule and manage visitor appointments</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditing(null); setShowModal(true); }}>
          ➕ New Appointment
        </button>
      </div>

      <div className="search-bar">
        <select className="form-select" style={{ width: 180 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          {['pending','approved','rejected','completed','cancelled'].map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>
        <input className="form-input" type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)} style={{ width: 180 }} />
        {(statusFilter || dateFilter) && <button className="btn btn-ghost btn-sm" onClick={() => { setStatusFilter(''); setDateFilter(''); }}>✕ Clear</button>}
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr><th>Visitor</th><th>Host</th><th>Date & Time</th><th>Purpose</th><th>Location</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '3rem' }}><span className="spinner" style={{ margin: '0 auto' }} /></td></tr>
              ) : appointments.length === 0 ? (
                <tr><td colSpan={7}><div className="empty-state"><div style={{ fontSize: '2.5rem' }}>📅</div><h3>No appointments</h3></div></td></tr>
              ) : appointments.map(appt => (
                <tr key={appt._id}>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text)', fontSize: '0.9rem' }}>{appt.visitor?.name}</div>
                    <div style={{ color: 'var(--subtext0)', fontSize: '0.78rem' }}>{appt.visitor?.company}</div>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.85rem' }}>{appt.host?.name}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--subtext0)' }}>{appt.host?.department}</div>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text)' }}>{new Date(appt.scheduledDate).toLocaleDateString()}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--subtext0)' }}>{appt.scheduledTime || '—'}</div>
                  </td>
                  <td style={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{appt.purpose}</td>
                  <td style={{ fontSize: '0.82rem' }}>{appt.location || '—'}</td>
                  <td><span className={`badge ${STATUS_BADGE[appt.status]}`}>{appt.status}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                      {appt.status === 'pending' && (user?.role !== 'employee' || appt.host?._id === user?._id) && (
                        <>
                          <button className="btn btn-success btn-sm" onClick={() => updateStatus(appt._id, 'approved')}>✅</button>
                          <button className="btn btn-danger btn-sm" onClick={() => updateStatus(appt._id, 'rejected')}>❌</button>
                        </>
                      )}
                      <button className="btn btn-ghost btn-sm" onClick={() => { setEditing(appt); setShowModal(true); }}>✏️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && <AppointmentModal appt={editing} employees={employees} onClose={() => setShowModal(false)} onSave={() => { fetchAppointments(); setShowModal(false); }} />}
    </div>
  );
}
