"use client";

import { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function ParticleGalaxy() {
  const ref = useRef<THREE.Points>(null);
  const coreRef1 = useRef<THREE.Mesh>(null);
  const coreRef2 = useRef<THREE.Mesh>(null);
  const particleCount = 8000;
  
  const [positions, colors] = useMemo(() => {
    const p = new Float32Array(particleCount * 3);
    const c = new Float32Array(particleCount * 3);
    const colorInside = new THREE.Color('#06b6d4'); // Cyan
    const colorOutside = new THREE.Color('#a855f7'); // Purple
    
    for (let i = 0; i < particleCount; i++) {
      // Swirling galaxy shape
      const radius = 30 * Math.random();
      const spinAngle = radius * 0.5;
      const branchAngle = ((i % 5) * 2 * Math.PI) / 5;
      
      const randomX = Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * 3;
      const randomY = Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * 3;
      const randomZ = Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * 3;

      p[i * 3] = Math.cos(branchAngle + spinAngle) * radius + randomX;
      p[i * 3 + 1] = randomY + (Math.sin(radius * 0.5) * 2); // Wavy vertical variance
      p[i * 3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ;

      const mixedColor = colorInside.clone().lerp(colorOutside, radius / 30);
      c[i * 3] = mixedColor.r;
      c[i * 3 + 1] = mixedColor.g;
      c[i * 3 + 2] = mixedColor.b;
    }
    return [p, c];
  }, []);

  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.y -= delta * 0.05;
      ref.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
    }
    if (coreRef1.current) {
      coreRef1.current.rotation.x += delta * 0.2;
      coreRef1.current.rotation.y += delta * 0.3;
    }
    if (coreRef2.current) {
      coreRef2.current.rotation.x -= delta * 0.1;
      coreRef2.current.rotation.y -= delta * 0.15;
    }
  });

  return (
    <group rotation={[Math.PI / 6, 0, 0]}>
      <points ref={ref}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={particleCount} array={positions} itemSize={3} />
          <bufferAttribute attach="attributes-color" count={particleCount} array={colors} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial size={0.15} vertexColors transparent depthWrite={false} blending={THREE.AdditiveBlending} />
      </points>
      
      {/* Central Animated AI Cores */}
      <mesh ref={coreRef1}>
        <icosahedronGeometry args={[4, 1]} />
        <meshBasicMaterial color="#06b6d4" wireframe transparent opacity={0.15} blending={THREE.AdditiveBlending} />
      </mesh>
      <mesh ref={coreRef2}>
        <icosahedronGeometry args={[6, 2]} />
        <meshBasicMaterial color="#a855f7" wireframe transparent opacity={0.08} blending={THREE.AdditiveBlending} />
      </mesh>
    </group>
  );
}

export default function ThreeHeroBackground() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      
      {/* FALLBACK/ENHANCEMENT: Insane CSS 3D Grid */}
      <div 
        className="absolute bottom-0 left-0 w-full h-[60vh] opacity-30"
        style={{
          transform: 'perspective(1000px) rotateX(75deg) translateY(100px) scale(2.5)',
          transformOrigin: 'bottom center',
          background: 'linear-gradient(rgba(6,182,212,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.3) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          maskImage: 'linear-gradient(to top, rgba(0,0,0,1) 0%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to top, rgba(0,0,0,1) 0%, transparent 100%)'
        }}
      />

      {/* Massive Glowing Orbs Behind the Grid */}
      <div className="absolute top-1/4 left-1/4 w-[40vw] h-[40vw] bg-cyan-500/20 blur-[150px] mix-blend-screen rounded-full animate-pulse" style={{ animationDuration: '4s' }} />
      <div className="absolute bottom-1/4 right-1/4 w-[50vw] h-[50vw] bg-purple-500/10 blur-[150px] mix-blend-screen rounded-full animate-pulse" style={{ animationDuration: '6s', animationDelay: '1s' }} />

      {/* WebGL Canvas */}
      <Canvas 
        camera={{ position: [0, 5, 25], fov: 60 }} 
        dpr={[1, 1.5]}
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
        gl={{ antialias: false, alpha: true }}
      >
        <ambientLight intensity={0.5} />
        <ParticleGalaxy />
      </Canvas>

    </div>
  );
}
