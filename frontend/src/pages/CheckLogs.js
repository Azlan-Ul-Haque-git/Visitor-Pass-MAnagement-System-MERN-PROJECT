import React, { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function CheckLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 25 });
      if (actionFilter) params.set('action', actionFilter);
      if (dateFilter) params.set('date', dateFilter);
      const res = await api.get(`/checklogs?${params}`);
      setLogs(res.data.logs);
      setTotal(res.data.total);
    } catch (e) { toast.error('Failed to load logs'); }
    finally { setLoading(false); }
  }, [actionFilter, dateFilter, page]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const exportCSV = () => {
    const headers = ['Visitor', 'Company', 'Action', 'Gate', 'Method', 'Time', 'By'];
    const rows = logs.map(l => [
      l.visitor?.name, l.visitor?.company || '', l.action, l.gate, l.scanMethod,
      new Date(l.timestamp).toLocaleString(), l.performedBy?.name || ''
    ]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `check-logs-${new Date().toISOString().split('T')[0]}.csv`; a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV exported!');
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Check Logs</h1>
          <p className="page-subtitle">{total} total entries</p>
        </div>
        <button className="btn btn-ghost" onClick={exportCSV}>📥 Export CSV</button>
      </div>

      <div className="search-bar">
        <select className="form-select" style={{ width: 180 }} value={actionFilter} onChange={e => { setActionFilter(e.target.value); setPage(1); }}>
          <option value="">All Actions</option>
          <option value="check-in">Check In</option>
          <option value="check-out">Check Out</option>
        </select>
        <input className="form-input" type="date" value={dateFilter} onChange={e => { setDateFilter(e.target.value); setPage(1); }} style={{ width: 180 }} />
        {(actionFilter || dateFilter) && <button className="btn btn-ghost btn-sm" onClick={() => { setActionFilter(''); setDateFilter(''); }}>✕ Clear</button>}
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr><th>Visitor</th><th>Action</th><th>Pass</th><th>Gate</th><th>Method</th><th>Timestamp</th><th>Performed By</th></tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '3rem' }}><span className="spinner" style={{ margin: '0 auto' }} /></td></tr>
              ) : logs.length === 0 ? (
                <tr><td colSpan={7}><div className="empty-state"><div style={{ fontSize: '2.5rem' }}>📋</div><h3>No logs found</h3></div></td></tr>
              ) : logs.map(log => (
                <tr key={log._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <div className="avatar" style={{ width: 30, height: 30, fontSize: '0.8rem' }}>
                        {log.visitor?.photo ? <img src={`http://localhost:5000${log.visitor.photo}`} alt="" /> : log.visitor?.name?.charAt(0)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text)' }}>{log.visitor?.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--subtext0)' }}>{log.visitor?.company}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${log.action === 'check-in' ? 'badge-green' : 'badge-blue'}`}>
                      {log.action === 'check-in' ? '↓ Check In' : '↑ Check Out'}
                    </span>
                  </td>
                  <td><span className="mono" style={{ fontSize: '0.78rem', color: 'var(--blue)' }}>{log.pass?.passNumber}</span></td>
                  <td style={{ fontSize: '0.85rem' }}>{log.gate}</td>
                  <td><span className={`badge ${log.scanMethod === 'qr' ? 'badge-mauve' : 'badge-peach'}`}>{log.scanMethod}</span></td>
                  <td>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text)' }}>{new Date(log.timestamp).toLocaleDateString()}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--subtext0)' }}>{new Date(log.timestamp).toLocaleTimeString()}</div>
                  </td>
                  <td style={{ fontSize: '0.85rem' }}>{log.performedBy?.name || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {total > 25 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.75rem', padding: '1rem', borderTop: '1px solid var(--surface0)' }}>
            <button className="btn btn-ghost btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
            <span style={{ color: 'var(--subtext0)', fontSize: '0.85rem' }}>Page {page} of {Math.ceil(total / 25)}</span>
            <button className="btn btn-ghost btn-sm" disabled={page >= Math.ceil(total / 25)} onClick={() => setPage(p => p + 1)}>Next →</button>
          </div>
        )}
      </div>
    </div>
  );
}
