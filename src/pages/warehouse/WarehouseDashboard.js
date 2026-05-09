import React from 'react';
import { WAREHOUSE_SHIPMENTS, fmt } from '../../utils/dummyData';
import './WarehouseDashboard.css';

const WarehouseDashboard = () => {
  const totalShipments = WAREHOUSE_SHIPMENTS.length;
  const inTransit = WAREHOUSE_SHIPMENTS.filter(s => s.status === 'in_transit').length;
  const delivered = WAREHOUSE_SHIPMENTS.filter(s => s.status === 'delivered').length;
  const pending = WAREHOUSE_SHIPMENTS.filter(s => s.status === 'pending' || s.status === 'packed').length;

  return (
    <div className="warehouse-dashboard">
      <div className="dashboard-header">
        <h1>Warehouse Dashboard</h1>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Shipments</h3>
          <div className="stat-value">{totalShipments}</div>
        </div>
        <div className="stat-card">
          <h3>In Transit</h3>
          <div className="stat-value">{inTransit}</div>
        </div>
        <div className="stat-card">
          <h3>Delivered</h3>
          <div className="stat-value">{delivered}</div>
        </div>
        <div className="stat-card">
          <h3>Pending</h3>
          <div className="stat-value">{pending}</div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="dashboard-section">
          <h2>Shipments</h2>
          <table className="data-table">
            <thead>
              <tr>
                <th>Tracking ID</th>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Product</th>
                <th>Status</th>
                <th>Assigned Date</th>
              </tr>
            </thead>
            <tbody>
              {WAREHOUSE_SHIPMENTS.map(shipment => (
                <tr key={shipment._id}>
                  <td>{shipment.trackingId}</td>
                  <td>{shipment.orderId}</td>
                  <td>{shipment.customer}</td>
                  <td>{shipment.product}</td>
                  <td><span className={`status ${shipment.status}`}>{shipment.status.replace('_', ' ')}</span></td>
                  <td>{shipment.assignedDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default WarehouseDashboard;