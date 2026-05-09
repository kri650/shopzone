import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import './Cart.css';

const fmt = (value) =>
  Number(value || 0).toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });

const Cart = () => {
  const { cart, removeFromCart, updateQty, total, count } = useCart();
  const navigate = useNavigate();

  if (cart.length === 0) {
    return (
      <div className="cart-page container">
        <div className="empty-state">
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1">
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <path d="M16 10a4 4 0 0 1-8 0"/>
          </svg>
          <h3>Your cart is empty</h3>
          <p>Add items to your cart to see them here</p>
          <Link to="/products" className="btn btn-primary">Continue Shopping</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page container">
      <h1 className="cart-title">Shopping Cart</h1>
      
      <div className="cart-content">
        <div className="cart-items">
          {cart.map(item => (
            <div className="cart-item" key={item.cartItemId || item._id}>
              <div className="cart-item-img">
                <img src={item.image || '/placeholder.png'} alt={item.name} />
              </div>
              <div className="cart-item-details">
                <Link to={`/products/${item._id}`} className="cart-item-name">{item.name || 'Unknown Product'}</Link>
                <p className="cart-item-brand">{item.brand}</p>
                <p className="cart-item-price">{fmt(item.price)}</p>
                <div className="cart-item-actions">
                  <div className="qty-control">
                    <button onClick={() => updateQty(item._id, item.qty - 1)}>-</button>
                    <span>{item.qty}</span>
                    <button onClick={() => updateQty(item._id, item.qty + 1)}>+</button>
                  </div>
                  <button className="btn-remove" onClick={() => removeFromCart(item._id)}>Remove</button>
                </div>
              </div>
              <div className="cart-item-total">
                {fmt(item.price * item.qty)}
              </div>
            </div>
          ))}
        </div>

        <div className="cart-summary">
          <div className="summary-card">
            <h3>Order Summary</h3>
            <div className="summary-row">
              <span>Subtotal ({count} items)</span>
              <span>{fmt(total)}</span>
            </div>
            <div className="summary-row">
              <span>Shipping</span>
              <span className="text-success">FREE</span>
            </div>
            <div className="summary-row summary-total">
              <span>Total</span>
              <span>{fmt(total)}</span>
            </div>
            <button className="btn btn-primary btn-lg" onClick={() => navigate('/checkout')}>
              Proceed to Checkout
            </button>
            <Link to="/products" className="continue-shopping">Continue Shopping</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;