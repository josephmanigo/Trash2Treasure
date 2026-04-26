import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, LogOut, Camera, Edit3, Check, X, ChevronRight, Shield, Trash2, User } from 'lucide-react';
import { api } from '../../utils/api';
import './ProfileScreen.css';

const ProfileScreen = ({ user, onBack, onLogout, onUpdateUser }) => {
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState(user?.name || '');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const avatarUrl = api.getAvatarUrl(user?.avatar);

  const handleSaveName = async () => {
    if (newName.trim() && newName.trim() !== user.name) {
      try {
        const data = await api.updateName(newName.trim());
        onUpdateUser(data.user);
      } catch (err) {
        console.error('Failed to update name:', err);
      }
    }
    setEditingName(false);
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be less than 5MB');
      return;
    }

    setUploading(true);
    try {
      const data = await api.uploadAvatar(file);
      onUpdateUser(data.user);
    } catch (err) {
      console.error('Failed to upload avatar:', err);
    }
    setUploading(false);
    // Reset file input
    e.target.value = '';
  };

  const handleDeleteAccount = async () => {
    try {
      await api.deleteAccount();
      onLogout();
    } catch (err) {
      console.error('Failed to delete account:', err);
    }
  };

  return (
    <div className="profile-screen">
      {/* Header */}
      <motion.div
        className="profile-header"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <button className="profile-back-btn" onClick={onBack}>
          <ArrowLeft size={18} />
        </button>
        <h1 className="profile-header-title">Profile</h1>
        <div style={{ width: 36 }} />
      </motion.div>

      {/* Content */}
      <div className="profile-content scroll-area">
        {/* Avatar & Name Card */}
        <motion.div
          className="profile-card profile-identity"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="profile-avatar-wrapper" onClick={handleAvatarClick}>
            <div className="profile-avatar">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="profile-avatar-img" />
              ) : (
                <User size={32} strokeWidth={1.5} />
              )}
              {uploading && <div className="profile-avatar-uploading"><span className="login-spinner" /></div>}
            </div>
            <div className="profile-avatar-edit-badge">
              <Camera size={12} />
            </div>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
          </div>
          <p className="profile-avatar-hint">Tap to change photo</p>

          <div className="profile-name-section">
            {editingName ? (
              <div className="profile-name-edit">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="profile-name-input"
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                />
                <button className="profile-name-action save" onClick={handleSaveName}>
                  <Check size={16} />
                </button>
                <button className="profile-name-action cancel" onClick={() => { setEditingName(false); setNewName(user?.name || ''); }}>
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div className="profile-name-display">
                <h2 className="profile-name">{user?.name || 'User'}</h2>
                <button className="profile-name-edit-btn" onClick={() => setEditingName(true)}>
                  <Edit3 size={14} />
                </button>
              </div>
            )}
            <p className="profile-email">{user?.email || 'Guest user'}</p>
            <span className="profile-method-badge">
              {user?.method === 'google' ? 'Google Account' : user?.method === 'email' ? 'Email Account' : 'Guest'}
            </span>
          </div>
        </motion.div>

        {/* Settings Section */}
        <motion.div
          className="profile-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <p className="profile-section-title">Account</p>
          <div className="profile-card">
            <button className="profile-menu-item" onClick={() => setShowLogoutConfirm(true)}>
              <div className="profile-menu-icon" style={{ background: '#fef2f2', color: '#dc2626' }}>
                <LogOut size={18} />
              </div>
              <div className="profile-menu-info">
                <p className="profile-menu-name">Log Out</p>
                <p className="profile-menu-sub">Sign out of your account</p>
              </div>
              <ChevronRight size={16} className="profile-menu-arrow" />
            </button>

            {user?.method !== 'guest' && (
              <button className="profile-menu-item" onClick={handleDeleteAccount}>
                <div className="profile-menu-icon" style={{ background: '#fef2f2', color: '#dc2626' }}>
                  <Trash2 size={18} />
                </div>
                <div className="profile-menu-info">
                  <p className="profile-menu-name">Delete Account</p>
                  <p className="profile-menu-sub">Permanently remove your data</p>
                </div>
                <ChevronRight size={16} className="profile-menu-arrow" />
              </button>
            )}
          </div>
        </motion.div>

        <motion.div
          className="profile-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <p className="profile-section-title">About</p>
          <div className="profile-card">
            <div className="profile-menu-item">
              <div className="profile-menu-icon" style={{ background: '#f0fdf4', color: '#16a34a' }}>
                <Shield size={18} />
              </div>
              <div className="profile-menu-info">
                <p className="profile-menu-name">Version</p>
                <p className="profile-menu-sub">Trash2Treasure v1.0.0</p>
              </div>
            </div>
          </div>
        </motion.div>

        <div style={{ height: 40 }} />
      </div>

      {/* Logout Confirm Modal */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <>
            <motion.div
              className="profile-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLogoutConfirm(false)}
            />
            <motion.div
              className="profile-confirm-modal"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: 'spring', damping: 25 }}
            >
              <div className="profile-confirm-icon">
                <LogOut size={24} />
              </div>
              <h3 className="profile-confirm-title">Log out?</h3>
              <p className="profile-confirm-desc">You'll need to sign in again to access your saved ideas.</p>
              <div className="profile-confirm-actions">
                <button className="profile-confirm-btn cancel" onClick={() => setShowLogoutConfirm(false)}>
                  Cancel
                </button>
                <button className="profile-confirm-btn confirm" onClick={onLogout}>
                  Log Out
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfileScreen;
