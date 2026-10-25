"use client";

import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';

interface AICore3DProps {
  isProcessing: boolean;
  color?: string;
}

function Core({ isProcessing, color }: AICore3DProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const wireRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (meshRef.current && wireRef.current) {
      // Base rotation
      const speed = isProcessing ? 5.0 : 0.5;
      
      meshRef.current.rotation.y += delta * speed;
      meshRef.current.rotation.x += delta * speed * 0.5;
      
      wireRef.current.rotation.y -= delta * speed * 0.8;
      wireRef.current.rotation.z += delta * speed * 0.3;

      // Pulse effect
      const scale = isProcessing ? 1 + Math.sin(state.clock.getElapsedTime() * 10) * 0.1 : 1;
      meshRef.current.scale.setScalar(scale);
      wireRef.current.scale.setScalar(scale * 1.2);
    }
  });

  return (
    <group>
      {/* Inner solid glowing core */}
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[1, 0]} />
        <meshStandardMaterial 
          color={color || "#06b6d4"} 
          emissive={color || "#06b6d4"} 
          emissiveIntensity={isProcessing ? 2 : 0.5} 
          transparent
          opacity={0.8}
        />
      </mesh>

      {/* Outer wireframe shell */}
      <mesh ref={wireRef}>
        <icosahedronGeometry args={[1.2, 1]} />
        <meshStandardMaterial 
          color={color || "#a855f7"} 
          emissive={color || "#a855f7"} 
          emissiveIntensity={isProcessing ? 1 : 0.2} 
          wireframe={true}
          transparent
          opacity={0.5}
        />
      </mesh>
    </group>
  );
}

export default function AICore3D({ isProcessing, color }: AICore3DProps) {
  return (
    <div className={`absolute top-16 right-4 w-40 h-40 pointer-events-none z-0 mix-blend-screen transition-opacity duration-500 ${isProcessing ? 'opacity-100' : 'opacity-30'}`}>
      <Canvas camera={{ position: [0, 0, 4], fov: 50 }} dpr={[1, 2]}>
        <ambientLight intensity={0.5} />
        <Core isProcessing={isProcessing} color={color} />
        <EffectComposer>
          <Bloom luminanceThreshold={0.1} luminanceSmoothing={0.9} intensity={isProcessing ? 3 : 1} />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
