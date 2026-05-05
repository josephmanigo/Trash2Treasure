import { useRef, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Float, ContactShadows } from '@react-three/drei';
import Webcam from 'react-webcam';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import '@tensorflow/tfjs';
import { ArrowLeft, Zap, ZapOff, RefreshCw, Camera, Layers, Search, Package, CupSoda, BookOpen, Smartphone, Scissors, Shirt, Leaf, Droplets, Apple, Armchair, Heart, Plug, ZoomIn, ZoomOut } from 'lucide-react';
import { getIdeasForObject } from '../../data/recyclingIdeas';
import { IDEA_MODEL_MAP, MODEL_MAP } from '../ARScreen/ideaModelMap';
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
const getMaskShape = (cls) => {
  const value = cls?.toLowerCase() || '';
  if (['bottle', 'wine glass', 'vase'].includes(value)) return 'bottle';
  if (['cup', 'bowl'].includes(value)) return 'cup';
  if (['book', 'laptop', 'keyboard', 'remote', 'tv'].includes(value)) return 'box';
  if (['cell phone', 'mouse', 'clock'].includes(value)) return 'phone';
  if (['scissors', 'knife', 'fork', 'spoon', 'toothbrush'].includes(value)) return 'can';
  if (['chair', 'couch', 'bed', 'dining table', 'bench'].includes(value)) return 'chair';
  return 'default';
};

function WireframeMask({ shape }) {
  const path = {
    bottle: 'M38 8 H62 V20 C62 25 67 29 68 38 L73 82 C74 90 68 96 60 96 H40 C32 96 26 90 27 82 L32 38 C33 29 38 25 38 20 Z',
    cup: 'M25 18 H75 L68 92 H32 Z',
    box: 'M20 22 H80 V82 H20 Z',
    phone: 'M35 10 H65 C70 10 73 14 73 19 V86 C73 92 69 96 63 96 H37 C31 96 27 92 27 86 V19 C27 14 30 10 35 10 Z',
    can: 'M30 16 C30 10 70 10 70 16 V86 C70 94 30 94 30 86 Z',
    chair: 'M27 22 H73 C78 22 82 26 82 32 V58 H72 V88 H62 V58 H38 V88 H28 V58 H18 V32 C18 26 22 22 27 22 Z',
    default: 'M22 28 C30 12 66 8 78 29 C91 53 75 90 51 94 C27 98 8 66 22 28 Z',
  }[shape] || 'M22 28 C30 12 66 8 78 29 C91 53 75 90 51 94 C27 98 8 66 22 28 Z';

  return (
    <svg className="object-mask-wireframe" viewBox="0 0 100 100" aria-hidden="true">
      <path className="wireframe-shadow" d={path} />
      <path className="wireframe-outline" d={path} />
      {[18, 28, 38, 48, 58, 68, 78, 88].map(y => (
        <path key={`h-${y}`} className="wireframe-line" d={`M18 ${y} H82`} />
      ))}
      {[24, 34, 44, 54, 64, 74].map(x => (
        <path key={`v-${x}`} className="wireframe-line wireframe-line--soft" d={`M${x} 12 C${x - 6} 34 ${x - 6} 68 ${x} 94`} />
      ))}
      <path className="wireframe-line wireframe-line--soft" d="M18 50 C36 42 62 58 82 47" />
      <path className="wireframe-line wireframe-line--soft" d="M20 66 C39 75 60 56 80 70" />
    </svg>
  );
}

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

function RecommendationScene({ ModelComponent, modelZoom }) {
  return (
    <>
      <ambientLight intensity={0.95} />
      <hemisphereLight args={['#ffffff', '#254233', 0.85]} />
      <directionalLight position={[3, 6, 4]} intensity={1.35} castShadow />
      <OrbitControls
        enableZoom
        enablePan={false}
        autoRotate={false}
        minDistance={2.3}
        maxDistance={7}
        maxPolarAngle={Math.PI / 1.85}
      />
      <Environment preset="city" />
      <group scale={modelZoom}>
        <Float speed={1.1} rotationIntensity={0.08} floatIntensity={0.08}>
          <ModelComponent />
        </Float>
      </group>
      <ContactShadows position={[0, -1.08, 0]} opacity={0.42} scale={5.5} blur={2.6} far={4} />
    </>
  );
}

const ScannerScreen = ({ onBack, onDetect }) => {
  const scannerRef = useRef(null);
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
  const [selectedIdeaChoice, setSelectedIdeaChoice] = useState(null);
  const [objectBox,      setObjectBox]      = useState(null);
  const [modelZoom,      setModelZoom]      = useState(1.35);

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
    if (!video || video.readyState !== 4) return;
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
    } catch {
      return;
    }
  }, [model]);

  useEffect(() => {
    if (loading || !model || scanning) return undefined;

    let active = true;
    const runDetection = async () => {
      await detect();
      if (active) animFrame.current = requestAnimationFrame(runDetection);
    };

    animFrame.current = requestAnimationFrame(runDetection);
    return () => {
      active = false;
      if (animFrame.current) cancelAnimationFrame(animFrame.current);
    };
  }, [detect, loading, model, scanning]);

  const updateObjectBox = useCallback(() => {
    const shell = scannerRef.current;
    const video = webcamRef.current?.video;
    const bbox = topDetection?.bbox;

    if (!shell) return;

    const container = shell.getBoundingClientRect();
    if (!bbox || !video?.videoWidth || !video?.videoHeight) {
      setObjectBox(null);
      return;
    }

    const [rawX, rawY, rawW, rawH] = bbox;
    const padX = rawW * 0.08;
    const padY = rawH * 0.08;
    const paddedX = rawX - padX;
    const paddedY = rawY - padY;
    const paddedW = rawW + padX * 2;
    const paddedH = rawH + padY * 2;
    const scale = Math.max(
      container.width / video.videoWidth,
      container.height / video.videoHeight
    );
    const renderedWidth = video.videoWidth * scale;
    const renderedHeight = video.videoHeight * scale;
    const offsetX = (container.width - renderedWidth) / 2;
    const offsetY = (container.height - renderedHeight) / 2;
    const width = paddedW * scale;
    const height = paddedH * scale;
    const mappedX = paddedX * scale + offsetX;
    const left = facingMode === 'user'
      ? container.width - (mappedX + width)
      : mappedX;

    setObjectBox({
      left: clamp(left, 12, Math.max(12, container.width - width - 12)),
      top: clamp(paddedY * scale + offsetY, 88, Math.max(88, container.height - height - 112)),
      width: clamp(width, 76, container.width - 24),
      height: clamp(height, 76, container.height - 160),
      containerWidth: container.width,
      containerHeight: container.height,
    });
  }, [facingMode, topDetection?.bbox]);

  useEffect(() => {
    updateObjectBox();
    window.addEventListener('resize', updateObjectBox);
    return () => window.removeEventListener('resize', updateObjectBox);
  }, [updateObjectBox]);

  const ideasForDetection = topDetection ? getIdeasForObject(topDetection.class) : null;
  const selectedIdea = selectedIdeaChoice?.className === topDetection?.class
    ? ideasForDetection?.ideas?.[selectedIdeaChoice.index]
    : null;
  const SelectedModel =
    IDEA_MODEL_MAP[selectedIdea?.id] ||
    MODEL_MAP[topDetection?.class?.toLowerCase()] ||
    MODEL_MAP.default;

  useEffect(() => {
    if (selectedIdea?.id) setModelZoom(1.35);
  }, [selectedIdea?.id]);

  const modelPreviewStyle = (() => {
    if (!objectBox) return undefined;
    const panelWidth = clamp(objectBox.containerWidth * 0.32, 230, 440);
    const panelHeight = clamp(objectBox.containerHeight * 0.46, 300, 520);
    const gutter = 12;
    const placeRight = objectBox.left + objectBox.width + gutter + panelWidth < objectBox.containerWidth - 12;
    const placeLeft = objectBox.left - gutter - panelWidth > 12;
    const left = placeRight
      ? objectBox.left + objectBox.width + gutter
      : placeLeft
        ? objectBox.left - panelWidth - gutter
        : clamp(objectBox.left + objectBox.width / 2 - panelWidth / 2, 12, objectBox.containerWidth - panelWidth - 12);
    const top = clamp(
      objectBox.top + objectBox.height / 2 - panelHeight / 2,
      96,
      Math.max(96, objectBox.containerHeight - panelHeight - 112)
    );
    return { left, top, width: panelWidth, height: panelHeight };
  })();

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
      setTopDetection({ class: item.class, score: item.score, bbox: null });
      setStatusMsg(`${item.class} - ${Math.round(item.score * 100)}% confident`);
      setShowDemoPanel(false);
    }, 900);
  };

  return (
    <div className="scanner-screen" ref={scannerRef}>
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

      <AnimatePresence>
        {topDetection && !scanning && (
          <motion.div
            className="object-mask-layer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className={`object-mask object-mask--${getMaskShape(topDetection.class)} ${objectBox ? '' : 'object-mask--fallback'}`}
              style={objectBox ? {
                left: objectBox.left,
                top: objectBox.top,
                width: objectBox.width,
                height: objectBox.height,
              } : undefined}
              layout
            >
              <div className="object-mask-fill" />
              <WireframeMask shape={getMaskShape(topDetection.class)} />
              <span className="object-mask-chip">Masked scan</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {cameraError && !topDetection && (
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

      {/* ── Scan Guide ── */}
      <AnimatePresence>
        {!topDetection && (
          <motion.div
            className="scan-guide"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
          >
            <p className="scan-hint">
              {loading
                ? 'Loading AI model...'
                : cameraError
                  ? 'Select an item from the demo panel below.'
                  : 'Point the camera at a recyclable item'}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/*
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
      */}

      {/* ── 3D Preview Panel (shows while scanning detects an item) ── */}
      <AnimatePresence>
        {topDetection && !scanning && ideasForDetection?.ideas?.length > 0 && (
          <motion.div
            className="scan-recommendations"
            initial={{ y: 28, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 28, opacity: 0, scale: 0.96 }}
            transition={{ type: 'spring', damping: 22, stiffness: 220 }}
          >
            <div className="scan-recommendations-header">
              <span className="scan-recommendations-icon">{getClassIcon(topDetection.class)}</span>
              <div>
                <p className="scan-recommendations-title">Possible recyclable ideas</p>
                <p className="scan-recommendations-sub">{ideasForDetection.label}</p>
              </div>
            </div>
            <div className="scan-recommendation-list">
              {ideasForDetection.ideas.map((idea, idx) => (
                <motion.button
                  key={idea.id}
                  className={`scan-recommendation-btn ${
                    selectedIdeaChoice?.className === topDetection.class && selectedIdeaChoice.index === idx ? 'active' : ''
                  }`}
                  id={`btn-scan-recommendation-${idea.id}`}
                  onClick={() => setSelectedIdeaChoice({ className: topDetection.class, index: idx })}
                  whileTap={{ scale: 0.97 }}
                >
                  <span className="recommendation-dot" />
                  <span>{idea.title}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {selectedIdea && !scanning && (
          <motion.div
            key={selectedIdea.id}
            className={`scan-3d-preview ${objectBox ? '' : 'scan-3d-preview--fallback'}`}
            style={modelPreviewStyle}
            initial={{ opacity: 0, scale: 0.7, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.7, y: 20 }}
            transition={{ type: 'spring', damping: 20, stiffness: 260 }}
          >
            <div className="scan-3d-environment-shadow" />
            <Canvas
              camera={{ position: [0, 1.1, 4.4], fov: 42 }}
              gl={{ antialias: true, alpha: true }}
              style={{ background: 'transparent', width: '100%', height: '100%' }}
              shadows
            >
              <RecommendationScene ModelComponent={SelectedModel} modelZoom={modelZoom} />
            </Canvas>
            <div className="scan-3d-zoom-controls" aria-label="3D zoom controls">
              <button
                type="button"
                className="scan-3d-zoom-btn"
                onClick={() => setModelZoom(z => clamp(z + 0.18, 0.8, 2.3))}
                aria-label="Zoom 3D model in"
              >
                <ZoomIn size={17} />
              </button>
              <button
                type="button"
                className="scan-3d-zoom-btn"
                onClick={() => setModelZoom(z => clamp(z - 0.18, 0.8, 2.3))}
                aria-label="Zoom 3D model out"
              >
                <ZoomOut size={17} />
              </button>
            </div>
            <div className="scan-3d-label">
              <span className="scan-3d-tag">3D model</span>
              <strong className="scan-3d-title">{selectedIdea.title}</strong>
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
