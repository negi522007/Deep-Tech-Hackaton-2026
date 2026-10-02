'use client';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, OrbitControls } from '@react-three/drei';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

/** A stylised industrial turbine / asset core built from primitives. */
function Turbine() {
  const ring = useRef<THREE.Group>(null);
  const blades = useRef<THREE.Group>(null);
  const core = useRef<THREE.Mesh>(null);

  useFrame((_, dt) => {
    if (blades.current) blades.current.rotation.z += dt * 0.6;
    if (ring.current) ring.current.rotation.y += dt * 0.15;
    if (core.current) {
      const s = 1 + Math.sin(performance.now() / 600) * 0.04;
      core.current.scale.setScalar(s);
    }
  });

  const bladeGeom = useMemo(() => new THREE.BoxGeometry(0.18, 1.1, 0.06), []);
  const metal = { metalness: 0.9, roughness: 0.25 } as const;

  return (
    <group ref={ring}>
      {/* outer housing ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2.1, 0.16, 24, 80]} />
        <meshStandardMaterial color="#2a3342" {...metal} />
      </mesh>
      {/* inner accent ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.55, 0.05, 16, 80]} />
        <meshStandardMaterial color="#FF6A1A" emissive="#FF6A1A" emissiveIntensity={1.4} metalness={0.6} roughness={0.3} />
      </mesh>

      {/* rotating blade assembly */}
      <group ref={blades}>
        {Array.from({ length: 9 }).map((_, i) => {
          const a = (i / 9) * Math.PI * 2;
          return (
            <mesh
              key={i}
              geometry={bladeGeom}
              position={[Math.cos(a) * 0.85, Math.sin(a) * 0.85, 0]}
              rotation={[0, 0, a + Math.PI / 2]}
            >
              <meshStandardMaterial color="#c9d2e0" {...metal} />
            </mesh>
          );
        })}
      </group>

      {/* glowing core */}
      <mesh ref={core}>
        <icosahedronGeometry args={[0.55, 2]} />
        <meshStandardMaterial color="#FFB22E" emissive="#FF6A3D" emissiveIntensity={1.6} metalness={0.4} roughness={0.4} />
      </mesh>

      {/* orbiting spare parts */}
      {[0, 1, 2].map((i) => (
        <Float key={i} speed={2 + i} rotationIntensity={1.5} floatIntensity={1.2}>
          <mesh position={[2.6 + i * 0.15, 0.6 - i * 0.6, -0.4 + i * 0.3]}>
            {i === 0 ? <torusGeometry args={[0.22, 0.08, 12, 24]} />
              : i === 1 ? <boxGeometry args={[0.28, 0.28, 0.28]} />
              : <cylinderGeometry args={[0.16, 0.16, 0.3, 20]} />}
            <meshStandardMaterial color="#FFB22E" metalness={0.85} roughness={0.3} emissive="#FF6A1A" emissiveIntensity={0.25} />
          </mesh>
        </Float>
      ))}
    </group>
  );
}

export default function IndustrialScene() {
  return (
    <Canvas
      dpr={[1, 1.8]}
      camera={{ position: [0, 0.4, 6], fov: 42 }}
      gl={{ antialias: true, alpha: true }}
      style={{ background: 'transparent' }}
    >
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 5]} intensity={1.4} color="#bfe9ff" />
      <pointLight position={[-4, -2, 3]} intensity={40} color="#FF6A1A" />
      <pointLight position={[4, 3, -2]} intensity={30} color="#FFB22E" />
      <Float speed={1.2} rotationIntensity={0.4} floatIntensity={0.6}>
        <Turbine />
      </Float>
      <OrbitControls
        enablePan={false}
        enableZoom={false}
        autoRotate
        autoRotateSpeed={0.6}
        minPolarAngle={Math.PI / 2.6}
        maxPolarAngle={Math.PI / 1.7}
      />
    </Canvas>
  );
}
