import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { 
  BarChart3, PlusCircle, ShoppingBag, MessageSquare, Users, AlertTriangle, 
  Trash2, Edit, Save, Plus, ArrowUpRight, DollarSign, Package, ArrowLeft 
} from 'lucide-react';

export default function Admin() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard'); // dashboard, products, orders, reviews, users, inventory
  
  // Loaded Stats
  const [stats, setStats] = useState({ totalSales: 0, totalOrders: 0, totalUsers: 0, lowStockCount: 0, categorySales: {} });
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [categories, setCategories] = useState([]);

  // Product Form states
  const [editingProductId, setEditingProductId] = useState(null);
  const [form, setForm] = useState({ 
    name: '', description: '', imageUrl: '', sizes: 'S,M,L,XL', 
    price: 999, stock: 10, categoryId: 1, brand: '', colors: '', 
    imageUrls: '', specifications: '', discountPercentage: 0,
    averageRating: 5.0
  });

  // Category Form states
  const [categoryForm, setCategoryForm] = useState({ name: '', description: '' });
  const [editingCategoryId, setEditingCategoryId] = useState(null);

  function loadAll() {
    api('/admin/dashboard-stats').then(setStats).catch(() => {});
    api('/products').then(setProducts).catch(() => {});
    api('/orders/all').then(setOrders).catch(() => {});
    api('/users').then(setUsers).catch(() => {});
    api('/categories').then(setCategories).catch(() => {});
    api('/reviews/product/1').then(() => {
      // Let's load reviews globally or individually. 
      // Since reviews are fetched by product, we can loop products or we can write a dedicated admin reviews list.
      // Wait, we created GET `/api/admin/reviews` earlier! Let's use `/admin/reviews` which we defined in AdminController.java.
      api('/admin/reviews').then(setReviews).catch(() => {});
    });
  }

  useEffect(() => {
    loadAll();
  }, [activeTab]);

  async function handleSaveProduct(e) {
    e.preventDefault();
    try {
      if (editingProductId) {
        await api(`/products/${editingProductId}`, { method: 'PUT', body: JSON.stringify(form) });
      } else {
        await api('/products', { method: 'POST', body: JSON.stringify(form) });
      }
      setForm({ 
        name: '', description: '', imageUrl: '', sizes: 'S,M,L,XL', 
        price: 999, stock: 10, categoryId: 1, brand: '', colors: '', 
        imageUrls: '', specifications: '', discountPercentage: 0,
        averageRating: 5.0
      });
      setEditingProductId(null);
      loadAll();
      alert("Product saved successfully!");
    } catch (err) {
      alert("Error saving product.");
    }
  }

  function handleEditClick(product) {
    setEditingProductId(product.id);
    setForm({
      name: product.name,
      description: product.description || '',
      imageUrl: product.imageUrl,
      sizes: product.sizes || '',
      price: product.price,
      stock: product.stock,
      categoryId: product.category?.id || 1,
      brand: product.brand || '',
      colors: product.colors || '',
      imageUrls: product.imageUrls || '',
      specifications: product.specifications || '',
      discountPercentage: product.discountPercentage || 0,
      averageRating: product.averageRating || 5.0
    });
    setActiveTab('products'); // Switch to product tab to view form
  }

  async function handleSaveCategory(e) {
    e.preventDefault();
    if (!categoryForm.name.trim()) return;
    try {
      if (editingCategoryId) {
        await api(`/categories/${editingCategoryId}`, {
          method: 'PUT',
          body: JSON.stringify(categoryForm)
        });
      } else {
        await api('/categories', {
          method: 'POST',
          body: JSON.stringify(categoryForm)
        });
      }
      setCategoryForm({ name: '', description: '' });
      setEditingCategoryId(null);
      loadAll();
      alert("Category saved successfully!");
    } catch (err) {
      alert("Failed to save category.");
    }
  }

  function handleEditCategoryClick(cat) {
    setEditingCategoryId(cat.id);
    setCategoryForm({ name: cat.name, description: cat.description || '' });
  }

  async function handleDeleteCategory(id) {
    if (confirm("Are you sure you want to delete this category? All associated products might trigger constraints.")) {
      try {
        await api(`/categories/${id}`, { method: 'DELETE' });
        loadAll();
      } catch (err) {
        alert("Failed to delete category. Ensure no products belong to it first.");
      }
    }
  }

  async function handleDeleteProduct(id) {
    if (confirm("Are you sure you want to delete this product?")) {
      try {
        await api(`/products/${id}`, { method: 'DELETE' });
        loadAll();
      } catch (err) {
        alert("Failed to delete product.");
      }
    }
  }

  async function handleUpdateOrderStatus(orderId, status) {
    try {
      await api(`/orders/${orderId}/status`, { 
        method: 'PUT', 
        body: JSON.stringify({ status }) 
      });
      loadAll();
    } catch (err) {
      alert("Failed to update status.");
    }
  }

  async function handleUpdateRefundStatus(orderId, refundStatus) {
    try {
      await api(`/admin/orders/${orderId}/refund`, {
        method: 'PUT',
        body: JSON.stringify({ refundStatus })
      });
      loadAll();
    } catch (err) {
      alert("Failed to update refund status.");
    }
  }

  async function handleUpdateUserRole(userId, currentRole) {
    const newRole = currentRole === 'ADMIN' ? 'USER' : 'ADMIN';
    if (confirm(`Change user role to ${newRole}?`)) {
      try {
        await api(`/admin/users/${userId}/role`, {
          method: 'PUT',
          body: JSON.stringify({ role: newRole })
        });
        loadAll();
      } catch (err) {
        alert("Failed to change user role.");
      }
    }
  }

  async function handleDeleteReview(reviewId) {
    if (confirm("Delete this review?")) {
      try {
        await api(`/admin/reviews/${reviewId}`, { method: 'DELETE' });
        loadAll();
      } catch (err) {
        alert("Failed to delete review.");
      }
    }
  }

  async function handleQuickStockUpdate(productId, currentStock, increment) {
    const newStock = Math.max(0, currentStock + increment);
    // Find product request and update it
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const requestData = {
      name: product.name,
      description: product.description,
      imageUrl: product.imageUrl,
      sizes: product.sizes,
      price: product.price,
      stock: newStock,
      categoryId: product.category?.id || 1,
      brand: product.brand,
      colors: product.colors,
      imageUrls: product.imageUrls,
      specifications: product.specifications,
      discountPercentage: product.discountPercentage || 0
    };

    try {
      await api(`/products/${productId}`, { method: 'PUT', body: JSON.stringify(requestData) });
      loadAll();
    } catch (err) {
      alert("Failed to update stock.");
    }
  }

  return (
    <main className="admin animate-fade">
      <button className="back-btn" onClick={() => navigate(-1)} aria-label="Go Back">
        <ArrowLeft size={14} /> Back
      </button>
      <div className="section-head" style={{ borderBottom: '1px solid var(--border-color)', marginBottom: '30px' }}>
        <h1>Admin Control Console</h1>
        <div style={{ display: 'flex', gap: '8px' }}>
          {['dashboard', 'products', 'inventory', 'orders', 'categories', 'reviews', 'users'].map(tab => (
            <button 
              key={tab} 
              className={`secondary ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
              style={{ padding: '8px 14px', fontSize: '0.78rem', minHeight: 'auto', textTransform: 'uppercase' }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content 1: Dashboard Sales Metrics */}
      {activeTab === 'dashboard' && (
        <div className="animate-fade">
          <div className="admin-metrics-grid">
            <div className="metric-card">
              <div className="icon-box"><DollarSign size={24} /></div>
              <div className="details">
                <h4>Total Revenue</h4>
                <strong>₹{Number(stats.totalSales || 0).toLocaleString('en-IN')}</strong>
              </div>
            </div>
            <div className="metric-card">
              <div className="icon-box"><ShoppingBag size={24} /></div>
              <div className="details">
                <h4>Total Orders</h4>
                <strong>{stats.totalOrders}</strong>
              </div>
            </div>
            <div className="metric-card">
              <div className="icon-box"><Users size={24} /></div>
              <div className="details">
                <h4>Total Users</h4>
                <strong>{stats.totalUsers}</strong>
              </div>
            </div>
            <div className="metric-card" style={{ borderLeft: stats.lowStockCount > 0 ? '3px solid var(--warning)' : '1px solid var(--border-color)' }}>
              <div className="icon-box"><Package size={24} /></div>
              <div className="details">
                <h4>Low Stock Items</h4>
                <strong>{stats.lowStockCount}</strong>
              </div>
            </div>
          </div>

          <div className="admin-dashboard-layout">
            {/* Category Breakdown */}
            <div className="panel">
              <h2>Category Sales Breakdown</h2>
              <div style={{ marginTop: '20px' }}>
                {Object.keys(stats.categorySales || {}).length === 0 && <p className="empty-state">No sales recorded yet.</p>}
                {Object.entries(stats.categorySales || {}).map(([cat, val]) => (
                  <p key={cat} className="admin-row" style={{ fontSize: '0.9rem' }}>
                    <strong>{cat} Category</strong>
                    <span>₹{Number(val).toLocaleString('en-IN')}</span>
                  </p>
                ))}
              </div>
            </div>

            {/* Low stock alerts */}
            <div className="panel">
              <h2>Inventory Alerts</h2>
              <div className="admin-inventory-list" style={{ marginTop: '20px' }}>
                {products.filter(p => p.stock < 10).length === 0 && (
                  <p className="stock-ok-row">All products are healthy and fully stocked!</p>
                )}
                {products.filter(p => p.stock < 10).map(p => (
                  <div key={p.id} className="stock-warning-row">
                    <span><strong>{p.name}</strong> ({p.brand})</span>
                    <strong style={{ color: 'var(--error)' }}>{p.stock} left</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content 2: Products & Edit Form */}
      {activeTab === 'products' && (
        <div className="admin-grid animate-fade">
          {/* Add / Edit Form */}
          <form className="panel admin-form" onSubmit={handleSaveProduct}>
            <h2>{editingProductId ? 'Edit Product Details' : 'Add New Luxury Product'}</h2>
            
            <div className="form-group">
              <label>Product Name *</label>
              <input required placeholder="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label>Brand Name</label>
                <input list="admin-brands" placeholder="Brand (e.g. Atelier Gold)" value={form.brand} onChange={e => setForm({ ...form, brand: e.target.value })} />
                <datalist id="admin-brands">
                  {['Atelier Gold', 'Luxe Classic', 'StreetElite', 'Aura London', 'DenimCraft', 'Gucci', 'Chanel', 'Prada', 'Louis Vuitton', 'Zara', 'H&M', 'Hermes', 'Dolce & Gabbana', 'Versace', 'Armani', 'Burberry', 'Saint Laurent'].map(b => <option key={b} value={b} />)}
                </datalist>
              </div>
              <div className="form-group">
                <label>Category *</label>
                <select value={form.categoryId} onChange={e => setForm({ ...form, categoryId: Number(e.target.value) })}>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Description *</label>
              <textarea required placeholder="Product description..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label>Sizes (Comma separated) *</label>
                <input required placeholder="S,M,L,XL" value={form.sizes} onChange={e => setForm({ ...form, sizes: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Colors (Comma separated)</label>
                <input placeholder="Black,White,Gold" value={form.colors} onChange={e => setForm({ ...form, colors: e.target.value })} />
              </div>
            </div>

            <div className="form-grid-4" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label>Price (INR) *</label>
                <input required type="number" placeholder="Price" value={form.price} onChange={e => setForm({ ...form, price: Number(e.target.value) })} />
              </div>
              <div className="form-group">
                <label>Initial Stock *</label>
                <input required type="number" placeholder="Stock" value={form.stock} onChange={e => setForm({ ...form, stock: Number(e.target.value) })} />
              </div>
              <div className="form-group">
                <label>Discount %</label>
                <input type="number" placeholder="Discount" min="0" max="99" value={form.discountPercentage} onChange={e => setForm({ ...form, discountPercentage: Number(e.target.value) })} />
              </div>
              <div className="form-group">
                <label>Initial Rating (0-5)</label>
                <input type="number" step="0.1" min="0" max="5" placeholder="Rating" value={form.averageRating} onChange={e => setForm({ ...form, averageRating: Number(e.target.value) })} />
              </div>
            </div>

            <div className="form-group">
              <label>Main Image URL *</label>
              <input required placeholder="https://unsplash.com/..." value={form.imageUrl} onChange={e => setForm({ ...form, imageUrl: e.target.value })} />
            </div>

            <div className="form-group">
              <label>Additional Images (Comma separated URLs)</label>
              <textarea placeholder="Image 1 URL, Image 2 URL, Image 3 URL" value={form.imageUrls} onChange={e => setForm({ ...form, imageUrls: e.target.value })} />
            </div>

            <div className="form-group">
              <label>Specifications (Multi-line text)</label>
              <textarea placeholder="Material: 100% Cotton&#10;Fit: Regular&#10;Care: Dry Clean Only" value={form.specifications} onChange={e => setForm({ ...form, specifications: e.target.value })} />
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '14px' }}>
              {editingProductId && (
                <button className="secondary" type="button" onClick={() => { setEditingProductId(null); setForm({ name: '', description: '', imageUrl: '', sizes: 'S,M,L,XL', price: 999, stock: 10, categoryId: 1, brand: '', colors: '', imageUrls: '', specifications: '', discountPercentage: 0, averageRating: 5.0 }); }}>Cancel</button>
              )}
              <button className="primary full gold-btn">{editingProductId ? 'Update Product' : 'Create Product'}</button>
            </div>
          </form>

          {/* List of Products */}
          <section className="panel">
            <h2>Active Catalog ({products.length})</h2>
            <div style={{ marginTop: '20px', maxHeight: '600px', overflowY: 'auto', paddingRight: '6px' }}>
              {products.length === 0 && <p className="empty-state">No products registered.</p>}
              {products.map(product => (
                <div className="admin-row" key={product.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                  <div>
                    <h5 style={{ margin: 0, fontSize: '0.9rem' }}>{product.name}</h5>
                    <small style={{ color: 'var(--text-muted)' }}>{product.brand || 'No brand'} | Stock: {product.stock}</small>
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button className="icon-btn" onClick={() => handleEditClick(product)} style={{ width: '30px', height: '30px' }} aria-label="Edit product"><Edit size={12} /></button>
                    <button className="icon-btn" onClick={() => handleDeleteProduct(product.id)} style={{ width: '30px', height: '30px', color: 'var(--error)' }} aria-label="Delete product"><Trash2 size={12} /></button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* Tab Content 3: Inventory Stock Manager */}
      {activeTab === 'inventory' && (
        <section className="panel animate-fade">
          <h2>Inventory Stock Levels</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--primary-color)', textAlign: 'left', fontSize: '0.85rem' }}>
                <th style={{ padding: '10px 0' }}>Product Name</th>
                <th style={{ padding: '10px 0' }}>Brand</th>
                <th style={{ padding: '10px 0', textAlign: 'center' }}>Stock Status</th>
                <th style={{ padding: '10px 0', textAlign: 'center' }}>Current Stock</th>
                <th style={{ padding: '10px 0', textAlign: 'right' }}>Quick Adjust</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => {
                const isLow = product.stock < 10;
                return (
                  <tr key={product.id} style={{ borderBottom: '1px solid var(--border-color)', fontSize: '0.9rem' }}>
                    <td style={{ padding: '12px 0' }}>{product.name}</td>
                    <td style={{ padding: '12px 0' }}>{product.brand || 'N/A'}</td>
                    <td style={{ padding: '12px 0', textAlign: 'center' }}>
                      <span className={`status-badge ${product.stock > 0 ? (isLow ? 'confirmed' : 'delivered') : 'cancelled'}`} style={{ fontSize: '0.65rem' }}>
                        {product.stock > 0 ? (isLow ? 'Low Stock' : 'In Stock') : 'Out Of Stock'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 0', textAlign: 'center', fontWeight: 'bold', color: isLow ? 'var(--error)' : 'inherit' }}>{product.stock}</td>
                    <td style={{ padding: '12px 0', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '4px' }}>
                        <button className="secondary" onClick={() => handleQuickStockUpdate(product.id, product.stock, 5)} style={{ padding: '4px 8px', fontSize: '0.7rem', minHeight: 'auto' }}>+5</button>
                        <button className="secondary" onClick={() => handleQuickStockUpdate(product.id, product.stock, 20)} style={{ padding: '4px 8px', fontSize: '0.7rem', minHeight: 'auto' }}>+20</button>
                        <button className="secondary" onClick={() => handleQuickStockUpdate(product.id, product.stock, -1)} style={{ padding: '4px 8px', fontSize: '0.7rem', minHeight: 'auto', color: 'var(--error)' }}>-1</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>
      )}

      {/* Tab Content: Category Management */}
      {activeTab === 'categories' && (
        <div className="admin-grid animate-fade">
          {/* Add / Edit Form */}
          <form className="panel admin-form" onSubmit={handleSaveCategory}>
            <h2>{editingCategoryId ? 'Edit Category' : 'Add New Category'}</h2>
            <div className="form-group">
              <label>Category Name *</label>
              <input 
                required 
                placeholder="Category name (e.g. Accessories)" 
                value={categoryForm.name} 
                onChange={e => setCategoryForm({ ...categoryForm, name: e.target.value })} 
              />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea 
                placeholder="Category description..." 
                value={categoryForm.description} 
                onChange={e => setCategoryForm({ ...categoryForm, description: e.target.value })} 
              />
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '14px' }}>
              {editingCategoryId && (
                <button 
                  className="secondary" 
                  type="button" 
                  onClick={() => { setEditingCategoryId(null); setCategoryForm({ name: '', description: '' }); }}
                >
                  Cancel
                </button>
              )}
              <button className="primary full gold-btn">
                {editingCategoryId ? 'Update Category' : 'Create Category'}
              </button>
            </div>
          </form>

          {/* List of Categories */}
          <section className="panel">
            <h2>Active Categories ({categories.length})</h2>
            <div style={{ marginTop: '20px', maxHeight: '500px', overflowY: 'auto', paddingRight: '6px' }}>
              {categories.length === 0 && <p className="empty-state">No categories defined.</p>}
              {categories.map(cat => (
                <div className="admin-row" key={cat.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                  <div>
                    <h5 style={{ margin: 0, fontSize: '0.95rem' }}>{cat.name}</h5>
                    <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{cat.description || 'No description'}</p>
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button 
                      className="icon-btn" 
                      onClick={() => handleEditCategoryClick(cat)} 
                      style={{ width: '30px', height: '30px' }} 
                      aria-label="Edit category"
                    >
                      <Edit size={12} />
                    </button>
                    <button 
                      className="icon-btn" 
                      onClick={() => handleDeleteCategory(cat.id)} 
                      style={{ width: '30px', height: '30px', color: 'var(--error)' }} 
                      aria-label="Delete category"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* Tab Content 4: Order Statuses and Refunds */}
      {activeTab === 'orders' && (
        <section className="panel animate-fade">
          <h2>Order Fulfillment Manager</h2>
          <div className="admin-orders-list" style={{ marginTop: '20px' }}>
            {orders.length === 0 && <p className="empty-state">No orders placed in system.</p>}
            {orders.map(order => (
              <div key={order.id} className="order-detail-card" style={{ marginBottom: '16px' }}>
                <div className="order-detail-header" style={{ padding: '12px 20px' }}>
                  <strong>Order #{order.id} | Billed to: {order.shippingName || order.user?.name}</strong>
                  <span>₹{Number(order.totalAmount).toLocaleString('en-IN')}</span>
                </div>
                <div style={{ padding: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  {/* Status Dropdowns */}
                  <div>
                    <h5 style={{ margin: '0 0 6px', textTransform: 'uppercase', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Fulfillment Status</h5>
                    <select 
                      value={order.status} 
                      onChange={e => handleUpdateOrderStatus(order.id, e.target.value)}
                      style={{ fontSize: '0.85rem', padding: '6px' }}
                    >
                      <option value="PLACED">Placed</option>
                      <option value="CONFIRMED">Confirmed</option>
                      <option value="SHIPPED">Shipped</option>
                      <option value="DELIVERED">Delivered</option>
                      <option value="CANCELLED">Cancelled</option>
                      <option value="RETURN_REQUESTED">Return Requested</option>
                      <option value="RETURNED">Returned</option>
                    </select>
                  </div>
                  <div>
                    <h5 style={{ margin: '0 0 6px', textTransform: 'uppercase', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Refund Status</h5>
                    <select 
                      value={order.refundStatus || 'NO_REFUND'} 
                      onChange={e => handleUpdateRefundStatus(order.id, e.target.value)}
                      style={{ fontSize: '0.85rem', padding: '6px' }}
                    >
                      <option value="NO_REFUND">No Refund</option>
                      <option value="PENDING">Refund Pending</option>
                      <option value="REFUNDED">Refunded</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Tab Content 5: Review Manager */}
      {activeTab === 'reviews' && (
        <section className="panel animate-fade">
          <h2>Review Manager</h2>
          <div className="reviews-list" style={{ marginTop: '20px' }}>
            {reviews.length === 0 && <p className="empty-state">No reviews loaded.</p>}
            {reviews.map(review => (
              <div key={review.id} className="review-item animate-slide" style={{ padding: '16px', marginBottom: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <div>
                    <strong>{review.userName}</strong> 
                    <small style={{ color: 'var(--text-muted)' }}> reviewed on Product #{review.productId}</small>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ color: 'var(--gold-primary)', fontSize: '0.8rem' }}>
                      {review.rating} ★
                    </div>
                    <button className="icon-btn" onClick={() => handleDeleteReview(review.id)} style={{ width: '28px', height: '28px', color: 'var(--error)' }} aria-label="Delete review">
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{review.comment}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Tab Content 6: User Management */}
      {activeTab === 'users' && (
        <section className="panel animate-fade">
          <h2>User Role Directory</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--primary-color)', textAlign: 'left', fontSize: '0.85rem' }}>
                <th style={{ padding: '10px 0' }}>User Name</th>
                <th style={{ padding: '10px 0' }}>Email Address</th>
                <th style={{ padding: '10px 0' }}>Current Role</th>
                <th style={{ padding: '10px 0', textAlign: 'right' }}>Security Privilege Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id} style={{ borderBottom: '1px solid var(--border-color)', fontSize: '0.9rem' }}>
                  <td style={{ padding: '12px 0' }}>{user.name}</td>
                  <td style={{ padding: '12px 0' }}>{user.email}</td>
                  <td style={{ padding: '12px 0' }}>
                    <span className={`status-badge ${user.role === 'ADMIN' ? 'delivered' : 'placed'}`} style={{ fontSize: '0.65rem' }}>
                      {user.role}
                    </span>
                  </td>
                  <td style={{ padding: '12px 0', textAlign: 'right' }}>
                    <button 
                      className="secondary" 
                      onClick={() => handleUpdateUserRole(user.id, user.role)}
                      style={{ padding: '4px 10px', fontSize: '0.75rem', minHeight: 'auto' }}
                    >
                      {user.role === 'ADMIN' ? 'Demote to User' : 'Promote to Admin'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </main>
  );
}
