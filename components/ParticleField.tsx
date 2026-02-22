'use client';

import { useMemo } from 'react';

interface Particle {
  id: number;
  top: string;
  left: string;
  size: number;
  opacity: number;
  duration: number;
  delay: number;
  floatX: number;
  floatY: number;
}

export default function ParticleField() {
  const particles = useMemo<Particle[]>(() => {
    return Array.from({ length: 40 }, (_, i) => ({
      id: i,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      size: Math.random() * 2 + 2,
      opacity: Math.random() * 0.2 + 0.1,
      duration: Math.random() * 25 + 15,
      delay: Math.random() * 10,
      floatX: Math.round((Math.random() - 0.5) * 30),
      floatY: Math.round((Math.random() - 0.5) * 40),
    }));
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full bg-white"
          style={{
            top: p.top,
            left: p.left,
            width: `${p.size}px`,
            height: `${p.size}px`,
            opacity: p.opacity,
            ['--float-x' as string]: `${p.floatX}px`,
            ['--float-y' as string]: `${p.floatY}px`,
            animation: `float ${p.duration}s ${p.delay}s infinite ease-in-out`,
          }}
        />
      ))}
    </div>
  );
}
