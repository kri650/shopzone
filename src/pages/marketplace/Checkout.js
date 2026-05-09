import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { orderService } from '../../services/orderService';
import './Checkout.css';

const fmt = (value) =>
  Number(value || 0).toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });

const Checkout = () => {
  const { cart, subtotal, total, clearCart, couponCode, discount, applyCoupon, removeCoupon } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  const [promoInput, setPromoInput] = useState('');
  const [promoError, setPromoError] = useState('');
  const [promoSuccess, setPromoSuccess] = useState('');

  const [showMockPayment, setShowMockPayment] = useState(false);
  const [paymentStep, setPaymentStep] = useState('input'); // 'input', 'processing', 'success'
  const [cardDetails, setCardDetails] = useState({ number: '4111 2222 3333 4444', expiry: '12/28', cvv: '123' });
  const [upiId, setUpiId] = useState('customer@okaxis');

  const defaultAddr = user?.addresses?.find((a) => a.isDefault) || user?.addresses?.[0];
  const [selectedAddressId, setSelectedAddressId] = useState(defaultAddr?._id || '');
  const [formData, setFormData] = useState({
    name: defaultAddr?.fullName || user?.name || '',
    phone: defaultAddr?.phone || user?.phone || '',
    address: defaultAddr?.addressLine1 || '',
    city: defaultAddr?.city || '',
    state: defaultAddr?.state || '',
    pincode: defaultAddr?.pincode || '',
    payment: 'cod'
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const selectAddress = (id) => {
    setSelectedAddressId(id);
    const addr = user?.addresses?.find((a) => a._id === id);
    if (!addr) return;
    setFormData((p) => ({
      ...p,
      name: addr.fullName,
      phone: addr.phone,
      address: addr.addressLine1,
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode
    }));
  };

  const handleApplyPromo = async (e) => {
    e.preventDefault();
    setPromoError('');
    setPromoSuccess('');
    if (!promoInput.trim()) return;
    try {
      await applyCoupon(promoInput.trim());
      setPromoSuccess(`Coupon "${promoInput.trim().toUpperCase()}" applied successfully!`);
      setPromoInput('');
    } catch (err) {
      setPromoError(err.message || err.response?.data?.message || 'Invalid coupon code.');
    }
  };

  const handleRemovePromo = async () => {
    try {
      await removeCoupon();
      setPromoSuccess('');
      setPromoError('');
    } catch (err) {
      setPromoError('Could not remove coupon.');
    }
  };

  const executeOrderPlacement = async () => {
    setSubmitting(true);
    try {
      const order = await orderService.createOrder({
        shippingAddress: {
          fullName: formData.name,
          phone: formData.phone,
          addressLine1: formData.address,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
          country: 'India'
        },
        paymentMethod: formData.payment
      });
      await clearCart();
      window.dispatchEvent(new CustomEvent('add_notification', {
        detail: {
          text: `Your order #${order.orderNumber} for ${fmt(total)} has been placed successfully! Track its delivery status.`
        }
      }));
      navigate(`/order-success?orderId=${order._id}&orderNumber=${order.orderNumber}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not place order.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleMockPay = () => {
    setPaymentStep('processing');
    setTimeout(() => {
      setPaymentStep('success');
      setTimeout(async () => {
        setShowMockPayment(false);
        await executeOrderPlacement();
      }, 1500);
    }, 2000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (formData.payment === 'card' || formData.payment === 'upi') {
      setShowMockPayment(true);
      setPaymentStep('input');
      return;
    }
    
    await executeOrderPlacement();
  };

  if (cart.length === 0) {
    return (
      <div className="checkout-page container">
        <div className="empty-state">
          <h3>Your cart is empty</h3>
          <p>Add items to your cart before checkout</p>
          <button className="btn btn-primary" onClick={() => navigate('/products')}>Continue Shopping</button>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page container">
      <h1>Checkout</h1>
      
      <div className="checkout-content">
        <form className="checkout-form" onSubmit={handleSubmit}>
          <div className="checkout-section">
            <h2>Delivery Address</h2>
            {user?.addresses?.length > 0 && (
              <div className="form-group">
                <label>Select Saved Address</label>
                <select value={selectedAddressId} onChange={(e) => selectAddress(e.target.value)}>
                  {user.addresses.map((a) => (
                    <option key={a._id} value={a._id}>
                      {a.label} — {a.city} ({a.pincode}){a.isDefault ? ' • Default' : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className="form-row">
              <div className="form-group">
                <label>Full Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required />
              </div>
            </div>
            <div className="form-group">
              <label>Address</label>
              <textarea name="address" value={formData.address} onChange={handleChange} rows="3" required />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>City</label>
                <input type="text" name="city" value={formData.city} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>State</label>
                <input type="text" name="state" value={formData.state} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Pincode</label>
                <input type="text" name="pincode" value={formData.pincode} onChange={handleChange} required />
              </div>
            </div>
          </div>

          <div className="checkout-section">
            <h2>Payment Method</h2>
            <div className="payment-options">
              <label className="payment-option">
                <input type="radio" name="payment" value="cod" checked={formData.payment === 'cod'} onChange={handleChange} />
                <span>Cash on Delivery</span>
              </label>
              <label className="payment-option">
                <input type="radio" name="payment" value="card" checked={formData.payment === 'card'} onChange={handleChange} />
                <span>Credit/Debit Card</span>
              </label>
              <label className="payment-option">
                <input type="radio" name="payment" value="upi" checked={formData.payment === 'upi'} onChange={handleChange} />
                <span>UPI Payment</span>
              </label>
            </div>
          </div>

          {error && <div className="alert alert-error">{error}</div>}
          <button type="submit" className="btn btn-primary btn-lg" disabled={submitting}>
            {submitting ? 'Placing Order...' : 'Place Order'}
          </button>
        </form>

        <div className="checkout-summary">
          <h2>Order Summary</h2>
          <div className="summary-items">
            {cart.map(item => (
              <div className="summary-item" key={item._id}>
                <span>{item.name} × {item.qty}</span>
                <span>{fmt(item.price * item.qty)}</span>
              </div>
            ))}
          </div>

          <div className="promo-section" style={{ borderTop: '1px solid #eee', paddingTop: 15, marginTop: 15 }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: 10, color: '#333' }}>Promo Code</h3>
            {couponCode ? (
              <div className="applied-promo" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#e6f4ea', padding: '8px 12px', borderRadius: 4, marginBottom: 10 }}>
                <div>
                  <span style={{ fontWeight: 'bold', color: '#137333', fontSize: '0.9rem' }}>{couponCode}</span>
                  <span style={{ color: '#137333', fontSize: '0.8rem', marginLeft: 8 }}>(Discount: {fmt(discount)})</span>
                </div>
                <button type="button" onClick={handleRemovePromo} className="btn-link" style={{ background: 'none', border: 'none', color: '#c5221f', cursor: 'pointer', fontSize: '0.85rem', textDecoration: 'underline' }}>Remove</button>
              </div>
            ) : (
              <div className="promo-form" style={{ display: 'flex', gap: 8 }}>
                <input 
                  type="text" 
                  placeholder="e.g. SAVE10" 
                  value={promoInput} 
                  onChange={(e) => setPromoInput(e.target.value)} 
                  style={{ flex: 1, padding: '8px 12px', border: '1px solid #ccc', borderRadius: 4 }} 
                />
                <button type="button" onClick={handleApplyPromo} className="btn btn-outline" style={{ padding: '8px 16px', minWidth: 'auto', border: '1px solid #333' }}>Apply</button>
              </div>
            )}
            {promoError && <p style={{ color: '#d93025', fontSize: '0.8rem', marginTop: 5, marginBottom: 0 }}>{promoError}</p>}
            {promoSuccess && <p style={{ color: '#137333', fontSize: '0.8rem', marginTop: 5, marginBottom: 0 }}>{promoSuccess}</p>}
            <p style={{ color: '#666', fontSize: '0.75rem', marginTop: 8, fontStyle: 'italic', lineHeight: '1.3' }}>
              Try demo codes: <strong style={{color:'#333'}}>SAVE10</strong> (10% off), <strong style={{color:'#333'}}>DEMO20</strong> (20% off), <strong style={{color:'#333'}}>WELCOME50</strong> (50% off), or <strong style={{color:'#333'}}>FLAT100</strong> (Flat ₹100 off on ₹500+ orders)
            </p>
          </div>

          <div className="summary-breakdown" style={{ borderTop: '1px solid #eee', paddingTop: 15, marginTop: 15, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#555' }}>
              <span>Subtotal</span>
              <span>{fmt(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#137333' }}>
                <span>Discount</span>
                <span>-{fmt(discount)}</span>
              </div>
            )}
            <div className="summary-total" style={{ borderTop: '1px solid #eee', paddingTop: 10, marginTop: 5 }}>
              <span>Total</span>
              <span>{fmt(total)}</span>
            </div>
          </div>
        </div>
      </div>

      {showMockPayment && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.65)',
          backdropFilter: 'blur(8px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20
        }}>
          <div style={{
            background: '#fff',
            width: '100%',
            maxWidth: 480,
            borderRadius: 12,
            overflow: 'hidden',
            boxShadow: '0 12px 32px rgba(0,0,0,0.25)',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
          }}>
            {/* Payment Header */}
            <div style={{ background: '#123456', padding: '20px 24px', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>ShopZone Secure Pay</h3>
                <span style={{ fontSize: '0.8rem', color: '#a0c0e0' }}>Merchant: ShopZone India</span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.8rem', display: 'block', color: '#a0c0e0' }}>Amount to Pay</span>
                <strong style={{ fontSize: '1.2rem' }}>{fmt(total)}</strong>
              </div>
            </div>

            {/* Payment Steps Content */}
            <div style={{ padding: 24, minHeight: 240, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              {paymentStep === 'input' && (
                <div>
                  <h4 style={{ margin: '0 0 16px 0', fontSize: '1.05rem', color: '#333' }}>
                    Select & complete your mock payment
                  </h4>
                  {formData.payment === 'card' ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', color: '#666', marginBottom: 4 }}>Card Number</label>
                        <input 
                          type="text" 
                          value={cardDetails.number} 
                          onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })}
                          style={{ width: '100%', padding: '10px 12px', border: '1px solid #ccc', borderRadius: 6, fontSize: '1rem', letterSpacing: '1px' }} 
                        />
                      </div>
                      <div style={{ display: 'flex', gap: 12 }}>
                        <div style={{ flex: 1 }}>
                          <label style={{ display: 'block', fontSize: '0.8rem', color: '#666', marginBottom: 4 }}>Expiry (MM/YY)</label>
                          <input 
                            type="text" 
                            value={cardDetails.expiry} 
                            onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                            placeholder="MM/YY" 
                            style={{ width: '100%', padding: '10px 12px', border: '1px solid #ccc', borderRadius: 6, fontSize: '1rem' }} 
                          />
                        </div>
                        <div style={{ flex: 1 }}>
                          <label style={{ display: 'block', fontSize: '0.8rem', color: '#666', marginBottom: 4 }}>CVV</label>
                          <input 
                            type="password" 
                            maxLength="3" 
                            value={cardDetails.cvv} 
                            onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                            placeholder="•••" 
                            style={{ width: '100%', padding: '10px 12px', border: '1px solid #ccc', borderRadius: 6, fontSize: '1rem' }} 
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: '#666', marginBottom: 4 }}>UPI ID / VPA</label>
                      <input 
                        type="text" 
                        value={upiId} 
                        onChange={(e) => setUpiId(e.target.value)}
                        placeholder="e.g. user@upi" 
                        style={{ width: '100%', padding: '10px 12px', border: '1px solid #ccc', borderRadius: 6, fontSize: '1rem' }} 
                      />
                    </div>
                  )}

                  <div style={{ marginTop: 24, display: 'flex', gap: 12 }}>
                    <button 
                      type="button" 
                      onClick={() => setShowMockPayment(false)} 
                      style={{ flex: 1, padding: '12px', border: '1px solid #ccc', background: '#fff', borderRadius: 6, cursor: 'pointer', fontWeight: 600, color: '#666' }}
                    >
                      Cancel
                    </button>
                    <button 
                      type="button" 
                      onClick={handleMockPay} 
                      style={{ flex: 2, padding: '12px', border: 'none', background: '#123456', color: '#fff', borderRadius: 6, cursor: 'pointer', fontWeight: 600, boxShadow: '0 4px 12px rgba(18,52,86,0.25)' }}
                    >
                      Pay Securely {fmt(total)}
                    </button>
                  </div>
                </div>
              )}

              {paymentStep === 'processing' && (
                <div style={{ textAlign: 'center' }}>
                  <div className="spinner-mock" style={{
                    width: 50, height: 50,
                    border: '4px solid #f3f3f3',
                    borderTop: '4px solid #123456',
                    borderRadius: '50%',
                    margin: '0 auto 20px auto',
                    animation: 'spin-mock 1s linear infinite'
                  }} />
                  <style>{`
                    @keyframes spin-mock {
                      0% { transform: rotate(0deg); }
                      100% { transform: rotate(360deg); }
                    }
                  `}</style>
                  <h4 style={{ margin: '0 0 8px 0', fontSize: '1.2rem', color: '#333' }}>Processing Payment...</h4>
                  <p style={{ color: '#666', margin: 0, fontSize: '0.9rem' }}>Please do not close this window or hit back button.</p>
                </div>
              )}

              {paymentStep === 'success' && (
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    width: 60, height: 60,
                    borderRadius: '50%',
                    background: '#e6f4ea',
                    color: '#137333',
                    fontSize: '2rem',
                    lineHeight: '60px',
                    margin: '0 auto 20px auto',
                    fontWeight: 'bold'
                  }}>
                    ✓
                  </div>
                  <h4 style={{ margin: '0 0 8px 0', fontSize: '1.25rem', color: '#137333' }}>Payment Successful!</h4>
                  <p style={{ color: '#666', margin: 0, fontSize: '0.9rem' }}>Redirecting to order confirmation page...</p>
                </div>
              )}
            </div>

            {/* secure SSL badge */}
            <div style={{ background: '#f5f5f5', padding: '12px 24px', textAlign: 'center', borderTop: '1px solid #e5e5e5', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6, color: '#888', fontSize: '0.75rem' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" style={{ verticalAlign: 'middle' }}>
                <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
              </svg>
              <span>100% Secure SSL • PCI-DSS Compliant</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;
