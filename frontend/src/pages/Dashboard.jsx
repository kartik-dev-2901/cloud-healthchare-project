import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { appointmentsAPI, reportsAPI } from '../services/api';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ appointments: [], reports: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [apptRes, repRes] = await Promise.all([
          appointmentsAPI.getAll(),
          reportsAPI.getAll()
        ]);
        setStats({ appointments: apptRes.data.data, reports: repRes.data.data });
      } catch {}
      setLoading(false);
    };
    fetchStats();
  }, []);

  const pending = stats.appointments.filter(a => a.status === 'pending').length;
  const confirmed = stats.appointments.filter(a => a.status === 'confirmed').length;
  const completed = stats.appointments.filter(a => a.status === 'completed').length;
  const upcoming = stats.appointments
    .filter(a => ['pending','confirmed'].includes(a.status) && new Date(a.date) >= new Date())
    .slice(0, 3);

  return (
    <div className="page">
      <h1 style={{ marginBottom: '0.25rem' }}>Welcome, {user.name}!</h1>
      <p className="text-muted" style={{ marginBottom: '2rem' }}>
        Role: <strong>{user.role}</strong>
      </p>

      {loading ? <div className="spinner" /> : (
        <>
          <div className="grid-3" style={{ marginBottom: '2rem' }}>
            <div className="card text-center">
              <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--warning)' }}>{pending}</div>
              <div className="text-muted">Pending</div>
            </div>
            <div className="card text-center">
              <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--primary)' }}>{confirmed}</div>
              <div className="text-muted">Confirmed</div>
            </div>
            <div className="card text-center">
              <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--success)' }}>{completed}</div>
              <div className="text-muted">Completed</div>
            </div>
          </div>

          {upcoming.length > 0 && (
            <div className="card">
              <h3 style={{ marginBottom: '1rem' }}>Upcoming Appointments</h3>
              {upcoming.map(a => (
                <div key={a._id} style={{ padding: '0.75rem 0', borderBottom: '1px solid var(--gray-200)' }}>
                  <div className="flex justify-between items-center">
                    <div>
                      <strong>{user.role === 'patient' ? `Dr. ${a.doctor?.name}` : a.patient?.name}</strong>
                      <span className="text-muted" style={{ marginLeft: '0.5rem', fontSize: '0.85rem' }}>
                        {new Date(a.date).toLocaleDateString()} at {a.timeSlot}
                      </span>
                    </div>
                    <span className={`badge badge-${a.status}`}>{a.status}</span>
                  </div>
                </div>
              ))}
              <Link to="/appointments" className="btn btn-outline mt-2" style={{ marginTop: '1rem' }}>
                View All Appointments
              </Link>
            </div>
          )}

          <div className="grid-2" style={{ marginTop: '1rem' }}>
            {user.role === 'patient' && (
              <Link to="/doctors" className="card" style={{ textDecoration: 'none', color: 'inherit' }}>
                <h3 style={{ color: 'var(--primary)' }}>Find a Doctor</h3>
                <p className="text-muted mt-1">Browse specialists and book appointments</p>
              </Link>
            )}
            <Link to="/reports" className="card" style={{ textDecoration: 'none', color: 'inherit' }}>
              <h3 style={{ color: 'var(--primary)' }}>Medical Reports</h3>
              <p className="text-muted mt-1">{stats.reports.length} report(s) available</p>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
