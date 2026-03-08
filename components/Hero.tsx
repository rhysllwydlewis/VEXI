'use client';

import { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import dynamic from 'next/dynamic';
import AnimatedBlobs from './AnimatedBlobs';
import StarfieldCanvas from './StarfieldCanvas';
import MoonPlaceholder from './MoonPlaceholder';
import { useContact } from '@/components/ContactWidget';

const MoonSphere = dynamic(() => import('./MoonSphere'), {
  ssr: false,
  loading: () => <MoonPlaceholder />,
});

const BENEFITS = ['Innovation', 'Scalability', 'Purpose-built'] as const;

const CTA_SHADOW = '0 0 0 1px rgba(99,102,241,0.4), 0 4px 24px rgba(59,130,246,0.25)';
const CTA_SHADOW_HOVER = '0 0 0 1px rgba(99,102,241,0.6), 0 8px 32px rgba(59,130,246,0.45)';

export default function Hero() {
  const { openContact } = useContact();
  const prefersReducedMotion = useReducedMotion();
  const heroRef = useRef<HTMLElement>(null);

  // Scroll-linked parallax for the moon
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const moonY = useTransform(scrollYProgress, [0, 1], ['0%', '-30%']);

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-[#0a0e1a] to-[#0f172a]"
      aria-label="Hero"
    >
      <AnimatedBlobs />
      <StarfieldCanvas />

      {/* Moon backdrop — z-[5]: behind text (z-10) but above blobs/starfield */}
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.8, delay: 0.1, ease: 'easeOut' }}
        style={{ y: moonY }}
        className="absolute inset-0 flex items-center justify-center z-[5] pointer-events-none"
        aria-hidden="true"
      >
        <div className="w-[400px] h-[400px] sm:w-[500px] sm:h-[500px] md:w-[650px] md:h-[650px] lg:w-[750px] lg:h-[750px]">
          <MoonSphere />
        </div>
        {/* Dark centre vignette to improve text contrast over the moon */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(10,14,26,0.72) 0%, rgba(10,14,26,0.55) 45%, rgba(10,14,26,0.15) 70%, transparent 85%)',
          }}
        />
      </motion.div>

      <div className="relative z-10 flex flex-col items-center text-center px-6 py-24 max-w-4xl mx-auto w-full">
        <motion.h1
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-6xl sm:text-7xl md:text-9xl font-black tracking-[-0.05em] leading-none text-white"
          style={{ filter: 'drop-shadow(0 0 60px rgba(10,14,26,0.9)) drop-shadow(0 0 40px rgba(59,130,246,0.35))' }}
        >
          <span className="relative inline-block">
            VEXI
            <span
              aria-hidden={true}
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(148,163,184,0.1) 50%, rgba(147,197,253,0.15) 100%)',
                mixBlendMode: 'overlay',
              }}
            />
          </span>
        </motion.h1>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.45 }}
          className="text-xl md:text-2xl text-slate-300 font-light mt-6 max-w-2xl leading-relaxed"
          style={{ textShadow: '0 0 30px rgba(10,14,26,0.8), 0 2px 10px rgba(10,14,26,0.6)' }}
        >
          The technology group behind purpose-built digital platforms
          <br className="hidden sm:block" /> that scale from day one.
        </motion.p>

        {/* Benefit pills */}
        <motion.ul
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.65 }}
          role="list"
          className="flex flex-wrap justify-center gap-3 mt-8 list-none p-0"
          aria-label="Core strengths"
        >
          {BENEFITS.map((label) => (
            <li
              key={label}
              className="px-4 py-1.5 rounded-full text-sm font-medium text-slate-300 border border-white/10 bg-white/5 backdrop-blur-sm"
            >
              {label}
            </li>
          ))}
        </motion.ul>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.85 }}
          className="mt-10 flex flex-col sm:flex-row items-center gap-4"
        >
          <button
            type="button"
            onClick={openContact}
            className="w-full sm:w-auto px-8 py-3.5 rounded-full font-semibold tracking-wide text-white transition-all duration-300 hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0e1a]"
            style={{
              background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
              boxShadow: CTA_SHADOW,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = CTA_SHADOW_HOVER;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = CTA_SHADOW;
            }}
          >
            Get in Touch
          </button>

          <a
            href="#about"
            aria-label="Learn more about VEXI"
            className="w-full sm:w-auto px-8 py-3.5 rounded-full font-semibold tracking-wide text-slate-300 border border-white/15 bg-white/5 backdrop-blur-sm transition-all duration-300 hover:text-white hover:bg-white/10 hover:border-white/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0e1a]"
          >
            Learn More
          </a>
        </motion.div>
      </div>

      {/* Scroll indicator — hidden when user prefers reduced motion */}
      {!prefersReducedMotion && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ duration: 0.8, delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-white"
          aria-hidden="true"
        >
          <span className="text-[10px] uppercase tracking-widest text-slate-400 font-medium">Scroll</span>
          <div className="animate-bounce-slow">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </motion.div>
      )}
    </section>
  );
}
