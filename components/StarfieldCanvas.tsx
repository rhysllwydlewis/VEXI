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
    let shootingStar: ShootingStar | null = null;
    let shootingStarTimer = 0;
    let rafId = 0;
    let lastTime = 0;
    let time = 0;
    let active = true; // IntersectionObserver-driven

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
    }

    resize();

    /* ── Static render (reduced-motion) ──────────────────────── */
    function drawStatic() {
      const w = canvas!.offsetWidth;
      const h = canvas!.offsetHeight;
      ctx!.clearRect(0, 0, w, h);
      for (const s of stars) {
        drawStar(s, s.baseAlpha, 0, 0);
      }
    }

    /* ── Draw a single star ───────────────────────────────────── */
    function drawStar(s: Star, alpha: number, dx: number, dy: number) {
      const x = s.x + dx;
      const y = s.y + dy;
      const c = ctx!;

      if (s.glow) {
        // radial gradient bloom
        const grad = c.createRadialGradient(x, y, 0, x, y, s.r * 4);
        grad.addColorStop(0, `rgba(${s.colorR},${s.colorG},${s.colorB},${alpha})`);
        grad.addColorStop(0.4, `rgba(${s.colorR},${s.colorG},${s.colorB},${alpha * 0.4})`);
        grad.addColorStop(1, `rgba(${s.colorR},${s.colorG},${s.colorB},0)`);
        c.beginPath();
        c.arc(x, y, s.r * 4, 0, Math.PI * 2);
        c.fillStyle = grad;
        c.fill();
      }

      c.beginPath();
      c.arc(x, y, s.r, 0, Math.PI * 2);
      c.fillStyle = `rgba(${s.colorR},${s.colorG},${s.colorB},${alpha})`;
      c.fill();
    }

    /* ── Draw shooting star ───────────────────────────────────── */
    function drawShootingStar(ss: ShootingStar) {
      const progress = ss.life / ss.maxLife;
      // fade in 0–10%, full 10–80%, fade out 80–100%
      let opacity: number;
      if (progress < 0.1) {
        opacity = progress / 0.1 * 0.75;
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

      // Draw stars with twinkle
      for (const s of stars) {
        const alpha = Math.min(
          0.75,
          Math.max(0, s.baseAlpha + Math.sin(time * s.twinkleSpeed + s.twinklePhase) * s.twinkleAmplitude)
        );
        drawStar(s, alpha, dx, dy);
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
