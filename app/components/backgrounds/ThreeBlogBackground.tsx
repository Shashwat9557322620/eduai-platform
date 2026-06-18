"use client";

import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';

function Terrain() {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.getElapsedTime();
      const positionAttribute = meshRef.current.geometry.attributes.position;
      
      // Animate the vertices to create an undulating wave effect
      for (let i = 0; i < positionAttribute.count; i++) {
        const x = positionAttribute.getX(i);
        const y = positionAttribute.getY(i);
        // Complex wave formula based on x, y, and time
        const z = Math.sin(x * 0.4 + time * 0.8) * Math.cos(y * 0.4 + time * 0.5) * 2 + Math.sin(x * 0.1 - time * 0.2) * 3;
        positionAttribute.setZ(i, z);
      }
      positionAttribute.needsUpdate = true;
    }
  });

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2.2, 0, 0]} position={[0, -10, -20]}>
      <planeGeometry args={[150, 150, 120, 120]} />
      <meshStandardMaterial 
        color="#a855f7"
        wireframe={true}
        emissive="#06b6d4"
        emissiveIntensity={0.8}
        transparent
        opacity={0.4}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

export default function ThreeBlogBackground() {
  return (
    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
      <Canvas camera={{ position: [0, 5, 20], fov: 60 }} dpr={[1, 2]}>
        <color attach="background" args={['#020203']} />
        <ambientLight intensity={0.5} />
        <Terrain />
        <EffectComposer>
          <Bloom luminanceThreshold={0.1} luminanceSmoothing={0.9} intensity={2.5} />
        </EffectComposer>
      </Canvas>
      {/* Gradient Overlay to fade smoothly into the rest of the dark background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,#020203_80%)]" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#020203] via-transparent to-[#020203]" />
    </div>
  );
}
