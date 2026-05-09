import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './CustomerLogin.css';

const VendorRegister = () => {
  const [formData, setFormData] = useState({ businessName: '', ownerName: '', email: '', password: '', confirmPassword: '' });
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    setLoading(true);
    // Simulate API registration (In production, call authService.register)
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
    }, 1500);
  };

  if (success) {
    return (
      <div className="auth-page">
        <div className="auth-card success-card" style={{ textAlign: 'center', padding: '3rem' }}>
          <div className="success-icon" style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>✅</div>
          <h1 style={{ color: '#2e7d32', marginBottom: '1.5rem' }}>Welcome to ShopZone Seller Hub!</h1>
          <p style={{ fontSize: '1.2rem', color: '#555', marginBottom: '2rem' }}>
            Your seller account has been created successfully.<br />
            <strong>Please complete KYC verification to activate your account and start selling.</strong>
          </p>
          <a 
            href="https://shopzon-vendor-dashboard.vercel.app/login" 
            className="btn btn-primary btn-lg" 
            style={{ textDecoration: 'none', display: 'inline-block', backgroundColor: '#f3a847', color: '#111', padding: '12px 30px', borderRadius: '8px', fontWeight: 'bold' }}
          >
            Go to Vendor Dashboard
          </a>
          <p style={{ marginTop: '2rem', fontSize: '0.9rem', color: '#888' }}>
            Redirecting you in a few seconds...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Vendor Registration</h1>
        <p className="muted" style={{ marginBottom: '2rem' }}>Join thousands of sellers on India's most loved marketplace.</p>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Business Name</label>
            <input type="text" name="businessName" value={formData.businessName} onChange={handleChange} required placeholder="e.g. Acme Retail" />
          </div>
          <div className="form-group">
            <label>Owner Name</label>
            <input type="text" name="ownerName" value={formData.ownerName} onChange={handleChange} required placeholder="Your full name" />
          </div>
          <div className="form-group">
            <label>Email Address</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="email@business.com" />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} required minLength={8} />
          </div>
          <div className="form-group">
            <label>Confirm Password</label>
            <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required />
          </div>
          <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ width: '100%', marginTop: '1rem' }}>
            {loading ? 'Creating Account...' : 'Register as Seller'}
          </button>
        </form>
        
        <p className="auth-switch" style={{ marginTop: '2rem' }}>
          Already have a seller account? <a href="https://shopzon-vendor-dashboard.vercel.app/login">Sign in to Hub</a>
        </p>
      </div>
    </div>
  );
};

export default VendorRegister;