'use client';

import { Suspense, useEffect, useMemo, useRef, useState, Component } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import MoonFallback from './MoonFallback';

const CANVAS_READY_TIMEOUT_MS = 4500;
const MODEL_PATH = '/models/moon.glb';

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
    if (process.env.NODE_ENV !== 'production') {
      console.error('[MoonSphere] GLB load failed:', error);
    }
    this.props.onError();
  }
  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}

function usePrefersReducedMotion() {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updatePreference = () => setReducedMotion(mediaQuery.matches);
    updatePreference();
    mediaQuery.addEventListener('change', updatePreference);
    return () => mediaQuery.removeEventListener('change', updatePreference);
  }, []);

  return reducedMotion;
}

interface MoonMeshProps {
  reducedMotion: boolean;
  mouseOffset: React.MutableRefObject<{ x: number; y: number }>;
  onReady: () => void;
}

function MoonMesh({ reducedMotion, mouseOffset, onReady }: MoonMeshProps) {
  const groupRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF(MODEL_PATH);

  const clonedScene = useMemo(() => {
    const clone = scene.clone(true);

    clone.traverse((child) => {
      if (!('isMesh' in child) || !(child as THREE.Mesh).isMesh) return;
      const mesh = child as THREE.Mesh;
      mesh.castShadow = false;
      mesh.receiveShadow = false;
      const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      materials.forEach((m) => {
        const mat = m as THREE.MeshStandardMaterial;
        if (mat?.isMeshStandardMaterial) {
          mat.color.set('#d7dfef');
          mat.metalness = 0;
          mat.roughness = 0.92;
          mat.envMapIntensity = 0.25;
          mat.side = THREE.FrontSide;
          mat.needsUpdate = true;
        }
      });
    });

    const box = new THREE.Box3().setFromObject(clone);
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    if (maxDim > 0) {
      clone.scale.setScalar(1.92 / maxDim);
    }

    const centredBox = new THREE.Box3().setFromObject(clone);
    const centre = centredBox.getCenter(new THREE.Vector3());
    clone.position.sub(centre);

    return clone;
  }, [scene]);

  const onReadyRef = useRef(onReady);
  useEffect(() => { onReadyRef.current = onReady; }, [onReady]);
  const firedRef = useRef(false);
  const readyFramesRef = useRef(0);

  useFrame(({ clock }) => {
    if (!firedRef.current) {
      readyFramesRef.current += 1;
      if (readyFramesRef.current >= 3) {
        firedRef.current = true;
        requestAnimationFrame(() => onReadyRef.current());
      }
    }

    if (!groupRef.current) return;

    const targetX = reducedMotion ? 0.08 : 0.1 + mouseOffset.current.y * 0.03;
    const targetZ = reducedMotion ? 0 : mouseOffset.current.x * 0.03;
    groupRef.current.rotation.x += (targetX - groupRef.current.rotation.x) * 0.035;
    groupRef.current.rotation.z += (targetZ - groupRef.current.rotation.z) * 0.035;

    if (!reducedMotion) {
      groupRef.current.rotation.y = clock.getElapsedTime() * 0.012;
    }
  });

  return (
    <group>
      <mesh scale={1.035}>
        <sphereGeometry args={[1, 48, 48]} />
        <meshBasicMaterial
          color="#9cc2ff"
          transparent
          opacity={0.035}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.BackSide}
        />
      </mesh>
      <group ref={groupRef} rotation={[0.08, 0, 0]}>
        <primitive object={clonedScene} />
      </group>
    </group>
  );
}

function LightRig() {
  return (
    <>
      <ambientLight intensity={0.9} color="#dce7ff" />
      <hemisphereLight args={['#eef4ff', '#17213a', 0.65]} />
      <directionalLight position={[4.8, 3.4, 4.2]} intensity={3.4} color="#fff7e8" />
      <directionalLight position={[-3.5, 0.8, 2.2]} intensity={0.75} color="#7fb1ff" />
      <pointLight position={[-2.8, 1.8, -2.8]} intensity={0.7} color="#a9c8ff" />
    </>
  );
}

function detectWebGL(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    return !!(window.WebGLRenderingContext && context);
  } catch {
    return false;
  }
}

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

function RendererSettings({ cap }: { cap: number }) {
  const { gl } = useThree();
  useEffect(() => {
    gl.setPixelRatio(Math.min(window.devicePixelRatio || 1, cap));
    gl.outputColorSpace = THREE.SRGBColorSpace;
    gl.toneMapping = THREE.ACESFilmicToneMapping;
    gl.toneMappingExposure = 1.18;
  }, [gl, cap]);
  return null;
}

export default function MoonSphere() {
  const [hasWebGL, setHasWebGL] = useState<boolean | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [canvasReady, setCanvasReady] = useState(false);
  const [modelReady, setModelReady] = useState(false);
  const [canvasDisabled, setCanvasDisabled] = useState(false);
  const mouseOffset = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const isMountedRef = useRef(true);
  const contextLossCleanupRef = useRef<(() => void) | null>(null);
  const isInViewRef = useRef(true);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    setHasWebGL(detectWebGL());
    const updateViewport = () => setIsMobile(window.innerWidth < 768);
    updateViewport();
    window.addEventListener('resize', updateViewport, { passive: true });
    return () => window.removeEventListener('resize', updateViewport);
  }, []);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      contextLossCleanupRef.current?.();
      contextLossCleanupRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (modelReady || canvasDisabled || hasWebGL === false) return;
    const id = window.setTimeout(() => {
      if (isMountedRef.current && !modelReady) setCanvasDisabled(true);
    }, CANVAS_READY_TIMEOUT_MS);
    return () => window.clearTimeout(id);
  }, [hasWebGL, modelReady, canvasDisabled]);

  useEffect(() => {
    if (reducedMotion) return;
    const container = containerRef.current;
    if (!container) return;

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
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      io.disconnect();
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [reducedMotion]);

  const showCanvas = hasWebGL === true && !canvasDisabled;
  const isCanvasVisible = showCanvas && canvasReady && modelReady;
  const dprCap = isMobile ? 1.35 : 1.75;

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="relative h-full w-full bg-transparent"
    >
      <MoonFallback isCanvasVisible={isCanvasVisible} />

      {showCanvas && (
        <div
          className="absolute inset-0 bg-transparent"
          style={{
            zIndex: 2,
            opacity: isCanvasVisible ? 1 : 0,
            transform: reducedMotion || isCanvasVisible ? 'translateY(0) scale(1)' : 'translateY(28px) scale(0.98)',
            transition: reducedMotion
              ? 'opacity 450ms ease-in'
              : 'opacity 1000ms cubic-bezier(0.22,1,0.36,1), transform 1000ms cubic-bezier(0.22,1,0.36,1)',
          }}
        >
          <Canvas
            gl={{
              antialias: !isMobile,
              alpha: true,
              powerPreference: isMobile ? 'default' : 'high-performance',
            }}
            camera={{ fov: 45, position: [0, 0, 2.8], near: 0.1, far: 10 }}
            style={{ width: '100%', height: '100%', background: 'transparent' }}
            onCreated={(state) => {
              state.gl.domElement.style.background = 'transparent';
              state.gl.setClearColor(0x000000, 0);
              setCanvasReady(true);
              const canvas = state.gl.domElement;
              const handleContextLoss = (event: Event) => {
                event.preventDefault();
                if (isMountedRef.current) {
                  setCanvasReady(false);
                  setModelReady(false);
                  setCanvasDisabled(true);
                }
              };
              canvas.addEventListener('webglcontextlost', handleContextLoss, false);
              contextLossCleanupRef.current = () =>
                canvas.removeEventListener('webglcontextlost', handleContextLoss, false);
            }}
          >
            <RendererSettings cap={dprCap} />
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
  useGLTF.preload(MODEL_PATH);
}
