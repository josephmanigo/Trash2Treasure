import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// ──────────────────────────────────────────────────────
//  BOTTLE idea b2 → Bird Feeder
// ──────────────────────────────────────────────────────
export function BirdFeederModel() {
  const g = useRef();
  useFrame(({ clock }) => {
    if (g.current) {
      g.current.rotation.y = clock.elapsedTime * 0.3;
      g.current.position.y = Math.sin(clock.elapsedTime * 0.8) * 0.06;
    }
  });
  return (
    <group ref={g} position={[0, 0.1, 0]}>
      {/* Hanging string */}
      <mesh position={[0, 1.5, 0]}>
        <cylinderGeometry args={[0.015, 0.015, 0.8, 6]} />
        <meshStandardMaterial color="#92400E" roughness={0.9} />
      </mesh>
      {/* Bottle body (transparent green) */}
      <mesh position={[0, 0.6, 0]}>
        <cylinderGeometry args={[0.28, 0.22, 1.1, 16]} />
        <meshStandardMaterial color="#86efac" roughness={0.2} metalness={0.1} transparent opacity={0.72} />
      </mesh>
      {/* Neck */}
      <mesh position={[0, 0.02, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 0.25, 12]} />
        <meshStandardMaterial color="#4ade80" roughness={0.2} transparent opacity={0.8} />
      </mesh>
      {/* Cap */}
      <mesh position={[0, -0.1, 0]}>
        <cylinderGeometry args={[0.12, 0.12, 0.06, 12]} />
        <meshStandardMaterial color="#f59e0b" roughness={0.4} />
      </mesh>
      {/* Perch sticks */}
      {[0, 90].map((deg, i) => (
        <mesh key={i} position={[0, -0.05, 0]} rotation={[0, (deg * Math.PI) / 180, Math.PI / 2]}>
          <cylinderGeometry args={[0.025, 0.025, 0.9, 8]} />
          <meshStandardMaterial color="#92400E" roughness={0.8} />
        </mesh>
      ))}
      {/* Seeds */}
      {[0, 60, 120, 180, 240, 300].map((deg, i) => {
        const r = (deg * Math.PI) / 180;
        return (
          <mesh key={i} position={[Math.sin(r) * 0.18, -0.17, Math.cos(r) * 0.18]}>
            <sphereGeometry args={[0.04, 6, 6]} />
            <meshStandardMaterial color="#D97706" roughness={1} />
          </mesh>
        );
      })}
      {/* Two birds */}
      {[[-0.55, 0], [0.55, 0]].map(([x, _], i) => (
        <group key={i} position={[x, -0.04, 0]}>
          <mesh>
            <sphereGeometry args={[0.1, 8, 8]} />
            <meshStandardMaterial color={i === 0 ? '#f472b6' : '#60a5fa'} roughness={0.5} />
          </mesh>
          <mesh position={[i === 0 ? 0.1 : -0.1, 0.03, 0]} rotation={[0, 0, Math.PI / 2]}>
            <coneGeometry args={[0.04, 0.1, 6]} />
            <meshStandardMaterial color="#f59e0b" />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// ──────────────────────────────────────────────────────
//  BOTTLE idea b3 → Vertical Garden Tower
// ──────────────────────────────────────────────────────
export function VerticalGardenModel() {
  const g = useRef();
  useFrame(({ clock }) => {
    if (g.current) g.current.rotation.y = clock.elapsedTime * 0.25;
  });
  const tiers = [
    { y: -1.0, color: '#60a5fa', plant: '#22c55e' },
    { y: -0.3, color: '#4ade80', plant: '#16a34a' },
    { y:  0.4, color: '#a78bfa', plant: '#4ade80' },
    { y:  1.1, color: '#f59e0b', plant: '#84cc16' },
  ];
  return (
    <group ref={g}>
      {/* Central pole */}
      <mesh>
        <cylinderGeometry args={[0.06, 0.06, 2.8, 10]} />
        <meshStandardMaterial color="#374151" roughness={0.4} metalness={0.5} />
      </mesh>
      {tiers.map(({ y, color, plant }, i) => (
        <group key={i} position={[0, y, 0]} rotation={[0, i * 0.8, 0]}>
          {/* Bottle pot */}
          <mesh position={[0.38, 0, 0]} rotation={[0, 0, Math.PI * 0.08]}>
            <cylinderGeometry args={[0.24, 0.2, 0.55, 14]} />
            <meshStandardMaterial color={color} roughness={0.25} transparent opacity={0.7} />
          </mesh>
          {/* Soil */}
          <mesh position={[0.38, 0.12, 0]}>
            <sphereGeometry args={[0.2, 10, 8]} />
            <meshStandardMaterial color="#3A2310" roughness={1} />
          </mesh>
          {/* Plant leaves */}
          {[0, 90, 180].map((deg, j) => {
            const pr = (deg * Math.PI) / 180;
            return (
              <mesh key={j}
                position={[0.38 + Math.sin(pr) * 0.14, 0.32, Math.cos(pr) * 0.14]}
                rotation={[0.4, pr, 0]}>
                <sphereGeometry args={[0.14, 8, 6]} />
                <meshStandardMaterial color={plant} roughness={0.6} />
              </mesh>
            );
          })}
          {/* Zip tie */}
          <mesh position={[0.14, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <torusGeometry args={[0.12, 0.015, 6, 16]} />
            <meshStandardMaterial color="#6B7280" roughness={0.3} metalness={0.5} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// ──────────────────────────────────────────────────────
//  CUP idea c2 → Seedling Starter Kit
// ──────────────────────────────────────────────────────
export function SeedlingModel() {
  const g = useRef();
  useFrame(({ clock }) => {
    if (g.current) g.current.rotation.y = clock.elapsedTime * 0.28;
  });
  const cups = [
    { x: -0.55, z:  0.0, seedling: '#22c55e', stage: 3 },
    { x:  0.0,  z:  0.0, seedling: '#4ade80', stage: 2 },
    { x:  0.55, z:  0.0, seedling: '#86efac', stage: 1 },
    { x: -0.28, z: -0.5, seedling: '#a3e635', stage: 2 },
    { x:  0.28, z: -0.5, seedling: '#16a34a', stage: 3 },
  ];
  const h = 0.95;
  const cupColors = ['#60a5fa', '#f59e0b', '#f472b6', '#a78bfa', '#4ade80'];
  return (
    <group ref={g} position={[0, -0.3, 0.2]}>
      {/* Tray */}
      <mesh position={[0, -0.05, -0.05]}>
        <boxGeometry args={[1.4, 0.06, 0.8]} />
        <meshStandardMaterial color="#374151" roughness={0.4} metalness={0.2} />
      </mesh>
      {cups.map(({ x, z, seedling, stage }, i) => (
        <group key={i} position={[x, 0, z]}>
          {/* Cup shell */}
          <mesh position={[0, h / 2, 0]}>
            <cylinderGeometry args={[0.2, 0.16, h, 12, 1, true]} />
            <meshStandardMaterial color={cupColors[i]} roughness={0.3} side={THREE.DoubleSide} />
          </mesh>
          {/* Cup bottom */}
          <mesh>
            <circleGeometry args={[0.16, 12]} />
            <meshStandardMaterial color="#4B5563" />
          </mesh>
          {/* Soil */}
          <mesh position={[0, h - 0.06, 0]}>
            <cylinderGeometry args={[0.18, 0.18, 0.08, 12]} />
            <meshStandardMaterial color="#3A2310" roughness={1} />
          </mesh>
          {/* Stem */}
          <mesh position={[0, h + 0.08 * stage, 0]}>
            <cylinderGeometry args={[0.02, 0.02, 0.18 * stage, 6]} />
            <meshStandardMaterial color="#2E7D32" roughness={0.7} />
          </mesh>
          {stage >= 2 && (
            <mesh position={[0.1, h + 0.18 * stage, 0]} rotation={[0, 0, 0.4]}>
              <sphereGeometry args={[0.1, 8, 6]} />
              <meshStandardMaterial color={seedling} roughness={0.6} />
            </mesh>
          )}
          {stage >= 3 && (
            <mesh position={[-0.1, h + 0.22 * stage, 0]} rotation={[0, 0, -0.4]}>
              <sphereGeometry args={[0.12, 8, 6]} />
              <meshStandardMaterial color={seedling} roughness={0.6} />
            </mesh>
          )}
        </group>
      ))}
    </group>
  );
}

// ──────────────────────────────────────────────────────
//  PAPER idea bk1 → Paper Bead Necklace
// ──────────────────────────────────────────────────────
export function PaperBeadModel() {
  const g = useRef();
  useFrame(({ clock }) => {
    if (g.current) {
      g.current.rotation.y = clock.elapsedTime * 0.4;
      g.current.rotation.z = Math.sin(clock.elapsedTime * 0.5) * 0.08;
    }
  });
  const beadColors = [
    '#f87171','#fb923c','#fbbf24','#4ade80','#60a5fa','#a78bfa',
    '#f472b6','#34d399','#facc15','#f87171','#60a5fa','#4ade80',
  ];
  return (
    <group ref={g}>
      {/* String */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.9, 0.012, 6, 48]} />
        <meshStandardMaterial color="#92400E" roughness={0.9} />
      </mesh>
      {/* Beads */}
      {beadColors.map((color, i) => {
        const angle = (i / beadColors.length) * Math.PI * 2;
        return (
          <mesh key={i}
            position={[Math.sin(angle) * 0.9, 0, Math.cos(angle) * 0.9]}
            rotation={[0, angle, Math.PI / 2]}>
            <cylinderGeometry args={[0.085, 0.085, 0.16, 10]} />
            <meshStandardMaterial color={color} roughness={0.35} metalness={0.05} />
          </mesh>
        );
      })}
      {/* Pendant */}
      <mesh position={[0, -0.9, 0]}>
        <coneGeometry args={[0.12, 0.32, 8]} />
        <meshStandardMaterial color="#fbbf24" roughness={0.2} metalness={0.3} />
      </mesh>
      <mesh position={[0, -0.72, 0]}>
        <sphereGeometry args={[0.1, 10, 10]} />
        <meshStandardMaterial color="#f59e0b" roughness={0.15} metalness={0.4} />
      </mesh>
    </group>
  );
}

// ──────────────────────────────────────────────────────
//  METAL idea tc1 → Pencil Holder (tin can)
// ──────────────────────────────────────────────────────
export function PencilHolderModel() {
  const g = useRef();
  useFrame(({ clock }) => {
    if (g.current) g.current.rotation.y = clock.elapsedTime * 0.35;
  });
  const pencils = [
    { a: 0,   color: '#f87171' },
    { a: 72,  color: '#fbbf24' },
    { a: 144, color: '#4ade80' },
    { a: 216, color: '#60a5fa' },
    { a: 288, color: '#a78bfa' },
  ];
  return (
    <group ref={g} position={[0, -0.2, 0]}>
      {/* Can body */}
      <mesh position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.48, 0.46, 0.85, 20, 1, true]} />
        <meshStandardMaterial color="#9CA3AF" metalness={0.85} roughness={0.12} side={THREE.DoubleSide} />
      </mesh>
      {/* Can bottom */}
      <mesh position={[0, -0.125, 0]}>
        <circleGeometry args={[0.46, 20]} />
        <meshStandardMaterial color="#6B7280" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Top rim */}
      <mesh position={[0, 0.735, 0]}>
        <torusGeometry args={[0.47, 0.025, 8, 24]} />
        <meshStandardMaterial color="#6B7280" metalness={0.8} roughness={0.15} />
      </mesh>
      {/* Twine wraps */}
      {[0.05, 0.22, 0.39, 0.56].map((y, i) => (
        <mesh key={i} position={[0, y, 0]}>
          <torusGeometry args={[0.495, 0.025, 6, 28]} />
          <meshStandardMaterial color="#D97706" roughness={0.9} />
        </mesh>
      ))}
      {/* Pencils */}
      {pencils.map(({ a, color }, i) => {
        const rad = (a * Math.PI) / 180;
        const lean = i % 2 === 0 ? 0.08 : -0.06;
        return (
          <group key={i}
            position={[Math.sin(rad) * 0.22, 1.0, Math.cos(rad) * 0.22]}
            rotation={[lean, rad, 0]}>
            <mesh>
              <cylinderGeometry args={[0.04, 0.04, 0.85, 6]} />
              <meshStandardMaterial color={color} roughness={0.3} />
            </mesh>
            <mesh position={[0, -0.48, 0]}>
              <coneGeometry args={[0.04, 0.12, 6]} />
              <meshStandardMaterial color="#F5DEB3" roughness={0.8} />
            </mesh>
            <mesh position={[0, -0.56, 0]}>
              <coneGeometry args={[0.015, 0.06, 6]} />
              <meshStandardMaterial color="#1F2937" roughness={0.4} />
            </mesh>
            <mesh position={[0, 0.45, 0]}>
              <cylinderGeometry args={[0.04, 0.04, 0.08, 6]} />
              <meshStandardMaterial color="#FDA4AF" roughness={0.6} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

// ──────────────────────────────────────────────────────
//  DEFAULT idea d1 → Compost Bin
// ──────────────────────────────────────────────────────
export function CompostBinModel() {
  const g = useRef();
  const steam1 = useRef();
  const steam2 = useRef();
  useFrame(({ clock }) => {
    if (g.current) g.current.rotation.y = clock.elapsedTime * 0.28;
    if (steam1.current) steam1.current.position.y = 1.1 + ((clock.elapsedTime * 0.6) % 0.5);
    if (steam2.current) steam2.current.position.y = 1.3 + ((clock.elapsedTime * 0.6 + 0.25) % 0.5);
  });
  return (
    <group ref={g} position={[0, -0.3, 0]}>
      {/* Body */}
      <mesh position={[0, 0.4, 0]}>
        <cylinderGeometry args={[0.7, 0.85, 1.3, 18]} />
        <meshStandardMaterial color="#1F2937" roughness={0.5} />
      </mesh>
      {/* Ventilation slats */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => {
        const r = (deg * Math.PI) / 180;
        return (
          <mesh key={i}
            position={[Math.sin(r) * 0.77, 0.4, Math.cos(r) * 0.77]}
            rotation={[0, -r, 0]}>
            <boxGeometry args={[0.04, 0.18, 0.12]} />
            <meshStandardMaterial color="#374151" roughness={0.5} />
          </mesh>
        );
      })}
      {/* Compost soil */}
      <mesh position={[0, 1.04, 0]}>
        <cylinderGeometry args={[0.68, 0.68, 0.06, 18]} />
        <meshStandardMaterial color="#3A2310" roughness={1} />
      </mesh>
      {/* Lid */}
      <mesh position={[0, 1.1, 0]}>
        <cylinderGeometry args={[0.74, 0.7, 0.12, 18]} />
        <meshStandardMaterial color="#374151" roughness={0.4} metalness={0.2} />
      </mesh>
      {/* Handle */}
      <mesh position={[0, 1.2, 0]}>
        <cylinderGeometry args={[0.07, 0.07, 0.12, 8]} />
        <meshStandardMaterial color="#4B5563" roughness={0.4} metalness={0.3} />
      </mesh>
      {/* Steam */}
      <mesh ref={steam1} position={[-0.15, 1.1, 0]}>
        <sphereGeometry args={[0.08, 6, 6]} />
        <meshStandardMaterial color="#E5E7EB" transparent opacity={0.4} roughness={1} />
      </mesh>
      <mesh ref={steam2} position={[0.18, 1.3, 0.1]}>
        <sphereGeometry args={[0.06, 6, 6]} />
        <meshStandardMaterial color="#E5E7EB" transparent opacity={0.3} roughness={1} />
      </mesh>
      {/* Leaves at base */}
      {[0, 60, 120, 180, 240, 300].map((deg, i) => {
        const r = (deg * Math.PI) / 180;
        return (
          <mesh key={i}
            position={[Math.sin(r) * 0.55, 0.0, Math.cos(r) * 0.55]}
            rotation={[Math.PI / 2, 0, r]}>
            <boxGeometry args={[0.22, 0.12, 0.02]} />
            <meshStandardMaterial color={['#22c55e','#4ade80','#16a34a'][i % 3]} roughness={0.8} />
          </mesh>
        );
      })}
    </group>
  );
}
