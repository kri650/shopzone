import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import './OrderSuccess.css';

const OrderSuccess = () => {
  const [params] = useSearchParams();
  const orderNumber = params.get('orderNumber') || 'Order confirmed';
  const orderId = params.get('orderId');
  
  return (
    <div className="order-success-page container">
      <div className="success-card">
        <div className="success-icon">✓</div>
        <h1>Order Placed Successfully!</h1>
        <p className="order-number">Order #{orderNumber}</p>
        <p className="success-message">
          Thank you for your purchase. Your order has been placed successfully.
          You will receive a confirmation email shortly.
        </p>
        <div className="success-actions">
          <Link to="/my-orders" className="btn btn-primary">View My Orders</Link>
          {orderId && <Link to={`/track/${orderId}`} className="btn btn-outline">Track Order</Link>}
          <Link to="/products" className="btn btn-outline">Continue Shopping</Link>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;