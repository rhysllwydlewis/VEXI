'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { useContact } from '@/components/ContactWidget';

export default function Footer() {
  const { openContact } = useContact();
  const reduceMotion = useReducedMotion() === true;

  return (
    <motion.footer
      initial={reduceMotion ? false : { opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: reduceMotion ? 0 : 0.8 }}
      className="border-t border-white/5 bg-[#060a12] px-6 py-12"
    >
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 md:flex-row">
        <p className="text-sm text-slate-500">
          © 2026 VEXI. All rights reserved.
        </p>
        <nav aria-label="Footer navigation" className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm md:justify-start">
          <Link
            href="/privacy"
            className="rounded text-slate-500 transition hover:text-slate-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#060a12]"
          >
            Privacy Policy
          </Link>
          <span className="text-slate-700" aria-hidden="true">·</span>
          <Link
            href="/terms"
            className="rounded text-slate-500 transition hover:text-slate-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#060a12]"
          >
            Terms of Use
          </Link>
          <span className="text-slate-700" aria-hidden="true">·</span>
          <Link
            href="/legal"
            className="rounded text-slate-500 transition hover:text-slate-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#060a12]"
          >
            Legal Hub
          </Link>
          <span className="text-slate-700" aria-hidden="true">·</span>
          <button
            type="button"
            onClick={openContact}
            className="cursor-pointer rounded text-slate-500 transition hover:text-blue-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#060a12]"
          >
            Contact Us
          </button>
        </nav>
      </div>
    </motion.footer>
  );
}
