import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Star, Trash2, Camera, ChevronRight, Package, CupSoda, BookOpen, Smartphone, Scissors, Shirt, Leaf } from 'lucide-react';
import './SavedScreen.css';

const getObjectIcon = (label) => {
  if (!label) return <Leaf size={14} />;
  const l = label.toLowerCase();
  if (l.includes('bottle')) return <Package size={14} />;
  if (l.includes('cup') || l.includes('container')) return <CupSoda size={14} />;
  if (l.includes('book') || l.includes('paper')) return <BookOpen size={14} />;
  if (l.includes('electronic') || l.includes('phone')) return <Smartphone size={14} />;
  if (l.includes('metal') || l.includes('can')) return <Scissors size={14} />;
  if (l.includes('fabric') || l.includes('clothing')) return <Shirt size={14} />;
  return <Leaf size={14} />;
};

const getIdeaIcon = (id) => {
  if (!id) return <Star size={24} />;
  const firstChar = id.charAt(0);
  if (firstChar === 'b') return <Leaf size={24} />;
  if (firstChar === 'c') return <CupSoda size={24} />;
  if (firstChar === 'p') return <Smartphone size={24} />;
  if (firstChar === 'f') return <Shirt size={24} />;
  if (firstChar === 't') return <Scissors size={24} />;
  return <Star size={24} />;
};

const SavedScreen = ({ onBack, savedIdeas, removeIdea, onViewSteps }) => {
  return (
    <div className="saved-screen">
      <div className="saved-bg-texture">
        <img src="/eco_card_texture.png" alt="" />
      </div>

      {/* Header */}
      <motion.div
        className="saved-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <button className="saved-back-btn" id="btn-saved-back" onClick={onBack}>
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="saved-title">Saved Ideas</h1>
          <p className="saved-subtitle">{savedIdeas.length} idea{savedIdeas.length !== 1 ? 's' : ''} saved</p>
        </div>
        <div className="saved-star-badge">
          <Star size={20} fill="currentColor" />
        </div>
      </motion.div>

      <div className="saved-content scroll-area">
        <AnimatePresence>
          {savedIdeas.length === 0 ? (
            <motion.div
              className="saved-empty"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="empty-icon-wrap">
                <Star size={32} />
              </div>
              <h2 className="empty-title">No saved ideas yet</h2>
              <p className="empty-desc">Start scanning waste items and save your favorite recycling ideas here.</p>
              <button
                className="btn btn-primary"
                id="btn-go-scan"
                onClick={onBack}
                style={{ marginTop: 16 }}
              >
                <Camera size={18} />
                Start Scanning
              </button>
            </motion.div>
          ) : (
            <div className="saved-list">
              {savedIdeas.map((idea, i) => (
                <motion.div
                  key={idea.uniqueKey || idea.id}
                  className="saved-card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100, height: 0, marginBottom: 0 }}
                  transition={{ delay: i * 0.06 }}
                  layout
                >
                  <div className="saved-card-header">
                    <div className="saved-card-obj-tag">
                      {getObjectIcon(idea.objectLabel)}
                      <span>{idea.objectLabel}</span>
                    </div>
                    <button
                      className="saved-delete-btn"
                      id={`btn-delete-idea-${i}`}
                      onClick={() => removeIdea(idea.id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="saved-card-body">
                    <div className="saved-card-icon-wrap">
                      {getIdeaIcon(idea.id)}
                    </div>
                    <div className="saved-card-info">
                      <h3 className="saved-card-title">{idea.title}</h3>
                      <p className="saved-card-desc">{idea.description}</p>
                      <div className="saved-card-meta">
                        <span className={`badge badge-${idea.difficulty?.toLowerCase()}`}>
                          {idea.difficulty}
                        </span>
                        <span className="saved-card-time">⏱ {idea.time}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    className="saved-view-btn"
                    id={`btn-view-saved-${i}`}
                    onClick={() => onViewSteps({ idea, objectData: { label: idea.objectLabel } })}
                  >
                    View Steps <ChevronRight size={16} />
                  </button>
                </motion.div>
              ))}
              <div style={{ height: 24 }} />
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SavedScreen;
