import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { orderService } from '../../services/orderService';
import './MyOrders.css';

const fmt = (value) =>
  Number(value || 0).toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showReturnModal, setShowReturnModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [returnReason, setReturnReason] = useState('Size/Fit Issue');
  const [returnComments, setReturnComments] = useState('');
  const [refundMethod, setRefundMethod] = useState('original');
  const [upiId, setUpiId] = useState('');

  const loadOrders = () => {
    setLoading(true);
    orderService.getMyOrders()
      .then(data => {
        setOrders(data || []);
      })
      .catch(err => {
        console.error('Failed to load orders', err);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadOrders();
  }, []);

  if (loading) {
    return (
      <div className="my-orders-page container">
        <h1>My Orders</h1>
        <p>Loading orders...</p>
      </div>
    );
  }

  const handleRequestReturnSubmit = async (e) => {
    e.preventDefault();
    if (!selectedOrder || !selectedItem) return;

    const returnData = {
      reason: returnReason,
      comments: returnComments,
      refundMethod,
      upiId: refundMethod === 'upi' ? upiId : '',
    };

    try {
      await orderService.requestReturn(selectedOrder._id, selectedItem._id, returnData);
      
      window.dispatchEvent(new CustomEvent('add_notification', {
        detail: {
          text: `Return request submitted for "${selectedItem.name}". Status: UNDER REVIEW.`
        }
      }));

      setShowReturnModal(false);
      setReturnComments('');
      setUpiId('');
      loadOrders();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to submit return request.');
    }
  };

  return (
    <div className="my-orders-page container">
      <h1>My Orders</h1>
      
      {orders.length === 0 ? (
        <div className="empty-state">
          <h3>No orders found</h3>
          <p>You haven't placed any orders yet</p>
          <Link to="/products" className="btn btn-primary">Start Shopping</Link>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map(order => (
            <div className="order-card" key={order._id}>
              <div className="order-header">
                <div>
                  <span className="order-id">Order #{order.orderNumber}</span>
                  <span className="order-date">Placed on {new Date(order.createdAt).toLocaleDateString()}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span className={`order-status ${order.status.toLowerCase()}`}>{order.status}</span>
                </div>
              </div>

              <div className="order-items" style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '15px 20px', borderBottom: '1px solid #eee' }}>
                {(order.vendorOrders ? order.vendorOrders.flatMap(v => {
                  return (v.items || []).map(item => ({ ...item, vendorOrderId: v._id, vendorOrderStatus: v.status }));
                }) : (order.products || [])).map((p, idx) => {
                  const isDelivered = order.status.toLowerCase() === 'delivered';
                  const returnDays = p.product?.returnDays !== undefined ? p.product.returnDays : 7;
                  const isReturnable = returnDays > 0;
                  const hasReturn = p.returnStatus && p.returnStatus !== 'none';

                  return (
                    <div className="order-item" key={`${order._id}-${idx}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 15, paddingBottom: 15, borderBottom: idx < (order.vendorOrders ? order.vendorOrders.flatMap(v => v.items).length - 1 : order.products.length - 1) ? '1px dashed #eee' : 'none' }}>
                      <div style={{ display: 'flex', gap: 15, alignItems: 'center' }}>
                        <img src={p.image || (p.images && p.images[0]?.url)} alt={p.name} style={{ width: 60, height: 60, borderRadius: 8, objectFit: 'cover', border: '1px solid #e5e7eb' }} />
                        <div className="order-item-info" style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          <Link to={`/products/${p.product?._id || p.product || p._id}`} style={{ fontWeight: 600, color: '#1f2937', textDecoration: 'none' }}>{p.name}</Link>
                          <span style={{ fontSize: '0.85rem', color: '#4b5563' }}>{fmt(p.price)} • Qty: {p.quantity || 1}</span>
                          {!isReturnable ? (
                            <span style={{ fontSize: '0.75rem', color: '#dc2626', fontWeight: 600, width: 'fit-content', background: '#fee2e2', padding: '2px 8px', borderRadius: 4, marginTop: 4 }}>Non-returnable</span>
                          ) : (
                            <span style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 600, width: 'fit-content', background: '#d1fae5', padding: '2px 8px', borderRadius: 4, marginTop: 4 }}>{returnDays}-day returns eligible</span>
                          )}
                        </div>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {isDelivered && isReturnable && (
                          hasReturn ? (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                              <span style={{ 
                                background: p.returnStatus === 'completed' ? '#d1fae5' : p.returnStatus === 'rejected' ? '#fee2e2' : '#fef3c7', 
                                color: p.returnStatus === 'completed' ? '#065f46' : p.returnStatus === 'rejected' ? '#991b1b' : '#92400e', 
                                fontSize: '0.75rem', 
                                fontWeight: 700, 
                                padding: '4px 10px', 
                                borderRadius: 12,
                                border: '1px solid currentColor',
                                textTransform: 'uppercase'
                              }}>
                                Return: {p.returnStatus === 'requested' ? 'Pending Approval' : p.returnStatus === 'completed' ? 'Refund Processed' : p.returnStatus}
                              </span>
                              <button 
                                onClick={() => { setSelectedOrder(order); setSelectedItem(p); setShowStatusModal(true); }}
                                className="btn btn-outline btn-sm"
                                style={{ fontSize: '0.75rem', padding: '2px 8px', minWidth: 'auto', border: 'none', color: '#2563eb', textDecoration: 'underline', background: 'none', cursor: 'pointer', fontWeight: 600 }}
                              >
                                Track Return
                              </button>
                            </div>
                          ) : (
                            <button 
                              onClick={() => { setSelectedOrder(order); setSelectedItem(p); setShowReturnModal(true); }}
                              className="btn btn-outline btn-sm"
                              style={{ color: '#dc2626', borderColor: '#dc2626', fontWeight: 600, padding: '6px 12px', fontSize: '0.75rem', borderRadius: 6, cursor: 'pointer' }}
                            >
                              Request Return
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="order-footer">
                <span>Total: {fmt(order.total)}</span>
                <div className="order-actions">
                  <Link to={`/track/${order._id || order.orderId}`} className="btn btn-outline btn-sm">Track Order</Link>
                  <Link to="/products" className="btn btn-outline btn-sm">Buy Again</Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* REQUEST RETURN FORM MODAL */}
      {showReturnModal && selectedOrder && selectedItem && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
        }}>
          <div style={{
            background: '#fff', width: '100%', maxWidth: 500, borderRadius: 10,
            boxShadow: '0 8px 24px rgba(0,0,0,0.18)', overflow: 'hidden',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
          }}>
            <div style={{ background: '#dc2626', padding: '15px 20px', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 600 }}>Request Return & Refund</h3>
              <button onClick={() => setShowReturnModal(false)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1.4rem', cursor: 'pointer' }}>&times;</button>
            </div>
            <form onSubmit={handleRequestReturnSubmit} style={{ padding: 20 }}>
              <p style={{ margin: '0 0 15px 0', fontSize: '0.9rem', color: '#4b5563' }}>
                Item: <strong style={{ color: '#111827' }}>{selectedItem.name}</strong> • Qty: <strong>{selectedItem.quantity || 1}</strong> • Price: <strong>{fmt(selectedItem.price)}</strong>
              </p>
              
              <div style={{ marginBottom: 15 }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: 5 }}>Reason for Return</label>
                <select 
                  value={returnReason} 
                  onChange={(e) => setReturnReason(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: 6, fontSize: '0.9rem' }}
                >
                  <option>Defective/Damaged Item</option>
                  <option>Wrong Product Delivered</option>
                  <option>Size/Fit Issue</option>
                  <option>Quality Not as Expected</option>
                  <option>Other</option>
                </select>
              </div>

              <div style={{ marginBottom: 15 }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: 5 }}>Explain why you want to return this</label>
                <textarea 
                  rows="3" 
                  value={returnComments} 
                  onChange={(e) => setReturnComments(e.target.value)}
                  placeholder="Tell us what went wrong..." 
                  required
                  style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: 6, fontSize: '0.9rem', resize: 'vertical' }}
                />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: 5 }}>Refund Method</label>
                <div style={{ display: 'flex', gap: 15, marginTop: 5 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.9rem', cursor: 'pointer' }}>
                    <input type="radio" name="refund" value="original" checked={refundMethod === 'original'} onChange={() => setRefundMethod('original')} />
                    <span>Original Payment Mode</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.9rem', cursor: 'pointer' }}>
                    <input type="radio" name="refund" value="upi" checked={refundMethod === 'upi'} onChange={() => setRefundMethod('upi')} />
                    <span>UPI Refund</span>
                  </label>
                </div>
              </div>

              {refundMethod === 'upi' && (
                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: 5 }}>UPI ID for refund</label>
                  <input 
                    type="text" 
                    value={upiId} 
                    onChange={(e) => setUpiId(e.target.value)} 
                    placeholder="e.g. user@okaxis" 
                    required 
                    style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: 6, fontSize: '0.9rem' }}
                  />
                </div>
              )}

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', borderTop: '1px solid #e5e7eb', paddingTop: 15 }}>
                <button type="button" onClick={() => setShowReturnModal(false)} className="btn btn-outline" style={{ padding: '8px 15px', minWidth: 'auto', borderRadius: 6 }}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ padding: '8px 15px', minWidth: 'auto', background: '#dc2626', border: 'none', borderRadius: 6 }}>Submit Return Request</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW RETURN STATUS & STEPPER MODAL */}
      {showStatusModal && selectedOrder && selectedItem && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
        }}>
          <div style={{
            background: '#fff', width: '100%', maxWidth: 550, borderRadius: 10,
            boxShadow: '0 8px 24px rgba(0,0,0,0.18)', overflow: 'hidden',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
          }}>
            {/* Header */}
            <div style={{ background: '#16a34a', padding: '15px 20px', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 600 }}>Return Tracking</h3>
                <span style={{ fontSize: '0.75rem', color: '#d1fae5' }}>Item: {selectedItem.name} • Order #{selectedOrder.orderNumber}</span>
              </div>
              <button onClick={() => setShowStatusModal(false)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1.4rem', cursor: 'pointer' }}>&times;</button>
            </div>

            {/* Stepper Body */}
            <div style={{ padding: '24px 30px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24, position: 'relative' }}>
                {/* Connector line */}
                <div style={{
                  position: 'absolute', left: 15, top: 15, bottom: 15, width: 2,
                  background: '#e5e7eb', zIndex: 1
                }} />

                {/* Step 1: Requested */}
                <div style={{ display: 'flex', gap: 15, position: 'relative', zIndex: 2 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%',
                    background: '#16a34a', color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.9rem'
                  }}>✓</div>
                  <div>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '0.95rem', fontWeight: 600, color: '#111827' }}>Return Requested</h4>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#4b5563' }}>Reason: "{selectedItem.returnReason}"</p>
                    {selectedItem.returnRequestedAt && (
                      <p style={{ margin: '2px 0 0 0', fontSize: '0.75rem', color: '#9ca3af' }}>Requested on {new Date(selectedItem.returnRequestedAt).toLocaleString()}</p>
                    )}
                  </div>
                </div>

                {/* Step 2: Approved */}
                <div style={{ display: 'flex', gap: 15, position: 'relative', zIndex: 2 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%',
                    background: ['approved', 'picked_up', 'completed'].includes(selectedItem.returnStatus) ? '#16a34a' : '#e5e7eb',
                    color: ['approved', 'picked_up', 'completed'].includes(selectedItem.returnStatus) ? '#fff' : '#9ca3af',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.9rem'
                  }}>
                    {['approved', 'picked_up', 'completed'].includes(selectedItem.returnStatus) ? '✓' : '2'}
                  </div>
                  <div>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '0.95rem', fontWeight: 600, color: ['approved', 'picked_up', 'completed'].includes(selectedItem.returnStatus) ? '#111827' : '#9ca3af' }}>
                      Request Approved
                    </h4>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#4b5563' }}>
                      {['approved', 'picked_up', 'completed'].includes(selectedItem.returnStatus) 
                        ? 'Your return request has been reviewed and approved by the vendor. Pick-up is being arranged!' 
                        : selectedItem.returnStatus === 'rejected' ? 'Return request was declined by vendor.' : 'Awaiting merchant review.'}
                    </p>
                  </div>
                </div>

                {/* Step 3: Picked Up */}
                <div style={{ display: 'flex', gap: 15, position: 'relative', zIndex: 2 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%',
                    background: ['completed'].includes(selectedItem.returnStatus) ? '#16a34a' : '#e5e7eb',
                    color: ['completed'].includes(selectedItem.returnStatus) ? '#fff' : '#9ca3af',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.9rem'
                  }}>
                    {['completed'].includes(selectedItem.returnStatus) ? '✓' : '3'}
                  </div>
                  <div>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '0.95rem', fontWeight: 600, color: ['completed'].includes(selectedItem.returnStatus) ? '#111827' : '#9ca3af' }}>
                      Item Received
                    </h4>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#4b5563' }}>
                      {['completed'].includes(selectedItem.returnStatus) 
                        ? 'Item received at the fulfillment warehouse and passed quality check.' 
                        : 'Awaiting item pick-up and warehouse delivery.'}
                    </p>
                  </div>
                </div>

                {/* Step 4: Refund Processed */}
                <div style={{ display: 'flex', gap: 15, position: 'relative', zIndex: 2 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%',
                    background: selectedItem.returnStatus === 'completed' ? '#16a34a' : '#e5e7eb',
                    color: selectedItem.returnStatus === 'completed' ? '#fff' : '#9ca3af',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.9rem'
                  }}>
                    {selectedItem.returnStatus === 'completed' ? '✓' : '4'}
                  </div>
                  <div>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '0.95rem', fontWeight: 600, color: selectedItem.returnStatus === 'completed' ? '#16a34a' : '#9ca3af' }}>
                      Refund Processed
                    </h4>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#4b5563' }}>
                      {selectedItem.returnStatus === 'completed' 
                        ? `Refund of ${fmt(selectedItem.price * (selectedItem.quantity || 1))} credited successfully via ${selectedItem.refundMethod === 'upi' ? 'UPI ID: ' + selectedItem.upiId : 'Original Payment Mode'}.` 
                        : `Refund will be initiated once the package is received and checked.`}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ background: '#f9fafb', padding: '12px 20px', display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #e5e7eb' }}>
              <button onClick={() => setShowStatusModal(false)} className="btn btn-primary" style={{ padding: '8px 18px', minWidth: 'auto', background: '#16a34a', border: 'none', borderRadius: 6 }}>
                Close Tracker
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyOrders;