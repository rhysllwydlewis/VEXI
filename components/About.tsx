'use client';

import { motion } from 'framer-motion';

const cards = [
  {
    icon: '🚀',
    title: 'Innovation',
    description:
      'We identify opportunities in digital markets and build cutting-edge platforms that redefine user experiences and set new industry standards.',
    delay: 0,
  },
  {
    icon: '🔗',
    title: 'Portfolio',
    description:
      'A growing family of purpose-built platforms, each serving thousands of users with reliable, scalable technology solutions.',
    delay: 0.15,
  },
  {
    icon: '⚡',
    title: 'Technology',
    description:
      'Modern tech stacks, cloud-native infrastructure, and relentless optimisation. Every platform is built to scale from day one.',
    delay: 0.3,
  },
];

export default function About() {
  return (
    <section className="py-24 px-6 bg-gradient-to-b from-[#0f172a] to-[#0a0e1a]">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
          className="text-center"
        >
          <h2 className="text-4xl font-bold text-white">What We Do</h2>
          <p className="text-lg text-slate-400 mt-4 max-w-2xl mx-auto">
            Vexi is the technology group behind a growing portfolio of digital
            platforms, each designed to transform their industry.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
          {cards.map((card) => (
            <motion.div
              key={card.title}
              initial={{ y: 40, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.7, delay: card.delay }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-8 hover:bg-white/10 hover:border-white/20 transition-all duration-300 cursor-default"
              whileHover={{ y: -4 }}
            >
              <span className="text-4xl">{card.icon}</span>
              <h3 className="text-xl font-semibold text-white mt-4">
                {card.title}
              </h3>
              <p className="text-sm text-slate-400 mt-3 leading-relaxed">
                {card.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
