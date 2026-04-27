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
      <mesh>
        <torusGeometry args={[0.85, 0.14, 12, 40]} />
        <meshStandardMaterial color="#4ade80" roughness={0.15} metalness={0.85} />
      </mesh>
      <mesh>
        <torusGeometry args={[0.5, 0.06, 10, 32]} />
        <meshStandardMaterial color="#22c55e" roughness={0.2} metalness={0.7} />
      </mesh>
      {[0, 120, 240].map((deg, i) => {
        const r = (deg * Math.PI) / 180;
        return (
          <group key={i} position={[Math.sin(r) * 0.68, Math.cos(r) * 0.68, 0]} rotation={[0, 0, r + Math.PI]}>
            <mesh><coneGeometry args={[0.2, 0.38, 8]} /><meshStandardMaterial color="#16a34a" roughness={0.15} metalness={0.8} /></mesh>
          </group>
        );
      })}
      <mesh><sphereGeometry args={[0.18, 12, 12]} /><meshStandardMaterial color="#86efac" roughness={0.1} metalness={0.9} /></mesh>
    </group>
  );
}

/* ─────────────────────────────────────────
   8. GLASS → Terrarium
───────────────────────────────────────── */
export function GlassTerrariumModel() {
  const g = useRef();
  useFrame(({ clock }) => { if (g.current) g.current.rotation.y = clock.elapsedTime * 0.3; });
  return (
    <group ref={g} position={[0, -0.3, 0]}>
      {/* Glass jar */}
      <mesh><cylinderGeometry args={[0.6, 0.5, 1.6, 24, 1, true]} /><meshPhysicalMaterial color="#b0e0e6" roughness={0.05} metalness={0.1} transparent opacity={0.35} side={THREE.DoubleSide} /></mesh>
      {/* Glass bottom */}
      <mesh position={[0, -0.8, 0]}><cylinderGeometry args={[0.5, 0.5, 0.06, 24]} /><meshPhysicalMaterial color="#a8d8ea" roughness={0.1} transparent opacity={0.5} /></mesh>
      {/* Pebble layer */}
      <mesh position={[0, -0.55, 0]}><cylinderGeometry args={[0.48, 0.48, 0.25, 20]} /><meshStandardMaterial color="#d1d5db" roughness={0.9} /></mesh>
      {/* Charcoal layer */}
      <mesh position={[0, -0.38, 0]}><cylinderGeometry args={[0.47, 0.47, 0.1, 20]} /><meshStandardMaterial color="#1f2937" roughness={1} /></mesh>
      {/* Soil layer */}
      <mesh position={[0, -0.15, 0]}><cylinderGeometry args={[0.46, 0.46, 0.35, 20]} /><meshStandardMaterial color="#3A2310" roughness={1} /></mesh>
      {/* Moss carpet */}
      <mesh position={[0, 0.05, 0]}><cylinderGeometry args={[0.44, 0.44, 0.06, 20]} /><meshStandardMaterial color="#4ade80" roughness={0.8} /></mesh>
      {/* Small fern */}
      <mesh position={[0.1, 0.35, 0]}><cylinderGeometry args={[0.02, 0.025, 0.5, 6]} /><meshStandardMaterial color="#166534" roughness={0.7} /></mesh>
      {[-30, 40, 110, 200, 280].map((deg, i) => {
        const r = (deg * Math.PI) / 180;
        return (<mesh key={i} position={[0.1 + Math.sin(r) * 0.12, 0.45 + i * 0.06, Math.cos(r) * 0.12]} rotation={[0.4, r, 0.3]}>
          <sphereGeometry args={[0.12, 8, 6]} /><meshStandardMaterial color={['#22c55e', '#4ade80', '#16a34a', '#86efac', '#15803d'][i]} roughness={0.6} />
        </mesh>);
      })}
      {/* Second small plant */}
      <mesh position={[-0.15, 0.2, 0.1]}><cylinderGeometry args={[0.015, 0.02, 0.3, 6]} /><meshStandardMaterial color="#15803d" roughness={0.7} /></mesh>
      {[0, 120, 240].map((deg, i) => {
        const r = (deg * Math.PI) / 180;
        return (<mesh key={`l${i}`} position={[-0.15 + Math.sin(r) * 0.08, 0.38, 0.1 + Math.cos(r) * 0.08]} rotation={[0.3, r, 0]}>
          <sphereGeometry args={[0.08, 8, 6]} /><meshStandardMaterial color={['#84cc16', '#a3e635', '#65a30d'][i]} roughness={0.6} />
        </mesh>);
      })}
      {/* Decorative pebbles */}
      {[[-0.2, 0.08, -0.15], [0.25, 0.08, 0.1], [0, 0.08, 0.2]].map(([x, y, z], i) => (
        <mesh key={`p${i}`} position={[x, y, z]}><sphereGeometry args={[0.06, 8, 8]} /><meshStandardMaterial color={['#fbbf24', '#e5e7eb', '#a78bfa'][i]} roughness={0.6} metalness={0.1} /></mesh>
      ))}
      {/* Jar rim */}
      <mesh position={[0, 0.8, 0]}><torusGeometry args={[0.6, 0.04, 8, 24]} /><meshPhysicalMaterial color="#93c5fd" roughness={0.1} transparent opacity={0.6} /></mesh>
    </group>
  );
}

/* ─────────────────────────────────────────
   9. ORGANIC → Compost Tumbler
───────────────────────────────────────── */
export function OrganicCompostModel() {
  const g = useRef();
  const leaf1 = useRef();
  useFrame(({ clock }) => {
    if (g.current) g.current.rotation.y = clock.elapsedTime * 0.25;
    if (leaf1.current) leaf1.current.rotation.z = Math.sin(clock.elapsedTime * 2) * 0.15;
  });
  return (
    <group ref={g} position={[0, -0.2, 0]}>
      {/* Barrel body */}
      <mesh position={[0, 0.4, 0]}><cylinderGeometry args={[0.65, 0.65, 1.2, 20]} /><meshStandardMaterial color="#365314" roughness={0.5} /></mesh>
      {/* Barrel bands */}
      {[0.0, 0.4, 0.8].map((y, i) => (<mesh key={i} position={[0, y, 0]}><torusGeometry args={[0.66, 0.03, 8, 24]} /><meshStandardMaterial color="#854d0e" roughness={0.4} metalness={0.3} /></mesh>))}
      {/* Lid */}
      <mesh position={[0, 1.02, 0]}><cylinderGeometry args={[0.68, 0.65, 0.08, 20]} /><meshStandardMaterial color="#4d7c0f" roughness={0.4} /></mesh>
      {/* Handle */}
      <mesh position={[0, 1.12, 0]}><boxGeometry args={[0.3, 0.08, 0.08]} /><meshStandardMaterial color="#713f12" roughness={0.5} /></mesh>
      {/* Compost pile on top */}
      <mesh position={[0, 1.1, 0]}><sphereGeometry args={[0.35, 10, 8]} /><meshStandardMaterial color="#422006" roughness={1} /></mesh>
      {/* Food scraps */}
      <mesh position={[0.15, 1.25, 0.1]}><sphereGeometry args={[0.08, 8, 8]} /><meshStandardMaterial color="#f97316" roughness={0.6} /></mesh>
      <mesh position={[-0.1, 1.2, -0.05]}><sphereGeometry args={[0.06, 8, 8]} /><meshStandardMaterial color="#ef4444" roughness={0.6} /></mesh>
      <mesh position={[0.0, 1.28, 0.05]}><sphereGeometry args={[0.05, 8, 8]} /><meshStandardMaterial color="#eab308" roughness={0.6} /></mesh>
      {/* Leaves around base */}
      <group ref={leaf1}>
        {[0, 72, 144, 216, 288].map((deg, i) => {
          const r = (deg * Math.PI) / 180;
          return (<mesh key={i} position={[Math.sin(r) * 0.5, -0.1, Math.cos(r) * 0.5]} rotation={[Math.PI / 2, 0, r]}>
            <boxGeometry args={[0.2, 0.12, 0.02]} /><meshStandardMaterial color={['#22c55e', '#4ade80', '#16a34a', '#86efac', '#15803d'][i]} roughness={0.8} />
          </mesh>);
        })}
      </group>
      {/* Worms */}
      <mesh position={[0.2, 1.15, -0.1]} rotation={[0.5, 0.3, 0]}><cylinderGeometry args={[0.015, 0.01, 0.15, 6]} /><meshStandardMaterial color="#dc2626" roughness={0.8} /></mesh>
      {/* Stand legs */}
      {[[-0.4, 0], [0.4, 0], [0, -0.4], [0, 0.4]].map(([x, z], i) => (
        <mesh key={`leg${i}`} position={[x, -0.35, z]}><cylinderGeometry args={[0.04, 0.04, 0.5, 8]} /><meshStandardMaterial color="#374151" roughness={0.4} metalness={0.3} /></mesh>
      ))}
    </group>
  );
}

/* ─────────────────────────────────────────
   10. FURNITURE → Bookshelf
───────────────────────────────────────── */
export function FurnitureShelfModel() {
  const g = useRef();
  useFrame(({ clock }) => { if (g.current) g.current.rotation.y = clock.elapsedTime * 0.28; });
  const bookColors = ['#ef4444','#3b82f6','#eab308','#22c55e','#a855f7','#ec4899','#f97316','#06b6d4'];
  return (
    <group ref={g} position={[0, -0.3, 0]}>
      {/* Side panels */}
      <mesh position={[-0.65, 0.5, 0]}><boxGeometry args={[0.06, 1.8, 0.7]} /><meshStandardMaterial color="#92400e" roughness={0.7} /></mesh>
      <mesh position={[0.65, 0.5, 0]}><boxGeometry args={[0.06, 1.8, 0.7]} /><meshStandardMaterial color="#92400e" roughness={0.7} /></mesh>
      {/* Shelves */}
      {[-0.3, 0.3, 0.9, 1.4].map((y, i) => (<mesh key={i} position={[0, y, 0]}><boxGeometry args={[1.3, 0.06, 0.7]} /><meshStandardMaterial color="#b45309" roughness={0.6} /></mesh>))}
      {/* Back panel */}
      <mesh position={[0, 0.5, -0.33]}><boxGeometry args={[1.3, 1.8, 0.04]} /><meshStandardMaterial color="#78350f" roughness={0.8} /></mesh>
      {/* Books on shelf 1 */}
      {bookColors.slice(0, 5).map((c, i) => (<mesh key={`b1${i}`} position={[-0.4 + i * 0.18, 0.07, 0]}><boxGeometry args={[0.12, 0.5, 0.45]} /><meshStandardMaterial color={c} roughness={0.5} /></mesh>))}
      {/* Books on shelf 2 */}
      {bookColors.slice(3, 7).map((c, i) => (<mesh key={`b2${i}`} position={[-0.3 + i * 0.2, 0.65, 0.05]}><boxGeometry args={[0.14, 0.45, 0.4]} /><meshStandardMaterial color={c} roughness={0.5} /></mesh>))}
      {/* Small plant on top */}
      <mesh position={[0.3, 1.5, 0]}><cylinderGeometry args={[0.1, 0.08, 0.14, 10]} /><meshStandardMaterial color="#a0732a" roughness={0.7} /></mesh>
      <mesh position={[0.3, 1.62, 0]}><sphereGeometry args={[0.1, 8, 8]} /><meshStandardMaterial color="#4ade80" roughness={0.6} /></mesh>
    </group>
  );
}

/* ─────────────────────────────────────────
   11. TOY → Repaired Teddy Bear
───────────────────────────────────────── */
export function ToyRepairModel() {
  const g = useRef();
  useFrame(({ clock }) => {
    if (g.current) { g.current.rotation.y = clock.elapsedTime * 0.35; g.current.position.y = Math.sin(clock.elapsedTime) * 0.05; }
  });
  return (
    <group ref={g} position={[0, -0.2, 0]}>
      {/* Body */}
      <mesh position={[0, 0, 0]}><sphereGeometry args={[0.55, 14, 14]} /><meshStandardMaterial color="#d4a574" roughness={0.9} /></mesh>
      {/* Head */}
      <mesh position={[0, 0.75, 0]}><sphereGeometry args={[0.42, 14, 14]} /><meshStandardMaterial color="#d4a574" roughness={0.9} /></mesh>
      {/* Ears */}
      {[-0.3, 0.3].map((x, i) => (<group key={i}><mesh position={[x, 1.1, 0]}><sphereGeometry args={[0.15, 10, 10]} /><meshStandardMaterial color="#d4a574" roughness={0.9} /></mesh>
        <mesh position={[x, 1.1, 0.05]}><sphereGeometry args={[0.09, 8, 8]} /><meshStandardMaterial color="#c4956a" roughness={0.9} /></mesh></group>))}
      {/* Eyes */}
      {[-0.12, 0.12].map((x, i) => (<mesh key={`e${i}`} position={[x, 0.82, 0.35]}><sphereGeometry args={[0.055, 10, 10]} /><meshStandardMaterial color="#1f2937" roughness={0.3} metalness={0.5} /></mesh>))}
      {/* Nose */}
      <mesh position={[0, 0.7, 0.38]}><sphereGeometry args={[0.06, 8, 8]} /><meshStandardMaterial color="#1f2937" roughness={0.4} /></mesh>
      {/* Snout */}
      <mesh position={[0, 0.68, 0.3]}><sphereGeometry args={[0.14, 10, 10]} /><meshStandardMaterial color="#e8c9a0" roughness={0.9} /></mesh>
      {/* Arms */}
      {[-0.55, 0.55].map((x, i) => (<mesh key={`a${i}`} position={[x, 0.15, 0]} rotation={[0, 0, x > 0 ? -0.5 : 0.5]}><capsuleGeometry args={[0.12, 0.3, 6, 10]} /><meshStandardMaterial color="#d4a574" roughness={0.9} /></mesh>))}
      {/* Legs */}
      {[-0.22, 0.22].map((x, i) => (<mesh key={`l${i}`} position={[x, -0.5, 0.15]}><sphereGeometry args={[0.18, 10, 10]} /><meshStandardMaterial color="#d4a574" roughness={0.9} /></mesh>))}
      {/* Heart patch (repair mark) */}
      <mesh position={[0.15, 0.1, 0.5]} rotation={[0, 0, 0.2]}><boxGeometry args={[0.18, 0.18, 0.02]} /><meshStandardMaterial color="#f472b6" roughness={0.6} /></mesh>
      {/* Stitching lines */}
      {[0, 0.06, 0.12].map((y, i) => (<mesh key={`s${i}`} position={[-0.2, -0.1 + y, 0.52]}><boxGeometry args={[0.12, 0.015, 0.01]} /><meshStandardMaterial color="#92400e" roughness={0.8} /></mesh>))}
      {/* Bow tie */}
      <mesh position={[0, 0.48, 0.35]}><boxGeometry args={[0.25, 0.12, 0.04]} /><meshStandardMaterial color="#ef4444" roughness={0.4} /></mesh>
      <mesh position={[0, 0.48, 0.37]}><sphereGeometry args={[0.04, 8, 8]} /><meshStandardMaterial color="#dc2626" roughness={0.4} /></mesh>
    </group>
  );
}

/* ─────────────────────────────────────────
   12. APPLIANCE → E-Waste Recycling
───────────────────────────────────────── */
export function ApplianceModel() {
  const g = useRef();
  const gear = useRef();
  useFrame(({ clock }) => {
    if (g.current) g.current.rotation.y = clock.elapsedTime * 0.3;
    if (gear.current) gear.current.rotation.z = clock.elapsedTime * 1.5;
  });
  return (
    <group ref={g} position={[0, -0.1, 0]}>
      {/* Appliance body (microwave shape) */}
      <mesh position={[0, 0.2, 0]}><boxGeometry args={[1.3, 0.9, 0.85]} /><meshStandardMaterial color="#374151" roughness={0.3} metalness={0.5} /></mesh>
      {/* Door/window */}
      <mesh position={[0.1, 0.2, 0.43]}><boxGeometry args={[0.75, 0.6, 0.02]} /><meshPhysicalMaterial color="#1e3a5f" roughness={0.1} metalness={0.3} transparent opacity={0.6} /></mesh>
      {/* Control panel */}
      <mesh position={[-0.5, 0.2, 0.43]}><boxGeometry args={[0.25, 0.6, 0.02]} /><meshStandardMaterial color="#1f2937" roughness={0.4} /></mesh>
      {/* Buttons */}
      {[0.35, 0.15, -0.05].map((y, i) => (<mesh key={i} position={[-0.5, y, 0.45]}><cylinderGeometry args={[0.04, 0.04, 0.02, 10]} /><meshStandardMaterial color={['#ef4444', '#22c55e', '#eab308'][i]} roughness={0.3} metalness={0.4} /></mesh>))}
      {/* Recycle symbol overlay */}
      <group ref={gear} position={[0.1, 0.2, 0.45]}>
        {[0, 120, 240].map((deg, i) => {
          const r = (deg * Math.PI) / 180;
          return (<mesh key={i} position={[Math.sin(r) * 0.15, Math.cos(r) * 0.15, 0]} rotation={[0, 0, r + Math.PI]}>
            <coneGeometry args={[0.06, 0.12, 6]} /><meshStandardMaterial color="#4ade80" emissive="#22c55e" emissiveIntensity={0.5} roughness={0.3} />
          </mesh>);
        })}
      </group>
      {/* Power cord */}
      <mesh position={[0, -0.1, -0.5]} rotation={[0.3, 0, 0]}><cylinderGeometry args={[0.02, 0.02, 0.6, 6]} /><meshStandardMaterial color="#1f2937" roughness={0.8} /></mesh>
      {/* Plug */}
      <mesh position={[0, -0.35, -0.7]}><boxGeometry args={[0.08, 0.12, 0.04]} /><meshStandardMaterial color="#374151" roughness={0.4} metalness={0.3} /></mesh>
    </group>
  );
}

/* ─────────────────────────────────────────
   MODEL MAP — maps detected class → component
───────────────────────────────────────── */
export const MODEL_MAP = {
  bottle:      PlantPotModel,
  'wine glass': GlassTerrariumModel,
  cup:         OrganizerModel,
  bowl:        OrganizerModel,
  book:        OrigamiBoxModel,
  'cell phone': CircuitBoardModel,
  laptop:      CircuitBoardModel,
  keyboard:    CircuitBoardModel,
  mouse:       CircuitBoardModel,
  remote:      CircuitBoardModel,
  tv:          CircuitBoardModel,
  clock:       CircuitBoardModel,
  'hair drier': CircuitBoardModel,
  scissors:    TinLanternModel,
  knife:       TinLanternModel,
  fork:        TinLanternModel,
  spoon:       TinLanternModel,
  toothbrush:  TinLanternModel,
  person:      ToteBagModel,
  backpack:    ToteBagModel,
  handbag:     ToteBagModel,
  suitcase:    ToteBagModel,
  umbrella:    ToteBagModel,
  tie:         ToteBagModel,
  vase:        GlassTerrariumModel,
  banana:      OrganicCompostModel,
  apple:       OrganicCompostModel,
  orange:      OrganicCompostModel,
  broccoli:    OrganicCompostModel,
  carrot:      OrganicCompostModel,
  sandwich:    OrganicCompostModel,
  'hot dog':   OrganicCompostModel,
  pizza:       OrganicCompostModel,
  donut:       OrganicCompostModel,
  cake:        OrganicCompostModel,
  'potted plant': OrganicCompostModel,
  chair:       FurnitureShelfModel,
  couch:       FurnitureShelfModel,
  bed:         FurnitureShelfModel,
  'dining table': FurnitureShelfModel,
  bench:       FurnitureShelfModel,
  'teddy bear': ToyRepairModel,
  frisbee:     ToyRepairModel,
  'sports ball': ToyRepairModel,
  kite:        ToyRepairModel,
  'baseball bat': ToyRepairModel,
  'baseball glove': ToyRepairModel,
  skateboard:  ToyRepairModel,
  surfboard:   ToyRepairModel,
  'tennis racket': ToyRepairModel,
  microwave:   ApplianceModel,
  oven:        ApplianceModel,
  toaster:     ApplianceModel,
  refrigerator: ApplianceModel,
  sink:        ApplianceModel,
  default:     RecycleSymbol,
};

