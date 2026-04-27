import { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Float } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Star, ChevronRight, RotateCcw, Maximize2, Share2, Package, CupSoda, BookOpen, Smartphone, Scissors, Shirt, Leaf, Droplets, Apple, Armchair, Heart, Plug, Sparkles as SparklesIcon } from 'lucide-react';
import { IDEA_MODEL_MAP, MODEL_MAP } from './ideaModelMap';
import * as THREE from 'three';
import './ARScreen.css';

export const RawModel = ({ detectedClass }) => {
  const cls = (detectedClass || '').toLowerCase();
  
  if (['bottle', 'wine glass', 'vase'].includes(cls)) {
    return (
      <group position={[0, -0.4, 0]}>
        <mesh position={[0, 0.4, 0]}>
          <cylinderGeometry args={[0.25, 0.25, 0.8, 24]} />
          <meshPhysicalMaterial color="#4ade80" transmission={0.9} opacity={1} transparent roughness={0.1} thickness={0.1} ior={1.5} />
        </mesh>
        <mesh position={[0, 0.85, 0]}>
          <cylinderGeometry args={[0.08, 0.25, 0.15, 24]} />
          <meshPhysicalMaterial color="#4ade80" transmission={0.9} opacity={1} transparent roughness={0.1} />
        </mesh>
        <mesh position={[0, 1.0, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 0.15, 24]} />
          <meshPhysicalMaterial color="#4ade80" transmission={0.9} opacity={1} transparent roughness={0.1} />
        </mesh>
        <mesh position={[0, 1.1, 0]}>
          <cylinderGeometry args={[0.09, 0.09, 0.06, 24]} />
          <meshStandardMaterial color="#f87171" roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.35, 0]}>
          <cylinderGeometry args={[0.252, 0.252, 0.4, 24]} />
          <meshStandardMaterial color="#ffffff" roughness={0.8} />
        </mesh>
      </group>
    );
  }
  
  if (['cup', 'bowl'].includes(cls)) {
    return (
      <group position={[0, -0.2, 0]}>
        <mesh position={[0, 0.3, 0]}>
          <cylinderGeometry args={[0.28, 0.22, 0.6, 24]} />
          <meshStandardMaterial color="#f3f4f6" roughness={0.9} />
        </mesh>
        <mesh position={[0, 0.3, 0]}>
          <cylinderGeometry args={[0.285, 0.24, 0.25, 24]} />
          <meshStandardMaterial color="#d97706" roughness={0.9} />
        </mesh>
        <mesh position={[0, 0.62, 0]}>
          <cylinderGeometry args={[0.29, 0.29, 0.04, 24]} />
          <meshStandardMaterial color="#1f2937" roughness={0.4} />
        </mesh>
      </group>
    );
  }
  
  if (['book', 'cardboard', 'paper'].includes(cls)) {
    return (
      <group position={[0, -0.2, 0]}>
        <mesh position={[0, 0.3, 0]}>
          <boxGeometry args={[0.7, 0.6, 0.5]} />
          <meshStandardMaterial color="#d4a574" roughness={0.9} />
        </mesh>
        <mesh position={[0, 0.605, 0]}>
          <boxGeometry args={[0.02, 0.01, 0.5]} />
          <meshStandardMaterial color="#92400e" roughness={0.9} />
        </mesh>
        <mesh position={[0, 0.61, 0]}>
          <boxGeometry args={[0.1, 0.01, 0.52]} />
          <meshStandardMaterial color="#fcd34d" transparent opacity={0.6} roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.3, 0.255]}>
          <boxGeometry args={[0.1, 0.2, 0.01]} />
          <meshStandardMaterial color="#fcd34d" transparent opacity={0.6} roughness={0.4} />
        </mesh>
      </group>
    );
  }

  if (['scissors', 'knife', 'fork', 'spoon', 'toothbrush', 'can', 'tin', 'metal'].includes(cls) || cls.includes('can')) {
    return (
      <group position={[0, -0.2, 0]}>
        <mesh position={[0, 0.35, 0]}>
          <cylinderGeometry args={[0.22, 0.22, 0.7, 32]} />
          <meshStandardMaterial color="#ef4444" metalness={0.6} roughness={0.2} />
        </mesh>
        <mesh position={[0, 0.7, 0]}>
          <cylinderGeometry args={[0.22, 0.22, 0.02, 32]} />
          <meshStandardMaterial color="#d1d5db" metalness={0.8} roughness={0.2} />
        </mesh>
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.22, 0.22, 0.02, 32]} />
          <meshStandardMaterial color="#d1d5db" metalness={0.8} roughness={0.2} />
        </mesh>
        <mesh position={[0, 0.71, 0.08]} rotation={[0.1, 0, 0]}>
          <boxGeometry args={[0.06, 0.01, 0.1]} />
          <meshStandardMaterial color="#9ca3af" metalness={0.8} roughness={0.2} />
        </mesh>
      </group>
    );
  }

  if (['cell phone', 'laptop', 'keyboard', 'mouse', 'remote', 'tv', 'clock', 'hair drier'].includes(cls)) {
    return (
      <group position={[0, -0.2, 0]} rotation={[0.4, 0, 0]}>
        <mesh position={[0, 0.4, 0]}>
          <boxGeometry args={[0.4, 0.8, 0.04]} />
          <meshStandardMaterial color="#1f2937" metalness={0.8} roughness={0.2} />
        </mesh>
        <mesh position={[0, 0.4, 0.021]}>
          <boxGeometry args={[0.36, 0.74, 0.01]} />
          <meshStandardMaterial color="#000000" metalness={0.9} roughness={0.1} />
        </mesh>
        <mesh position={[-0.1, 0.7, -0.021]}>
          <boxGeometry args={[0.12, 0.12, 0.01]} />
          <meshStandardMaterial color="#111827" />
        </mesh>
        <mesh position={[-0.1, 0.72, -0.025]}><circleGeometry args={[0.02, 16]} /><meshStandardMaterial color="#374151" /></mesh>
        <mesh position={[-0.1, 0.68, -0.025]}><circleGeometry args={[0.02, 16]} /><meshStandardMaterial color="#374151" /></mesh>
      </group>
    );
  }

  if (['banana', 'apple', 'orange', 'broccoli', 'carrot', 'sandwich', 'hot dog', 'pizza', 'donut', 'cake', 'potted plant'].includes(cls)) {
    return (
      <group position={[0, -0.1, 0]}>
        <mesh position={[-0.15, 0.15, 0]}>
          <sphereGeometry args={[0.15, 24, 24]} />
          <meshStandardMaterial color="#ef4444" roughness={0.4} />
        </mesh>
        <mesh position={[-0.15, 0.32, 0]} rotation={[0, 0, 0.2]}>
          <cylinderGeometry args={[0.01, 0.01, 0.08, 6]} />
          <meshStandardMaterial color="#4ade80" />
        </mesh>
        <mesh position={[0.15, 0.1, 0]} rotation={[0, 0, 0.8]}>
          <capsuleGeometry args={[0.05, 0.25, 12, 12]} />
          <meshStandardMaterial color="#facc15" roughness={0.6} />
        </mesh>
      </group>
    );
  }

  if (['person', 'backpack', 'handbag', 'suitcase', 'umbrella', 'tie'].includes(cls)) {
    return (
      <group position={[0, -0.2, 0]}>
        <mesh position={[0, 0.05, 0]}>
          <boxGeometry args={[0.6, 0.1, 0.5]} />
          <meshStandardMaterial color="#3b82f6" roughness={0.9} />
        </mesh>
        <mesh position={[0, 0.12, 0]}>
          <boxGeometry args={[0.55, 0.06, 0.45]} />
          <meshStandardMaterial color="#60a5fa" roughness={0.9} />
        </mesh>
      </group>
    );
  }

  if (['teddy bear', 'frisbee', 'sports ball', 'kite', 'baseball bat', 'baseball glove', 'skateboard', 'surfboard', 'tennis racket'].includes(cls)) {
    return (
      <group position={[0, -0.2, 0]}>
        <mesh position={[0, 0.2, 0]}>
          <sphereGeometry args={[0.2, 24, 24]} />
          <meshStandardMaterial color="#f97316" roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.2, 0]}>
          <torusGeometry args={[0.2, 0.01, 16, 32]} />
          <meshStandardMaterial color="#111827" />
        </mesh>
        <mesh position={[0, 0.2, 0]} rotation={[Math.PI/2, 0, 0]}>
          <torusGeometry args={[0.2, 0.01, 16, 32]} />
          <meshStandardMaterial color="#111827" />
        </mesh>
      </group>
    );
  }
  
  if (['chair', 'couch', 'bed', 'dining table', 'bench', 'furniture'].includes(cls)) {
    return (
      <group position={[0, -0.4, 0]}>
        <mesh position={[0, 0.5, 0]}>
          <cylinderGeometry args={[0.35, 0.35, 0.06, 24]} />
          <meshStandardMaterial color="#b45309" roughness={0.8} />
        </mesh>
        {[0, 90, 180, 270].map(deg => {
          const rad = deg * Math.PI / 180;
          return (
            <mesh key={deg} position={[Math.sin(rad) * 0.25, 0.25, Math.cos(rad) * 0.25]} rotation={[-Math.cos(rad)*0.1, 0, Math.sin(rad)*0.1]}>
              <cylinderGeometry args={[0.03, 0.02, 0.5, 8]} />
              <meshStandardMaterial color="#92400e" roughness={0.8} />
            </mesh>
          );
        })}
      </group>
    );
  }

  // Default generic block
  return (
    <mesh position={[0, 0, 0]}>
      <dodecahedronGeometry args={[0.3, 0]} />
      <meshStandardMaterial color="#6b7280" roughness={0.7} />
    </mesh>
  );
};

// Particles for magical transformation
export const MagicalParticles = () => {
  const particlesRef = useRef();
  
  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.5;
    }
  });

  // We use simple boxes as particles to avoid depending on <Sparkles> if missing from older drei
  return (
    <group ref={particlesRef}>
      {Array.from({ length: 40 }).map((_, i) => {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(Math.random() * 2 - 1);
        const radius = 0.5 + Math.random() * 0.8;
        const x = radius * Math.sin(phi) * Math.cos(theta);
        const y = radius * Math.sin(phi) * Math.sin(theta);
        const z = radius * Math.cos(phi);
        return (
          <mesh key={i} position={[x, y, z]} rotation={[Math.random(), Math.random(), Math.random()]}>
            <octahedronGeometry args={[0.04, 0]} />
            <meshStandardMaterial color={['#4ade80', '#fbbf24', '#38bdf8', '#a78bfa'][i % 4]} emissive={['#22c55e', '#f59e0b', '#0284c7', '#7c3aed'][i % 4]} emissiveIntensity={2} />
          </mesh>
        );
      })}
    </group>
  );
};

import { useFrame } from '@react-three/fiber';
import { useRef, useEffect, useMemo } from 'react';

export function TransformationWrapper({ ModelComponent, detectedClass, onPhaseChange, webcamRef, bbox }) {
  const rawRef = useRef();
  const finalRef = useRef();
  const particlesRef = useRef();
  
  // Local state reference for animation to avoid re-renders
  const phaseRef = useRef('raw');

  useEffect(() => {
    onPhaseChange('Recognized Object');
    const t1 = setTimeout(() => { phaseRef.current = 'breakdown'; onPhaseChange('Breaking Down...'); }, 2500);
    const t2 = setTimeout(() => { phaseRef.current = 'reshape'; onPhaseChange('Reshaping...'); }, 4500);
    const t3 = setTimeout(() => { phaseRef.current = 'final'; onPhaseChange('Upcycled!'); }, 6500);
    
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [detectedClass, onPhaseChange]);

  useFrame((state, delta) => {
    if (!rawRef.current || !finalRef.current || !particlesRef.current) return;
    
    const p = phaseRef.current;
    
    if (p === 'raw') {
      rawRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), delta * 5);
      particlesRef.current.scale.lerp(new THREE.Vector3(0, 0, 0), delta * 5);
      finalRef.current.scale.lerp(new THREE.Vector3(0, 0, 0), delta * 5);
    } else if (p === 'breakdown') {
      rawRef.current.scale.lerp(new THREE.Vector3(0, 0, 0), delta * 3);
      rawRef.current.rotation.y += delta * 8;
      particlesRef.current.scale.lerp(new THREE.Vector3(1.2, 1.2, 1.2), delta * 4);
    } else if (p === 'reshape') {
      particlesRef.current.scale.lerp(new THREE.Vector3(0.3, 0.3, 0.3), delta * 2);
      particlesRef.current.rotation.y += delta * 6;
      finalRef.current.scale.lerp(new THREE.Vector3(0.5, 0.5, 0.5), delta * 1.5);
      finalRef.current.rotation.y -= delta * 4;
    } else if (p === 'final') {
      particlesRef.current.scale.lerp(new THREE.Vector3(0, 0, 0), delta * 5);
      finalRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), delta * 3);
      finalRef.current.rotation.y = THREE.MathUtils.lerp(finalRef.current.rotation.y, 0, delta * 2);
    }
  });

  return (
    <group>
      <group ref={rawRef} scale={0}>
        <RawModel detectedClass={detectedClass} />
      </group>
      <group ref={particlesRef} scale={0}>
        <MagicalParticles />
      </group>
      <group ref={finalRef} scale={0}>
        <ModelComponent />
      </group>
    </group>
  );
}

/* ── Light rig shared by all scenes ── */
function Scene({ ModelComponent, detectedClass, onPhaseChange }) {
  return (
    <>
      <ambientLight intensity={0.8} />
      <directionalLight position={[5, 8, 5]} intensity={1.5} castShadow />
      <directionalLight position={[-5, 5, -5]} intensity={0.5} />
      <Environment preset="city" />
      <OrbitControls enableZoom={true} enablePan={false} autoRotate={false} maxPolarAngle={Math.PI / 1.8} />
      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.4}>
        <TransformationWrapper ModelComponent={ModelComponent} detectedClass={detectedClass} onPhaseChange={onPhaseChange} />
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
  if (['cell phone', 'laptop', 'keyboard', 'mouse', 'remote', 'tv', 'clock', 'hair drier'].includes(l)) return <Smartphone size={16} />;
  if (['scissors', 'knife', 'fork', 'spoon', 'toothbrush'].includes(l)) return <Scissors size={16} />;
  if (['person', 'backpack', 'handbag', 'suitcase', 'umbrella', 'tie'].includes(l)) return <Shirt size={16} />;
  if (['vase'].includes(l)) return <Droplets size={16} />;
  if (['banana', 'apple', 'orange', 'broccoli', 'carrot', 'sandwich', 'hot dog', 'pizza', 'donut', 'cake', 'potted plant'].includes(l)) return <Apple size={16} />;
  if (['chair', 'couch', 'bed', 'dining table', 'bench'].includes(l)) return <Armchair size={16} />;
  if (['teddy bear', 'frisbee', 'sports ball', 'kite', 'baseball bat', 'baseball glove', 'skateboard', 'surfboard', 'tennis racket'].includes(l)) return <Heart size={16} />;
  if (['microwave', 'oven', 'toaster', 'refrigerator', 'sink'].includes(l)) return <Plug size={16} />;
  return <Leaf size={16} />;
};

const ARScreen = ({ detectionData, onBack, onViewSteps, onSave, isSaved }) => {
  const [activeIdea, setActiveIdea] = useState(0);
  const [transformationPhase, setTransformationPhase] = useState('Recognized Object');

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
              <Scene ModelComponent={ModelComponent} detectedClass={detectedClass} onPhaseChange={setTransformationPhase} />
            </Canvas>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Transformation Phase Indicator ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={transformationPhase}
          className="ar-phase-indicator"
          initial={{ opacity: 0, y: -20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          transition={{ type: 'spring', damping: 15 }}
        >
          <SparklesIcon size={18} className="text-yellow-400" />
          <span>{transformationPhase}</span>
        </motion.div>
      </AnimatePresence>

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
