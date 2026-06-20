import React, { useEffect, useState } from 'react';
import { reportsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Reports() {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({ title: '', description: '' });
  const [file, setFile] = useState(null);

  const fetchReports = async () => {
    try {
      const { data } = await reportsAPI.getAll();
      setReports(data.data);
    } catch {
      setError('Failed to load reports.');
    }
    setLoading(false);
  };

  useEffect(() => { fetchReports(); }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return setError('Please select a file.');
    setError('');
    setUploading(true);

    const formData = new FormData();
    formData.append('report', file);
    formData.append('title', form.title);
    formData.append('description', form.description);

    try {
      await reportsAPI.upload(formData);
      setSuccess('Report uploaded successfully!');
      setForm({ title: '', description: '' });
      setFile(null);
      e.target.reset();
      await fetchReports();
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed.');
    }
    setUploading(false);
  };

  const formatSize = (bytes) => {
    if (!bytes) return '';
    return bytes > 1024 * 1024
      ? `${(bytes / 1024 / 1024).toFixed(1)} MB`
      : `${(bytes / 1024).toFixed(0)} KB`;
  };

  return (
    <div className="page">
      <h1 style={{ marginBottom: '1.5rem' }}>Medical Reports</h1>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>Upload Report</h3>
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}
        <form onSubmit={handleUpload}>
          <div className="grid-2">
            <div className="form-group">
              <label>Report Title *</label>
              <input
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                placeholder="Blood Test, X-Ray, etc."
                required
              />
            </div>
            <div className="form-group">
              <label>Description</label>
              <input
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                placeholder="Optional notes"
              />
            </div>
          </div>
          <div className="form-group">
            <label>Select File * (PDF, Image, Word - max 10MB)</label>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              onChange={e => setFile(e.target.files[0])}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={uploading}>
            {uploading ? 'Uploading...' : 'Upload Report'}
          </button>
        </form>
      </div>

      <h2 style={{ marginBottom: '1rem' }}>My Reports</h2>
      {loading ? <div className="spinner" /> : (
        <>
          {reports.length === 0 && (
            <div className="card text-center text-muted">No reports uploaded yet.</div>
          )}
          <div className="grid-2">
            {reports.map(r => (
              <div key={r._id} className="card">
                <div className="flex justify-between items-center">
                  <div style={{ flex: 1 }}>
                    <h4 style={{ color: 'var(--primary)' }}>{r.title}</h4>
                    <p className="text-muted" style={{ fontSize: '0.85rem' }}>{r.description}</p>
                    <p style={{ fontSize: '0.8rem', marginTop: '0.4rem', color: 'var(--gray-600)' }}>
                      {r.fileName} {r.fileSize ? `(${formatSize(r.fileSize)})` : ''} |{' '}
                      {new Date(r.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <a
                    href={r.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline"
                    style={{ marginLeft: '1rem', whiteSpace: 'nowrap' }}
                  >
                    View
                  </a>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
