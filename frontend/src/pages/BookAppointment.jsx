import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doctorsAPI, appointmentsAPI } from '../services/api';

const TIME_SLOTS = ['09:00','09:30','10:00','10:30','11:00','11:30','12:00',
  '14:00','14:30','15:00','15:30','16:00','16:30','17:00'];

export default function BookAppointment() {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [form, setForm] = useState({ date: '', timeSlot: '', reason: '', notes: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    doctorsAPI.getById(doctorId)
      .then(({ data }) => setDoctor(data.data))
      .catch(() => setError('Doctor not found.'));
  }, [doctorId]);

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await appointmentsAPI.create({ ...form, doctor: doctorId });
      setSuccess('Appointment booked successfully!');
      setTimeout(() => navigate('/appointments'), 1500);
    } catch (err) {
      const msg = err.response?.data?.errors?.[0]?.msg || err.response?.data?.message || 'Booking failed.';
      setError(msg);
    }
    setLoading(false);
  };

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  return (
    <div className="page" style={{ maxWidth: '560px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '1.5rem' }}>Book Appointment</h1>

      {doctor && (
        <div className="card" style={{ background: 'var(--primary-light)', marginBottom: '1.5rem' }}>
          <h3 style={{ color: 'var(--primary)' }}>Dr. {doctor.name}</h3>
          <p>{doctor.specialization} | {doctor.experience} yrs exp | Rs.{doctor.consultationFee}</p>
        </div>
      )}

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Appointment Date *</label>
            <input type="date" value={form.date} onChange={set('date')} min={minDate} required />
          </div>
          <div className="form-group">
            <label>Time Slot *</label>
            <select value={form.timeSlot} onChange={set('timeSlot')} required>
              <option value="">Select a time</option>
              {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Reason for Visit *</label>
            <textarea
              value={form.reason}
              onChange={set('reason')}
              rows={3}
              placeholder="Describe your symptoms or reason..."
              required
            />
          </div>
          <div className="form-group">
            <label>Additional Notes</label>
            <textarea
              value={form.notes}
              onChange={set('notes')}
              rows={2}
              placeholder="Any allergies, medications, etc."
            />
          </div>
          <div className="flex gap-1">
            <button type="button" className="btn btn-outline" onClick={() => navigate('/doctors')}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Booking...' : 'Confirm Booking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
