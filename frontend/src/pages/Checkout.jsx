import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Truck, CreditCard, ChevronRight, CheckCircle2, ShoppingBag, ArrowLeft } from 'lucide-react';
import { api, getSession } from '../api';

export default function Checkout() {
  const [activeItems, setActiveItems] = useState([]);
  const [step, setStep] = useState(1); // Steps: 1 (Review Bag), 2 (Shipping), 3 (Payment), 4 (Confirmation), 5 (Success)
  
  // Shipping Form States
  const [shippingName, setShippingName] = useState('');
  const [shippingPhone, setShippingPhone] = useState('');
  const [shippingEmail, setShippingEmail] = useState('');
  const [shippingAddressLine1, setShippingAddressLine1] = useState('');
  const [shippingAddressLine2, setShippingAddressLine2] = useState('');
  const [shippingCity, setShippingCity] = useState('');
  const [shippingState, setShippingState] = useState('');
  const [shippingCountry, setShippingCountry] = useState('India');
  const [shippingPinCode, setShippingPinCode] = useState('');
  
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [placedOrder, setPlacedOrder] = useState(null);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const session = getSession();

  useEffect(() => {
    if (!session) {
      navigate('/login');
      return;
    }
    // Load current cart to check active items
    api('/cart')
      .then(items => {
        const active = items.filter(item => !item.savedForLater);
        setActiveItems(active);
        if (active.length === 0) {
          navigate('/cart');
        }
      })
      .catch(() => navigate('/cart'));

    // Prefill user details if available
    setShippingName(session.name || '');
    setShippingEmail(session.email || '');
  }, []);

  // Price calculations matching Cart.jsx
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

  const shippingCharge = useMemo(() => {
    if (subtotal === 0) return 0;
    return subtotal > 1500 ? 0 : 99;
  }, [subtotal]);

  const total = useMemo(() => {
    return subtotal - discount + shippingCharge;
  }, [subtotal, discount, shippingCharge]);

  async function handlePlaceOrder() {
    setError('');
    const requestData = {
      shippingName,
      shippingPhone,
      shippingEmail,
      shippingAddressLine1,
      shippingAddressLine2,
      shippingCity,
      shippingState,
      shippingCountry,
      shippingPinCode,
      paymentMethod
    };

    try {
      const order = await api('/orders/checkout', {
        method: 'POST',
        body: JSON.stringify(requestData)
      });
      setPlacedOrder(order);
      setStep(5); // Show success step
    } catch (err) {
      setError('Could not place order. Please review your billing and items.');
    }
  }

  // Address validation
  function validateAddressForm(e) {
    e.preventDefault();
    if (!shippingName || !shippingPhone || !shippingEmail || !shippingAddressLine1 || !shippingCity || !shippingState || !shippingPinCode) {
      setError('Please fill in all required shipping fields.');
      return;
    }
    setError('');
    setStep(3); // Go to Payment
  }

  if (step === 5 && placedOrder) {
    return (
      <main className="product-details-container animate-fade" style={{ padding: '60px 0' }}>
        <div className="success-screen">
          <div className="success-icon-circle">
            <CheckCircle2 size={40} />
          </div>
          <h1>Order Placed Successfully!</h1>
          <p>Thank you for shopping with Aura Luxe. Your order has been placed and is currently being processed.</p>
          
          <div className="success-details">
            <p><strong>Order ID:</strong> #{placedOrder.id}</p>
            <p><strong>Total Amount:</strong> ₹{Number(placedOrder.totalAmount).toLocaleString('en-IN')}</p>
            <p><strong>Payment Method:</strong> {placedOrder.payment?.method}</p>
            <p><strong>Payment Status:</strong> {placedOrder.payment?.status}</p>
            <p><strong>Estimated Delivery:</strong> 3-5 business days</p>
          </div>

          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
            <Link className="primary" to="/profile">Track My Order</Link>
            <Link className="secondary" to="/">Continue Shopping</Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="product-details-container animate-fade">
      <button className="back-btn" onClick={() => navigate(-1)} aria-label="Go Back">
        <ArrowLeft size={14} /> Back
      </button>
      {/* Wizard Header */}
      <div className="checkout-wizard-header">
        <div className={`checkout-step-indicator ${step === 1 ? 'active' : ''}`}>
          <span className="step-number">1</span>
          Review Bag
        </div>
        <ChevronRight size={14} color="var(--text-muted)" />
        <div className={`checkout-step-indicator ${step === 2 ? 'active' : ''}`}>
          <span className="step-number">2</span>
          Shipping Address
        </div>
        <ChevronRight size={14} color="var(--text-muted)" />
        <div className={`checkout-step-indicator ${step === 3 ? 'active' : ''}`}>
          <span className="step-number">3</span>
          Secure Payment
        </div>
        <ChevronRight size={14} color="var(--text-muted)" />
        <div className={`checkout-step-indicator ${step === 4 ? 'active' : ''}`}>
          <span className="step-number">4</span>
          Confirmation
        </div>
      </div>

      {error && <p className="notice" style={{ color: 'var(--error)', background: 'var(--error-light)', borderLeftColor: 'var(--error)', marginBottom: '24px' }}>{error}</p>}

      <div className="page-grid">
        <section className="panel">
          {/* Step 1: Review Items */}
          {step === 1 && (
            <div className="animate-fade">
              <h2>Review Your Order Items</h2>
              <div className="cart-list" style={{ marginTop: '20px', marginBottom: '24px' }}>
                {activeItems.map(item => (
                  <div key={item.id} className="cart-row" style={{ gridTemplateColumns: '80px 1fr auto', padding: '10px' }}>
                    <img src={item.product.imageUrl} alt={item.product.name} style={{ width: '80px' }} />
                    <div>
                      <h4 style={{ margin: 0, fontSize: '0.95rem' }}>{item.product.name}</h4>
                      <p style={{ margin: '4px 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Size: {item.size} | Qty: {item.quantity}</p>
                    </div>
                    <strong>
                      {item.product.discountPercentage > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                          <span style={{ textDecoration: 'line-through', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            ₹{(Number(item.product.price) * item.quantity).toLocaleString('en-IN')}
                          </span>
                          <span style={{ color: 'var(--gold-dark)' }}>
                            ₹{(Math.round(Number(item.product.price) * (1 - item.product.discountPercentage / 100)) * item.quantity).toLocaleString('en-IN')}
                          </span>
                        </div>
                      ) : (
                        `₹${(Number(item.product.price) * item.quantity).toLocaleString('en-IN')}`
                      )}
                    </strong>
                  </div>
                ))}
              </div>
              <button className="primary" onClick={() => setStep(2)}>
                Continue to Shipping Address <ChevronRight size={16} />
              </button>
            </div>
          )}

          {/* Step 2: Shipping Form */}
          {step === 2 && (
            <form className="animate-fade" onSubmit={validateAddressForm}>
              <h2>Shipping Address</h2>
              
              <div className="form-group" style={{ marginTop: '20px' }}>
                <label>Full Name *</label>
                <input required value={shippingName} onChange={e => setShippingName(e.target.value)} placeholder="e.g. Rakesh Sharma" />
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label>Phone Number *</label>
                  <input required value={shippingPhone} onChange={e => setShippingPhone(e.target.value)} placeholder="10-digit mobile number" />
                </div>
                <div className="form-group">
                  <label>Email Address *</label>
                  <input required type="email" value={shippingEmail} onChange={e => setShippingEmail(e.target.value)} placeholder="e.g. rakesh@example.com" />
                </div>
              </div>

              <div className="form-group">
                <label>Address Line 1 *</label>
                <input required value={shippingAddressLine1} onChange={e => setShippingAddressLine1(e.target.value)} placeholder="Flat, House no., Building, Company, Apartment" />
              </div>

              <div className="form-group">
                <label>Address Line 2</label>
                <input value={shippingAddressLine2} onChange={e => setShippingAddressLine2(e.target.value)} placeholder="Area, Street, Sector, Village" />
              </div>

              <div className="form-grid-3">
                <div className="form-group">
                  <label>City *</label>
                  <input required value={shippingCity} onChange={e => setShippingCity(e.target.value)} placeholder="City / Town" />
                </div>
                <div className="form-group">
                  <label>State *</label>
                  <input required value={shippingState} onChange={e => setShippingState(e.target.value)} placeholder="State" />
                </div>
                <div className="form-group">
                  <label>PIN Code *</label>
                  <input required value={shippingPinCode} onChange={e => setShippingPinCode(e.target.value)} placeholder="6-digit ZIP code" maxLength={6} />
                </div>
              </div>

              <div className="form-group">
                <label>Country *</label>
                <input required value={shippingCountry} onChange={e => setShippingCountry(e.target.value)} />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button className="secondary" type="button" onClick={() => setStep(1)}>Back</button>
                <button className="primary" type="submit">Continue to Payment</button>
              </div>
            </form>
          )}

          {/* Step 3: Payment Gateway Selector */}
          {step === 3 && (
            <div className="animate-fade">
              <h2>Select Payment Method</h2>
              
              <div className="payment-methods-grid" style={{ marginTop: '20px' }}>
                {/* UPI options */}
                <div className={`payment-method-card ${paymentMethod === 'UPI' ? 'selected' : ''}`} onClick={() => setPaymentMethod('UPI')}>
                  <div className="payment-method-card-label">
                    <span className="dot" style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', background: paymentMethod === 'UPI' ? 'var(--primary-color)' : 'transparent', border: '1px solid var(--border-color)', marginRight: '8px' }}></span>
                    UPI (Google Pay / PhonePe / Paytm)
                  </div>
                  <strong style={{ fontSize: '0.8rem', color: 'var(--gold-dark)' }}>Instant Checkout</strong>
                </div>

                {/* Cards */}
                <div className={`payment-method-card ${paymentMethod === 'CREDIT_CARD' ? 'selected' : ''}`} onClick={() => setPaymentMethod('CREDIT_CARD')}>
                  <div className="payment-method-card-label">
                    <span className="dot" style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', background: paymentMethod === 'CREDIT_CARD' ? 'var(--primary-color)' : 'transparent', border: '1px solid var(--border-color)', marginRight: '8px' }}></span>
                    Credit Card
                  </div>
                  <CreditCard size={18} />
                </div>

                <div className={`payment-method-card ${paymentMethod === 'DEBIT_CARD' ? 'selected' : ''}`} onClick={() => setPaymentMethod('DEBIT_CARD')}>
                  <div className="payment-method-card-label">
                    <span className="dot" style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', background: paymentMethod === 'DEBIT_CARD' ? 'var(--primary-color)' : 'transparent', border: '1px solid var(--border-color)', marginRight: '8px' }}></span>
                    Debit Card
                  </div>
                  <CreditCard size={18} />
                </div>

                {/* Net Banking */}
                <div className={`payment-method-card ${paymentMethod === 'NET_BANKING' ? 'selected' : ''}`} onClick={() => setPaymentMethod('NET_BANKING')}>
                  <div className="payment-method-card-label">
                    <span className="dot" style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', background: paymentMethod === 'NET_BANKING' ? 'var(--primary-color)' : 'transparent', border: '1px solid var(--border-color)', marginRight: '8px' }}></span>
                    Net Banking
                  </div>
                  <strong style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Secure Link</strong>
                </div>

                {/* Cash on Delivery */}
                <div className={`payment-method-card ${paymentMethod === 'CASH_ON_DELIVERY' ? 'selected' : ''}`} onClick={() => setPaymentMethod('CASH_ON_DELIVERY')}>
                  <div className="payment-method-card-label">
                    <span className="dot" style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', background: paymentMethod === 'CASH_ON_DELIVERY' ? 'var(--primary-color)' : 'transparent', border: '1px solid var(--border-color)', marginRight: '8px' }}></span>
                    Cash on Delivery (COD)
                  </div>
                  <Truck size={18} />
                </div>
              </div>

              {/* Badges */}
              <div className="secure-badges-row">
                <div className="secure-badge"><ShieldCheck size={16} /> 256-bit SSL Secure</div>
                <div className="secure-badge"><ShieldCheck size={16} /> 100% Purchase Guarantee</div>
                <div className="secure-badge"><ShieldCheck size={16} /> PCI-DSS Compliant</div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button className="secondary" onClick={() => setStep(2)}>Back</button>
                <button className="primary" onClick={() => setStep(4)}>Continue to Confirmation</button>
              </div>
            </div>
          )}

          {/* Step 4: Final Confirmation */}
          {step === 4 && (
            <div className="animate-fade">
              <h2>Confirm Your Purchase</h2>
              
              <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ padding: '16px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                  <h4 style={{ margin: '0 0 8px', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '0.5px' }}>Delivery Address</h4>
                  <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: '1.5' }}>
                    <strong>{shippingName}</strong><br />
                    {shippingAddressLine1}, {shippingAddressLine2 && `${shippingAddressLine2}, `}{shippingCity}, {shippingState} - {shippingPinCode}<br />
                    {shippingCountry}<br />
                    Phone: {shippingPhone} | Email: {shippingEmail}
                  </p>
                </div>

                <div style={{ padding: '16px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                  <h4 style={{ margin: '0 0 8px', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '0.5px' }}>Secure Payment Method</h4>
                  <p style={{ margin: 0, fontSize: '0.9rem' }}>
                    <strong>{paymentMethod.replace('_', ' ')}</strong>
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button className="secondary" onClick={() => setStep(3)}>Back</button>
                <button className="primary gold-btn" onClick={handlePlaceOrder}>Confirm & Place Order</button>
              </div>
            </div>
          )}
        </section>

        {/* Pricing Summary Side-panel */}
        <aside className="panel summary">
          <h2>Order Summary</h2>
          <div style={{ marginBottom: '16px' }}>
            {activeItems.map(item => (
              <p key={item.id} style={{ fontSize: '0.8rem', margin: '6px 0' }}>
                {item.product.name} (x{item.quantity})
                <span>
                  {item.product.discountPercentage > 0 ? (
                    `₹${(Math.round(Number(item.product.price) * (1 - item.product.discountPercentage / 100)) * item.quantity).toLocaleString('en-IN')}`
                  ) : (
                    `₹${(Number(item.product.price) * item.quantity).toLocaleString('en-IN')}`
                  )}
                </span>
              </p>
            ))}
          </div>
          <hr />
          <p>Subtotal <strong>₹{subtotal.toLocaleString('en-IN')}</strong></p>
          {discount > 0 && (
            <p className="discount-val">
              Discount
              <strong>- ₹{discount.toLocaleString('en-IN')}</strong>
            </p>
          )}
          <p>Delivery <strong>{shippingCharge === 0 ? 'Free' : `₹${shippingCharge}`}</strong></p>
          <hr />
          <p className="total-val">Total <strong>₹{total.toLocaleString('en-IN')}</strong></p>
        </aside>
      </div>
    </main>
  );
}
