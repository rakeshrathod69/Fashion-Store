import React, { useEffect, useState } from 'react';
import { api, getSession, logout } from '../api';
import { User, ShoppingBag, Heart, Calendar, Printer, XCircle, RefreshCcw, ArrowRight, ArrowLeft } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

export default function Profile() {
  const location = useLocation();
  const navigate = useNavigate();
  const session = getSession();

  const [activeTab, setActiveTab] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('tab') || 'orders';
  });
  const [user, setUser] = useState(session);
  const [orders, setOrders] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [invoiceOrder, setInvoiceOrder] = useState(null); // When set, renders invoice view for printing

  function loadDashboard() {
    if (session) {
      api('/users/me').then(setUser).catch(() => {});
      api('/orders').then(setOrders).catch(() => setOrders([]));
      api('/wishlist').then(setWishlist).catch(() => setWishlist([]));
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab) {
      setActiveTab(tab);
    }
  }, [location.search]);

  async function handleCancelOrder(orderId) {
    if (confirm("Are you sure you want to cancel this order?")) {
      try {
        await api(`/orders/${orderId}/cancel`, { method: 'PUT' });
        loadDashboard();
      } catch (err) {
        alert("Failed to cancel order.");
      }
    }
  }

  async function handleReturnOrder(orderId) {
    if (confirm("Are you sure you want to request a return for this order?")) {
      try {
        await api(`/orders/${orderId}/return`, { method: 'PUT' });
        loadDashboard();
      } catch (err) {
        alert("Failed to request return.");
      }
    }
  }

  async function handleMoveToCart(productId) {
    try {
      await api(`/wishlist/${productId}/move-to-cart`, { method: 'POST' });
      loadDashboard();
    } catch (err) {
      alert("Failed to move item to cart.");
    }
  }

  async function handleRemoveWishlist(productId) {
    try {
      await api(`/wishlist/${productId}`, { method: 'DELETE' });
      loadDashboard();
    } catch (err) {
      console.error(err);
    }
  }

  function printInvoice(order) {
    setInvoiceOrder(order);
    setTimeout(() => {
      window.print();
    }, 300);
  }

  if (!session) {
    return (
      <main className="center empty-state" style={{ padding: '80px 20px', textAlign: 'center' }}>
        <h1 style={{ fontFamily: 'var(--font-heading)' }}>Access Your Profile</h1>
        <p style={{ margin: '12px 0 24px', color: 'var(--text-secondary)' }}>Please login to view your orders, wishlist, and profile details.</p>
        <Link className="primary" to="/login">Sign In</Link>
      </main>
    );
  }

  // Render invoice layout overlay for printing
  if (invoiceOrder) {
    return (
      <main className="panel animate-fade" style={{ maxWidth: '800px', margin: '40px auto', background: '#ffffff', padding: '40px', border: '1px solid #000000' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #000000', paddingBottom: '20px' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-heading)', margin: 0 }}>AURA LUXE</h1>
            <p style={{ margin: '4px 0', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Luxury curated fashion</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <h3 style={{ margin: 0 }}>INVOICE</h3>
            <p style={{ margin: '4px 0', fontSize: '0.85rem' }}>Order #{invoiceOrder.id}</p>
            <p style={{ margin: '4px 0', fontSize: '0.85rem' }}>Date: {new Date(invoiceOrder.createdAt).toLocaleDateString('en-IN')}</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', margin: '30px 0' }}>
          <div>
            <h5 style={{ margin: '0 0 8px', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.5px' }}>Billed To:</h5>
            <p style={{ margin: 0, fontSize: '0.85rem', lineHeight: '1.5' }}>
              <strong>{invoiceOrder.shippingName}</strong><br />
              {invoiceOrder.shippingAddressLine1}<br />
              {invoiceOrder.shippingAddressLine2 && `${invoiceOrder.shippingAddressLine2}, `}{invoiceOrder.shippingCity}, {invoiceOrder.shippingState} - {invoiceOrder.shippingPinCode}<br />
              {invoiceOrder.shippingCountry}
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <h5 style={{ margin: '0 0 8px', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.5px' }}>Payment Info:</h5>
            <p style={{ margin: 0, fontSize: '0.85rem', lineHeight: '1.5' }}>
              Method: {invoiceOrder.payment?.method?.replace('_', ' ')}<br />
              Status: {invoiceOrder.payment?.status}<br />
              Reference: {invoiceOrder.payment?.transactionRef}
            </p>
          </div>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', margin: '30px 0' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #000000', textAlign: 'left', fontSize: '0.85rem', textTransform: 'uppercase' }}>
              <th style={{ padding: '8px 0' }}>Item Description</th>
              <th style={{ padding: '8px 0', textAlign: 'center' }}>Size</th>
              <th style={{ padding: '8px 0', textAlign: 'center' }}>Qty</th>
              <th style={{ padding: '8px 0', textAlign: 'right' }}>Price</th>
              <th style={{ padding: '8px 0', textAlign: 'right' }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {invoiceOrder.items.map(item => (
              <tr key={item.id} style={{ borderBottom: '1px solid #e5e5e5', fontSize: '0.85rem' }}>
                <td style={{ padding: '12px 0' }}>{item.productName}</td>
                <td style={{ padding: '12px 0', textAlign: 'center' }}>{item.size}</td>
                <td style={{ padding: '12px 0', textAlign: 'center' }}>{item.quantity}</td>
                <td style={{ padding: '12px 0', textAlign: 'right' }}>₹{Number(item.price).toLocaleString('en-IN')}</td>
                <td style={{ padding: '12px 0', textAlign: 'right' }}>₹{(Number(item.price) * item.quantity).toLocaleString('en-IN')}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
          <div style={{ width: '280px', fontSize: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', margin: '4px 0' }}>
              <span>Subtotal:</span>
              <span>₹{Number(invoiceOrder.subtotalAmount || invoiceOrder.totalAmount).toLocaleString('en-IN')}</span>
            </div>
            {invoiceOrder.discountAmount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', margin: '4px 0', color: 'green' }}>
                <span>Discount:</span>
                <span>- ₹{Number(invoiceOrder.discountAmount).toLocaleString('en-IN')}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', margin: '4px 0' }}>
              <span>Shipping:</span>
              <span>{Number(invoiceOrder.shippingCharge) === 0 ? 'Free' : `₹${Number(invoiceOrder.shippingCharge).toLocaleString('en-IN')}`}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', margin: '8px 0 0', borderTop: '2px solid #000000', paddingTop: '8px', fontSize: '1rem', fontWeight: 700 }}>
              <span>Grand Total:</span>
              <span>₹{Number(invoiceOrder.totalAmount).toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '50px', borderTop: '1px solid #000000', paddingTop: '20px', textAlign: 'center', fontSize: '0.78rem', color: '#666666' }}>
          <p>Thank you for shopping with AURA LUXE. For return requests or queries, email returns@auraluxe.com</p>
          <button className="primary no-print" onClick={() => setInvoiceOrder(null)} style={{ marginTop: '20px' }}>Close & Return</button>
        </div>
      </main>
    );
  }

  return (
    <main className="profile-tabs-layout animate-fade">
      <button className="back-btn" onClick={() => navigate(-1)} style={{ gridColumn: '1 / -1', width: 'fit-content' }} aria-label="Go Back">
        <ArrowLeft size={14} /> Back
      </button>
      {/* Dashboard Sidebar Navigation */}
      <aside className="profile-sidebar">
        <button 
          className={`profile-tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          <ShoppingBag size={16} style={{ display: 'inline', marginRight: '8px' }} />
          My Orders
        </button>
        <button 
          className={`profile-tab-btn ${activeTab === 'wishlist' ? 'active' : ''}`}
          onClick={() => setActiveTab('wishlist')}
        >
          <Heart size={16} style={{ display: 'inline', marginRight: '8px' }} />
          My Wishlist
        </button>
        <button 
          className={`profile-tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          <User size={16} style={{ display: 'inline', marginRight: '8px' }} />
          Profile Details
        </button>
      </aside>

      {/* Main Tab Content */}
      <section className="profile-main-content">
        {/* Tab 1: Profile Details */}
        {activeTab === 'profile' && (
          <div className="panel animate-fade">
            <h2>Account Details</h2>
            <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <p><strong>Name:</strong> {user?.name}</p>
              <p><strong>Email Address:</strong> {user?.email}</p>
              <p><strong>Phone Number:</strong> {user?.phone || 'No phone added'}</p>
              <p><strong>Default Address:</strong> {user?.address || 'No address added'}</p>
            </div>
          </div>
        )}

        {/* Tab 2: Wishlist */}
        {activeTab === 'wishlist' && (
          <div className="animate-fade">
            <h2>My Wishlist ({wishlist.length})</h2>
            <div className="product-grid" style={{ marginTop: '20px', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}>
              {wishlist.length === 0 && (
                <p className="empty-state" style={{ gridColumn: '1/-1' }}>Your wishlist is currently empty.</p>
              )}
              {wishlist.map(product => (
                <article key={product.id} className="product-card">
                  <div className="product-image">
                    <Link to={`/product/${product.id}`}>
                      <img src={product.imageUrl} alt={product.name} />
                    </Link>
                    <button className="wishlist-trigger active" onClick={() => handleRemoveWishlist(product.id)}>
                      <Heart size={18} fill="#e02424" color="#e02424" />
                    </button>
                  </div>
                  <div className="product-body" style={{ padding: '16px' }}>
                    <div className="brand-name">{product.brand || 'Luxury Edit'}</div>
                    <h3 style={{ fontSize: '1.05rem', margin: '4px 0' }}>
                      <Link to={`/product/${product.id}`}>{product.name}</Link>
                    </h3>
                    <p style={{ fontSize: '0.8rem', minHeight: 'auto', marginBottom: '12px' }}>₹{Number(product.price).toLocaleString('en-IN')}</p>
                    <button className="primary full gold-btn" onClick={() => handleMoveToCart(product.id)}>
                      Move to Bag
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Orders & Tracking */}
        {activeTab === 'orders' && (
          <div className="animate-fade">
            <h2>Order History ({orders.length})</h2>
            <div className="order-list" style={{ marginTop: '20px' }}>
              {orders.length === 0 && (
                <p className="empty-state">No orders placed yet. Checkouts will appear here.</p>
              )}
              {orders.map(order => {
                const isCancelled = order.status === 'CANCELLED';
                const isReturned = order.status === 'RETURNED' || order.status === 'RETURN_REQUESTED';
                
                // Track nodes
                const statuses = ['PLACED', 'CONFIRMED', 'SHIPPED', 'DELIVERED'];
                const currentIndex = statuses.indexOf(order.status);

                return (
                  <article className="order-detail-card animate-slide" key={order.id}>
                    <div className="order-detail-header">
                      <div>
                        <h3>Order #{order.id}</h3>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          Placed on {new Date(order.createdAt).toLocaleDateString('en-IN')}
                        </span>
                      </div>
                      <span className={`status-badge ${order.status.toLowerCase()}`}>
                        {order.status.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="order-detail-body">
                      {/* Tracking timeline */}
                      {!isCancelled && !isReturned && (
                        <div className="tracking-timeline">
                          {statuses.map((s, idx) => {
                            let nodeClass = '';
                            if (idx < currentIndex) nodeClass = 'completed';
                            else if (idx === currentIndex) nodeClass = 'current';
                            
                            return (
                              <div className={`tracking-node ${nodeClass}`} key={s}>
                                <div className="dot">{idx + 1}</div>
                                <span>{s}</span>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Warnings for Cancelled/Returned orders */}
                      {isCancelled && (
                        <div className="notice" style={{ color: 'var(--error)', background: 'var(--error-light)', borderLeftColor: 'var(--error)', margin: '14px 0' }}>
                          This order was cancelled. Refund Status: <strong>{order.refundStatus}</strong>
                        </div>
                      )}

                      {order.status === 'RETURN_REQUESTED' && (
                        <div className="notice" style={{ color: 'var(--warning)', background: 'var(--warning-light)', borderLeftColor: 'var(--warning)', margin: '14px 0' }}>
                          Return request is pending approval. Refund Status: <strong>{order.refundStatus}</strong>
                        </div>
                      )}

                      {order.status === 'RETURNED' && (
                        <div className="notice" style={{ color: 'var(--success)', background: 'var(--success-light)', borderLeftColor: 'var(--success)', margin: '14px 0' }}>
                          This order was returned. Refund Status: <strong>{order.refundStatus}</strong>
                        </div>
                      )}

                      {/* Items */}
                      <div className="order-detail-items">
                        {order.items?.map(item => (
                          <div className="order-item-row" key={item.id}>
                            <div className="details">
                              <strong>{item.productName}</strong>
                              <span>Size: {item.size} | Qty: {item.quantity}</span>
                            </div>
                            <strong>₹{(Number(item.price) * item.quantity).toLocaleString('en-IN')}</strong>
                          </div>
                        ))}
                      </div>

                      {/* Billing details */}
                      <div className="order-billing-summary">
                        <p>Subtotal: <span>₹{Number(order.subtotalAmount || order.totalAmount).toLocaleString('en-IN')}</span></p>
                        {order.discountAmount > 0 && (
                          <p style={{ color: 'green' }}>Discount: <span>- ₹{Number(order.discountAmount).toLocaleString('en-IN')}</span></p>
                        )}
                        <p>Delivery: <span>{Number(order.shippingCharge) === 0 ? 'Free' : `₹${Number(order.shippingCharge)}`}</span></p>
                        <p className="total">Grand Total: <span>₹{Number(order.totalAmount).toLocaleString('en-IN')}</span></p>
                      </div>

                      {/* Action buttons */}
                      <div className="order-actions-footer">
                        <button className="secondary" onClick={() => printInvoice(order)} style={{ height: '38px', padding: '0 16px', fontSize: '0.8rem' }}>
                          <Printer size={14} style={{ display: 'inline', marginRight: '6px' }} /> Invoice
                        </button>
                        
                        {(order.status === 'PLACED' || order.status === 'CONFIRMED') && (
                          <button className="secondary" onClick={() => handleCancelOrder(order.id)} style={{ height: '38px', padding: '0 16px', fontSize: '0.8rem', color: 'var(--error)', borderColor: 'var(--error)' }}>
                            <XCircle size={14} style={{ display: 'inline', marginRight: '6px' }} /> Cancel Order
                          </button>
                        )}

                        {order.status === 'DELIVERED' && (
                          <button className="secondary" onClick={() => handleReturnOrder(order.id)} style={{ height: '38px', padding: '0 16px', fontSize: '0.8rem', color: 'var(--gold-dark)', borderColor: 'var(--gold-primary)' }}>
                            <RefreshCcw size={14} style={{ display: 'inline', marginRight: '6px' }} /> Return Order
                          </button>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
