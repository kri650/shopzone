import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { orderService } from '../../services/orderService';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ total: 0, pending: 0, delivered: 0 });
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    orderService.getMyOrders().then(data => {
      const orders = data || [];
      setRecentOrders(orders.slice(0, 5));
      setStats({
        total: orders.length,
        pending: orders.filter(o => o.status === 'pending' || o.status === 'processing').length,
        delivered: orders.filter(o => o.status === 'delivered').length
      });
    });
  }, []);

  const fmt = (v) => Number(v || 0).toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });

  return (
    <div className="dashboard-page container">
      <div className="dashboard-header">
        <h1>Welcome back, {user?.name?.split(' ')[0]}!</h1>
        <p>Manage your orders, profile, and security here.</p>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>Total Orders</h3>
          <div className="stat-value">{stats.total}</div>
        </div>
        <div className="stat-card">
          <h3>In Progress</h3>
          <div className="stat-value">{stats.pending}</div>
        </div>
        <div className="stat-card">
          <h3>Delivered</h3>
          <div className="stat-value">{stats.delivered}</div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-section recent-orders">
          <div className="section-header">
            <h2>Recent Orders</h2>
            <Link to="/my-orders" className="link">View All</Link>
          </div>
          {recentOrders.length > 0 ? (
            <div className="order-list">
              {recentOrders.map(order => (
                <div key={order._id} className="order-item-mini">
                  <div className="order-info">
                    <span className="order-id">#{ (order._id || order.orderId || 'Unknown').toString().slice(-8).toUpperCase() }</span>
                    <span className="order-date">{new Date(order.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="order-meta">
                    <span className="order-amount">{fmt(order.total)}</span>
                    <span className={`status-badge ${order.status}`}>{order.status}</span>
                  </div>
                  <Link to={`/track/${order._id}`} className="btn btn-outline btn-sm">Track</Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-orders">
              <p>No orders yet.</p>
              <Link to="/products" className="btn btn-primary">Start Shopping</Link>
            </div>
          )}
        </div>

        <div className="dashboard-section quick-actions">
          <h2>Quick Actions</h2>
          <div className="action-grid">
            <Link to="/account" className="action-card">
              <svg className="action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              <span>Profile Settings</span>
            </Link>
            <Link to="/wishlist" className="action-card">
              <svg className="action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
              <span>My Wishlist</span>
            </Link>
            <Link to="/cart" className="action-card">
              <svg className="action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="9" cy="21" r="1"/>
                <circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
              </svg>
              <span>Go to Cart</span>
            </Link>
            <Link to="/products" className="action-card">
              <svg className="action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                <line x1="2" y1="21" x2="22" y2="21"/>
                <line x1="12" y1="17" x2="12" y2="21"/>
              </svg>
              <span>Browse Products</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
