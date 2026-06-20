import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { appointmentsAPI } from '../services/api';

export default function Appointments() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [updating, setUpdating] = useState(null);

  const fetchAppointments = async () => {
    try {
      const { data } = await appointmentsAPI.getAll();
      setAppointments(data.data);
    } catch {
      setError('Failed to load appointments.');
    }
    setLoading(false);
  };

  useEffect(() => { fetchAppointments(); }, []);

  const handleUpdate = async (id, status) => {
    setUpdating(id);
    try {
      await appointmentsAPI.update(id, { status });
      await fetchAppointments();
    } catch (err) {
      alert(err.response?.data?.message || 'Update failed.');
    }
    setUpdating(null);
  };

  const filtered = filter === 'all' ? appointments : appointments.filter(a => a.status === filter);

  return (
    <div className="page">
      <h1 style={{ marginBottom: '1.5rem' }}>Appointments</h1>

      <div className="flex gap-1" style={{ marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {['all','pending','confirmed','completed','cancelled'].map(s => (
          <button
            key={s}
            className={`btn ${filter === s ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setFilter(s)}
            style={{ textTransform: 'capitalize' }}
          >
            {s}
          </button>
        ))}
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {loading ? <div className="spinner" /> : (
        <>
          {filtered.length === 0 && (
            <div className="card text-center text-muted">No appointments found.</div>
          )}
          {filtered.map(appt => (
            <div key={appt._id} className="card">
              <div className="flex justify-between items-center" style={{ flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <h3>
                    {user.role === 'patient'
                      ? `Dr. ${appt.doctor?.name}`
                      : appt.patient?.name}
                  </h3>
                  <p className="text-muted" style={{ fontSize: '0.9rem' }}>
                    {user.role === 'patient'
                      ? appt.doctor?.specialization
                      : appt.patient?.email}
                  </p>
                  <p style={{ fontSize: '0.9rem', marginTop: '0.3rem' }}>
                    {new Date(appt.date).toLocaleDateString('en-IN', { dateStyle: 'long' })} at {appt.timeSlot}
                  </p>
                  <p className="text-muted" style={{ fontSize: '0.85rem' }}>Reason: {appt.reason}</p>
                  {appt.prescription && (
                    <p style={{ fontSize: '0.85rem', color: 'var(--success)' }}>
                      Prescription: {appt.prescription}
                    </p>
                  )}
                </div>
                <span className={`badge badge-${appt.status}`}>{appt.status}</span>
              </div>

              {appt.status !== 'completed' && appt.status !== 'cancelled' && (
                <div className="flex gap-1 mt-2">
                  {user.role === 'patient' && (
                    <button
                      className="btn btn-danger"
                      disabled={updating === appt._id}
                      onClick={() => handleUpdate(appt._id, 'cancelled')}
                    >
                      Cancel
                    </button>
                  )}
                  {user.role === 'doctor' && (
                    <>
                      {appt.status === 'pending' && (
                        <button
                          className="btn btn-primary"
                          disabled={updating === appt._id}
                          onClick={() => handleUpdate(appt._id, 'confirmed')}
                        >
                          Confirm
                        </button>
                      )}
                      <button
                        className="btn btn-success"
                        disabled={updating === appt._id}
                        onClick={() => handleUpdate(appt._id, 'completed')}
                      >
                        Mark Completed
                      </button>
                      <button
                        className="btn btn-danger"
                        disabled={updating === appt._id}
                        onClick={() => handleUpdate(appt._id, 'cancelled')}
                      >
                        Cancel
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          ))}
        </>
      )}
    </div>
  );
}
