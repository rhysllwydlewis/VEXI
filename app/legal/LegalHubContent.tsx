'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ContactProvider, useContact } from '@/components/ContactWidget';
import LegalNav from '@/components/LegalNav';
import Footer from '@/components/Footer';

const cards = [
  {
    href: '/privacy',
    title: 'Privacy Policy',
    description: 'How we collect, use, and protect your personal information.',
    delay: 0.5,
  },
  {
    href: '/terms',
    title: 'Terms of Use',
    description: 'The terms and conditions that apply when you use this site.',
    delay: 0.65,
  },
];

function LegalHubInner() {
  const { openContact } = useContact();

  return (
    <>
      <LegalNav />

      <main className="min-h-screen bg-[#0a0e1a] pt-36 pb-24 px-6">
        <div className="max-w-2xl mx-auto">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-xs uppercase tracking-[0.3em] text-slate-500 mb-6"
          >
            Legal
          </motion.p>

          <motion.h1
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-4xl md:text-5xl font-black tracking-tight text-white mb-5"
          >
            Legal Hub
          </motion.h1>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.35 }}
            className="text-slate-400 leading-relaxed mb-14"
          >
            This page brings together the legal documents that govern your use of VEXI. We&apos;re
            committed to being transparent about how we operate and handle your information.
          </motion.p>

          <div className="flex flex-col gap-5 mb-14">
            {cards.map((card) => (
              <motion.div
                key={card.href}
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.7, delay: card.delay }}
                whileHover={{ y: -4, transition: { duration: 0.25 } }}
              >
                <Link
                  href={card.href}
                  className="group block p-7 rounded-xl border border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/[0.08] transition-colors duration-300"
                >
                  <p className="text-lg font-semibold text-white mb-2">
                    {card.title}
                    <span
                      className="ml-2 opacity-40 group-hover:opacity-100 transition-opacity duration-200"
                      aria-hidden="true"
                    >
                      →
                    </span>
                  </p>
                  <p className="text-sm text-slate-400">{card.description}</p>
                </Link>
              </motion.div>
            ))}
          </div>

          <motion.section
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.8 }}
            className="p-7 rounded-xl border border-white/10 bg-white/5 mb-10"
          >
            <h2 className="text-base font-semibold text-white mb-2">Cookies</h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              This site uses only essential cookies required for basic functionality. We do not use
              tracking or advertising cookies. No cookie consent banner is needed as we do not set
              non-essential cookies.
            </p>
          </motion.section>

          <motion.section
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.9 }}
          >
            <h2 className="text-base font-semibold text-white mb-2">Questions?</h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              If you have any questions about these documents or how we handle your data, please{' '}
              <button
                type="button"
                onClick={openContact}
                className="underline hover:text-white transition-colors duration-200 cursor-pointer"
              >
                get in touch
              </button>
              .
            </p>
          </motion.section>
        </div>
      </main>

      <Footer />
    </>
  );
}

export default function LegalHubContent() {
  return (
    <ContactProvider>
      <LegalHubInner />
    </ContactProvider>
  );
}
