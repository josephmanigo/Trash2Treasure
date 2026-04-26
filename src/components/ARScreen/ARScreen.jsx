import { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Float } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Star, ChevronRight, RotateCcw, Maximize2, Share2, Package, CupSoda, BookOpen, Smartphone, Scissors, Shirt, Leaf } from 'lucide-react';
import { IDEA_MODEL_MAP, MODEL_MAP } from './ideaModelMap';
import './ARScreen.css';

/* ── Light rig shared by all scenes ── */
function Scene({ ModelComponent }) {
  return (
    <>
      <ambientLight intensity={0.8} />
      <directionalLight position={[5, 8, 5]} intensity={1.5} castShadow />
      <directionalLight position={[-5, 5, -5]} intensity={0.5} />
      <Environment preset="city" />
      <OrbitControls enableZoom={true} enablePan={false} autoRotate={false} maxPolarAngle={Math.PI / 1.8} />
      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.4}>
        <ModelComponent />
      </Float>
    </>
  );
}

const getClassIcon = (cls) => {
  if (!cls) return <Leaf size={16} />;
  const l = cls.toLowerCase();
  if (['bottle', 'wine glass'].includes(l)) return <Package size={16} />;
  if (['cup', 'bowl'].includes(l)) return <CupSoda size={16} />;
  if (l === 'book') return <BookOpen size={16} />;
  if (['cell phone', 'laptop', 'keyboard', 'mouse', 'remote', 'tv'].includes(l)) return <Smartphone size={16} />;
  if (['scissors', 'knife', 'fork', 'spoon'].includes(l)) return <Scissors size={16} />;
  if (['person', 'backpack', 'handbag', 'suitcase'].includes(l)) return <Shirt size={16} />;
  return <Leaf size={16} />;
};

const ARScreen = ({ detectionData, onBack, onViewSteps, onSave, isSaved }) => {
  const [activeIdea, setActiveIdea] = useState(0);

  if (!detectionData) return null;
  const { detection, ideas, imageSrc } = detectionData;
  const idea = ideas?.ideas?.[activeIdea];

  // Pick 3D model: idea-specific first, then category fallback
  const detectedClass = detection?.class?.toLowerCase() || '';
  const ModelComponent =
    IDEA_MODEL_MAP[idea?.id] ||
    MODEL_MAP[detectedClass] ||
    MODEL_MAP.default;

  const handleShare = async () => {
    const shareData = {
      title: 'Trash2Treasure Idea',
      text: `Check out this upcycling idea: ${idea?.title}!`,
      url: window.location.href,
    };
    if (navigator.share) {
      try { await navigator.share(shareData); } catch { /* ignore */ }
    } else {
      alert("Sharing not supported on this browser.");
    }
  };

  return (
    <div className="ar-screen">
      {/* ── AR Canvas Viewport ── */}
      <div className="ar-canvas-wrapper">
        <AnimatePresence mode="wait">
          <motion.div
            key={idea?.id || detectedClass}
            style={{ width: '100%', height: '100%' }}
            initial={{ opacity: 0, scale: 0.88, rotateY: -15 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            exit={{ opacity: 0, scale: 1.08, rotateY: 15 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            <Canvas
              camera={{ position: [0, 1.5, 4.5], fov: 48 }}
              shadows
              gl={{ antialias: true, alpha: true }}
              style={{ background: 'transparent' }}
            >
              <Scene ModelComponent={ModelComponent} />
            </Canvas>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Detection Badge (top-left) ── */}
      <motion.div
        className="ar-label-badge"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5, type: 'spring' }}
      >
        <span className="ar-label-icon">{getClassIcon(detection?.class)}</span>
        <div>
          <p className="ar-label-obj">{ideas?.label || detection?.class}</p>
          <p className="ar-label-sub">
            {Math.round((detection?.score || 0.87) * 100)}% match
          </p>
        </div>
      </motion.div>

      {/* ── Controls hint (top-right) ── */}
      <motion.div
        className="ar-controls-hint"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.8 }}
      >
        <RotateCcw size={11} /> Drag &nbsp;·&nbsp; <Maximize2 size={11} /> Pinch
      </motion.div>

      {/* ── Top Bar ── */}
      <div className="ar-top-bar">
        <motion.button className="ar-icon-btn" id="btn-ar-back" onClick={onBack} whileTap={{ scale: 0.9 }}>
          <ArrowLeft size={20} />
        </motion.button>
        <motion.button className="ar-icon-btn" id="btn-ar-share" onClick={handleShare} whileTap={{ scale: 0.9 }}>
          <Share2 size={18} />
        </motion.button>
      </div>

      {/* ── Bottom Sheet ── */}
      <motion.div
        className="ar-bottom-sheet"
        initial={{ y: 260, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', damping: 22, stiffness: 190, delay: 0.3 }}
      >
        <div className="ar-sheet-handle" />

        {/* Idea Tabs */}
        {ideas?.ideas?.length > 1 && (
          <div className="ar-tabs-container">
            {ideas.ideas.map((tab, idx) => (
              <motion.button
                key={tab.id}
                className={`ar-tab ${activeIdea === idx ? 'active' : ''}`}
                id={`btn-idea-tab-${idx}`}
                onClick={() => setActiveIdea(idx)}
                whileTap={{ scale: 0.96 }}
              >
                {tab.title}
              </motion.button>
            ))}
          </div>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={idea?.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="ar-idea-content"
          >
            {/* Idea Header */}
            <div className="ar-idea-header">
              <h1 className="ar-idea-title">{idea?.title}</h1>
              <div className="ar-idea-meta">
                <span className={`badge badge-${idea?.difficulty?.toLowerCase()}`}>
                  {idea?.difficulty}
                </span>
                <span className="badge badge-muted">⏱ {idea?.time}</span>
                <span className="badge badge-green">Impact: {idea?.impact}</span>
              </div>
            </div>

            <p className="ar-idea-desc">{idea?.description}</p>

            {/* Actions */}
            <div className="ar-idea-actions">
              <motion.button
                className="btn btn-primary"
                style={{ flex: 1 }}
                id="btn-view-steps"
                onClick={() => onViewSteps({ idea, imageSrc, objectData: { label: ideas?.label } })}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                View Steps <ChevronRight size={16} />
              </motion.button>

              <motion.button
                className={`btn-icon ${isSaved(idea?.id) ? 'saved' : ''}`}
                id="btn-save-idea"
                onClick={() => onSave(idea, { label: ideas?.label })}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.9 }}
                aria-label="Save idea"
              >
                <Star size={18} fill={isSaved(idea?.id) ? 'currentColor' : 'none'} />
              </motion.button>
            </div>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default ARScreen;
