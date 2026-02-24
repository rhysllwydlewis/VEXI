'use client';

import { motion, useReducedMotion } from 'framer-motion';
import AnimatedBlobs from './AnimatedBlobs';
import StarfieldCanvas from './StarfieldCanvas';
import { useContact } from '@/components/ContactWidget';

const BENEFITS = ['Innovation', 'Scalability', 'Purpose-built'] as const;

export default function Hero() {
  const { openContact } = useContact();
  const prefersReducedMotion = useReducedMotion();

  return (
    <section
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-[#0a0e1a] to-[#0f172a]"
      aria-label="Hero"
    >
      <AnimatedBlobs />
      <StarfieldCanvas />

      <div className="relative z-10 flex flex-col items-center text-center px-6 py-24 max-w-4xl mx-auto w-full">
        <motion.h1
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-6xl sm:text-7xl md:text-9xl font-black tracking-[-0.05em] leading-none bg-gradient-to-br from-white via-slate-100 to-blue-200 bg-clip-text text-transparent"
          style={{ filter: 'drop-shadow(0 0 40px rgba(59,130,246,0.35))' }}
        >
          VEXI
        </motion.h1>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.45 }}
          className="text-xl md:text-2xl text-slate-300 font-light mt-6 max-w-2xl leading-relaxed"
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
              boxShadow:
                '0 0 0 1px rgba(99,102,241,0.4), 0 4px 24px rgba(59,130,246,0.25)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow =
                '0 0 0 1px rgba(99,102,241,0.6), 0 8px 32px rgba(59,130,246,0.45)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow =
                '0 0 0 1px rgba(99,102,241,0.4), 0 4px 24px rgba(59,130,246,0.25)';
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
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white"
          aria-hidden="true"
        >
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
