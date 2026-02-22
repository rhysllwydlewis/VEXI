'use client';

import { useMemo, useState, useEffect } from 'react';

interface Star {
  id: string;
  top: number;
  left: number;
  size: number;
  opacity: number;
  color: 'white' | 'cool';
  twinkle: boolean;
  twinkleDuration?: number;
  twinkleDelay?: number;
  twinkleMin?: number;
  twinkleMax?: number;
  glow: boolean;
}

const SAFE_ZONE = { xMin: 30, xMax: 70, yMin: 22, yMax: 75 };

function inSafeZone(left: number, top: number): boolean {
  return (
    left >= SAFE_ZONE.xMin &&
    left <= SAFE_ZONE.xMax &&
    top >= SAFE_ZONE.yMin &&
    top <= SAFE_ZONE.yMax
  );
}

function rand(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function generateStars(count: number): Star[] {
  const stars: Star[] = [];
  for (let i = 0; i < count; i++) {
    let top: number;
    let left: number;
    let attempts = 0;
    do {
      top = rand(0, 100);
      left = rand(0, 100);
      attempts++;
    } while (inSafeZone(left, top) && attempts < 20);

    // Weighted size: ~55% micro (1px), ~35% small (1.5px), ~10% glow (2px)
    const sizeRoll = Math.random();
    let size: number;
    let glow = false;
    if (sizeRoll < 0.55) {
      size = 1;
    } else if (sizeRoll < 0.90) {
      size = 1.5;
    } else {
      size = 2;
      glow = true;
    }

    const color: 'white' | 'cool' = Math.random() < 0.07 ? 'cool' : 'white';

    // Opacity by size tier
    let opacity: number;
    if (size === 1) {
      opacity = rand(0.06, 0.20);
    } else if (size === 1.5) {
      opacity = rand(0.08, 0.26);
    } else {
      opacity = rand(0.06, 0.18);
    }

    const twinkle = Math.random() < 0.28;
    const twinkleMin = twinkle ? rand(0.10, 0.16) : undefined;
    const twinkleMax = twinkle ? rand(0.18, 0.30) : undefined;
    const twinkleDuration = twinkle ? rand(2.5, 7) : undefined;
    const twinkleDelay = twinkle ? rand(0, 7) : undefined;

    stars.push({
      id: `star-${i}`,
      top,
      left,
      size,
      opacity,
      color,
      twinkle,
      twinkleDuration,
      twinkleDelay,
      twinkleMin,
      twinkleMax,
      glow,
    });
  }
  return stars;
}

export default function Starfield({ className }: { className?: string }) {
  const [starCount, setStarCount] = useState(0);

  useEffect(() => {
    const w = window.innerWidth;
    if (w < 640) setStarCount(120);
    else if (w < 1024) setStarCount(160);
    else setStarCount(210);
  }, []);

  const stars = useMemo(() => generateStars(starCount), [starCount]);

  if (starCount === 0) return null;

  return (
    <div
      className={`absolute inset-0 overflow-hidden pointer-events-none${className ? ` ${className}` : ''}`}
    >
      {stars.map((star) => {
        const rgba =
          star.color === 'cool'
            ? `rgba(210,230,255,${star.opacity})`
            : `rgba(255,255,255,${star.opacity})`;

        const classNames = [
          'star',
          star.twinkle ? 'star--twinkle' : '',
          star.glow ? 'star--glow' : '',
        ]
          .filter(Boolean)
          .join(' ');

        type StarStyle = React.CSSProperties & { [key: `--${string}`]: string | number };
        const style: StarStyle = {
          top: `${star.top}%`,
          left: `${star.left}%`,
          width: `${star.size}px`,
          height: `${star.size}px`,
          backgroundColor: rgba,
        };

        if (star.twinkle) {
          style['--twinkle-min'] = star.twinkleMin ?? 0.12;
          style['--twinkle-max'] = star.twinkleMax ?? 0.28;
          style.animationDuration = `${star.twinkleDuration}s`;
          style.animationDelay = `${star.twinkleDelay}s`;
        }

        return <span key={star.id} className={classNames} style={style} />;
      })}
    </div>
  );
}
