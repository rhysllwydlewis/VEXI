'use client';

import { motion } from 'framer-motion';
import AnimatedBlobs from './AnimatedBlobs';
import Starfield from './Starfield';
import ShootingStars from './ShootingStars';
import { useContact } from '@/components/ContactWidget';

export default function Hero() {
  const { openContact } = useContact();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-[#0a0e1a] to-[#0f172a]">
      <AnimatedBlobs />
      <Starfield />
      <ShootingStars />

      <div className="relative z-10 flex flex-col items-center text-center px-6">
        <motion.h1
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-5xl sm:text-6xl md:text-8xl font-black tracking-[-0.05em] text-white"
          style={{ textShadow: '0 0 80px rgba(59,130,246,0.3)' }}
        >
          VEXI
        </motion.h1>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-lg md:text-xl text-slate-400 font-light mt-6 max-w-xl"
        >
          Building the future of digital experiences
        </motion.p>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="text-base text-slate-500 mt-2"
        >
          vexi.co.uk
        </motion.p>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          className="mt-10"
        >
          <button
            type="button"
            onClick={openContact}
            className="relative px-8 py-3 rounded-full font-medium tracking-wide text-white transition-all duration-300 hover:scale-105 group"
            style={{
              background:
                'linear-gradient(#0a0e1a, #0a0e1a) padding-box, linear-gradient(135deg, #3b82f6, #6366f1) border-box',
              border: '1px solid transparent',
            }}
            onMouseEnter={(e) => {
              const target = e.currentTarget;
              target.style.background =
                'linear-gradient(135deg, #3b82f6, #6366f1)';
              target.style.boxShadow = '0 0 30px rgba(59,130,246,0.4)';
            }}
            onMouseLeave={(e) => {
              const target = e.currentTarget;
              target.style.background =
                'linear-gradient(#0a0e1a, #0a0e1a) padding-box, linear-gradient(135deg, #3b82f6, #6366f1) border-box';
              target.style.boxShadow = 'none';
            }}
          >
            Contact Us
          </button>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        transition={{ duration: 0.8, delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white"
      >
        <div style={{ animation: 'bounce 2s infinite' }}>
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
    </section>
  );
}
