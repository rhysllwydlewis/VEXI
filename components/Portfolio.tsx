'use client';

import { motion, useReducedMotion } from 'framer-motion';

const portfolioItems = [
  {
    name: 'Event Flow',
    domain: 'event-flow.co.uk',
    href: 'https://event-flow.co.uk',
    status: 'Live',
    summary:
      'A purpose-built events platform focused on clearer event discovery, supplier visibility and smoother event planning journeys.',
    tags: ['Events', 'Marketplace', 'Operations'],
  },
  {
    name: 'Chlo',
    domain: 'chlo.co.uk',
    href: 'https://chlo.co.uk',
    status: 'Live',
    summary:
      'A modern fashion and lifestyle platform shaped around a curated shopping experience, clean presentation and convenience.',
    tags: ['Lifestyle', 'Commerce', 'Brand'],
  },
] as const;

export default function Portfolio() {
  const reduceMotion = useReducedMotion() === true;
  const revealInitial = reduceMotion ? false : { y: 30, opacity: 0 };

  return (
    <section
      id="portfolio"
      aria-labelledby="portfolio-title"
      className="scroll-mt-20 bg-gradient-to-b from-[#0a0e1a] to-[#060a12] px-6 py-24"
    >
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={revealInitial}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: reduceMotion ? 0 : 0.7 }}
          className="text-center"
        >
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-blue-300/80">Portfolio</p>
          <h2 id="portfolio-title" className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Digital platforms with room to grow.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-slate-400">
            VEXI brings together focused products, practical design and scalable foundations across a growing portfolio.
          </p>
        </motion.div>

        <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2" role="list">
          {portfolioItems.map((item, index) => (
            <motion.article
              key={item.name}
              role="listitem"
              initial={revealInitial}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: reduceMotion ? 0 : 0.7, delay: reduceMotion ? 0 : index * 0.12 }}
              whileHover={reduceMotion ? undefined : { y: -3 }}
              className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.045] p-8 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-xl transition-all duration-300 hover:border-white/20 hover:bg-white/[0.075] sm:p-10"
            >
              <div
                className="pointer-events-none absolute -right-20 -top-24 h-56 w-56 rounded-full bg-blue-500/10 blur-3xl transition-opacity duration-300 group-hover:opacity-90"
                aria-hidden="true"
              />

              <div className="relative flex items-start justify-between gap-4">
                <div>
                  <span className="inline-flex rounded-full border border-green-500/30 bg-green-500/15 px-3 py-1 text-xs font-medium text-green-300">
                    {item.status}
                  </span>
                  <h3 className="mt-5 text-2xl font-bold text-white">{item.name}</h3>
                  <p className="mt-1 text-sm text-blue-300">{item.domain}</p>
                </div>
                <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-slate-400">
                  VEXI
                </span>
              </div>

              <p className="relative mt-5 text-base leading-relaxed text-slate-400">{item.summary}</p>

              <ul className="relative mt-6 flex flex-wrap gap-2" aria-label={`${item.name} focus areas`}>
                {item.tags.map((tag) => (
                  <li
                    key={tag}
                    className="rounded-full border border-white/10 bg-slate-950/30 px-3 py-1 text-xs text-slate-300"
                  >
                    {tag}
                  </li>
                ))}
              </ul>

              <a
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Visit ${item.name} website, opens in a new tab`}
                className="relative mt-7 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/10 px-4 py-2 text-sm font-semibold text-blue-200 transition hover:border-blue-300/35 hover:bg-blue-400/15 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#060a12]"
              >
                Visit Site
                <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-0.5">→</span>
              </a>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
