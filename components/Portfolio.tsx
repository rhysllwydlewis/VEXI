'use client';

import { motion } from 'framer-motion';

export default function Portfolio() {
  return (
    <section id="portfolio" className="py-24 px-6 bg-gradient-to-b from-[#0a0e1a] to-[#060a12]">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center"
        >
          <h2 className="text-4xl font-bold text-white">Our Portfolio</h2>
          <p className="text-lg text-slate-400 mt-4">
            Platforms that are transforming industries
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-16">
          {/* Event Flow Card */}
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0 }}
            whileHover={{ y: -2 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-10 hover:border-white/20 transition-all duration-300"
            style={{ boxShadow: '0 0 0px rgba(59,130,246,0)' }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLDivElement).style.boxShadow =
                '0 0 40px rgba(59,130,246,0.12)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLDivElement).style.boxShadow =
                '0 0 0px rgba(59,130,246,0)';
            }}
          >
            <span className="inline-block px-3 py-1 rounded-full text-xs bg-green-500/20 text-green-400 border border-green-500/30">
              Live
            </span>
            <h3 className="text-2xl font-bold text-white mt-4">Event Flow</h3>
            <p className="text-sm text-blue-400 mt-1">event-flow.co.uk</p>
            <p className="text-base text-slate-400 mt-4 leading-relaxed">
              A comprehensive event management platform helping organisers
              create, manage, and promote unforgettable events. From ticketing
              to attendee management, Event Flow streamlines every aspect of
              event planning.
            </p>
            <a
              href="https://event-flow.co.uk"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Visit Event Flow website (opens in new tab)"
              className="inline-block mt-6 text-blue-400 hover:text-blue-300 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 rounded"
            >
              Visit Site →
            </a>
          </motion.div>

          {/* Coming Soon Card */}
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.15 }}
            whileHover={{ y: -2 }}
            className="relative overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-10 hover:border-white/20 transition-all duration-300"
          >
            {/* Shimmer overlay */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ overflow: 'hidden' }}
            >
              <div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
                style={{
                  animation: 'shimmer 2.5s infinite',
                  transform: 'translateX(-100%)',
                }}
              />
            </div>

            <span className="inline-block px-3 py-1 rounded-full text-xs bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              Coming Soon
            </span>
            <h3 className="text-2xl font-bold text-white mt-4">
              New Platform
            </h3>
            <p className="text-base text-slate-400 mt-4 leading-relaxed">
              {`We're working on something exciting. Our next platform is in
              development and will be launching soon. Stay tuned.`}
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
