import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { doctorsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Doctors() {
  const { user } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [specialization, setSpecialization] = useState('');

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const { data } = await doctorsAPI.getAll({ search, specialization });
      setDoctors(data.data);
    } catch {
      setError('Failed to load doctors.');
    }
    setLoading(false);
  };

  useEffect(() => { fetchDoctors(); }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchDoctors();
  };

  return (
    <div className="page">
      <h1 style={{ marginBottom: '1.5rem' }}>Find a Doctor</h1>

      <form onSubmit={handleSearch} className="card flex gap-1" style={{ flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div className="form-group" style={{ flex: 1, minWidth: '200px', marginBottom: 0 }}>
          <label>Search by Name</label>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Dr. Smith..." />
        </div>
        <div className="form-group" style={{ flex: 1, minWidth: '180px', marginBottom: 0 }}>
          <label>Specialization</label>
          <input value={specialization} onChange={e => setSpecialization(e.target.value)} placeholder="Cardiology..." />
        </div>
        <button type="submit" className="btn btn-primary" style={{ marginBottom: '0.1rem' }}>Search</button>
      </form>

      {error && <div className="alert alert-error">{error}</div>}
      {loading ? <div className="spinner" /> : (
        <>
          <p className="text-muted" style={{ marginBottom: '1rem' }}>{doctors.length} doctor(s) found</p>
          <div className="grid-2">
            {doctors.map(doc => (
              <div key={doc._id} className="card">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 style={{ color: 'var(--primary)' }}>Dr. {doc.name}</h3>
                    <p className="text-muted">{doc.specialization}</p>
                  </div>
                  <span style={{ fontSize: '2rem' }}>+</span>
                </div>
                <div style={{ margin: '0.8rem 0', fontSize: '0.9rem' }}>
                  <p><strong>Qualification:</strong> {doc.qualification}</p>
                  <p><strong>Experience:</strong> {doc.experience} years</p>
                  <p><strong>Fee:</strong> Rs.{doc.consultationFee}</p>
                  <p><strong>Available:</strong> {doc.availableDays?.join(', ')}</p>
                  <p><strong>Timing:</strong> {doc.availableTimeStart} - {doc.availableTimeEnd}</p>
                </div>
                {user.role === 'patient' && (
                  <Link to={`/book/${doc._id}`} className="btn btn-primary">Book Appointment</Link>
                )}
              </div>
            ))}
          </div>
          {doctors.length === 0 && (
            <div className="card text-center text-muted">No doctors found matching your criteria.</div>
          )}
        </>
      )}
    </div>
  );
}
