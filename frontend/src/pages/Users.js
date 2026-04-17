import React, { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const ROLE_BADGE = { admin: 'badge-mauve', security: 'badge-blue', employee: 'badge-green', visitor: 'badge-peach' };

function UserModal({ user, onClose, onSave }) {
  const [form, setForm] = useState(user || { name:'', email:'', password:'', role:'employee', phone:'', department:'', isActive:true });
  const [loading, setLoading] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.name || !form.email) return toast.error('Name and email required');
    if (!user && !form.password) return toast.error('Password required for new users');
    setLoading(true);
    try {
      let res;
      if (user?._id) res = await api.put(`/users/${user._id}`, form);
      else res = await api.post('/users', form);
      onSave(res.data.user);
      toast.success(user ? 'User updated!' : 'User created!');
      onClose();
    } catch (e) { toast.error(e.response?.data?.message || 'Error'); }
    finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay">
      <div className="modal modal-lg">
        <div className="modal-header"><h2>{user ? '✏️ Edit User' : '➕ Add User'}</h2><button className="close-btn" onClick={onClose}>✕</button></div>
        <div className="modal-body">
          <div className="grid-2">
            <div className="form-group"><label className="form-label">Full Name *</label><input className="form-input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="John Doe" /></div>
            <div className="form-group"><label className="form-label">Email *</label><input className="form-input" type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="john@company.com" /></div>
            {!user && <div className="form-group"><label className="form-label">Password *</label><input className="form-input" type="password" value={form.password} onChange={e => set('password', e.target.value)} placeholder="min 6 chars" /></div>}
            <div className="form-group"><label className="form-label">Role</label>
              <select className="form-select" value={form.role} onChange={e => set('role', e.target.value)}>
                {['admin','security','employee'].map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
              </select>
            </div>
            <div className="form-group"><label className="form-label">Phone</label><input className="form-input" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+91 9876543210" /></div>
            <div className="form-group"><label className="form-label">Department</label><input className="form-input" value={form.department} onChange={e => set('department', e.target.value)} placeholder="Engineering" /></div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={form.isActive} onChange={e => set('isActive', e.target.checked)} />
                <span className="form-label" style={{ margin: 0 }}>Active Account</span>
              </label>
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>{loading ? <span className="spinner" /> : (user ? 'Save Changes' : 'Create User')}</button>
        </div>
      </div>
    </div>
  );
}

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (roleFilter) params.set('role', roleFilter);
      const res = await api.get(`/users?${params}`);
      setUsers(res.data.users);
    } catch (e) { toast.error('Failed to load users'); }
    finally { setLoading(false); }
  }, [roleFilter]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleDeactivate = async (id) => {
    if (!window.confirm('Deactivate this user?')) return;
    try { await api.delete(`/users/${id}`); toast.success('User deactivated'); fetchUsers(); }
    catch (e) { toast.error('Error'); }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">User Management</h1>
          <p className="page-subtitle">{users.length} users</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditing(null); setShowModal(true); }}>➕ Add User</button>
      </div>

      <div className="search-bar">
        <select className="form-select" style={{ width: 200 }} value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
          <option value="">All Roles</option>
          {['admin','security','employee'].map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
        </select>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr><th>User</th><th>Role</th><th>Department</th><th>Phone</th><th>Last Login</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '3rem' }}><span className="spinner" style={{ margin: '0 auto' }} /></td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={7}><div className="empty-state"><div style={{ fontSize: '2.5rem' }}>👤</div><h3>No users found</h3></div></td></tr>
              ) : users.map(u => (
                <tr key={u._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div className="avatar">
                        {u.photo ? <img src={`http://localhost:5000${u.photo}`} alt="" /> : u.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--text)' }}>{u.name}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--subtext0)' }}>{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td><span className={`badge ${ROLE_BADGE[u.role]}`}>{u.role}</span></td>
                  <td style={{ fontSize: '0.85rem' }}>{u.department || '—'}</td>
                  <td style={{ fontSize: '0.85rem' }}>{u.phone || '—'}</td>
                  <td style={{ fontSize: '0.82rem', color: 'var(--subtext0)' }}>{u.lastLogin ? new Date(u.lastLogin).toLocaleDateString() : 'Never'}</td>
                  <td><span className={`badge ${u.isActive ? 'badge-green' : 'badge-red'}`}>{u.isActive ? 'Active' : 'Inactive'}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => { setEditing(u); setShowModal(true); }}>✏️</button>
                      {u.isActive && <button className="btn btn-ghost btn-sm" style={{ color: 'var(--red)' }} onClick={() => handleDeactivate(u._id)}>🚫</button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && <UserModal user={editing} onClose={() => setShowModal(false)} onSave={() => { fetchUsers(); setShowModal(false); }} />}
    </div>
  );
}
