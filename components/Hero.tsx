'use client';

import { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import dynamic from 'next/dynamic';
import AnimatedBlobs from './AnimatedBlobs';
import MoonFallback from './MoonFallback';
import StarfieldCanvas from './StarfieldCanvas';
import { useContact } from '@/components/ContactWidget';

const MoonSphere = dynamic(() => import('./MoonSphere'), {
  ssr: false,
  loading: () => (
    <div className="relative h-full w-full bg-transparent" aria-hidden="true">
      <MoonFallback />
    </div>
  ),
});

const BENEFITS = ['Innovation', 'Scalability', 'Purpose-built'] as const;

const CTA_SHADOW = '0 0 0 1px rgba(99,102,241,0.4), 0 4px 24px rgba(59,130,246,0.25)';
const CTA_SHADOW_HOVER = '0 0 0 1px rgba(99,102,241,0.6), 0 8px 32px rgba(59,130,246,0.45)';

export default function Hero() {
  const { openContact } = useContact();
  const prefersReducedMotion = useReducedMotion();
  const heroRef = useRef<HTMLElement>(null);

  // Treat explicit true as reduced-motion; null (SSR/unknown) defaults to full motion.
  const rm = prefersReducedMotion === true;

  // Scroll-linked parallax for the moon — disabled when user prefers reduced motion.
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const moonY = useTransform(scrollYProgress, [0, 1], ['0%', rm ? '0%' : '-30%']);

  return (
    <section
      ref={heroRef}
      className="relative flex min-h-[100svh] items-center justify-center overflow-hidden bg-gradient-to-b from-[#0a0e1a] to-[#0f172a]"
      aria-label="Hero"
    >
      <AnimatedBlobs />
      <StarfieldCanvas />

      {/* Subtle aurora — faint coloured wisps at the very top of the hero,
          suggesting distant atmospheric light. Reduced-motion hides it. */}
      {!prefersReducedMotion && (
        <div
          className="absolute inset-x-0 top-0 z-[2] pointer-events-none"
          style={{
            height: '38%',
            background:
              'linear-gradient(to bottom, rgba(110,60,220,0.045) 0%, rgba(60,110,240,0.06) 25%, rgba(30,170,200,0.035) 55%, transparent 100%)',
            filter: 'blur(18px)',
          }}
          aria-hidden="true"
        />
      )}

      {/* Faint galactic-core glow — upper-left accent to add depth */}
      <div
        className="absolute z-[2] pointer-events-none"
        style={{
          top: '5%',
          left: '8%',
          width: '35%',
          height: '40%',
          background:
            'radial-gradient(ellipse at 35% 30%, rgba(130,55,200,0.055) 0%, rgba(80,40,160,0.03) 50%, transparent 80%)',
          filter: 'blur(32px)',
        }}
        aria-hidden="true"
      />

      {/* Moon backdrop — z-[5]: behind text (z-10) but above blobs/starfield.
          The outer wrapper is a plain non-animated div so the browser never
          creates a full-viewport GPU compositor layer here.  A full-screen
          animated layer (opacity/scale) was the source of an intermittent
          white rectangular flash: browsers initialise compositor backing
          textures as opaque white before the transparent content is painted. */}
      <div
        className="absolute inset-0 flex items-center justify-center z-[5] pointer-events-none"
        aria-hidden="true"
      >
        {/* Animation is scoped to the moon-sized element only (~420–780 px).
            Any compositor-layer initialisation artefact is therefore contained
            to the moon area — and hidden by the opacity:0 start value — rather
            than flashing across the full viewport.
            When the user prefers reduced motion, the scale animation is skipped
            and the fade duration is shortened; the parallax scroll is also
            disabled so no unnecessary motion occurs. */}
        <motion.div
          initial={{ opacity: 0, scale: rm ? 1 : 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: rm ? 0.4 : 2.0,
            delay: 0.1,
            // Custom ease-out spring curve for full-motion mode (fast start, soft landing).
            ease: rm ? 'easeOut' : [0.22, 1, 0.36, 1],
          }}
          style={{ y: moonY, background: 'transparent' }}
          className="h-[min(78vw,420px)] w-[min(78vw,420px)] sm:h-[500px] sm:w-[500px] md:h-[620px] md:w-[620px] lg:h-[720px] lg:w-[720px] 2xl:h-[780px] 2xl:w-[780px]"
        >
          <MoonSphere />
        </motion.div>
      </div>

      {/* Contrast veil — intentionally soft so it protects the heading without
          turning into a black disk if WebGL is slow, unavailable, or still fading in. */}
      <div
        className="absolute inset-0 z-[5] pointer-events-none"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(ellipse 48% 38% at 50% 48%, rgba(6,10,22,0.18) 0%, rgba(8,12,24,0.14) 38%, rgba(10,14,26,0.05) 66%, transparent 84%)',
        }}
      />

      {/* Horizon vignette — darkens the lower portion of the hero to sell the
          moonrise effect: the moon appears to emerge from below the skyline */}
      <div
        className="absolute inset-x-0 bottom-0 z-[6] pointer-events-none"
        style={{
          height: '42%',
          background:
            'linear-gradient(to top, rgba(10,14,26,0.96) 0%, rgba(10,14,26,0.58) 34%, rgba(10,14,26,0.16) 66%, transparent 100%)',
        }}
        aria-hidden="true"
      />
      {/* Horizon glow — faint atmospheric luminance at the moonrise line */}
      <div
        className="absolute inset-x-0 z-[6] pointer-events-none"
        style={{
          bottom: '40%',
          height: '60px',
          background:
            'radial-gradient(ellipse 65% 100% at 50% 100%, rgba(160,190,255,0.06) 0%, transparent 100%)',
          filter: 'blur(14px)',
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto flex w-full max-w-4xl flex-col items-center px-5 py-24 text-center sm:px-6 short:py-20">
        <motion.h1
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-[clamp(4.25rem,18vw,8.5rem)] font-black leading-none tracking-[-0.055em] text-white md:text-9xl"
          style={{ filter: 'drop-shadow(0 0 60px rgba(10,14,26,0.9)) drop-shadow(0 0 40px rgba(59,130,246,0.35))' }}
        >
          VEXI
        </motion.h1>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.45 }}
          className="mt-5 max-w-2xl text-lg font-light leading-relaxed text-slate-200 sm:text-xl md:text-2xl"
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
          className="mt-7 flex list-none flex-wrap justify-center gap-2.5 p-0 sm:gap-3"
          aria-label="Core strengths"
        >
          {BENEFITS.map((label) => (
            <li
              key={label}
              className="rounded-full border border-white/10 bg-slate-950/35 px-3.5 py-1.5 text-sm font-medium text-slate-200 shadow-[0_0_24px_rgba(15,23,42,0.35)] backdrop-blur-sm"
            >
              {label}
            </li>
          ))}
        </motion.ul>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.85 }}
          className="mt-9 flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row sm:gap-4"
        >
          <button
            type="button"
            onClick={openContact}
            className="w-full rounded-full px-8 py-3.5 font-semibold tracking-wide text-white transition-all duration-300 hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0e1a] motion-reduce:hover:translate-y-0 sm:w-auto"
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
            className="w-full rounded-full border border-white/15 bg-slate-950/30 px-8 py-3.5 font-semibold tracking-wide text-slate-200 backdrop-blur-sm transition-all duration-300 hover:border-white/25 hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0e1a] sm:w-auto"
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
          className="absolute bottom-6 left-1/2 z-[8] hidden -translate-x-1/2 flex-col items-center gap-1 text-white sm:flex short:hidden"
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
