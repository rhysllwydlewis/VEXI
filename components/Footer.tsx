'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useContact } from '@/components/ContactWidget';

export default function Footer() {
  const { openContact } = useContact();

  return (
    <motion.footer
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className="bg-[#060a12] border-t border-white/5 py-12 px-6"
    >
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-sm text-slate-500">
          © 2026 VEXI. All rights reserved.
        </p>
        <div className="flex items-center gap-6 text-sm">
          <Link
            href="/legal"
            className="text-slate-500 hover:text-slate-300 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 rounded"
          >
            Legal Hub
          </Link>
          <button
            type="button"
            onClick={openContact}
            className="text-slate-500 hover:text-blue-400 transition cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/50 rounded"
          >
            Contact Us
          </button>
        </div>
      </div>
    </motion.footer>
  );
}
