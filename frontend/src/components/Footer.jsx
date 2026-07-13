import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Facebook, Twitter, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="site-footer animate-fade">
      <div className="footer-grid">
        {/* Brand Column */}
        <div className="footer-brand-section">
          <h3 className="footer-brand-title">
            AURA <span>LUXE</span>
          </h3>
          <p className="footer-brand-desc">
            Curated premium luxury apparel for modern confidence. Elevating your everyday wardrobe with sharp tailoring, elegant layers, and premium fabrics.
          </p>
          <div className="footer-socials">
            <a href="https://www.instagram.com/rakesh_rathod___18/" target="_blank" rel="noopener noreferrer" className="footer-social-link" aria-label="Instagram">
              <Instagram size={18} />
            </a>
            <a href="https://www.facebook.com/rakesh.rathod.461788.com" target="_blank" rel="noopener noreferrer" className="footer-social-link" aria-label="Facebook">
              <Facebook size={18} />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="footer-social-link" aria-label="Twitter">
              <Twitter size={18} />
            </a>
          </div>
        </div>

        {/* Quick Links Column */}
        <div className="footer-links-column">
          <h4>Quick Links</h4>
          <ul className="footer-links-list">
            <li><Link to="/">Shop Catalog</Link></li>
            <li><Link to="/cart">My Bag</Link></li>
            <li><Link to="/profile?tab=wishlist">Wishlist</Link></li>
            <li><Link to="/profile?tab=orders">Track Orders</Link></li>
          </ul>
        </div>

        {/* Support Column */}
        <div className="footer-links-column">
          <h4>Customer Care</h4>
          <ul className="footer-links-list">
            <li><Link to="/profile">My Account</Link></li>
            <li><a href="#faq">FAQs & Help</a></li>
            <li><a href="#shipping">Shipping Policy</a></li>
            <li><a href="#returns">Returns & Exchanges</a></li>
          </ul>
        </div>

        {/* Contact Column */}
        <div className="footer-links-column">
          <h4>Contact & Boutique</h4>
          <div className="footer-contact-info">
            <span>
              <MapPin size={14} style={{ display: 'inline', marginRight: '6px', color: 'var(--gold-primary)' }} />
              108 Luxury Boulevard, Colaba, Mumbai, India
            </span>
            <span>
              <Phone size={14} style={{ display: 'inline', marginRight: '6px', color: 'var(--gold-primary)' }} />
              +91 22 5555 1234
            </span>
            <span>
              <Mail size={14} style={{ display: 'inline', marginRight: '6px', color: 'var(--gold-primary)' }} />
              concierge@auraluxe.com
            </span>
          </div>
        </div>
      </div>

      {/* Footer Bottom Row */}
      <div className="footer-bottom">
        <div>
          &copy; {new Date().getFullYear()} AURA LUXE. All rights reserved.
        </div>
        <div className="footer-bottom-links">
          <a href="#privacy">Privacy Policy</a>
          <a href="#terms">Terms of Service</a>
        </div>
      </div>
    </footer>
  );
}
