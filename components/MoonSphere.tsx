'use client';

import { Suspense, useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

// ── Suppress the THREE.Clock deprecation noise from R3F v8 internals ──────────
// R3F v8 uses THREE.Clock internally; three.js v0.176+ warns about it but the
// warning is harmless for end users.  We silence only this exact deprecation.
if (typeof window !== 'undefined') {
  const _warn = console.warn.bind(console);
  // Matches: "THREE.Clock: Use THREE.Timer instead." (or similar variants)
  const CLOCK_DEPR_RE = /THREE\..*Clock.*deprecated|THREE\.Clock.*Timer/i;
  console.warn = (...args: unknown[]) => {
    if (typeof args[0] === 'string' && CLOCK_DEPR_RE.test(args[0])) return;
    _warn(...args);
  };
}

// How long (ms) to wait for the WebGL canvas to signal readiness before showing
// the CSS-only fallback permanently
const CANVAS_READY_TIMEOUT_MS = 4000;

// ── Moon mesh ─────────────────────────────────────────────────────────────────
interface MoonMeshProps {
  reducedMotion: boolean;
  mouseOffset: React.MutableRefObject<{ x: number; y: number }>;
}

function MoonMesh({ reducedMotion, mouseOffset }: MoonMeshProps) {
  const groupRef = useRef<THREE.Group>(null);
  const haloRef = useRef<THREE.Mesh>(null);

  const { scene } = useGLTF('/models/moon.glb');
  // Clone the scene so this instance has its own Three.js object graph;
  // required if the component is ever rendered more than once.
  const clonedScene = useMemo(() => scene.clone(true), [scene]);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;

    const t = clock.getElapsedTime();

    if (!reducedMotion) {
      // Slow Y rotation ~7 min per revolution
      groupRef.current.rotation.y = t * 0.015;
      // Gentle float — sinusoidal Y translation (±0.04 units, ~8 s period)
      groupRef.current.position.y = Math.sin(t * (2 * Math.PI / 8)) * 0.04;
    }

    // Subtle tilt toward mouse cursor (±2°)
    const targetX = 0.1 + mouseOffset.current.y * 0.035;
    const targetZ = mouseOffset.current.x * 0.035;
    groupRef.current.rotation.x += (targetX - groupRef.current.rotation.x) * 0.03;
    groupRef.current.rotation.z += (targetZ - groupRef.current.rotation.z) * 0.03;

    if (haloRef.current) {
      haloRef.current.position.y = groupRef.current.position.y;
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

      {/* GLB moon model */}
      <group ref={groupRef} rotation={[0.1, 0, 0]}>
        <primitive object={clonedScene} />
      </group>
    </group>
  );
}

// ── Lighting rig ─────────────────────────────────────────────────────────────
function LightRig() {
  return (
    <>
      {/* Very faint fill to prevent pure-black shadow side */}
      <ambientLight intensity={0.25} />
      {/* Main sunlight — warm, from upper-right-front */}
      <directionalLight position={[5, 3, 5]} intensity={2.0} color="#fffaf0" />
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
  reducedMotion: boolean;
  mouseOffset: React.MutableRefObject<{ x: number; y: number }>;
}

function Scene({ reducedMotion, mouseOffset }: SceneProps) {
  return (
    <>
      <LightRig />
      <Suspense fallback={null}>
        <MoonMesh reducedMotion={reducedMotion} mouseOffset={mouseOffset} />
      </Suspense>
    </>
  );
}

// ── CSS-only static fallback (no WebGL or canvas not ready) ──────────────────
function StaticMoonFallback() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        borderRadius: '50%',
        background: 'radial-gradient(circle at 35% 40%, #8a8a8a, #505050 55%, #222222)',
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
  const [canvasReady, setCanvasReady] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const mouseOffset = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  // Tracks whether the component is still mounted so the context-loss handler
  // never calls setState after unmount.
  const isMountedRef = useRef(true);
  // Stores the cleanup function that removes the webglcontextlost listener.
  const contextLossCleanupRef = useRef<(() => void) | null>(null);

  const reducedMotion =
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false;

  useEffect(() => {
    setHasWebGL(detectWebGL());
    setIsMobile(window.innerWidth < 768);
  }, []);

  // Mark unmounted and remove any pending context-loss listener on teardown.
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      contextLossCleanupRef.current?.();
      contextLossCleanupRef.current = null;
    };
  }, []);

  // Fallback timeout: if canvas hasn't signalled ready after 4 s, permanently show CSS fallback
  useEffect(() => {
    if (canvasReady || timedOut) return;
    const id = setTimeout(() => setTimedOut(true), CANVAS_READY_TIMEOUT_MS);
    return () => clearTimeout(id);
  }, [canvasReady, timedOut]);

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

  // Show Canvas only when WebGL is confirmed available and not timed out
  const showCanvas = hasWebGL === true && !timedOut;

  const dprCap = isMobile ? 1.5 : 2;

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      style={{ position: 'relative', width: '100%', height: '100%' }}
    >
      {/* CSS fallback moon — always rendered until the Canvas signals it's ready */}
      {!canvasReady && <StaticMoonFallback />}

      {/* 3-D canvas — mounted only when WebGL is available and not timed out */}
      {showCanvas && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
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
            style={{ width: '100%', height: '100%', background: 'transparent' }}
            onCreated={(state) => {
              setCanvasReady(true);
              // Revert to CSS fallback if the WebGL context is ever lost.
              // Guard with isMountedRef so we never call setState after unmount.
              const canvas = state.gl.domElement;
              const handleContextLoss = () => {
                if (isMountedRef.current) {
                  setCanvasReady(false);
                  setTimedOut(true);
                }
              };
              canvas.addEventListener('webglcontextlost', handleContextLoss);
              contextLossCleanupRef.current = () =>
                canvas.removeEventListener('webglcontextlost', handleContextLoss);
            }}
          >
            <DPRSetter cap={dprCap} />
            <Scene reducedMotion={reducedMotion} mouseOffset={mouseOffset} />
          </Canvas>
        </div>
      )}
    </div>
  );
}

useGLTF.preload('/models/moon.glb');
