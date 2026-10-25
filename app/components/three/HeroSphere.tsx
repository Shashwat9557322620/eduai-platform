"use client";

import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { MeshDistortMaterial, Sphere } from "@react-three/drei";
import * as THREE from "three";

export default function HeroSphere() {
  const sphereRef = useRef<THREE.Mesh>(null);
  
  // Create a custom iridescent gradient texture
  const gradientMap = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 1;
    const context = canvas.getContext("2d");
    if (context) {
      const gradient = context.createLinearGradient(0, 0, 256, 0);
      gradient.addColorStop(0, "#22d3ee"); // cyan
      gradient.addColorStop(0.5, "#a855f7"); // purple
      gradient.addColorStop(1, "#ec4899"); // pink
      context.fillStyle = gradient;
      context.fillRect(0, 0, 256, 1);
    }
    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }, []);

  useFrame((state) => {
    if (sphereRef.current) {
      sphereRef.current.rotation.x = state.clock.getElapsedTime() * 0.2;
      sphereRef.current.rotation.y = state.clock.getElapsedTime() * 0.3;
      
      // Interactive mouse follow
      const targetX = (state.pointer.x * Math.PI) / 4;
      const targetY = (state.pointer.y * Math.PI) / 4;
      
      sphereRef.current.rotation.x += 0.05 * (targetY - sphereRef.current.rotation.x);
      sphereRef.current.rotation.y += 0.05 * (targetX - sphereRef.current.rotation.y);
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Ambient and directional lights */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 10, 5]} intensity={1} color="#ffffff" />
      <directionalLight position={[-10, -10, -5]} intensity={0.5} color="#a855f7" />
      
      {/* Distorted Sphere */}
      <Sphere ref={sphereRef} args={[2.5, 64, 64]}>
        <MeshDistortMaterial
          color="#0a0a0f"
          emissive="#22d3ee"
          emissiveMap={gradientMap}
          emissiveIntensity={0.6}
          roughness={0.2}
          metalness={0.8}
          distort={0.4} // Amount of distortion
          speed={2} // Speed of animation
          wireframe={true} // Add tech/cyber feel
        />
      </Sphere>

      {/* Inner glowing core */}
      <Sphere args={[2.2, 32, 32]}>
        <meshBasicMaterial color="#a855f7" transparent opacity={0.1} blending={THREE.AdditiveBlending} />
      </Sphere>
    </group>
  );
}
