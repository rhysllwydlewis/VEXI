'use client';

import { useState, useEffect, useRef } from 'react';

interface ShootingStar {
  id: number;
  top: number;
  left: number;
  angle: number;
  duration: number;
  length: number;
  thickness: number;
  travelX: number;
  travelY: number;
  peakOpacity: number;
}

function rand(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function pickAngle(): number {
  const roll = Math.random();
  if (roll < 0.60) return rand(15, 35);      // 60% down-right
  if (roll < 0.85) return rand(145, 165);    // 25% down-left
  if (roll < 0.95) return rand(5, 15);       // 10% shallow down-right
  return rand(165, 175);                      // 5% shallow down-left
}

function createStar(id: number): ShootingStar {
  const angle = pickAngle();
  const length = rand(120, 220);
  const duration = rand(0.9, 1.6);
  const thickness = rand(1, 2);
  const peakOpacity = rand(0.40, 0.55);

  // Travel distance along the rotated axis projected to x/y
  const rad = (angle * Math.PI) / 180;
  const travel = length * 4;
  const travelX = Math.cos(rad) * travel;
  const travelY = Math.sin(rad) * travel;

  return {
    id,
    top: rand(-20, 40),
    left: rand(-10, 110),
    angle,
    duration,
    length,
    thickness,
    travelX,
    travelY,
    peakOpacity,
  };
}

export default function ShootingStars() {
  const [activeStar, setActiveStar] = useState<ShootingStar | null>(null);
  const counterRef = useRef(0);
  const spawnTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    function scheduleNext(delay: number) {
      spawnTimerRef.current = setTimeout(() => {
        const star = createStar(counterRef.current++);
        setActiveStar(star);

        // Clear star after it finishes animating (add a small buffer)
        setTimeout(() => {
          setActiveStar(null);
        }, star.duration * 1000 + 200);

        // Schedule the next one
        scheduleNext(rand(25000, 60000));
      }, delay);
    }

    // First spawn after a short initial delay
    scheduleNext(rand(5000, 15000));

    return () => {
      if (spawnTimerRef.current) clearTimeout(spawnTimerRef.current);
    };
  }, []);

  if (!activeStar) return null;

  type StarStyle = React.CSSProperties & { [key: `--${string}`]: string | number };
  const style: StarStyle = {
    top: `${activeStar.top}%`,
    left: `${activeStar.left}%`,
    width: `${activeStar.length}px`,
    height: `${activeStar.thickness}px`,
    '--angle': `${activeStar.angle}deg`,
    '--travel-x': `${activeStar.travelX}px`,
    '--travel-y': `${activeStar.travelY}px`,
    '--peak-opacity': activeStar.peakOpacity,
    animationDuration: `${activeStar.duration}s`,
    background:
      'linear-gradient(to right, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.4) 40%, rgba(255,255,255,0) 100%)',
    filter: 'blur(0.3px)',
    boxShadow: '0 0 4px rgba(255,255,255,0.3)',
  };

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <span key={activeStar.id} className="shooting-star" style={style} />
    </div>
  );
}
