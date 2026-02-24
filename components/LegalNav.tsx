'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useContact } from '@/components/ContactWidget';

export default function LegalNav() {
  const { openContact } = useContact();

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7 }}
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-10 py-4 bg-[rgba(10,14,26,0.95)] backdrop-blur-xl border-b border-white/5"
      aria-label="Site navigation"
    >
      <Link
        href="/"
        className="text-xl font-black tracking-tight text-white hover:opacity-75 transition"
      >
        VEXI
      </Link>

      <button
        type="button"
        onClick={openContact}
        className="text-sm text-slate-300 hover:text-white transition font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 rounded"
      >
        Contact Us
      </button>
    </motion.nav>
  );
}
