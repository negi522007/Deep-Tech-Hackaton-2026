'use client';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, OrbitControls, Environment } from '@react-three/drei';
import { useRef } from 'react';
import * as THREE from 'three';

const STEEL  = '#B8C8D8';
const ORANGE = '#FF6A1A';
const AMBER  = '#FFB22E';
const DARK   = '#1a2535';

/* Balanced material: enough metalness to look shiny, enough diffuse to stay visible */
const PM = (color: string, extra?: object) => ({
  color,
  metalness: 0.55,
  roughness: 0.28,
  clearcoat: 0.8,
  clearcoatRoughness: 0.1,
  envMapIntensity: 1.2,
  ...extra,
});

// ── Gear with teeth ──────────────────────────────────────────
function Gear({ color = STEEL, teeth = 14, radius = 0.5, thick = 0.13, speed = 0.3 }:
  { color?: string; teeth?: number; radius?: number; thick?: number; speed?: number }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, dt) => { if (ref.current) ref.current.rotation.y += dt * speed; });
  const toothH = (2 * Math.PI * radius) / teeth * 0.3;
  return (
    <group ref={ref}>
      <mesh>
        <cylinderGeometry args={[radius, radius, thick, 64]} />
        <meshPhysicalMaterial {...PM(color)} />
      </mesh>
      {/* inner bore */}
      <mesh>
        <cylinderGeometry args={[radius * 0.26, radius * 0.26, thick * 1.05, 16]} />
        <meshPhysicalMaterial color={DARK} metalness={0.95} roughness={0.05} />
      </mesh>
      {/* spoke cross */}
      {[0, Math.PI / 2].map((a, i) => (
        <mesh key={i} rotation={[0, a, 0]}>
          <boxGeometry args={[radius * 1.4, thick * 0.6, thick * 0.28]} />
          <meshPhysicalMaterial {...PM(color)} />
        </mesh>
      ))}
      {/* teeth */}
      {Array.from({ length: teeth }).map((_, i) => {
        const a = (i / teeth) * Math.PI * 2;
        return (
          <mesh key={i}
            position={[Math.cos(a) * (radius + 0.055), 0, Math.sin(a) * (radius + 0.055)]}
            rotation={[0, -a, 0]}>
            <boxGeometry args={[toothH, thick, 0.11]} />
            <meshPhysicalMaterial {...PM(color)} />
          </mesh>
        );
      })}
    </group>
  );
}

// ── Electric motor ────────────────────────────────────────────
function Motor() {
  return (
    <group>
      {/* body — octagonal for visible fins */}
      <mesh>
        <cylinderGeometry args={[0.31, 0.31, 0.72, 8]} />
        <meshPhysicalMaterial color="#5a7a9a" metalness={0.5} roughness={0.35} envMapIntensity={1.2} />
      </mesh>
      {/* smooth inner cylinder (contrast) */}
      <mesh>
        <cylinderGeometry args={[0.24, 0.24, 0.74, 32]} />
        <meshPhysicalMaterial color="#3a5570" metalness={0.55} roughness={0.3} envMapIntensity={1} />
      </mesh>
      {/* end caps */}
      {[-0.37, 0.37].map((y, i) => (
        <mesh key={i} position={[0, y, 0]}>
          <cylinderGeometry args={[0.27, 0.27, 0.06, 32]} />
          <meshPhysicalMaterial color="#6a8aaa" metalness={0.55} roughness={0.25} clearcoat={0.9} envMapIntensity={1.3} />
        </mesh>
      ))}
      {/* output shaft */}
      <mesh position={[0, 0.44, 0]}>
        <cylinderGeometry args={[0.055, 0.055, 0.28, 12]} />
        <meshPhysicalMaterial {...PM(STEEL)} roughness={0.08} />
      </mesh>
      {/* mounting bolts */}
      {[0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].map((a, i) => (
        <mesh key={i} position={[Math.cos(a) * 0.29, -0.37, Math.sin(a) * 0.29]}>
          <cylinderGeometry args={[0.025, 0.025, 0.1, 6]} />
          <meshPhysicalMaterial {...PM(AMBER)} roughness={0.12} />
        </mesh>
      ))}
    </group>
  );
}

// ── Ball bearing ──────────────────────────────────────────────
function Bearing() {
  const inner = useRef<THREE.Group>(null);
  useFrame((_, dt) => { if (inner.current) inner.current.rotation.y += dt * 1.1; });
  const BALLS = 10;
  return (
    <group>
      {/* outer race */}
      <mesh>
        <torusGeometry args={[0.42, 0.11, 32, 128]} />
        <meshPhysicalMaterial {...PM(STEEL)} />
      </mesh>
      {/* inner race + balls — rotate together */}
      <group ref={inner}>
        <mesh>
          <torusGeometry args={[0.22, 0.085, 32, 64]} />
          <meshPhysicalMaterial {...PM(STEEL)} />
        </mesh>
        {Array.from({ length: BALLS }).map((_, i) => {
          const a = (i / BALLS) * Math.PI * 2;
          return (
            <mesh key={i} position={[Math.cos(a) * 0.32, 0, Math.sin(a) * 0.32]}>
              <sphereGeometry args={[0.042, 16, 16]} />
              <meshPhysicalMaterial color="#d8e4f0" metalness={0.98} roughness={0.02} clearcoat={1} />
            </mesh>
          );
        })}
      </group>
    </group>
  );
}

// ── Hex nut ───────────────────────────────────────────────────
function HexNut({ color = AMBER }: { color?: string }) {
  return (
    <group>
      <mesh>
        <cylinderGeometry args={[0.26, 0.26, 0.2, 6]} />
        <meshPhysicalMaterial {...PM(color)} />
      </mesh>
      {/* threaded bore (dark) */}
      <mesh>
        <cylinderGeometry args={[0.11, 0.11, 0.22, 16]} />
        <meshPhysicalMaterial color={DARK} metalness={0.9} roughness={0.1} />
      </mesh>
      {/* chamfer top/bottom rings */}
      {[-0.11, 0.11].map((y, i) => (
        <mesh key={i} position={[0, y, 0]}>
          <cylinderGeometry args={[0.26, 0.24, 0.02, 6]} />
          <meshPhysicalMaterial {...PM(color)} roughness={0.05} />
        </mesh>
      ))}
    </group>
  );
}

// ── Piston + cylinder ─────────────────────────────────────────
function Piston() {
  const rod = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (rod.current) rod.current.position.y = 0.28 + Math.sin(clock.elapsedTime * 1.6) * 0.18;
  });
  return (
    <group>
      {/* cylinder housing */}
      <mesh>
        <cylinderGeometry args={[0.21, 0.21, 0.55, 32]} />
        <meshPhysicalMaterial color="#4a6580" metalness={0.5} roughness={0.35} envMapIntensity={1.1} />
      </mesh>
      {/* animated rod + head */}
      <group ref={rod}>
        <mesh position={[0, 0.06, 0]}>
          <cylinderGeometry args={[0.19, 0.19, 0.1, 32]} />
          <meshPhysicalMaterial {...PM(STEEL)} roughness={0.1} />
        </mesh>
        <mesh position={[0, 0.22, 0]}>
          <cylinderGeometry args={[0.065, 0.065, 0.32, 12]} />
          <meshPhysicalMaterial {...PM(STEEL)} roughness={0.06} />
        </mesh>
        {/* wrist pin */}
        <mesh position={[0, 0.38, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.025, 0.025, 0.18, 8]} />
          <meshPhysicalMaterial {...PM(ORANGE)} roughness={0.08} />
        </mesh>
      </group>
    </group>
  );
}

// ── Valve handwheel ───────────────────────────────────────────
function ValveWheel({ color = STEEL }: { color?: string }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, dt) => { if (ref.current) ref.current.rotation.y += dt * 0.22; });
  const SPOKES = 5;
  return (
    <group ref={ref}>
      {/* rim */}
      <mesh>
        <torusGeometry args={[0.38, 0.048, 16, 128]} />
        <meshPhysicalMaterial {...PM(color)} />
      </mesh>
      {/* spokes — group rotated to point radially, cylinder tilted to lie flat */}
      {Array.from({ length: SPOKES }).map((_, i) => {
        const a = (i / SPOKES) * Math.PI * 2;
        return (
          <group key={i} rotation={[0, a, 0]}>
            <mesh position={[0.19, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.018, 0.018, 0.38, 8]} />
              <meshPhysicalMaterial {...PM(color)} roughness={0.25} />
            </mesh>
          </group>
        );
      })}
      {/* hub */}
      <mesh>
        <cylinderGeometry args={[0.075, 0.075, 0.1, 12]} />
        <meshPhysicalMaterial {...PM(ORANGE)} roughness={0.1} />
      </mesh>
      {/* stem */}
      <mesh position={[0, -0.22, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 0.35, 12]} />
        <meshPhysicalMaterial {...PM(color)} roughness={0.1} />
      </mesh>
    </group>
  );
}

// ── Flywheel (centerpiece) ────────────────────────────────────
function Flywheel() {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, dt) => { if (ref.current) ref.current.rotation.y += dt * 0.18; });
  const SPOKES = 8;
  const BOLTS  = 6;
  return (
    <group ref={ref}>
      {/* outer rim */}
      <mesh>
        <torusGeometry args={[1.05, 0.13, 32, 128]} />
        <meshPhysicalMaterial {...PM(STEEL)} roughness={0.22} />
      </mesh>
      {/* inner trim ring */}
      <mesh>
        <torusGeometry args={[0.88, 0.045, 16, 128]} />
        <meshPhysicalMaterial color={ORANGE} emissive={ORANGE} emissiveIntensity={0.4} metalness={0.5} roughness={0.25} />
      </mesh>
      {/* spokes */}
      {Array.from({ length: SPOKES }).map((_, i) => {
        const a = (i / SPOKES) * Math.PI * 2;
        return (
          <group key={i} rotation={[0, a, 0]}>
            <mesh position={[0.52, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.038, 0.028, 1.04, 10]} />
              <meshPhysicalMaterial {...PM(STEEL)} roughness={0.2} />
            </mesh>
          </group>
        );
      })}
      {/* center hub disc */}
      <mesh>
        <cylinderGeometry args={[0.22, 0.22, 0.18, 32]} />
        <meshPhysicalMaterial color="#3a5575" metalness={0.6} roughness={0.3} envMapIntensity={1.2} />
      </mesh>
      {/* hub face detail */}
      <mesh position={[0, 0.1, 0]}>
        <cylinderGeometry args={[0.13, 0.13, 0.04, 32]} />
        <meshPhysicalMaterial {...PM(STEEL)} roughness={0.15} />
      </mesh>
      {/* hub bolts */}
      {Array.from({ length: BOLTS }).map((_, i) => {
        const a = (i / BOLTS) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(a) * 0.18, 0.1, Math.sin(a) * 0.18]}>
            <cylinderGeometry args={[0.018, 0.018, 0.06, 6]} />
            <meshPhysicalMaterial {...PM(AMBER)} roughness={0.1} />
          </mesh>
        );
      })}
      {/* axle shaft front */}
      <mesh position={[0, 0.18, 0]}>
        <cylinderGeometry args={[0.055, 0.055, 0.22, 12]} />
        <meshPhysicalMaterial {...PM(STEEL)} roughness={0.08} />
      </mesh>
      {/* axle shaft back */}
      <mesh position={[0, -0.18, 0]}>
        <cylinderGeometry args={[0.055, 0.055, 0.22, 12]} />
        <meshPhysicalMaterial {...PM(STEEL)} roughness={0.08} />
      </mesh>
      {/* subtle glow point light at hub */}
      <pointLight color={ORANGE} intensity={18} distance={3} decay={2} />
    </group>
  );
}

// ── Hex bolt ──────────────────────────────────────────────────
function HexBolt() {
  return (
    <group>
      {/* head */}
      <mesh position={[0, 0.12, 0]}>
        <cylinderGeometry args={[0.18, 0.18, 0.14, 6]} />
        <meshPhysicalMaterial {...PM(STEEL)} />
      </mesh>
      {/* shaft with thread rings */}
      <mesh>
        <cylinderGeometry args={[0.09, 0.09, 0.55, 16]} />
        <meshPhysicalMaterial {...PM(STEEL)} roughness={0.28} />
      </mesh>
      {/* thread rings */}
      {Array.from({ length: 6 }).map((_, i) => (
        <mesh key={i} position={[0, -0.25 + i * 0.09, 0]}>
          <torusGeometry args={[0.09, 0.012, 6, 16]} />
          <meshPhysicalMaterial {...PM(STEEL)} roughness={0.3} />
        </mesh>
      ))}
    </group>
  );
}

// ── Main scene ────────────────────────────────────────────────
export default function IndustrialScene() {
  return (
    <Canvas
      dpr={[1, 1.8]}
      camera={{ position: [0, 1.2, 8], fov: 44 }}
      gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.4 }}
      style={{ background: 'transparent' }}
    >
      {/* Environment map = metallic objects reflect something real */}
      <Environment preset="warehouse" environmentIntensity={0.9} />

      <ambientLight intensity={1.2} />
      <directionalLight position={[4, 6, 5]}  intensity={2.5} color="#ddeeff" />
      <directionalLight position={[-4, -2, 3]} intensity={1.2} color="#ffffff" />
      <pointLight position={[-5, 2, 4]}  intensity={120} color="#FF6A1A" distance={14} decay={2} />
      <pointLight position={[5, -2, -3]} intensity={80}  color="#FFB22E" distance={12} decay={2} />
      <pointLight position={[0, 4, 6]}   intensity={60}  color="#90C8FF" distance={12} decay={2} />

      {/* ── Flywheel — centerpiece ── */}
      <Float speed={0.6} rotationIntensity={0.15} floatIntensity={0.4}>
        <group position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <Flywheel />
        </group>
      </Float>

      {/* Large gear — left */}
      <Float speed={1.3} rotationIntensity={0.5} floatIntensity={0.9}>
        <group position={[-2.2, 0.3, 0]} rotation={[1.1, 0, 0.2]}>
          <Gear color={STEEL} teeth={16} radius={0.58} thick={0.14} speed={0.22} />
        </group>
      </Float>

      {/* Small orange gear — upper center */}
      <Float speed={2.1} rotationIntensity={0.7} floatIntensity={1.1}>
        <group position={[-0.4, 1.4, 0.4]} rotation={[0.9, 0, -0.3]}>
          <Gear color={ORANGE} teeth={10} radius={0.36} thick={0.11} speed={-0.38} />
        </group>
      </Float>

      {/* Motor — right */}
      <Float speed={1.1} rotationIntensity={0.35} floatIntensity={0.7}>
        <group position={[2.3, 0.1, 0]} rotation={[0.25, 0.4, 0.15]}>
          <Motor />
        </group>
      </Float>

      {/* Bearing — lower center */}
      <Float speed={1.7} rotationIntensity={0.8} floatIntensity={1.2}>
        <group position={[0.6, -1.3, 0.6]} rotation={[0.5, 0.3, 0]}>
          <Bearing />
        </group>
      </Float>

      {/* Hex nut — upper right */}
      <Float speed={2.3} rotationIntensity={1.1} floatIntensity={1}>
        <group position={[1.6, 1.5, -0.5]} rotation={[0.6, 0, 0.4]}>
          <HexNut color={AMBER} />
        </group>
      </Float>

      {/* Piston — lower left */}
      <Float speed={1.4} rotationIntensity={0.4} floatIntensity={0.75}>
        <group position={[-2.4, -1.1, 0.3]} rotation={[0.1, 0, 0.25]}>
          <Piston />
        </group>
      </Float>

      {/* Valve wheel — top */}
      <Float speed={1.6} rotationIntensity={0.65} floatIntensity={1.15}>
        <group position={[0.1, 2.1, -0.6]} rotation={[1.2, 0, 0]}>
          <ValveWheel color={STEEL} />
        </group>
      </Float>

      {/* Hex bolt — far right */}
      <Float speed={1.9} rotationIntensity={0.9} floatIntensity={0.85}>
        <group position={[3.2, -0.5, 0.2]} rotation={[0.7, 0.5, -0.2]}>
          <HexBolt />
        </group>
      </Float>

      <OrbitControls
        enablePan={false}
        enableZoom={false}
        autoRotate
        autoRotateSpeed={0.45}
        minPolarAngle={Math.PI / 3}
        maxPolarAngle={Math.PI / 1.7}
      />
    </Canvas>
  );
}
