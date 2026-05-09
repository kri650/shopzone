import React from 'react';
import { VENDOR_PRODUCTS, VENDOR_ORDERS, fmt } from '../../utils/dummyData';
import './VendorDashboard.css';

const VendorDashboard = () => {
  const totalRevenue = VENDOR_ORDERS.reduce((sum, o) => sum + o.amount, 0);
  const pendingOrders = VENDOR_ORDERS.filter(o => o.status === 'pending').length;
  const totalProducts = VENDOR_PRODUCTS.length;

  return (
    <div className="vendor-dashboard">
      <div className="dashboard-header">
        <h1>Vendor Dashboard</h1>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Revenue</h3>
          <div className="stat-value">{fmt(totalRevenue)}</div>
        </div>
        <div className="stat-card">
          <h3>Pending Orders</h3>
          <div className="stat-value">{pendingOrders}</div>
        </div>
        <div className="stat-card">
          <h3>Total Products</h3>
          <div className="stat-value">{totalProducts}</div>
        </div>
        <div className="stat-card">
          <h3>Total Orders</h3>
          <div className="stat-value">{VENDOR_ORDERS.length}</div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="dashboard-section">
          <h2>Your Products</h2>
          <table className="data-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Sold</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {VENDOR_PRODUCTS.map(product => (
                <tr key={product._id}>
                  <td>{product.name}</td>
                  <td>{fmt(product.price)}</td>
                  <td>{product.stock}</td>
                  <td>{product.sold}</td>
                  <td><span className={`status ${product.status}`}>{product.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="dashboard-section">
          <h2>Recent Orders</h2>
          <table className="data-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Product</th>
                <th>Qty</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {VENDOR_ORDERS.slice(0, 5).map(order => (
                <tr key={order._id}>
                  <td>{order._id}</td>
                  <td>{order.customer}</td>
                  <td>{order.product}</td>
                  <td>{order.qty}</td>
                  <td>{fmt(order.amount)}</td>
                  <td><span className={`status ${order.status}`}>{order.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default VendorDashboard;