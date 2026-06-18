'use client';

import { motion, useReducedMotion } from 'framer-motion';
import AnimatedBlobs from './AnimatedBlobs';
import StarfieldCanvas from './StarfieldCanvas';
import { useContact } from '@/components/ContactWidget';

const BENEFITS = ['Innovation', 'Scalability', 'Purpose-built'] as const;

const PROOF_POINTS = [
  'Product-led platforms',
  'Built for scale',
  'Lean digital operations',
] as const;

export default function Hero() {
  const { openContact } = useContact();
  const prefersReducedMotion = useReducedMotion();
  const reduceMotion = prefersReducedMotion === true;
  const revealInitial = reduceMotion ? false : { y: 24, opacity: 0 };
  const revealAnimate = { y: 0, opacity: 1 };

  return (
    <section
      className="relative flex min-h-[100svh] items-center justify-center overflow-hidden bg-gradient-to-b from-[#0a0e1a] via-[#0c1222] to-[#0f172a] px-5"
      aria-labelledby="hero-title"
    >
      <AnimatedBlobs />
      <StarfieldCanvas />

      {/* Subtle aurora — faint coloured wisps at the top of the space field. */}
      {!reduceMotion && (
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

      {/* Faint galactic-core glow — upper-left accent to add depth. */}
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

      {/* Extra central depth now the moon object has been removed. */}
      <div
        className="absolute inset-0 z-[2] pointer-events-none"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(ellipse 50% 42% at 50% 43%, rgba(59,130,246,0.075) 0%, rgba(30,41,59,0.08) 34%, transparent 76%)',
        }}
      />

      {/* Gentle centre readability veil for the hero copy only. */}
      <div
        className="absolute inset-0 z-[3] pointer-events-none"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(ellipse 48% 42% at 50% 48%, rgba(8,12,24,0.20) 0%, rgba(8,12,24,0.08) 42%, transparent 74%)',
        }}
      />

      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center py-24 text-center sm:px-6 short:py-20">
        <motion.p
          initial={revealInitial}
          animate={revealAnimate}
          transition={{ duration: reduceMotion ? 0 : 0.7, delay: reduceMotion ? 0 : 0.08 }}
          className="mb-5 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.28em] text-blue-200/90 shadow-[0_0_24px_rgba(59,130,246,0.14)] backdrop-blur-md"
        >
          VEXI Technology Group
        </motion.p>

        <motion.h1
          id="hero-title"
          initial={revealInitial}
          animate={revealAnimate}
          transition={{ duration: reduceMotion ? 0 : 0.8, delay: reduceMotion ? 0 : 0.2 }}
          className="text-[clamp(4.25rem,18vw,9rem)] font-black leading-none tracking-[-0.06em] text-white md:text-9xl"
          style={{ filter: 'drop-shadow(0 0 60px rgba(10,14,26,0.9)) drop-shadow(0 0 40px rgba(59,130,246,0.35))' }}
        >
          VEXI
        </motion.h1>

        <motion.p
          initial={revealInitial}
          animate={revealAnimate}
          transition={{ duration: reduceMotion ? 0 : 0.8, delay: reduceMotion ? 0 : 0.38 }}
          className="mt-5 max-w-2xl text-balance text-lg font-light leading-relaxed text-slate-200 sm:text-xl md:text-2xl"
          style={{ textShadow: '0 0 30px rgba(10,14,26,0.8), 0 2px 10px rgba(10,14,26,0.6)' }}
        >
          The technology group behind purpose-built digital platforms
          <br className="hidden sm:block" /> that scale from day one.
        </motion.p>

        <motion.ul
          initial={revealInitial}
          animate={revealAnimate}
          transition={{ duration: reduceMotion ? 0 : 0.8, delay: reduceMotion ? 0 : 0.55 }}
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
          initial={revealInitial}
          animate={revealAnimate}
          transition={{ duration: reduceMotion ? 0 : 0.8, delay: reduceMotion ? 0 : 0.72 }}
          className="mt-9 flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row sm:gap-4"
        >
          <button
            type="button"
            onClick={openContact}
            className="w-full rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 px-8 py-3.5 font-semibold tracking-wide text-white shadow-[0_0_0_1px_rgba(99,102,241,0.4),0_4px_24px_rgba(59,130,246,0.25)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_0_1px_rgba(99,102,241,0.6),0_8px_32px_rgba(59,130,246,0.45)] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0e1a] motion-reduce:hover:translate-y-0 sm:w-auto"
          >
            Get in Touch
          </button>

          <a
            href="#portfolio"
            aria-label="Explore the VEXI portfolio"
            className="w-full rounded-full border border-white/15 bg-slate-950/30 px-8 py-3.5 font-semibold tracking-wide text-slate-200 backdrop-blur-sm transition-all duration-300 hover:border-white/25 hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0e1a] sm:w-auto"
          >
            Explore Portfolio
          </a>
        </motion.div>

        <motion.ul
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: reduceMotion ? 0 : 0.8, delay: reduceMotion ? 0 : 0.95 }}
          role="list"
          className="mt-10 grid w-full max-w-3xl grid-cols-1 gap-2 text-sm text-slate-400 sm:grid-cols-3"
          aria-label="VEXI platform approach"
        >
          {PROOF_POINTS.map((point) => (
            <li
              key={point}
              className="rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-sm"
            >
              {point}
            </li>
          ))}
        </motion.ul>
      </div>

      {!reduceMotion && (
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
              className="h-6 w-6"
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
