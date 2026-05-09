import React from 'react';
import { ADMIN_VENDORS, ADMIN_ORDERS, SALES_DATA, ADMIN_USERS, fmt } from '../../utils/dummyData';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const totalRevenue = ADMIN_ORDERS.reduce((sum, o) => sum + o.amount, 0);
  const pendingVendors = ADMIN_VENDORS.filter(v => v.status === 'pending').length;
  const pendingOrders = ADMIN_ORDERS.filter(o => o.status === 'pending').length;

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Revenue</h3>
          <div className="stat-value">{fmt(totalRevenue)}</div>
        </div>
        <div className="stat-card">
          <h3>Pending Vendors</h3>
          <div className="stat-value">{pendingVendors}</div>
        </div>
        <div className="stat-card">
          <h3>Pending Orders</h3>
          <div className="stat-value">{pendingOrders}</div>
        </div>
        <div className="stat-card">
          <h3>Total Vendors</h3>
          <div className="stat-value">{ADMIN_VENDORS.length}</div>
        </div>
        <div className="stat-card">
          <h3>Total Admins</h3>
          <div className="stat-value">{ADMIN_USERS.length}</div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="dashboard-section">
          <h2>Recent Orders</h2>
          <table className="data-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Vendor</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {ADMIN_ORDERS.slice(0, 5).map(order => (
                <tr key={order._id}>
                  <td>{order._id}</td>
                  <td>{order.customer}</td>
                  <td>{order.vendor}</td>
                  <td>{fmt(order.amount)}</td>
                  <td><span className={`status ${order.status}`}>{order.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="dashboard-section">
          <h2>Vendor Applications</h2>
          <table className="data-table">
            <thead>
              <tr>
                <th>Business</th>
                <th>Email</th>
                <th>Status</th>
                <th>KYC</th>
              </tr>
            </thead>
            <tbody>
              {ADMIN_VENDORS.filter(v => v.status === 'pending').map(vendor => (
                <tr key={vendor._id}>
                  <td>{vendor.businessName}</td>
                  <td>{vendor.email}</td>
                  <td><span className={`status ${vendor.status}`}>{vendor.status}</span></td>
                  <td><span className={`status ${vendor.kyc}`}>{vendor.kyc}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;