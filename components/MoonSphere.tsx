'use client';

import { Component, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import MoonFallback from './MoonFallback';

const CANVAS_READY_TIMEOUT_MS = 20000;
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

const MOBILE_BREAKPOINT = 768;
const DPR_CAP_MOBILE = 1.5;
const DPR_CAP_DESKTOP = 2;
const MOON_ROTATION_SPEED = 0.026;
const MOON_INITIAL_Y_ROTATION = -0.54;
const MOON_TEXTURE_ANISOTROPY = 16;

interface MoonRenderErrorBoundaryProps {
  children: React.ReactNode;
  onError: () => void;
}

interface MoonRenderErrorBoundaryState {
  hasError: boolean;
}

class MoonRenderErrorBoundary extends Component<MoonRenderErrorBoundaryProps, MoonRenderErrorBoundaryState> {
  constructor(props: MoonRenderErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): MoonRenderErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('[MoonSphere] Hero moon WebGL render failed:', error);
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

function prepareLunarTexture(texture: THREE.Texture, maxAnisotropy: number) {
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = true;
  texture.anisotropy = Math.min(MOON_TEXTURE_ANISOTROPY, Math.max(1, maxAnisotropy));
  texture.needsUpdate = true;
}

function RendererSettings({ cap }: { cap: number }) {
  const { gl } = useThree();

  useEffect(() => {
    gl.setPixelRatio(Math.min(window.devicePixelRatio || 1, cap));
    gl.outputColorSpace = THREE.SRGBColorSpace;
    gl.toneMapping = THREE.NoToneMapping;
    gl.setClearColor(0x000000, 0);
  }, [gl, cap]);

  return null;
}

function MoonAtmosphere() {
  return (
    <group>
      <mesh scale={1.035} renderOrder={0}>
        <sphereGeometry args={[1, 96, 96]} />
        <meshBasicMaterial
          color="#93c5fd"
          transparent
          opacity={0.028}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.BackSide}
        />
      </mesh>
      <mesh scale={1.075} renderOrder={0}>
        <sphereGeometry args={[1, 96, 96]} />
        <meshBasicMaterial
          color="#60a5fa"
          transparent
          opacity={0.014}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  );
}

interface MoonSurfaceProps {
  reducedMotion: boolean;
  onReady: () => void;
}

function MoonSurface({ reducedMotion, onReady }: MoonSurfaceProps) {
  const groupRef = useRef<THREE.Group>(null);
  const surfaceRef = useRef<THREE.Mesh>(null);
  const readyFramesRef = useRef(0);
  const firedReadyRef = useRef(false);
  const onReadyRef = useRef(onReady);
  const { gl } = useThree();
  const lunarTexture = useTexture(MOON_TEXTURE_PATH);

  useEffect(() => {
    onReadyRef.current = onReady;
  }, [onReady]);

  useEffect(() => {
    prepareLunarTexture(lunarTexture, gl.capabilities.getMaxAnisotropy());
  }, [gl, lunarTexture]);

  const uniforms = useMemo(
    () => ({
      uMap: { value: lunarTexture },
    }),
    [lunarTexture]
  );

  useEffect(() => {
    uniforms.uMap.value = lunarTexture;
  }, [lunarTexture, uniforms]);

  useFrame(({ clock }) => {
    if (!firedReadyRef.current) {
      readyFramesRef.current += 1;
      if (readyFramesRef.current >= 3) {
        firedReadyRef.current = true;
        requestAnimationFrame(() => onReadyRef.current());
      }
    }

    if (!groupRef.current) return;

    groupRef.current.rotation.y = reducedMotion
      ? MOON_INITIAL_Y_ROTATION
      : MOON_INITIAL_Y_ROTATION + clock.getElapsedTime() * MOON_ROTATION_SPEED;
  });

  return (
    <group ref={groupRef} rotation={[0.08, MOON_INITIAL_Y_ROTATION, 0]}>
      <MoonAtmosphere />
      <mesh ref={surfaceRef} renderOrder={2}>
        <sphereGeometry args={[1, 192, 192]} />
        <shaderMaterial
          uniforms={uniforms}
          vertexShader={`
            varying vec2 vUv;
            varying vec3 vViewNormal;

            void main() {
              vUv = uv;
              vViewNormal = normalize(normalMatrix * normal);
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `}
          fragmentShader={`
            uniform sampler2D uMap;
            varying vec2 vUv;
            varying vec3 vViewNormal;

            void main() {
              vec3 lunar = texture2D(uMap, vUv).rgb;

              // Lift the real lunar albedo so it reads as a detailed photographic
              // moon behind the text, rather than a flat black/grey disk.
              lunar = pow(lunar, vec3(0.86));
              lunar = (lunar - 0.5) * 1.30 + 0.5;
              lunar *= vec3(1.08, 1.08, 1.12);
              lunar = clamp(lunar, 0.0, 1.0);

              float face = clamp(vViewNormal.z, 0.0, 1.0);
              float limbShade = pow(1.0 - face, 1.55) * 0.22;
              float leftShade = smoothstep(-0.15, 0.95, -vViewNormal.x) * 0.10;
              float upperLift = smoothstep(-0.45, 0.85, vViewNormal.y) * 0.04;
              float shade = clamp(1.0 - limbShade - leftShade + upperLift, 0.70, 1.12);

              gl_FragColor = vec4(lunar * shade, 1.0);
            }
          `}
          depthWrite
          depthTest
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

interface MoonSceneProps {
  reducedMotion: boolean;
  onReady: () => void;
  onError: () => void;
}

function MoonScene({ reducedMotion, onReady, onError }: MoonSceneProps) {
  return (
    <MoonRenderErrorBoundary onError={onError}>
      <Suspense fallback={null}>
        <MoonSurface reducedMotion={reducedMotion} onReady={onReady} />
      </Suspense>
    </MoonRenderErrorBoundary>
  );
}

export default function MoonSphere() {
  const [hasWebGL, setHasWebGL] = useState<boolean | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [canvasReady, setCanvasReady] = useState(false);
  const [surfaceReady, setSurfaceReady] = useState(false);
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
    if (surfaceReady || canvasDisabled || hasWebGL === false) return;

    const id = window.setTimeout(() => {
      if (process.env.NODE_ENV !== 'production' && isMountedRef.current && !surfaceReady) {
        console.warn('[MoonSphere] Lunar texture is still loading; keeping fallback visible while WebGL continues.');
      }
    }, CANVAS_READY_TIMEOUT_MS);

    return () => window.clearTimeout(id);
  }, [canvasDisabled, hasWebGL, surfaceReady]);

  const showCanvas = hasWebGL === true && !canvasDisabled;
  const isCanvasVisible = showCanvas && canvasReady && surfaceReady;
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
            dpr={[1, dprCap]}
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
                  setSurfaceReady(false);
                  setCanvasDisabled(true);
                }
              };

              canvas.addEventListener('webglcontextlost', handleContextLoss, false);
              contextLossCleanupRef.current = () =>
                canvas.removeEventListener('webglcontextlost', handleContextLoss, false);
            }}
          >
            <RendererSettings cap={dprCap} />
            <MoonScene
              reducedMotion={reducedMotion}
              onReady={() => setSurfaceReady(true)}
              onError={() => setCanvasDisabled(true)}
            />
          </Canvas>
        </div>
      )}
    </div>
  );
}

if (typeof window !== 'undefined') {
  useTexture.preload(MOON_TEXTURE_PATH);
}
