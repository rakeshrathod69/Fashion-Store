import React, { useState } from 'react';
import { Link, NavLink, Route, Routes, useNavigate } from 'react-router-dom';
import { LayoutDashboard, LogOut, ShoppingBag, Store, UserRound, Heart, Menu, X } from 'lucide-react';
import { getSession, logout } from './api';
import Home from './pages/Home.jsx';
import Auth from './pages/Auth.jsx';
import Cart from './pages/Cart.jsx';
import Checkout from './pages/Checkout.jsx';
import Profile from './pages/Profile.jsx';
import Admin from './pages/Admin.jsx';
import ProductDetails from './pages/ProductDetails.jsx';
import Footer from './components/Footer.jsx';

export default function App() {
  const session = getSession();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  React.useEffect(() => {
    if (session?.role === 'ADMIN' && window.location.pathname === '/') {
      navigate('/admin');
    }
  }, [session, navigate]);

  function signOut() {
    logout();
    navigate('/');
    window.location.reload();
  }

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <header className="topbar">
        <Link className="brand" to="/" onClick={closeMenu}>
          <span className="brand-mark"><Store size={19} /></span>
          <span>
            Aura Luxe
            <small>Curated Luxury Apparel</small>
          </span>
        </Link>

        {/* Desktop nav — hidden on mobile via CSS */}
        <nav className="desktop-nav">
          <NavLink to="/" onClick={closeMenu}>Shop</NavLink>
          <NavLink to="/cart" onClick={closeMenu}>Cart</NavLink>
          {session?.role === 'ADMIN' && <NavLink to="/admin" onClick={closeMenu}>Admin</NavLink>}
          {session
            ? <NavLink to="/profile" onClick={closeMenu}>Profile</NavLink>
            : <NavLink to="/login" onClick={closeMenu}>Login</NavLink>}
        </nav>

        <div className="header-actions">
          <Link className="icon-btn" to="/profile?tab=wishlist" aria-label="Wishlist" onClick={closeMenu}>
            <Heart size={18} />
          </Link>
          <Link className="icon-btn" to="/cart" aria-label="Cart" onClick={closeMenu}>
            <ShoppingBag size={18} />
          </Link>
          {session?.role === 'ADMIN' && (
            <Link className="icon-btn" to="/admin" aria-label="Admin dashboard" onClick={closeMenu}>
              <LayoutDashboard size={18} />
            </Link>
          )}
          {session ? (
            <button className="icon-btn" onClick={signOut} aria-label="Logout">
              <LogOut size={18} />
            </button>
          ) : (
            <Link className="icon-btn" to="/login" aria-label="Login" onClick={closeMenu}>
              <UserRound size={18} />
            </Link>
          )}
          {/* Hamburger — only visible on mobile via CSS */}
          <button
            className="icon-btn hamburger-btn"
            onClick={() => setMenuOpen(m => !m)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* Mobile nav — outside header to escape backdrop-filter stacking context */}
      <nav className={`mobile-nav-dropdown ${menuOpen ? 'open' : ''}`}>
        <NavLink to="/" onClick={closeMenu}>Shop</NavLink>
        <NavLink to="/cart" onClick={closeMenu}>Cart</NavLink>
        {session?.role === 'ADMIN' && <NavLink to="/admin" onClick={closeMenu}>Admin</NavLink>}
        {session
          ? <NavLink to="/profile" onClick={closeMenu}>Profile</NavLink>
          : <NavLink to="/login" onClick={closeMenu}>Login</NavLink>}
      </nav>

      {/* Mobile nav backdrop */}
      {menuOpen && <div className="mobile-nav-backdrop" onClick={closeMenu} />}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/login" element={<Auth />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
      <Footer />
    </>
  );
}
