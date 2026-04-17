import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const StatCard = ({ label, value, sub, color, icon }) => (
  <div className="stat-card" style={{ borderTop: `3px solid ${color}` }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <span className="stat-label">{label}</span>
      <span style={{ fontSize: '1.4rem' }}>{icon}</span>
    </div>
    <div className="stat-value" style={{ color }}>{value ?? '—'}</div>
    {sub && <div className="stat-sub">{sub}</div>}
  </div>
);

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/stats').then(r => setData(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '50vh' }}>
      <span className="spinner" style={{ width: 40, height: 40 }} />
    </div>
  );

  const { stats = {}, weeklyCheckins = [], recentActivity = [] } = data || {};

  const chartData = weeklyCheckins.map(d => ({
    date: new Date(d._id).toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' }),
    'Check-ins': d.count
  }));

  const CustomTooltip = ({ active, payload, label }) => active && payload?.length ? (
    <div style={{ background: 'var(--crust)', border: '1px solid var(--surface0)', borderRadius: 8, padding: '0.75rem' }}>
      <p style={{ color: 'var(--subtext0)', fontSize: '0.8rem', marginBottom: '0.3rem' }}>{label}</p>
      <p style={{ color: 'var(--blue)', fontWeight: 600 }}>{payload[0].value} check-ins</p>
    </div>
  ) : null;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Welcome back, {user?.name?.split(' ')[0]}! 👋</h1>
          <p className="page-subtitle">{new Date().toLocaleDateString('en', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <StatCard label="Total Visitors" value={stats.totalVisitors} sub="All time" color="var(--blue)" icon="👥" />
        <StatCard label="Today's Visitors" value={stats.todayVisitors} sub="Registered today" color="var(--green)" icon="📅" />
        <StatCard label="Currently Inside" value={stats.checkedIn} sub="Checked in now" color="var(--peach)" icon="🏢" />
        <StatCard label="Active Passes" value={stats.activePasses} sub="Valid passes" color="var(--mauve)" icon="🪪" />
        <StatCard label="Pending Approvals" value={stats.pendingAppointments} sub="Awaiting action" color="var(--yellow)" icon="⏳" />
        <StatCard label="Today's Meetings" value={stats.todayAppointments} sub="Scheduled today" color="var(--teal)" icon="🗓️" />
        {user?.role === 'admin' && <StatCard label="Active Users" value={stats.totalUsers} sub="Staff members" color="var(--sapphire)" icon="⚙️" />}
        <StatCard label="Total Passes" value={stats.totalPasses} sub="All issued" color="var(--flamingo)" icon="🎫" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Chart */}
        <div className="card" style={{ gridColumn: chartData.length ? '1' : '1 / -1' }}>
          <h3 style={{ fontWeight: 600, marginBottom: '1.25rem', color: 'var(--text)' }}>📈 Weekly Check-ins</h3>
          {chartData.length === 0 ? (
            <div className="empty-state" style={{ padding: '2rem' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📊</div>
              <p style={{ color: 'var(--subtext0)' }}>No check-in data yet</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--surface0)" />
                <XAxis dataKey="date" tick={{ fill: 'var(--subtext0)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--subtext0)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="Check-ins" fill="var(--blue)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Recent Activity */}
        <div className="card">
          <h3 style={{ fontWeight: 600, marginBottom: '1.25rem', color: 'var(--text)' }}>⚡ Recent Activity</h3>
          {recentActivity.length === 0 ? (
            <div className="empty-state" style={{ padding: '2rem' }}><p>No recent activity</p></div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {recentActivity.map((log, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem', borderRadius: 8, background: 'var(--base)' }}>
                  <span style={{ fontSize: '1.1rem' }}>{log.action === 'check-in' ? '✅' : '🚶'}</span>
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {log.visitor?.name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--subtext0)' }}>
                      {log.action === 'check-in' ? 'Checked in' : 'Checked out'} · {new Date(log.timestamp).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  <span className={`badge ${log.action === 'check-in' ? 'badge-green' : 'badge-blue'}`}>{log.action}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
