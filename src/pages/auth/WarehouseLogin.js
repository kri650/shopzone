import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './CustomerLogin.css';

const WarehouseLogin = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const userData = {
      _id: 'w1',
      name: 'Warehouse Staff',
      email: formData.email,
      role: 'warehouse'
    };
    login(userData, 'mock-token');
    navigate('/warehouse');
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Warehouse Sign In</h1>
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
      </div>
    </div>
  );
};

export default WarehouseLogin;