'use client';

import { motion, useReducedMotion } from 'framer-motion';

const cards = [
  {
    icon: (
      <svg
        className="h-6 w-6 text-blue-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
        />
      </svg>
    ),
    title: 'Find the opportunity',
    description:
      'We look for real market friction, then shape digital products around practical user needs rather than vanity features.',
  },
  {
    icon: (
      <svg
        className="h-6 w-6 text-indigo-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"
        />
      </svg>
    ),
    title: 'Build focused platforms',
    description:
      'Each platform is designed to do a specific job well, with clear journeys, reliable foundations and commercial discipline.',
  },
  {
    icon: (
      <svg
        className="h-6 w-6 text-cyan-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5"
        />
      </svg>
    ),
    title: 'Harden for scale',
    description:
      'We keep improving performance, accessibility, security and user experience so products can grow without unnecessary drag.',
  },
] as const;

export default function About() {
  const reduceMotion = useReducedMotion() === true;
  const sectionInitial = reduceMotion ? false : { y: 30, opacity: 0 };
  const cardInitial = reduceMotion ? false : { y: 32, opacity: 0 };

  return (
    <section
      id="about"
      aria-labelledby="about-title"
      className="scroll-mt-20 bg-gradient-to-b from-[#0f172a] to-[#0a0e1a] px-6 py-24"
    >
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={sectionInitial}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: reduceMotion ? 0 : 0.7 }}
          className="text-center"
        >
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-blue-300/80">What we do</p>
          <h2 id="about-title" className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Product thinking, platform delivery.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-slate-400">
            VEXI builds and improves digital platforms with a focus on clear customer journeys,
            dependable foundations and long-term scalability.
          </p>
        </motion.div>

        <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-3" role="list">
          {cards.map((card, index) => (
            <motion.article
              key={card.title}
              role="listitem"
              initial={cardInitial}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: reduceMotion ? 0 : 0.7, delay: reduceMotion ? 0 : index * 0.12 }}
              className="group rounded-2xl border border-white/10 bg-white/[0.045] p-8 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-xl transition-all duration-300 hover:border-white/20 hover:bg-white/[0.075]"
              whileHover={reduceMotion ? undefined : { y: -4 }}
            >
              <div className="mb-1 flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-gradient-to-br from-blue-500/20 to-indigo-500/10 transition-transform duration-300 group-hover:scale-105">
                {card.icon}
              </div>
              <h3 className="mt-4 text-xl font-semibold text-white">{card.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-400">{card.description}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
