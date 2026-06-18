'use client';

import { Component, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import MoonFallback from './MoonFallback';

const CANVAS_READY_TIMEOUT_MS = 20000;
const MODEL_PATH = '/models/moon.glb';
export const MOON_TEXTURE_PATH = '/textures/moon/moon_color.jpg';
export const EARTH_TEXTURE_PATH = '/textures/earth/earth_day.jpg';

// Kept as public exports for backwards compatibility with older moon/terraform tests.
export const TERRAFORM_RADIUS = 0.16;
export const TERRAFORM_SOFTNESS = 0.095;
export const TERRAFORM_DISTORTION_STRENGTH = 0.026;
export const TERRAFORM_RIPPLE_STRENGTH = 0.01;
export const TERRAFORM_RIPPLE_SPEED = 1.35;
export const TERRAFORM_FADE_SPEED = 7.5;
export const TERRAFORM_ENABLED_ON_MOBILE = false;

const MOON_MODEL_SCALE = 1.92;
const MOON_ROTATION_SPEED = 0.035;
const MOON_TEXTURE_ANISOTROPY = 16;
const MOBILE_BREAKPOINT = 768;
const DPR_CAP_MOBILE = 1.5;
const DPR_CAP_DESKTOP = 2;
const TEXTURE_KEYS = ['map', 'emissiveMap', 'roughnessMap', 'normalMap', 'metalnessMap', 'aoMap'] as const;

interface GLBErrorBoundaryProps {
  children: React.ReactNode;
  onError: () => void;
}

interface GLBErrorBoundaryState {
  hasError: boolean;
}

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
      console.error('[MoonSphere] NASA GLB model failed to render:', error);
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

function prepareTexture(texture: THREE.Texture | null | undefined) {
  if (!texture) return;

  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = MOON_TEXTURE_ANISOTROPY;
  texture.needsUpdate = true;
}

function prepareMaterialTextureMaps(material: THREE.Material) {
  const materialRecord = material as THREE.Material & Partial<Record<(typeof TEXTURE_KEYS)[number], unknown>>;

  TEXTURE_KEYS.forEach((key) => {
    const candidate = materialRecord[key];
    if (candidate instanceof THREE.Texture) {
      prepareTexture(candidate);
    }
  });
}

function configureMaterial(material: THREE.Material) {
  material.side = THREE.FrontSide;
  material.transparent = false;
  material.opacity = 1;
  material.depthWrite = true;
  material.depthTest = true;
  material.needsUpdate = true;

  prepareMaterialTextureMaps(material);

  const materialWithColor = material as THREE.Material & { color?: unknown };
  if (materialWithColor.color instanceof THREE.Color) {
    materialWithColor.color.set('#ffffff');
  }

  if (material instanceof THREE.MeshStandardMaterial) {
    material.metalness = 0;
    material.roughness = 0.84;
    material.envMapIntensity = 0.06;
    material.emissive.set('#05070d');
    material.emissiveIntensity = 0.035;
    material.dithering = true;
    material.needsUpdate = true;
  }
}

interface MoonModelProps {
  reducedMotion: boolean;
  onReady: () => void;
}

function MoonModel({ reducedMotion, onReady }: MoonModelProps) {
  const groupRef = useRef<THREE.Group>(null);
  const onReadyRef = useRef(onReady);
  const firedReadyRef = useRef(false);
  const readyFramesRef = useRef(0);
  const { scene } = useGLTF(MODEL_PATH);

  useEffect(() => {
    onReadyRef.current = onReady;
  }, [onReady]);

  const clonedScene = useMemo(() => {
    const clone = scene.clone(true);

    clone.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;

      child.castShadow = false;
      child.receiveShadow = false;
      child.renderOrder = 2;

      const sourceMaterials = Array.isArray(child.material) ? child.material : [child.material];
      const materials = sourceMaterials.map((material) => material.clone());
      child.material = Array.isArray(child.material) ? materials : materials[0];
      materials.forEach(configureMaterial);
    });

    const box = new THREE.Box3().setFromObject(clone);
    const size = box.getSize(new THREE.Vector3());
    const maxDimension = Math.max(size.x, size.y, size.z);

    if (maxDimension > 0) {
      clone.scale.setScalar(MOON_MODEL_SCALE / maxDimension);
    }

    const centredBox = new THREE.Box3().setFromObject(clone);
    const centre = centredBox.getCenter(new THREE.Vector3());
    clone.position.sub(centre);

    return clone;
  }, [scene]);

  useFrame(({ clock }) => {
    if (!firedReadyRef.current) {
      readyFramesRef.current += 1;
      if (readyFramesRef.current >= 3) {
        firedReadyRef.current = true;
        requestAnimationFrame(() => onReadyRef.current());
      }
    }

    if (!groupRef.current || reducedMotion) return;

    groupRef.current.rotation.y = clock.getElapsedTime() * MOON_ROTATION_SPEED;
  });

  return (
    <group ref={groupRef} rotation={[0.08, 0, 0]}>
      <mesh scale={1.035} renderOrder={0}>
        <sphereGeometry args={[1, 64, 64]} />
        <meshBasicMaterial
          color="#9cc2ff"
          transparent
          opacity={0.018}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.BackSide}
        />
      </mesh>
      <primitive object={clonedScene} />
    </group>
  );
}

function LightRig() {
  return (
    <>
      <ambientLight intensity={0.24} color="#dce7ff" />
      <hemisphereLight args={['#f2f7ff', '#101827', 0.18]} />
      <directionalLight position={[4.8, 3.4, 4.2]} intensity={4.1} color="#fff4df" />
      <directionalLight position={[-3.7, 1.1, 2.6]} intensity={0.18} color="#759fff" />
      <pointLight position={[-2.8, 1.8, -2.8]} intensity={0.14} color="#9dbdff" />
    </>
  );
}

interface SceneProps {
  reducedMotion: boolean;
  onModelReady: () => void;
  onModelError: () => void;
}

function Scene({ reducedMotion, onModelReady, onModelError }: SceneProps) {
  return (
    <>
      <LightRig />
      <GLBErrorBoundary onError={onModelError}>
        <Suspense fallback={null}>
          <MoonModel reducedMotion={reducedMotion} onReady={onModelReady} />
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
    gl.toneMappingExposure = 0.94;
  }, [gl, cap]);

  return null;
}

export default function MoonSphere() {
  const [hasWebGL, setHasWebGL] = useState<boolean | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [canvasReady, setCanvasReady] = useState(false);
  const [modelReady, setModelReady] = useState(false);
  const [canvasDisabled, setCanvasDisabled] = useState(false);
  const isMountedRef = useRef(true);
  const contextLossCleanupRef = useRef<(() => void) | null>(null);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    setHasWebGL(detectWebGL());

    const updateViewport = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };

    updateViewport();
    window.addEventListener('resize', updateViewport, { passive: true });

    return () => {
      window.removeEventListener('resize', updateViewport);
    };
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
      if (process.env.NODE_ENV !== 'production' && isMountedRef.current && !modelReady) {
        console.warn('[MoonSphere] NASA moon model is still loading; keeping fallback visible while WebGL continues.');
      }
    }, CANVAS_READY_TIMEOUT_MS);

    return () => window.clearTimeout(id);
  }, [canvasDisabled, hasWebGL, modelReady]);

  const showCanvas = hasWebGL === true && !canvasDisabled;
  const isCanvasVisible = showCanvas && canvasReady && modelReady;
  const dprCap = isMobile ? DPR_CAP_MOBILE : DPR_CAP_DESKTOP;

  return (
    <div aria-hidden="true" className="relative h-full w-full bg-transparent">
      <MoonFallback isCanvasVisible={isCanvasVisible} />

      {showCanvas && (
        <div
          className="absolute inset-0 bg-transparent"
          style={{
            zIndex: 2,
            opacity: isCanvasVisible ? 1 : 0,
            transform: reducedMotion || isCanvasVisible ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.985)',
            transition: reducedMotion
              ? 'opacity 350ms ease-in'
              : 'opacity 900ms cubic-bezier(0.22,1,0.36,1), transform 900ms cubic-bezier(0.22,1,0.36,1)',
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
