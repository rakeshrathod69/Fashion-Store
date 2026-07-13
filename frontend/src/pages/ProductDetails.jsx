import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ShoppingCart, Heart, Star, Calendar, RefreshCw, ChevronDown, ChevronUp, Trash2, Edit, ArrowLeft } from 'lucide-react';
import { api, getSession } from '../api';

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const session = getSession();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [isEligible, setIsEligible] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  
  // Recommendations state
  const [similarProducts, setSimilarProducts] = useState([]);
  
  // Selection states
  const [selectedImage, setSelectedImage] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  
  // UI Accordion States
  const [specsOpen, setSpecsOpen] = useState(true);
  const [pin, setPin] = useState('');
  const [pinEstimate, setPinEstimate] = useState('');

  // Review Modal States
  const [showModal, setShowModal] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [notice, setNotice] = useState('');

  function loadProduct() {
    api(`/products/${id}`)
      .then(data => {
        setProduct(data);
        // Default selections
        if (data.imageUrls) {
          const imgs = data.imageUrls.split(',');
          setSelectedImage(imgs[0]);
        } else {
          setSelectedImage(data.imageUrl);
        }
        if (data.sizes) {
          setSelectedSize(data.sizes.split(',')[0]);
        }
        if (data.colors) {
          setSelectedColor(data.colors.split(',')[0]);
        }

        // Fetch similar products
        api('/products')
          .then(allProducts => {
            const filtered = allProducts
              .filter(p => p.id !== data.id && (p.category?.name === data.category?.name || p.brand === data.brand))
              .slice(0, 4);
            setSimilarProducts(filtered);
          })
          .catch(() => {});
      })
      .catch(() => navigate('/'));

    // Fetch reviews
    api(`/reviews/product/${id}`)
      .then(setReviews)
      .catch(() => {});

    // Fetch review eligibility
    if (session) {
      api(`/reviews/product/${id}/eligible`)
        .then(setIsEligible)
        .catch(() => setIsEligible(false));

      // Fetch wishlist state
      api('/wishlist')
        .then(list => {
          setIsWishlisted(list.some(p => p.id === Number(id)));
        })
        .catch(() => {});
    }
  }

  useEffect(() => {
    loadProduct();
  }, [id]);

  async function handleAddToCart() {
    if (!session) {
      navigate('/login');
      return;
    }
    try {
      await api('/cart/items', {
        method: 'POST',
        body: JSON.stringify({ 
          productId: product.id, 
          size: selectedSize, 
          quantity: 1 
        })
      });
      setNotice('Added to shopping cart successfully.');
      setTimeout(() => setNotice(''), 3000);
    } catch (err) {
      setNotice('Could not add to cart. Please try again.');
    }
  }

  async function handleBuyNow() {
    if (!session) {
      navigate('/login');
      return;
    }
    try {
      await api('/cart/items', {
        method: 'POST',
        body: JSON.stringify({ 
          productId: product.id, 
          size: selectedSize, 
          quantity: 1 
        })
      });
      navigate('/cart');
    } catch (err) {
      setNotice('Could not proceed to checkout. Please try again.');
    }
  }

  async function handleWishlistToggle() {
    if (!session) {
      setNotice('Please login to save items to your wishlist.');
      return;
    }
    try {
      if (isWishlisted) {
        await api(`/wishlist/${id}`, { method: 'DELETE' });
        setIsWishlisted(false);
      } else {
        await api(`/wishlist/${id}`, { method: 'POST' });
        setIsWishlisted(true);
      }
    } catch (err) {
      console.error(err);
    }
  }

  function checkDelivery() {
    if (pin.length === 6 && /^\d+$/.test(pin)) {
      // Dummy check based on pin code number
      const days = (Number(pin) % 4) + 2;
      const today = new Date();
      today.setDate(today.getDate() + days);
      const options = { weekday: 'long', month: 'short', day: 'numeric' };
      setPinEstimate(`Standard Delivery by ${today.toLocaleDateString('en-US', options)} (Free)`);
    } else {
      setPinEstimate('Please enter a valid 6-digit PIN code.');
    }
  }

  // Review submission
  async function submitReview(e) {
    e.preventDefault();
    try {
      const url = editingReviewId ? `/reviews/${editingReviewId}` : `/reviews/product/${id}`;
      const method = editingReviewId ? 'PUT' : 'POST';
      await api(url, {
        method: method,
        body: JSON.stringify({ rating: reviewRating, comment: reviewComment })
      });
      setShowModal(false);
      setReviewComment('');
      setEditingReviewId(null);
      loadProduct(); // Reload reviews and stats
    } catch (err) {
      alert("Error submitting review. Please try again.");
    }
  }

  function handleEditReview(review) {
    setEditingReviewId(review.id);
    setReviewRating(review.rating);
    setReviewComment(review.comment);
    setShowModal(true);
  }

  async function handleDeleteReview(reviewId) {
    if (confirm("Are you sure you want to delete your review?")) {
      try {
        await api(`/reviews/${reviewId}`, { method: 'DELETE' });
        loadProduct();
      } catch (err) {
        alert("Could not delete review.");
      }
    }
  }

  if (!product) {
    return <main className="center empty-state"><p>Loading product details...</p></main>;
  }

  const imgs = product.imageUrls ? product.imageUrls.split(',') : [product.imageUrl];
  const sizesList = product.sizes ? product.sizes.split(',') : [];
  const colorsList = product.colors ? product.colors.split(',') : [];

  // Calculate rating bars
  const totalRatings = reviews.length;
  const starCounts = [0, 0, 0, 0, 0]; // Index 0 for 1 star, Index 4 for 5 stars
  reviews.forEach(r => {
    if (r.rating >= 1 && r.rating <= 5) {
      starCounts[r.rating - 1]++;
    }
  });

  return (
    <main className="product-details-container animate-fade">
      <button className="back-btn" onClick={() => navigate(-1)} aria-label="Go Back">
        <ArrowLeft size={14} /> Back
      </button>
      {notice && <p className="notice">{notice}</p>}
      
      <div className="details-grid">
        {/* Gallery */}
        <section className="gallery-section">
          <div className="gallery-thumbs">
            {imgs.map((img, idx) => (
              <img 
                key={idx} 
                src={img} 
                alt={`${product.name} thumbnail ${idx + 1}`}
                className={selectedImage === img ? 'active' : ''}
                onClick={() => setSelectedImage(img)}
              />
            ))}
          </div>
          <div className="gallery-main">
            <img src={selectedImage} alt={product.name} />
          </div>
        </section>

        {/* Product Details Info */}
        <section className="details-info">
          <div className="brand">{product.brand || 'AURA EDIT'}</div>
          <h1>{product.name}</h1>
          
          <div className="ratings-row">
            <div className="stars">
              {[1, 2, 3, 4, 5].map(star => (
                <Star 
                  key={star} 
                  size={16} 
                  fill={star <= (product.averageRating || 0) ? "currentColor" : "none"} 
                  color="var(--gold-primary)"
                />
              ))}
            </div>
            <span className="count-label">
              <strong>{product.averageRating || '0.0'}</strong> ({totalRatings} Reviews)
            </span>
          </div>

          {product.discountPercentage > 0 ? (
            <div className="price-row" style={{ display: 'flex', gap: '10px', alignItems: 'baseline', margin: '14px 0' }}>
              <strong style={{ fontSize: '1.8rem', color: 'var(--gold-dark)' }}>
                ₹{Math.round(Number(product.price) * (1 - product.discountPercentage / 100)).toLocaleString('en-IN')}
              </strong>
              <span style={{ textDecoration: 'line-through', color: 'var(--text-muted)', fontSize: '1.1rem' }}>
                ₹{Number(product.price).toLocaleString('en-IN')}
              </span>
              <span style={{ color: '#e02424', fontWeight: 600, fontSize: '0.95rem' }}>
                ({product.discountPercentage}% OFF)
              </span>
            </div>
          ) : (
            <div className="price">₹{Number(product.price).toLocaleString('en-IN')}</div>
          )}
          
          <p className="description-text" style={{ lineHeight: '1.6', color: 'var(--text-secondary)', marginBottom: '24px' }}>
            {product.description}
          </p>

          {/* Color Selector */}
          {colorsList.length > 0 && (
            <div className="colors-row">
              <label>Select Color</label>
              <div className="colors-list">
                {colorsList.map(c => (
                  <button 
                    key={c} 
                    className={selectedColor === c ? 'selected' : ''} 
                    onClick={() => setSelectedColor(c)}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Size Selector */}
          {sizesList.length > 0 && (
            <div className="sizes-row" style={{ marginTop: '16px' }}>
              <label>Select Size</label>
              <div className="sizes-grid">
                {sizesList.map(s => (
                  <button 
                    key={s} 
                    className={selectedSize === s ? 'selected' : ''} 
                    onClick={() => setSelectedSize(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className={`stock-info ${product.stock > 0 ? (product.stock < 10 ? 'low' : 'in') : 'low'}`}>
            {product.stock > 0 ? (product.stock < 10 ? `Only ${product.stock} items left in stock!` : 'In Stock') : 'Out of Stock'}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
            <button 
              className="secondary" 
              style={{ flexGrow: 1, height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
            >
              <ShoppingCart size={18} /> Add to Cart
            </button>
            <button 
              className="primary gold-btn" 
              style={{ flexGrow: 1, height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              onClick={handleBuyNow}
              disabled={product.stock <= 0}
            >
              Buy Now
            </button>
            <button 
              className={`secondary ${isWishlisted ? 'active' : ''}`}
              onClick={handleWishlistToggle}
              style={{ padding: '14px', width: '52px', height: '48px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              aria-label="Wishlist"
            >
              <Heart size={20} fill={isWishlisted ? "#e02424" : "none"} color={isWishlisted ? "#e02424" : "currentColor"} />
            </button>
          </div>

          {/* PIN Checker */}
          <div className="pin-estimator">
            <h4>Check Delivery Date</h4>
            <div className="pin-input-group">
              <input 
                placeholder="Enter 6-digit PIN code" 
                maxLength={6}
                value={pin}
                onChange={e => setPin(e.target.value.replace(/\D/g, ''))}
              />
              <button className="primary" onClick={checkDelivery}>Check</button>
            </div>
            {pinEstimate && <p className="estimate-result">{pinEstimate}</p>}
          </div>

          {/* Return Policy Info */}
          <div className="returns-policy-card">
            <RefreshCw size={20} />
            <div>
              <strong>15-day return and exchange policy</strong>
              <p style={{ margin: '4px 0 0' }}>Easy and hassle-free returns. Return the product in its original condition within 15 days for a full refund.</p>
            </div>
          </div>

          {/* Specifications Accordion */}
          {product.specifications && (
            <div className="specs-section">
              <div className="specs-title" onClick={() => setSpecsOpen(!specsOpen)}>
                <span>Product Specifications</span>
                {specsOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
              {specsOpen && (
                <div className="specs-content animate-fade">
                  {product.specifications}
                </div>
              )}
            </div>
          )}
        </section>
      </div>

      {/* Similar Products Recommendations */}
      {similarProducts.length > 0 && (
        <section className="similar-products-section" style={{ marginTop: '50px', borderTop: '1px solid var(--border-color)', paddingTop: '30px' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', marginBottom: '20px' }}>You May Also Like</h2>
          <div className="product-grid" style={{ gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '20px' }}>
            {similarProducts.map(p => {
              const disc = p.discountPercentage || 0;
              const orig = Number(p.price);
              const discPrice = disc > 0 ? orig * (1 - disc / 100) : orig;
              return (
                <article key={p.id} className="product-card" style={{ padding: '12px' }}>
                  <div className="product-image" style={{ height: '220px' }}>
                    <Link to={`/product/${p.id}`} onClick={() => window.scrollTo(0, 0)}>
                      <img src={p.imageUrl} alt={p.name} style={{ height: '100%', objectFit: 'cover' }} />
                    </Link>
                  </div>
                  <div className="product-body" style={{ padding: '10px 0 0' }}>
                    <span style={{ fontSize: '0.68rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>{p.brand}</span>
                    <h4 style={{ fontSize: '0.92rem', margin: '4px 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      <Link to={`/product/${p.id}`} onClick={() => window.scrollTo(0, 0)}>{p.name}</Link>
                    </h4>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'baseline', marginTop: '4px' }}>
                      {disc > 0 ? (
                        <>
                          <strong style={{ fontSize: '0.92rem', color: 'var(--gold-dark)' }}>₹{Math.round(discPrice).toLocaleString('en-IN')}</strong>
                          <span style={{ textDecoration: 'line-through', fontSize: '0.78rem', color: 'var(--text-muted)' }}>₹{orig.toLocaleString('en-IN')}</span>
                        </>
                      ) : (
                        <strong style={{ fontSize: '0.92rem' }}>₹{orig.toLocaleString('en-IN')}</strong>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {/* Reviews Section */}
      <section className="reviews-section">
        <div className="section-head" style={{ borderBottom: '1px solid var(--border-color)', marginBottom: '30px' }}>
          <h2>Customer Reviews</h2>
          {isEligible && (
            <button className="primary" onClick={() => { setEditingReviewId(null); setReviewComment(''); setReviewRating(5); setShowModal(true); }}>
              Write Review
            </button>
          )}
        </div>

        <div className="reviews-layout">
          {/* Stats Summary */}
          <div className="reviews-summary-card">
            <h3>{product.averageRating || '0.0'}</h3>
            <div className="stars">
              {[1,2,3,4,5].map(star => (
                <Star 
                  key={star} 
                  size={18} 
                  fill={star <= (product.averageRating || 0) ? "currentColor" : "none"} 
                />
              ))}
            </div>
            <p>Based on {totalRatings} customer reviews</p>

            {/* Progress Bars */}
            {[5, 4, 3, 2, 1].map(stars => {
              const count = starCounts[stars - 1];
              const pct = totalRatings > 0 ? (count / totalRatings) * 100 : 0;
              return (
                <div className="rating-bar" key={stars}>
                  <span>{stars} Stars</span>
                  <div className="bar-track">
                    <div className="bar-fill" style={{ width: `${pct}%` }}></div>
                  </div>
                  <span style={{ textAlign: 'right', width: '30px' }}>{count}</span>
                </div>
              );
            })}
          </div>

          {/* Reviews List */}
          <div className="reviews-list">
            {reviews.length === 0 && (
              <p className="empty-state">No reviews yet for this product. {isEligible ? 'Be the first to write a review!' : 'Only purchased users can submit reviews.'}</p>
            )}
            {reviews.map(review => (
              <article className="review-item animate-slide" key={review.id}>
                <div className="review-item-header">
                  <div className="user-info">
                    <h5>{review.userName}</h5>
                    <span><Calendar size={11} style={{ display: 'inline', marginRight: '4px' }} />{new Date(review.createdAt).toLocaleDateString('en-IN')}</span>
                  </div>
                  <div className="stars">
                    {[1, 2, 3, 4, 5].map(s => (
                      <Star 
                        key={s} 
                        size={14} 
                        fill={s <= review.rating ? "currentColor" : "none"} 
                      />
                    ))}
                  </div>
                </div>
                <p>{review.comment}</p>
                {review.mine && (
                  <div className="review-actions">
                    <button onClick={() => handleEditReview(review)}><Edit size={12} style={{ display: 'inline', marginRight: '3px' }} /> Edit</button>
                    <button className="delete-btn" onClick={() => handleDeleteReview(review.id)}><Trash2 size={12} style={{ display: 'inline', marginRight: '3px' }} /> Delete</button>
                  </div>
                )}
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Review Modal Dialog */}
      {showModal && (
        <div className="modal-overlay">
          <form className="modal-content" onSubmit={submitReview}>
            <h3>{editingReviewId ? 'Edit Your Review' : 'Write a Product Review'}</h3>
            
            <div className="form-group">
              <label>Overall Rating</label>
              <select value={reviewRating} onChange={e => setReviewRating(Number(e.target.value))}>
                <option value={5}>5 Stars (Excellent)</option>
                <option value={4}>4 Stars (Very Good)</option>
                <option value={3}>3 Stars (Average)</option>
                <option value={2}>2 Stars (Poor)</option>
                <option value={1}>1 Star (Terrible)</option>
              </select>
            </div>

            <div className="form-group">
              <label>Your Feedback</label>
              <textarea 
                placeholder="Share your experience with this product, its quality, fit, and material." 
                value={reviewComment}
                onChange={e => setReviewComment(e.target.value)}
                required
              />
            </div>

            <div className="button-row">
              <button className="secondary" type="button" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="primary" type="submit">Submit Review</button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}
