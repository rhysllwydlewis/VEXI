'use client';

import { Suspense, useEffect, useMemo, useRef, useState, Component } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import MoonFallback from './MoonFallback';

const CANVAS_READY_TIMEOUT_MS = 4500;
const MODEL_PATH = '/models/moon.glb';
const MOON_TEXTURE_PATH = '/textures/moon/moon_color.jpg';
const EARTH_TEXTURE_PATH = '/textures/earth/earth_color.jpg';
const USE_OPTIONAL_EARTH_TEXTURE = false;

export const TERRAFORM_RADIUS = 0.16;
export const TERRAFORM_SOFTNESS = 0.095;
export const TERRAFORM_DISTORTION_STRENGTH = 0.035;
export const TERRAFORM_RIPPLE_STRENGTH = 0.014;
export const TERRAFORM_RIPPLE_SPEED = 1.55;
export const TERRAFORM_FADE_SPEED = 7.5;
export const TERRAFORM_ENABLED_ON_MOBILE = false;

const TERRAFORM_RIPPLE_FREQUENCY = 42;
const MOON_SCREEN_RADIUS_RATIO = 0.43;

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

function seededRandom(seed: number) {
  let value = seed;
  return () => {
    value = (value * 1664525 + 1013904223) % 4294967296;
    return value / 4294967296;
  };
}

// Runtime-generated textures keep the hero readable if an image request fails; checked-in assets are still preferred.
function makeGeneratedTexture(kind: 'moon' | 'earth') {
  const canvas = document.createElement('canvas');
  canvas.width = kind === 'earth' ? 1024 : 512;
  canvas.height = kind === 'earth' ? 512 : 512;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.Texture();
  const random = seededRandom(kind === 'earth' ? 22051972 : 19690720);

  if (kind === 'earth') {
    const ocean = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    ocean.addColorStop(0, '#063c88');
    ocean.addColorStop(0.45, '#0d6faf');
    ocean.addColorStop(1, '#092d68');
    ctx.fillStyle = ocean;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(45, 150, 84, 0.9)';
    const continents = [
      'M75 190 C145 120 220 125 265 185 C305 235 245 300 160 295 C92 290 35 245 75 190Z',
      'M360 115 C455 70 540 125 520 205 C505 270 410 260 350 220 C305 190 305 142 360 115Z',
      'M480 300 C565 260 645 310 620 390 C595 470 500 460 455 405 C420 360 425 322 480 300Z',
      'M705 150 C810 92 945 130 965 240 C985 350 850 390 750 325 C670 274 635 195 705 150Z',
      'M780 390 C855 360 930 405 920 465 C850 500 760 490 735 445 C720 420 735 400 780 390Z',
    ];
    continents.forEach((path) => {
      ctx.fill(new Path2D(path));
      ctx.fillStyle = 'rgba(124, 170, 78, 0.88)';
    });
    ctx.fillStyle = 'rgba(232, 220, 160, 0.45)';
    ctx.fill(new Path2D('M675 205 C750 170 855 185 895 255 C820 260 755 245 675 205Z'));
    ctx.strokeStyle = 'rgba(255,255,255,0.34)';
    ctx.lineWidth = 18;
    for (let i = 0; i < 10; i += 1) {
      ctx.beginPath();
      ctx.ellipse(120 + i * 110, 110 + ((i % 3) * 95), 120, 18, (i * 0.55), 0, Math.PI * 2);
      ctx.stroke();
    }
  } else {
    const base = ctx.createRadialGradient(180, 140, 20, 260, 260, 360);
    base.addColorStop(0, '#eef3ff');
    base.addColorStop(0.42, '#aeb9cf');
    base.addColorStop(0.78, '#4b556f');
    base.addColorStop(1, '#141a2a');
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < 80; i += 1) {
      const x = random() * canvas.width;
      const y = random() * canvas.height;
      const r = 4 + random() * 24;
      ctx.fillStyle = `rgba(${30 + random() * 60}, ${35 + random() * 55}, ${55 + random() * 55}, ${0.16 + random() * 0.22})`;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.anisotropy = 4;
  return texture;
}

function useTextureWithFallback(path: string | null, kind: 'moon' | 'earth') {
  const fallback = useMemo(() => makeGeneratedTexture(kind), [kind]);
  const [texture, setTexture] = useState<THREE.Texture>(fallback);

  useEffect(() => {
    if (!path) {
      setTexture(fallback);
      return;
    }

    let cancelled = false;
    const loader = new THREE.TextureLoader();
    loader.load(
      path,
      (loaded) => {
        if (cancelled) {
          loaded.dispose();
          return;
        }
        loaded.colorSpace = THREE.SRGBColorSpace;
        loaded.wrapS = THREE.RepeatWrapping;
        loaded.wrapT = THREE.ClampToEdgeWrapping;
        loaded.anisotropy = 8;
        loaded.needsUpdate = true;
        setTexture(loaded);
      },
      undefined,
      () => {
        if (process.env.NODE_ENV !== 'production') {
          console.warn(`[MoonSphere] ${path} failed to load; using generated ${kind} texture fallback.`);
        }
      }
    );
    return () => { cancelled = true; };
  }, [fallback, kind, path]);

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
  onReady: () => void;
}

function TerraformRevealSphere({ reducedMotion, pointerState }: Pick<MoonMeshProps, 'reducedMotion' | 'pointerState'>) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const { gl } = useThree();
  const bufferSizeRef = useRef(new THREE.Vector2());
  const earthTexture = useTextureWithFallback(USE_OPTIONAL_EARTH_TEXTURE ? EARTH_TEXTURE_PATH : null, 'earth');

  const uniforms = useMemo(() => ({
    uEarthMap: { value: earthTexture },
    uTime: { value: 0 },
    uMouse: { value: new THREE.Vector2(0.5, 0.5) },
    uResolution: { value: new THREE.Vector2(1, 1) },
    uReveal: { value: 0 },
    uRadius: { value: TERRAFORM_RADIUS },
    uSoftness: { value: TERRAFORM_SOFTNESS },
    uDistortionStrength: { value: reducedMotion ? 0.006 : TERRAFORM_DISTORTION_STRENGTH },
    uRippleStrength: { value: reducedMotion ? 0 : TERRAFORM_RIPPLE_STRENGTH },
    uRippleFrequency: { value: TERRAFORM_RIPPLE_FREQUENCY },
    uRippleSpeed: { value: reducedMotion ? 0 : TERRAFORM_RIPPLE_SPEED },
  }), [earthTexture, reducedMotion]);

  useEffect(() => {
    uniforms.uEarthMap.value = earthTexture;
  }, [earthTexture, uniforms]);

  useFrame((_, delta) => {
    const material = materialRef.current;
    if (!material) return;

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

  return (
    <mesh scale={1.012} renderOrder={3}>
      <sphereGeometry args={[1, 96, 96]} />
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
            float liquidNoise = noise(vUv * 12.0 + vec2(uTime * 0.18, -uTime * 0.13));
            float edge = uRadius + (liquidNoise - 0.5) * 0.025;
            float mask = 1.0 - smoothstep(edge, edge + uSoftness, dist);
            mask *= smoothstep(0.0, 0.18, vNormal.z);

            float ripple = sin((dist * uRippleFrequency) - (uTime * uRippleSpeed * 6.28318));
            float edgeBand = smoothstep(edge + uSoftness, edge, dist) * smoothstep(edge - 0.14, edge, dist);
            vec2 dir = normalize(delta + vec2(0.0001));
            vec2 uvDistort = dir * (ripple * uRippleStrength * edgeBand + (liquidNoise - 0.5) * uDistortionStrength * mask);
            vec2 swirl = vec2(
              noise(vUv * 18.0 + uTime * 0.22),
              noise(vUv.yx * 18.0 - uTime * 0.2)
            ) - 0.5;
            vec2 earthUv = vec2(fract(vUv.x + 0.08), vUv.y) + uvDistort + swirl * uDistortionStrength * 0.45 * mask;
            vec3 earth = texture2D(uEarthMap, earthUv).rgb;
            earth = mix(earth * 0.72, earth, smoothstep(0.12, 0.78, vNormal.z));

            float alpha = mask * uReveal;
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

function MoonMesh({ reducedMotion, mouseOffset, pointerState, onReady }: MoonMeshProps) {
  const groupRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF(MODEL_PATH);
  const moonTexture = useTextureWithFallback(MOON_TEXTURE_PATH, 'moon');

  const clonedScene = useMemo(() => {
    const clone = scene.clone(true);

    clone.traverse((child) => {
      if (!('isMesh' in child) || !(child as THREE.Mesh).isMesh) return;
      const mesh = child as THREE.Mesh;
      mesh.castShadow = false;
      mesh.receiveShadow = false;
      mesh.renderOrder = 2;
      const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      materials.forEach((m) => {
        const mat = m as THREE.MeshStandardMaterial;
        if (mat?.isMeshStandardMaterial) {
          mat.map = moonTexture;
          mat.map.colorSpace = THREE.SRGBColorSpace;
          mat.map.needsUpdate = true;
          mat.color.set('#f1f6ff');
          mat.metalness = 0;
          mat.roughness = 0.96;
          mat.envMapIntensity = 0.2;
          mat.side = THREE.FrontSide;
          mat.transparent = true;
          mat.opacity = 0.42;
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
  }, [moonTexture, scene]);

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
          opacity={0.035}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.BackSide}
        />
      </mesh>
      <group ref={groupRef} rotation={[0.08, 0, 0]}>
        <mesh scale={0.982} renderOrder={1}>
          <sphereGeometry args={[1, 96, 96]} />
          <meshStandardMaterial
            map={moonTexture}
            color="#dfe8fa"
            roughness={0.94}
            metalness={0}
            emissive="#101728"
            emissiveIntensity={0.11}
          />
        </mesh>
        <primitive object={clonedScene} />
        <TerraformRevealSphere reducedMotion={reducedMotion} pointerState={pointerState} />
      </group>
    </group>
  );
}

function LightRig() {
  return (
    <>
      <ambientLight intensity={1.15} color="#e8efff" />
      <hemisphereLight args={['#f4f7ff', '#1d2945', 0.8]} />
      <directionalLight position={[4.8, 3.4, 4.2]} intensity={3.7} color="#fff7e8" />
      <directionalLight position={[-3.5, 0.8, 2.2]} intensity={0.95} color="#8fbaff" />
      <pointLight position={[-2.8, 1.8, -2.8]} intensity={0.75} color="#a9c8ff" />
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
  onModelReady: () => void;
  onModelError: () => void;
}

function Scene({ reducedMotion, mouseOffset, pointerState, onModelReady, onModelError }: SceneProps) {
  return (
    <>
      <LightRig />
      <GLBErrorBoundary onError={onModelError}>
        <Suspense fallback={null}>
          <MoonMesh reducedMotion={reducedMotion} mouseOffset={mouseOffset} pointerState={pointerState} onReady={onModelReady} />
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
    gl.toneMappingExposure = 1.22;
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
  const isMountedRef = useRef(true);
  const contextLossCleanupRef = useRef<(() => void) | null>(null);
  const isInViewRef = useRef(true);
  const rectRef = useRef<DOMRect | null>(null);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    setHasWebGL(detectWebGL());
    const hoverQuery = window.matchMedia('(hover: hover) and (pointer: fine)');
    const updateViewport = () => {
      setIsMobile(window.innerWidth < 768 || !hoverQuery.matches);
      setCanHoverFinePointer(hoverQuery.matches);
      rectRef.current = containerRef.current?.getBoundingClientRect() ?? null;
    };
    updateViewport();
    window.addEventListener('resize', updateViewport, { passive: true });
    window.addEventListener('orientationchange', updateViewport, { passive: true });
    hoverQuery.addEventListener('change', updateViewport);
    return () => {
      window.removeEventListener('resize', updateViewport);
      window.removeEventListener('orientationchange', updateViewport);
      hoverQuery.removeEventListener('change', updateViewport);
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

    const terraformEnabled = !reducedMotion && (canHoverFinePointer || TERRAFORM_ENABLED_ON_MOBILE);
    pointerState.current.enabled = terraformEnabled;
    pointerState.current.targetReveal = 0;
    if (!terraformEnabled) {
      mouseOffset.current = { x: 0, y: 0 };
      return;
    }

    const pointer = pointerState.current;
    rectRef.current = container.getBoundingClientRect();
    const updateRect = () => { rectRef.current = container.getBoundingClientRect(); };
    const io = new IntersectionObserver(
      ([entry]) => {
        isInViewRef.current = entry.isIntersecting;
        if (!entry.isIntersecting) pointer.targetReveal = 0;
      },
      { threshold: 0 }
    );
    io.observe(container);

    const handlePointerMove = (e: PointerEvent) => {
      if (!isInViewRef.current) return;
      const rect = rectRef.current ?? container.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const radius = Math.min(rect.width, rect.height) * MOON_SCREEN_RADIUS_RATIO;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const insideMoon = Math.hypot(dx, dy) <= radius;

      mouseOffset.current = {
        x: dx / Math.max(radius, 1),
        y: dy / Math.max(radius, 1),
      };

      pointer.target.set(
        (e.clientX - rect.left) / Math.max(rect.width, 1),
        1 - ((e.clientY - rect.top) / Math.max(rect.height, 1))
      );
      pointer.targetReveal = insideMoon ? 1 : 0;
    };
    const handlePointerLeave = () => {
      mouseOffset.current = { x: 0, y: 0 };
      pointer.targetReveal = 0;
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
            style={{ width: '100%', height: '100%', background: 'transparent', pointerEvents: 'none' }}
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
