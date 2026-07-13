import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, Bookmark, ArrowRight, ShoppingCart, ArrowLeft } from 'lucide-react';
import { api, getSession } from '../api';

export default function Cart() {
  const [items, setItems] = useState([]);
  const navigate = useNavigate();
  const session = getSession();

  // Split items
  const activeItems = useMemo(() => items.filter(item => !item.savedForLater), [items]);
  const savedItems = useMemo(() => items.filter(item => item.savedForLater), [items]);

  // Pricing calculations
  const subtotal = useMemo(() => {
    return activeItems.reduce((sum, item) => {
      const discount = item.product.discountPercentage || 0;
      const originalPrice = Number(item.product.price);
      const discountedPrice = discount > 0 ? originalPrice * (1 - discount / 100) : originalPrice;
      return sum + Math.round(discountedPrice) * item.quantity;
    }, 0);
  }, [activeItems]);

  const discount = useMemo(() => {
    if (subtotal > 5000) return Math.round(subtotal * 0.15 * 100) / 100;
    if (subtotal > 2500) return Math.round(subtotal * 0.10 * 100) / 100;
    return 0;
  }, [subtotal]);

  const discountPercent = useMemo(() => {
    if (subtotal > 5000) return 15;
    if (subtotal > 2500) return 10;
    return 0;
  }, [subtotal]);

  const shipping = useMemo(() => {
    if (subtotal === 0) return 0;
    return subtotal > 1500 ? 0 : 99;
  }, [subtotal]);

  const total = useMemo(() => {
    return subtotal - discount + shipping;
  }, [subtotal, discount, shipping]);

  function load() {
    if (session) {
      api('/cart').then(setItems).catch(() => setItems([]));
    }
  }

  useEffect(load, []);

  async function updateQuantity(item, quantity) {
    if (quantity < 1) return;
    try {
      await api(`/cart/items/${item.id}`, { 
        method: 'PUT', 
        body: JSON.stringify({ 
          productId: item.product.id, 
          size: item.size, 
          quantity, 
          savedForLater: item.savedForLater 
        }) 
      });
      load();
    } catch (err) {
      console.error(err);
    }
  }

  async function toggleSaveLater(item, savedState) {
    try {
      await api(`/cart/items/${item.id}`, { 
        method: 'PUT', 
        body: JSON.stringify({ 
          productId: item.product.id, 
          size: item.size, 
          quantity: item.quantity, 
          savedForLater: savedState 
        }) 
      });
      load();
    } catch (err) {
      console.error(err);
    }
  }

  async function remove(id) {
    try {
      await api(`/cart/items/${id}`, { method: 'DELETE' });
      load();
    } catch (err) {
      console.error(err);
    }
  }

  if (!session) {
    return (
      <main className="center empty-state" style={{ padding: '80px 20px', textAlign: 'center' }}>
        <h1>Access Your Bag</h1>
        <p style={{ margin: '12px 0 24px', color: 'var(--text-secondary)' }}>Please login to view your shopping cart and complete purchases.</p>
        <Link className="primary" to="/login">Sign In</Link>
      </main>
    );
  }

  return (
    <main className="page-grid animate-fade">
      <button className="back-btn" onClick={() => navigate(-1)} style={{ gridColumn: '1 / -1', width: 'fit-content' }} aria-label="Go Back">
        <ArrowLeft size={14} /> Back
      </button>
      {/* Bag Items list */}
      <section className="cart-list-section">
        <h1>Shopping Bag ({activeItems.length})</h1>
        
        <div className="cart-list">
          {activeItems.length === 0 && (
            <div className="empty-state" style={{ padding: '40px 20px', textAlign: 'center' }}>
              <p>Your shopping bag is currently empty.</p>
              <Link className="secondary" to="/" style={{ marginTop: '14px' }}>Browse Products</Link>
            </div>
          )}
          
          {activeItems.map(item => (
            <article className="cart-row animate-slide" key={item.id}>
              <img src={item.product.imageUrl} alt={item.product.name} />
              <div className="cart-row-details">
                <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--gold-dark)', letterSpacing: '1px' }}>
                  {item.product.brand || 'Luxury Edit'}
                </div>
                <h3>
                  <Link to={`/product/${item.product.id}`}>{item.product.name}</Link>
                </h3>
                <p className="meta">Size: {item.size}</p>
                <div className="price-container">
                  {item.product.discountPercentage > 0 ? (
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <strong style={{ color: 'var(--gold-dark)' }}>
                        ₹{Math.round(Number(item.product.price) * (1 - item.product.discountPercentage / 100)).toLocaleString('en-IN')}
                      </strong>
                      <span style={{ textDecoration: 'line-through', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        ₹{Number(item.product.price).toLocaleString('en-IN')}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#e02424', fontWeight: 600 }}>
                        ({item.product.discountPercentage}% OFF)
                      </span>
                    </div>
                  ) : (
                    <strong>₹{Number(item.product.price).toLocaleString('en-IN')}</strong>
                  )}
                </div>
              </div>
              <div className="qty-stepper">
                <button onClick={() => updateQuantity(item, item.quantity - 1)}><Minus size={13} /></button>
                <span>{item.quantity}</span>
                <button onClick={() => updateQuantity(item, item.quantity + 1)}><Plus size={13} /></button>
              </div>
              <div className="cart-actions">
                <button onClick={() => toggleSaveLater(item, true)} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Bookmark size={11} /> Save Later
                </button>
                <button className="remove-btn" onClick={() => remove(item.id)} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Trash2 size={11} /> Remove
                </button>
              </div>
            </article>
          ))}
        </div>

        {/* Save for later section */}
        <section className="save-for-later-section">
          <h2>Saved For Later ({savedItems.length})</h2>
          {savedItems.length === 0 && (
            <p className="empty-state" style={{ borderStyle: 'dotted' }}>Items saved for later will appear here.</p>
          )}
          
          <div className="save-grid">
            {savedItems.map(item => (
              <article className="save-card animate-slide" key={item.id}>
                <img src={item.product.imageUrl} alt={item.product.name} />
                <div className="save-card-body">
                  <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                    {item.product.brand || 'Luxury Edit'}
                  </div>
                  <h3>
                    <Link to={`/product/${item.product.id}`}>{item.product.name}</Link>
                  </h3>
                  <div className="price-container" style={{ margin: '4px 0 8px' }}>
                    {item.product.discountPercentage > 0 ? (
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        <strong style={{ fontSize: '0.9rem', color: 'var(--gold-dark)' }}>
                          ₹{Math.round(Number(item.product.price) * (1 - item.product.discountPercentage / 100)).toLocaleString('en-IN')}
                        </strong>
                        <span style={{ textDecoration: 'line-through', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          ₹{Number(item.product.price).toLocaleString('en-IN')}
                        </span>
                      </div>
                    ) : (
                      <p>₹{Number(item.product.price).toLocaleString('en-IN')}</p>
                    )}
                  </div>
                  <div className="save-card-actions">
                    <button className="move-to-cart-btn" onClick={() => toggleSaveLater(item, false)}>
                      <ShoppingCart size={12} /> Move to Cart
                    </button>
                    <button className="remove-btn" onClick={() => remove(item.id)}>
                      <Trash2 size={12} /> Delete
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </section>

      {/* Bag Summary */}
      <aside className="panel summary">
        <h2>Bag Summary</h2>
        <p>Subtotal <strong>₹{subtotal.toLocaleString('en-IN')}</strong></p>
        
        {discount > 0 && (
          <p className="discount-val">
            Discount ({discountPercent}%) 
            <strong>- ₹{discount.toLocaleString('en-IN')}</strong>
          </p>
        )}
        
        <p>Delivery <strong>{shipping === 0 ? 'Free' : `₹${shipping}`}</strong></p>
        
        {shipping > 0 && (
          <small style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '-8px', marginBottom: '8px' }}>
            Add ₹{(1501 - subtotal).toLocaleString('en-IN')} more to unlock FREE delivery
          </small>
        )}
        
        <hr />
        <p className="total-val">Total <strong>₹{total.toLocaleString('en-IN')}</strong></p>
        
        <Link 
          className={`primary full center ${activeItems.length === 0 ? 'disabled-link' : ''}`} 
          to={activeItems.length === 0 ? '#' : '/checkout'}
          style={{ marginTop: '20px', pointerEvents: activeItems.length === 0 ? 'none' : 'auto', opacity: activeItems.length === 0 ? 0.6 : 1 }}
        >
          Proceed to Checkout <ArrowRight size={16} />
        </Link>
      </aside>
    </main>
  );
}
