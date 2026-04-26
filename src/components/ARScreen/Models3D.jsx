import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/* ─────────────────────────────────────────
   1. BOTTLE → Self-Watering Plant Pot
───────────────────────────────────────── */
export function PlantPotModel() {
  const g = useRef();
  useFrame(({ clock }) => { if (g.current) g.current.rotation.y = clock.elapsedTime * 0.4; });
  return (
    <group ref={g}>
      {/* Pot body */}
      <mesh position={[0, -0.3, 0]} castShadow>
        <cylinderGeometry args={[0.62, 0.46, 1.3, 20]} />
        <meshStandardMaterial color="#A0732A" roughness={0.6} metalness={0.05} />
      </mesh>
      {/* Inner shadow line */}
      <mesh position={[0, 0.34, 0]}>
        <cylinderGeometry args={[0.64, 0.64, 0.06, 20]} />
        <meshStandardMaterial color="#7A5520" roughness={0.8} />
      </mesh>
      {/* Rim torus */}
      <mesh position={[0, 0.38, 0]}>
        <torusGeometry args={[0.63, 0.075, 10, 36]} />
        <meshStandardMaterial color="#B8842E" roughness={0.4} metalness={0.1} />
      </mesh>
      {/* Soil disc */}
      <mesh position={[0, 0.36, 0]}>
        <cylinderGeometry args={[0.56, 0.56, 0.06, 20]} />
        <meshStandardMaterial color="#3A2310" roughness={1} />
      </mesh>
      {/* Stem */}
      <mesh position={[0, 0.95, 0]}>
        <cylinderGeometry args={[0.04, 0.05, 1.15, 8]} />
        <meshStandardMaterial color="#2E7D32" roughness={0.7} />
      </mesh>
      {/* Leaves */}
      {[0, 110, 220].map((deg, i) => {
        const rad = (deg * Math.PI) / 180;
        return (
          <group key={i} position={[Math.sin(rad) * 0.3, 1.05 + i * 0.22, Math.cos(rad) * 0.3]}
            rotation={[0.45, rad, 0.25]}>
            <mesh>
              <sphereGeometry args={[0.26, 10, 8]} />
              <meshStandardMaterial color={['#43A047', '#66BB6A', '#2E7D32'][i]} roughness={0.6} />
            </mesh>
          </group>
        );
      })}
      {/* Water reservoir (bottom) */}
      <mesh position={[0, -1.05, 0]}>
        <cylinderGeometry args={[0.42, 0.42, 0.28, 16]} />
        <meshStandardMaterial color="#1A6B9A" roughness={0.3} metalness={0.4} transparent opacity={0.8} />
      </mesh>
    </group>
  );
}

/* ─────────────────────────────────────────
   2. CUP → Desk Organizer
───────────────────────────────────────── */
export function OrganizerModel() {
  const g = useRef();
  useFrame(({ clock }) => { if (g.current) g.current.rotation.y = clock.elapsedTime * 0.3; });
  const cups = [
    { x: -0.58, h: 1.0, color: '#60a5fa' },
    { x: 0,     h: 1.3, color: '#4ade80' },
    { x: 0.58,  h: 0.85, color: '#f59e0b' },
  ];
  const pencilColors = ['#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff', '#ff9f43'];
  return (
    <group ref={g} position={[0, -0.2, 0]}>
      {/* Base plate */}
      <mesh position={[0, -0.05, 0]}>
        <boxGeometry args={[1.6, 0.1, 0.7]} />
        <meshStandardMaterial color="#374151" roughness={0.5} metalness={0.3} />
      </mesh>
      {cups.map(({ x, h, color }, i) => (
        <group key={i} position={[x, 0, 0]}>
          {/* Cup shell */}
          <mesh position={[0, h / 2, 0]}>
            <cylinderGeometry args={[0.27, 0.22, h, 16, 1, true]} />
            <meshStandardMaterial color={color} roughness={0.25} metalness={0.15} side={THREE.DoubleSide} />
          </mesh>
          {/* Cup bottom */}
          <mesh position={[0, 0, 0]}>
            <circleGeometry args={[0.22, 16]} />
            <meshStandardMaterial color={color} roughness={0.4} />
          </mesh>
          {/* Pencils */}
          {pencilColors.slice(0, 3 + i).map((pc, j) => {
            const a = (j / (3 + i)) * Math.PI * 2;
            return (
              <group key={j} position={[Math.sin(a) * 0.12, h + 0.28, Math.cos(a) * 0.12]}
                rotation={[Math.sin(j) * 0.12, 0, Math.cos(j) * 0.1]}>
                <mesh>
                  <cylinderGeometry args={[0.028, 0.028, 0.58, 6]} />
                  <meshStandardMaterial color={pc} />
                </mesh>
                {/* Tip */}
                <mesh position={[0, -0.32, 0]}>
                  <coneGeometry args={[0.028, 0.1, 6]} />
                  <meshStandardMaterial color="#F5DEB3" />
                </mesh>
              </group>
            );
          })}
        </group>
      ))}
    </group>
  );
}

/* ─────────────────────────────────────────
   3. BOOK / PAPER → Origami Box
───────────────────────────────────────── */
export function OrigamiBoxModel() {
  const g = useRef();
  const lid = useRef();
  useFrame(({ clock }) => {
    if (g.current) g.current.rotation.y = clock.elapsedTime * 0.35;
    if (lid.current) lid.current.position.y = 1.02 + Math.sin(clock.elapsedTime * 1.2) * 0.12;
  });
  const foldColors = ['#F87171', '#FB923C', '#FBBF24', '#34D399', '#60A5FA', '#A78BFA'];
  return (
    <group ref={g} position={[0, -0.2, 0]}>
      {/* Box body */}
      <mesh position={[0, 0.35, 0]}>
        <boxGeometry args={[1.1, 0.7, 1.1]} />
        <meshStandardMaterial color="#FDE68A" roughness={0.6} />
      </mesh>
      {/* Inside rim */}
      <mesh position={[0, 0.7, 0]}>
        <boxGeometry args={[1.05, 0.06, 1.05]} />
        <meshStandardMaterial color="#FCD34D" roughness={0.5} />
      </mesh>
      {/* Paper pattern lines */}
      {[-0.3, 0, 0.3].map((v, i) => (
        <mesh key={i} position={[v, 0.36, 0.551]}>
          <boxGeometry args={[0.02, 0.68, 0.02]} />
          <meshStandardMaterial color="#F59E0B" roughness={1} />
        </mesh>
      ))}
      {/* Folded paper strips inside */}
      {foldColors.map((c, i) => {
        const a = (i / foldColors.length) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.sin(a) * 0.28, 0.82, Math.cos(a) * 0.28]}
            rotation={[0, a, 0.3]}>
            <boxGeometry args={[0.18, 0.22, 0.04]} />
            <meshStandardMaterial color={c} roughness={0.4} />
          </mesh>
        );
      })}
      {/* Lid */}
      <group ref={lid} position={[0, 1.02, 0]}>
        <mesh>
          <boxGeometry args={[1.15, 0.18, 1.15]} />
          <meshStandardMaterial color="#FDE68A" roughness={0.5} />
        </mesh>
        {/* Lid crease */}
        <mesh position={[0, 0.09, 0]}>
          <boxGeometry args={[1.18, 0.03, 1.18]} />
          <meshStandardMaterial color="#FCD34D" />
        </mesh>
      </group>
    </group>
  );
}

/* ─────────────────────────────────────────
   4. ELECTRONICS → Circuit Board Planter
───────────────────────────────────────── */
export function CircuitBoardModel() {
  const g = useRef();
  useFrame(({ clock }) => {
    if (g.current) {
      g.current.rotation.y = clock.elapsedTime * 0.28;
      g.current.rotation.x = Math.sin(clock.elapsedTime * 0.6) * 0.08;
    }
  });
  const traces = [
    { x: -0.3, z: 0, w: 0.6, d: 0.04 },
    { x: 0.1,  z: 0.25, w: 0.04, d: 0.5 },
    { x: -0.1, z: -0.2, w: 0.04, d: 0.4 },
    { x: 0.3,  z: 0.1, w: 0.5, d: 0.04 },
  ];
  return (
    <group ref={g} position={[0, 0, 0]}>
      {/* PCB board */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[1.4, 0.08, 1.1]} />
        <meshStandardMaterial color="#166534" roughness={0.3} metalness={0.2} />
      </mesh>
      {/* Gold traces */}
      {traces.map((t, i) => (
        <mesh key={i} position={[t.x, 0.05, t.z]}>
          <boxGeometry args={[t.w, 0.02, t.d]} />
          <meshStandardMaterial color="#F59E0B" metalness={0.9} roughness={0.1} />
        </mesh>
      ))}
      {/* IC Chip */}
      <mesh position={[0, 0.09, 0]}>
        <boxGeometry args={[0.42, 0.1, 0.32]} />
        <meshStandardMaterial color="#111827" roughness={0.2} metalness={0.5} />
      </mesh>
      {/* Chip pins */}
      {[-0.12, 0, 0.12].map((z, i) => (
        <mesh key={`p${i}`} position={[0.23, 0.09, z]}>
          <boxGeometry args={[0.06, 0.04, 0.04]} />
          <meshStandardMaterial color="#9CA3AF" metalness={0.9} roughness={0.1} />
        </mesh>
      ))}
      {/* Capacitors (cylinders) */}
      {[[-0.45, 0.2], [0.4, -0.25], [-0.3, -0.3]].map(([x, z], i) => (
        <mesh key={`c${i}`} position={[x, 0.16, z]}>
          <cylinderGeometry args={[0.07, 0.07, 0.18, 10]} />
          <meshStandardMaterial color={['#1D4ED8', '#7C3AED', '#0369A1'][i]} roughness={0.3} metalness={0.4} />
        </mesh>
      ))}
      {/* E-waste bin body */}
      <mesh position={[0, -0.7, 0]}>
        <cylinderGeometry args={[0.5, 0.42, 0.9, 16]} />
        <meshStandardMaterial color="#374151" roughness={0.5} metalness={0.3} />
      </mesh>
      {/* Recycle arrows on bin */}
      {[0, 120, 240].map((deg, i) => {
        const r = (deg * Math.PI) / 180;
        return (
          <mesh key={`a${i}`} position={[Math.sin(r) * 0.51, -0.7, Math.cos(r) * 0.51]}
            rotation={[0, -r, 0]}>
            <boxGeometry args={[0.04, 0.25, 0.15]} />
            <meshStandardMaterial color="#4ade80" roughness={0.4} />
          </mesh>
        );
      })}
      {/* Bin lid */}
      <mesh position={[0, -0.17, 0]}>
        <cylinderGeometry args={[0.53, 0.5, 0.1, 16]} />
        <meshStandardMaterial color="#4B5563" roughness={0.4} metalness={0.4} />
      </mesh>
    </group>
  );
}

/* ─────────────────────────────────────────
   5. TIN CAN / METAL → Lantern
───────────────────────────────────────── */
export function TinLanternModel() {
  const g = useRef();
  const glow = useRef();
  useFrame(({ clock }) => {
    if (g.current) g.current.rotation.y = clock.elapsedTime * 0.35;
    if (glow.current) {
      const s = 0.85 + Math.sin(clock.elapsedTime * 3) * 0.15;
      glow.current.scale.set(s, s, s);
    }
  });
  // Star/dot pattern holes (simplified as small inset boxes on the surface)
  const holes = [];
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 6; col++) {
      holes.push({ y: -0.3 + row * 0.22, angle: col * 60 });
    }
  }
  return (
    <group ref={g} position={[0, 0, 0]}>
      {/* Can body shell */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.52, 0.52, 1.4, 24, 1, true]} />
        <meshStandardMaterial color="#9CA3AF" metalness={0.8} roughness={0.15} side={THREE.DoubleSide} />
      </mesh>
      {/* Top cap */}
      <mesh position={[0, 0.7, 0]}>
        <cylinderGeometry args={[0.52, 0.52, 0.05, 24]} />
        <meshStandardMaterial color="#6B7280" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Bottom cap */}
      <mesh position={[0, -0.7, 0]}>
        <cylinderGeometry args={[0.52, 0.52, 0.05, 24]} />
        <meshStandardMaterial color="#6B7280" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Light glow inside */}
      <group ref={glow}>
        <mesh position={[0, -0.15, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 0.18, 8]} />
          <meshStandardMaterial color="#FBBF24" emissive="#F59E0B" emissiveIntensity={3} />
        </mesh>
      </group>
      {/* Flame top */}
      <mesh position={[0, 0.08, 0]}>
        <coneGeometry args={[0.06, 0.22, 8]} />
        <meshStandardMaterial color="#FDE68A" emissive="#F97316" emissiveIntensity={2} transparent opacity={0.9} />
      </mesh>
      {/* Punched holes = small bright dots on the surface */}
      {holes.map(({ y, angle }, i) => {
        const rad = (angle * Math.PI) / 180;
        return (
          <mesh key={i} position={[Math.sin(rad) * 0.53, y, Math.cos(rad) * 0.53]}
            rotation={[0, -rad, 0]}>
            <circleGeometry args={[0.045, 6]} />
            <meshStandardMaterial color="#FEF3C7" emissive="#FBBF24" emissiveIntensity={2} />
          </mesh>
        );
      })}
      {/* Wire handle */}
      <mesh position={[0, 0.88, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.35, 0.025, 8, 24, Math.PI]} />
        <meshStandardMaterial color="#9CA3AF" metalness={0.9} roughness={0.1} />
      </mesh>
      {/* Point light inside for glow effect */}
      <pointLight position={[0, 0, 0]} intensity={1.5} color="#FCD34D" distance={2} />
    </group>
  );
}

/* ─────────────────────────────────────────
   6. FABRIC / CLOTHING → Tote Bag
───────────────────────────────────────── */
export function ToteBagModel() {
  const g = useRef();
  useFrame(({ clock }) => {
    if (g.current) {
      g.current.rotation.y = clock.elapsedTime * 0.32;
      g.current.rotation.z = Math.sin(clock.elapsedTime * 0.7) * 0.05;
    }
  });
  return (
    <group ref={g} position={[0, -0.1, 0]}>
      {/* Bag body front */}
      <mesh position={[0, 0, 0.03]}>
        <boxGeometry args={[1.0, 1.25, 0.06]} />
        <meshStandardMaterial color="#FDE68A" roughness={0.85} />
      </mesh>
      {/* Bag body back */}
      <mesh position={[0, 0, -0.03]}>
        <boxGeometry args={[1.0, 1.25, 0.06]} />
        <meshStandardMaterial color="#FDE68A" roughness={0.85} />
      </mesh>
      {/* Sides */}
      <mesh position={[0.5, 0, 0]}>
        <boxGeometry args={[0.06, 1.25, 0.15]} />
        <meshStandardMaterial color="#F59E0B" roughness={0.85} />
      </mesh>
      <mesh position={[-0.5, 0, 0]}>
        <boxGeometry args={[0.06, 1.25, 0.15]} />
        <meshStandardMaterial color="#F59E0B" roughness={0.85} />
      </mesh>
      {/* Bottom */}
      <mesh position={[0, -0.625, 0]}>
        <boxGeometry args={[1.0, 0.06, 0.15]} />
        <meshStandardMaterial color="#D97706" roughness={0.85} />
      </mesh>
      {/* Eco leaf print on front */}
      <mesh position={[0, 0.1, 0.065]}>
        <sphereGeometry args={[0.22, 8, 8]} />
        <meshStandardMaterial color="#4ade80" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.3, 0.065]}>
        <cylinderGeometry args={[0.03, 0.03, 0.32, 6]} />
        <meshStandardMaterial color="#16A34A" roughness={0.7} />
      </mesh>
      {/* Handles */}
      {[-0.28, 0.28].map((x, i) => (
        <group key={i}>
          {/* Vertical part */}
          <mesh position={[x, 0.95, 0]}>
            <cylinderGeometry args={[0.04, 0.04, 0.55, 8]} />
            <meshStandardMaterial color="#92400E" roughness={0.7} />
          </mesh>
          {/* Curve top */}
          <mesh position={[x, 1.24, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.28, 0.04, 8, 18, Math.PI]} />
            <meshStandardMaterial color="#92400E" roughness={0.7} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/* ─────────────────────────────────────────
   7. DEFAULT → Recycle Symbol
───────────────────────────────────────── */
export function RecycleSymbol() {
  const g = useRef();
  useFrame(({ clock }) => {
    if (g.current) {
      g.current.rotation.y = clock.elapsedTime * 0.5;
      g.current.rotation.z = Math.sin(clock.elapsedTime * 0.8) * 0.1;
    }
  });
  return (
    <group ref={g}>
      {/* Outer ring */}
      <mesh>
        <torusGeometry args={[0.85, 0.14, 12, 40]} />
        <meshStandardMaterial color="#4ade80" roughness={0.15} metalness={0.85} />
      </mesh>
      {/* Inner ring */}
      <mesh>
        <torusGeometry args={[0.5, 0.06, 10, 32]} />
        <meshStandardMaterial color="#22c55e" roughness={0.2} metalness={0.7} />
      </mesh>
      {/* Three arrow heads */}
      {[0, 120, 240].map((deg, i) => {
        const r = (deg * Math.PI) / 180;
        return (
          <group key={i} position={[Math.sin(r) * 0.68, Math.cos(r) * 0.68, 0]}
            rotation={[0, 0, r + Math.PI]}>
            <mesh>
              <coneGeometry args={[0.2, 0.38, 8]} />
              <meshStandardMaterial color="#16a34a" roughness={0.15} metalness={0.8} />
            </mesh>
          </group>
        );
      })}
      {/* Center dot */}
      <mesh>
        <sphereGeometry args={[0.18, 12, 12]} />
        <meshStandardMaterial color="#86efac" roughness={0.1} metalness={0.9} />
      </mesh>
    </group>
  );
}

/* ─────────────────────────────────────────
   MODEL MAP — maps detected class → component
───────────────────────────────────────── */
export const MODEL_MAP = {
  // Bottles / liquids
  bottle:      PlantPotModel,
  'wine glass': PlantPotModel,

  // Cups / bowls
  cup:         OrganizerModel,
  bowl:        OrganizerModel,

  // Books / paper
  book:        OrigamiBoxModel,

  // Electronics
  'cell phone': CircuitBoardModel,
  laptop:      CircuitBoardModel,
  keyboard:    CircuitBoardModel,
  mouse:       CircuitBoardModel,
  remote:      CircuitBoardModel,
  tv:          CircuitBoardModel,

  // Metal / tools
  scissors:    TinLanternModel,
  knife:       TinLanternModel,
  fork:        TinLanternModel,
  spoon:       TinLanternModel,

  // Fabric / clothing
  person:      ToteBagModel,
  backpack:    ToteBagModel,
  handbag:     ToteBagModel,
  suitcase:    ToteBagModel,

  // Default
  default:     RecycleSymbol,
};

