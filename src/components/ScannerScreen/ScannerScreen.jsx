import { useRef, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows, Environment, Float, OrbitControls } from '@react-three/drei';
import Webcam from 'react-webcam';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import '@tensorflow/tfjs';
import * as THREE from 'three';
import { ArrowLeft, Zap, ZapOff, RefreshCw, Camera, Layers, Search, Package, CupSoda, BookOpen, Smartphone, Scissors, Shirt, Leaf, Droplets, Apple, Armchair, Heart, Plug } from 'lucide-react';
import { getIdeasForObject } from '../../data/recyclingIdeas';
import { RawModel } from '../ARScreen/ARScreen';
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

const DETECTION_MEMORY_MS = 1700;
const DETECTION_HOLD_MS = 900;
const MIN_DETECTION_SCORE = 0.38;

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

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

const getStableDetection = (history) => {
  const groups = history.reduce((acc, item) => {
    const entry = acc.get(item.class) || { class: item.class, total: 0, count: 0, best: item };
    entry.total += item.score;
    entry.count += 1;
    if (item.score > entry.best.score) entry.best = item;
    acc.set(item.class, entry);
    return acc;
  }, new Map());

  const ranked = Array.from(groups.values())
    .map((entry) => {
      const average = entry.total / entry.count;
      const stability = clamp(entry.count / 5, 0, 1);
      return {
        class: entry.class,
        bbox: entry.best.bbox,
        score: clamp((average * 0.72) + (entry.best.score * 0.16) + (stability * 0.12), 0, 0.99),
        count: entry.count,
      };
    })
    .sort((a, b) => b.score - a.score);

  const candidate = ranked[0];
  if (!candidate) return null;
  if (candidate.count < 2 && candidate.score < 0.78) return null;
  return candidate;
};

function ShadowedModel({ children }) {
  const groupRef = useRef(null);

  useEffect(() => {
    if (!groupRef.current) return;
    groupRef.current.traverse((node) => {
      if (node.isMesh) {
        node.castShadow = true;
        node.receiveShadow = true;
      }
    });
  }, [children]);

  return <group ref={groupRef}>{children}</group>;
}

function ScanTerrain() {
  const outerRingRef = useRef(null);
  const innerRingRef = useRef(null);
  const glowRef = useRef(null);

  useFrame(({ clock }) => {
    const time = clock.elapsedTime;
    if (outerRingRef.current) outerRingRef.current.rotation.z = time * 0.24;
    if (innerRingRef.current) innerRingRef.current.rotation.z = -time * 0.34;
    if (glowRef.current) {
      const pulse = 1 + Math.sin(time * 2.2) * 0.035;
      glowRef.current.scale.set(pulse, pulse, pulse);
    }
  });

  return (
    <group position={[0, -1.08, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <mesh receiveShadow>
        <circleGeometry args={[2.65, 96]} />
        <meshStandardMaterial color="#dff7e8" roughness={0.9} transparent opacity={0.18} side={THREE.DoubleSide} />
      </mesh>
      <mesh ref={glowRef}>
        <ringGeometry args={[0.62, 1.34, 128]} />
        <meshBasicMaterial color="#22c55e" transparent opacity={0.08} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <mesh ref={outerRingRef}>
        <torusGeometry args={[1.22, 0.014, 8, 128]} />
        <meshBasicMaterial color="#86efac" transparent opacity={0.68} />
      </mesh>
      <mesh ref={innerRingRef}>
        <torusGeometry args={[0.78, 0.009, 8, 96]} />
        <meshBasicMaterial color="#2dd4bf" transparent opacity={0.42} />
      </mesh>
    </group>
  );
}

function ScanArrow() {
  const arrowRef = useRef(null);
  const pulseRef = useRef(null);

  useFrame(({ clock }) => {
    const time = clock.elapsedTime;
    if (arrowRef.current) arrowRef.current.position.x = Math.sin(time * 2.8) * 0.08;
    if (pulseRef.current) {
      const pulse = 1 + Math.sin(time * 3.4) * 0.16;
      pulseRef.current.scale.set(pulse, pulse, pulse);
    }
  });

  return (
    <group ref={arrowRef} position={[0, 0.06, 0]} rotation={[0, 0, -Math.PI / 2]}>
      <mesh castShadow>
        <cylinderGeometry args={[0.055, 0.055, 0.9, 24]} />
        <meshStandardMaterial color="#22c55e" emissive="#16a34a" emissiveIntensity={0.45} roughness={0.22} metalness={0.25} />
      </mesh>
      <mesh position={[0, 0.58, 0]} castShadow>
        <coneGeometry args={[0.18, 0.34, 32]} />
        <meshStandardMaterial color="#bbf7d0" emissive="#22c55e" emissiveIntensity={0.8} roughness={0.18} metalness={0.2} />
      </mesh>
      <mesh ref={pulseRef} position={[0, 0.04, 0]}>
        <torusGeometry args={[0.34, 0.012, 8, 72]} />
        <meshBasicMaterial color="#86efac" transparent opacity={0.38} />
      </mesh>
    </group>
  );
}

function ScanARScene({ detectedClass, ResultModel, selected }) {
  return (
    <>
      <ambientLight intensity={0.95} />
      <hemisphereLight args={['#ffffff', '#10261d', 0.82]} />
      <directionalLight position={[4, 7, 5]} intensity={1.55} castShadow />
      <directionalLight position={[-4, 4, -3]} intensity={0.55} color="#86efac" />
      <spotLight position={[0, 5.2, 4.4]} angle={0.42} penumbra={0.8} intensity={1.35} color="#ffffff" castShadow />
      <pointLight position={[1.6, 1.2, 2.2]} intensity={0.75} color="#6ee7b7" distance={5} />
      <Environment preset="city" />
      <OrbitControls
        enableZoom
        enablePan={false}
        autoRotate={false}
        minDistance={3}
        maxDistance={8.2}
        maxPolarAngle={Math.PI / 1.75}
      />
      <ScanTerrain />
      {!selected && (
        <group position={[0, 0.18, 0]} scale={1.2}>
          <Float speed={1.15} rotationIntensity={0.08} floatIntensity={0.08}>
            <ShadowedModel>
              <RawModel detectedClass={detectedClass} />
            </ShadowedModel>
          </Float>
        </group>
      )}
      {selected && (
        <>
          <group position={[-1.18, 0.15, 0]} scale={0.82}>
            <Float speed={1.1} rotationIntensity={0.08} floatIntensity={0.08}>
              <ShadowedModel>
                <RawModel detectedClass={detectedClass} />
              </ShadowedModel>
            </Float>
          </group>
          <ScanArrow />
          <group position={[1.18, 0.15, 0]} scale={0.82}>
            <Float speed={1.1} rotationIntensity={0.08} floatIntensity={0.08}>
              <ShadowedModel>
                <ResultModel />
              </ShadowedModel>
            </Float>
          </group>
        </>
      )}
      <ContactShadows position={[0, -1.08, 0]} opacity={0.38} scale={6.2} blur={2.8} far={4.5} />
    </>
  );
}

const ScannerScreen = ({ onBack, onDetect }) => {
  const webcamRef = useRef(null);
  const animFrame = useRef(null);
  const detectionHistoryRef = useRef([]);
  const lastDetectionRef = useRef({ detection: null, seenAt: 0 });
  const lastDetectedClassRef = useRef(null);

  const [model, setModel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [flashOn, setFlashOn] = useState(false);
  const [facingMode, setFacingMode] = useState('environment');
  const [scanning, setScanning] = useState(false);
  const [statusMsg, setStatusMsg] = useState('Loading high-accuracy scanner...');
  const [topDetection, setTopDetection] = useState(null);
  const [showDemoPanel, setShowDemoPanel] = useState(false);
  const [highlightItem, setHighlightItem] = useState(null);
  const [cameraError, setCameraError] = useState(false);
  const [selectedIdeaChoice, setSelectedIdeaChoice] = useState(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        let loadedModel;
        try {
          loadedModel = await cocoSsd.load({ base: 'mobilenet_v2' });
        } catch {
          loadedModel = await cocoSsd.load({ base: 'lite_mobilenet_v2' });
        }
        if (mounted) {
          setModel(loadedModel);
          setLoading(false);
          setStatusMsg('Point camera at a recyclable item');
        }
      } catch {
        if (mounted) {
          setLoading(false);
          setStatusMsg('Demo mode - pick an item below');
          setShowDemoPanel(true);
        }
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  const updateDetection = useCallback((nextDetection) => {
    const nextClass = nextDetection?.class || null;
    if (lastDetectedClassRef.current !== nextClass) {
      lastDetectedClassRef.current = nextClass;
      setSelectedIdeaChoice(null);
    }
    setTopDetection(nextDetection);
    if (nextDetection) {
      setStatusMsg(`${nextDetection.class} - ${Math.round(nextDetection.score * 100)}% confident`);
    } else {
      setStatusMsg('Point camera at a recyclable item');
    }
  }, []);

  const detect = useCallback(async () => {
    if (!model || !webcamRef.current) return;
    const video = webcamRef.current.video;
    if (!video || video.readyState !== 4) return;

    try {
      const now = performance.now();
      const preds = await model.detect(video, 12, MIN_DETECTION_SCORE);
      const relevant = preds
        .filter(p => RECYCLABLE.includes(p.class) && p.score >= MIN_DETECTION_SCORE)
        .sort((a, b) => b.score - a.score)
        .slice(0, 3);

      detectionHistoryRef.current = detectionHistoryRef.current
        .filter(item => now - item.seenAt < DETECTION_MEMORY_MS)
        .concat(relevant.map(item => ({
          class: item.class,
          score: item.score,
          bbox: item.bbox,
          seenAt: now,
        })));

      const stableDetection = getStableDetection(detectionHistoryRef.current);
      if (stableDetection) {
        lastDetectionRef.current = { detection: stableDetection, seenAt: now };
        updateDetection(stableDetection);
        return;
      }

      const last = lastDetectionRef.current;
      if (last.detection && now - last.seenAt < DETECTION_HOLD_MS) {
        updateDetection(last.detection);
      } else if (relevant.length === 0) {
        updateDetection(null);
      }
    } catch {
      return;
    }
  }, [model, updateDetection]);

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

  const ideasForDetection = topDetection ? getIdeasForObject(topDetection.class) : null;
  const selectedIdea = selectedIdeaChoice?.className === topDetection?.class
    ? ideasForDetection?.ideas?.[selectedIdeaChoice.index]
    : null;
  const ResultModel =
    IDEA_MODEL_MAP[selectedIdea?.id] ||
    MODEL_MAP[topDetection?.class?.toLowerCase()] ||
    MODEL_MAP.default;

  const handleCapture = () => {
    setScanning(true);
    if (animFrame.current) cancelAnimationFrame(animFrame.current);
    const imageSrc = webcamRef.current?.getScreenshot();
    setTimeout(() => {
      const detection = topDetection || lastDetectionRef.current.detection || { class: 'bottle', score: 0.87 };
      const ideas = getIdeasForObject(detection.class);
      detectionHistoryRef.current = [];
      lastDetectionRef.current = { detection, seenAt: performance.now() };
      updateDetection(detection);
      setScanning(false);
      onDetect?.({
        detection: {
          ...detection,
          source: 'recognition-asset-match',
        },
        ideas,
        imageSrc,
        reconstruction: {
          method: 'class-recognition-asset-match',
          realisticLimit: 'Web AR cannot reconstruct every real object at 99% geometric accuracy without multi-view photogrammetry or a cloud 3D generation service.',
        },
      });
    }, 950);
  };

  const handleDemoPick = (item) => {
    setHighlightItem(item.class);
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      setHighlightItem(null);
      const detection = { class: item.class, score: item.score, bbox: null };
      detectionHistoryRef.current = [];
      lastDetectionRef.current = { detection, seenAt: performance.now() };
      updateDetection(detection);
      setShowDemoPanel(false);
    }, 700);
  };

  return (
    <div className="scanner-screen">
      <Webcam
        ref={webcamRef}
        className="scanner-webcam"
        videoConstraints={{
          facingMode,
          aspectRatio: 9 / 16,
          width: { ideal: 1280 },
          height: { ideal: 1920 },
        }}
        screenshotFormat="image/jpeg"
        screenshotQuality={0.92}
        mirrored={facingMode === 'user'}
        audio={false}
        onUserMediaError={() => {
          setCameraError(true);
          setShowDemoPanel(true);
          setStatusMsg('No camera - pick an item below');
        }}
      />

      <div className="scanner-overlay" />

      <AnimatePresence mode="wait">
        {topDetection && !scanning && (
          <motion.div
            key={`${topDetection.class}-${selectedIdea?.id || 'source'}`}
            className="scan-live-ar-preview"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
          >
            <Canvas
              camera={{ position: [0, 1.25, 5.6], fov: 42 }}
              shadows
              gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
              dpr={[1, 2]}
              style={{ background: 'transparent', width: '100%', height: '100%' }}
              onCreated={({ gl }) => {
                gl.toneMapping = THREE.ACESFilmicToneMapping;
                gl.toneMappingExposure = 1.16;
                gl.shadowMap.enabled = true;
                gl.shadowMap.type = THREE.PCFSoftShadowMap;
                if (THREE.SRGBColorSpace) gl.outputColorSpace = THREE.SRGBColorSpace;
              }}
            >
              <ScanARScene
                detectedClass={topDetection.class}
                ResultModel={ResultModel}
                selected={Boolean(selectedIdea)}
              />
            </Canvas>
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

      <AnimatePresence>
        {topDetection && !scanning && ideasForDetection?.ideas?.length > 0 && (
          <motion.div
            className="scan-recommendations"
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ type: 'spring', damping: 20, stiffness: 220 }}
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
                  type="button"
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
          disabled={scanning || loading}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.92 }}
        >
          <div className="capture-btn-inner"><Search size={28} /></div>
          {topDetection && <div className="capture-ring" />}
        </motion.button>

        <motion.button
          className={`scanner-icon-btn demo-toggle-btn ${showDemoPanel ? 'demo-active' : ''}`}
          id="btn-demo-toggle"
          onClick={() => setShowDemoPanel(s => !s)}
          whileTap={{ scale: 0.9 }}
          title="Demo mode - pick any item"
        >
          <Layers size={20} />
        </motion.button>
      </div>

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
              <p className="demo-panel-sub">Tap any item to test the 3D AR flow</p>
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
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ScannerScreen;
