'use client';

import { Suspense, useRef, useEffect, useState, useMemo, useCallback, Component } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

// How long (ms) to wait for the WebGL canvas to signal readiness before showing
// the CSS-only fallback permanently
const CANVAS_READY_TIMEOUT_MS = 4000;

// ── Error boundary for GLB load failures ─────────────────────────────────────
interface GLBErrorBoundaryProps {
  children: React.ReactNode;
  onError: () => void;
}
interface GLBErrorBoundaryState { hasError: boolean }

class GLBErrorBoundary extends Component<GLBErrorBoundaryProps, GLBErrorBoundaryState> {
  constructor(props: GLBErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(): GLBErrorBoundaryState {
    return { hasError: true };
  }
  componentDidCatch(error: Error) {
    console.error('[MoonSphere] GLB load failed:', error);
    this.props.onError();
  }
  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}

// ── Moon mesh ─────────────────────────────────────────────────────────────────
interface MoonMeshProps {
  reducedMotion: boolean;
  mouseOffset: React.MutableRefObject<{ x: number; y: number }>;
  onReady: () => void;
}

function MoonMesh({ reducedMotion, mouseOffset, onReady }: MoonMeshProps) {
  const groupRef = useRef<THREE.Group>(null);

  const { scene } = useGLTF('/models/moon.glb');
  // Clone the scene so this instance has its own Three.js object graph;
  // required if the component is ever rendered more than once.
  const clonedScene = useMemo(() => {
    const clone = scene.clone(true);

    // Fix PBR materials: NASA GLB models often have metalness=1.0 which
    // renders black without an env-map. Force diffuse-friendly values.
    // Handle both single-material and multi-material (array) meshes.
    clone.traverse((child) => {
      if (!('isMesh' in child) || !(child as THREE.Mesh).isMesh) return;
      const mesh = child as THREE.Mesh;
      const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      materials.forEach((m) => {
        const mat = m as THREE.MeshStandardMaterial;
        if (mat && mat.isMeshStandardMaterial) {
          mat.metalness = 0.0;
          mat.roughness = 1.0;
          mat.envMapIntensity = 0.0;
          mat.side = THREE.FrontSide;
          mat.needsUpdate = true;
        }
      });
    });

    // Auto-scale: normalise the model to ~2 units diameter so it fills the
    // camera frustum (fov 45, z=2.8 → roughly 2 units fits perfectly).
    const box = new THREE.Box3().setFromObject(clone);
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    if (maxDim > 0) {
      const targetScale = 2.0 / maxDim;
      clone.scale.setScalar(targetScale);
    }

    // Re-centre after scaling: recompute box (scale changes extents) and
    // shift the model so its bounding-box centre sits exactly at (0,0,0).
    const centredBox = new THREE.Box3().setFromObject(clone);
    const centre = centredBox.getCenter(new THREE.Vector3());
    clone.position.sub(centre);

    return clone;
  }, [scene]);

  // Signal to parent that the GLB model is loaded and the first frame has
  // been committed — this is when the CSS static fallback can safely be
  // hidden.  We store onReady in a ref so the empty-dep effect fires exactly
  // once on mount without triggering the exhaustive-deps lint rule.
  const onReadyRef = useRef(onReady);
  useEffect(() => { onReadyRef.current(); }, []);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;

    const t = clock.getElapsedTime();

    if (!reducedMotion) {
      // Slow Y rotation ~7 min per revolution
      groupRef.current.rotation.y = t * 0.015;
    }

    // Subtle tilt toward mouse cursor (±2°)
    const targetX = 0.1 + mouseOffset.current.y * 0.035;
    const targetZ = mouseOffset.current.x * 0.035;
    groupRef.current.rotation.x += (targetX - groupRef.current.rotation.x) * 0.03;
    groupRef.current.rotation.z += (targetZ - groupRef.current.rotation.z) * 0.03;
  });

  return (
    <group>
      {/* Atmospheric halo — thin ring, very faint additive blending */}
      <mesh scale={1.02}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial
          color="#8ab4ff"
          transparent
          opacity={0.012}
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
      <ambientLight intensity={0.4} />
      {/* Hemisphere light for natural sky/ground fill */}
      <hemisphereLight args={['#c8d8ff', '#1a1a2e', 0.3]} />
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
  onModelReady: () => void;
  onModelError: () => void;
}

function Scene({ reducedMotion, mouseOffset, onModelReady, onModelError }: SceneProps) {
  return (
    <>
      <LightRig />
      <GLBErrorBoundary onError={onModelError}>
        <Suspense fallback={null}>
          <MoonMesh reducedMotion={reducedMotion} mouseOffset={mouseOffset} onReady={onModelReady} />
        </Suspense>
      </GLBErrorBoundary>
    </>
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
  const [modelReady, setModelReady] = useState(false);
  const [canvasDisabled, setCanvasDisabled] = useState(false);
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

  // Disable canvas after 4 s if it hasn't signalled ready — prevents a blank
  // viewport on devices where WebGL initialises but never completes.
  useEffect(() => {
    if (canvasReady || canvasDisabled) return;
    const id = setTimeout(() => setCanvasDisabled(true), CANVAS_READY_TIMEOUT_MS);
    return () => clearTimeout(id);
  }, [canvasReady, canvasDisabled]);

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

  // Show Canvas only when WebGL is confirmed available and not permanently disabled
  const showCanvas = hasWebGL === true && !canvasDisabled;

  const dprCap = isMobile ? 1.5 : 2;

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      style={{ position: 'relative', width: '100%', height: '100%' }}
    >
      {/* 3-D canvas — mounted only when WebGL is available and canvas is not disabled */}
      {showCanvas && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 2,
            opacity: canvasReady && modelReady ? 1 : 0,
            transition: 'opacity 200ms ease-in',
            filter: 'drop-shadow(0 0 40px rgba(180,200,255,0.04))',
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
                  setCanvasDisabled(true);
                }
              };
              canvas.addEventListener('webglcontextlost', handleContextLoss);
              contextLossCleanupRef.current = () =>
                canvas.removeEventListener('webglcontextlost', handleContextLoss);
            }}
          >
            <DPRSetter cap={dprCap} />
            <Scene
              reducedMotion={reducedMotion}
              mouseOffset={mouseOffset}
              onModelReady={() => setModelReady(true)}
              onModelError={() => setCanvasDisabled(true)}
            />
          </Canvas>
        </div>
      )}
    </div>
  );
}

useGLTF.preload('/models/moon.glb');
