"use client";

import { useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { 
  Float, 
  Sphere, 
  Environment, 
  PerspectiveCamera,
  Instance,
  Instances,
  MeshTransmissionMaterial
} from "@react-three/drei";
import { 
  EffectComposer, 
  Bloom, 
  ChromaticAberration, 
  Noise, 
  Vignette 
} from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import * as THREE from "three";



// ── Components ──────────────────────────────────────────────

function CrystalObservatory() {
  const meshRef = useRef<THREE.Mesh>(null);
  const streamRef = useRef<THREE.Mesh>(null);

  // ── Custom Shaders for Volumetric Data Streams ────────────
  const dataStreamMaterial = useMemo(() => new THREE.ShaderMaterial({
    transparent: true,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uTime: { value: 0 },
      uColorPrimary: { value: new THREE.Color("#00d4ff") },
      uColorSecondary: { value: new THREE.Color("#7b2cbf") },
    },
    vertexShader: `
      varying vec2 vUv;
      varying vec3 vPosition;
      void main() {
        vUv = uv;
        vPosition = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform vec3 uColorPrimary;
      uniform vec3 uColorSecondary;
      varying vec2 vUv;
      varying vec3 vPosition;

      // Simplex Noise
      vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }
      float snoise(vec2 v) {
        const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
        vec2 i  = floor(v + dot(v, C.yy));
        vec2 x0 = v - i + dot(i, C.xx);
        vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
        vec4 x12 = x0.xyxy + C.xxzz;
        x12.xy -= i1;
        i = mod289(i);
        vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
        vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
        m = m * m;
        m = m * m;
        vec3 x = 2.0 * fract(p * C.www) - 1.0;
        vec3 h = abs(x) - 0.5;
        vec3 ox = floor(x + 0.5);
        vec3 a0 = x - ox;
        m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
        vec3 g;
        g.x  = a0.x  * x0.x  + h.x  * x0.y;
        g.yz = a0.yz * x12.xz + h.yz * x12.yw;
        return 130.0 * dot(m, g);
      }

      void main() {
        // Data falling effect
        float fall = fract(vUv.y * 10.0 - uTime * 0.5);
        float glow = smoothstep(0.8, 1.0, fall);
        
        float noise = snoise(vec2(vUv.x * 20.0, vUv.y * 2.0 - uTime));
        glow *= smoothstep(0.1, 0.5, noise);

        // Edge fading
        float edge = smoothstep(0.0, 0.2, vUv.x) * smoothstep(1.0, 0.8, vUv.x) * smoothstep(0.0, 0.2, vUv.y) * smoothstep(1.0, 0.8, vUv.y);
        
        vec3 color = mix(uColorPrimary, uColorSecondary, vUv.y);
        gl_FragColor = vec4(color * glow * 1.5, glow * edge);
      }
    `
  }), []);

  useEffect(() => {
    return () => {
      dataStreamMaterial.dispose();
    };
  }, [dataStreamMaterial]);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.05;
      meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.1) * 0.05;
    }
    if (streamRef.current) {
      (streamRef.current.material as THREE.ShaderMaterial).uniforms.uTime.value = state.clock.elapsedTime;
      streamRef.current.rotation.y = -state.clock.elapsedTime * 0.08;
    }
  });

  return (
    <group position={[0, 0, -5]}>
      {/* Translucent Crystal Core */}
      <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
        <Sphere args={[15, 64, 64]} ref={meshRef}>
          <MeshTransmissionMaterial 
            backside
            samples={4}
            thickness={2}
            chromaticAberration={0.5}
            anisotropy={0.3}
            distortion={0.5}
            distortionScale={0.3}
            temporalDistortion={0.1}
            color="#051020"
            attenuationDistance={10}
            attenuationColor="#00d4ff"
          />
        </Sphere>
      </Float>

      {/* Internal Data Streams */}
      <Sphere args={[14.8, 32, 32]} ref={streamRef}>
        <primitive object={dataStreamMaterial} attach="material" />
      </Sphere>
      
      {/* Central God Ray core light */}
      <pointLight position={[0, 0, 0]} intensity={100} color="#e0aaff" distance={30} decay={2} />
    </group>
  );
}

function InfiniteMonoliths({ count = 150 }) {
  const instancesRef = useRef<THREE.InstancedMesh>(null);
  
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const radius = 25 + Math.random() * 50;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);
      
      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi) - 10;

      const scale = 0.2 + Math.random() * 1.5;
      const rotX = Math.random() * Math.PI;
      const rotY = Math.random() * Math.PI;
      const rotZ = Math.random() * Math.PI;
      
      temp.push({ x, y, z, scale, rotX, rotY, rotZ, speed: 0.01 + Math.random() * 0.03 });
    }
    return temp;
  }, [count]);

  useFrame((state) => {
    if (!instancesRef.current) return;
    particles.forEach((p, i) => {
      p.rotX += p.speed * 0.2;
      p.rotY += p.speed * 0.3;
      p.rotZ += p.speed * 0.1;
      
      // Gentle orbit
      const s = Math.sin(state.clock.elapsedTime * p.speed * 0.1);
      const c = Math.cos(state.clock.elapsedTime * p.speed * 0.1);
      const nx = p.x * c - p.z * s;
      const nz = p.x * s + p.z * c;

      const dummy = new THREE.Object3D();
      dummy.position.set(nx, p.y + Math.sin(state.clock.elapsedTime * p.speed + p.x) * 2, nz);
      dummy.rotation.set(p.rotX, p.rotY, p.rotZ);
      dummy.scale.setScalar(p.scale);
      dummy.updateMatrix();
      instancesRef.current!.setMatrixAt(i, dummy.matrix);
    });
    instancesRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <Instances ref={instancesRef} range={count} limit={count}>
      <boxGeometry args={[1, 3, 1]} />
      <meshStandardMaterial 
        color="#0a0f1a" 
        emissive="#00d4ff" 
        emissiveIntensity={0.2}
        roughness={0.2}
        metalness={0.8}
      />
      {particles.map((p, i) => (
        <Instance key={i} />
      ))}
    </Instances>
  );
}

function CinematicCamera() {
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);
  const { mouse } = useThree();

  useFrame((state) => {
    if (!cameraRef.current) return;
    // Parallax sway
    const targetX = mouse.x * 2;
    const targetY = mouse.y * 2;
    cameraRef.current.position.x += (targetX - cameraRef.current.position.x) * 0.02;
    cameraRef.current.position.y += (targetY - cameraRef.current.position.y) * 0.02;
    cameraRef.current.lookAt(0, 0, -5);
  });

  return <PerspectiveCamera ref={cameraRef} makeDefault position={[0, 0, 10]} fov={50} />;
}

// ── Main Background Component ────────────────────────────────
// Replaced heavy WebGL R3F Canvas with ultra-smooth CSS gradients to fix hanging issues

export default function CinematicBackground({ page = "dashboard" }: { page?: string }) {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 bg-[#050508] overflow-hidden">
      {/* Base Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03]" 
        style={{ 
          backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
          backgroundSize: '40px 40px' 
        }} 
      />
      
      {/* Glowing Orbs */}
      <div className="absolute top-[-15%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-[#7b2cbf]/10 blur-[120px] animate-pulse-soft" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-[#00d4ff]/10 blur-[120px]" style={{ animationDelay: '2s' }} />
      <div className="absolute top-[20%] right-[20%] w-[30vw] h-[30vw] rounded-full bg-[#e0aaff]/5 blur-[100px] animate-pulse-soft" style={{ animationDelay: '1s' }} />

      {/* Cinematic Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#050508_100%)] opacity-80" />
    </div>
  );
}
