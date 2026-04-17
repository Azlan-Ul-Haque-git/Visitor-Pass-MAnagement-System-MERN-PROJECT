import React, { useState } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function ScanPass() {
  const [passNumber, setPassNumber] = useState('');
  const [gate, setGate] = useState('Main Gate');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const handleVerify = async () => {
    if (!passNumber.trim()) return toast.error('Enter a pass number');
    setLoading(true); setResult(null);
    try {
      const res = await api.get(`/passes/verify/${passNumber.trim().toUpperCase()}`);
      setResult(res.data);
    } catch (e) { toast.error(e.response?.data?.message || 'Pass not found'); }
    finally { setLoading(false); }
  };

  const handleScan = async () => {
    setActionLoading(true);
    try {
      const res = await api.post('/checklogs/scan', { passNumber: passNumber.trim().toUpperCase(), gate });
      toast.success(`${res.data.action === 'check-in' ? '✅ Checked In' : '🚶 Checked Out'}: ${res.data.log.visitor?.name}`);
      handleVerify();
    } catch (e) { toast.error(e.response?.data?.message || 'Scan failed'); }
    finally { setActionLoading(false); }
  };

  const GATES = ['Main Gate', 'Side Gate', 'Parking Gate', 'Emergency Exit'];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">📷 Scan & Verify Pass</h1>
          <p className="page-subtitle">Enter pass number manually or scan QR code</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* Input panel */}
        <div className="card">
          <h3 style={{ fontWeight: 600, marginBottom: '1.25rem' }}>Enter Pass Details</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Pass Number</label>
              <input className="form-input" value={passNumber} onChange={e => setPassNumber(e.target.value.toUpperCase())}
                placeholder="VP-20241201-ABCD1"
                onKeyDown={e => e.key === 'Enter' && handleVerify()}
                style={{ fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.08em' }}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Gate</label>
              <select className="form-select" value={gate} onChange={e => setGate(e.target.value)}>
                {GATES.map(g => <option key={g}>{g}</option>)}
              </select>
            </div>
            <button className="btn btn-primary" onClick={handleVerify} disabled={loading} style={{ justifyContent: 'center' }}>
              {loading ? <span className="spinner" /> : '🔍 Verify Pass'}
            </button>
          </div>

          <div className="divider" />
          
          <div style={{ background: 'var(--base)', borderRadius: 8, padding: '1rem', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>📱</div>
            <p style={{ color: 'var(--subtext0)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>QR Scanner Support</p>
            <p style={{ color: 'var(--overlay0)', fontSize: '0.78rem' }}>
              Use a physical QR scanner connected as keyboard input — it will auto-fill the pass number field and submit.
            </p>
          </div>
        </div>

        {/* Result panel */}
        <div>
          {!result ? (
            <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem', opacity: 0.4 }}>🪪</div>
              <h3 style={{ color: 'var(--subtext0)' }}>Scan or enter a pass number to verify</h3>
            </div>
          ) : (
            <div className={`card ${result.valid ? '' : ''}`} style={{ borderTop: `4px solid ${result.valid ? 'var(--green)' : 'var(--red)'}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
                <span style={{ fontSize: '2.5rem' }}>{result.valid ? '✅' : '❌'}</span>
                <div>
                  <h3 style={{ fontWeight: 700, color: result.valid ? 'var(--green)' : 'var(--red)', fontSize: '1.2rem' }}>
                    {result.valid ? 'Pass Valid' : `Invalid: ${result.reason || 'Unknown'}`}
                  </h3>
                  <div className="mono" style={{ color: 'var(--blue)', fontSize: '0.9rem' }}>{result.pass?.passNumber}</div>
                </div>
              </div>

              {result.pass && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {[
                    ['👤', 'Visitor', result.pass.visitor?.name],
                    ['📱', 'Phone', result.pass.visitor?.phone],
                    ['🏢', 'Company', result.pass.visitor?.company || '—'],
                    ['👔', 'Host', result.pass.host?.name || '—'],
                    ['🎯', 'Purpose', result.pass.purpose || '—'],
                    ['🏛️', 'Access', result.pass.accessAreas?.join(', ') || '—'],
                    ['⏰', 'Valid Until', new Date(result.pass.validUntil).toLocaleString()],
                    ['📊', 'Last Action', result.lastAction || 'None'],
                  ].map(([icon, label, val]) => (
                    <div key={label} style={{ display: 'flex', gap: '0.5rem', fontSize: '0.85rem', padding: '0.4rem', background: 'var(--base)', borderRadius: 6 }}>
                      <span>{icon}</span>
                      <span style={{ color: 'var(--subtext0)', minWidth: 80 }}>{label}:</span>
                      <span style={{ color: 'var(--text)', fontWeight: 500 }}>{val}</span>
                    </div>
                  ))}
                </div>
              )}

              {result.valid && (
                <div style={{ marginTop: '1.25rem', display: 'flex', gap: '0.75rem' }}>
                  <button className="btn btn-success" onClick={handleScan} disabled={actionLoading} style={{ flex: 1, justifyContent: 'center' }}>
                    {actionLoading ? <span className="spinner" /> : (result.lastAction === 'check-in' ? '🚶 Check Out' : '✅ Check In')}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
