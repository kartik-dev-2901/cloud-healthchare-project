import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';

export default function Register() {
  const [form, setForm] = useState({
    name: '', email: '', password: '', phone: '',
    dateOfBirth: '', gender: '', bloodGroup: '', address: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await authAPI.register(form);
      login(data.user, data.token);
      navigate('/');
    } catch (err) {
      const msg = err.response?.data?.errors?.[0]?.msg || err.response?.data?.message || 'Registration failed.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page" style={{ maxWidth: '560px', margin: '2rem auto' }}>
      <div className="card">
        <h2 style={{ marginBottom: '1.5rem', textAlign: 'center', color: 'var(--primary)' }}>
          Patient Registration
        </h2>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="grid-2">
            <div className="form-group">
              <label>Full Name *</label>
              <input value={form.name} onChange={set('name')} placeholder="John Doe" required />
            </div>
            <div className="form-group">
              <label>Email *</label>
              <input type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" required />
            </div>
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label>Password *</label>
              <input type="password" value={form.password} onChange={set('password')} placeholder="Min 6 characters" required />
            </div>
            <div className="form-group">
              <label>Phone *</label>
              <input value={form.phone} onChange={set('phone')} placeholder="+91 9876543210" required />
            </div>
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label>Date of Birth *</label>
              <input type="date" value={form.dateOfBirth} onChange={set('dateOfBirth')} required />
            </div>
            <div className="form-group">
              <label>Gender *</label>
              <select value={form.gender} onChange={set('gender')} required>
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label>Blood Group</label>
              <select value={form.bloodGroup} onChange={set('bloodGroup')}>
                <option value="">Select blood group</option>
                {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Address</label>
              <input value={form.address} onChange={set('address')} placeholder="City, State" />
            </div>
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Registering...' : 'Create Account'}
          </button>
        </form>
        <p className="text-center mt-2 text-muted">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
