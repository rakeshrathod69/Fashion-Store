import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, SlidersHorizontal, Star, RotateCcw } from 'lucide-react';
import { api, getSession } from '../api';
import ProductCard from '../components/ProductCard.jsx';

const fallback = [
  { id: 1, name: 'Oxford Cotton Shirt', description: 'Smart regular-fit shirt for office and weekend styling.', imageUrl: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=900&q=80', sizes: 'S,M,L,XL', price: 1499, category: { name: 'Men' } },
  { id: 2, name: 'Urban Bomber Jacket', description: 'Lightweight jacket with a clean streetwear finish.', imageUrl: 'https://images.unsplash.com/photo-1520975916090-3105956dac38?auto=format&fit=crop&w=900&q=80', sizes: 'M,L,XL', price: 3499, category: { name: 'Men' } },
  { id: 4, name: 'Floral Midi Dress', description: 'Flowing midi dress with soft floral print.', imageUrl: 'https://images.unsplash.com/photo-1612336307429-8a898d10e223?auto=format&fit=crop&w=900&q=80', sizes: 'XS,S,M,L', price: 2799, category: { name: 'Women' } },
  { id: 5, name: 'Satin Evening Top', description: 'Elegant satin top with a polished drape.', imageUrl: 'https://images.unsplash.com/photo-1551163943-3f6a855d1153?auto=format&fit=crop&w=900&q=80', sizes: 'S,M,L', price: 1799, category: { name: 'Women' } }
];

const COLOR_MAP = {
  'Black': '#111111',
  'White': '#ffffff',
  'Blue': '#1e3a8a',
  'Pink': '#db2777',
  'Charcoal': '#374151',
  'Gold': '#d97706',
  'Crimson': '#dc2626',
  'Lavender': '#c084fc',
  'Green': '#15803d',
  'Ivory': '#fef3c7',
  'Olive': '#65a30d'
};

export default function Home() {
  const [products, setProducts] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [brand, setBrand] = useState('');
  const [size, setSize] = useState('');
  const [color, setColor] = useState('');
  const [minRating, setMinRating] = useState('0');
  const [maxPrice, setMaxPrice] = useState(15000);
  const [notice, setNotice] = useState('');
  const [wishlistIds, setWishlistIds] = useState(new Set());
  const [showFilters, setShowFilters] = useState(false);

  // Quick View State
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [selectedQuickSize, setSelectedQuickSize] = useState('M');

  const navigate = useNavigate();

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (category) count++;
    if (brand) count++;
    if (size) count++;
    if (color) count++;
    if (minRating && minRating !== '0') count++;
    if (maxPrice < 15000) count++;
    return count;
  }, [category, brand, size, color, minRating, maxPrice]);

  const handleCategoryClick = (catVal) => {
    setCategory(prev => prev === catVal ? '' : catVal);
  };

  const handleBrandClick = (brandVal) => {
    setBrand(prev => prev === brandVal ? '' : brandVal);
  };

  const handleSizeClick = (sizeVal) => {
    setSize(prev => prev === sizeVal ? '' : sizeVal);
  };

  const handleColorClick = (colorVal) => {
    setColor(prev => prev === colorVal ? '' : colorVal);
  };

  const handleRatingClick = (ratingVal) => {
    setMinRating(prev => prev === ratingVal ? '0' : ratingVal);
  };

  const clearAllFilters = () => {
    setCategory('');
    setBrand('');
    setSize('');
    setColor('');
    setMinRating('0');
    setMaxPrice(15000);
    setQuery('');
  };

  useEffect(() => {
    api('/products').then(setProducts).catch(() => setProducts(fallback));
    api('/categories').then(setCategoriesList).catch(() => { });
    if (getSession()) {
      api('/wishlist')
        .then(list => setWishlistIds(new Set(list.map(p => p.id))))
        .catch(() => { });
    }
  }, []);

  useEffect(() => {
    if (quickViewProduct) {
      const firstSize = quickViewProduct.sizes ? quickViewProduct.sizes.split(',')[0] : 'M';
      setSelectedQuickSize(firstSize);
    }
  }, [quickViewProduct]);

  const ALL_BRANDS = [
    'Atelier Gold', 'Luxe Classic', 'StreetElite', 'Aura London', 'DenimCraft',
    'Gucci', 'Chanel', 'Prada', 'Louis Vuitton', 'Zara', 'H&M', 'Hermes',
    'Dolce & Gabbana', 'Versace', 'Armani', 'Burberry', 'Saint Laurent'
  ];

  const brands = useMemo(() => {
    const catalogBrands = products.map(p => p.brand).filter(Boolean);
    const set = new Set([...ALL_BRANDS, ...catalogBrands]);
    return [...set].sort();
  }, [products]);

  const filtered = useMemo(() => products.filter(product => {
    const matchesQuery = product.name.toLowerCase().includes(query.toLowerCase()) ||
      product.description?.toLowerCase().includes(query.toLowerCase()) ||
      product.brand?.toLowerCase().includes(query.toLowerCase());

    // Support matching both specific categories and parent groups (Men, Women, Children)
    const matchesCategory = !category ||
      product.category?.name === category ||
      (category === 'Men' && product.category?.name.toLowerCase().includes('men')) ||
      (category === 'Women' && product.category?.name.toLowerCase().includes('women')) ||
      (category === 'Children' && product.category?.name.toLowerCase().includes('children'));

    const matchesBrand = !brand || product.brand === brand;
    const matchesSize = !size || product.sizes?.toLowerCase().includes(size.toLowerCase());
    const matchesColor = !color || product.colors?.toLowerCase().includes(color.toLowerCase());
    const matchesRating = !minRating || (product.averageRating || 0) >= Number(minRating);

    // Apply discount calculation to price filter
    const discount = product.discountPercentage || 0;
    const currentPrice = discount > 0 ? Number(product.price) * (1 - discount / 100) : Number(product.price);
    const matchesPrice = currentPrice <= Number(maxPrice);

    return matchesQuery && matchesCategory && matchesBrand && matchesSize && matchesColor && matchesRating && matchesPrice;
  }), [products, query, category, brand, size, color, minRating, maxPrice]);

  async function addToCart(product, selectedSize) {
    if (!getSession()) {
      navigate('/login');
      return;
    }
    try {
      await api('/cart/items', {
        method: 'POST',
        body: JSON.stringify({ productId: product.id, size: selectedSize, quantity: 1 })
      });
      setNotice(`${product.name} added to cart.`);
      setTimeout(() => setNotice(''), 3000);
    } catch (err) {
      setNotice('Failed to add item to cart. Please try again.');
    }
  }

  async function handleBuyNow(product, selectedSize) {
    if (!getSession()) {
      navigate('/login');
      return;
    }
    try {
      await api('/cart/items', {
        method: 'POST',
        body: JSON.stringify({ productId: product.id, size: selectedSize, quantity: 1 })
      });
      navigate('/cart');
    } catch (err) {
      setNotice('Could not proceed to checkout. Please try again.');
    }
  }

  function handleWishlistToggle(productId, isAdded) {
    setWishlistIds(prev => {
      const copy = new Set(prev);
      if (isAdded) copy.add(productId);
      else copy.delete(productId);
      return copy;
    });
  }

  return (
    <main>
      <section className="hero">
        <div>
          <p className="eyebrow">New season edit</p>
          <h3>Modern fashion for everyday confidence</h3>
          <p>Shop curated essentials, sharp tailoring, dresses, denim, and premium layers for men and women.</p>
          <div className="hero-stats">
            <span><strong>6+</strong> wardrobe edits</span>
            <span><strong>Free</strong> delivery</span>
            <span><strong>COD</strong> available</span>
          </div>
        </div>
      </section>

      <section className="filter-controls-header">
        <label className="searchbox">
          <Search size={18} />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search name/brand..."
          />
        </label>

        <button
          className={`filter-toggle-btn ${showFilters ? 'active' : ''}`}
          onClick={() => setShowFilters(!showFilters)}
          aria-label="Toggle filter panel"
        >
          <SlidersHorizontal size={18} />
          <span>Filters</span>
          {activeFilterCount > 0 && (
            <span className="active-filter-badge">{activeFilterCount}</span>
          )}
        </button>
      </section>

      <section className={`filter-drawer ${showFilters ? 'open' : ''}`}>
        <div className="filter-drawer-content animate-fade">
          {/* Category Filter */}
          <div className="filter-group">
            <h4>Category</h4>
            <div className="chip-group">
              <button
                className={`filter-chip ${category === '' ? 'active' : ''}`}
                onClick={() => setCategory('')}
              >
                All Categories
              </button>
              <button
                className={`filter-chip ${category === 'Men' ? 'active' : ''}`}
                onClick={() => handleCategoryClick('Men')}
              >
                Men
              </button>
              <button
                className={`filter-chip ${category === 'Women' ? 'active' : ''}`}
                onClick={() => handleCategoryClick('Women')}
              >
                Women
              </button>
              <button
                className={`filter-chip ${category === 'Children' ? 'active' : ''}`}
                onClick={() => handleCategoryClick('Children')}
              >
                Children
              </button>
              {categoriesList
                .filter(c => !["Men", "Women", "Children"].includes(c.name))
                .map(c => (
                  <button
                    key={c.id}
                    className={`filter-chip ${category === c.name ? 'active' : ''}`}
                    onClick={() => handleCategoryClick(c.name)}
                  >
                    {c.name}
                  </button>
                ))
              }
            </div>
          </div>

          {/* Sizes Filter */}
          <div className="filter-group">
            <h4>Size</h4>
            <div className="chip-group">
              {['XS', 'S', 'M', 'L', 'XL', '30', '32', '34', '36'].map(s => (
                <button
                  key={s}
                  className={`size-chip ${size === s ? 'active' : ''}`}
                  onClick={() => handleSizeClick(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Colors Filter */}
          <div className="filter-group">
            <h4>Color</h4>
            <div className="chip-group">
              {['Black', 'White', 'Blue', 'Pink', 'Charcoal', 'Gold', 'Crimson', 'Lavender', 'Green', 'Ivory', 'Olive'].map(c => {
                const hexColor = COLOR_MAP[c] || '#cccccc';
                const isWhite = c.toLowerCase() === 'white';
                return (
                  <button
                    key={c}
                    className={`color-swatch-btn ${color === c ? 'active' : ''} ${isWhite ? 'color-white' : ''}`}
                    style={{ backgroundColor: hexColor }}
                    onClick={() => handleColorClick(c)}
                    title={c}
                    aria-label={`Filter by color ${c}`}
                  />
                );
              })}
            </div>
          </div>

          {/* Ratings Filter */}
          <div className="filter-group">
            <h4>Rating</h4>
            <div className="chip-group">
              <button
                className={`filter-chip ${minRating === '0' ? 'active' : ''}`}
                onClick={() => setMinRating('0')}
              >
                All Ratings
              </button>
              <button
                className={`filter-chip ${minRating === '4' ? 'active' : ''}`}
                onClick={() => handleRatingClick('4')}
              >
                4★ & above
              </button>
              <button
                className={`filter-chip ${minRating === '3' ? 'active' : ''}`}
                onClick={() => handleRatingClick('3')}
              >
                3★ & above
              </button>
              <button
                className={`filter-chip ${minRating === '2' ? 'active' : ''}`}
                onClick={() => handleRatingClick('2')}
              >
                2★ & above
              </button>
            </div>
          </div>

          {/* Price Range Filter */}
          <div className="filter-group">
            <h4>Max Price</h4>
            <div className="price-range-group">
              <div className="price-range-label">Up to ₹{maxPrice.toLocaleString('en-IN')}</div>
              <input
                type="range"
                min="500"
                max="15000"
                step="250"
                value={maxPrice}
                onChange={e => setMaxPrice(Number(e.target.value))}
                className="price-slider"
              />
            </div>
          </div>

          {/* Brands Filter */}
          <div className="filter-group" style={{ gridColumn: '1 / -1' }}>
            <h4>Brand</h4>
            <div className="chip-group">
              {brands.map(b => (
                <button
                  key={b}
                  className={`filter-chip ${brand === b ? 'active' : ''}`}
                  onClick={() => handleBrandClick(b)}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>

          {/* Reset Filters Section */}
          {(activeFilterCount > 0 || query) && (
            <div className="filter-actions-row">
              <button className="clear-filters-btn" onClick={clearAllFilters}>
                <RotateCcw size={14} />
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      </section>

      {notice && <p className="notice">{notice}</p>}

      <section className="section-head">
        <h2>Featured Collection</h2>
        <span>{filtered.length} items</span>
      </section>

      <section className="product-grid">
        {filtered.map(product => (
          <ProductCard
            key={product.id}
            product={product}
            onAdd={addToCart}
            isWishlisted={wishlistIds.has(product.id)}
            onWishlistToggle={handleWishlistToggle}
            onQuickView={setQuickViewProduct}
            onBuyNow={handleBuyNow}
          />
        ))}
        {filtered.length === 0 && <p className="empty-state">No products match these filters.</p>}
      </section>

      {/* Quick View Modal */}
      {quickViewProduct && (
        <div className="modal-overlay" onClick={() => setQuickViewProduct(null)}>
          <div className="modal-content quick-view-modal-box animate-fade" onClick={e => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setQuickViewProduct(null)} aria-label="Close modal">&times;</button>
            <div className="quick-view-grid">
              <div className="quick-view-gallery">
                <img src={quickViewProduct.imageUrl} alt={quickViewProduct.name} className="quick-view-main-image" />
              </div>
              <div className="quick-view-body">
                <span className="brand-name">{quickViewProduct.brand || 'Luxury Edit'}</span>
                <h2>{quickViewProduct.name}</h2>

                <div className="stars-row" style={{ display: 'flex', gap: '4px', alignItems: 'center', margin: '8px 0' }}>
                  <Star size={15} fill="var(--gold-primary)" color="var(--gold-primary)" />
                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{quickViewProduct.averageRating || '0.0'}</span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>({quickViewProduct.totalReviews || 0} reviews)</span>
                </div>

                <div className="price-row" style={{ margin: '16px 0' }}>
                  {quickViewProduct.discountPercentage > 0 ? (
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'baseline' }}>
                      <strong style={{ fontSize: '1.4rem', color: 'var(--gold-dark)' }}>
                        ₹{Math.round(Number(quickViewProduct.price) * (1 - quickViewProduct.discountPercentage / 100)).toLocaleString('en-IN')}
                      </strong>
                      <span style={{ textDecoration: 'line-through', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        ₹{Number(quickViewProduct.price).toLocaleString('en-IN')}
                      </span>
                      <span style={{ color: '#e02424', fontSize: '0.8rem', fontWeight: 600 }}>
                        ({quickViewProduct.discountPercentage}% OFF)
                      </span>
                    </div>
                  ) : (
                    <strong style={{ fontSize: '1.4rem' }}>₹{Number(quickViewProduct.price).toLocaleString('en-IN')}</strong>
                  )}
                </div>

                <p className="description">{quickViewProduct.description}</p>

                {quickViewProduct.sizes && (
                  <div className="sizes-section" style={{ marginTop: '16px' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '8px' }}>Select Size</label>
                    <div className="sizes" style={{ display: 'flex', gap: '6px' }}>
                      {quickViewProduct.sizes.split(',').map(s => (
                        <button
                          key={s}
                          className={selectedQuickSize === s ? 'selected' : ''}
                          onClick={() => setSelectedQuickSize(s)}
                          style={{ padding: '6px 12px', border: '1px solid var(--border-color)', borderRadius: '4px', cursor: 'pointer', background: selectedQuickSize === s ? 'var(--text-primary)' : 'none', color: selectedQuickSize === s ? 'white' : 'var(--text-primary)' }}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="actions" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '24px' }}>
                  <button
                    className="secondary"
                    onClick={() => { addToCart(quickViewProduct, selectedQuickSize); setQuickViewProduct(null); }}
                    style={{ height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    Add to Cart
                  </button>
                  <button
                    className="primary gold-btn"
                    onClick={() => { handleBuyNow(quickViewProduct, selectedQuickSize); setQuickViewProduct(null); }}
                    style={{ height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    Buy Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
