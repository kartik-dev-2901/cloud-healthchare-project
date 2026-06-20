import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const styles = {
  nav: {
    background: '#2b6cb0',
    color: 'white',
    padding: '0 1.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '60px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
  },
  brand: { color: 'white', fontWeight: '700', fontSize: '1.2rem', textDecoration: 'none' },
  links: { display: 'flex', gap: '1.5rem', alignItems: 'center' },
  link: { color: 'rgba(255,255,255,0.9)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: '500' },
  logoutBtn: {
    background: 'rgba(255,255,255,0.15)',
    color: 'white',
    border: '1px solid rgba(255,255,255,0.3)',
    padding: '0.4rem 1rem',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.85rem',
    fontWeight: '600'
  }
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav style={styles.nav}>
      <Link to="/" style={styles.brand}>HealthCare</Link>
      {user ? (
        <div style={styles.links}>
          <Link to="/" style={styles.link}>Dashboard</Link>
          <Link to="/doctors" style={styles.link}>Doctors</Link>
          <Link to="/appointments" style={styles.link}>Appointments</Link>
          <Link to="/reports" style={styles.link}>Reports</Link>
          <span style={{ ...styles.link, opacity: 0.7 }}>
            {user.name} ({user.role})
          </span>
          <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
        </div>
      ) : (
        <div style={styles.links}>
          <Link to="/login" style={styles.link}>Login</Link>
          <Link to="/register" style={styles.link}>Register</Link>
        </div>
      )}
    </nav>
  );
}
