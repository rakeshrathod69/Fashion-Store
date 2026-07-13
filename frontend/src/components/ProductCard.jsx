import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Heart, Star } from 'lucide-react';
import { api, getSession } from '../api';

export default function ProductCard({ product, onAdd, isWishlisted, onWishlistToggle, onQuickView, onBuyNow }) {
  const sizes = product.sizes ? product.sizes.split(',') : [];
  const [size, setSize] = useState(sizes[0] || 'M');
  const [wishlistActive, setWishlistActive] = useState(isWishlisted);

  const discount = product.discountPercentage || 0;
  const originalPrice = Number(product.price);
  const discountedPrice = discount > 0 ? originalPrice * (1 - discount / 100) : originalPrice;

  async function toggleWishlist(e) {
    e.preventDefault();
    e.stopPropagation();
    if (!getSession()) {
      alert("Please login to save items to your wishlist.");
      return;
    }
    try {
      if (wishlistActive) {
        await api(`/wishlist/${product.id}`, { method: 'DELETE' });
        setWishlistActive(false);
      } else {
        await api(`/wishlist/${product.id}`, { method: 'POST' });
        setWishlistActive(true);
      }
      if (onWishlistToggle) onWishlistToggle(product.id, !wishlistActive);
    } catch (err) {
      console.error("Wishlist error", err);
    }
  }

  // Sync state if prop changes
  React.useEffect(() => {
    setWishlistActive(isWishlisted);
  }, [isWishlisted]);

  return (
    <article className="product-card animate-slide">
      <div className="product-image">
        <Link to={`/product/${product.id}`}>
          <img src={product.imageUrl} alt={product.name} />
        </Link>
        <span className="stock-badge">
          {product.stock > 0 ? (product.stock < 10 ? 'Low Stock' : 'In stock') : 'Out of stock'}
        </span>
        <button 
          className={`wishlist-trigger ${wishlistActive ? 'active' : ''}`} 
          onClick={toggleWishlist}
          aria-label="Toggle wishlist"
        >
          <Heart size={18} fill={wishlistActive ? "#e02424" : "none"} color={wishlistActive ? "#e02424" : "currentColor"} />
        </button>
        {product.stock > 0 && (
          <button 
            className="quick-view-overlay-btn"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); if (onQuickView) onQuickView(product); }}
          >
            Quick View
          </button>
        )}
      </div>
      <div className="product-body">
        <div className="brand-name">{product.brand || 'Luxury Label'}</div>
        <h3 className="product-title">
          <Link to={`/product/${product.id}`}>{product.name}</Link>
        </h3>
        <p>{product.description}</p>
        
        <div className="product-meta">
          <div className="stars-row">
            <Star size={14} fill="currentColor" />
            <strong>{product.averageRating || '0.0'}</strong>
            <span>({product.totalReviews || 0})</span>
          </div>
          <div className="price-container">
            {discount > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                <span className="original-price" style={{ textDecoration: 'line-through', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  ₹{originalPrice.toLocaleString('en-IN')}
                </span>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <strong className="discounted-price" style={{ color: 'var(--gold-dark)', fontSize: '1.05rem' }}>
                    ₹{Math.round(discountedPrice).toLocaleString('en-IN')}
                  </strong>
                  <span className="discount-tag" style={{ color: '#e02424', fontSize: '0.72rem', fontWeight: 600 }}>
                    ({discount}% OFF)
                  </span>
                </div>
              </div>
            ) : (
              <strong style={{ fontSize: '1.05rem' }}>₹{originalPrice.toLocaleString('en-IN')}</strong>
            )}
          </div>
        </div>
        
        <div className="sizes">
          {sizes.map(s => (
            <button 
              key={s} 
              className={size === s ? 'selected' : ''} 
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setSize(s); }}
            >
              {s}
            </button>
          ))}
        </div>
        
        <div className="card-actions-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '12px' }}>
          <button 
            className="secondary" 
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onAdd(product, size); }}
            disabled={product.stock <= 0}
            style={{ padding: '10px 4px', fontSize: '0.8rem', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
          >
            <ShoppingCart size={14} /> Add
          </button>
          <button 
            className="primary gold-btn" 
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); if (onBuyNow) onBuyNow(product, size); }}
            disabled={product.stock <= 0}
            style={{ padding: '10px 4px', fontSize: '0.8rem', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            Buy Now
          </button>
        </div>
      </div>
    </article>
  );
}
