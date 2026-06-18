"use client";
import { useRef, useEffect, useCallback, useState } from 'react';

/**
 * Advanced WebGL Shader Background
 * - Nebula cloud particles with glow
 * - Mouse-reactive ripple distortion
 * - CSS gradient fallback when WebGL unavailable
 */

const VERT_SHADER = `
  attribute vec2 a_position;
  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

const FRAG_SHADER = `
  precision highp float;
  uniform float u_time;
  uniform vec2 u_resolution;
  uniform vec2 u_mouse;

  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
    vec2 i = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m*m; m = m*m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
    vec3 g;
    g.x = a0.x * x0.x + h.x * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  float fbm(vec2 p) {
    float f = 0.0;
    float w = 0.5;
    for (int i = 0; i < 5; i++) {
      f += w * snoise(p);
      p *= 2.0;
      w *= 0.5;
    }
    return f;
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution;
    vec2 mouse = u_mouse / u_resolution;
    float t = u_time * 0.15;
    float mouseDist = length(uv - mouse);
    float mouseInfluence = smoothstep(0.4, 0.0, mouseDist) * 0.15;
    vec2 p = uv * 2.5;
    float n1 = fbm(p + vec2(t * 0.3, t * 0.1));
    float n2 = fbm(p * 1.5 + vec2(-t * 0.2, t * 0.15) + n1 * 0.5);
    float n3 = fbm(p * 0.8 + vec2(t * 0.1, -t * 0.2) + n2 * 0.3);
    vec3 deepBlue = vec3(0.01, 0.01, 0.03);
    vec3 cyanGlow = vec3(0.024, 0.227, 0.380);
    vec3 purpleGlow = vec3(0.102, 0.055, 0.216);
    vec3 pinkGlow = vec3(0.149, 0.047, 0.122);
    vec3 col = deepBlue;
    col = mix(col, cyanGlow, smoothstep(-0.2, 0.6, n1) * 0.3);
    col = mix(col, purpleGlow, smoothstep(0.0, 0.8, n2) * 0.25);
    col = mix(col, pinkGlow, smoothstep(-0.1, 0.5, n3) * 0.15);
    col += cyanGlow * mouseInfluence * (1.0 + sin(t * 3.0) * 0.3);
    float vignette = 1.0 - smoothstep(0.3, 1.2, length(uv - 0.5));
    col *= vignette;
    vec2 starUV = uv * 80.0;
    float star = step(0.998, fract(sin(dot(floor(starUV), vec2(12.9898, 78.233))) * 43758.5453));
    float starTwinkle = sin(t * 2.0 + floor(starUV.x) * 3.7 + floor(starUV.y) * 7.1) * 0.5 + 0.5;
    col += star * starTwinkle * 0.6;
    float grain = (fract(sin(dot(uv * u_time, vec2(12.9898, 78.233))) * 43758.5453) - 0.5) * 0.02;
    col += grain;
    gl_FragColor = vec4(col, 1.0);
  }
`;

function createShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function createProgram(gl: WebGLRenderingContext, vert: WebGLShader, frag: WebGLShader): WebGLProgram | null {
  const program = gl.createProgram();
  if (!program) return null;
  gl.attachShader(program, vert);
  gl.attachShader(program, frag);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    gl.deleteProgram(program);
    return null;
  }
  return program;
}

export default function WebGLShaderBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number>(0);
  const [webglReady, setWebglReady] = useState(false);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    mouseRef.current = { x: e.clientX, y: window.innerHeight - e.clientY };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext('webgl', { alpha: false, antialias: false, preserveDrawingBuffer: false });
    if (!gl) return;
    const vert = createShader(gl, gl.VERTEX_SHADER, VERT_SHADER);
    const frag = createShader(gl, gl.FRAGMENT_SHADER, FRAG_SHADER);
    if (!vert || !frag) return;
    const program = createProgram(gl, vert, frag);
    if (!program) return;
    gl.useProgram(program);
    const posBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
    const posLoc = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);
    const uTime = gl.getUniformLocation(program, 'u_time');
    const uResolution = gl.getUniformLocation(program, 'u_resolution');
    const uMouse = gl.getUniformLocation(program, 'u_mouse');
    const startTime = Date.now();
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 1.5);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + 'px';
      canvas.style.height = window.innerHeight + 'px';
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    setWebglReady(true);
    const render = () => {
      const t = (Date.now() - startTime) / 1000;
      gl.uniform1f(uTime, t);
      gl.uniform2f(uResolution, canvas.width, canvas.height);
      gl.uniform2f(uMouse, mouseRef.current.x * Math.min(window.devicePixelRatio, 1.5), mouseRef.current.y * Math.min(window.devicePixelRatio, 1.5));
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      rafRef.current = requestAnimationFrame(render);
    };
    rafRef.current = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      gl.deleteProgram(program);
      gl.deleteShader(vert);
      gl.deleteShader(frag);
    };
  }, [handleMouseMove]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0" aria-hidden="true">
      {/* Canvas always in DOM so ref attaches, visibility controlled by opacity */}
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 block transition-opacity duration-[2000ms] ${webglReady ? 'opacity-100' : 'opacity-0'}`}
      />
      {/* CSS fallback gradient — visible only when WebGL failed */}
      {!webglReady && (
        <div
          className="absolute inset-0 transition-opacity duration-1000"
          style={{
            background: 'radial-gradient(ellipse at 30% 40%, rgba(6,182,212,0.06), transparent 50%), radial-gradient(ellipse at 70% 60%, rgba(168,85,247,0.05), transparent 50%), linear-gradient(to bottom, #020203, #050508)',
          }}
        />
      )}
      {/* Vignette — always visible */}
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at center, transparent 40%, #020203 100%)' }} />
    </div>
  );
}
