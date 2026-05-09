import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import './CustomerLogin.css';

const CustomerLogin = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAutofill = () => {
    setFormData({
      email: 'customer@shopzone.local',
      password: 'Customer@12345'
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const data = await authService.login(formData);
      login(data.accessToken, data.user);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Sign In</h1>
        <form onSubmit={handleSubmit}>
          {error && <div className="alert alert-error">{error}</div>}
          <div className="form-group">
            <label>Email or mobile phone number</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} required />
          </div>
          <div className="auth-links">
            <Link to="/forgot-password">Forgot password?</Link>
          </div>
          <button type="submit" className="btn btn-primary btn-lg" disabled={submitting}>
            {submitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="demo-credentials" style={{
          marginTop: '20px',
          padding: '12px',
          backgroundColor: 'rgba(59, 130, 246, 0.08)',
          border: '1px dashed #3b82f6',
          borderRadius: '8px',
          fontSize: '0.875rem',
          textAlign: 'left'
        }}>
          <div style={{ fontWeight: '600', color: '#1e3a8a', marginBottom: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>🔑 Demo Customer Credentials</span>
            <button 
              type="button" 
              onClick={handleAutofill}
              style={{
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '0.75rem',
                cursor: 'pointer',
                fontWeight: '500',
                transition: 'background 0.2s'
              }}
              onMouseOver={(e) => e.target.style.background = '#2563eb'}
              onMouseOut={(e) => e.target.style.background = '#3b82f6'}
            >
              Autofill
            </button>
          </div>
          <div style={{ color: '#1e40af', fontFamily: 'monospace', fontSize: '0.8rem' }}>
            Email: customer@shopzone.local<br/>
            Password: Customer@12345
          </div>
        </div>

        <p className="auth-switch" style={{ marginTop: '20px' }}>
          New to ShopZone? <Link to="/register">Create your account</Link>
        </p>
      </div>
    </div>
  );
};

export default CustomerLogin;
