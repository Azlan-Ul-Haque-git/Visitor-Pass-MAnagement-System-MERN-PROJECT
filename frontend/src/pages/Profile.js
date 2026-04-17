import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, updateUser } = useAuth();

  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    department: user?.department || ''
  });

  const [pwForm, setPwForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirm: ''
  });

  // 🔥 NEW STATES (image upload)
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  const [loading, setLoading] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  // ================= IMAGE HANDLER =================
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      return toast.error('Only image files allowed');
    }

    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleImageUpload = async () => {
  if (!image) return toast.error('Select an image first');

  const formData = new FormData();
  formData.append('photo', image);

  setUploading(true);
  try {
    const res = await api.put(`/users/${user._id}/photo`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    updateUser(res.data.user);
    toast.success('Profile photo updated!');
    setImage(null);
    setPreview(null);
  } catch (e) {
    toast.error(e.response?.data?.message || 'Upload failed');
  } finally {
    setUploading(false);
  }
};

// ================= PROFILE UPDATE =================
const handleProfileUpdate = async () => {
  setLoading(true);
  try {
    const res = await api.put(`/users/${user._id}`, form);
    updateUser(res.data.user);
    toast.success('Profile updated!');
  } catch (e) {
    toast.error(e.response?.data?.message || 'Error');
  } finally {
    setLoading(false);
  }
};

// ================= PASSWORD CHANGE =================
const handlePasswordChange = async () => {
  if (!pwForm.currentPassword || !pwForm.newPassword)
    return toast.error('All fields required');

  if (pwForm.newPassword !== pwForm.confirm)
    return toast.error('Passwords do not match');

  if (pwForm.newPassword.length < 6)
    return toast.error('Password too short (min 6)');

  setPwLoading(true);
  try {
    await api.put('/auth/change-password', {
      currentPassword: pwForm.currentPassword,
      newPassword: pwForm.newPassword
    });

    toast.success('Password changed!');
    setPwForm({ currentPassword: '', newPassword: '', confirm: '' });
  } catch (e) {
    toast.error(e.response?.data?.message || 'Error');
  } finally {
    setPwLoading(false);
  }
};

const ROLE_COLOR = {
  admin: 'var(--mauve)',
  security: 'var(--blue)',
  employee: 'var(--green)',
  visitor: 'var(--peach)'
};

return (
  <div>
    <div className="page-header">
      <div>
        <h1 className="page-title">My Profile</h1>
        <p className="page-subtitle">Manage your account settings</p>
      </div>
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '1.5rem' }}>

      {/* ================= AVATAR CARD ================= */}
      <div className="card" style={{ textAlign: 'center' }}>

        {/* 🔥 UPDATED AVATAR */}
        <div style={{ position: 'relative', width: 'fit-content', margin: '0 auto 1rem' }}>
          <div className="avatar avatar-xl" style={{
            background: ROLE_COLOR[user?.role] || 'var(--surface1)',
            fontSize: '2.5rem',
            overflow: 'hidden'
          }}>
            {preview ? (
              <img src={preview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : user?.photo ? (
              <img src={`http://localhost:5000${user.photo}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              user?.name?.charAt(0).toUpperCase()
            )}
          </div>

          {/* 📷 Upload Button */}
          <label style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            background: '#000',
            color: '#fff',
            borderRadius: '50%',
            padding: '6px',
            cursor: 'pointer',
            fontSize: '12px'
          }}>
            📷
            <input type="file" hidden onChange={handleImageChange} />
          </label>
        </div>

        {/* Upload Button */}
        {image && (
          <button
            className="btn btn-primary"
            style={{ marginBottom: '10px' }}
            onClick={handleImageUpload}
            disabled={uploading}
          >
            {uploading ? 'Uploading...' : 'Upload Photo'}
          </button>
        )}

        <h2 style={{ fontWeight: 700 }}>{user?.name}</h2>
        <p style={{ fontSize: '0.85rem' }}>{user?.email}</p>

        <div style={{ marginTop: '0.75rem' }}>
          <span className="badge" style={{
            background: `${ROLE_COLOR[user?.role]}22`,
            color: ROLE_COLOR[user?.role]
          }}>
            {user?.role?.toUpperCase()}
          </span>
        </div>

        <div className="divider" />

        <div style={{ textAlign: 'left' }}>
          {user?.department && <p>Department: {user.department}</p>}
          {user?.phone && <p>Phone: {user.phone}</p>}
        </div>
      </div>

      {/* ================= RIGHT SIDE ================= */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

        {/* EDIT PROFILE */}
        <div className="card">
          <h3>✏️ Edit Profile</h3>

          <input
            className="form-input"
            value={form.name}
            onChange={e => set('name', e.target.value)}
            placeholder="Name"
          />

          <input
            className="form-input"
            value={form.phone}
            onChange={e => set('phone', e.target.value)}
            placeholder="Phone"
          />

          <input
            className="form-input"
            value={form.department}
            onChange={e => set('department', e.target.value)}
            placeholder="Department"
          />

          <button className="btn btn-primary" onClick={handleProfileUpdate} disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

        {/* PASSWORD */}
        <div className="card">
          <h3>🔐 Change Password</h3>

          <input
            type="password"
            placeholder="Current Password"
            className="form-input"
            value={pwForm.currentPassword}
            onChange={e => setPwForm(f => ({ ...f, currentPassword: e.target.value }))}
          />

          <input
            type="password"
            placeholder="New Password"
            className="form-input"
            value={pwForm.newPassword}
            onChange={e => setPwForm(f => ({ ...f, newPassword: e.target.value }))}
          />

          <input
            type="password"
            placeholder="Confirm Password"
            className="form-input"
            value={pwForm.confirm}
            onChange={e => setPwForm(f => ({ ...f, confirm: e.target.value }))}
          />

          <button className="btn btn-secondary" onClick={handlePasswordChange} disabled={pwLoading}>
            {pwLoading ? 'Updating...' : 'Update Password'}
          </button>
        </div>

      </div>
    </div>
  </div>
);
}