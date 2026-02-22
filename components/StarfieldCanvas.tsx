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
  /** 1 = white, slightly > 1 = cool-blue tint */
  colorR: number;
  colorG: number;
  colorB: number;
  glow: boolean;
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

function buildStars(width: number, height: number, count: number): Star[] {
  const stars: Star[] = [];
  for (let i = 0; i < count; i++) {
    const sizeRoll = Math.random();
    let r: number;
    let glow = false;

    if (sizeRoll < 0.55) {
      r = rand(0.6, 1.0);
    } else if (sizeRoll < 0.90) {
      r = rand(1.0, 1.8);
    } else if (sizeRoll < 0.98) {
      r = rand(1.8, 2.2);
    } else {
      r = rand(3.0, 4.0); // rare large glow stars
      glow = true;
    }

    // cool-blue tint on ~8% of stars
    const coolTint = Math.random() < 0.08;
    const colorR = coolTint ? 210 : 255;
    const colorG = coolTint ? 230 : 255;
    const colorB = 255;

    const baseAlpha = r > 2.2 ? rand(0.35, 0.65) : r > 1.8 ? rand(0.25, 0.45) : r > 1.0 ? rand(0.18, 0.38) : rand(0.18, 0.30);
    const twinkleAmplitude = rand(0.06, 0.18);

    stars.push({
      x: rand(0, width),
      y: rand(0, height),
      r,
      baseAlpha,
      twinkleSpeed: rand(0.2, 1.2),
      twinklePhase: rand(0, Math.PI * 2),
      twinkleAmplitude,
      colorR,
      colorG,
      colorB,
      glow,
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
  const speed = rand(700, 1100); // px per second
  const maxLife = rand(0.9, 1.6);
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
function buildNebulaTexture(w: number, h: number): HTMLCanvasElement {
  const oc = document.createElement('canvas');
  oc.width = w;
  oc.height = h;
  const c = oc.getContext('2d')!;

  // Base corner anchor: top-right quadrant
  const cx = w * 0.85;
  const cy = h * 0.15;
  const rx = w * 0.55;
  const ry = h * 0.45;

  // Outer haze — wide, blue-violet (boosted for visibility)
  const g1 = c.createRadialGradient(cx, cy, 0, cx, cy, Math.max(rx, ry));
  g1.addColorStop(0, 'rgba(80,100,220,0.18)');
  g1.addColorStop(0.4, 'rgba(60,80,180,0.11)');
  g1.addColorStop(1, 'rgba(30,50,140,0)');
  c.save();
  c.translate(cx, cy);
  c.scale(1, ry / rx);
  c.translate(-cx, -cy);
  c.fillStyle = g1;
  c.beginPath();
  c.arc(cx, cy, rx, 0, Math.PI * 2);
  c.fill();
  c.restore();

  // Inner core — slightly brighter, warmer blue
  const cx2 = w * 0.9;
  const cy2 = h * 0.08;
  const r2 = w * 0.22;
  const g2 = c.createRadialGradient(cx2, cy2, 0, cx2, cy2, r2);
  g2.addColorStop(0, 'rgba(100,140,255,0.16)');
  g2.addColorStop(0.5, 'rgba(80,110,230,0.09)');
  g2.addColorStop(1, 'rgba(60,90,200,0)');
  c.fillStyle = g2;
  c.beginPath();
  c.arc(cx2, cy2, r2, 0, Math.PI * 2);
  c.fill();

  // Faint dust streak — diagonal band
  const cx3 = w * 0.7;
  const cy3 = h * 0.3;
  const r3 = w * 0.35;
  const g3 = c.createRadialGradient(cx3, cy3, 0, cx3, cy3, r3);
  g3.addColorStop(0, 'rgba(70,90,200,0.09)');
  g3.addColorStop(1, 'rgba(50,70,180,0)');
  c.save();
  c.translate(cx3, cy3);
  c.rotate(-0.4);
  c.scale(1, 0.35);
  c.translate(-cx3, -cy3);
  c.fillStyle = g3;
  c.beginPath();
  c.arc(cx3, cy3, r3, 0, Math.PI * 2);
  c.fill();
  c.restore();

  // Radial edge-fade mask: ensures the texture fades to transparent at all
  // edges so that when it rotates there is no visible hard boundary/seam.
  // fadeStart: fraction of the half-diagonal at which fading begins (0–1).
  const fadeStart = 0.45;
  const halfDiag = Math.sqrt(w * w + h * h) / 2;
  const mask = c.createRadialGradient(w / 2, h / 2, halfDiag * fadeStart, w / 2, h / 2, halfDiag);
  mask.addColorStop(0, 'rgba(0,0,0,1)');
  mask.addColorStop(1, 'rgba(0,0,0,0)');
  c.globalCompositeOperation = 'destination-in';
  c.fillStyle = mask;
  c.fillRect(0, 0, w, h);
  c.globalCompositeOperation = 'source-over';

  return oc;
}

/* ── Draw nebula haze with slow edge-rotation ────────────────── */
function drawNebula(
  ctx: CanvasRenderingContext2D,
  texture: HTMLCanvasElement,
  w: number,
  h: number,
  angle: number,
) {
  ctx.save();
  // Rotate about canvas centre — this creates the "around the edges" drift
  ctx.translate(w / 2, h / 2);
  ctx.rotate(angle);
  ctx.translate(-w / 2, -h / 2);
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'lighter';
  ctx.drawImage(texture, 0, 0, w, h);
  ctx.restore();
}

/* ── Draw a single star (with optional diffraction spikes) ────── */
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
    // radial gradient bloom
    const grad = c.createRadialGradient(x, y, 0, x, y, s.r * 5);
    grad.addColorStop(0, `rgba(${s.colorR},${s.colorG},${s.colorB},${alpha})`);
    grad.addColorStop(0.3, `rgba(${s.colorR},${s.colorG},${s.colorB},${alpha * 0.35})`);
    grad.addColorStop(1, `rgba(${s.colorR},${s.colorG},${s.colorB},0)`);
    c.beginPath();
    c.arc(x, y, s.r * 5, 0, Math.PI * 2);
    c.fillStyle = grad;
    c.fill();

    // 4-point diffraction cross for large/bright stars
    const spikeLen = s.r * 7;
    const spikeAlpha = alpha * 0.25;
    for (let a = 0; a < 4; a++) {
      const angle = (a * Math.PI) / 2;
      const ex = x + Math.cos(angle) * spikeLen;
      const ey = y + Math.sin(angle) * spikeLen;
      const sg = c.createLinearGradient(x, y, ex, ey);
      sg.addColorStop(0, `rgba(${s.colorR},${s.colorG},${s.colorB},${spikeAlpha})`);
      sg.addColorStop(1, `rgba(${s.colorR},${s.colorG},${s.colorB},0)`);
      c.beginPath();
      c.moveTo(x, y);
      c.lineTo(ex, ey);
      c.strokeStyle = sg;
      c.lineWidth = 0.6;
      c.lineCap = 'round';
      c.stroke();
    }
  }

  c.beginPath();
  c.arc(x, y, s.r, 0, Math.PI * 2);
  c.fillStyle = `rgba(${s.colorR},${s.colorG},${s.colorB},${alpha})`;
  c.fill();
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

    // Nebula rotates one full turn every ~120 s
    const NEBULA_PERIOD_S = 120;
    const FIRST_SHOOTING_STAR_MIN_MS = 8000;
    const FIRST_SHOOTING_STAR_MAX_MS = 20000;
    const NEXT_SHOOTING_STAR_MIN_MS = 25000;
    const NEXT_SHOOTING_STAR_MAX_MS = 60000;
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
      // Static nebula at angle 0
      if (nebulaTexture) drawNebula(ctx!, nebulaTexture, w, h, 0);
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

      // Gentle drift offsets
      const dx = Math.sin(time / 50) * 3;
      const dy = Math.cos(time / 60) * 2;

      ctx!.clearRect(0, 0, w, h);

      // Nebula haze (slow rotation)
      if (nebulaTexture) {
        const nebulaAngle = ((time % NEBULA_PERIOD_S) / NEBULA_PERIOD_S) * Math.PI * 2;
        drawNebula(ctx!, nebulaTexture, w, h, nebulaAngle);
      }

      // Draw stars with twinkle
      for (const s of stars) {
        const alpha = Math.min(
          0.75,
          Math.max(0, s.baseAlpha + Math.sin(time * s.twinkleSpeed + s.twinklePhase) * s.twinkleAmplitude)
        );
        drawStarWithSpikes(ctx!, s, alpha, dx, dy);
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
      aria-hidden="true"
    />
  );
}
