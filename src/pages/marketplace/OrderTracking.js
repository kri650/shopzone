import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { orderService } from '../../services/orderService';
import './OrderTracking.css';

const OrderTracking = () => {
  const { id } = useParams();
  const [tracking, setTracking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderService.trackOrder(id).then(setTracking).finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div className="tracking-page container"><h1>Track Your Order</h1><p>Loading tracking details...</p></div>;
  }
  if (!tracking) {
    return <div className="tracking-page container"><h1>Track Your Order</h1><p>Tracking details unavailable.</p></div>;
  }

  const latestShipment = tracking.shipments?.[0];
  const steps = tracking.timeline || [];

  return (
    <div className="tracking-page container">
      <div className="tracking-header">
        <h1>Track Your Order</h1>
        <p>Tracking ID: {latestShipment?.trackingId || 'Not assigned yet'}</p>
      </div>

      <div className="tracking-content">
        <div className="tracking-timeline">
          {steps.map((step, i) => (
            <div className={`tracking-step ${step.completed ? 'completed' : ''}`} key={i}>
              <div className="step-indicator">
                <div className="step-dot"></div>
                {i < steps.length - 1 && <div className="step-line"></div>}
              </div>
              <div className="step-info">
                <span className="step-label">{step.label}</span>
                <span className="step-date">{step.time ? new Date(step.time).toLocaleString() : ''}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="tracking-details">
          <div className="detail-card">
            <h3>Order Details</h3>
            <div className="detail-row">
              <span>Customer</span>
              <span>{latestShipment?.deliveryAddress?.fullName || '-'}</span>
            </div>
            <div className="detail-row">
              <span>Order Number</span>
              <span>{tracking.orderNumber}</span>
            </div>
            <div className="detail-row">
              <span>Delivery Address</span>
              <span>
                {latestShipment?.deliveryAddress
                  ? `${latestShipment.deliveryAddress.addressLine1}, ${latestShipment.deliveryAddress.city}, ${latestShipment.deliveryAddress.state} ${latestShipment.deliveryAddress.pincode}`
                  : '-'}
              </span>
            </div>
            <div className="detail-row">
              <span>Current Status</span>
              <span className={`status ${tracking.status}`}>{tracking.status.replace('_', ' ')}</span>
            </div>
          </div>

          <Link to="/my-orders" className="btn btn-outline">Back to Orders</Link>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;