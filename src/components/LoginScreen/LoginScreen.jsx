import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Sparkles, Mail, ChevronRight, Recycle, Eye, EyeOff, ArrowLeft, User } from 'lucide-react';
import { api } from '../../utils/api';
import './LoginScreen.css';

const features = [
  { icon: Camera,    label: 'Smart Scanner' },
  { icon: Sparkles,  label: 'AR Preview'    },
  { icon: Recycle,   label: 'Eco Ideas'     },
];

const GOOGLE_CLIENT_ID = '886898774772-le3g05q82norpn0t7jl4o3bfvlptutgu.apps.googleusercontent.com';

const LoginScreen = ({ onLogin }) => {
  const [mode, setMode] = useState(null); // null = main, 'email-login', 'email-register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Dynamically load Google script
    if (!document.getElementById('google-gsi')) {
      const script = document.createElement('script');
      script.id = 'google-gsi';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        if (window.google?.accounts?.id) {
          window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: window.__handleGoogleCredential,
          });
        }
      };
      document.head.appendChild(script);
    }
  }, []);

  const handleGoogleLogin = () => {
    if (window.google?.accounts?.id) {
      if (GOOGLE_CLIENT_ID.includes('YOUR_GOOGLE_CLIENT_ID')) {
        setError('Please set your GOOGLE_CLIENT_ID in LoginScreen.jsx and server.js to use Google Login.');
      } else {
        window.google.accounts.id.prompt();
      }
    } else {
      setError('Google Sign-In is still loading. Please try again.');
    }
  };

  // This is called by the Google callback set up in App.jsx
  // For now, we expose it via window
  window.__handleGoogleCredential = async (response) => {
    setLoading(true);
    setError('');
    try {
      const data = await api.googleLogin(response.credential);
      onLogin(data.user);
    } catch (err) {
      setError(err.message || 'Google sign-in failed');
    }
    setLoading(false);
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'email-register') {
        if (!name.trim()) { setError('Please enter your name'); setLoading(false); return; }
        if (!email.trim()) { setError('Please enter your email'); setLoading(false); return; }
        if (password.length < 4) { setError('Password must be at least 4 characters'); setLoading(false); return; }
        const data = await api.register(name.trim(), email.toLowerCase().trim(), password);
        onLogin(data.user);
      } else {
        if (!email.trim()) { setError('Please enter your email'); setLoading(false); return; }
        if (!password) { setError('Please enter your password'); setLoading(false); return; }
        const data = await api.login(email.toLowerCase().trim(), password);
        onLogin(data.user);
      }
    } catch (err) {
      setError(err.message || 'Authentication failed');
    }
    setLoading(false);
  };

  const handleGuestLogin = async () => {
    setLoading(true);
    try {
      const data = await api.guestLogin();
      onLogin(data.user);
    } catch (err) {
      setError(err.message || 'Guest login failed');
    }
    setLoading(false);
  };

  // Email form view
  if (mode === 'email-login' || mode === 'email-register') {
    const isRegister = mode === 'email-register';
    return (
      <div className="login-screen">
        <div className="login-hero">
          <img src="/eco_hero_bg.png" alt="Nature" className="login-hero-img" />
          <div className="login-hero-overlay" />
        </div>

        <motion.div
          className="login-card login-card-form"
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', damping: 22, stiffness: 180 }}
        >
          <div className="login-card-handle" />

          <button className="login-back-btn" onClick={() => { setMode(null); setError(''); }}>
            <ArrowLeft size={18} />
          </button>

          <div className="login-card-header">
            <h2 className="login-card-title">{isRegister ? 'Create Account' : 'Welcome Back'}</h2>
            <p className="login-card-sub">
              {isRegister ? 'Join the eco community today' : 'Sign in to your account'}
            </p>
          </div>

          <form className="login-form" onSubmit={handleEmailSubmit}>
            {isRegister && (
              <div className="login-field">
                <User size={16} className="login-field-icon" />
                <input
                  type="text"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="login-input"
                  id="input-name"
                />
              </div>
            )}

            <div className="login-field">
              <Mail size={16} className="login-field-icon" />
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="login-input"
                id="input-email"
              />
            </div>

            <div className="login-field">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="login-field-icon"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="login-input"
                id="input-password"
              />
              <button
                type="button"
                className="login-eye-btn"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <AnimatePresence>
              {error && (
                <motion.p
                  className="login-error"
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            <motion.button
              type="submit"
              className="login-btn login-btn-primary"
              whileHover={{ scale: 1.015 }}
              whileTap={{ scale: 0.97 }}
              disabled={loading}
            >
              {loading ? (
                <span className="login-spinner" />
              ) : (
                isRegister ? 'Create Account' : 'Sign In'
              )}
            </motion.button>
          </form>

          <p className="login-switch-mode">
            {isRegister ? 'Already have an account? ' : "Don't have an account? "}
            <button
              type="button"
              onClick={() => { setMode(isRegister ? 'email-login' : 'email-register'); setError(''); }}
            >
              {isRegister ? 'Sign In' : 'Sign Up'}
            </button>
          </p>
        </motion.div>
      </div>
    );
  }

  // Main login view
  return (
    <div className="login-screen">
      <div className="login-hero">
        <img src="/eco_hero_bg.png" alt="Nature" className="login-hero-img" />
        <div className="login-hero-overlay" />

        <motion.div
          className="login-hero-text"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.6 }}
        >
          <p className="login-eyebrow">Eco Intelligence</p>
          <h1 className="login-title">
            Trash<span className="login-title-accent">2</span>Treasure
          </h1>
          <p className="login-subtitle">
            Turn everyday waste into creative ideas — powered by AI & AR
          </p>
        </motion.div>

        <motion.div
          className="login-feature-pills"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55, duration: 0.5 }}
        >
          {features.map(({ icon: Icon, label }, i) => (
            <motion.div
              key={label}
              className="login-feature-pill"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 + i * 0.1, type: 'spring', stiffness: 200 }}
            >
              <Icon size={13} strokeWidth={2.5} />
              <span>{label}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>

      <motion.div
        className="login-card"
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, type: 'spring', damping: 22, stiffness: 180 }}
      >
        <div className="login-card-handle" />

        <div className="login-card-header">
          <h2 className="login-card-title">Start your eco journey</h2>
          <p className="login-card-sub">Join 10,000+ people making a difference</p>
        </div>

        <div className="login-actions">
          <motion.button
            className="login-btn login-btn-primary"
            id="btn-google-login"
            onClick={handleGoogleLogin}
            whileHover={{ scale: 1.015 }}
            whileTap={{ scale: 0.97 }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </motion.button>

          <div className="login-divider">
            <span className="login-divider-line" />
            <span className="login-divider-text">or</span>
            <span className="login-divider-line" />
          </div>

          <motion.button
            className="login-btn login-btn-outline"
            id="btn-email-login"
            onClick={() => setMode('email-login')}
            whileHover={{ scale: 1.015 }}
            whileTap={{ scale: 0.97 }}
          >
            <Mail size={17} strokeWidth={2} />
            Continue with Email
          </motion.button>

          <motion.button
            className="login-btn login-btn-ghost"
            id="btn-guest-login"
            onClick={handleGuestLogin}
            whileTap={{ scale: 0.97 }}
            disabled={loading}
          >
            {loading ? <span className="login-spinner" /> : <>Skip — Continue as Guest <ChevronRight size={15} strokeWidth={2.5} /></>}
          </motion.button>
        </div>

        <AnimatePresence>
          {error && (
            <motion.p
              className="login-error"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{ marginTop: 12 }}
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        <p className="login-terms">
          By continuing you agree to our <span>Terms</span> &amp; <span>Privacy Policy</span>
        </p>
      </motion.div>
    </div>
  );
};

export default LoginScreen;
