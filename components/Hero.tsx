'use client';

import { motion, useReducedMotion } from 'framer-motion';
import AnimatedBlobs from './AnimatedBlobs';
import HeroOrbitSystem from './HeroOrbitSystem';
import StarfieldCanvas from './StarfieldCanvas';
import { useContact } from '@/components/ContactWidget';

const BENEFITS = ['Owned platforms', 'Product engineering', 'Long-term operations'] as const;

const PROOF_POINTS = [
  {
    index: '01',
    title: 'Identify',
    detail: 'Clear opportunities are tested before becoming VEXI products.',
  },
  {
    index: '02',
    title: 'Build',
    detail: 'Platforms are shaped around real users, operations and scale.',
  },
  {
    index: '03',
    title: 'Operate',
    detail: 'Each product is managed, improved and grown after launch.',
  },
] as const;

function ScrollCueIcon({ animate }: { animate: boolean }) {
  return (
    <span className="relative flex h-6 w-6 items-center justify-center rounded-full border border-blue-200/20 bg-blue-400/10">
      <span
        className={`absolute h-6 w-6 rounded-full bg-blue-300/10 ${animate ? 'animate-ping' : ''}`}
        aria-hidden="true"
      />
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className={`relative h-4 w-4 text-blue-100 ${animate ? 'animate-bounce-slow' : ''}`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M19 9l-7 7-7-7"
        />
      </svg>
    </span>
  );
}

export default function Hero() {
  const { openContact } = useContact();
  const prefersReducedMotion = useReducedMotion();
  const reduceMotion = prefersReducedMotion === true;
  const revealInitial = reduceMotion ? false : { y: 24, opacity: 0 };
  const revealAnimate = { y: 0, opacity: 1 };

  return (
    <section
      className="relative flex min-h-[100svh] items-center justify-center overflow-hidden bg-gradient-to-b from-[#050816] via-[#07101f] to-[#0f172a] px-5"
      aria-labelledby="hero-title"
    >
      <AnimatedBlobs />
      <StarfieldCanvas />

      {!reduceMotion && (
        <div
          className="absolute inset-x-0 top-0 z-[2] pointer-events-none"
          style={{
            height: '42%',
            background:
              'linear-gradient(to bottom, rgba(110,60,220,0.055) 0%, rgba(60,110,240,0.07) 25%, rgba(30,170,200,0.04) 55%, transparent 100%)',
            filter: 'blur(18px)',
          }}
          aria-hidden="true"
        />
      )}

      <div
        className="absolute z-[2] pointer-events-none"
        style={{
          top: '4%',
          left: '7%',
          width: '42%',
          height: '46%',
          background:
            'radial-gradient(ellipse at 35% 30%, rgba(130,55,200,0.075) 0%, rgba(80,40,160,0.04) 50%, transparent 80%)',
          filter: 'blur(36px)',
        }}
        aria-hidden="true"
      />

      <div
        className="absolute inset-0 z-[2] pointer-events-none"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(ellipse 54% 46% at 50% 44%, rgba(96,165,250,0.11) 0%, rgba(30,64,175,0.08) 28%, rgba(15,23,42,0.08) 48%, transparent 78%)',
        }}
      />

      <div
        className="absolute inset-0 z-[3] pointer-events-none"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(ellipse 48% 42% at 50% 48%, rgba(5,8,22,0.24) 0%, rgba(8,12,24,0.10) 42%, transparent 74%)',
        }}
      />

      <HeroOrbitSystem reduceMotion={reduceMotion} />

      <div
        className="absolute inset-x-0 bottom-0 z-[6] h-[30%] pointer-events-none bg-gradient-to-t from-[#0f172a] via-[#0b1020]/75 to-transparent"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-0 left-1/2 z-[6] h-px w-[78%] -translate-x-1/2 bg-gradient-to-r from-transparent via-blue-200/16 to-transparent"
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center pb-8 pt-16 text-center sm:px-6 sm:py-24 short:py-20">
        <motion.p
          initial={revealInitial}
          animate={revealAnimate}
          transition={{ duration: reduceMotion ? 0 : 0.7, delay: reduceMotion ? 0 : 0.08 }}
          className="mb-5 rounded-full border border-white/10 bg-white/[0.055] px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.28em] text-blue-100/95 shadow-[0_0_28px_rgba(59,130,246,0.18)] backdrop-blur-md"
        >
          VEXI Technology Group
        </motion.p>

        <motion.h1
          id="hero-title"
          initial={revealInitial}
          animate={revealAnimate}
          transition={{ duration: reduceMotion ? 0 : 0.8, delay: reduceMotion ? 0 : 0.2 }}
          className="text-[clamp(3.85rem,18vw,9rem)] font-black leading-none tracking-[-0.06em] text-white md:text-9xl"
          style={{ filter: 'drop-shadow(0 0 70px rgba(5,8,22,0.95)) drop-shadow(0 0 48px rgba(59,130,246,0.42))' }}
        >
          VEXI
        </motion.h1>

        <motion.p
          initial={revealInitial}
          animate={revealAnimate}
          transition={{ duration: reduceMotion ? 0 : 0.8, delay: reduceMotion ? 0 : 0.38 }}
          className="mt-5 max-w-2xl text-balance text-lg font-light leading-relaxed text-slate-100 sm:text-xl md:text-2xl"
          style={{ textShadow: '0 0 32px rgba(5,8,22,0.92), 0 2px 12px rgba(5,8,22,0.75)' }}
        >
          VEXI is the home of focused digital products
          <br className="hidden sm:block" /> built around clear market opportunities and operated for long-term growth.
        </motion.p>

        <motion.ul
          initial={revealInitial}
          animate={revealAnimate}
          transition={{ duration: reduceMotion ? 0 : 0.8, delay: reduceMotion ? 0 : 0.55 }}
          role="list"
          className="mt-6 flex list-none flex-wrap justify-center gap-2.5 p-0 sm:gap-3"
          aria-label="Core strengths"
        >
          {BENEFITS.map((label) => (
            <li
              key={label}
              className="rounded-full border border-blue-200/10 bg-slate-950/40 px-3.5 py-1.5 text-sm font-medium text-slate-100 shadow-[0_0_28px_rgba(15,23,42,0.42)] backdrop-blur-md"
            >
              {label}
            </li>
          ))}
        </motion.ul>

        <motion.div
          initial={revealInitial}
          animate={revealAnimate}
          transition={{ duration: reduceMotion ? 0 : 0.8, delay: reduceMotion ? 0 : 0.72 }}
          className="mt-8 grid w-full grid-cols-2 items-center gap-3 sm:flex sm:w-auto sm:flex-row sm:gap-4"
        >
          <button
            type="button"
            onClick={openContact}
            aria-label="Contact Us"
            className="w-full rounded-full bg-gradient-to-br from-blue-400 via-blue-500 to-indigo-500 px-3.5 py-3 text-sm font-semibold tracking-wide text-white shadow-[0_0_0_1px_rgba(147,197,253,0.34),0_4px_26px_rgba(59,130,246,0.30)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_0_1px_rgba(147,197,253,0.54),0_10px_36px_rgba(59,130,246,0.52)] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050816] motion-reduce:hover:translate-y-0 sm:w-auto sm:px-8 sm:py-3.5 sm:text-base"
          >
            <span className="sm:hidden">Contact</span>
            <span className="hidden sm:inline">Contact Us</span>
          </button>

          <a
            href="#portfolio"
            aria-label="View the VEXI portfolio"
            className="w-full rounded-full border border-white/15 bg-slate-950/35 px-3.5 py-3 text-center text-sm font-semibold tracking-wide text-slate-100 backdrop-blur-md transition-all duration-300 hover:border-blue-200/30 hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050816] sm:w-auto sm:px-8 sm:py-3.5 sm:text-base"
          >
            <span className="sm:hidden">Portfolio</span>
            <span className="hidden sm:inline">View Portfolio</span>
          </a>
        </motion.div>

        <motion.ul
          initial={reduceMotion ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.8, delay: reduceMotion ? 0 : 0.95 }}
          role="list"
          className="mt-8 grid w-full max-w-3xl grid-cols-1 gap-2.5 text-left text-sm text-slate-300 sm:grid-cols-3"
          aria-label="VEXI platform approach"
        >
          {PROOF_POINTS.map((point) => (
            <li
              key={point.title}
              className="rounded-2xl border border-white/10 bg-white/[0.04] p-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_0_24px_rgba(15,23,42,0.18)] backdrop-blur-xl"
            >
              <span className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-blue-200/80">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-300 shadow-[0_0_10px_rgba(103,232,249,0.75)]" />
                {point.index}
              </span>
              <strong className="mt-2 block text-sm font-semibold text-white">{point.title}</strong>
              <span className="mt-1 block text-[11px] leading-relaxed text-slate-400">{point.detail}</span>
            </li>
          ))}
        </motion.ul>

        <motion.a
          href="#about"
          aria-label="Explore the About section"
          initial={reduceMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: reduceMotion ? 1 : 0.84, y: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.8, delay: reduceMotion ? 0 : 1.2 }}
          className="mt-5 inline-flex w-max items-center gap-2 rounded-full border border-white/10 bg-slate-950/45 px-3.5 py-2 text-white shadow-[0_0_20px_rgba(15,23,42,0.30)] backdrop-blur-xl transition hover:border-blue-200/20 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050816] sm:hidden"
        >
          <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-300">Explore</span>
          <ScrollCueIcon animate={!reduceMotion} />
        </motion.a>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-5 z-[12] hidden justify-center sm:flex">
        <motion.a
          href="#about"
          aria-label="Begin exploration: scroll to About section"
          initial={reduceMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: reduceMotion ? 1 : 0.78, y: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.8, delay: reduceMotion ? 0 : 1.5 }}
          className="pointer-events-auto inline-flex w-max items-center gap-3 rounded-full border border-white/10 bg-slate-950/45 px-4 py-2 text-white shadow-[0_0_24px_rgba(15,23,42,0.34)] backdrop-blur-xl transition hover:border-blue-200/20 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050816]"
        >
          <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-300">Begin exploration</span>
          <ScrollCueIcon animate={!reduceMotion} />
        </motion.a>
      </div>
    </section>
  );
}
