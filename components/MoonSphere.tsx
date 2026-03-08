'use client';

import { Suspense, useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

// ── Simplex-noise helpers (seeded, no external dep) ───────────────────────────
// A minimal 3-D simplex noise implementation embedded here so no extra package
// is needed.  Adapted from Stefan Gustavson's public-domain implementation.

const G3 = 1.0 / 6.0;
const p = new Uint8Array(512);

(function initPermutation() {
  const perm = new Uint8Array(256);
  for (let i = 0; i < 256; i++) perm[i] = i;
  // Deterministic shuffle with fixed seed (12345)
  let seed = 12345;
  for (let i = 255; i > 0; i--) {
    seed = (seed * 1664525 + 1013904223) & 0xffffffff;
    const j = ((seed >>> 0) % (i + 1)) | 0;
    const tmp = perm[i];
    perm[i] = perm[j];
    perm[j] = tmp;
  }
  for (let i = 0; i < 512; i++) p[i] = perm[i & 255];
})();

const grad3 = new Float32Array([
  1, 1, 0, -1, 1, 0, 1, -1, 0, -1, -1, 0, 1, 0, 1, -1, 0, 1, 1, 0, -1, -1, 0, -1, 0, 1, 1, 0,
  -1, 1, 0, 1, -1, 0, -1, -1,
]);

function dot3(g: number, x: number, y: number, z: number) {
  const i = g * 3;
  return grad3[i] * x + grad3[i + 1] * y + grad3[i + 2] * z;
}

function simplex3(xin: number, yin: number, zin: number): number {
  const s = (xin + yin + zin) / 3;
  const i = Math.floor(xin + s);
  const j = Math.floor(yin + s);
  const k = Math.floor(zin + s);
  const t = (i + j + k) * G3;
  const x0 = xin - (i - t);
  const y0 = yin - (j - t);
  const z0 = zin - (k - t);
  let i1: number, j1: number, k1: number, i2: number, j2: number, k2: number;
  if (x0 >= y0) {
    if (y0 >= z0) {
      i1 = 1; j1 = 0; k1 = 0; i2 = 1; j2 = 1; k2 = 0;
    } else if (x0 >= z0) {
      i1 = 1; j1 = 0; k1 = 0; i2 = 1; j2 = 0; k2 = 1;
    } else {
      i1 = 0; j1 = 0; k1 = 1; i2 = 1; j2 = 0; k2 = 1;
    }
  } else {
    if (y0 < z0) {
      i1 = 0; j1 = 0; k1 = 1; i2 = 0; j2 = 1; k2 = 1;
    } else if (x0 < z0) {
      i1 = 0; j1 = 1; k1 = 0; i2 = 0; j2 = 1; k2 = 1;
    } else {
      i1 = 0; j1 = 1; k1 = 0; i2 = 1; j2 = 1; k2 = 0;
    }
  }
  const x1 = x0 - i1 + G3, y1 = y0 - j1 + G3, z1 = z0 - k1 + G3;
  const x2 = x0 - i2 + 2 * G3, y2 = y0 - j2 + 2 * G3, z2 = z0 - k2 + 2 * G3;
  const x3 = x0 - 1 + 3 * G3, y3 = y0 - 1 + 3 * G3, z3 = z0 - 1 + 3 * G3;
  const ii = i & 255, jj = j & 255, kk = k & 255;
  const gi0 = p[ii + p[jj + p[kk]]] % 12;
  const gi1 = p[ii + i1 + p[jj + j1 + p[kk + k1]]] % 12;
  const gi2 = p[ii + i2 + p[jj + j2 + p[kk + k2]]] % 12;
  const gi3 = p[ii + 1 + p[jj + 1 + p[kk + 1]]] % 12;
  let n0 = 0, n1 = 0, n2 = 0, n3 = 0;
  let t0 = 0.6 - x0 * x0 - y0 * y0 - z0 * z0;
  if (t0 > 0) { t0 *= t0; n0 = t0 * t0 * dot3(gi0, x0, y0, z0); }
  let t1 = 0.6 - x1 * x1 - y1 * y1 - z1 * z1;
  if (t1 > 0) { t1 *= t1; n1 = t1 * t1 * dot3(gi1, x1, y1, z1); }
  let t2 = 0.6 - x2 * x2 - y2 * y2 - z2 * z2;
  if (t2 > 0) { t2 *= t2; n2 = t2 * t2 * dot3(gi2, x2, y2, z2); }
  let t3 = 0.6 - x3 * x3 - y3 * y3 - z3 * z3;
  if (t3 > 0) { t3 *= t3; n3 = t3 * t3 * dot3(gi3, x3, y3, z3); }
  return 32 * (n0 + n1 + n2 + n3);
}

// Fractional Brownian Motion (fBm) built from simplex octaves
function fbm(x: number, y: number, z: number, octaves: number): number {
  let value = 0;
  let amplitude = 0.5;
  let frequency = 1;
  for (let i = 0; i < octaves; i++) {
    value += amplitude * simplex3(x * frequency, y * frequency, z * frequency);
    amplitude *= 0.5;
    frequency *= 2;
  }
  return value;
}

// ── Procedural texture generator ─────────────────────────────────────────────
// Pixels per side for procedural textures.
// 512×512 strikes a good balance: visually rich enough at display sizes up to ~750px
// while keeping generation time under ~50ms on typical hardware.
// Reduce to 256 for faster load on low-end / constrained devices.
const TEX_SIZE = 512;

function generateMoonTextures(): {
  colorTex: THREE.DataTexture;
  normalTex: THREE.DataTexture;
} {
  const size = TEX_SIZE;
  const colorData = new Uint8Array(size * size * 4);
  const normalData = new Uint8Array(size * size * 4);

  // Heights for normal-map computation
  const heights = new Float32Array(size * size);

  for (let j = 0; j < size; j++) {
    for (let i = 0; i < size; i++) {
      // Map pixel to sphere surface via equirectangular projection
      const u = i / size;
      const v = j / size;
      const lon = u * Math.PI * 2;
      const lat = v * Math.PI - Math.PI / 2;
      const sx = Math.cos(lat) * Math.cos(lon);
      const sy = Math.sin(lat);
      const sz = Math.cos(lat) * Math.sin(lon);

      // Base highland/lowland noise (large scale)
      const base = fbm(sx * 1.5, sy * 1.5, sz * 1.5, 6);

      // Sharp crater pits — use abs-value trick to create concave rings
      const craterFreq = 3.2;
      const cr1 = 1 - Math.abs(simplex3(sx * craterFreq, sy * craterFreq, sz * craterFreq));
      const cr2 = 1 - Math.abs(simplex3(sx * 5.1 + 10, sy * 5.1 + 10, sz * 5.1 + 10));
      const cr3 = 1 - Math.abs(simplex3(sx * 8.7 - 5, sy * 8.7 - 5, sz * 8.7 - 5));
      const craters = cr1 * 0.35 + cr2 * 0.2 + cr3 * 0.1;

      // Fine surface detail
      const detail = fbm(sx * 12, sy * 12, sz * 12, 3) * 0.08;

      const h = base * 0.4 + craters * 0.45 + detail;
      heights[j * size + i] = h;
    }
  }

  // Normalise heights to [0,1]
  let hMin = Infinity, hMax = -Infinity;
  for (let i = 0; i < heights.length; i++) {
    if (heights[i] < hMin) hMin = heights[i];
    if (heights[i] > hMax) hMax = heights[i];
  }
  const hRange = hMax - hMin || 1;
  for (let i = 0; i < heights.length; i++) {
    heights[i] = (heights[i] - hMin) / hRange;
  }

  // Build colour and normal data
  for (let j = 0; j < size; j++) {
    for (let i = 0; i < size; i++) {
      const idx = (j * size + i) * 4;
      const h = heights[j * size + i];

      // Colour: grey regolith with subtle warm/cool variation
      const warmCool = simplex3(i / size * 4, j / size * 4, 7.3) * 0.04;
      const base = 0.22 + h * 0.35 + warmCool;
      const r = Math.min(255, Math.max(0, (base + 0.02) * 255));
      const g = Math.min(255, Math.max(0, base * 255));
      const b = Math.min(255, Math.max(0, (base - 0.015) * 255));
      colorData[idx] = r;
      colorData[idx + 1] = g;
      colorData[idx + 2] = b;
      colorData[idx + 3] = 255;

      // Normal map via finite differences
      const left = heights[j * size + Math.max(0, i - 1)];
      const right = heights[j * size + Math.min(size - 1, i + 1)];
      const up = heights[Math.max(0, j - 1) * size + i];
      const down = heights[Math.min(size - 1, j + 1) * size + i];
      const dxH = (right - left) * 4;
      const dyH = (down - up) * 4;
      // Convert to normal in [-1,1] range, stored as [0,255]
      const nx = -dxH;
      const ny = -dyH;
      const nz = 1;
      const len = Math.sqrt(nx * nx + ny * ny + nz * nz);
      normalData[idx] = Math.round((nx / len * 0.5 + 0.5) * 255);
      normalData[idx + 1] = Math.round((ny / len * 0.5 + 0.5) * 255);
      normalData[idx + 2] = Math.round((nz / len * 0.5 + 0.5) * 255);
      normalData[idx + 3] = 255;
    }
  }

  const colorTex = new THREE.DataTexture(colorData, size, size, THREE.RGBAFormat);
  colorTex.wrapS = THREE.RepeatWrapping;
  colorTex.wrapT = THREE.RepeatWrapping;
  colorTex.needsUpdate = true;

  const normalTex = new THREE.DataTexture(normalData, size, size, THREE.RGBAFormat);
  normalTex.wrapS = THREE.RepeatWrapping;
  normalTex.wrapT = THREE.RepeatWrapping;
  normalTex.needsUpdate = true;

  return { colorTex, normalTex };
}

// ── Moon mesh ─────────────────────────────────────────────────────────────────
interface MoonMeshProps {
  isMobile: boolean;
  reducedMotion: boolean;
  mouseOffset: React.MutableRefObject<{ x: number; y: number }>;
}

function MoonMesh({ isMobile, reducedMotion, mouseOffset }: MoonMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const haloRef = useRef<THREE.Mesh>(null);
  const { colorTex, normalTex } = useMemo(() => generateMoonTextures(), []);

  // Segment counts balance visual quality vs. polygon load:
  // 64  segments → ~8 k triangles  (mobile, lower GPU budget)
  // 128 segments → ~32 k triangles (desktop, smooth silhouette at 750 px display size)
  const segments = isMobile ? 64 : 128;

  useFrame(({ clock }) => {
    if (!meshRef.current) return;

    const t = clock.getElapsedTime();

    if (!reducedMotion) {
      // Slow Y rotation ~7 min per revolution
      meshRef.current.rotation.y = t * 0.015;
      // Gentle float — sinusoidal Y translation (±0.04 units, ~8 s period)
      meshRef.current.position.y = Math.sin(t * (2 * Math.PI / 8)) * 0.04;
    }

    // Subtle tilt toward mouse cursor (±2°)
    const targetX = 0.1 + mouseOffset.current.y * 0.035;
    const targetZ = mouseOffset.current.x * 0.035;
    meshRef.current.rotation.x += (targetX - meshRef.current.rotation.x) * 0.03;
    meshRef.current.rotation.z += (targetZ - meshRef.current.rotation.z) * 0.03;

    if (haloRef.current) {
      haloRef.current.position.y = meshRef.current.position.y;
    }
  });

  return (
    <group>
      {/* Atmospheric halo — slightly oversized, additive blending */}
      <mesh ref={haloRef} scale={1.03}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial
          color="#7aaeff"
          transparent
          opacity={0.035}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.FrontSide}
        />
      </mesh>

      {/* Main moon sphere */}
      <mesh ref={meshRef} rotation={[0.1, 0, 0]}>
        <sphereGeometry args={[1, segments, segments]} />
        <meshStandardMaterial
          map={colorTex}
          normalMap={normalTex}
          normalScale={new THREE.Vector2(0.8, 0.8)}
          roughness={1}
          metalness={0}
        />
      </mesh>
    </group>
  );
}

// ── Lighting rig ─────────────────────────────────────────────────────────────
function LightRig() {
  return (
    <>
      {/* Very faint fill to prevent pure-black shadow side */}
      <ambientLight intensity={0.08} />
      {/* Main sunlight — warm, from upper-right-front */}
      <directionalLight position={[5, 3, 5]} intensity={1.8} color="#fffaf0" />
      {/* Earthshine — faint blue on shadow side */}
      <pointLight position={[-4, -2, -3]} intensity={0.06} color="#4488cc" />
      {/* Rim light to separate moon from dark background */}
      <pointLight position={[-2, 1, -4]} intensity={0.12} color="#aaccff" />
    </>
  );
}

// ── WebGL detection helper ────────────────────────────────────────────────────
function detectWebGL(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch {
    return false;
  }
}

// ── Inner scene (inside Canvas) ───────────────────────────────────────────────
interface SceneProps {
  isMobile: boolean;
  reducedMotion: boolean;
  mouseOffset: React.MutableRefObject<{ x: number; y: number }>;
}

function Scene({ isMobile, reducedMotion, mouseOffset }: SceneProps) {
  return (
    <>
      <LightRig />
      <Suspense fallback={null}>
        <MoonMesh isMobile={isMobile} reducedMotion={reducedMotion} mouseOffset={mouseOffset} />
      </Suspense>
    </>
  );
}

// ── CSS-only static fallback (no WebGL) ──────────────────────────────────────
function StaticMoonFallback() {
  return (
    <div
      aria-hidden="true"
      className="w-full h-full rounded-full"
      style={{
        background: 'radial-gradient(circle at 35% 40%, #5a5a5a, #2a2a2a 55%, #0d0d0d)',
        animation: 'spin 420s linear infinite',
        boxShadow: '0 0 80px 30px rgba(180,200,255,0.06)',
      }}
    />
  );
}

// ── DPR adjuster (needed after mount to read window) ─────────────────────────
function DPRSetter({ cap }: { cap: number }) {
  const { gl } = useThree();
  useEffect(() => {
    gl.setPixelRatio(Math.min(window.devicePixelRatio, cap));
  }, [gl, cap]);
  return null;
}

// ── Main exported component ───────────────────────────────────────────────────
export default function MoonSphere() {
  const [hasWebGL, setHasWebGL] = useState<boolean | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const mouseOffset = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const reducedMotion =
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false;

  useEffect(() => {
    setHasWebGL(detectWebGL());
    setIsMobile(window.innerWidth < 768);
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    mouseOffset.current = {
      x: (e.clientX - cx) / (rect.width / 2),
      y: (e.clientY - cy) / (rect.height / 2),
    };
  }, []);

  const handlePointerLeave = useCallback(() => {
    mouseOffset.current = { x: 0, y: 0 };
  }, []);

  // Still determining WebGL support
  if (hasWebGL === null) return null;

  if (!hasWebGL) {
    return <StaticMoonFallback />;
  }

  const dprCap = isMobile ? 1.5 : 2;

  return (
    <div
      ref={containerRef}
      className="w-full h-full"
      aria-hidden="true"
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      style={{
        filter: 'drop-shadow(0 0 60px rgba(180,200,255,0.08))',
      }}
    >
      <Canvas
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
        camera={{ fov: 45, position: [0, 0, 2.8], near: 0.1, far: 10 }}
        style={{ background: 'transparent' }}
      >
        <DPRSetter cap={dprCap} />
        <Scene isMobile={isMobile} reducedMotion={reducedMotion} mouseOffset={mouseOffset} />
      </Canvas>
    </div>
  );
}
