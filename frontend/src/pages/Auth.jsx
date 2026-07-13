import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  Mail,
  MapPinned,
  Phone,
  ShieldCheck,
  ShoppingBag,
  Truck,
  UserRound,
  ArrowLeft
} from 'lucide-react';
import { api, setSession } from '../api';

function Field({ icon: Icon, ...props }) {
  return (
    <label className="field">
      <span className="field-icon"><Icon size={16} /></span>
      <input {...props} />
    </label>
  );
}

export default function Auth() {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', address: '' });
  const [role, setRole] = useState('USER');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // Password reset specific state
  const [resetEmail, setResetEmail] = useState('');
  const [resetName, setResetName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    // Clear inputs when changing mode
    setForm({ name: '', email: '', password: '', phone: '', address: '' });
    setRole('USER');
    setError('');
    setResetEmail('');
    setResetName('');
    setNewPassword('');
    setConfirmPassword('');
  }, [mode]);

  function handleRoleChange(selectedRole) {
    setRole(selectedRole);
    if (mode === 'login' && selectedRole === 'ADMIN') {
      setForm({
        name: '',
        email: 'admin@fashionstore.com',
        password: 'admin123',
        phone: '',
        address: ''
      });
    } else {
      setForm({
        name: '',
        email: '',
        password: '',
        phone: '',
        address: ''
      });
    }
  }

  const heroCopy = useMemo(() => {
    if (mode === 'login') {
      return {
        title: 'Sign in to continue shopping',
        subtitle: 'Get back to your cart, track orders, and keep delivery details ready for checkout.'
      };
    } else if (mode === 'forgot-password') {
      return {
        title: 'Reset your account password',
        subtitle: 'Verify your name and email to securely set a new account password.'
      };
    }
    return {
      title: 'Create your shopping account',
      subtitle: 'Save addresses, checkout faster, and keep every order in one place.'
    };
  }, [mode]);

  async function submit(e) {
    e.preventDefault();
    setError('');
    try {
      const session = await api(`/auth/${mode === 'login' ? 'login' : 'register'}`, {
        method: 'POST',
        body: JSON.stringify({ ...form, role })
      });
      setSession(session);
      if (session.role === 'ADMIN') {
        window.location.href = '/admin';
      } else {
        window.location.href = '/';
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Check your details and try again.');
    }
  }

  async function handleResetPasswordByNameAndEmail(e) {
    e.preventDefault();
    setError('');
    if (!resetEmail) {
      setError('Please enter your email address.');
      return;
    }
    if (!resetName) {
      setError('Please enter your registered name.');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setError('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    try {
      await api('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ email: resetEmail, name: resetName, newPassword })
      });
      alert('Password reset successful! Please log in with your new password.');
      setMode('login');
    } catch (err) {
      setError(err.message || 'Failed to reset password. Verify email and name.');
    }
  }

  return (
    <main className="auth-shell" style={{ position: 'relative' }}>
      <button className="back-btn" onClick={() => navigate(-1)} style={{ position: 'absolute', top: '20px', left: '20px', zIndex: 10 }} aria-label="Go Back">
        <ArrowLeft size={14} /> Back
      </button>
      <section className="auth-hero">
        <div className="auth-hero-card">
          <p className="eyebrow">Account access</p>
          <h1>{heroCopy.title}</h1>
          <p>{heroCopy.subtitle}</p>
          <div className="auth-benefits">
            <div>
              <ShieldCheck size={18} />
              <span>Secure login and order history</span>
            </div>
            <div>
              <Truck size={18} />
              <span>Fast checkout with saved address details</span>
            </div>
            <div>
              <ShoppingBag size={18} />
              <span>Keep carts, returns, and deliveries in one place</span>
            </div>
          </div>
        </div>
      </section>

      <section className="auth-panel panel">
        {mode === 'forgot-password' ? (
          <>
            <div className="auth-panel-head">
              <div>
                <span className="auth-kicker">Security</span>
                <h2>Reset Password</h2>
              </div>
            </div>

            <form className="auth-form" onSubmit={handleResetPasswordByNameAndEmail}>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '10px', lineHeight: '1.5' }}>
                Verify your account email and registered full name to set a new password.
              </p>

              <Field
                icon={Mail}
                placeholder="Email address"
                type="email"
                required
                value={resetEmail}
                onChange={e => setResetEmail(e.target.value)}
              />

              <Field
                icon={UserRound}
                placeholder="Full name (registered)"
                type="text"
                required
                value={resetName}
                onChange={e => setResetName(e.target.value)}
              />

              <label className="field">
                <span className="field-icon"><Lock size={16} /></span>
                <input
                  placeholder="New Password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="field-action"
                  onClick={() => setShowPassword(v => !v)}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </label>

              <label className="field">
                <span className="field-icon"><Lock size={16} /></span>
                <input
                  placeholder="Confirm New Password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                />
              </label>

              {error && <p className="error">{error}</p>}

              <button className="primary full auth-submit" type="submit">
                Reset Password
                <ArrowRight size={16} />
              </button>

              <button 
                type="button" 
                className="secondary full" 
                onClick={() => setMode('login')}
                style={{ marginTop: '8px' }}
              >
                Cancel & Back to Login
              </button>
            </form>
          </>
        ) : (
          <>
            <div className="auth-panel-head">
              <div>
                <span className="auth-kicker">Welcome</span>
                <h2>{mode === 'login' ? 'Sign in' : 'Register'}</h2>
              </div>
              <div className="tabs auth-tabs">
                <button type="button" className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>Login</button>
                <button type="button" className={mode === 'register' ? 'active' : ''} onClick={() => setMode('register')}>Register</button>
              </div>
            </div>

            <form className="auth-form" onSubmit={submit}>
              <div className="role-selector">
                <button
                  type="button"
                  className={role === 'USER' ? 'active' : ''}
                  onClick={() => handleRoleChange('USER')}
                >
                  Customer
                </button>
                <button
                  type="button"
                  className={role === 'ADMIN' ? 'active' : ''}
                  onClick={() => handleRoleChange('ADMIN')}
                >
                  Admin
                </button>
              </div>

              {mode === 'register' && (
                <Field
                  icon={UserRound}
                  placeholder="Full name"
                  value={form.name}
                  autoComplete="name"
                  onChange={e => setForm({ ...form, name: e.target.value })}
                />
              )}

              <Field
                icon={Mail}
                placeholder="Email address"
                type="email"
                value={form.email}
                autoComplete="email"
                onChange={e => setForm({ ...form, email: e.target.value })}
              />

              <label className="field">
                <span className="field-icon"><Lock size={16} /></span>
                <input
                  placeholder="Password"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                />
                <button
                  type="button"
                  className="field-action"
                  onClick={() => setShowPassword(v => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </label>

              {mode === 'login' && (
                <div style={{ textAlign: 'right', marginTop: '-10px', marginBottom: '10px' }}>
                  <button 
                    type="button" 
                    className="link-btn" 
                    onClick={() => setMode('forgot-password')}
                    style={{ fontSize: '0.8rem', color: 'var(--gold-dark)', border: 0, background: 'none', padding: 0, cursor: 'pointer' }}
                  >
                    Forgot Password?
                  </button>
                </div>
              )}

              {mode === 'register' && (
                <>
                  <Field
                    icon={Phone}
                    placeholder="Phone number"
                    value={form.phone}
                    autoComplete="tel"
                    onChange={e => setForm({ ...form, phone: e.target.value })}
                  />
                  <label className="field field-textarea">
                    <span className="field-icon"><MapPinned size={16} /></span>
                    <textarea
                      placeholder="Delivery address"
                      value={form.address}
                      autoComplete="street-address"
                      onChange={e => setForm({ ...form, address: e.target.value })}
                    />
                  </label>
                </>
              )}

              {error && <p className="error">{error}</p>}

              <button className="primary full auth-submit" type="submit">
                {mode === 'login' ? 'Continue to shop' : 'Create account'}
                <ArrowRight size={16} />
              </button>
            </form>
          </>
        )}

        <p className="auth-footnote">
          <span>Need help?</span> Use the demo admin account or register with a new email address.
        </p>
      </section>
    </main>
  );
}
