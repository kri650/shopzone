import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './CustomerLogin.css';

const VendorLogin = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const userData = {
      _id: 'v1',
      name: 'Vendor Name',
      email: formData.email,
      role: 'vendor'
    };
    login('mock-token', userData);
    navigate('/');
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Vendor Sign In</h1>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} required />
          </div>
          <button type="submit" className="btn btn-primary btn-lg">Sign In</button>
        </form>
        <p className="auth-switch">
          New vendor? <Link to="/vendor/register">Register your business</Link>
        </p>
      </div>
    </div>
  );
};

export default VendorLogin;