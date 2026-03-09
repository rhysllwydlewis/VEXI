'use client';

import { Suspense, useRef, useEffect, useState, useMemo, Component } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

// How long (ms) to wait for the WebGL canvas to signal readiness before showing
// the CSS-only fallback permanently
const CANVAS_READY_TIMEOUT_MS = 4000;

// ─────────────────────────────────────────────────────────────────────────────
// Feature flag: set to `true` to re-enable mouse-driven tilt on the moon.
// All interaction logic is preserved below; only the event wiring is gated.
// ─────────────────────────────────────────────────────────────────────────────
const MOUSE_INTERACTION_ENABLED = false;

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

  // Signal to parent that the first WebGL frame has been drawn — this is
  // the correct moment to reveal the canvas so no blank/unrendered frames
  // are ever visible.  useFrame fires inside rAF, guaranteeing at least
  // one full render has completed before the parent's state updates.
  const onReadyRef = useRef(onReady);
  // Keep the ref current on every render so the useFrame closure never
  // captures a stale version of onReady (standard "event-handler ref" pattern).
  useEffect(() => { onReadyRef.current = onReady; }, [onReady]);
  const firedRef = useRef(false);
  // Count rendered frames before signalling ready.  useFrame fires BEFORE
  // the WebGL draw calls for the current frame, so frame 1's draw hasn't
  // happened yet when useFrame first fires.  Waiting 3 frames guarantees
  // at least 2 complete WebGL draw+composite cycles have occurred, ensuring
  // the moon is fully painted before the parent changes visibility to 'visible'.
  const readyFramesRef = useRef(0);

  useFrame(({ clock }) => {
    // Gate the ready signal behind 3 rendered frames, then schedule it
    // one additional rAF later so the browser has composited the WebGL
    // content before React commits the visibility change.
    if (!firedRef.current) {
      readyFramesRef.current += 1;
      if (readyFramesRef.current >= 3) {
        firedRef.current = true;
        requestAnimationFrame(() => onReadyRef.current());
      }
    }

    if (!groupRef.current) return;

    const t = clock.getElapsedTime();

    if (!reducedMotion) {
      // Realistic Y rotation: ~35 min per revolution (real Moon ≈ 27.3 days,
      // scaled to remain visually perceptible without feeling frantic).
      groupRef.current.rotation.y = t * 0.003;
    }

    // Subtle tilt toward mouse cursor (±2°) — active only when MOUSE_INTERACTION_ENABLED.
    // When disabled, the tilt settles to the natural axial-tilt resting position
    // (x ≈ 0.1 rad ≈ 5.7°, approximating the Moon's real ~6.7° axial tilt).
    const targetX = 0.1 + (MOUSE_INTERACTION_ENABLED ? mouseOffset.current.y * 0.035 : 0);
    const targetZ = MOUSE_INTERACTION_ENABLED ? mouseOffset.current.x * 0.035 : 0;
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
          opacity={0.020}
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
      <ambientLight intensity={0.28} />
      {/* Hemisphere light for natural sky/ground fill */}
      <hemisphereLight args={['#c8d8ff', '#1a1a2e', 0.3]} />
      {/* Main sunlight — warm, from upper-right-front */}
      <directionalLight position={[5, 3, 5]} intensity={2.0} color="#fffaf0" />
      {/* Earthshine — faint blue on shadow side */}
      <pointLight position={[-4, -2, -3]} intensity={0.06} color="#4488cc" />
      {/* Rim light to separate moon from dark background */}
      <pointLight position={[-2, 1, -4]} intensity={0.20} color="#aaccff" />
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
  // True while the moon container is in the viewport — used to skip the
  // getBoundingClientRect() call on every mousemove when off-screen.
  const isInViewRef = useRef(true);

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

  // Track mouse globally so the tilt works even when the moon container
  // inherits `pointer-events: none` from its Hero wrapper.
  // Skip the layout-read (getBoundingClientRect) while off-screen.
  // Guarded by MOUSE_INTERACTION_ENABLED — set that flag to `true` to re-enable.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // IntersectionObserver: pause rect reads when moon scrolls out of view.
    const io = new IntersectionObserver(
      ([entry]) => { isInViewRef.current = entry.isIntersecting; },
      { threshold: 0 }
    );
    io.observe(container);

    const handleMouseMove = (e: MouseEvent) => {
      if (!isInViewRef.current) return;
      const rect = container.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      mouseOffset.current = {
        x: (e.clientX - cx) / (rect.width / 2),
        y: (e.clientY - cy) / (rect.height / 2),
      };
    };
    const handleMouseLeave = () => {
      mouseOffset.current = { x: 0, y: 0 };
    };

    // Only register mouse listeners when the feature is enabled.
    if (MOUSE_INTERACTION_ENABLED) {
      window.addEventListener('mousemove', handleMouseMove, { passive: true });
      document.addEventListener('mouseleave', handleMouseLeave);
    }

    return () => {
      io.disconnect();
      if (MOUSE_INTERACTION_ENABLED) {
        window.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, []);

  // Show Canvas only when WebGL is confirmed available and not permanently disabled
  const showCanvas = hasWebGL === true && !canvasDisabled;

  const dprCap = isMobile ? 1.5 : 2;

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      style={{ position: 'relative', width: '100%', height: '100%', background: 'transparent' }}
    >
      {/* CSS moon placeholder — shown while the 3D model loads, or permanently
          when WebGL is unavailable. Fades out once the WebGL scene is painted.
          The gradient direction (upper-right bright, lower-left dark) matches
          the directionalLight at [5, 3, 5] in the 3D lighting rig. */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: canvasReady && modelReady ? 0 : 1,
          transition: reducedMotion ? 'none' : 'opacity 600ms ease-out',
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            width: '88%',
            height: '88%',
            borderRadius: '50%',
            background:
              'radial-gradient(ellipse at 62% 38%, #bdc1c9 0%, #8e929a 28%, #5a5e66 58%, #28292f 100%)',
            boxShadow:
              '0 0 80px 20px rgba(155,170,210,0.07), 0 0 14px 3px rgba(140,160,200,0.10)',
          }}
        />
      </div>

      {/* 3-D canvas — mounted only when WebGL is available and canvas is not disabled */}
      {showCanvas && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 2,
            background: 'transparent',
            // visibility:hidden prevents the browser from painting or compositing
            // this element at all until the WebGL scene is ready, eliminating the
            // intermittent white flash caused by the canvas element's default
            // background being briefly visible before WebGL clears it.
            visibility: canvasReady && modelReady ? 'visible' : 'hidden',
            opacity: canvasReady && modelReady ? 1 : 0,
            transform: reducedMotion
              ? 'none'
              : canvasReady && modelReady
                ? 'translateY(0px) scale(1)'
                : 'translateY(52px) scale(0.96)',
            transition: reducedMotion
              ? 'opacity 400ms ease-in'
              : 'opacity 1400ms cubic-bezier(0.22,1,0.36,1), transform 1400ms cubic-bezier(0.22,1,0.36,1)',
            // Note: the drop-shadow filter was removed — at 4% opacity it is
            // imperceptible, and CSS filters force a new GPU compositor layer
            // which some browsers initialise with white before WebGL content
            // is painted, contributing to the intermittent white flash.
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
              // Ensure the actual <canvas> DOM element is transparent — R3F forwards
              // the `style` prop to its wrapper div, not the canvas element itself,
              // so we must set transparency directly on the canvas to prevent a
              // white flash while the WebGL context initialises.
              state.gl.domElement.style.background = 'transparent';
              // Explicitly clear to transparent black so the first rendered frame
              // never shows an opaque colour before scene geometry is drawn.
              state.gl.setClearColor(0x000000, 0);
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

if (typeof window !== 'undefined') {
  useGLTF.preload('/models/moon.glb');
}
