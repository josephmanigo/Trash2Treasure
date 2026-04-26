import { motion } from 'framer-motion';
import { Camera, Star, HelpCircle, Leaf, TrendingUp, Recycle, ChevronRight, User } from 'lucide-react';
import { api } from '../../utils/api';
import './HomeScreen.css';

const ecoTips = [
  'Recycling one aluminum can saves enough energy to run a TV for 3 hours.',
  'A plastic bottle takes 450 years to decompose in a landfill.',
  'Composting food waste reduces methane emissions significantly.',
  'Reusing a glass jar 10 times has a lower carbon footprint than recycling.',
];

const HomeScreen = ({ user, savedCount, onStartScan, onSavedIdeas, onHowItWorks, onProfile }) => {
  const tip = ecoTips[Math.floor(Date.now() / 86400000) % ecoTips.length];
  const stats = [
    { label: 'Saved Ideas',    value: savedCount || 0, icon: Star,      suffix: '' },
    { label: 'Scans Made',     value: '1.2k',          icon: Camera,    suffix: '' },
    { label: 'CO₂ Saved',      value: '350',           icon: Leaf,      suffix: 'g' },
  ];

  const cardVariants = {
    hidden:  { opacity: 0, y: 20 },
    visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.4, ease: 'easeOut' } }),
  };

  return (
    <div className="home-screen">
      {/* Top Navigation Bar */}
      <motion.div
        className="home-nav"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="home-nav-brand">
          <div className="home-nav-logo">
            <img src="/icon.png" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain', transform: 'scale(2.5)' }} />
          </div>
          <div>
            <p className="home-nav-title">Trash2Treasure</p>
            <p className="home-nav-sub">Welcome back{user?.name ? `, ${user.name}` : ''}</p>
          </div>
        </div>
        <button className="home-avatar-btn" onClick={onProfile} aria-label="Profile">
          {user?.avatar ? (
            <img src={api.getAvatarUrl(user.avatar)} alt="" className="home-avatar-img" />
          ) : (
            <User size={18} strokeWidth={2} />
          )}
        </button>
      </motion.div>

      {/* Scrollable body */}
      <div className="home-body scroll-area">

        {/* Hero CTA Card */}
        <motion.div
          className="home-hero-card"
          custom={0} variants={cardVariants} initial="hidden" animate="visible"
        >
          <div className="home-hero-card-bg">
            <img src="/eco_card_texture.png" alt="" className="home-hero-texture" aria-hidden="true" />
          </div>

          <h2 className="home-hero-title">See the treasure<br />in your trash</h2>
          <p className="home-hero-sub">
            Point your camera at any waste item and discover amazing recycling ideas in seconds.
          </p>
          <motion.button
            className="home-scan-btn"
            id="btn-start-scanning"
            onClick={onStartScan}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
          >
            <Camera size={18} strokeWidth={2} />
            Start Scanning
          </motion.button>
        </motion.div>

        {/* Stats Row */}
        <motion.div
          className="home-stats"
          custom={1} variants={cardVariants} initial="hidden" animate="visible"
        >
          {stats.map(({ label, value, icon: Icon, suffix }) => (
            <div key={label} className="home-stat-card">
              <div className="icon-wrap icon-wrap-sm icon-wrap-green">
                <Icon size={16} strokeWidth={2} />
              </div>
              <p className="home-stat-value">{value}<span className="home-stat-suffix">{suffix}</span></p>
              <p className="home-stat-label">{label}</p>
            </div>
          ))}
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          className="home-section"
          custom={2} variants={cardVariants} initial="hidden" animate="visible"
        >
          <p className="home-section-title">Quick Actions</p>
          <div className="home-actions-grid">
            <motion.button
              className="home-action-card"
              id="btn-saved-ideas"
              onClick={onSavedIdeas}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.97 }}
            >
              <div className="home-action-icon" style={{ background: '#fff7ed', color: '#c2410c' }}>
                <Star size={20} strokeWidth={2} />
              </div>
              <div className="home-action-info">
                <p className="home-action-name">Saved Ideas</p>
                <p className="home-action-sub">{savedCount || 0} saved</p>
              </div>
              <ChevronRight size={16} strokeWidth={2} className="home-action-arrow" />
            </motion.button>

            <motion.button
              className="home-action-card"
              id="btn-how-it-works"
              onClick={onHowItWorks}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.97 }}
            >
              <div className="home-action-icon" style={{ background: '#eff6ff', color: '#1d4ed8' }}>
                <HelpCircle size={20} strokeWidth={2} />
              </div>
              <div className="home-action-info">
                <p className="home-action-name">How It Works</p>
                <p className="home-action-sub">Quick guide</p>
              </div>
              <ChevronRight size={16} strokeWidth={2} className="home-action-arrow" />
            </motion.button>
          </div>
        </motion.div>

        {/* Eco Tip */}
        <motion.div
          className="home-eco-tip"
          custom={3} variants={cardVariants} initial="hidden" animate="visible"
        >
          <div className="home-eco-tip-icon">
            <Recycle size={18} strokeWidth={2} />
          </div>
          <div>
            <p className="home-eco-tip-label">Eco Tip of the Day</p>
            <p className="home-eco-tip-text">{tip}</p>
          </div>
        </motion.div>

        {/* Bottom spacer */}
        <div style={{ height: 32 }} />
      </div>
    </div>
  );
};

export default HomeScreen;
