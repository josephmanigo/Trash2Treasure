import { useState, useRef, useEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, ContactShadows } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Star, ChevronRight, RotateCcw, Maximize2, Share2, Package, CupSoda, BookOpen, Smartphone, Scissors, Shirt, Leaf, Droplets, Apple, Armchair, Heart, Plug } from 'lucide-react';
import { IDEA_MODEL_MAP, MODEL_MAP } from './ideaModelMap';
import * as THREE from 'three';
import './ARScreen.css';

export const RawModel = ({ detectedClass }) => {
  const cls = (detectedClass || '').toLowerCase();
  
  if (['bottle', 'wine glass', 'vase'].includes(cls)) {
    // Bottle: total height ~1.13 units, bottom at y=0
    return (
      <group position={[0, 0, 0]}>
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
    // Cup: height 0.6, bottom at y=0
    return (
      <group position={[0, 0, 0]}>
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
    // Book: height 0.6, bottom at y=0
    return (
      <group position={[0, 0, 0]}>
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
    // Can: height 0.7, bottom at y=0
    return (
      <group position={[0, 0, 0]}>
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
    // Phone standing: rotate slightly, base at y=0
    return (
      <group position={[0, 0, 0]} rotation={[0.4, 0, 0]}>
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
    // Fruit: sphere r=0.15, centre at y=0.15, base at y=0
    return (
      <group position={[0, 0, 0]}>
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
    // Bag: height 0.1, bottom at y=0
    return (
      <group position={[0, 0, 0]}>
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
    // Ball: r=0.2, centre at y=0.2, base at y=0
    return (
      <group position={[0, 0, 0]}>
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
    // Chair: legs at y=0, seat disc at y=0.5
    return (
      <group position={[0, 0, 0]}>
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

const seededRandom = (seed) => {
  const value = Math.sin(seed * 999.91) * 10000;
  return value - Math.floor(value);
};

// Particles for magical transformation
export const MagicalParticles = () => {
  const particlesRef = useRef();
  const particles = useMemo(() => (
    Array.from({ length: 40 }).map((_, i) => {
      const theta = seededRandom(i + 1) * Math.PI * 2;
      const phi = Math.acos(seededRandom(i + 101) * 2 - 1);
      const radius = 0.5 + seededRandom(i + 201) * 0.8;

      return {
        id: i,
        position: [
          radius * Math.sin(phi) * Math.cos(theta),
          radius * Math.sin(phi) * Math.sin(theta),
          radius * Math.cos(phi),
        ],
        rotation: [seededRandom(i + 301), seededRandom(i + 401), seededRandom(i + 501)],
      };
    })
  ), []);
  
  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.5;
    }
  });

  // We use simple boxes as particles to avoid depending on <Sparkles> if missing from older drei
  return (
    <group ref={particlesRef}>
      {particles.map(({ id, position, rotation }) => (
        <mesh key={id} position={position} rotation={rotation}>
          <octahedronGeometry args={[0.04, 0]} />
          <meshStandardMaterial color={['#4ade80', '#fbbf24', '#38bdf8', '#a78bfa'][id % 4]} emissive={['#22c55e', '#f59e0b', '#0284c7', '#7c3aed'][id % 4]} emissiveIntensity={2} />
        </mesh>
      ))}
    </group>
  );
};

export function TransformationWrapper({ ModelComponent, detectedClass, onPhaseChange }) {
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



function AnimatedArrow() {
  const arrowRef = useRef(null);
  const pulseRef = useRef(null);

  useFrame(({ clock }) => {
    const time = clock.elapsedTime;
    if (arrowRef.current) {
      arrowRef.current.position.x = Math.sin(time * 2.8) * 0.08;
      arrowRef.current.rotation.y = Math.sin(time * 1.6) * 0.08;
    }
    if (pulseRef.current) {
      const scale = 1 + Math.sin(time * 3.2) * 0.14;
      pulseRef.current.scale.set(scale, scale, scale);
    }
  });

  return (
    <group ref={arrowRef} position={[0, 0.05, 0]} rotation={[0, 0, -Math.PI / 2]}>
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

function Scene({ ResultModel, detectedClass, selected }) {
  return (
    <>
      {/* ── Realistic soft indoor lighting ── */}
      <ambientLight intensity={0.55} />
      <hemisphereLight args={['#ffffff', '#d8d0c4', 0.7]} />
      {/* Key light: upper-left, warm daylight, casts shadows */}
      <directionalLight
        position={[-3, 5, 4]}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={0.1}
        shadow-camera-far={20}
        shadow-camera-left={-5}
        shadow-camera-right={5}
        shadow-camera-top={5}
        shadow-camera-bottom={-5}
        shadow-bias={-0.002}
      />
      {/* Soft fill from the right */}
      <directionalLight position={[4, 3, -2]} intensity={0.32} color="#fff8f0" />

      <OrbitControls
        enableZoom
        enablePan={false}
        autoRotate={false}
        minDistance={2.5}
        maxDistance={7.0}
        maxPolarAngle={Math.PI / 2.1}
      />

      {/* ── Shadow-receiving ground plane at y=0 ── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.001, 0]} receiveShadow>
        <planeGeometry args={[12, 12]} />
        <shadowMaterial transparent opacity={0.28} />
      </mesh>

      {/* ── Models ── */}
      {!selected && (
        <group position={[0, 0, 0]} scale={1.05}>
          <ShadowedModel>
            <RawModel detectedClass={detectedClass} />
          </ShadowedModel>
        </group>
      )}
      {selected && (
        <>
          <group position={[-1.25, 0, 0]} scale={0.78}>
            <ShadowedModel>
              <RawModel detectedClass={detectedClass} />
            </ShadowedModel>
          </group>
          <AnimatedArrow />
          <group position={[1.25, 0, 0]} scale={0.78}>
            <ShadowedModel>
              <ResultModel />
            </ShadowedModel>
          </group>
        </>
      )}

      {/* ── Soft contact shadow blob directly under objects ── */}
      <ContactShadows
        position={[0, 0.002, 0]}
        opacity={0.42}
        scale={6}
        blur={2.2}
        far={2.0}
        color="#2a1a0a"
      />
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
  const [selectedIdeaIndex, setSelectedIdeaIndex] = useState(null);

  if (!detectionData) return null;
  const { detection, ideas, imageSrc } = detectionData;
  const selectedIdea = selectedIdeaIndex !== null ? ideas?.ideas?.[selectedIdeaIndex] : null;

  const detectedClass = detection?.class?.toLowerCase() || '';
  const ResultModel =
    IDEA_MODEL_MAP[selectedIdea?.id] ||
    MODEL_MAP[detectedClass] ||
    MODEL_MAP.default;

  const handleShare = async () => {
    const shareData = {
      title: 'Trash2Treasure Idea',
      text: `Check out this upcycling idea: ${selectedIdea?.title || ideas?.label || detection?.class}!`,
      url: window.location.href,
    };
    if (navigator.share) {
      try { await navigator.share(shareData); } catch { /* ignore */ }
    } else {
      alert("Sharing not supported on this browser.");
    }
  };

  return (
    <div className={`ar-screen ${imageSrc ? 'ar-screen--snapshot' : ''}`}>
      {imageSrc && (
        <div
          className="ar-environment-snapshot"
          style={{ backgroundImage: `url(${imageSrc})` }}
          aria-hidden="true"
        />
      )}
      {/* ── AR Canvas Viewport ── */}
      <div className="ar-canvas-wrapper">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${selectedIdea?.id || 'source'}-${detectedClass}`}
            style={{ width: '100%', height: '100%' }}
            initial={{ opacity: 0, scale: 0.88, rotateY: -15 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            exit={{ opacity: 0, scale: 1.08, rotateY: 15 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            <Canvas
              camera={{ position: [0, 1.4, 5.8], fov: 40 }}
              shadows
              gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
              dpr={[1, 2]}
              style={{ background: 'transparent' }}
              onCreated={({ gl }) => {
                gl.toneMapping = THREE.ACESFilmicToneMapping;
                gl.toneMappingExposure = 1.1;
                gl.shadowMap.enabled = true;
                gl.shadowMap.type = THREE.PCFSoftShadowMap;
                if (THREE.SRGBColorSpace) gl.outputColorSpace = THREE.SRGBColorSpace;
              }}
            >
              <Scene ResultModel={ResultModel} detectedClass={detectedClass} selected={Boolean(selectedIdea)} />
            </Canvas>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Transformation Phase Indicator ── */}
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

        <div className="ar-recommendation-head">
          <p className="ar-recommendation-title">Possible recyclable ideas</p>
          <p className="ar-recommendation-sub">{ideas?.label || detection?.class}</p>
        </div>

        {/* Idea Tabs */}
        {ideas?.ideas?.length > 1 && (
          <div className="ar-tabs-container">
            {ideas.ideas.map((tab, idx) => (
              <motion.button
                key={tab.id}
                className={`ar-tab ${selectedIdeaIndex === idx ? 'active' : ''}`}
                id={`btn-idea-tab-${idx}`}
                onClick={() => setSelectedIdeaIndex(idx)}
                whileTap={{ scale: 0.96 }}
              >
                {tab.title}
              </motion.button>
            ))}
          </div>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={selectedIdea?.id || 'recommendations'}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="ar-idea-content"
          >
            {selectedIdea ? (
              <>
                <div className="ar-idea-header">
                  <h1 className="ar-idea-title">{selectedIdea.title}</h1>
                  <div className="ar-idea-meta">
                    <span className={`badge badge-${selectedIdea.difficulty?.toLowerCase()}`}>
                      {selectedIdea.difficulty}
                    </span>
                    <span className="badge badge-muted">{selectedIdea.time}</span>
                    <span className="badge badge-green">Impact: {selectedIdea.impact}</span>
                  </div>
                </div>

                <p className="ar-idea-desc">{selectedIdea.description}</p>

                <div className="ar-idea-actions">
                  <motion.button
                    className="btn btn-primary"
                    style={{ flex: 1 }}
                    id="btn-view-steps"
                    onClick={() => onViewSteps({ idea: selectedIdea, imageSrc, objectData: { label: ideas?.label } })}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    View Steps <ChevronRight size={16} />
                  </motion.button>

                  <motion.button
                    className={`btn-icon ${isSaved(selectedIdea.id) ? 'saved' : ''}`}
                    id="btn-save-idea"
                    onClick={() => onSave(selectedIdea, { label: ideas?.label })}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.9 }}
                    aria-label="Save idea"
                  >
                    <Star size={18} fill={isSaved(selectedIdea.id) ? 'currentColor' : 'none'} />
                  </motion.button>
                </div>
              </>
            ) : (
              <div className="ar-idea-empty">
                <span className="ar-idea-empty-icon">{getClassIcon(detection?.class)}</span>
                <div>
                  <h1 className="ar-idea-title">Choose a recommendation</h1>
                  <p className="ar-idea-desc">The scanned object is placed on the table surface. Select an option to preview the upcycled 3D transformation.</p>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default ARScreen;
