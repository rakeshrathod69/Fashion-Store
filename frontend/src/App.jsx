import React from 'react';
import { Link, NavLink, Route, Routes, useNavigate } from 'react-router-dom';
import { LayoutDashboard, LogOut, ShoppingBag, Store, UserRound, Heart } from 'lucide-react';
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

  return (
    <>
      <header className="topbar">
        <Link className="brand" to="/">
          <span className="brand-mark"><Store size={19} /></span>
          <span>
            Aura Luxe
            <small>Curated Luxury Apparel</small>
          </span>
        </Link>
        <nav>
          <NavLink to="/">Shop</NavLink>
          <NavLink to="/cart">Cart</NavLink>
          {session?.role === 'ADMIN' && <NavLink to="/admin">Admin</NavLink>}
          {session ? <NavLink to="/profile">Profile</NavLink> : <NavLink to="/login">Login</NavLink>}
        </nav>
        <div className="header-actions">
          <Link className="icon-btn" to="/profile?tab=wishlist" aria-label="Wishlist"><Heart size={18} /></Link>
          <Link className="icon-btn" to="/cart" aria-label="Cart"><ShoppingBag size={18} /></Link>
          {session?.role === 'ADMIN' && <Link className="icon-btn" to="/admin" aria-label="Admin dashboard"><LayoutDashboard size={18} /></Link>}
          {session ? (
            <button className="icon-btn" onClick={signOut} aria-label="Logout"><LogOut size={18} /></button>
          ) : (
            <Link className="icon-btn" to="/login" aria-label="Login"><UserRound size={18} /></Link>
          )}
        </div>
      </header>
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
