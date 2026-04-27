import { useRef, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import Webcam from 'react-webcam';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import '@tensorflow/tfjs';
import { ArrowLeft, Zap, ZapOff, RefreshCw, Camera, Layers, Search, Package, CupSoda, BookOpen, Smartphone, Scissors, Shirt, Leaf, Droplets, Apple, Armchair, Heart, Plug } from 'lucide-react';
import { getIdeasForObject } from '../../data/recyclingIdeas';
import { MODEL_MAP } from '../ARScreen/ideaModelMap';
import './ScannerScreen.css';

const RECYCLABLE = [
  'bottle', 'cup', 'book', 'cell phone', 'laptop', 'keyboard',
  'mouse', 'remote', 'tv', 'scissors', 'knife', 'fork', 'spoon',
  'person', 'backpack', 'handbag', 'suitcase', 'bowl', 'wine glass',
  'vase', 'banana', 'apple', 'orange', 'broccoli', 'carrot',
  'sandwich', 'hot dog', 'pizza', 'donut', 'cake',
  'chair', 'couch', 'bed', 'dining table', 'bench',
  'teddy bear', 'frisbee', 'sports ball', 'kite', 'baseball bat',
  'baseball glove', 'skateboard', 'surfboard', 'tennis racket',
  'microwave', 'oven', 'toaster', 'refrigerator', 'sink',
  'umbrella', 'tie', 'clock', 'potted plant', 'toothbrush', 'hair drier',
];

const DEMO_ITEMS = [
  { class: 'bottle',     label: 'Plastic Bottle',    icon: Package,    color: '#4ade80', score: 0.94 },
  { class: 'cup',        label: 'Cup / Container',   icon: CupSoda,    color: '#60a5fa', score: 0.91 },
  { class: 'book',       label: 'Paper / Book',      icon: BookOpen,   color: '#f59e0b', score: 0.88 },
  { class: 'cell phone', label: 'Electronics',       icon: Smartphone, color: '#a78bfa', score: 0.90 },
  { class: 'scissors',   label: 'Metal / Tin Can',   icon: Scissors,   color: '#94a3b8', score: 0.86 },
  { class: 'person',     label: 'Fabric / Clothing', icon: Shirt,      color: '#f472b6', score: 0.89 },
  { class: 'vase',       label: 'Glass / Ceramic',   icon: Droplets,   color: '#06b6d4', score: 0.87 },
  { class: 'banana',     label: 'Food / Organic',    icon: Apple,      color: '#84cc16', score: 0.92 },
  { class: 'chair',      label: 'Old Furniture',     icon: Armchair,   color: '#d97706', score: 0.85 },
  { class: 'teddy bear', label: 'Toys / Sports',     icon: Heart,      color: '#ec4899', score: 0.88 },
  { class: 'microwave',  label: 'Home Appliance',    icon: Plug,       color: '#6366f1', score: 0.84 },
  { class: 'default',    label: 'Other Waste',       icon: Leaf,       color: '#34d399', score: 0.82 },
];

const getClassIcon = (cls) => {
  const item = DEMO_ITEMS.find(i =>
    i.class === cls ||
    (i.class === 'bottle' && cls === 'wine glass') ||
    (i.class === 'cup' && cls === 'bowl') ||
    (i.class === 'cell phone' && ['laptop', 'keyboard', 'mouse', 'remote', 'tv', 'clock', 'hair drier'].includes(cls)) ||
    (i.class === 'scissors' && ['knife', 'fork', 'spoon', 'toothbrush'].includes(cls)) ||
    (i.class === 'person' && ['backpack', 'handbag', 'suitcase', 'umbrella', 'tie'].includes(cls)) ||
    (i.class === 'vase' && ['wine glass'].includes(cls)) ||
    (i.class === 'banana' && ['apple', 'orange', 'broccoli', 'carrot', 'sandwich', 'hot dog', 'pizza', 'donut', 'cake', 'potted plant'].includes(cls)) ||
    (i.class === 'chair' && ['couch', 'bed', 'dining table', 'bench'].includes(cls)) ||
    (i.class === 'teddy bear' && ['frisbee', 'sports ball', 'kite', 'baseball bat', 'baseball glove', 'skateboard', 'surfboard', 'tennis racket'].includes(cls)) ||
    (i.class === 'microwave' && ['oven', 'toaster', 'refrigerator', 'sink'].includes(cls))
  );
  const IconComponent = item ? item.icon : Leaf;
  return <IconComponent size={20} />;
};

/* ── Mini 3D Preview Scene ── */
function PreviewScene({ modelClass }) {
  const ModelComponent = MODEL_MAP[modelClass] || MODEL_MAP.default;
  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight position={[3, 5, 3]} intensity={1.2} />
      <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={6} />
      <Environment preset="city" />
      <ModelComponent />
    </>
  );
}

const ScannerScreen = ({ onBack, onDetect }) => {
  const webcamRef  = useRef(null);
  const animFrame  = useRef(null);

  const [model,          setModel]          = useState(null);
  const [loading,        setLoading]        = useState(true);
  const [flashOn,        setFlashOn]        = useState(false);
  const [facingMode,     setFacingMode]     = useState('environment');
  const [scanning,       setScanning]       = useState(false);
  const [statusMsg,      setStatusMsg]      = useState('Loading AI model...');
  const [topDetection,   setTopDetection]   = useState(null);
  const [showDemoPanel,  setShowDemoPanel]  = useState(false);
  const [highlightItem,  setHighlightItem]  = useState(null);
  const [cameraError,    setCameraError]    = useState(false);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const m = await cocoSsd.load({ base: 'lite_mobilenet_v2' });
        if (mounted) {
          setModel(m);
          setLoading(false);
          setStatusMsg('Point camera at a waste item');
        }
      } catch {
        if (mounted) {
          setLoading(false);
          setStatusMsg('Demo mode — pick an item below');
          setShowDemoPanel(true);
        }
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  const detect = useCallback(async () => {
    if (!model || !webcamRef.current) return;
    const video = webcamRef.current.video;
    if (!video || video.readyState !== 4) {
      animFrame.current = requestAnimationFrame(detect);
      return;
    }
    try {
      const preds    = await model.detect(video);
      const relevant = preds.filter(p => RECYCLABLE.includes(p.class) && p.score > 0.35);
      if (relevant.length > 0) {
        const top = relevant.reduce((a, b) => a.score > b.score ? a : b);
        setTopDetection(top);
        setStatusMsg(`${top.class} — ${Math.round(top.score * 100)}% confident`);
      } else {
        setTopDetection(null);
        setStatusMsg('Point camera at a waste item');
      }
    } catch { }
    animFrame.current = requestAnimationFrame(detect);
  }, [model]);

  useEffect(() => {
    if (!loading && model) animFrame.current = requestAnimationFrame(detect);
    return () => { if (animFrame.current) cancelAnimationFrame(animFrame.current); };
  }, [detect, loading, model]);

  const getFirstIdeaTitle = (cls) => {
    const ideas = getIdeasForObject(cls);
    return ideas?.ideas?.[0]?.title || 'Upcycled Creation';
  };

  const handleCapture = () => {
    setScanning(true);
    if (animFrame.current) cancelAnimationFrame(animFrame.current);
    const imageSrc = webcamRef.current?.getScreenshot();
    setTimeout(() => {
      setScanning(false);
      const det   = topDetection || { class: 'bottle', score: 0.87 };
      const ideas = getIdeasForObject(det.class);
      onDetect({ detection: det, ideas, imageSrc });
    }, 1200);
  };

  const handleDemoPick = (item) => {
    setHighlightItem(item.class);
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      setHighlightItem(null);
      const ideas = getIdeasForObject(item.class);
      onDetect({
        detection: { class: item.class, score: item.score },
        ideas,
        imageSrc: null,
      });
    }, 900);
  };

  return (
    <div className="scanner-screen">
      <Webcam
        ref={webcamRef}
        className="scanner-webcam"
        videoConstraints={{ facingMode, aspectRatio: 9 / 16 }}
        screenshotFormat="image/jpeg"
        screenshotQuality={0.8}
        mirrored={facingMode === 'user'}
        audio={false}
        onUserMediaError={() => {
          setCameraError(true);
          setShowDemoPanel(true);
          setStatusMsg('No camera — pick an item below');
        }}
      />

      <div className="scanner-overlay" />

      {cameraError && (
        <div className="camera-error-bg">
          <Camera size={32} className="camera-error-icon" />
          <p className="camera-error-text">Camera unavailable</p>
          <p className="camera-error-sub">Use demo mode below</p>
        </div>
      )}

      <AnimatePresence>
        {scanning && (
          <motion.div
            className="capture-flash"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.7, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          />
        )}
      </AnimatePresence>

      {/* ── Top Bar ── */}
      <div className="scanner-top-bar">
        <motion.button className="scanner-icon-btn" id="btn-scanner-back" onClick={onBack} whileTap={{ scale: 0.9 }}>
          <ArrowLeft size={20} />
        </motion.button>

        <div className="scanner-title-area">
          <p className="scanner-screen-title">Scan Item</p>
          <AnimatePresence mode="wait">
            <motion.p
              key={statusMsg}
              className={`scanner-status ${topDetection ? 'detected' : ''}`}
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              transition={{ duration: 0.2 }}
            >
              {loading && <span className="status-loading-dot" />}
              {statusMsg}
            </motion.p>
          </AnimatePresence>
        </div>

        <motion.button
          className="scanner-icon-btn"
          id="btn-flash-toggle"
          onClick={() => setFlashOn(f => !f)}
          whileTap={{ scale: 0.9 }}
        >
          {flashOn ? <Zap size={20} fill="currentColor" /> : <ZapOff size={20} />}
        </motion.button>
      </div>

      {/* ── Scan Frame ── */}
      <div className="scan-frame-wrapper">
        <div className={`scan-frame ${topDetection ? 'scan-frame--active' : ''}`}>
          <span className="corner corner-tl" /><span className="corner corner-tr" />
          <span className="corner corner-bl" /><span className="corner corner-br" />
          {!loading && <div className="scan-line" />}
          
          {topDetection && (
            <motion.div
              className="detection-label"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="detection-icon-wrap">
                {getClassIcon(topDetection.class)}
              </div>
              <div className="detection-info">
                <span className="detection-class">{topDetection.class}</span>
                <span className="detection-conf">{Math.round(topDetection.score * 100)}% match</span>
              </div>
            </motion.div>
          )}
        </div>
        <p className="scan-hint">
          {loading
            ? 'Loading AI model…'
            : topDetection
              ? 'Item detected! Ready to capture.'
              : cameraError
                ? 'Select an item from the demo panel below.'
                : 'Center the waste item in the frame'}
        </p>
      </div>

      {/* ── 3D Preview Panel (shows while scanning detects an item) ── */}
      <AnimatePresence>
        {topDetection && !scanning && (
          <motion.div
            className="scan-3d-preview"
            initial={{ opacity: 0, scale: 0.7, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.7, y: 20 }}
            transition={{ type: 'spring', damping: 20, stiffness: 260 }}
          >
            <Canvas
              camera={{ position: [0, 0.8, 2.8], fov: 52 }}
              gl={{ antialias: true, alpha: true }}
              style={{ background: 'transparent', width: '100%', height: '280px' }}
            >
              <PreviewScene modelClass={topDetection.class.toLowerCase()} />
            </Canvas>
            <div className="scan-3d-label">
              <span className="scan-3d-tag">Could become</span>
              <strong className="scan-3d-title">{getFirstIdeaTitle(topDetection.class)}</strong>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Bottom Controls ── */}
      <div className="scanner-bottom">
        <motion.button
          className="scanner-icon-btn"
          id="btn-flip-camera"
          onClick={() => setFacingMode(m => m === 'environment' ? 'user' : 'environment')}
          whileTap={{ scale: 0.9 }}
        >
          <RefreshCw size={20} />
        </motion.button>

        <motion.button
          className={`capture-btn ${scanning ? 'capturing' : ''} ${topDetection ? 'ready' : ''}`}
          id="btn-capture"
          onClick={handleCapture}
          disabled={scanning}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.92 }}
        >
          <div className="capture-btn-inner"><Search size={28} /></div>
          {topDetection && <div className="capture-ring" />}
        </motion.button>

        {/* Demo Toggle */}
        <motion.button
          className={`scanner-icon-btn demo-toggle-btn ${showDemoPanel ? 'demo-active' : ''}`}
          id="btn-demo-toggle"
          onClick={() => setShowDemoPanel(s => !s)}
          whileTap={{ scale: 0.9 }}
          title="Demo mode — pick any item"
        >
          <Layers size={20} />
        </motion.button>
      </div>

      {/* ── Demo Panel ── */}
      <AnimatePresence>
        {showDemoPanel && (
          <motion.div
            className="demo-panel"
            initial={{ y: 340, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 340, opacity: 0 }}
            transition={{ type: 'spring', damping: 26, stiffness: 200 }}
          >
            <div className="demo-panel-handle" />
            <div className="demo-panel-header">
              <p className="demo-panel-title">Demo Mode</p>
              <p className="demo-panel-sub">Tap any item to see its 3D AR model</p>
            </div>
            <div className="demo-grid">
              {DEMO_ITEMS.map(item => {
                const IconComponent = item.icon;
                return (
                  <motion.button
                    key={item.class}
                    className={`demo-item-card ${highlightItem === item.class ? 'demo-scanning' : ''}`}
                    id={`btn-demo-${item.class.replace(' ', '-')}`}
                    onClick={() => handleDemoPick(item)}
                    disabled={scanning}
                    whileHover={{ scale: 1.04, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="demo-item-icon-wrap" style={{ color: item.color }}>
                      <IconComponent size={20} />
                    </div>
                    <span className="demo-item-label">{item.label}</span>
                    {highlightItem === item.class && (
                      <motion.div
                        className="demo-scanning-ring"
                        initial={{ scale: 0.8, opacity: 1 }}
                        animate={{ scale: 1.5, opacity: 0 }}
                        transition={{ duration: 0.7, repeat: Infinity }}
                      />
                    )}
                  </motion.button>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ScannerScreen;
