'use client';

import { Suspense, useEffect, useMemo, useRef, useState, Component } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import MoonFallback from './MoonFallback';

const CANVAS_READY_TIMEOUT_MS = 4500;
const MODEL_PATH = '/models/moon.glb';
export const MOON_TEXTURE_PATH = '/textures/moon/moon_color.jpg';
export const EARTH_TEXTURE_PATH = '/textures/earth/earth_day.jpg';

export const TERRAFORM_RADIUS = 0.16;
export const TERRAFORM_SOFTNESS = 0.095;
export const TERRAFORM_DISTORTION_STRENGTH = 0.026;
export const TERRAFORM_RIPPLE_STRENGTH = 0.01;
export const TERRAFORM_RIPPLE_SPEED = 1.35;
export const TERRAFORM_FADE_SPEED = 7.5;
export const TERRAFORM_ENABLED_ON_MOBILE = false;

const TERRAFORM_RIPPLE_FREQUENCY = 38;
const MOON_SCREEN_RADIUS_RATIO = 0.43;
const MOON_EMISSIVE_INTENSITY = 0.08;

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

function prepareColorTexture(texture: THREE.Texture) {
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.anisotropy = 8;
  texture.needsUpdate = true;
  return texture;
}

function useOptionalColorTexture(paths: string[], label: string, enabled = true) {
  const [texture, setTexture] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    if (!enabled) {
      setTexture(null);
      return undefined;
    }

    let cancelled = false;
    let activeTexture: THREE.Texture | null = null;
    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin('anonymous');

    const loadPath = (index: number) => {
      const path = paths[index];
      if (!path) {
        if (process.env.NODE_ENV !== 'production') {
          console.warn(`[MoonSphere] ${label} texture missing; disabling dependent effect.`);
        }
        setTexture(null);
        return;
      }

      loader.load(
        path,
        (loaded) => {
          if (cancelled) {
            loaded.dispose();
            return;
          }
          activeTexture?.dispose();
          activeTexture = prepareColorTexture(loaded);
          setTexture(activeTexture);
        },
        undefined,
        () => {
          if (process.env.NODE_ENV !== 'production') {
            console.warn(`[MoonSphere] ${label} texture failed to load from ${path}.`);
          }
          loadPath(index + 1);
        }
      );
    };

    loadPath(0);

    return () => {
      cancelled = true;
      activeTexture?.dispose();
    };
  }, [enabled, label, paths]);

  return texture;
}

interface MoonPointerState {
  current: THREE.Vector2;
  target: THREE.Vector2;
  reveal: number;
  targetReveal: number;
  enabled: boolean;
}

interface MoonMeshProps {
  reducedMotion: boolean;
  mouseOffset: React.MutableRefObject<{ x: number; y: number }>;
  pointerState: React.MutableRefObject<MoonPointerState>;
  terraformEnabled: boolean;
  onReady: () => void;
}

function TerraformRevealSphere({ reducedMotion, pointerState, enabled }: Pick<MoonMeshProps, 'reducedMotion' | 'pointerState'> & { enabled: boolean }) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const { gl } = useThree();
  const bufferSizeRef = useRef(new THREE.Vector2());
  const earthTexturePaths = useMemo(() => [EARTH_TEXTURE_PATH], []);
  const earthTexture = useOptionalColorTexture(earthTexturePaths, 'Photoreal Earth terraform', enabled);

  const uniforms = useMemo(() => ({
    uEarthMap: { value: earthTexture },
    uTime: { value: 0 },
    uMouse: { value: new THREE.Vector2(0.5, 0.5) },
    uResolution: { value: new THREE.Vector2(1, 1) },
    uReveal: { value: 0 },
    uRadius: { value: TERRAFORM_RADIUS },
    uSoftness: { value: TERRAFORM_SOFTNESS },
    uDistortionStrength: { value: reducedMotion ? 0.004 : TERRAFORM_DISTORTION_STRENGTH },
    uRippleStrength: { value: reducedMotion ? 0 : TERRAFORM_RIPPLE_STRENGTH },
    uRippleFrequency: { value: TERRAFORM_RIPPLE_FREQUENCY },
    uRippleSpeed: { value: reducedMotion ? 0 : TERRAFORM_RIPPLE_SPEED },
    uOpacity: { value: 0.88 },
  }), [earthTexture, reducedMotion]);

  useEffect(() => {
    uniforms.uEarthMap.value = earthTexture;
  }, [earthTexture, uniforms]);

  useFrame((_, delta) => {
    const material = materialRef.current;
    if (!material || !earthTexture) return;

    const pointer = pointerState.current;
    if (!pointer.enabled && pointer.reveal < 0.001 && pointer.targetReveal === 0) {
      material.uniforms.uReveal.value = 0;
      return;
    }

    const fadeAlpha = 1 - Math.exp(-TERRAFORM_FADE_SPEED * delta);
    const mouseAlpha = 1 - Math.exp(-14 * delta);
    pointer.reveal += (pointer.targetReveal - pointer.reveal) * fadeAlpha;
    pointer.current.lerp(pointer.target, mouseAlpha);

    gl.getDrawingBufferSize(bufferSizeRef.current);
    material.uniforms.uResolution.value.copy(bufferSizeRef.current);
    material.uniforms.uMouse.value.copy(pointer.current);
    material.uniforms.uReveal.value = pointer.reveal;
    material.uniforms.uTime.value += reducedMotion ? 0 : delta;
  });

  if (!earthTexture) return null;

  return (
    <mesh scale={1.012} renderOrder={3}>
      <sphereGeometry args={[1, 128, 128]} />
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        vertexShader={`
          varying vec2 vUv;
          varying vec3 vNormal;
          void main() {
            vUv = uv;
            vNormal = normalize(normalMatrix * normal);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          uniform sampler2D uEarthMap;
          uniform float uTime;
          uniform vec2 uMouse;
          uniform vec2 uResolution;
          uniform float uReveal;
          uniform float uRadius;
          uniform float uSoftness;
          uniform float uDistortionStrength;
          uniform float uRippleStrength;
          uniform float uRippleFrequency;
          uniform float uRippleSpeed;
          uniform float uOpacity;
          varying vec2 vUv;
          varying vec3 vNormal;

          float hash(vec2 p) {
            return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
          }

          float noise(vec2 p) {
            vec2 i = floor(p);
            vec2 f = fract(p);
            vec2 u = f * f * (3.0 - 2.0 * f);
            return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
          }

          void main() {
            vec2 frag = gl_FragCoord.xy / uResolution.xy;
            float aspect = uResolution.x / max(uResolution.y, 1.0);
            vec2 delta = vec2((frag.x - uMouse.x) * aspect, frag.y - uMouse.y);
            float dist = length(delta);

            float liquidNoise = noise(vUv * 11.0 + vec2(uTime * 0.16, -uTime * 0.12));
            float edge = uRadius + (liquidNoise - 0.5) * 0.018;
            float mask = 1.0 - smoothstep(edge, edge + uSoftness, dist);
            mask *= smoothstep(0.0, 0.2, vNormal.z);

            float ripple = sin((dist * uRippleFrequency) - (uTime * uRippleSpeed * 6.28318));
            float edgeBand = smoothstep(edge + uSoftness, edge, dist) * smoothstep(edge - 0.13, edge, dist);
            vec2 dir = normalize(delta + vec2(0.0001));
            vec2 uvDistort = dir * (ripple * uRippleStrength * edgeBand + (liquidNoise - 0.5) * uDistortionStrength * mask);
            vec2 tangent = vec2(-dir.y, dir.x);
            vec2 swirl = tangent * sin((dist * 16.0) + uTime * 1.2) * edgeBand;

            vec2 earthUv = vec2(fract(vUv.x + 0.08), vUv.y) + uvDistort + swirl * uDistortionStrength * 0.32;
            vec3 earth = texture2D(uEarthMap, earthUv).rgb;
            earth = mix(earth * 0.7, earth, smoothstep(0.16, 0.82, vNormal.z));
            earth = pow(earth, vec3(1.04));

            float alpha = mask * uReveal * uOpacity;
            if (alpha < 0.003) discard;
            gl_FragColor = vec4(earth, alpha);
          }
        `}
        transparent
        depthWrite={false}
        depthTest
        side={THREE.FrontSide}
      />
    </mesh>
  );
}

function configureMoonMaterial(mat: THREE.MeshStandardMaterial) {
  if (mat.map) {
    mat.map.colorSpace = THREE.SRGBColorSpace;
    mat.map.anisotropy = 8;
    mat.map.needsUpdate = true;
  }

  mat.color.set('#ffffff');
  mat.metalness = 0;
  mat.roughness = 0.9;
  mat.envMapIntensity = 0.2;
  mat.emissive.set('#d8dce6');
  mat.emissiveIntensity = MOON_EMISSIVE_INTENSITY;
  mat.emissiveMap = mat.map ?? null;
  mat.side = THREE.FrontSide;
  mat.transparent = false;
  mat.opacity = 1;
  mat.depthWrite = true;
  mat.dithering = true;
  mat.needsUpdate = true;
}

function MoonMesh({ reducedMotion, mouseOffset, pointerState, terraformEnabled, onReady }: MoonMeshProps) {
  const groupRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF(MODEL_PATH);
  const clonedScene = useMemo(() => {
    const clone = scene.clone(true);

    clone.traverse((child) => {
      if (!('isMesh' in child) || !(child as THREE.Mesh).isMesh) return;
      const mesh = child as THREE.Mesh;
      mesh.castShadow = false;
      mesh.receiveShadow = false;
      mesh.renderOrder = 2;
      const sourceMaterials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      const materials = sourceMaterials.map((material) => material.clone());
      mesh.material = Array.isArray(mesh.material) ? materials : materials[0];
      materials.forEach((m) => {
        const mat = m as THREE.MeshStandardMaterial;
        if (mat?.isMeshStandardMaterial) configureMoonMaterial(mat);
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
      <mesh scale={1.035} renderOrder={0}>
        <sphereGeometry args={[1, 48, 48]} />
        <meshBasicMaterial
          color="#9cc2ff"
          transparent
          opacity={0.025}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.BackSide}
        />
      </mesh>
      <group ref={groupRef} rotation={[0.08, 0, 0]}>
        <primitive object={clonedScene} />
        <TerraformRevealSphere reducedMotion={reducedMotion} pointerState={pointerState} enabled={terraformEnabled} />
      </group>
    </group>
  );
}

function LightRig() {
  return (
    <>
      <ambientLight intensity={0.42} color="#d9e4ff" />
      <hemisphereLight args={['#eef4ff', '#111827', 0.34]} />
      <directionalLight position={[4.8, 3.4, 4.2]} intensity={3.25} color="#fff4df" />
      <directionalLight position={[-3.7, 1.1, 2.6]} intensity={0.36} color="#759fff" />
      <pointLight position={[-2.8, 1.8, -2.8]} intensity={0.28} color="#9dbdff" />
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
  pointerState: React.MutableRefObject<MoonPointerState>;
  terraformEnabled: boolean;
  onModelReady: () => void;
  onModelError: () => void;
}

function Scene({ reducedMotion, mouseOffset, pointerState, terraformEnabled, onModelReady, onModelError }: SceneProps) {
  return (
    <>
      <LightRig />
      <GLBErrorBoundary onError={onModelError}>
        <Suspense fallback={null}>
          <MoonMesh
            reducedMotion={reducedMotion}
            mouseOffset={mouseOffset}
            pointerState={pointerState}
            terraformEnabled={terraformEnabled}
            onReady={onModelReady}
          />
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
    gl.toneMappingExposure = 1.08;
  }, [gl, cap]);
  return null;
}

export default function MoonSphere() {
  const [hasWebGL, setHasWebGL] = useState<boolean | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [canHoverFinePointer, setCanHoverFinePointer] = useState(false);
  const [canvasReady, setCanvasReady] = useState(false);
  const [modelReady, setModelReady] = useState(false);
  const [canvasDisabled, setCanvasDisabled] = useState(false);
  const mouseOffset = useRef({ x: 0, y: 0 });
  const pointerState = useRef<MoonPointerState>({
    current: new THREE.Vector2(0.5, 0.5),
    target: new THREE.Vector2(0.5, 0.5),
    reveal: 0,
    targetReveal: 0,
    enabled: false,
  });
  const containerRef = useRef<HTMLDivElement>(null);
  const rectRef = useRef<DOMRect | null>(null);
  const isMountedRef = useRef(true);
  const contextLossCleanupRef = useRef<(() => void) | null>(null);
  const isInViewRef = useRef(true);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    setHasWebGL(detectWebGL());
    const hoverQuery = window.matchMedia('(hover: hover) and (pointer: fine)');
    const updateViewport = () => {
      setIsMobile(window.innerWidth < 768);
      setCanHoverFinePointer(hoverQuery.matches);
      rectRef.current = containerRef.current?.getBoundingClientRect() ?? null;
    };
    updateViewport();
    hoverQuery.addEventListener('change', updateViewport);
    window.addEventListener('resize', updateViewport, { passive: true });
    return () => {
      hoverQuery.removeEventListener('change', updateViewport);
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
      if (isMountedRef.current && !modelReady) setCanvasDisabled(true);
    }, CANVAS_READY_TIMEOUT_MS);
    return () => window.clearTimeout(id);
  }, [hasWebGL, modelReady, canvasDisabled]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const pointer = pointerState.current;
    const terraformEnabled = !reducedMotion && (canHoverFinePointer || TERRAFORM_ENABLED_ON_MOBILE);
    pointer.enabled = terraformEnabled;

    if (!terraformEnabled) {
      pointer.targetReveal = 0;
      mouseOffset.current = { x: 0, y: 0 };
      return undefined;
    }

    const updateRect = () => {
      rectRef.current = container.getBoundingClientRect();
    };
    updateRect();

    const io = new IntersectionObserver(
      ([entry]) => {
        isInViewRef.current = entry.isIntersecting;
        if (entry.isIntersecting) updateRect();
        else pointer.targetReveal = 0;
      },
      { threshold: 0 }
    );
    io.observe(container);

    const handlePointerMove = (e: PointerEvent) => {
      if (!isInViewRef.current) return;
      const rect = rectRef.current;
      if (!rect) return;
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const nx = (e.clientX - cx) / (rect.width / 2);
      const ny = (e.clientY - cy) / (rect.height / 2);
      mouseOffset.current = { x: nx, y: ny };

      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const diskRadius = Math.min(rect.width, rect.height) * MOON_SCREEN_RADIUS_RATIO;
      const insideDisk = (dx * dx + dy * dy) <= diskRadius * diskRadius;
      pointer.target.set((e.clientX - rect.left) / rect.width, 1 - ((e.clientY - rect.top) / rect.height));
      pointer.targetReveal = insideDisk ? 1 : 0;
      if (!insideDisk) mouseOffset.current = { x: 0, y: 0 };
    };

    const handlePointerLeave = () => {
      pointer.targetReveal = 0;
      mouseOffset.current = { x: 0, y: 0 };
    };

    const handleVisibilityChange = () => {
      if (document.hidden) handlePointerLeave();
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('scroll', updateRect, { passive: true });
    window.addEventListener('blur', handlePointerLeave);
    document.addEventListener('mouseleave', handlePointerLeave);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      io.disconnect();
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('scroll', updateRect);
      window.removeEventListener('blur', handlePointerLeave);
      document.removeEventListener('mouseleave', handlePointerLeave);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      pointer.targetReveal = 0;
    };
  }, [canHoverFinePointer, reducedMotion]);

  const showCanvas = hasWebGL === true && !canvasDisabled;
  const isCanvasVisible = showCanvas && canvasReady && modelReady;
  const dprCap = isMobile ? 1.25 : 1.75;
  const terraformEnabled = !reducedMotion && (canHoverFinePointer || TERRAFORM_ENABLED_ON_MOBILE);

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
              pointerState={pointerState}
              terraformEnabled={terraformEnabled}
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
