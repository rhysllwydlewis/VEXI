'use client';

import { useEffect, useRef } from 'react';

/* ── Types ───────────────────────────────────────────────────── */
interface Star {
  x: number;
  y: number;
  r: number;
  baseAlpha: number;
  twinkleSpeed: number;
  twinklePhase: number;
  twinkleAmplitude: number;
  colorR: number;
  colorG: number;
  colorB: number;
  glow: boolean;
  /** 0 = far (slow parallax), 1 = mid, 2 = near (faster parallax) */
  layer: 0 | 1 | 2;
  /** true for the ~1% of very bright stars with 8-point spikes */
  spikes8: boolean;
}

interface ShootingStar {
  x: number;
  y: number;
  vx: number;
  vy: number;
  length: number;
  life: number;
  maxLife: number;
}

/* ── Helpers ─────────────────────────────────────────────────── */
function rand(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

/**
 * Pick a temperature-based RGB colour for a star.
 * Distribution is loosely inspired by the real Hertzsprung–Russell diagram
 * (most stars in our sky are F/G/K types with a minority of hot blue and
 * cool red giants visible to the naked eye).
 */
function starColor(): [number, number, number] {
  const roll = Math.random();
  if (roll < 0.04) return [255, 150,  85]; // M-type red giant   ~4 %
  if (roll < 0.11) return [255, 205, 145]; // K-type orange       ~7 %
  if (roll < 0.24) return [255, 248, 195]; // G-type yellow       ~13 %
  if (roll < 0.74) return [255, 255, 255]; // F/A-type white      ~50 %
  if (roll < 0.90) return [220, 235, 255]; // A-type blue-white   ~16 %
  return              [185, 210, 255];     // B-type hot blue     ~10 %
}

function buildStars(width: number, height: number, count: number): Star[] {
  const stars: Star[] = [];
  for (let i = 0; i < count; i++) {
    const sizeRoll = Math.random();
    let r: number;
    let glow = false;
    let spikes8 = false;

    if (sizeRoll < 0.50) {
      r = rand(0.5, 0.9);          // tiny sub-pixel dust — 50 %
    } else if (sizeRoll < 0.83) {
      r = rand(0.9, 1.6);          // small stars — 33 %
    } else if (sizeRoll < 0.97) {
      r = rand(1.6, 2.4);          // medium — 14 %
    } else if (sizeRoll < 0.993) {
      r = rand(2.4, 3.8);          // large glow stars — 2.3 %
      glow = true;
    } else {
      r = rand(3.8, 5.0);          // rare super-bright stars with 8-pt spikes — 0.7 %
      glow = true;
      spikes8 = true;
    }

    const [colorR, colorG, colorB] = starColor();

    // Brighter base alpha for larger stars; tiny stars are very faint
    const baseAlpha =
      r > 3.8  ? rand(0.55, 0.85) :
      r > 2.4  ? rand(0.35, 0.65) :
      r > 1.6  ? rand(0.22, 0.45) :
      r > 0.9  ? rand(0.15, 0.35) :
                 rand(0.08, 0.22);

    // Brighter stars twinkle slightly faster
    const twinkleSpeed = r > 2.0 ? rand(0.4, 1.6) : rand(0.15, 0.9);
    const twinkleAmplitude = r > 2.0 ? rand(0.08, 0.20) : rand(0.04, 0.14);

    // Randomly assign a depth layer — most stars are far
    const layerRoll = Math.random();
    const layer: 0 | 1 | 2 = layerRoll < 0.70 ? 0 : layerRoll < 0.92 ? 1 : 2;

    stars.push({
      x: rand(0, width),
      y: rand(0, height),
      r,
      baseAlpha,
      twinkleSpeed,
      twinklePhase: rand(0, Math.PI * 2),
      twinkleAmplitude,
      colorR,
      colorG,
      colorB,
      glow,
      layer,
      spikes8,
    });
  }
  return stars;
}

function pickShootingAngle(): number {
  const roll = Math.random();
  if (roll < 0.55) return rand(15, 40);     // 55% down-right
  if (roll < 0.80) return rand(140, 165);   // 25% down-left
  if (roll < 0.95) return rand(5, 15);      // 15% shallow down-right
  return rand(165, 175);                    // 5% shallow down-left
}

function createShootingStar(width: number, height: number): ShootingStar {
  const angle = pickShootingAngle();
  const rad = (angle * Math.PI) / 180;
  const speed = rand(450, 750); // px per second — slightly slower than before
  const maxLife = rand(1.4, 2.2); // longer life to match reduced speed
  const length = rand(120, 250);

  // Start off-canvas or near top edge
  const x = rand(-0.1 * width, 1.1 * width);
  const y = rand(-0.2 * height, 0.3 * height);

  return {
    x,
    y,
    vx: Math.cos(rad) * speed,
    vy: Math.sin(rad) * speed,
    length,
    life: 0,
    maxLife,
  };
}

/* ── Nebula haze (precomputed offscreen texture) ─────────────── */
// Tune haze intensity here:
const NEBULA_ALPHA_SCALE = 1.0; // 0.5 = half opacity, 2.0 = double
// Drift amplitude as a fraction of canvas dimension (keeps haze well away from edges)
const NEBULA_DRIFT_AMP = 0.04;
// Period (seconds) for each drift axis — long so motion is imperceptible moment-to-moment
const NEBULA_DRIFT_PERIOD_X = 90;
const NEBULA_DRIFT_PERIOD_Y = 120;

function buildNebulaTexture(w: number, h: number): HTMLCanvasElement {
  const oc = document.createElement('canvas');
  oc.width = w;
  oc.height = h;
  const c = oc.getContext('2d')!;

  // All blobs use only circular radial gradients (no scale/rotate transforms)
  // and are centred well within the canvas so that small drift translations
  // never expose a hard edge.

  // Blob 1 — large main haze, centred slightly upper-right of canvas centre
  const cx1 = w * 0.58;
  const cy1 = h * 0.40;
  const r1 = Math.min(w, h) * 0.72;
  const g1 = c.createRadialGradient(cx1, cy1, 0, cx1, cy1, r1);
  g1.addColorStop(0,    `rgba(70,95,210,${0.14 * NEBULA_ALPHA_SCALE})`);
  g1.addColorStop(0.45, `rgba(55,75,180,${0.08 * NEBULA_ALPHA_SCALE})`);
  g1.addColorStop(1,    'rgba(30,50,140,0)');
  c.fillStyle = g1;
  c.beginPath();
  c.arc(cx1, cy1, r1, 0, Math.PI * 2);
  c.fill();

  // Blob 2 — secondary cluster, upper-right, smaller and slightly brighter
  const cx2 = w * 0.72;
  const cy2 = h * 0.28;
  const r2 = Math.min(w, h) * 0.42;
  const g2 = c.createRadialGradient(cx2, cy2, 0, cx2, cy2, r2);
  g2.addColorStop(0,   `rgba(100,140,255,${0.15 * NEBULA_ALPHA_SCALE})`);
  g2.addColorStop(0.5, `rgba(70,105,215,${0.08 * NEBULA_ALPHA_SCALE})`);
  g2.addColorStop(1,   'rgba(50,80,185,0)');
  c.fillStyle = g2;
  c.beginPath();
  c.arc(cx2, cy2, r2, 0, Math.PI * 2);
  c.fill();

  // Blob 3 — lower-left counter-blob for organic feel
  const cx3 = w * 0.35;
  const cy3 = h * 0.62;
  const r3 = Math.min(w, h) * 0.38;
  const g3 = c.createRadialGradient(cx3, cy3, 0, cx3, cy3, r3);
  g3.addColorStop(0,   `rgba(60,85,200,${0.10 * NEBULA_ALPHA_SCALE})`);
  g3.addColorStop(1,   'rgba(40,65,175,0)');
  c.fillStyle = g3;
  c.beginPath();
  c.arc(cx3, cy3, r3, 0, Math.PI * 2);
  c.fill();

  // Blob 4 — warm reddish-purple: suggests a star-formation region / galactic core
  const cx4 = w * 0.22;
  const cy4 = h * 0.30;
  const r4 = Math.min(w, h) * 0.30;
  const g4 = c.createRadialGradient(cx4, cy4, 0, cx4, cy4, r4);
  g4.addColorStop(0,   `rgba(140,65,200,${0.09 * NEBULA_ALPHA_SCALE})`);
  g4.addColorStop(0.5, `rgba(110,50,165,${0.05 * NEBULA_ALPHA_SCALE})`);
  g4.addColorStop(1,   'rgba(80,35,130,0)');
  c.fillStyle = g4;
  c.beginPath();
  c.arc(cx4, cy4, r4, 0, Math.PI * 2);
  c.fill();

  // Blob 5 — subtle warm amber haze at lower-right, adds depth contrast
  const cx5 = w * 0.78;
  const cy5 = h * 0.72;
  const r5 = Math.min(w, h) * 0.28;
  const g5 = c.createRadialGradient(cx5, cy5, 0, cx5, cy5, r5);
  g5.addColorStop(0,   `rgba(180,110,55,${0.06 * NEBULA_ALPHA_SCALE})`);
  g5.addColorStop(0.6, `rgba(140,80,40,${0.03 * NEBULA_ALPHA_SCALE})`);
  g5.addColorStop(1,   'rgba(100,55,25,0)');
  c.fillStyle = g5;
  c.beginPath();
  c.arc(cx5, cy5, r5, 0, Math.PI * 2);
  c.fill();

  // Radial edge-fade mask: fades texture to transparent toward every edge so
  // drift translation never reveals a hard boundary.
  const halfDiag = Math.sqrt(w * w + h * h) / 2;
  const mask = c.createRadialGradient(w / 2, h / 2, halfDiag * 0.38, w / 2, h / 2, halfDiag * 0.88);
  mask.addColorStop(0, 'rgba(0,0,0,1)');
  mask.addColorStop(1, 'rgba(0,0,0,0)');
  c.globalCompositeOperation = 'destination-in';
  c.fillStyle = mask;
  c.fillRect(0, 0, w, h);
  c.globalCompositeOperation = 'source-over';

  return oc;
}

/* ── Draw nebula haze with slow sinusoidal drift ─────────────── */
// Uses translation (not rotation) so the canvas boundary never clips the
// texture at a visible angle, eliminating diagonal / straight-edge artefacts.
function drawNebula(
  ctx: CanvasRenderingContext2D,
  texture: HTMLCanvasElement,
  w: number,
  h: number,
  driftX: number,
  driftY: number,
) {
  ctx.save();
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'lighter';
  ctx.drawImage(texture, driftX, driftY, w, h);
  ctx.restore();
}

/* ── Draw a single star (with glow halo and optional diffraction spikes) ─── */
function drawStarWithSpikes(
  ctx: CanvasRenderingContext2D,
  s: Star,
  alpha: number,
  dx: number,
  dy: number,
) {
  const x = s.x + dx;
  const y = s.y + dy;
  const c = ctx;

  if (s.glow) {
    // Two-layer bloom: tight inner halo + soft outer halo for realism
    const innerR = s.r * 3.5;
    const outerR = s.r * 7;

    // Outer soft halo
    const outerGrad = c.createRadialGradient(x, y, 0, x, y, outerR);
    outerGrad.addColorStop(0,   `rgba(${s.colorR},${s.colorG},${s.colorB},${alpha * 0.25})`);
    outerGrad.addColorStop(0.4, `rgba(${s.colorR},${s.colorG},${s.colorB},${alpha * 0.08})`);
    outerGrad.addColorStop(1,   `rgba(${s.colorR},${s.colorG},${s.colorB},0)`);
    c.beginPath();
    c.arc(x, y, outerR, 0, Math.PI * 2);
    c.fillStyle = outerGrad;
    c.fill();

    // Inner bright halo
    const innerGrad = c.createRadialGradient(x, y, 0, x, y, innerR);
    innerGrad.addColorStop(0,   `rgba(${s.colorR},${s.colorG},${s.colorB},${alpha})`);
    innerGrad.addColorStop(0.3, `rgba(${s.colorR},${s.colorG},${s.colorB},${alpha * 0.55})`);
    innerGrad.addColorStop(1,   `rgba(${s.colorR},${s.colorG},${s.colorB},0)`);
    c.beginPath();
    c.arc(x, y, innerR, 0, Math.PI * 2);
    c.fillStyle = innerGrad;
    c.fill();

    // Diffraction spikes: 4-point cross for all glow stars; 8-point for spikes8
    const numSpikes = s.spikes8 ? 8 : 4;
    const spikeLen = s.spikes8 ? s.r * 10 : s.r * 7;
    const spikeAlpha = alpha * (s.spikes8 ? 0.35 : 0.22);

    for (let a = 0; a < numSpikes; a++) {
      const actualAngle = (a * Math.PI * 2) / numSpikes;
      const ex = x + Math.cos(actualAngle) * spikeLen;
      const ey = y + Math.sin(actualAngle) * spikeLen;
      const sg = c.createLinearGradient(x, y, ex, ey);
      sg.addColorStop(0,   `rgba(${s.colorR},${s.colorG},${s.colorB},${spikeAlpha})`);
      sg.addColorStop(0.6, `rgba(${s.colorR},${s.colorG},${s.colorB},${spikeAlpha * 0.3})`);
      sg.addColorStop(1,   `rgba(${s.colorR},${s.colorG},${s.colorB},0)`);
      c.beginPath();
      c.moveTo(x, y);
      c.lineTo(ex, ey);
      c.strokeStyle = sg;
      c.lineWidth = s.spikes8 ? 0.8 : 0.6;
      c.lineCap = 'round';
      c.stroke();
    }
  }

  // Bright core circle
  c.beginPath();
  c.arc(x, y, s.r, 0, Math.PI * 2);
  c.fillStyle = `rgba(${s.colorR},${s.colorG},${s.colorB},${Math.min(alpha * 1.3, 1)})`;
  c.fill();

  // Tiny bright centre point for medium+ stars to make them feel crisp
  if (s.r > 1.2) {
    c.beginPath();
    c.arc(x, y, s.r * 0.4, 0, Math.PI * 2);
    c.fillStyle = `rgba(255,255,255,${Math.min(alpha * 1.6, 1)})`;
    c.fill();
  }
}

/* ── Component ───────────────────────────────────────────────── */
export default function StarfieldCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const dpr = window.devicePixelRatio || 1;

    let stars: Star[] = [];
    let nebulaTexture: HTMLCanvasElement | null = null;
    let shootingStar: ShootingStar | null = null;
    let shootingStarTimer = 0;
    let rafId = 0;
    let lastTime = 0;
    let time = 0;
    let active = true; // IntersectionObserver-driven

    // Nebula drifts on two independent sinusoidal axes (no rotation, so no canvas-clipping edge)
    // Shooting-star frequency: first star appears after 2–3 s (just after hero text fades in); subsequent stars every 10–15 s
    const FIRST_SHOOTING_STAR_MIN_MS = 2000;
    const FIRST_SHOOTING_STAR_MAX_MS = 3000;
    const NEXT_SHOOTING_STAR_MIN_MS = 10000;
    const NEXT_SHOOTING_STAR_MAX_MS = 15000;
    const MAX_DELTA_TIME_S = 0.05; // cap frame delta at 50 ms

    let nextShootingStarDelay = rand(FIRST_SHOOTING_STAR_MIN_MS, FIRST_SHOOTING_STAR_MAX_MS);

    /* ── Setup canvas size ────────────────────────────────────── */
    function resize() {
      const w = canvas!.offsetWidth;
      const h = canvas!.offsetHeight;
      canvas!.width = w * dpr;
      canvas!.height = h * dpr;
      ctx!.scale(dpr, dpr);

      const count = w < 640 ? Math.floor(rand(200, 400)) : Math.floor(rand(350, 650));
      stars = buildStars(w, h, count);
      nebulaTexture = buildNebulaTexture(w, h);
    }

    resize();

    /* ── Static render (reduced-motion) ──────────────────────── */
    function drawStatic() {
      const w = canvas!.offsetWidth;
      const h = canvas!.offsetHeight;
      ctx!.clearRect(0, 0, w, h);
      // Static nebula at zero drift
      if (nebulaTexture) drawNebula(ctx!, nebulaTexture, w, h, 0, 0);
      for (const s of stars) {
        drawStarWithSpikes(ctx!, s, s.baseAlpha, 0, 0);
      }
    }

    /* ── Draw shooting star ───────────────────────────────────── */
    function drawShootingStar(ss: ShootingStar) {
      const progress = ss.life / ss.maxLife;
      let opacity: number;
      if (progress < 0.1) {
        opacity = (progress / 0.1) * 0.75;
      } else if (progress < 0.8) {
        opacity = 0.75;
      } else {
        opacity = (1 - (progress - 0.8) / 0.2) * 0.75;
      }

      const tailX = ss.x - (ss.vx / Math.hypot(ss.vx, ss.vy)) * ss.length;
      const tailY = ss.y - (ss.vy / Math.hypot(ss.vx, ss.vy)) * ss.length;

      const grad = ctx!.createLinearGradient(tailX, tailY, ss.x, ss.y);
      grad.addColorStop(0, `rgba(255,255,255,0)`);
      grad.addColorStop(0.7, `rgba(255,255,255,${opacity * 0.4})`);
      grad.addColorStop(1, `rgba(255,255,255,${opacity})`);

      ctx!.beginPath();
      ctx!.moveTo(tailX, tailY);
      ctx!.lineTo(ss.x, ss.y);
      ctx!.strokeStyle = grad;
      ctx!.lineWidth = 1.5;
      ctx!.lineCap = 'round';
      ctx!.stroke();
    }

    /* ── Animation loop ───────────────────────────────────────── */
    function loop(ts: number) {
      if (!active) {
        rafId = requestAnimationFrame(loop);
        lastTime = ts;
        return;
      }

      const dt = Math.min((ts - lastTime) / 1000, MAX_DELTA_TIME_S);
      lastTime = ts;
      time += dt;

      const w = canvas!.offsetWidth;
      const h = canvas!.offsetHeight;

      // Gentle drift offsets (full amplitude for near-layer stars)
      const dxBase = Math.sin(time / 50) * 3;
      const dyBase = Math.cos(time / 60) * 2;

      ctx!.clearRect(0, 0, w, h);

      // Nebula haze (slow sinusoidal drift — no rotation, so no hard edge artifact)
      if (nebulaTexture) {
        const driftX = Math.sin((time / NEBULA_DRIFT_PERIOD_X) * Math.PI * 2) * w * NEBULA_DRIFT_AMP;
        const driftY = Math.cos((time / NEBULA_DRIFT_PERIOD_Y) * Math.PI * 2) * h * NEBULA_DRIFT_AMP;
        drawNebula(ctx!, nebulaTexture, w, h, driftX, driftY);
      }

      // Draw stars with twinkle and depth-layered parallax
      // Parallax scale per layer: far=0.25×, mid=0.60×, near=1.0×
      const LAYER_SCALE = [0.25, 0.60, 1.0] as const;
      for (const s of stars) {
        const alpha = Math.min(
          0.85,
          Math.max(0, s.baseAlpha + Math.sin(time * s.twinkleSpeed + s.twinklePhase) * s.twinkleAmplitude)
        );
        const scale = LAYER_SCALE[s.layer];
        drawStarWithSpikes(ctx!, s, alpha, dxBase * scale, dyBase * scale);
      }

      // Shooting star
      if (!shootingStar) {
        shootingStarTimer += dt * 1000;
        if (shootingStarTimer >= nextShootingStarDelay) {
          shootingStar = createShootingStar(w, h);
          shootingStarTimer = 0;
          nextShootingStarDelay = rand(NEXT_SHOOTING_STAR_MIN_MS, NEXT_SHOOTING_STAR_MAX_MS);
        }
      } else {
        shootingStar.life += dt;
        shootingStar.x += shootingStar.vx * dt;
        shootingStar.y += shootingStar.vy * dt;

        if (shootingStar.life >= shootingStar.maxLife) {
          shootingStar = null;
        } else {
          drawShootingStar(shootingStar);
        }
      }

      rafId = requestAnimationFrame(loop);
    }

    if (reducedMotion) {
      drawStatic();
    } else {
      lastTime = performance.now();
      rafId = requestAnimationFrame(loop);
    }

    /* ── IntersectionObserver: pause when off-screen ─────────── */
    const observer = new IntersectionObserver(
      (entries) => { active = entries[0].isIntersecting; },
      { threshold: 0 }
    );
    observer.observe(canvas);

    /* ── ResizeObserver ───────────────────────────────────────── */
    const resizeObserver = new ResizeObserver(() => {
      // Reset transform matrix before re-scaling for new DPR
      ctx!.resetTransform();
      resize();
      if (reducedMotion) drawStatic();
    });
    resizeObserver.observe(canvas);

    return () => {
      cancelAnimationFrame(rafId);
      observer.disconnect();
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ willChange: 'contents' }}
      aria-hidden="true"
    />
  );
}
